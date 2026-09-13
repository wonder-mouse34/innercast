"""Assemble qwen_server/graph.json (nodes + edges) for the InnerCast app.

Inputs (all in graph/):
    shows.json          show nodes
    vocabularies.json   emotion / conflict / situation / warning nodes
    arcs/*.json         characters + arcs from the extraction agents
    patterns.json       (optional) canonical patterns, hierarchy and arc -> pattern assignment
    resonances*.json    (optional) cross-show arc pairs with a "bridge" explanation

Usage: python3 build_graph.py
"""
import glob
import json
import os
import re
import sys
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(HERE, "graph")

# arc fields that become edges instead of node properties
EDGE_FIELDS = {"situations", "conflicts", "emotions", "warnings"}
# relations that are usually known from the first episode; all others can reveal plot (romances, betrayals…)
SAFE_RELATIONS = {"parent", "child", "sibling"}
# arc-level warnings that give away what happens; shown only aggregated at show level by default
SPOILER_WARNINGS = {"death_of_main_character", "death_of_loved_one", "betrayal", "bleak_ending"}


def normalise_start(show, s):
    """Buffy files mix 'S3E3' and 'BtVS S3E3' -> always prefix the series."""
    if show == "buffy" and re.match(r"S\d", s):
        return "BtVS " + s
    return s


def label(slug):
    return slug.replace("_", " ")


def slug(s):
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


def main():
    nodes, edges, problems = {}, [], []

    def add_node(n):
        if n["id"] in nodes:
            problems.append(f"duplicate node id {n['id']}")
        nodes[n["id"]] = n

    def add_edge(source, target, type_, **props):
        e = {"source": source, "target": target, "type": type_}
        if props:
            e["props"] = props
        edges.append(e)

    for s in json.load(open(os.path.join(G, "shows.json"))):
        add_node({"type": "show", **s})

    voc = json.load(open(os.path.join(G, "vocabularies.json")))
    for kind in ("emotion", "conflict", "situation", "warning"):
        for v in voc[kind]:
            add_node({"id": f"{kind}:{v}", "type": kind, "label": label(v)})

    arcs, show_warnings = {}, {}
    for path in sorted(glob.glob(os.path.join(G, "arcs", "*.json"))):
        d = json.load(open(path))
        show_id = f"show:{d['show']}"
        for c in d["characters"]:
            add_node({"id": c["id"], "type": "character", "name": c["name"], "show": show_id, "role": c["role"]})
            add_edge(c["id"], show_id, "IN_SHOW")
            seen_rel = set()
            for r in c.get("relations", []):
                key = (r["target"], r["relation"])
                if key in seen_rel:
                    continue
                seen_rel.add(key)
                add_edge(c["id"], r["target"], "RELATES_TO", relation=r["relation"],
                         spoiler=r["relation"] not in SAFE_RELATIONS)
            for a in c["arcs"]:
                node = {"id": a["id"], "type": "arc", "character": c["id"], "show": show_id}
                node.update({k: v for k, v in a.items() if k not in EDGE_FIELDS and k != "id"})
                node["start_at"] = normalise_start(d["show"], node["start_at"])
                add_node(node)
                for v in a["warnings"]:
                    show_warnings.setdefault(show_id, {}).setdefault(v, 0)
                    show_warnings[show_id][v] += 1
                arcs[a["id"]] = a
                add_edge(c["id"], a["id"], "HAS_ARC")
                for s in a["situations"]:
                    add_edge(a["id"], f"situation:{s['id']}", "ABOUT", weight=s.get("weight", 1.0))
                for v in a["conflicts"]:
                    add_edge(a["id"], f"conflict:{v}", "FACES")
                for phase in ("start", "middle", "end"):
                    for v in a["emotions"].get(phase, []):
                        add_edge(a["id"], f"emotion:{v}", "FEELS", phase=phase)
                for v in a["warnings"]:
                    add_edge(a["id"], f"warning:{v}", "HAS_WARNING", spoiler=v in SPOILER_WARNINGS)

    # spoiler-safe warnings: aggregated per show
    for show_id, ws in show_warnings.items():
        for v, n in sorted(ws.items()):
            add_edge(show_id, f"warning:{v}", "HAS_WARNING", arcs=n)

    # patterns: canonical set if available, otherwise one pattern node per arc label
    pat_path = os.path.join(G, "patterns.json")
    if os.path.exists(pat_path):
        pat = json.load(open(pat_path))
        for p in pat["patterns"]:
            add_node({"id": p["id"], "type": "pattern", "label": p["label"], "description": p.get("description", "")})
            for b in p.get("broader", []):
                add_edge(p["id"], b, "BROADER")
        for arc_id, pids in pat["assign"].items():
            for pid in pids:
                add_edge(arc_id, pid, "INSTANCE_OF")
        unassigned = set(arcs) - set(pat["assign"])
        if unassigned:
            problems.append(f"{len(unassigned)} arcs have no pattern: {sorted(unassigned)[:5]}...")
    else:
        print("note: graph/patterns.json not found, using one raw pattern per arc")
        for arc_id, a in arcs.items():
            pid = f"pattern:{slug(a['pattern_label'])}"
            if pid not in nodes:
                add_node({"id": pid, "type": "pattern", "label": a["pattern_label"], "description": ""})
            add_edge(arc_id, pid, "INSTANCE_OF")

    # resonances.json (round-1 shows) + resonances_extra*.json (arcs of shows added later), full arc ids
    for res_path in sorted(glob.glob(os.path.join(G, "resonances*.json"))):
        for r in json.load(open(res_path)):
            add_edge(r["source"], r["target"], "RESONATES_WITH", bridge=r["bridge"])

    # arc ids written by the extraction step describe the plot (e.g. ".../the_brother_who_chose_to_be_hated"),
    # so replace them with neutral ids: arc:<show>/<character>/<n>
    id_map, per_char = {}, {}
    for aid, n in nodes.items():
        if n["type"] == "arc":
            char = n["character"].split(":", 1)[1]
            per_char[char] = per_char.get(char, 0) + 1
            id_map[aid] = f"arc:{char}/{per_char[char]}"
    nodes = {id_map.get(k, k): ({**n, "id": id_map[k]} if k in id_map else n) for k, n in nodes.items()}
    for e in edges:
        e["source"], e["target"] = id_map.get(e["source"], e["source"]), id_map.get(e["target"], e["target"])
    with open(os.path.join(G, "arc_id_map.json"), "w") as f:
        json.dump(id_map, f, indent=1)

    # integrity: every edge endpoint must exist; drop dangling edges
    good = []
    for e in edges:
        missing = [x for x in (e["source"], e["target"]) if x not in nodes]
        if missing:
            problems.append(f"dangling {e['type']} edge {e['source']} -> {e['target']} (missing {missing})")
        else:
            good.append(e)
    edges = good

    counts = {"nodes": len(nodes), "edges": len(edges)}
    for n in nodes.values():
        counts[n["type"]] = counts.get(n["type"], 0) + 1
    graph = {
        "meta": {
            "name": "InnerCast character-arc graph",
            "version": "0.1",
            "generated": date.today().isoformat(),
            "counts": counts,
            "note": "Never pass arc.spoiler to the LLM step that writes the user-facing answer.",
        },
        "nodes": list(nodes.values()),
        "edges": edges,
    }
    out = os.path.join(HERE, "qwen_server", "graph.json")  # lives with the files the server needs
    with open(out, "w") as f:
        json.dump(graph, f, ensure_ascii=False, indent=1)
    for p in problems:
        print("PROBLEM:", p)
    print(f"wrote {out}: {counts}  ({os.path.getsize(out) / 1e6:.2f} MB)")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()

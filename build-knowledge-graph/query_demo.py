"""Demo: query qwen_server/graph.json the way the app would, and print SPOILER-SAFE results.

Scores every arc by how many of the user's situation / conflict / emotion nodes it touches,
keeps at most one arc per show, then adds a "different world, same vibe" wildcard found
through RESONATES_WITH or a shared pattern. Spoiler fields and spoiler-flagged edges are never shown.

Usage:
  python3 query_demo.py --situations becoming_a_manager,leading_former_peers \
                        --conflicts loyalty_vs_ambition --emotions self_doubt,anxiety
"""
import argparse
import json
import os
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))


def load():
    g = json.load(open(os.path.join(HERE, "qwen_server", "graph.json")))
    nodes = {n["id"]: n for n in g["nodes"]}
    out = defaultdict(list)
    for e in g["edges"]:
        out[e["source"]].append(e)
    return nodes, out


def score_arcs(nodes, out, situations, conflicts, emotions, patterns=frozenset()):
    scores = {}
    for aid, n in nodes.items():
        if n["type"] != "arc":
            continue
        s = 0.0
        for e in out[aid]:
            t, p = e["target"], e.get("props", {})
            if e["type"] == "ABOUT" and t.split(":", 1)[1] in situations:
                s += 2 * p.get("weight", 1)
            elif e["type"] == "FACES" and t.split(":", 1)[1] in conflicts:
                s += 2
            elif e["type"] == "INSTANCE_OF" and t.split(":", 1)[1] in patterns:
                s += 2
            elif e["type"] == "FEELS" and t.split(":", 1)[1] in emotions:
                s += 1.5 if p.get("phase") == "start" else 0.5  # the user is at the START of their arc
        if s:
            scores[aid] = s
    return scores


def safe_card(nodes, out, aid, why=None):
    a = nodes[aid]
    show = nodes[a["show"]]
    show_w = [e for e in out[a["show"]] if e["type"] == "HAS_WARNING"]
    warnings = [nodes[e["target"]]["label"] for e in sorted(show_w, key=lambda e: -e["props"]["arcs"])]
    lines = [f"* {nodes[a['character']]['name']} — {show['name']}  [{show['format']}]",
             f"  {a['title']}",
             f"  Hook: {a['hook']}",
             f"  Why it may resonate: {a['why_relatable']}",
             f"  Arc begins: {a['start_at']} (best watched from the start)   Journey feels: {a['ending_tone']}, {a['intensity']}",
             f"  Series content notes: {', '.join(warnings[:6])}"]
    if why:
        lines.insert(1, f"  Wildcard — {why}")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--situations", default="")
    ap.add_argument("--conflicts", default="")
    ap.add_argument("--emotions", default="")
    ap.add_argument("--top", type=int, default=4)
    args = ap.parse_args()
    split = lambda s: {x.strip() for x in s.split(",") if x.strip()}
    nodes, out = load()
    scores = score_arcs(nodes, out, split(args.situations), split(args.conflicts), split(args.emotions))

    picked, shows = [], set()
    for aid, s in sorted(scores.items(), key=lambda kv: -kv[1]):
        if nodes[aid]["show"] not in shows:
            picked.append(aid)
            shows.add(nodes[aid]["show"])
        if len(picked) == args.top:
            break

    # wildcard: resonance or shared pattern from the best match, in a show not yet used
    wildcard = None
    if picked:
        best = picked[0]
        for e in out[best]:
            if e["type"] == "RESONATES_WITH" and nodes[e["target"]]["show"] not in shows:
                wildcard = (e["target"], e["props"]["bridge"])
                break
        if not wildcard:
            pats = {e["target"] for e in out[best] if e["type"] == "INSTANCE_OF"}
            for aid, n in nodes.items():
                if n["type"] == "arc" and n["show"] not in shows and any(
                        e["type"] == "INSTANCE_OF" and e["target"] in pats for e in out[aid]):
                    wildcard = (aid, "shares the pattern: " + ", ".join(nodes[p]["label"] for p in pats))
                    break

    for aid in picked:
        print(safe_card(nodes, out, aid) + f"\n  (score {scores[aid]:.1f})\n")
    if wildcard:
        print(safe_card(nodes, out, wildcard[0], why=wildcard[1]))


if __name__ == "__main__":
    main()

"""Run every check on the knowledge graph in one go, then build qwen_server/graph.json.

1. arc files: vocabularies, required fields, setting-free text      (validate_arcs.py)
2. story patterns: every arc assigned, hierarchy valid               (graph/validate_patterns.py)
3. cross-show links: ids, coverage, no names in bridges             (graph/validate_resonances.py, _extra.py)
4. build graph.json                                                  (build_graph.py)
5. graph.json matches the zod schema rules in graph/graph.schema.ts (checked here in Python)
6. spoiler scanner summary                                           (scan_spoilers.py)

Usage: python3 check_all.py
"""
import glob
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(HERE, "graph")


def run(label, cmd, cwd=HERE):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    out = (r.stdout + r.stderr).strip().splitlines()
    status = "ok " if r.returncode == 0 else "FAIL"
    print(f"[{status}] {label}: {out[-1] if out else ''}")
    if r.returncode != 0:
        for line in out[-15:-1]:
            print("        ", line)
    return r.returncode == 0


def schema_check():
    g = json.load(open(os.path.join(HERE, "qwen_server", "graph.json")))
    req = {
        "show": ["name", "format", "genres", "setting", "culture", "era", "tone", "seasons"],
        "character": ["name", "show", "role"],
        "arc": ["character", "show", "title", "literal_situation", "hook", "why_relatable", "watch_for",
                "start_at", "span", "ending_tone", "intensity", "pattern_label", "pattern_text",
                "example_user_messages", "spoiler"],
        "pattern": ["label", "description"], "emotion": ["label"], "conflict": ["label"],
        "situation": ["label"], "warning": ["label"],
    }
    prefix = {"show": "show:", "character": "char:", "arc": "arc:", "pattern": "pattern:", "emotion": "emotion:",
              "conflict": "conflict:", "situation": "situation:", "warning": "warning:"}
    edge_types = {"IN_SHOW", "HAS_ARC", "INSTANCE_OF", "BROADER", "ABOUT", "FACES", "FEELS", "HAS_WARNING",
                  "RELATES_TO", "RESONATES_WITH"}
    prop_types = {"weight": (int, float), "phase": str, "relation": str, "bridge": str, "arcs": int, "spoiler": bool}
    bad = []
    for n in g["nodes"]:
        t = n.get("type")
        if t not in req:
            bad.append(f"unknown node type {t}")
            continue
        bad += [f"{n['id']}: missing {k}" for k in req[t] if k not in n]
        if not n["id"].startswith(prefix[t]):
            bad.append(f"{n['id']}: bad id prefix")
        if t == "arc":
            if n["ending_tone"] not in ("hopeful", "bittersweet", "tragic", "ambiguous"):
                bad.append(f"{n['id']}: ending_tone")
            if n["intensity"] not in ("light", "moderate", "heavy"):
                bad.append(f"{n['id']}: intensity")
            sp = n["spoiler"]
            if not (isinstance(sp.get("key_events"), list)
                    and all(isinstance(sp.get(k), str) for k in ("summary", "got_right", "got_wrong"))):
                bad.append(f"{n['id']}: spoiler shape")
    for e in g["edges"]:
        if e["type"] not in edge_types:
            bad.append(f"edge type {e['type']}")
        for k, v in e.get("props", {}).items():
            if k not in prop_types or not isinstance(v, prop_types[k]) or (k == "arcs" and isinstance(v, bool)):
                bad.append(f"edge prop {k}={v!r}")
    ok = not bad
    print(f"[{'ok ' if ok else 'FAIL'}] zod schema rules: {len(g['nodes'])} nodes, {len(g['edges'])} edges, "
          f"{len(bad)} problems")
    for b in bad[:10]:
        print("        ", b)
    return ok


if __name__ == "__main__":
    arcs = sorted(glob.glob(os.path.join(G, "arcs", "*.json")))
    results = [
        run("arc files", [sys.executable, "validate_arcs.py", *arcs]),
        run("story patterns", [sys.executable, "validate_patterns.py"], cwd=G),
        run("cross-show links (round 1)", [sys.executable, "validate_resonances.py"], cwd=G),
    ]
    # later rounds of shows: (link file, index of the arcs added in that round)
    for links, new_index, label in [("resonances_extra.json", "arc_index_new_round2.txt", "round 2, 13 shows"),
                                    ("resonances_extra_round3.json", "arc_index_new_round3.txt", "round 3, 10 shows")]:
        if os.path.exists(os.path.join(G, links)):
            results.append(run(f"cross-show links ({label})",
                               [sys.executable, "validate_resonances_extra.py", links, new_index], cwd=G))
    results.append(run("build graph.json", [sys.executable, "build_graph.py"]))
    results.append(schema_check())
    subprocess.run([sys.executable, "scan_spoilers.py", *arcs], cwd=HERE, capture_output=True)
    r = subprocess.run([sys.executable, "scan_spoilers.py", *arcs], cwd=HERE, capture_output=True, text=True)
    print(f"[info] spoiler scanner: {r.stdout.strip().splitlines()[-1]} (heuristic; most hits are premise facts)")
    print("\nALL CHECKS PASSED" if all(results) else "\nSOME CHECKS FAILED - see above")
    sys.exit(0 if all(results) else 1)

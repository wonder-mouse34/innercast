"""Write graph/arc_index.txt (all arcs) and graph/arc_index_new.txt (arcs from the given shows).

One line per arc: arc_id | character | pattern_label | pattern_text | conflicts | situations | tone
Used as compact input for the pattern-grouping and resonance agents.

Usage: python3 make_arc_index.py [--out NAME] [show_id ...]
  e.g. python3 make_arc_index.py --out arc_index_new_round3.txt mad_men succession
"""
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
out_name = "arc_index_new.txt"
if args[:1] == ["--out"]:
    out_name, args = args[1], args[2:]
new_shows = set(args)
all_lines, new_lines = [], []
for p in sorted(glob.glob(os.path.join(HERE, "graph", "arcs", "*.json"))):
    d = json.load(open(p))
    for c in d["characters"]:
        for a in c["arcs"]:
            line = (f"{a['id']} | {c['name']} | {a['pattern_label']} | {a['pattern_text']} | "
                    f"conflicts: {','.join(a['conflicts'])} | situations: {','.join(s['id'] for s in a['situations'])} | "
                    f"tone: {a['ending_tone']}")
            all_lines.append(line)
            if d["show"] in new_shows:
                new_lines.append(line)
open(os.path.join(HERE, "graph", "arc_index.txt"), "w").write("\n".join(all_lines) + "\n")
open(os.path.join(HERE, "graph", out_name), "w").write("\n".join(new_lines) + "\n")
print(f"{len(all_lines)} arcs -> graph/arc_index.txt; {len(new_lines)} from {sorted(new_shows)} -> graph/{out_name}")

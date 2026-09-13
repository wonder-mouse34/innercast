"""Validate one extra cross-show link file against the arcs added in that round.

Checks: ids exist in arc_index.txt; one side of every pair is a new arc of this round; different shows;
no duplicate/reversed pairs (also against every other resonances*.json); one sentence per bridge; no
character names in bridges. Warns when a new arc has fewer than 2 links (counting all link files).

Usage: python3 validate_resonances_extra.py [links.json] [new_arcs_index.txt]
  defaults: resonances_extra.json arc_index_new_round2.txt
"""
import glob
import json
import os
import re
import statistics
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
links_file = sys.argv[1] if len(sys.argv) > 1 else "resonances_extra.json"
new_index = sys.argv[2] if len(sys.argv) > 2 else "arc_index_new_round2.txt"


def index(path):
    rows = {}
    for line in open(os.path.join(HERE, path)):
        if line.strip():
            parts = [p.strip() for p in line.split(" | ")]
            rows[parts[0]] = parts[1]
    return rows


all_arcs, new_arcs = index("arc_index.txt"), index(new_index)
extra = json.load(open(os.path.join(HERE, links_file)))
others = []
for p in sorted(glob.glob(os.path.join(HERE, "resonances*.json"))):
    if os.path.basename(p) != os.path.basename(links_file):
        others += json.load(open(p))
show = lambda a: a.split(":", 1)[1].split("/")[0]
names = {w.lower() for n in all_arcs.values() for w in re.findall(r"[A-Za-z]{4,}", n)}
errors, seen = [], {frozenset((r["source"], r["target"])) for r in others}
cover = {a: 0 for a in new_arcs}
for r in others:
    for a in (r["source"], r["target"]):
        if a in cover:
            cover[a] += 1
for i, r in enumerate(extra):
    s, t, b = r.get("source"), r.get("target"), r.get("bridge", "")
    for a in (s, t):
        if a not in all_arcs:
            errors.append(f"#{i}: unknown arc id {a}")
    if s not in new_arcs and t not in new_arcs:
        errors.append(f"#{i}: neither side is a new arc ({s}, {t})")
    if s in all_arcs and t in all_arcs and show(s) == show(t):
        errors.append(f"#{i}: same show {s} / {t}")
    key = frozenset((s, t))
    if key in seen:
        errors.append(f"#{i}: duplicate pair {s} / {t}")
    seen.add(key)
    for a in (s, t):
        if a in cover:
            cover[a] += 1
    if len(re.findall(r"[.!?](\s|$)", b.strip())) > 1:
        errors.append(f"#{i}: bridge is more than one sentence")
    hit = [w for w in re.findall(r"[A-Za-z]{4,}", b) if w.lower() in names and w[0].isupper()]
    if hit:
        errors.append(f"#{i}: possible character name in bridge: {hit}")
low = [a for a, n in cover.items() if n < 2]
if low:  # a warning, not an error: removing shows (remove_shows.py) left some arcs with fewer links
    print(f"warning: {len(low)} new arcs have < 2 links, e.g. {low[:5]}")
for e in errors[:40]:
    print(e)
vals = list(cover.values()) or [0]
print(f"{links_file}: {len(extra)} pairs; new arcs {len(cover)}; coverage min {min(vals)} median {statistics.median(vals)}")
print("OK" if not errors else f"{len(errors)} problem(s)")
sys.exit(0 if not errors else 1)

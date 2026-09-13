#!/usr/bin/env python3
"""Validates graph/patterns.json against graph/arc_index.txt and prints coverage stats."""
import json, os, re, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(os.path.join(HERE, "patterns.json")))
arcs = [l.split("|")[0].strip() for l in open(os.path.join(HERE, "arc_index.txt")) if l.strip()]
errors = []

ids = [p["id"] for p in data["patterns"]]
dups = {i for i in ids if ids.count(i) > 1}
if dups: errors.append(f"duplicate ids: {sorted(dups)}")
byid = {p["id"]: p for p in data["patterns"]}
themes = {i for i, p in byid.items() if not p["broader"]}
leaves = {i for i, p in byid.items() if p["broader"]}

for i, p in byid.items():
    if set(p) != {"id", "label", "description", "broader"}: errors.append(f"{i}: bad keys {sorted(p)}")
    is_theme = i.startswith("pattern:theme_")
    if not re.fullmatch(r"pattern:[a-z0-9_]+", i): errors.append(f"bad id format: {i}")
    if is_theme and p["broader"]: errors.append(f"theme {i} has broader")
    if not is_theme and not (1 <= len(p["broader"]) <= 2): errors.append(f"{i}: needs 1-2 broader")
    for b in p["broader"]:
        if b not in themes: errors.append(f"{i}: broader {b} is not a theme")
    if not p["description"].strip(): errors.append(f"{i}: empty description")

arcset = set(arcs)
if len(arcset) != len(arcs): errors.append("duplicate arc ids in arc_index.txt")
missing = arcset - set(data["assign"]); unknown = set(data["assign"]) - arcset
if missing: errors.append(f"unassigned arcs: {sorted(missing)}")
if unknown: errors.append(f"unknown arcs in assign: {sorted(unknown)}")
members = defaultdict(list)
for a, ps in data["assign"].items():
    if not (1 <= len(ps) <= 2) or len(set(ps)) != len(ps): errors.append(f"{a}: needs 1-2 distinct patterns")
    for p in ps:
        if p not in leaves: errors.append(f"{a}: {p} is not a level-2 pattern")
        members[p].append(a)

show = lambda a: a.split(":")[1].split("/")[0]
empty = [p for p in leaves if p not in members]
if empty: errors.append(f"patterns with no arcs: {sorted(empty)}")

print(f"{'pattern':<72} {'arcs':>4} {'shows':>5}")
multi = single = 0
for t in sorted(themes):
    pass
for p in sorted(leaves, key=lambda p: (-len(members[p]), p)):
    n, s = len(members[p]), len({show(a) for a in members[p]})
    multi += s >= 2; single += n == 1
    print(f"{byid[p]['label'][:72]:<72} {n:>4} {s:>5}")
theme_use = defaultdict(int)
for p in leaves:
    for b in byid[p]["broader"]: theme_use[b] += 1
print("\nthemes -> number of patterns:")
for t in sorted(themes): print(f"  {byid[t]['label']:<40} {theme_use[t]}")
print(f"\nthemes={len(themes)} patterns={len(leaves)} spanning>=2 shows={multi} single-arc={single} "
      f"arcs={len(data['assign'])}/{len(arcs)} with 2 patterns={sum(len(v)==2 for v in data['assign'].values())}")
unused = [t for t in themes if not theme_use[t]]
if unused: errors.append(f"unused themes: {unused}")
if errors:
    print("\nERRORS:"); [print("  " + e) for e in errors]; sys.exit(1)
print("OK: validation clean")

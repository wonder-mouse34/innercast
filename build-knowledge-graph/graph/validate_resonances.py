#!/usr/bin/env python3
"""Validate resonances.json against arc_index.txt."""
import json, os, re, statistics, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, "arc_index.txt")
RES = os.path.join(HERE, "resonances.json")
# round-1 shows (Lost and Star Trek were removed for licence reasons, see remove_shows.py)
ORIGINAL_SHOWS = {"avatar", "buffy", "game_of_thrones", "greys_anatomy", "naruto"}

ids, names = [], set()
with open(INDEX, encoding="utf-8") as f:
    for line in f:
        if not line.strip():
            continue
        parts = [p.strip() for p in line.split(" | ")]
        # resonances.json covers the round-1 shows; added shows are checked by validate_resonances_extra.py
        if parts[0][len("arc:"):].split("/")[0] not in ORIGINAL_SHOWS:
            continue
        ids.append(parts[0])
        names.add(parts[1])
idset = set(ids)
show = lambda i: i[len("arc:"):].split("/")[0]

# name tokens: full names plus each word (incl. nicknames in quotes, hyphen parts)
STOP = {"the", "of", "t"}
tokens = set()
for n in names:
    tokens.add(n.lower())
    for t in re.split(r"[\s\"\-\.]+", n):
        t = t.strip().lower()
        if t and t not in STOP:
            tokens.add(t)

GENRE = ["hospital", "surgeon", "surgery", "surgical", "medical", "patient", "nurse", "island",
         "plane", "crash", "ship", "starship", "space", "planet", "alien", "captain", "crew",
         "vampire", "slayer", "demon", "witch", "magic", "spell", "bending", "bender", "avatar",
         "ninja", "village", "clan", "kingdom", "throne", "dragon", "king", "queen", "knight",
         "sword", "war", "battle", "army", "soldier", "federation", "empire", "emperor", "fleet",
         "anime", "fantasy", "sci-fi", "medieval", "supernatural", "chakra", "hellmouth"]
SPOILER = ["dies", "died", "killed", "in the end", "eventually", "ultimately", "finally succeeds",
           "ends up", "turns out"]

errors, warnings = [], []
data = json.load(open(RES, encoding="utf-8"))
seen = set()
cov = Counter()
for k, e in enumerate(data):
    s, t, b = e.get("source"), e.get("target"), e.get("bridge", "")
    if set(e) != {"source", "target", "bridge"}:
        errors.append(f"[{k}] unexpected keys {sorted(e)}")
    for x in (s, t):
        if x not in idset:
            errors.append(f"[{k}] unknown id {x}")
    if s in idset and t in idset and show(s) == show(t):
        errors.append(f"[{k}] same-show pair {s} -- {t}")
    key = frozenset((s, t))
    if s == t:
        errors.append(f"[{k}] self pair {s}")
    if key in seen:
        errors.append(f"[{k}] duplicate/reversed pair {s} -- {t}")
    seen.add(key)
    cov[s] += 1
    cov[t] += 1
    low = b.lower()
    for tok in tokens:
        if re.search(r"(?<![a-z])" + re.escape(tok) + r"(?![a-z])", low):
            errors.append(f"[{k}] name token '{tok}' in bridge: {b}")
    for g in GENRE:
        if re.search(r"(?<![a-z])" + re.escape(g) + r"(?![a-z])", low):
            errors.append(f"[{k}] genre/setting word '{g}' in bridge: {b}")
    for sp in SPOILER:
        if re.search(r"(?<![a-z])" + re.escape(sp) + r"(?![a-z])", low):
            warnings.append(f"[{k}] possible ending language '{sp}': {b}")
    if not b.endswith(".") or re.search(r"[.!?]\s+[A-Z]", b):
        errors.append(f"[{k}] not a single sentence: {b}")
    if not b.startswith("Both"):
        warnings.append(f"[{k}] bridge does not start with 'Both': {b}")

under = [i for i in ids if cov[i] < 2]
for i in under:  # a warning, not an error: removing shows (remove_shows.py) left some arcs with fewer links
    warnings.append(f"arc covered {cov[i]}x (<2): {i}")

bridges = Counter(e["bridge"] for e in data)
for b, n in bridges.items():
    if n > 1:
        errors.append(f"bridge text used {n}x: {b}")

vals = [cov[i] for i in ids]
print(f"pairs: {len(data)}")
print(f"arcs: {len(ids)}  coverage min={min(vals)} median={statistics.median(vals)} max={max(vals)}")
print("coverage distribution:", dict(sorted(Counter(vals).items())))
cross = Counter(tuple(sorted((show(e['source']), show(e['target'])))) for e in data)
print("show-pair counts:")
for k2, n in sorted(cross.items(), key=lambda x: -x[1]):
    print(f"  {k2[0]} <-> {k2[1]}: {n}")
for w in warnings:
    print("WARN", w)
for er in errors:
    print("ERROR", er)
print("RESULT:", "CLEAN" if not errors else f"{len(errors)} errors")
sys.exit(1 if errors else 0)

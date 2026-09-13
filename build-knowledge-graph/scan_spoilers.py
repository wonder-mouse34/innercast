"""Flag possible spoilers in the user-facing (spoiler-safe) fields of the arc files.

Checks each arc's role/title/literal_situation/hook/why_relatable/watch_for for
(1) risky keywords (deaths, reveals, endings) and
(2) distinctive words from that arc's own spoiler.key_events.
It's a heuristic: every hit needs a human (or LLM) look, not every hit is a real leak.

Usage: python3 scan_spoilers.py graph/arcs/*.json
"""
import json
import re
import sys

SAFE = ["title", "literal_situation", "hook", "why_relatable", "watch_for"]
RISKY = re.compile(r"\b(dies|died|death of|killed|kills|murder\w*|resurrect\w*|brought back|comes back|"
                   r"returns? from|revealed?|turns out|secretly|betray\w*|marr(y|ies|ied)|divorc\w*|"
                   r"ends up|eventually|finally|by the end|rescued|escaped?|off the island|flash-?forward|"
                   r"becomes (king|queen|chief|captain|hokage|lord)|widow\w*|lost (his|her) (wife|husband|leg|arm|hand))\b",
                   re.I)
STOP = set("the a an and or of to in on at for with his her their he she they it is was be by from as that this "
           "who into after before over under one two new old own not no".split())


def text_of(a, role):
    parts = [role] + [a.get(k, "") if isinstance(a.get(k), str) else " ".join(a.get(k, [])) for k in SAFE]
    return " ".join(parts)


total = 0
for path in sys.argv[1:]:
    d = json.load(open(path))
    hits = 0
    for c in d["characters"]:
        for a in c["arcs"]:
            safe = text_of(a, c.get("role", ""))
            found = sorted({m.group(0).lower() for m in RISKY.finditer(safe)})
            ev_words = {w.lower() for e in a["spoiler"]["key_events"] for w in re.findall(r"[A-Za-z']{6,}", e)} - STOP
            name_words = {w.lower() for w in re.findall(r"[A-Za-z']+", c["name"])}
            leaked = sorted(w for w in ev_words - name_words if re.search(rf"\b{re.escape(w)}\b", safe, re.I))
            if found or len(leaked) >= 3:
                hits += 1
                print(f"  {a['id']}: keywords={found} event-words={leaked[:6]}")
    total += hits
    print(f"{path.split('/')[-1]}: {hits} arcs flagged")
print(f"TOTAL flagged: {total}")

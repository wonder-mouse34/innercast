"""Check a user-facing answer for spoiler leaks against the chosen arcs' hidden key events.

For each chosen arc, takes the distinctive words of spoiler.key_events and spoiler.summary
(names, places, long words) that do NOT already appear in the arc's spoiler-safe fields,
and reports any that show up in the answer text. Heuristic: every hit needs a human look.

Usage: python3 demo_leak_check.py <answer.md> arc:id1,arc:id2,...
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SAFE = ["title", "literal_situation", "hook", "why_relatable", "watch_for"]
STOP = set("""about after again against because before being between during everyone himself herself
their there these those through toward under until where which while would should could other
people something someone season episode series really always never""".split())

answer = open(sys.argv[1]).read()
# ignore the user's own message (the first > quote block): words they wrote themselves can't be spoilers
m = re.search(r"(^>.*\n)+", answer, re.M)
if m:
    answer = answer[:m.start()] + answer[m.end():]
answer = answer.lower()
arc_ids = [a.strip() for a in sys.argv[2].split(",")]
g = json.load(open(os.path.join(HERE, "qwen_server", "graph.json")))
nodes = {n["id"]: n for n in g["nodes"]}

total = 0
for aid in arc_ids:
    a = nodes[aid]
    safe_text = " ".join(a[k] if isinstance(a[k], str) else " ".join(a[k]) for k in SAFE).lower()
    safe_text += " " + nodes[a["character"]]["name"].lower() + " " + nodes[a["character"]]["role"].lower()
    safe_text += " " + nodes[a["show"]]["name"].lower()  # the show title is not a spoiler
    secret = " ".join(a["spoiler"]["key_events"]) + " " + a["spoiler"]["summary"]
    words = {w.lower() for w in re.findall(r"\b[A-Z][a-z]{2,}\b", secret)}      # names / places
    words |= {w.lower() for w in re.findall(r"\b[a-z]{7,}\b", secret)}          # distinctive long words
    words = {w for w in words - STOP if w not in safe_text}
    hits = sorted(w for w in words if re.search(rf"\b{re.escape(w)}\b", answer))
    total += len(hits)
    print(f"{aid}: {len(words)} hidden words checked, {len(hits)} found in answer {hits if hits else ''}")
print("NO LEAKS FOUND" if not total else f"{total} possible leak word(s) - read them in context")

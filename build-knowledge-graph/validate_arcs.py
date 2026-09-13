"""Validate one or more arc-extraction JSON files against graph/vocabularies.json.

Usage: python3 validate_arcs.py graph/arcs/*.json      -> prints problems, or OK
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
VOC = json.load(open(os.path.join(HERE, "graph", "vocabularies.json")))
ARC_FIELDS = ["id", "title", "literal_situation", "pattern_label", "pattern_text", "hook", "why_relatable",
              "watch_for", "start_at", "span", "situations", "conflicts", "emotions", "ending_tone",
              "intensity", "warnings", "example_user_messages", "spoiler"]
SPOILER_FIELDS = ["summary", "key_events", "got_right", "got_wrong"]


def check(path):
    problems = []
    try:
        d = json.load(open(path))
    except Exception as e:
        return [f"invalid JSON: {e}"]
    show = d.get("show")
    char_ids = {c.get("id") for c in d.get("characters", [])}
    for c in d.get("characters", []):
        cid = c.get("id", "?")
        if not re.fullmatch(rf"char:{show}/[a-z0-9_]+", cid or ""):
            problems.append(f"{cid}: bad character id")
        for k in ("name", "role", "arcs"):
            if not c.get(k):
                problems.append(f"{cid}: missing {k}")
        names = [w for w in re.split(r"\W+", c.get("name", "")) if len(w) > 3]
        for r in c.get("relations", []):
            if r.get("relation") not in VOC["relation"]:
                problems.append(f"{cid}: relation '{r.get('relation')}' not in vocabulary")
            if not str(r.get("target", "")).startswith(f"char:{show}/"):
                problems.append(f"{cid}: relation target {r.get('target')} is not a char:{show}/ id")
        for a in c.get("arcs", []):
            aid = a.get("id", "?")
            if not str(aid).startswith(f"arc:{show}/"):
                problems.append(f"{aid}: arc id must start with arc:{show}/")
            for k in ARC_FIELDS:
                if k not in a or a[k] in ("", None):
                    problems.append(f"{aid}: missing {k}")
            for s in a.get("situations", []):
                if s.get("id") not in VOC["situation"]:
                    problems.append(f"{aid}: situation '{s.get('id')}' not in vocabulary")
            for k, voc in (("conflicts", "conflict"), ("warnings", "warning")):
                for v in a.get(k, []):
                    if v not in VOC[voc]:
                        problems.append(f"{aid}: {k[:-1]} '{v}' not in vocabulary")
            for phase in ("start", "middle", "end"):
                for v in a.get("emotions", {}).get(phase, []):
                    if v not in VOC["emotion"]:
                        problems.append(f"{aid}: emotion '{v}' not in vocabulary")
            if a.get("ending_tone") not in VOC["ending_tone"]:
                problems.append(f"{aid}: ending_tone '{a.get('ending_tone')}' not in vocabulary")
            if a.get("intensity") not in VOC["intensity"]:
                problems.append(f"{aid}: intensity '{a.get('intensity')}' not in vocabulary")
            for k in SPOILER_FIELDS:
                if not a.get("spoiler", {}).get(k):
                    problems.append(f"{aid}: missing spoiler.{k}")
            setting_free = " ".join([a.get("pattern_label", ""), a.get("pattern_text", "")]
                                    + a.get("example_user_messages", []))
            for n in names:
                if re.search(rf"\b{re.escape(n)}\b", setting_free, re.I):
                    problems.append(f"{aid}: character name '{n}' appears in a setting-free field")
    return problems


if __name__ == "__main__":
    bad = 0
    for p in sys.argv[1:]:
        probs = check(p)
        for x in probs:
            print(f"{os.path.basename(p)}: {x}")
        bad += len(probs)
    print("OK" if not bad else f"{bad} problem(s)")

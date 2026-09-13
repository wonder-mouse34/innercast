"""Test the InnerCast prompt + tools against the live Qwen server.

For each test message it runs the full tool-calling loop (qwen_system_prompt.md + qwen_tools.json),
executes Qwen's tool calls locally with qwen_tools.call_tool, saves the transcript, and checks the
final answer automatically:
  - spoiler leak: distinctive words from the hidden spoiler text of every arc Qwen saw (or that the
    test names) that are NOT in that arc's spoiler-safe fields
  - risky phrases: "dies", "ends up", "in the end", "eventually", ... anywhere in the answer
  - pattern wording: story-pattern labels must never be quoted
  - format: "What I'm hearing", numbered sections, content notes, disclaimer
  - per-test expectations from qwen_test_messages.json (search or not, filters, language, crisis)

Usage (from this folder):
  python3 qwen_test.py                          # all tests
  python3 qwen_test.py 3 5                      # only tests 3 and 5
  python3 qwen_test.py --message "I just got dumped"
Credentials: qwen_credentials.env in this folder (or env vars QWEN_BASE_URL, QWEN_API_KEY, QWEN_MODEL).
Transcripts: test_runs/<date-time>/
"""
import json
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime

import qwen_tools as T

HERE = os.path.dirname(os.path.abspath(__file__))
CTX = ssl._create_unverified_context()  # the server uses a self-signed certificate (curl -k)
SAFE_FIELDS = ["title", "literal_situation", "hook", "why_relatable", "watch_for"]
STOP = set("""about after again against because before being between during everyone himself herself their
there these those through toward under until where which while would should could other people something
someone season episode series really always never family friend friends another becomes realises realizes
finally relationship everything something eventually different important beginning themselves throughout confidence""".split())
RISKY = re.compile(r"\b(dies|died|death of|killed|survives?|survived|ends up|in the end|by the end|eventually|"
                   r"ultimately|happy ending|sad ending|tragic ending|ends (happily|tragically|badly|well)|"
                   r"it gets better|finally (finds|gets|becomes|learns|forgives)|turns out|betrays?|twist)\b", re.I)
IN = defaultdict(list)
for _e in T.GRAPH["edges"]:
    IN[_e["target"]].append(_e)
PATTERN_LABELS = [n["label"].lower() for n in T.GRAPH["nodes"] if n["type"] == "pattern" and len(n["label"]) > 20]


from qwen_agent import InnerCastAgent, load_creds  # the same loop the app uses


def run_conversation(agent, user_msg, situations=None, genres=None):
    r = agent.answer(user_msg, situations=situations, genres=genres)
    seen = {a for c in r["tool_calls"] for a in c["arc_ids"]}
    steps = r["steps"] + [f"GUARD: {g}" for g in r["guards"]]
    return r["answer"], r["tool_calls"], seen, steps, r["usage"]


_GLOBAL_SAFE = None


def global_safe_words():
    """Every word used anywhere in the graph's spoiler-safe text: ordinary vocabulary, not a leak signal."""
    global _GLOBAL_SAFE
    if _GLOBAL_SAFE is None:
        words = set()
        for n in T.GRAPH["nodes"]:
            if n["type"] == "arc":
                words |= set(re.findall(r"[a-z]+", _safe_text(n["id"]).lower()))
        _GLOBAL_SAFE = words
    return _GLOBAL_SAFE


def _safe_text(aid):
    a = T.NODES[aid]
    c, s = T.NODES[a["character"]], T.NODES[a["show"]]
    safe = " ".join(a[k] if isinstance(a[k], str) else " ".join(a[k]) for k in SAFE_FIELDS)
    bridges = [e["props"].get("bridge", "") for e in T.OUT[aid] + IN[aid] if e["type"] == "RESONATES_WITH"]
    return " ".join([safe, c["name"], c["role"], s["name"], s["tone"], s["setting"], *bridges])


def leak_check(answer, arc_ids, user_msg):
    ans, hits = answer.lower(), {}
    # everything on ANY fetched card may legitimately appear in the answer
    all_safe = " ".join(_safe_text(a) for a in arc_ids if a in T.NODES) + " " + user_msg + \
        " InnerCast is for entertainment and reflection, not mental-health treatment."
    for aid in arc_ids:
        a = T.NODES.get(aid)
        if not a or a["type"] != "arc":
            continue
        safe = all_safe.lower()
        secret = " ".join(a["spoiler"]["key_events"]) + " " + a["spoiler"]["summary"]
        # names/places = capitalised words NOT at the start of a sentence; plus rarer long words
        names = {w for w in re.findall(r"(?<![.!?]\s)(?<!^)\b([A-Z][a-z]{2,})\b", secret)}
        words = {w.lower() for w in names} | {w.lower() for w in re.findall(r"\b[a-z]{9,}\b", secret)}
        words = {w for w in words - STOP if w not in safe and (w.capitalize() in names or w not in global_safe_words())}
        # a name only counts if the answer also writes it capitalised (a proper noun, not an everyday word)
        found = sorted(w for w in words
                       if (w.capitalize() in names and re.search(rf"\b{re.escape(w.capitalize())}\b", answer))
                       or (w not in {n.lower() for n in names} and re.search(rf"\b{re.escape(w)}\b", ans)))
        if found:
            hits[aid] = found
    return hits


def evaluate(test, answer, calls, seen):
    exp, problems, notes = test.get("expect", {}), [], []
    searched = any(c["tool"] == "find_matching_characters" for c in calls)
    fetched = any(c["tool"] == "get_character_cards" for c in calls)
    find_args = [c["args"] for c in calls if c["tool"] == "find_matching_characters"]
    if exp.get("search") is True and not searched:
        problems.append("expected a search, but Qwen did not call find_matching_characters")
    if exp.get("search") is True and searched and not fetched:
        problems.append("searched but never fetched character cards (answer may use its own memory)")
    if exp.get("search") is False and searched:
        problems.append("should NOT have searched")
    if exp.get("crisis") and not re.search(r"988|116 ?123|112|crisis|emergency|samaritans", answer, re.I):
        problems.append("crisis message without crisis-line / emergency pointer")
    if exp.get("crisis") and re.search(r"^## ", answer, re.M):
        problems.append("recommended shows to someone in crisis")
    if exp.get("asks_question") and "?" not in answer:
        problems.append("vague message but no question asked")
    if exp.get("formats") and find_args and not all(set(a.get("formats", [])) == set(exp["formats"]) for a in find_args):
        problems.append(f"formats filter not used as expected: {[a.get('formats') for a in find_args]}")
    if exp.get("avoid_warnings_any") and find_args and not any(set(a.get("avoid_warnings", [])) & set(exp["avoid_warnings_any"]) for a in find_args):
        problems.append(f"avoid_warnings not used: {[a.get('avoid_warnings') for a in find_args]}")
    if exp.get("max_intensity_not") and find_args and all(a.get("max_intensity", "heavy") == exp["max_intensity_not"] for a in find_args):
        notes.append("max_intensity was not lowered for a fragile user")
    if exp.get("exclude_shows") and find_args and not all(set(exp["exclude_shows"]) <= set(a.get("exclude_shows", [])) for a in find_args):
        problems.append(f"exclude_shows not used: {[a.get('exclude_shows') for a in find_args]}")
    if exp.get("language") == "de" and not re.search(r"\b(und|nicht|dich|du|Sie|Ihnen|dass|ist|Warum|Wie)\b", answer):
        problems.append("answer not in German")
    if not exp.get("language") and searched:  # English test: the answer must be English
        from qwen_agent import language_counts
        counts = language_counts(answer)
        if counts["english"] < max(counts.values()):
            problems.append(f"answer not in English (common-word counts {counts})")
    shown = [a for c in calls if c["tool"] == "get_character_cards" for a in c["arc_ids"]]
    if exp.get("only_genres"):
        from qwen_agent import BUTTONS
        allowed = {s for g in exp["only_genres"] for s in BUTTONS["genres"][g]}
        outside = [a for a in shown if a.split(":", 1)[1].split("/")[0] not in allowed]
        if outside:
            problems.append(f"recommended shows outside the chosen genres: {outside}")
    if exp.get("max_arc_intensity"):
        order = ["light", "moderate", "heavy"]
        too = [a for a in shown if order.index(T.NODES[a]["intensity"]) > order.index(exp["max_arc_intensity"])]
        if too:
            problems.append(f"arcs more intense than {exp['max_arc_intensity']}: {too}")
    if exp.get("mentions") and exp["mentions"].lower() not in answer.lower():
        problems.append(f"answer should mention {exp['mentions']}")
    for c in calls:
        if c.get("unknown_terms"):
            notes.append(f"unknown terms sent (Qwen had to retry): {c['unknown_terms']}")
        if c.get("error"):
            problems.append(f"tool error: {c['error']}")
    # spoilers
    check_ids = {a for c in calls if c["tool"] == "get_character_cards" for a in c["arc_ids"]}
    if not searched:  # answered from memory: nothing to compare against except the test extras
        check_ids = set()
    for ch in exp.get("extra_leak_characters", []):
        check_ids |= {e["target"] for e in T.OUT[ch] if e["type"] == "HAS_ARC"}
    for aid, words in leak_check(answer, check_ids, test["message"]).items():
        problems.append(f"possible spoiler words from {aid}: {words}")
    # content-notes lines list warning labels like "death of loved one" on purpose: not a spoiler
    prose = "\n".join(l for l in answer.splitlines() if not re.search(r"content notes|inhaltshinweise", l, re.I))
    card_text = " ".join(_safe_text(a).lower() for a in {x for c in calls if c["tool"] == "get_character_cards"
                                                           for x in c["arc_ids"]} if a in T.NODES)
    for m in RISKY.finditer(prose):
        if re.search(rf"\b{re.escape(m.group(0).lower())}\b", card_text):
            continue  # the word is on a spoiler-free card itself
        if exp.get("language") and m.group(0).lower() == "dies":
            continue  # "dies" = "this" in German
        ctx = prose[max(0, m.start() - 60):m.end() + 40].replace("\n", " ")
        problems.append(f"risky phrase '{m.group(0)}': ...{ctx}...")
    for label in PATTERN_LABELS:
        if label in answer.lower():
            problems.append(f"quoted a story-pattern label: '{label}'")
    # format (only for recommendation answers)
    if searched:
        n_sections = len(re.findall(r"^## ", answer, re.M))
        if n_sections < 3:
            problems.append(f"only {n_sections} character sections")
        if not re.search(r"entertainment and reflection|Unterhaltung", answer, re.I):
            problems.append("disclaimer missing")
        if not re.search(r"Content notes|Inhaltshinweise|Hinweise", answer, re.I):
            notes.append("no content notes line found")
    return problems, notes


def main():
    args = sys.argv[1:]
    tests = json.load(open(os.path.join(HERE, "qwen_test_messages.json")))
    if args[:1] == ["--message"]:
        tests = [{"id": 0, "name": "ad-hoc", "message": " ".join(args[1:]), "expect": {}}]
    elif args:
        tests = [t for t in tests if str(t["id"]) in args]
    cfg = load_creds()
    agent = InnerCastAgent()
    mode = "nothink" if "none" in cfg["QWEN_EXTRA"] else "think"
    out_dir = os.path.join(HERE, "test_runs", datetime.now().strftime("%Y-%m-%d_%H%M%S") + "_" + mode)
    os.makedirs(out_dir, exist_ok=True)
    summary = []
    for t in tests:
        t0 = time.time()
        try:
            answer, calls, seen, steps, usage = run_conversation(agent, t["message"], t.get("situations"), t.get("genres"))
        except Exception as e:
            answer, calls, seen, steps, usage = f"(request failed: {e})", [], set(), [], {}
        dt = time.time() - t0
        problems, notes = evaluate(t, answer, calls, seen)
        status = "PASS" if not problems else "FAIL"
        summary.append((t["id"], t["name"], status, dt, len(problems)))
        with open(os.path.join(out_dir, f"test_{t['id']:02d}.md"), "w") as f:
            f.write(f"# Test {t['id']}: {t['name']} — {status} ({dt:.0f}s)\n\n**User:** {t['message']}\n\n")
            f.write("## Tool calls\n")
            for c in calls:
                f.write(f"- `{c['tool']}` {json.dumps(c['args'], ensure_ascii=False)}\n  -> arcs: {', '.join(c['arc_ids'])}\n")
            f.write("\n## Model steps\n" + "\n".join(f"- {s}" for s in steps) + f"\n- tokens: {usage}\n")
            f.write("\n## Checks\n" + ("\n".join(f"- PROBLEM: {p}" for p in problems) or "- no problems") + "\n")
            f.write("".join(f"- note: {n}\n" for n in notes))
            f.write(f"\n## Answer\n\n{answer}\n")
        print(f"[{status}] test {t['id']} ({t['name']}), {dt:.0f}s, {len(calls)} tool calls")
        for p in problems:
            print("       PROBLEM:", p[:220])
        for n in notes:
            print("       note:", n[:220])
    print(f"\n{sum(1 for s in summary if s[2] == 'PASS')}/{len(summary)} passed. Transcripts: {out_dir}")


if __name__ == "__main__":
    main()

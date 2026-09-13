"""InnerCast conversation pipeline for the Qwen server.

Use from an app (Python 3, no extra packages):
    from qwen_agent import InnerCastAgent
    agent = InnerCastAgent()                      # reads qwen_credentials.env in this folder
    result = agent.answer("I just got promoted and feel like a fraud")
    print(result["answer"])
    # multi-turn: agent.answer(next_message, history=result["history"])

Why a fixed pipeline instead of letting Qwen call the tools itself: in testing, Qwen often skipped the
search (and then recommended from its own memory, even shows that are not in the graph), sent vocabulary
slugs in the wrong field, dropped the "arc:" prefix and looped, and ignored forced tool calls. Here the
code runs the steps and Qwen does only three small jobs:

  1. interpret  (prompts/interpret.md) -> JSON: crisis / ask / recommend, language, vocabulary slugs, filters
  2. search     (code)                 -> qwen_tools.find_matching_characters, widened if < 3 matches
  3. choose     (prompts/choose.md)    -> JSON: 3 picks + 1 wildcard from the candidates
  4. cards      (code)                 -> qwen_tools.get_character_cards (spoiler-free)
  5. write      (prompts/write.md)     -> the answer, from the cards only, in the user's language
  6. check      (code)                 -> every character is on a card, no ending phrases, no mentions of
                                          cards/tools; otherwise Qwen rewrites once. Disclaimer guaranteed.

Steps 1 and 3 always run with thinking off (small JSON tasks). Step 5 thinks unless QWEN_EXTRA contains
{"reasoning_effort": "none"} (about 10x faster).
Credentials: qwen_credentials.env (QWEN_BASE_URL, QWEN_API_KEY, QWEN_MODEL, QWEN_EXTRA) or env variables.
"""
import json
import os
import re
import ssl
import time
import urllib.error
import urllib.request

import qwen_tools as T

HERE = os.path.dirname(os.path.abspath(__file__))
PROMPTS = os.path.join(HERE, "prompts")
CTX = ssl._create_unverified_context()  # the server uses a self-signed certificate (curl -k)
INTENSITY = ["light", "moderate", "heavy"]
CRISIS_LINES = ("If you are in danger or thinking about ending your life, please contact local emergency services "
                "or a crisis line right now: 988 in the US, 116 123 (Samaritans) in the UK and Ireland, 112 in the EU.")
ASK_DEFAULT = ("InnerCast finds TV characters whose story mirrors what you're going through. "
               "What's going on in your life right now?")
DISCLAIMER = "*InnerCast is for entertainment and reflection, not mental-health treatment.*"
RISKY = re.compile(r"\b(dies|died|death of|killed|survives?|survived|ends up|in the end|by the end|eventually|"
                   r"ultimately|happy ending|sad ending|tragic ending|ends (happily|tragically|badly|well)|"
                   r"it gets better|finally (finds|gets|becomes|learns|forgives)|turns out|betrays?|twist)\b", re.I)
META = re.compile(r"\b(the card|cards?|knowledge graph|tool|score|these instructions)\b", re.I)
# everyday words Qwen uses that are not in the vocabulary -> nearest vocabulary slug
SYNONYMS = {"sadness": "grief", "sad": "grief", "sorrow": "grief", "heartbreak": "rejection",
            "heartbroken": "rejection", "hurt": "rejection", "stress": "overwhelm", "stressed": "overwhelm",
            "pressure": "overwhelm", "worry": "anxiety", "worried": "anxiety", "nervous": "anxiety",
            "scared": "fear", "afraid": "fear", "lonely": "loneliness", "isolation": "loneliness",
            "frustration": "resentment", "bitterness": "resentment", "insecurity": "self_doubt",
            "doubt": "self_doubt", "embarrassment": "shame", "humiliation": "shame", "exhaustion": "burnout",
            "tired": "burnout", "lost": "confusion", "uncertainty": "confusion", "hopeless": "numbness",
            "unworthy": "inadequacy", "not_good_enough": "inadequacy", "failure": "inadequacy"}
WARNING_LABELS = [n["label"] for n in T.GRAPH["nodes"] if n["type"] == "warning"]
# common words per language, to catch an answer that drifted into the wrong language
STOPWORDS = {
    "english": {"the", "and", "you", "your", "what", "how", "when", "with", "she", "her", "his", "who", "does", "is"},
    "german": {"und", "der", "die", "das", "nicht", "du", "dich", "sie", "ist", "wie", "wenn", "mit", "ihr", "wer"},
    "spanish": {"el", "la", "los", "las", "que", "y", "tu", "con", "cuando", "como", "para", "una", "es", "su"},
    "french": {"le", "la", "les", "et", "vous", "tu", "que", "quand", "comment", "avec", "elle", "est", "une", "son"},
}


def language_counts(text):
    words = re.findall(r"[a-zäöüßáéíóúñàèç]+", text.lower())
    return {lang: sum(w in sw for w in words) for lang, sw in STOPWORDS.items()}
PATTERN_LABELS = [n["label"].lower() for n in T.GRAPH["nodes"] if n["type"] == "pattern" and len(n["label"]) > 20]
_norm = lambda s: re.sub(r"[^a-z0-9]", "", str(s).lower())
BUTTONS = json.load(open(os.path.join(HERE, "buttons.json")))  # tap buttons -> graph terms / genre -> shows


def load_creds():
    cfg = {"QWEN_EXTRA": "{}"}
    p = os.path.join(HERE, "qwen_credentials.env")
    if os.path.exists(p):
        for line in open(p):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                cfg[k.strip()] = v.strip()
    for k in ("QWEN_BASE_URL", "QWEN_API_KEY", "QWEN_MODEL", "QWEN_EXTRA"):
        if os.environ.get(k):
            cfg[k] = os.environ[k]
    return cfg


def _vocabulary():
    label = {n["id"]: n.get("label", "") for n in T.GRAPH["nodes"]}
    return "\n".join([
        "situations: " + ", ".join(T.VOCAB["situation"]),
        "conflicts: " + ", ".join(T.VOCAB["conflict"]),
        "emotions: " + ", ".join(T.VOCAB["emotion"]),
        "avoid_warnings: " + ", ".join(T.VOCAB["warning"]),
        "formats: " + ", ".join(T.FORMATS),
        "exclude_shows: " + ", ".join(f"{s} ({T.NODES['show:' + s]['name']})" for s in T.SHOWS),
        "patterns (slug: meaning, for searching only):",
        *(f"- {p}: {label.get('pattern:' + p, '')}" for p in T.PATTERNS)])


def _parse_json(text):
    m = re.search(r"\{.*\}", text or "", re.S)
    try:
        return json.loads(m.group(0)) if m else None
    except json.JSONDecodeError:
        return None


class InnerCastAgent:
    def __init__(self, think=None):
        self.cfg = load_creds()
        self.extra = json.loads(self.cfg.get("QWEN_EXTRA") or "{}")
        self.write_think = self.extra.pop("reasoning_effort", None) != "none" if think is None else bool(think)
        read = lambda name: open(os.path.join(PROMPTS, name)).read()
        self.p_interpret = read("interpret.md").replace("{vocabulary}", _vocabulary())
        self.p_choose, self.p_write = read("choose.md"), read("write.md")
        self.show_slug = {}
        for slug in T.SHOWS:
            name = T.NODES["show:" + slug]["name"]
            for key in (slug, name, name.split(" / ")[0], name.split(" (")[0]):
                self.show_slug[_norm(key)] = slug

    # ---------------------------------------------------------------- model calls
    def _chat(self, system, user, label, json_mode=False, think=False):
        body = {"model": self.cfg["QWEN_MODEL"], **self.extra,
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]}
        if not think:
            body["reasoning_effort"] = "none"
        if json_mode:
            body["response_format"] = {"type": "json_object"}
        url = self.cfg["QWEN_BASE_URL"].rstrip("/") + "/chat/completions"
        headers = {"Authorization": f"Bearer {self.cfg['QWEN_API_KEY']}", "Content-Type": "application/json"}
        for attempt in range(3):
            try:
                t0 = time.time()
                req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers)
                with urllib.request.urlopen(req, timeout=600, context=CTX) as r:
                    resp = json.load(r)
                break
            except urllib.error.HTTPError as e:
                if e.code == 400 and "response_format" in body:  # server without JSON mode
                    body.pop("response_format")
                    continue
                if attempt == 2:
                    raise
            except (urllib.error.URLError, TimeoutError):
                if attempt == 2:
                    raise
            time.sleep(5 * (attempt + 1))
        choice, u = resp["choices"][0], resp.get("usage", {})
        self.usage["prompt"] += u.get("prompt_tokens", 0)
        self.usage["completion"] += u.get("completion_tokens", 0)
        content = (choice["message"].get("content") or "").strip()
        self.steps.append(f"{label}: {time.time() - t0:.1f}s, {u.get('completion_tokens', '?')} tokens, "
                          f"think={'on' if think else 'off'}, finish={choice.get('finish_reason')}")
        return content

    def _json(self, system, user, label):
        for attempt in range(2):
            d = _parse_json(self._chat(system, user, label, json_mode=True))
            if isinstance(d, dict):
                return d
            self.guards.append(f"{label}: reply was not JSON -> asked again")
            user += "\n\nReturn ONLY the JSON object."
        return {}

    # ---------------------------------------------------------------- pipeline steps
    def _clean_terms(self, it):
        allowed = {"situations": set(T.VOCAB["situation"]), "conflicts": set(T.VOCAB["conflict"]),
                   "emotions": set(T.VOCAB["emotion"]), "patterns": set(T.PATTERNS)}
        out = {k: [] for k in allowed}
        dropped = []
        for k in allowed:
            for x in it.get(k) or []:
                x = str(x).strip().lower().replace(" ", "_").replace("-", "_")
                if k == "emotions" and x not in allowed[k]:
                    x = SYNONYMS.get(x, x)
                home = k if x in allowed[k] else next((o for o in allowed if x in allowed[o]), None)
                if home and x not in out[home]:
                    out[home].append(x)
                elif not home:
                    dropped.append(f"{k}: {x}")
        out["avoid_warnings"] = [x for x in it.get("avoid_warnings") or [] if x in T.VOCAB["warning"]]
        out["formats"] = [x for x in it.get("formats") or [] if x in T.FORMATS]
        out["exclude_shows"] = []
        for x in it.get("exclude_shows") or []:
            slug = self.show_slug.get(_norm(x))
            if slug and slug not in out["exclude_shows"]:
                out["exclude_shows"].append(slug)
        out["max_intensity"] = it.get("max_intensity") if it.get("max_intensity") in INTENSITY else "heavy"
        if dropped:
            self.guards.append("dropped unknown terms: " + ", ".join(dropped))
        return out

    def _search(self, terms, only_shows=(), prefer_shows=()):
        t = dict(terms)
        extra = {"only_shows": list(only_shows), "prefer_shows": list(prefer_shows)}
        res = T.find_matching_characters(**t, **extra, top=8)
        for k in ("patterns", "conflicts", "emotions"):  # widen, but never drop the user's own filters
            if len(res["candidates"]) >= 3:
                break
            if t.get(k):
                t[k] = []
                self.guards.append(f"fewer than 3 matches -> search widened (dropped {k})")
                res = T.find_matching_characters(**t, **extra, top=8)
        ids = sorted({c["arc_id"] for c in res["candidates"] + res["wildcards"]})
        self.calls.append({"tool": "find_matching_characters", "args": {**t, **extra}, "arc_ids": ids,
                           "unknown_terms": res.get("unknown_terms"), "error": None})
        return res

    def _check_answer(self, text, cards, language="English"):
        problems = []
        for chunk in re.split(r"\n##\s", "\n" + text)[1:]:
            head = chunk.splitlines()[0] if chunk else ""
            card = next((c for c in cards if c.get("character") and
                         (_norm(c["character"]) in _norm(head) or
                          _norm(head.split(" — ")[0].split(". ", 1)[-1]) in _norm(c["character"]))), None)
            if card and "?" not in card.get("why_relatable", ""):
                continue  # the card itself is not phrased as questions
            labels = [l for l in chunk.splitlines() if re.match(r"\*\*[^*]+:\*\*", l.strip())]
            if labels and "?" not in labels[0]:
                problems.append("keep the 'why ... might speak to you' line as the card's open questions, not statements")
                break
        if language.lower() not in ("english", "en") and re.search(
                r"\*\*(What I'm hearing|Why \w+ might speak to you|Watch for|Where to start|Feels like|Content notes):", text):
            problems.append(f"translate every label and title into {language} too")
        if language.lower() not in ("english", "en"):
            english = [w for w in WARNING_LABELS + ["journey", "none listed", "the series includes",
                                                    "moderately intense", "bittersweet", "hopeful"]
                       if re.search(rf"\b{re.escape(w)}\b", text, re.I)]
            if english:
                problems.append(f"these words are still English, translate them into {language}: " + ", ".join(english[:8]))
        counts = language_counts(text)
        want = language.lower()
        if want in counts and counts[want] < max(counts.values()):
            other = max(counts, key=counts.get)
            problems.append(f"the answer is in {other.capitalize()}; write the WHOLE answer in {language}")
        slugs = sorted(set(re.findall(r"\b[a-zäöüß]+_[a-zäöüß_]+\b", text)))
        if slugs:
            problems.append("write normal words, never codes with underscores: " + ", ".join(slugs[:5]))
        names = {_norm(c["character"]) for c in cards if "character" in c}
        heads = re.findall(r"^##\s+(?:\d+\.\s*)?(?:\w+\s*[—–-]\s*)?(.+?)\s+[—–-]\s+\*", text, re.M)
        for h in heads:
            if not any(_norm(h) in n or n in _norm(h) for n in names):
                problems.append(f"'{h}' is not one of the characters you were given; use only the given characters")
        if len(heads) < len(cards):
            problems.append(f"only {len(heads)} of the {len(cards)} characters have a section")
        prose = "\n".join(l for l in text.splitlines() if not re.search(r"content notes|inhalt|contenido|contenu", l, re.I))
        card_text = json.dumps(cards, ensure_ascii=False).lower()
        english = language.lower() in ("english", "en")
        risky = sorted({m.group(0) for m in RISKY.finditer(prose)
                        if (english or m.group(0).lower() != "dies")
                        and not re.search(rf"\b{re.escape(m.group(0).lower())}\b", card_text)})
        if risky:
            problems.append("remove these phrases, they hint at how stories end: " + ", ".join(risky))
        meta = sorted({m.group(0) for m in META.finditer(prose)})
        if meta:
            problems.append("do not mention " + ", ".join(meta))
        quoted = [l for l in PATTERN_LABELS if l in text.lower()]
        if quoted:
            problems.append("do not use these phrases: " + ", ".join(quoted))
        return problems

    def _restore_questions(self, text, cards):
        """English only: if a 'why ... might speak to you' line lost its questions, use the card's own."""
        parts = re.split(r"(\n##\s)", "\n" + text)
        for i in range(2, len(parts), 2):
            head = parts[i].splitlines()[0] if parts[i] else ""
            m_head = re.match(r"(?:\d+\.\s*)?(?:\w+\s*[—–-]\s*)?(.+?)\s+[—–-]\s+\*", head)
            hname = _norm(m_head.group(1)) if m_head else _norm(head)
            card = next((c for c in cards if c.get("character") and hname and
                         (hname in _norm(c["character"]) or _norm(c["character"]) in hname)), None)
            if not card:
                continue
            lines = parts[i].splitlines()
            for j, l in enumerate(lines):
                m = re.match(r"(\s*\*\*[^*]+:\*\*)\s*(.*)", l)
                if m:
                    if "?" not in m.group(2):
                        lines[j] = f"{m.group(1)} {card['why_relatable']}"
                        self.guards.append(f"write: restored the card's questions for {card['character']}")
                    break
            parts[i] = "\n".join(lines)
        return "".join(parts).lstrip("\n")

    def _write(self, user_msg, language, cards, spoiler_q):
        payload = json.dumps({"user_message": user_msg, "language": language, "spoiler_question": spoiler_q,
                              "cards": cards}, ensure_ascii=False)
        feedback, text, think, best = "", "", self.write_think, None
        for attempt in range(3):
            draft = self._chat(self.p_write, payload + feedback, "write", think=think)
            if not draft:
                self.guards.append("write: empty answer -> retried with thinking off")
                think = False
                continue
            text = self._restore_questions(draft, cards) if language.lower() in ("english", "en") else draft
            problems = self._check_answer(text, cards, language)
            # rank drafts: a missing character is worse than any wording problem
            rank = (sum("have a section" in p or "not one of the characters" in p for p in problems), len(problems))
            if best is None or rank < best[0]:
                best = (rank, text)
            if not problems:
                break
            if attempt < 2:
                self.guards.append("write: " + "; ".join(problems)[:300] + " -> rewritten")
                feedback = ("\n\nYour previous draft had problems. Write the whole answer again and fix them: "
                            + "; ".join(problems))
        if best is not None and best[1] != text:
            self.guards.append("write: kept the best draft instead of the last one")
            text = best[1]
        if "InnerCast" not in text[-600:]:
            text = text.rstrip() + "\n\n" + DISCLAIMER
        return text

    # ---------------------------------------------------------------- entry point
    def _buttons(self, situations, genres):
        """Tap buttons -> graph terms, a show filter (genres) and a preference boost. Unknown situation labels
        are left to the model (they are also written into its input)."""
        sit_map = {_norm(k): v for k, v in BUTTONS["situations"].items()}
        gen_map = {_norm(k): (k, v) for k, v in BUTTONS["genres"].items()}
        order = ["light", "moderate", "heavy"]
        out = {"labels": [], "terms": {}, "genres": [], "only_shows": [], "prefer_shows": [], "unknown": []}
        for label in [str(x).strip() for x in situations][:30]:
            if not label or label in out["labels"]:
                continue
            out["labels"].append(label)
            m = sit_map.get(_norm(label))
            if m is None:
                out["unknown"].append(label)
                continue
            for k, v in m.items():
                if k == "max_intensity":
                    cur = out["terms"].get("max_intensity", "heavy")
                    out["terms"]["max_intensity"] = min(cur, v, key=order.index)
                elif k == "prefer_genres":
                    out["prefer_shows"] += [s for g in v for s in BUTTONS["genres"].get(g, [])]
                else:
                    out["terms"].setdefault(k, []).extend(x for x in v if x not in out["terms"].get(k, []))
        for g in [str(x).strip() for x in genres][:20]:
            hit = gen_map.get(_norm(g))
            out["genres"].append(hit[0] if hit else g)
            if hit:
                out["only_shows"] += [s for s in hit[1] if s not in out["only_shows"]]
            else:
                self.guards.append(f"unknown genre button '{g}' (ignored)")
        if out["unknown"]:
            self.guards.append("situation buttons without a mapping, left to the model: " + ", ".join(out["unknown"]))
        return out

    def answer(self, user_msg, history=None, situations=None, genres=None):
        """user_msg: free text (may be empty if situation buttons were tapped).
        situations / genres: the labels of the tapped buttons (see buttons.json)."""
        self.steps, self.guards, self.calls = [], [], []
        self.usage = {"prompt": 0, "completion": 0}
        chips = self._buttons(situations or [], genres or [])
        user_msg = (user_msg or "").strip()
        if not user_msg and chips["labels"]:
            user_msg = "I'm going through: " + ", ".join(chips["labels"]) + "."
        if chips["genres"] and not chips["only_shows"]:
            return self._done("InnerCast doesn't have any " + " / ".join(chips["genres"]) + " shows yet. Pick another "
                              "genre, or leave the genres empty to search every show.", user_msg, history)
        context = user_msg
        if history:
            earlier = "\n".join(f"{m['role']}: {m['content'][:600]}" for m in history if m.get("content"))
            context = f"Earlier in this conversation:\n{earlier}\n\nNew message: {user_msg}"
        if chips["labels"] or chips["genres"]:
            context += ("\n\nThe user also tapped these buttons. Situations: " + (", ".join(chips["labels"]) or "none")
                        + ". Genres: " + (", ".join(chips["genres"]) or "any") + ".")
        it = self._json(self.p_interpret, context, "interpret")
        mode = it.get("mode", "recommend")
        if mode == "ask" and chips["labels"]:
            mode = "recommend"  # a tapped situation is enough to search
        language = it.get("language") or "English"
        if mode == "crisis":
            reply = it.get("reply") or ""
            if not re.search(r"988|116 ?123|\b112\b", reply):
                reply = (reply + "\n\n" + CRISIS_LINES).strip()
            return self._done(reply, user_msg, history)
        if mode == "ask":
            return self._done(it.get("reply") or ASK_DEFAULT, user_msg, history)
        terms = self._clean_terms(it)
        for k, vals in chips["terms"].items():  # tapped situations are certain: always part of the search
            if k == "max_intensity":
                order = ["light", "moderate", "heavy"]
                terms["max_intensity"] = min(terms["max_intensity"], vals, key=order.index)
            else:
                terms[k] = terms.get(k, []) + [v for v in vals if v not in terms.get(k, [])]
        res = self._search(terms, chips["only_shows"], chips["prefer_shows"])
        if not res["candidates"] and chips["only_shows"]:
            return self._done("No character in " + " / ".join(chips["genres"]) + " matches that yet. Try adding another "
                              "genre, or leave the genres empty to search every show.", user_msg, history)
        if not res["candidates"]:
            return self._done("I couldn't find a close match yet. Could you tell me a bit more about what "
                              "you're going through?", user_msg, history)
        keyed = {f"c{i + 1}": c for i, c in enumerate(res["candidates"])}
        wkeyed = {f"w{i + 1}": w for i, w in enumerate(res["wildcards"])}
        show = lambda d, k, extra: {"key": k, **{f: d[f] for f in ("character", "show", "format", "title", "hook",
                                                                   "ending_tone", "intensity", *extra)}}
        choice = self._json(self.p_choose, json.dumps({
            "user_message": user_msg, "feels_now": terms["emotions"],
            "candidates": [show(c, k, ("score",)) for k, c in keyed.items()],
            "wildcards": [show(w, k, ("bridge",)) for k, w in wkeyed.items()]}, ensure_ascii=False), "choose")
        by_id = {c["arc_id"]: k for k, c in keyed.items()}
        raw = [by_id.get(str(x).strip(), str(x).strip().lower()) for x in choice.get("picks") or []]
        picks = [keyed[k]["arc_id"] for k in dict.fromkeys(raw) if k in keyed][:3]
        cand_ids = [c["arc_id"] for c in res["candidates"]]
        if len(picks) < min(3, len(cand_ids)):
            self.guards.append(f"choose: only {len(picks)} valid picks {choice.get('picks')} -> topped up")
            picks += [a for a in cand_ids if a not in picks][:min(3, len(cand_ids)) - len(picks)]
        wk = str(choice.get("wildcard") or "").strip().lower()
        if wk not in wkeyed:  # Qwen sometimes lists the wildcard key among its picks
            wk = next((k for k in raw if k in wkeyed), wk)
        wild = {w["arc_id"]: w for w in res["wildcards"]}
        w = wkeyed[wk]["arc_id"] if wk in wkeyed else (res["wildcards"][0]["arc_id"] if res["wildcards"] else None)
        ids = picks + ([w] if w else [])
        cards = T.get_character_cards(ids)["cards"]
        for c in cards:
            if c.get("arc_id") == w:
                c["wildcard"], c["bridge"] = True, wild[w]["bridge"]
        self.calls.append({"tool": "get_character_cards", "args": {"arc_ids": ids}, "arc_ids": ids,
                           "unknown_terms": None, "error": None})
        text = self._write(user_msg, language, cards, bool(it.get("spoiler_question")))
        return self._done(text, user_msg, history)

    def _done(self, text, user_msg, history):
        hist = list(history or []) + [{"role": "user", "content": user_msg}, {"role": "assistant", "content": text}]
        return {"answer": text, "tool_calls": self.calls, "steps": self.steps, "guards": self.guards,
                "usage": self.usage, "history": hist}


if __name__ == "__main__":
    import sys
    r = InnerCastAgent().answer(" ".join(sys.argv[1:]) or "I just got promoted and feel like a fraud.")
    print(r["answer"])
    print("\n---", *r["steps"], *(f"GUARD: {g}" for g in r["guards"]), sep="\n")

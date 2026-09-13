"""Spoiler-safe knowledge-graph tools for the Qwen prompt in qwen_system_prompt.md.

Self-contained: needs only Python 3 and graph.json (in this folder, or see _graph_path).

Nothing these tools return contains arc.spoiler, story-pattern labels, arc spans or
spoiler-flagged edges, so Qwen cannot leak what it never sees. Spoiler-flagged warnings are
still used to FILTER arcs (avoid_warnings), just never returned.

Tool schemas (OpenAI / Qwen function-calling format) live in qwen_tools.json, generated from
graph.json by --write-schema so the enums never drift from the graph.

Usage:
  python3 qwen_tools.py --write-schema
  python3 qwen_tools.py find_matching_characters '{"situations": ["breakup"], "emotions": ["grief"]}'
  python3 qwen_tools.py get_character_cards '{"arc_ids": ["arc:ted_lasso/roy_kent/3"]}'

In an app: pass json.load(open("qwen_tools.json")) as `tools`, and answer each tool call with
json.dumps(call_tool(name, arguments)).
"""
import json
import os
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))


def _graph_path():
    """graph.json next to this file, else INNERCAST_GRAPH, else the sibling build-knowledge-graph folder of the repo."""
    for p in (os.environ.get("INNERCAST_GRAPH"), os.path.join(HERE, "graph.json"),
              os.path.join(HERE, "..", "build-knowledge-graph", "qwen_server", "graph.json")):
        if p and os.path.exists(p):
            return p
    raise FileNotFoundError("graph.json not found: put it next to qwen_tools.py or set INNERCAST_GRAPH")


GRAPH = json.load(open(_graph_path()))
NODES = {n["id"]: n for n in GRAPH["nodes"]}
OUT = defaultdict(list)
for _e in GRAPH["edges"]:
    OUT[_e["source"]].append(_e)


def _slug(node_id):
    return node_id.split(":", 1)[1]


VOCAB = {t: [_slug(n["id"]) for n in GRAPH["nodes"] if n["type"] == t]
         for t in ("situation", "conflict", "emotion", "warning")}
PATTERNS = sorted({_slug(e["target"]) for es in OUT.values() for e in es if e["type"] == "INSTANCE_OF"})
SHOWS = sorted(_slug(n["id"]) for n in NODES.values() if n["type"] == "show")
FORMATS = sorted({n["format"] for n in NODES.values() if n["type"] == "show"})
INTENSITY = ["light", "moderate", "heavy"]


def score_arcs(situations, conflicts, emotions, patterns):
    """Same scoring as query_demo.py: shared situation / conflict / pattern / emotion nodes."""
    scores = {}
    for aid, n in NODES.items():
        if n["type"] != "arc":
            continue
        s = 0.0
        for e in OUT[aid]:
            t, p = _slug(e["target"]), e.get("props", {})
            if e["type"] == "ABOUT" and t in situations:
                s += 2 * p.get("weight", 1)
            elif e["type"] == "FACES" and t in conflicts:
                s += 2
            elif e["type"] == "INSTANCE_OF" and t in patterns:
                s += 2
            elif e["type"] == "FEELS" and t in emotions:
                s += 1.5 if p.get("phase") == "start" else 0.5  # the user is at the START of their arc
        if s:
            scores[aid] = s
    return scores


def _all_arc_warnings(aid):
    # spoiler-flagged ones included: used only to filter, never returned
    return {_slug(e["target"]) for e in OUT[aid] if e["type"] == "HAS_WARNING"}


def _safe_arc_warnings(aid):
    return [NODES[e["target"]]["label"] for e in OUT[aid]
            if e["type"] == "HAS_WARNING" and not e.get("props", {}).get("spoiler")]


def _summary(aid):
    a, c, s = NODES[aid], NODES[NODES[aid]["character"]], NODES[NODES[aid]["show"]]
    return {"arc_id": aid, "character": c["name"], "role": c["role"], "show": s["name"], "format": s["format"],
            "title": a["title"], "hook": a["hook"], "ending_tone": a["ending_tone"], "intensity": a["intensity"]}


def find_matching_characters(situations=(), conflicts=(), emotions=(), patterns=(), avoid_warnings=(),
                             max_intensity="heavy", formats=(), exclude_shows=(), top=6, only_shows=(), prefer_shows=()):
    cats = {"situations": set(VOCAB["situation"]), "conflicts": set(VOCAB["conflict"]),
            "emotions": set(VOCAB["emotion"]), "patterns": set(PATTERNS)}
    lists = {"situations": list(situations), "conflicts": list(conflicts), "emotions": list(emotions),
             "patterns": list(patterns)}
    moved = []
    for k in list(lists):
        for x in list(lists[k]):
            home = next((o for o in cats if x in cats[o]), None)
            if x not in cats[k] and home:
                lists[k].remove(x)
                lists[home].append(x)
                moved.append(f"{x}: {k} -> {home}")
    situations, conflicts, emotions, patterns = (lists[k] for k in ("situations", "conflicts", "emotions", "patterns"))
    known = {"situations": VOCAB["situation"], "conflicts": VOCAB["conflict"], "emotions": VOCAB["emotion"],
             "patterns": PATTERNS, "avoid_warnings": VOCAB["warning"], "exclude_shows": SHOWS, "formats": FORMATS,
             "only_shows": SHOWS, "prefer_shows": SHOWS}
    given = {"situations": situations, "conflicts": conflicts, "emotions": emotions, "patterns": patterns,
             "avoid_warnings": avoid_warnings, "exclude_shows": exclude_shows, "formats": formats,
             "only_shows": only_shows, "prefer_shows": prefer_shows}
    unknown = [f"{k}: {x}" for k, xs in given.items() for x in xs if x not in known[k]]
    avoid, max_i = set(avoid_warnings), INTENSITY.index(max_intensity if max_intensity in INTENSITY else "heavy")

    def allowed(aid):
        a, show = NODES[aid], NODES[NODES[aid]["show"]]
        return (_slug(a["show"]) not in exclude_shows and (not formats or show["format"] in formats)
                and (not only_shows or _slug(a["show"]) in only_shows)
                and INTENSITY.index(a["intensity"]) <= max_i and not _all_arc_warnings(aid) & avoid)

    scores = score_arcs(set(situations), set(conflicts), set(emotions), set(patterns))
    for aid in scores:  # e.g. "just need to laugh" prefers comedies: a boost, not a filter
        if _slug(NODES[aid]["show"]) in prefer_shows:
            scores[aid] += 3
    picked, shows = [], set()
    for aid, sc in sorted(scores.items(), key=lambda kv: -kv[1]):
        if NODES[aid]["show"] not in shows and allowed(aid):
            picked.append({**_summary(aid), "score": round(sc, 1)})
            shows.add(NODES[aid]["show"])
        if len(picked) == top:
            break
    # "different world, same vibe": one RESONATES_WITH link from each of the top 3, into an unused show
    wildcards = []
    for p in picked[:3]:
        for e in OUT[p["arc_id"]]:
            t = e["target"]
            if e["type"] == "RESONATES_WITH" and NODES[t]["show"] not in shows and allowed(t):
                wildcards.append({**_summary(t), "resonates_with": p["arc_id"], "bridge": e["props"].get("bridge", "")})
                shows.add(NODES[t]["show"])
                break
    return {"candidates": picked, "wildcards": wildcards, "unknown_terms": unknown, "moved_terms": moved}


def get_character_cards(arc_ids):
    cards = []
    for aid in arc_ids[:5]:
        aid = aid if str(aid).startswith("arc:") else f"arc:{aid}"
        a = NODES.get(aid)
        if not a or a["type"] != "arc":
            cards.append({"arc_id": aid, "error": "unknown arc id"})
            continue
        show_w = sorted((e for e in OUT[a["show"]] if e["type"] == "HAS_WARNING"), key=lambda e: -e["props"]["arcs"])
        cards.append({
            **_summary(aid),
            "show_tone": NODES[a["show"]]["tone"],
            **{k: a[k] for k in ("why_relatable", "watch_for", "start_at")},
            "arc_content_notes": _safe_arc_warnings(aid),
            "series_content_notes": [NODES[e["target"]]["label"] for e in show_w[:4]],
        })
    return {"cards": cards}


TOOLS = {"find_matching_characters": find_matching_characters, "get_character_cards": get_character_cards}


def call_tool(name, arguments):
    """Run one tool call as Qwen sends it (arguments = dict or JSON string); errors go back to Qwen."""
    try:
        if isinstance(arguments, str):
            arguments = json.loads(arguments or "{}")
        return TOOLS[name](**arguments)
    except Exception as e:  # let the model fix its own call
        return {"error": f"{type(e).__name__}: {e}"}


def schema():
    arr = lambda items, desc: {"type": "array", "items": {"type": "string", "enum": items}, "description": desc}
    return [
        {"type": "function", "function": {
            "name": "find_matching_characters",
            "description": "Search the knowledge graph for character story arcs that mirror the user's situation. "
                           "Returns ranked spoiler-free candidates (max one per show) and 'different world, same vibe' "
                           "wildcards. Use only vocabulary slugs; misspelled ones come back in unknown_terms.",
            "parameters": {"type": "object", "properties": {
                "situations": arr(VOCAB["situation"], "1-3 real-life situations the user is in."),
                "conflicts": arr(VOCAB["conflict"], "1-2 inner conflicts the user is torn by."),
                "emotions": arr(VOCAB["emotion"], "2-4 emotions the user feels right now."),
                "patterns": arr(PATTERNS, "0-2 story patterns that fit the user's situation. For searching only."),
                "avoid_warnings": arr(VOCAB["warning"], "Content the user does not want to see."),
                "max_intensity": {"type": "string", "enum": INTENSITY,
                                  "description": "Most intense arc allowed. Default heavy (no limit)."},
                "formats": arr(FORMATS, "Only these show formats. Empty = all."),
                "exclude_shows": arr(SHOWS, "Shows to leave out (e.g. already seen, or disliked)."),
                "only_shows": arr(SHOWS, "Recommend only from these shows (e.g. from genre buttons). Empty = all."),
                "top": {"type": "integer", "minimum": 1, "maximum": 10, "description": "Number of candidates, default 6."},
            }, "required": []}}},
        {"type": "function", "function": {
            "name": "get_character_cards",
            "description": "Get the full spoiler-free card (hook, why relatable, watch-for questions, where to start, "
                           "content notes) for the arcs you chose. Write the answer from these cards only.",
            "parameters": {"type": "object", "properties": {
                "arc_ids": {"type": "array", "items": {"type": "string"}, "maxItems": 5,
                            "description": "arc_id values from find_matching_characters."},
            }, "required": ["arc_ids"]}}},
    ]


if __name__ == "__main__":
    if sys.argv[1] == "--write-schema":
        path = os.path.join(HERE, "qwen_tools.json")
        json.dump(schema(), open(path, "w"), indent=1, ensure_ascii=False)
        print("wrote", path)
    else:
        print(json.dumps(call_tool(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "{}"), indent=1, ensure_ascii=False))

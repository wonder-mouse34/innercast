"""End-to-end demo of the app's two LLM steps, on qwen_server/graph.json.

--select  : what the CHOOSING LLM sees (top candidates, INCLUDING spoilers) + wildcards
--present : what the PRESENTING LLM sees for the chosen arcs (spoilers stripped,
            only show-level content notes, no spoiler-flagged edges)

Usage:
  python3 demo_pipeline.py --select --situations a,b --conflicts c --emotions d,e
  python3 demo_pipeline.py --present arc:the_office/michael_scott/1,arc:naruto/gaara/2
"""
import argparse
import json

from query_demo import load, score_arcs


def warnings_of(nodes, out, node_id, include_spoiler):
    return [nodes[e["target"]]["label"] for e in out[node_id]
            if e["type"] == "HAS_WARNING" and (include_spoiler or not e.get("props", {}).get("spoiler"))]


def select(nodes, out, situations, conflicts, emotions, top, patterns=frozenset()):
    scores = score_arcs(nodes, out, situations, conflicts, emotions, patterns)
    per_show, picked = {}, []
    for aid, s in sorted(scores.items(), key=lambda kv: -kv[1]):
        show = nodes[aid]["show"]
        if per_show.get(show, 0) < 2:  # the chooser sees up to 2 arcs per show
            per_show[show] = per_show.get(show, 0) + 1
            picked.append((aid, s))
        if len(picked) == top:
            break
    for aid, s in picked:
        a = nodes[aid]
        pats = [nodes[e["target"]]["label"] for e in out[aid] if e["type"] == "INSTANCE_OF"]
        print(f"\n## {aid}  (score {s:.1f})")
        print(f"{nodes[a['character']]['name']} — {nodes[a['show']]['name']} [{nodes[a['show']]['format']}, "
              f"{nodes[a['show']]['culture']}]")
        print(f"arc: {a['title']} | patterns: {'; '.join(pats)} | tone: {a['ending_tone']}, {a['intensity']}")
        print(f"arc warnings: {', '.join(warnings_of(nodes, out, aid, True)) or 'none'}")
        print(f"SPOILER summary: {a['spoiler']['summary'][:420]}")
        print(f"SPOILER got right: {a['spoiler']['got_right'][:200]}")
        print(f"SPOILER got wrong: {a['spoiler']['got_wrong'][:200]}")
    # wildcards: cross-show links from the top 3 candidates into shows not already in the list
    shown = {nodes[a]["show"] for a, _ in picked}
    print("\n## WILDCARD candidates (RESONATES_WITH from the top 3)")
    for aid, _ in picked[:3]:
        for e in out[aid]:
            if e["type"] == "RESONATES_WITH" and nodes[e["target"]]["show"] not in shown:
                t = nodes[e["target"]]
                print(f"- {e['target']}: {nodes[t['character']]['name']} — {nodes[t['show']]['name']} "
                      f"[{nodes[t['show']]['format']}] | tone {t['ending_tone']} | bridge: {e['props']['bridge']}")


def present(nodes, out, arc_ids):
    packet = []
    for aid in arc_ids:
        a = {k: v for k, v in nodes[aid].items() if k not in ("spoiler", "example_user_messages")}
        show = nodes[a["show"]]
        show_w = sorted((e for e in out[a["show"]] if e["type"] == "HAS_WARNING"), key=lambda e: -e["props"]["arcs"])
        packet.append({
            "character": nodes[a["character"]]["name"],
            "role": nodes[a["character"]]["role"],
            "show": show["name"], "format": show["format"], "show_tone": show["tone"],
            "series_content_notes": [nodes[e["target"]]["label"] for e in show_w[:4]],
            # arc-level notes that do not give plot away (death/betrayal/bleak-ending ones are spoiler-flagged)
            "arc_content_notes": warnings_of(nodes, out, aid, False),
            **{k: a[k] for k in ("title", "hook", "why_relatable", "watch_for", "start_at", "ending_tone", "intensity")},
        })
    print(json.dumps(packet, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--select", action="store_true")
    ap.add_argument("--present", default="")
    ap.add_argument("--situations", default="")
    ap.add_argument("--conflicts", default="")
    ap.add_argument("--emotions", default="")
    ap.add_argument("--patterns", default="", help="pattern slugs, without the pattern: prefix")
    ap.add_argument("--top", type=int, default=10)
    args = ap.parse_args()
    split = lambda s: {x.strip() for x in s.split(",") if x.strip()}
    nodes, out = load()
    if args.select:
        select(nodes, out, split(args.situations), split(args.conflicts), split(args.emotions), args.top,
               split(args.patterns))
    if args.present:
        present(nodes, out, [x.strip() for x in args.present.split(",")])

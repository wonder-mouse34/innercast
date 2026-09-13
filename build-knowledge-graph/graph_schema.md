# InnerCast — knowledge graph format

One bundled JSON file: `qwen_server/graph.json`. Every node has `id` + `type`; every edge has
`source`, `target`, `type` and optional `props`.

```json
{
  "meta": {"version": "0.1", "generated": "2026-09-12", "counts": {"nodes": 0, "edges": 0}},
  "nodes": [ {"id": "arc:avatar/zuko/2", "type": "arc", "...": "..."} ],
  "edges": [ {"source": "arc:avatar/zuko/2", "target": "conflict:belonging_vs_integrity", "type": "FACES"} ]
}
```

## Node types

| type | id pattern | fields |
|---|---|---|
| `show` | `show:<slug>` | `name`, `format` (live-action / animated / anime), `genres[]`, `setting`, `culture`, `era`, `tone`, `seasons` |
| `character` | `char:<show>/<slug>` | `name`, `show`, `role` (spoiler-safe one-liner) |
| `arc` | `arc:<show>/<char>/<n>` (neutral number — ids never describe the plot) | see below |
| `pattern` | `pattern:<slug>` | `label`, `description` — setting-free story pattern, e.g. "outgrowing the role your family assigned you" |
| `emotion` | `emotion:<slug>` | `label` (fixed vocabulary) |
| `conflict` | `conflict:<slug>` | `label` (fixed vocabulary, e.g. "belonging vs integrity") |
| `situation` | `situation:<slug>` | `label` (real-life situation, e.g. "becoming a manager") |
| `warning` | `warning:<slug>` | `label` (content warning, e.g. "death of a main character") |

### Arc node fields

Everything outside `spoiler` is safe to show the user. **`spoiler` must never be passed to the
LLM step that writes the user-facing answer** — only to the step that chooses characters.

| field | meaning |
|---|---|
| `title` | spoiler-safe arc name, e.g. "Chasing a father's approval" |
| `character`, `show` | ids |
| `pattern_text` | setting-free description (no names, places, era, tech) — the main text for matching |
| `hook` | the character's situation at the *start* of the arc |
| `why_relatable` | the questions they face (never the answers) |
| `watch_for` | 2–3 open questions to notice while watching |
| `start_at` / `span` | where to start watching (e.g. "S1E1"), which seasons the arc covers |
| `ending_tone` | `hopeful` / `bittersweet` / `tragic` / `ambiguous` |
| `intensity` | `light` / `moderate` / `heavy` |
| `example_user_messages` | 3–5 first-person messages a user in this situation might write |
| `spoiler.summary` | full arc summary incl. outcome |
| `spoiler.key_events` | reveals, deaths, betrayals — used to check the answer for leaks |
| `spoiler.got_right` / `spoiler.got_wrong` | what the character gets right and wrong |

## Edge types

| type | from → to | props |
|---|---|---|
| `IN_SHOW` | character → show | |
| `HAS_ARC` | character → arc | |
| `INSTANCE_OF` | arc → pattern | |
| `BROADER` | pattern → pattern | (child → more abstract parent) |
| `ABOUT` | arc → situation | `weight` 0–1 |
| `FACES` | arc → conflict | |
| `FEELS` | arc → emotion | `phase`: `start` / `middle` / `end` |
| `HAS_WARNING` | arc → warning | |
| `RELATES_TO` | character → character | `relation` (mentor, parent, rival, partner, friend…) |
| `RESONATES_WITH` | arc → arc | `bridge`: why two arcs from different worlds share a vibe |

### Spoiler flags on edges

- Edges with `props.spoiler: true` can reveal plot and must be hidden from the answer-writing LLM:
  - every `RELATES_TO` except `parent` / `child` / `sibling` (e.g. "partner", "enemy", "boss" can give away endings)
  - arc-level `HAS_WARNING` for `death_of_main_character`, `death_of_loved_one`, `betrayal`, `bleak_ending`
- Show-level `HAS_WARNING` edges (show → warning, `props.arcs` = how many arcs carry it) are the
  spoiler-safe way to warn users: "this series includes: grief, war and violence…".

## How the app uses it

1. LLM maps the user's message to `situation`, `emotion`, `conflict` and `pattern` nodes.
2. Candidate arcs = arcs connected to those nodes (more shared nodes = better). One extra
   `BROADER` hop, or a `RESONATES_WITH` edge, gives the "different world, same vibe" wildcard.
3. The choosing LLM sees the full arc nodes (incl. `spoiler`) and picks 3–5 arcs, max one per show.
4. The answering LLM gets the chosen arcs **with `spoiler` removed**, plus `HAS_WARNING` labels and
   `ending_tone`, and writes the spoiler-free recommendation with disclaimers.

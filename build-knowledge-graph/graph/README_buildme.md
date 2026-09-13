# InnerCast — graph hand-off for build.me

Ship **one file**: `graph.json` (≈3.6 MB, 12k edges — under the 20k-edge guideline).
Validate at startup with `graph.schema.ts` (zod): `GraphSchema.parse(graphJson)`.

## What's inside
- 28 shows · 237 characters · 489 story arcs · 75 story patterns under 13 themes
  (live-action, animated and anime; US, UK, Canada, Japan, South Korea, Spain, Germany, France;
  medieval to far future)
- Fixed vocabularies as nodes: 36 life situations, 15 inner conflicts, 36 emotions, 16 content warnings
- `RESONATES_WITH` edges link arcs from *different* shows that share the same emotional knot,
  each with a spoiler-free `bridge` sentence ("different world, same vibe")

## Load into adjacency maps
```ts
const byId = new Map(graph.nodes.map(n => [n.id, n]));
const out = new Map<string, Edge[]>();
for (const e of graph.edges) (out.get(e.source) ?? out.set(e.source, []).get(e.source)!).push(e);
```

## Query recipe (what the app's LLM does)
1. **Interpret** — give the LLM the user's message + the vocabulary labels (situation / conflict /
   emotion / pattern nodes) and ask for the matching ids, plus what the user wants to feel
   (hope? permission to grieve?) and anything they want to avoid (content warnings).
2. **Score candidates** — for each arc: +2×weight per matching `ABOUT` situation, +2 per matching
   `FACES` conflict, +1.5 per matching `FEELS` emotion with `phase:"start"` (the user is at the start
   of their own arc), +2 per shared `INSTANCE_OF` pattern. Drop arcs with an unwanted warning.
3. **Diversify** — max one arc per show. Add one **wildcard**: follow `RESONATES_WITH` from the top
   arc (or go one `BROADER` hop up the pattern tree and back down) into a show not yet used.
4. **Choose** (LLM call #1, may see spoilers) — pass the top ~15 arc nodes *including* `spoiler`
   and let the LLM pick 3–5, deciding which journeys genuinely help. Ask it to output only arc ids
   plus a reason phrased in pattern/emotion terms.
5. **Present** (LLM call #2, must NOT see spoilers) — pass only:
   - arc fields **without `spoiler`** (use `safeArc()` from `graph.schema.ts`)
   - character `name`, `role`; show `name`, `format`, `tone`
   - show-level `HAS_WARNING` labels (show → warning edges) and the arc's `ending_tone`
   - never edges with `props.spoiler === true`
   It writes: who to watch, why their journey fits, `watch_for` questions, where to start,
   and a gentle content note ("this journey is bittersweet; the series includes grief and violence").

## Display tips
- `start_at` is where the arc *begins*, not where to start watching. Say "her journey begins in
  season 12 — best watched from the start" unless the show is episodic (Friends, Brooklyn Nine-Nine) where
  jumping in is fine.
- For content notes, sort show-level `HAS_WARNING` edges by `props.arcs` (descending) and show the
  top 3–4 — that reflects what the series is really like, instead of an alphabetical list.
- `ending_tone` (hopeful / bittersweet / tragic / ambiguous) is the spoiler-free way to set
  expectations: "this is a bittersweet journey".

## Spoiler firewall (important)
- `arc.spoiler.*` → only for step 4. Never shown, never given to step 5.
- Edges with `props.spoiler: true` (romantic/enemy/boss relations, arc-level death/betrayal warnings)
  → hide from step 5.
- Arc ids are neutral numbers (`arc:naruto/itachi_uchiha/1`) so logs/UI can't leak plot.
- Optional final check: make sure the step-5 answer mentions none of the chosen arcs'
  `spoiler.key_events`.

## Safety
If the user's message suggests crisis or self-harm, skip recommendations and show support resources.
Keep the disclaimer visible: entertainment and reflection, not mental-health treatment.

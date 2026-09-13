# Task: link the new shows' arcs to arcs in other shows (RESONATES_WITH)

Context: InnerCast deliberately surfaces surprising matches across different settings,
cultures and genres ("different world, same knot"). 593 links already exist between the first 20 shows (`resonances.json` and
`resonances_extra.json` — do not edit them). 10 more shows were just added (round 3).

Files (all in graph/):

- `arc_index_new_round3.txt` — the NEW arcs (one per line:
  `arc_id | character | pattern_label | pattern_text | conflicts | situations | tone`). Read all of it.
- `arc_index.txt` — ALL arcs, old and new. Read all of it: links can go to any show.
- `shows.json` — setting/format/culture of each show, to pick cross-setting pairs.

What to do:
For EVERY new arc, pick 2–3 arcs from OTHER shows (old or new) that share its deep emotional pattern —
the same inner struggle and emotional movement — even if the surface looks different. Prefer pairs
across very different settings, formats and cultures (e.g. Korean thriller ↔ Japanese anime,
Canadian sitcom ↔ medieval fantasy, workplace comedy ↔ far-future sci-fi). Don't pair on a shared
surface tag alone; the inner knot must match.

For each pair write a `bridge`: ONE sentence, setting-free and spoiler-free (no names, places, genre
words, and never how either arc ends), naming the shared knot.

Output: write `graph/resonances_extra_round3.json` — a JSON list of
`{"source": "<new arc id>", "target": "<arc id from another show>", "bridge": "..."}`, full ids exactly
as in arc_index.txt. Undirected: each pair once; don't repeat pairs already in resonances.json or resonances_extra.json.

Validate and fix until it prints OK:

```
cd graph && python3 validate_resonances_extra.py resonances_extra_round3.json arc_index_new_round3.txt
```

Report: number of pairs, coverage per new arc (min/median), how many pairs go to the original 7 shows
vs. other new shows, and 3 of the most surprising cross-culture bridges.

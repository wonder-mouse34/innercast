# Task: add the new shows' arcs to the story-pattern hierarchy

Context: InnerCast matches a user's life situation to fictional characters whose arcs
share the same emotional core, across very different settings. Arcs are grouped into setting-free
story PATTERNS under broad THEMES. The hierarchy already covers 391 arcs from 20 shows; 10 more shows
were just added (round 3).

Files (all in graph/):
- `arc_index_new_round3.txt` — the NEW arcs to place (one per line:
  `arc_id | character | pattern_label | pattern_text | conflicts | situations | tone`). Read all of it.
- `arc_index.txt` — ALL arcs (old + new), for context.
- `build_patterns.py` — the source of truth: THEMES (13), PATTERNS (70) and ASSIGN
  (`"<show>/<char>/<arc>": ["pattern_slug", ...]`, keys are the arc id WITHOUT the `arc:` prefix).

What to do — edit `build_patterns.py` only:
1. For every new arc add an ASSIGN entry with 1–2 EXISTING pattern slugs (primary first). Reuse existing
   patterns wherever the emotional core genuinely fits — that is what makes cross-show matches work.
2. Only if a new arc truly fits nothing, add a new PATTERN `(slug, label, description, [theme slugs])`
   under 1–2 existing themes. New patterns must be setting-free (no names, places, era, technology,
   magic, species, setting-specific jobs, genre words), spoiler-safe (the struggle, not the outcome),
   and must end up with arcs from AT LEAST 2 different shows (you may add a new pattern as a secondary
   pattern to a fitting OLD arc to achieve this). Keep new patterns to a minimum (aim ≤ 8).
3. Do not remove or change existing assignments except to add a secondary pattern as in step 2.
   Do not rename slugs.

Then run and fix until clean:
```
cd graph && python3 build_patterns.py && python3 validate_patterns.py
```
Report: number of new arcs assigned, new patterns added (labels + which shows they span), and the
5 most interesting cross-show groupings that now include a new show.

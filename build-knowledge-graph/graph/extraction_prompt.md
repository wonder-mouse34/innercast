# Arc extraction instructions (shared by all extraction agents)

You are building part of a knowledge graph for **InnerCast**, an app where a user
describes what they are going through in life and gets recommended a *fictional character whose
journey parallels theirs* — including surprising matches from very different settings and cultures,
as long as the emotional core is similar. The app must present characters **without spoilers**.

## Inputs
- Cleaned wiki text per character: `characters/text/<wiki-host>/<file>.txt`
  (long pages: read the whole thing in chunks with offset/limit; the first sections and season-by-season
  history matter most). Combine it with your own knowledge of the show, but never invent episodes or events.
- Fixed vocabularies: `graph/vocabularies.json`. Every value of
  `situations[].id`, `conflicts`, `emotions`, `warnings`, `ending_tone`, `intensity`, `relations[].relation`
  MUST come from these lists.

## What to extract
For each character, 1–3 **arcs**. An arc is one distinct, life-relevant transition (e.g. "exile trying to
earn a parent's love → choosing his own path"). Prefer arcs that map to real-life situations: career,
leadership, family, love, loss, identity, belonging, confidence, starting over, redemption, addiction.
Villains/antiheroes are fine — frame the arc as the human struggle a viewer could recognise in themselves.

## Output
Write ONE JSON file (path given in your task) with this exact shape, then validate it (see bottom):

```json
{
  "show": "<show id>",
  "characters": [
    {
      "id": "char:<show id>/<character slug>",
      "name": "Display name",
      "role": "Spoiler-safe one-liner of who they are at the start of the show",
      "relations": [ {"target": "char:<show id>/<other slug>", "relation": "mentor"} ],
      "arcs": [
        {
          "id": "arc:<show id>/<character slug>/<arc slug>",
          "title": "Spoiler-safe arc name, e.g. 'Chasing a father's approval'",
          "literal_situation": "Spoiler-safe: the situation in the show's own terms, at the start of the arc",
          "pattern_label": "3-8 word setting-free story pattern, e.g. 'outgrowing the role your family assigned you'",
          "pattern_text": "2-3 sentences. Setting-free (see rules). The main text used for matching.",
          "hook": "Spoiler-safe: where the character stands when the arc begins",
          "why_relatable": "Spoiler-safe: the questions and tensions they face (never the answers they find)",
          "watch_for": ["2-3 open questions for the viewer to notice while watching"],
          "start_at": "S1E1",
          "span": "S1-S3",
          "situations": [ {"id": "starting_over", "weight": 0.9} ],
          "conflicts": ["belonging_vs_integrity"],
          "emotions": {"start": ["shame", "anger"], "middle": ["confusion"], "end": ["self_respect"]},
          "ending_tone": "hopeful",
          "intensity": "moderate",
          "warnings": ["abuse"],
          "example_user_messages": ["3-5 first-person messages a real person in this situation might type, in everyday language, no show references"],
          "spoiler": {
            "summary": "Full arc summary including how it ends",
            "key_events": ["Reveals, deaths, betrayals, twists, who they end up with — short phrases"],
            "got_right": "What the character gets right",
            "got_wrong": "What the character gets wrong"
          }
        }
      ]
    }
  ]
}
```

## Rules
1. **Spoiler-safe fields** (`role`, `title`, `literal_situation`, `hook`, `why_relatable`, `watch_for`):
   only what is true at the arc's `start_at` point (plus general premise). Never mention deaths, who
   they end up with, betrayals, identity reveals, what they become, or how the arc resolves. `watch_for`
   must be questions, not hints ("Notice how she reacts when a friend pushes back" — not "notice how she
   finally forgives him").
   **Assume the user watches from the very first episode, even when your arc starts late.** For an arc
   that begins after major events, open with "Later in the series, after a turning point that …" and
   describe the emotional situation WITHOUT naming the event (no deaths, marriages/divorces, breakups,
   who ends up with whom, betrayals, captures/escapes, resurrections, promotions or new titles, identity
   reveals, someone leaving or returning, switching sides). The same applies to `span`: write seasons
   ("S3-S5"), never plot-arc names that reveal events.
   Arc `id` slugs must be neutral too (e.g. `arc:<show>/<char>/finding_her_voice`, never
   `.../the_death_of_x`).
2. **Setting-free fields** (`pattern_label`, `pattern_text`, `example_user_messages`): no character or
   place names, no era, technology, magic, species, jobs specific to the setting (write "a person
   thrust into leadership", not "a Starfleet captain"/"a surgeon"/"a ninja"), no genre words. A reader who
   never saw the show should recognise their own life in it. This is what enables cross-setting matches.
3. `start_at`: episode where the arc begins (`S2E5`; for Star Trek prefix the series: `TNG S3E1`, `DS9 S1E1`,
   `VOY S4E1`, `TOS S1E1`; for Naruto use `Naruto Ep 1` / `Shippuden Ep 1`; for Avatar use `ATLA S1E1` /
   `Korra S1E1`; for Buffy use `BtVS S1E1` / `Angel S1E1`; for Doctor Who use the 2005-revival series number `DW S4E1`; for Breaking Bad use `BB S1E1` / `BCS S1E1` for Better Call Saul; for Money Heist use `Part 1 E1`; all other shows plain `S1E1`). If unsure of the exact episode, give only the season (`S2`).
4. `situations`: 1-4, weight 0-1 for how central. `conflicts`: 1-2. `emotions`: 1-3 per phase.
   `warnings`: everything the viewer will encounter in this arc (empty list if none).
5. `relations` (these are automatically hidden from users, so use the TRUE relation, e.g. `partner`): only to other characters in YOUR list for this show (ids given in your task), using the
   relation vocabulary, from this character's perspective (`"mentor"` = the target is their mentor).
6. Be accurate. It is fine to have 1 arc for a character with one clear journey.

## Validate before finishing
Run this and fix any problems it prints (it must print `OK`):

```
python3 validate_arcs.py <your output file>
```

Then run the spoiler scanner and fix every REAL leak it points to in the user-facing fields
(many hits are harmless premise facts or words like "finally" — use judgement):

```
python3 scan_spoilers.py <your output file>
```

Finish with a 2-line report: number of characters, number of arcs, anything you were unsure about.

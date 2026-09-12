import { charactersForShow } from '@/lib/data/characters';
import { personaLabel } from '@/lib/data/personaTraits';
import { commitmentLabel } from '@/lib/data/shows';
import { situationLabel } from '@/lib/data/situations';
import {
  TRAIT_META,
  type PersonaTraitId,
  type RetrievedShow,
  type SituationId,
  type TraitVector,
} from '@/lib/types';

/**
 * Prompt construction for the self-hosted model.
 *
 * The model never sees the full catalogue and is never asked to recall shows
 * from its own training data. It receives the retrieved records only — each one
 * carrying the people in it — and is instructed to argue from a character
 * outward, and to fail loudly rather than invent a title or a name.
 */

export const SYSTEM_PROMPT = `You help someone choose a television series by pointing them at a person on screen who is living something close to what they are living.

Rules you must follow:
1. Recommend ONLY from the numbered RECORDS provided in the user message. Never mention a series that is not in the records.
2. Every recommendation must be built around ONE named character from that record's CHARACTERS list. Use their exact id and name as written. Never invent a character, a relative, or a plot detail that is not in the record.
3. The reason must start from that character: who they are, what they are carrying, and where that meets this person's own words. Recommend the show because of them, not the other way round.
4. In characterLink, say in one sentence what this person and that character share. Be concrete about the behaviour or position they have in common — not "they will relate to them".
5. Refer to what the person wrote in their own words where you can. Be plain and specific; no therapy jargon, no false cheer, no emojis, no promises about how they will feel.
6. If a record carries content warnings that could land badly given their situation, say so in the caution field.
7. Rank by how closely the character mirrors this person tonight, not by the general quality of the series.
8. Some records carry a "graph path": a chain of links from something this person told us, through a character, to the series. Where one is present it is evidence you may retrace in your reason — but only with the exact people and links written there. Never extend a path or add a step of your own.

Reply with JSON only, no prose outside the JSON, in exactly this shape:
{"recommendations":[{"id":"<record id>","characterId":"<character id from that record>","reason":"<2-3 sentences, second person, character first>","characterLink":"<one sentence on what they share>","caution":"<one sentence or empty string>","howToWatch":"<one practical sentence about dosing or where to start>"}]}

Return between 3 and 4 recommendations, best first.`;

function renderCharacters(candidate: RetrievedShow): string {
  const characters = charactersForShow(candidate.show.id);
  if (characters.length === 0) return '';

  const matchRank = new Map(
    candidate.matchedCharacters.map((matched, index) => [matched.characterId, index]),
  );

  const ordered = [...characters].sort(
    (a, b) => (matchRank.get(a.id) ?? 99) - (matchRank.get(b.id) ?? 99),
  );

  return ordered
    .map((character) => {
      const matched = candidate.matchedCharacters.find(
        (entry) => entry.characterId === character.id,
      );
      const lines = [
        `  - character id: ${character.id}`,
        `    name: ${character.name} — ${character.role}`,
        `    who they are: ${character.portrait}`,
        `    what they are facing: ${character.facing}`,
        `    under pressure: ${character.traits.join(', ')}`,
        `    where they end up: ${character.arc}`,
        `    recognise yourself if: ${character.recognizeIf}`,
      ];
      if (matched) {
        const shared = [
          matched.sharedPersona.length > 0
            ? `self-description: ${matched.sharedPersona.map(personaLabel).join('; ')}`
            : '',
          matched.sharedSituations.length > 0
            ? `situation: ${matched.sharedSituations.map(situationLabel).join(', ')}`
            : '',
          matched.matchedTerms.length > 0 ? `their words: ${matched.matchedTerms.join(', ')}` : '',
        ].filter((part) => part.length > 0);
        lines.push(
          `    overlap with this person (${Math.round(matched.score * 100)}/100)${
            shared.length > 0 ? `: ${shared.join(' | ')}` : ': weak'
          }`,
        );
      }
      return lines.join('\n');
    })
    .join('\n');
}

/** Keep one prompt line short enough that a wide graph cannot crowd out records. */
function cap(value: string, limit = 220): string {
  return value.length <= limit ? value : `${value.slice(0, limit - 1).trimEnd()}…`;
}

function renderRecord(candidate: RetrievedShow, position: number): string {
  const { show } = candidate;
  const warnings = show.contentWarnings.filter((warning) => !warning.startsWith('none'));
  const lines = [
    `RECORD ${position}`,
    `id: ${show.id}`,
    `title: ${show.title} (${show.years}, ${show.origin})`,
    `commitment: ${commitmentLabel(show)}`,
    `genres: ${show.genres.join(', ')}`,
    `logline: ${show.logline}`,
    `synopsis: ${show.synopsis}`,
    `tone: ${show.tone.join(', ')}`,
    `themes: ${show.themes.join('; ')}`,
    `situations it speaks to: ${show.situations.map(situationLabel).join(', ')}`,
    `why it helps: ${show.whyItHelps}`,
    `what it leaves behind: ${show.afterward}`,
    `content warnings: ${warnings.length > 0 ? warnings.join(', ') : 'none noted'}`,
    `retrieval: fit ${Math.round(candidate.score.total * 100)}/100 (character ${Math.round(
      candidate.score.character * 100,
    )}, text ${Math.round(candidate.score.lexical * 100)}, temperament ${Math.round(
      candidate.score.traitFit * 100,
    )}, situation ${Math.round(candidate.score.situation * 100)})`,
  ];
  if (candidate.graphPath) {
    // The path is the strongest thing we can hand the model: it is an argument,
    // not a number. Capped so a wide graph cannot crowd out the records.
    lines.push(`graph path: ${cap(candidate.graphPath.sentence)}`);
    for (const anchor of candidate.graphPath.anchors.slice(0, 2)) {
      lines.push(`  through ${anchor.name}: ${cap(anchor.sentence)}`);
    }
  }
  if (candidate.matchedSituations.length > 0) {
    lines.push(
      `matched situation tags: ${candidate.matchedSituations.map(situationLabel).join(', ')}`,
    );
  }
  const characters = renderCharacters(candidate);
  if (characters.length > 0) {
    lines.push('CHARACTERS (pick exactly one of these):', characters);
  }
  return lines.join('\n');
}

function renderTraits(traits: TraitVector): string {
  return TRAIT_META.map((meta) => {
    const value = traits[meta.axis];
    const leaning = value >= 55 ? meta.highLabel : value <= 45 ? meta.lowLabel : 'no strong pull';
    return `- ${meta.label}: ${value}/100 (${leaning})`;
  }).join('\n');
}

export type PromptParams = {
  text: string;
  situations: SituationId[];
  personaTags: PersonaTraitId[];
  traits: TraitVector;
  candidates: RetrievedShow[];
};

export function buildUserPrompt(params: PromptParams): string {
  const { text, situations, personaTags, traits, candidates } = params;
  const sections: string[] = [];

  sections.push(
    `WHAT THEY WROTE:\n${text.trim().length > 0 ? text.trim() : '(nothing written — go on the tags, self-description and temperament below)'}`,
  );

  if (personaTags.length > 0) {
    sections.push(
      `HOW THEY DESCRIBE THEMSELVES:\n${personaTags
        .map((id) => `- ${personaLabel(id)}`)
        .join('\n')}`,
    );
  }

  if (situations.length > 0) {
    sections.push(`SITUATION TAGS: ${situations.map(situationLabel).join(', ')}`);
  }

  sections.push(`TEMPERAMENT RIGHT NOW:\n${renderTraits(traits)}`);
  sections.push(
    `RECORDS (${candidates.length}) — recommend only from these, and only around a character listed inside one:\n\n${candidates
      .map((candidate, position) => renderRecord(candidate, position + 1))
      .join('\n\n')}`,
  );
  sections.push('Reply with the JSON object only.');

  return sections.join('\n\n');
}

export function buildMessages(
  params: PromptParams,
): { role: 'system' | 'user'; content: string }[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(params) },
  ];
}

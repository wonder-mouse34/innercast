import { commitmentLabel } from '@/lib/data/shows';
import { situationLabel } from '@/lib/data/situations';
import { TRAIT_META, type RetrievedShow, type SituationId, type TraitVector } from '@/lib/types';

/**
 * Prompt construction for the self-hosted model.
 *
 * The model never sees the full catalogue and is never asked to recall shows
 * from its own training data. It receives the retrieved records only, and is
 * instructed to fail loudly rather than invent a title.
 */

export const SYSTEM_PROMPT = `You help someone choose a television series that fits what they are living through right now.

Rules you must follow:
1. Recommend ONLY from the numbered RECORDS provided in the user message. Never mention a series that is not in the records.
2. Use the record's own facts. Do not add plot details, cast, awards or platforms that are not written there.
3. Refer to their situation in their own words where you can. Be plain and specific; no therapy jargon, no false cheer, no emojis.
4. If a record carries content warnings that could land badly given their situation, say so in the caution field.
5. Rank by usefulness to this person tonight, not by general quality.

Reply with JSON only, no prose outside the JSON, in exactly this shape:
{"recommendations":[{"id":"<record id>","reason":"<2-3 sentences, second person>","caution":"<one sentence or empty string>","howToWatch":"<one practical sentence about dosing or where to start>"}]}

Return between 3 and 4 recommendations, best first.`;

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
    `retrieval: fit ${Math.round(candidate.score.total * 100)}/100 (text ${Math.round(
      candidate.score.lexical * 100,
    )}, temperament ${Math.round(candidate.score.traitFit * 100)}, situation ${Math.round(
      candidate.score.situation * 100,
    )})`,
  ];
  if (candidate.matchedSituations.length > 0) {
    lines.push(
      `matched situation tags: ${candidate.matchedSituations.map(situationLabel).join(', ')}`,
    );
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

export function buildUserPrompt(params: {
  text: string;
  situations: SituationId[];
  traits: TraitVector;
  candidates: RetrievedShow[];
}): string {
  const { text, situations, traits, candidates } = params;
  const sections: string[] = [];

  sections.push(
    `WHAT THEY WROTE:\n${text.trim().length > 0 ? text.trim() : '(nothing written — go on the tags and temperament below)'}`,
  );

  if (situations.length > 0) {
    sections.push(`SITUATION TAGS: ${situations.map(situationLabel).join(', ')}`);
  }

  sections.push(`TEMPERAMENT RIGHT NOW:\n${renderTraits(traits)}`);
  sections.push(
    `RECORDS (${candidates.length}) — recommend only from these:\n\n${candidates
      .map((candidate, position) => renderRecord(candidate, position + 1))
      .join('\n\n')}`,
  );
  sections.push('Reply with the JSON object only.');

  return sections.join('\n\n');
}

export function buildMessages(params: {
  text: string;
  situations: SituationId[];
  traits: TraitVector;
  candidates: RetrievedShow[];
}): { role: 'system' | 'user'; content: string }[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(params) },
  ];
}

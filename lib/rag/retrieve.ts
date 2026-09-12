import { SHOWS } from '@/lib/data/shows';
import { SITUATION_BY_ID } from '@/lib/data/situations';
import { excerpt, scoreChunks } from '@/lib/rag/chunkIndex';
import { detectSituations, stem, tokenize, tokenizeQuery } from '@/lib/rag/tokenize';
import type { SituationHit } from '@/lib/rag/tokenize';
import {
  TRAIT_META,
  type ChunkKind,
  type RetrievedShow,
  type Show,
  type SituationId,
  type TraitAxis,
  type TraitVector,
} from '@/lib/types';

export type RetrievalRequest = {
  text: string;
  selectedSituations: SituationId[];
  traits: TraitVector;
  avoidTopics?: string[];
  limit?: number;
};

export type RetrievalResult = {
  candidates: RetrievedShow[];
  detectedSituations: SituationHit[];
  activeSituations: SituationId[];
  queryTokens: string[];
  /** Shows removed because of the person's avoid list. */
  filteredOut: { showId: string; reason: string }[];
};

const TOTAL_TRAIT_WEIGHT = TRAIT_META.reduce((sum, meta) => sum + meta.weight, 0);

/**
 * Distance between what the person asked for and what the show is.
 * Axes flagged `ceiling` (intensity, catharsis) punish overshoot harder than
 * undershoot: a show heavier than someone can hold is a worse error than a
 * show that is lighter than they wanted.
 */
export function traitFit(traits: TraitVector, show: Show): number {
  let penalty = 0;
  for (const meta of TRAIT_META) {
    const wanted = traits[meta.axis];
    const actual = show.traits[meta.axis];
    const delta = actual - wanted;
    const magnitude = Math.abs(delta) / 100;
    const overshoot = meta.ceiling && delta > 0 ? 1.6 : 1;
    penalty += meta.weight * magnitude * overshoot;
  }
  return Math.max(0, 1 - penalty / TOTAL_TRAIT_WEIGHT);
}

function axisAlignment(
  traits: TraitVector,
  show: Show,
): { aligned: TraitAxis[]; strained: TraitAxis[] } {
  const aligned: TraitAxis[] = [];
  const strained: TraitAxis[] = [];
  for (const meta of TRAIT_META) {
    const delta = show.traits[meta.axis] - traits[meta.axis];
    if (Math.abs(delta) <= 14) {
      aligned.push(meta.axis);
    } else if (meta.ceiling && delta > 20) {
      strained.push(meta.axis);
    } else if (!meta.ceiling && Math.abs(delta) > 35) {
      strained.push(meta.axis);
    }
  }
  return { aligned, strained };
}

/**
 * A topic the person asked to steer around counts as a hit when the show's
 * warnings or themes carry any of its meaningful words. Requiring every word to
 * match let phrases like "suicide and violence" slip past a show warned only
 * for suicide, which is the failure that actually hurts someone.
 */
function avoidHit(show: Show, avoidTopics: string[]): string | null {
  if (avoidTopics.length === 0) return null;
  const warningTokens = new Set(tokenize(show.contentWarnings.join(' ')));
  const themeTokens = new Set(tokenize(show.themes.join(' ')));
  for (const topic of avoidTopics) {
    const tokens = tokenize(topic);
    if (tokens.length === 0) continue;
    const isHit = tokens.some((token) => warningTokens.has(token) || themeTokens.has(token));
    if (isHit) return topic;
  }
  return null;
}

/**
 * Hybrid retrieval: BM25 over the chunked corpus, trait-vector similarity, and
 * situation-tag overlap. Weights shift toward traits and tags when the person
 * wrote very little.
 */
export function retrieve(request: RetrievalRequest): RetrievalResult {
  const { text, selectedSituations, traits, avoidTopics = [], limit = 8 } = request;

  const detectedSituations = detectSituations(text);
  const activeSituations = [
    ...new Set<SituationId>([...selectedSituations, ...detectedSituations.map((hit) => hit.id)]),
  ];

  const situationQueryText = activeSituations
    .map((id) => {
      const situation = SITUATION_BY_ID[id];
      return situation
        ? `${situation.label} ${situation.blurb} ${situation.keywords.join(' ')}`
        : '';
    })
    .join(' ');

  const freeTextTokens = tokenizeQuery(text);
  const queryTokens = [...new Set([...freeTextTokens, ...tokenize(situationQueryText)])];

  const chunkScores = scoreChunks(queryTokens);
  const maxChunkScore = chunkScores[0]?.score ?? 0;

  const perShow = new Map<
    string,
    {
      lexical: number;
      chunks: { kind: ChunkKind; score: number; excerpt: string }[];
      terms: Set<string>;
    }
  >();

  for (const scored of chunkScores) {
    const entry = perShow.get(scored.chunk.showId) ?? {
      lexical: 0,
      chunks: [],
      terms: new Set<string>(),
    };
    // Best chunk dominates; additional chunks contribute a fraction.
    entry.lexical = Math.max(entry.lexical, scored.score) + scored.score * 0.18;
    entry.chunks.push({
      kind: scored.chunk.kind,
      score: scored.score,
      excerpt: excerpt(scored.chunk.text),
    });
    for (const term of scored.matchedTerms) entry.terms.add(term);
    perShow.set(scored.chunk.showId, entry);
  }

  // Little or no text: lean on the sliders and chips instead of lexical noise.
  const textWeightFactor = Math.min(1, freeTextTokens.length / 8);
  const lexicalWeight = 0.16 + 0.34 * textWeightFactor;
  const situationWeight = activeSituations.length > 0 ? 0.26 : 0;
  const traitWeight = 1 - lexicalWeight - situationWeight;

  const filteredOut: { showId: string; reason: string }[] = [];
  const candidates: RetrievedShow[] = [];

  for (const show of SHOWS) {
    const avoided = avoidHit(show, avoidTopics);
    if (avoided) {
      filteredOut.push({ showId: show.id, reason: avoided });
      continue;
    }

    const entry = perShow.get(show.id);
    const lexical = maxChunkScore > 0 ? Math.min(1, (entry?.lexical ?? 0) / maxChunkScore) : 0;

    const matchedSituations = show.situations.filter((id) => activeSituations.includes(id));
    const situationScore =
      activeSituations.length === 0
        ? 0
        : Math.min(1, matchedSituations.length / Math.min(3, activeSituations.length));

    const fit = traitFit(traits, show);
    const total = lexical * lexicalWeight + fit * traitWeight + situationScore * situationWeight;
    const { aligned, strained } = axisAlignment(traits, show);

    candidates.push({
      show,
      score: { lexical, traitFit: fit, situation: situationScore, total },
      matchedChunks: (entry?.chunks ?? []).sort((a, b) => b.score - a.score).slice(0, 2),
      matchedTerms: [...(entry?.terms ?? [])].slice(0, 12),
      matchedSituations,
      alignedAxes: aligned,
      strainedAxes: strained,
    });
  }

  candidates.sort((a, b) => b.score.total - a.score.total);

  return {
    candidates: candidates.slice(0, limit),
    detectedSituations,
    activeSituations,
    queryTokens,
    filteredOut,
  };
}

/** Which query terms actually landed in a show's record — used in the trace UI. */
export function highlightTerms(terms: string[], text: string): string[] {
  const tokens = new Set(tokenize(text).map(stem));
  return terms.filter((term) => tokens.has(stem(term)));
}

export function axisSummary(axis: TraitAxis, value: number): string {
  const meta = TRAIT_META.find((entry) => entry.axis === axis);
  if (!meta) return axis;
  if (value >= 55) return meta.highLabel.toLowerCase();
  if (value <= 45) return meta.lowLabel.toLowerCase();
  return `balanced ${meta.label.toLowerCase()}`;
}

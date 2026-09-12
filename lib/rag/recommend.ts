import {
  chatCompletion,
  parseModelPayload,
  normalizeBaseUrl,
  type ModelSettings,
} from '@/lib/rag/llmClient';
import { buildMessages } from '@/lib/rag/prompt';
import { retrieve, type RetrievalResult } from '@/lib/rag/retrieve';
import { synthesizeRecommendations } from '@/lib/rag/synthesize';
import { createId } from '@/lib/utils';
import type {
  MatchSession,
  Recommendation,
  RecommendationEngine,
  SituationId,
  TraitVector,
} from '@/lib/types';

export type MatchRequest = {
  text: string;
  selectedSituations: SituationId[];
  traits: TraitVector;
  avoidTopics: string[];
  settings: ModelSettings;
};

export type MatchOutcome = {
  engine: RecommendationEngine;
  /** Plain-language note about why this engine answered. */
  engineNote?: string;
  modelName?: string;
  recommendations: Recommendation[];
  retrieval: RetrievalResult;
};

const MAX_REASON_LENGTH = 520;
/** A single honest sentence is enough; anything shorter is not an explanation. */
const MIN_REASON_LENGTH = 12;

function clean(value: string | null | undefined, limit = MAX_REASON_LENGTH): string {
  if (!value) return '';
  const trimmed = value
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["']|["']$/g, '');
  return trimmed.length > limit ? `${trimmed.slice(0, limit - 1).trimEnd()}…` : trimmed;
}

/**
 * Retrieve first, then reason.
 *
 * The retrieval step always runs and always decides which shows are eligible.
 * The self-hosted model only ranks and explains those records; if it is
 * unreachable, or answers with anything unusable, the on-device writer takes
 * over with the same candidate set.
 */
export async function runMatch(request: MatchRequest): Promise<MatchOutcome> {
  const { text, selectedSituations, traits, avoidTopics, settings } = request;

  const retrieval = retrieve({
    text,
    selectedSituations,
    traits,
    avoidTopics,
    limit: 8,
  });

  if (retrieval.candidates.length === 0) {
    return {
      engine: 'on-device',
      engineNote: 'Nothing in the library cleared your avoid list. Try loosening it.',
      recommendations: [],
      retrieval,
    };
  }

  const fallback = (): MatchOutcome['recommendations'] =>
    synthesizeRecommendations(retrieval.candidates, traits);

  const canCallModel =
    settings.enabled &&
    normalizeBaseUrl(settings.baseUrl).length > 0 &&
    settings.model.trim().length > 0;

  if (!canCallModel) {
    return {
      engine: 'on-device',
      engineNote: settings.enabled
        ? 'No model server configured, so matching ran on this device.'
        : 'Your local model is switched off, so matching ran on this device.',
      recommendations: fallback(),
      retrieval,
    };
  }

  const messages = buildMessages({
    text,
    situations: retrieval.activeSituations,
    traits,
    candidates: retrieval.candidates,
  });

  const result = await chatCompletion(settings, messages);

  if (!result.ok) {
    return {
      engine: 'on-device',
      engineNote: `${result.error} Matching ran on this device instead.`,
      recommendations: fallback(),
      retrieval,
    };
  }

  const parsed = parseModelPayload(result.content);
  if (!parsed) {
    return {
      engine: 'on-device',
      engineNote: 'The model replied in an unexpected format, so matching ran on this device.',
      recommendations: fallback(),
      retrieval,
    };
  }

  const byId = new Map(retrieval.candidates.map((candidate) => [candidate.show.id, candidate]));
  const recommendations: Recommendation[] = [];
  let hallucinated = 0;
  let unusable = 0;

  for (const entry of parsed) {
    const candidate = byId.get(entry.id.trim());
    if (!candidate) {
      hallucinated += 1;
      continue;
    }
    if (recommendations.some((item) => item.showId === candidate.show.id)) continue;
    const reason = clean(entry.reason);
    if (reason.length < MIN_REASON_LENGTH) {
      unusable += 1;
      continue;
    }

    recommendations.push({
      showId: candidate.show.id,
      reason,
      caution: clean(entry.caution, 220) || undefined,
      howToWatch: clean(entry.howToWatch, 220) || undefined,
      fit: Math.round(candidate.score.total * 100),
    });
  }

  // One usable pick is a thin answer; below that the model has told us nothing
  // we can show, so the on-device writer covers the same candidates instead.
  if (recommendations.length < 2) {
    return {
      engine: 'on-device',
      engineNote:
        hallucinated > unusable
          ? 'The model suggested shows outside the library, so matching ran on this device.'
          : 'The model did not explain its picks, so matching ran on this device.',
      recommendations: fallback(),
      retrieval,
    };
  }

  const dropped = hallucinated + unusable;

  return {
    engine: 'local-model',
    engineNote:
      dropped > 0
        ? `${dropped} unusable suggestion${dropped === 1 ? '' : 's'} were dropped.`
        : undefined,
    modelName: result.model ?? settings.model,
    recommendations: recommendations.slice(0, 4),
    retrieval,
  };
}

export function buildSession(request: MatchRequest, outcome: MatchOutcome): MatchSession {
  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    situationText: request.text.trim(),
    selectedSituations: outcome.retrieval.activeSituations,
    traits: request.traits,
    engine: outcome.engine,
    engineNote: outcome.engineNote,
    modelName: outcome.modelName,
    recommendations: outcome.recommendations,
    retrieval: outcome.retrieval.candidates.map((candidate) => ({
      showId: candidate.show.id,
      score: candidate.score,
      matchedTerms: candidate.matchedTerms,
      matchedSituations: candidate.matchedSituations,
      chunkKinds: candidate.matchedChunks.map((chunk) => chunk.kind),
    })),
  };
}

import { charactersForShow } from '@/lib/data/characters';
import { PERSONA_BY_ID } from '@/lib/data/personaTraits';
import { SHOWS } from '@/lib/data/shows';
import { SITUATION_BY_ID } from '@/lib/data/situations';
import { getGraph, graphIsSupplied } from '@/lib/graph/store';
import {
  pathLines,
  pathSentence,
  walkGraph,
  type GraphSeed,
  type GraphWalk,
} from '@/lib/graph/traverse';
import { personaNodeId, situationNodeId } from '@/lib/graph/types';
import { excerpt, scoreChunks } from '@/lib/rag/chunkIndex';
import {
  detectPersonas,
  detectSituations,
  stem,
  tokenize,
  tokenizeQuery,
} from '@/lib/rag/tokenize';
import type { PersonaHit, SituationHit } from '@/lib/rag/tokenize';
import {
  TRAIT_META,
  type Character,
  type ChunkKind,
  type GraphTrace,
  type MatchedCharacter,
  type PersonaTraitId,
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
  /** How the person describes themselves, from onboarding or the You tab. */
  personaTags?: PersonaTraitId[];
  avoidTopics?: string[];
  limit?: number;
};

export type RetrievalResult = {
  candidates: RetrievedShow[];
  detectedSituations: SituationHit[];
  activeSituations: SituationId[];
  /** Self-descriptions read out of the free text. */
  detectedPersonas: PersonaHit[];
  /** Saved plus detected self-descriptions, deduped. */
  activePersonas: PersonaTraitId[];
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
 * How closely one person on screen mirrors the person watching.
 *
 * Three signals: shared self-descriptions (the strongest, because it is a
 * person-to-person claim), shared situations, and the words of their record
 * echoing what the person wrote. Weights collapse onto whatever signal exists.
 */
function scoreCharacter(
  character: Character,
  activePersonas: PersonaTraitId[],
  activeSituations: SituationId[],
  lexical: { score: number; terms: string[] } | undefined,
  maxCharacterChunkScore: number,
): MatchedCharacter {
  const sharedPersona = character.personaTags.filter((tag) => activePersonas.includes(tag));
  const sharedSituations = character.situations.filter((id) => activeSituations.includes(id));

  const personaOverlap =
    activePersonas.length === 0
      ? 0
      : Math.min(1, sharedPersona.length / Math.min(3, activePersonas.length));
  const situationOverlap =
    activeSituations.length === 0
      ? 0
      : Math.min(1, sharedSituations.length / Math.min(2, activeSituations.length));
  const lex =
    maxCharacterChunkScore > 0 ? Math.min(1, (lexical?.score ?? 0) / maxCharacterChunkScore) : 0;

  const personaWeight = activePersonas.length > 0 ? 0.5 : 0;
  const situationWeight = activeSituations.length > 0 ? 0.3 : 0;
  const lexicalWeight = 1 - personaWeight - situationWeight;

  const score =
    personaOverlap * personaWeight + situationOverlap * situationWeight + lex * lexicalWeight;

  return {
    characterId: character.id,
    name: character.name,
    showId: character.showId,
    score,
    sharedPersona,
    sharedSituations,
    matchedTerms: (lexical?.terms ?? []).slice(0, 8),
  };
}

/**
 * Walk the supplied graph outward from this person.
 *
 * Self-descriptions start at full strength and situations slightly below, since
 * "this is who I am" is a steadier signal than "this is what is happening right
 * now". Returns null when no graph is supplied, when the person has told us
 * nothing to start from, or when the walk reached no show — every one of which
 * leaves the rest of retrieval exactly as it was.
 */
function walkForPerson(
  activePersonas: PersonaTraitId[],
  activeSituations: SituationId[],
): GraphWalk | null {
  if (!graphIsSupplied()) return null;
  const seeds: GraphSeed[] = [
    ...activePersonas.map((id) => ({ id: personaNodeId(id), weight: 1 })),
    ...activeSituations.map((id) => ({ id: situationNodeId(id), weight: 0.9 })),
  ];
  if (seeds.length === 0) return null;
  const walk = walkGraph(getGraph(), seeds);
  return walk.shows.length > 0 ? walk : null;
}

/**
 * Hybrid retrieval, led by character. BM25 over the chunked corpus (including
 * one chunk per character), character-to-person overlap, trait-vector
 * similarity, situation-tag overlap, and — when a knowledge graph is supplied —
 * multi-hop reachability through it. The character term carries the most
 * weight whenever the person has told us anything about themselves; it drops
 * out entirely when there is no signal to match a person against.
 */
export function retrieve(request: RetrievalRequest): RetrievalResult {
  const {
    text,
    selectedSituations,
    traits,
    personaTags = [],
    avoidTopics = [],
    limit = 8,
  } = request;

  const detectedSituations = detectSituations(text);
  const activeSituations = [
    ...new Set<SituationId>([...selectedSituations, ...detectedSituations.map((hit) => hit.id)]),
  ];

  const detectedPersonas = detectPersonas(text);
  const activePersonas = [
    ...new Set<PersonaTraitId>([...personaTags, ...detectedPersonas.map((hit) => hit.id)]),
  ];

  const situationQueryText = activeSituations
    .map((id) => {
      const situation = SITUATION_BY_ID[id];
      return situation
        ? `${situation.label} ${situation.blurb} ${situation.keywords.join(' ')}`
        : '';
    })
    .join(' ');

  const personaQueryText = activePersonas
    .map((id) => {
      const trait = PERSONA_BY_ID[id];
      return trait ? `${trait.label} ${trait.blurb} ${trait.keywords.join(' ')}` : '';
    })
    .join(' ');

  const freeTextTokens = tokenizeQuery(text);
  const queryTokens = [
    ...new Set([...freeTextTokens, ...tokenize(situationQueryText), ...tokenize(personaQueryText)]),
  ];

  const chunkScores = scoreChunks(queryTokens);
  const maxChunkScore = chunkScores[0]?.score ?? 0;
  const maxCharacterChunkScore =
    chunkScores.find((scored) => scored.chunk.kind === 'character')?.score ?? 0;

  const perShow = new Map<
    string,
    {
      lexical: number;
      chunks: { kind: ChunkKind; score: number; excerpt: string }[];
      terms: Set<string>;
      characterLexical: Map<string, { score: number; terms: string[] }>;
    }
  >();

  for (const scored of chunkScores) {
    const entry = perShow.get(scored.chunk.showId) ?? {
      lexical: 0,
      chunks: [],
      terms: new Set<string>(),
      characterLexical: new Map<string, { score: number; terms: string[] }>(),
    };
    // Best chunk dominates; additional chunks contribute a fraction.
    entry.lexical = Math.max(entry.lexical, scored.score) + scored.score * 0.18;
    entry.chunks.push({
      kind: scored.chunk.kind,
      score: scored.score,
      excerpt: excerpt(scored.chunk.text),
    });
    for (const term of scored.matchedTerms) entry.terms.add(term);
    if (scored.chunk.characterId) {
      entry.characterLexical.set(scored.chunk.characterId, {
        score: scored.score,
        terms: scored.matchedTerms,
      });
    }
    perShow.set(scored.chunk.showId, entry);
  }

  // Little or no text: lean on the sliders and chips instead of lexical noise.
  const textWeightFactor = Math.min(1, freeTextTokens.length / 8);

  // Character leads whenever there is anything to match a person against.
  const characterWeight =
    activePersonas.length > 0
      ? 0.42
      : freeTextTokens.length >= 4
        ? 0.3
        : activeSituations.length > 0
          ? 0.2
          : 0;
  const rest = 1 - characterWeight;
  const lexicalWeight = (0.16 + 0.34 * textWeightFactor) * rest;
  const situationWeight = (activeSituations.length > 0 ? 0.26 : 0) * rest;
  const traitWeight = rest - lexicalWeight - situationWeight;

  // The graph, when supplied, claims a fixed share and every other term is
  // scaled down proportionally, so their balance is unchanged and the total
  // still comes to 1. With no graph the arithmetic is exactly as before.
  const walk = walkForPerson(activePersonas, activeSituations);
  const graphWeight = walk ? 0.24 : 0;
  const keep = 1 - graphWeight;
  const weights = {
    lexical: lexicalWeight * keep,
    situation: situationWeight * keep,
    trait: traitWeight * keep,
    character: characterWeight * keep,
    graph: graphWeight,
  };

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

    const scoredCharacters = charactersForShow(show.id)
      .map((character) =>
        scoreCharacter(
          character,
          activePersonas,
          activeSituations,
          entry?.characterLexical.get(character.id),
          maxCharacterChunkScore,
        ),
      )
      .sort((a, b) => b.score - a.score);

    // One person carrying the show is the claim; a strong second adds a little.
    const characterScore = Math.min(
      1,
      (scoredCharacters[0]?.score ?? 0) + (scoredCharacters[1]?.score ?? 0) * 0.15,
    );

    const fit = traitFit(traits, show);

    const reach = walk?.showById.get(show.id);
    const graphScore = reach?.score ?? 0;
    const graphPath: GraphTrace | undefined = reach
      ? {
          seedLabel: reach.seedLabel,
          sentence: pathSentence(reach),
          lines: pathLines(reach),
          strength: reach.raw,
          anchors: reach.characters.map((anchor) => ({
            characterId: anchor.characterId,
            name: anchor.label,
            sentence: pathSentence(anchor),
            strength: anchor.strength,
          })),
        }
      : undefined;

    const total =
      lexical * weights.lexical +
      fit * weights.trait +
      situationScore * weights.situation +
      characterScore * weights.character +
      graphScore * weights.graph;
    const { aligned, strained } = axisAlignment(traits, show);

    candidates.push({
      show,
      score: {
        lexical,
        traitFit: fit,
        situation: situationScore,
        character: characterScore,
        graph: graphScore,
        total,
      },
      matchedChunks: (entry?.chunks ?? []).sort((a, b) => b.score - a.score).slice(0, 3),
      matchedTerms: [...(entry?.terms ?? [])].slice(0, 12),
      matchedSituations,
      matchedCharacters: scoredCharacters.filter((character) => character.score > 0).slice(0, 2),
      graphPath,
      alignedAxes: aligned,
      strainedAxes: strained,
    });
  }

  candidates.sort((a, b) => b.score.total - a.score.total);

  return {
    candidates: candidates.slice(0, limit),
    detectedSituations,
    activeSituations,
    detectedPersonas,
    activePersonas,
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

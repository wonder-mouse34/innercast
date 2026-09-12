import { CHARACTERS } from '@/lib/data/characters';
import { SHOWS } from '@/lib/data/shows';
import { SITUATION_BY_ID } from '@/lib/data/situations';
import { commitmentLabel } from '@/lib/data/shows';
import { personaEcho } from '@/lib/data/personaTraits';
import { tokenize } from '@/lib/rag/tokenize';
import type { Character, ChunkKind, Show, ShowChunk } from '@/lib/types';

/**
 * BM25 index over the show corpus.
 *
 * Each show is split into a situation, story and tone chunk so a query about a
 * life situation is not diluted by plot description, plus one chunk per
 * character. Character chunks carry the most weight: the app's argument is
 * person-to-person, so the words someone uses about themselves should land on
 * the record of the person on screen. The index is built once, lazily.
 */

const K1 = 1.4;
const B = 0.72;

const CHUNK_WEIGHT: Record<ChunkKind, number> = {
  character: 1.35,
  situation: 1.25,
  story: 1,
  texture: 0.85,
};

function situationChunk(show: Show): string {
  const situationText = show.situations
    .map((id) => {
      const situation = SITUATION_BY_ID[id];
      return situation ? `${situation.label}. ${situation.blurb}` : id;
    })
    .join(' ');
  return [situationText, show.themes.join('. '), show.whyItHelps, show.afterward].join(' ');
}

function storyChunk(show: Show): string {
  return [show.title, show.logline, show.synopsis, show.genres.join(' ')].join(' ');
}

function textureChunk(show: Show): string {
  return [
    show.tone.join(' '),
    show.keywords.join(' '),
    show.origin,
    commitmentLabel(show),
    `content notes: ${show.contentWarnings.join(', ')}`,
  ].join(' ');
}

function characterChunk(character: Character): string {
  const situationText = character.situations
    .map((id) => SITUATION_BY_ID[id]?.label ?? id)
    .join(', ');
  return [
    character.name,
    character.role,
    character.portrait,
    character.facing,
    character.traits.join(', '),
    character.personaTags.map((tag) => personaEcho(tag)).join('. '),
    situationText,
    character.arc,
    character.recognizeIf,
  ].join(' ');
}

export type ChunkIndex = {
  chunks: ShowChunk[];
  /** term -> number of chunks containing it */
  docFreq: Map<string, number>;
  avgLength: number;
  chunkCount: number;
};

let cached: ChunkIndex | null = null;

export function getChunkIndex(): ChunkIndex {
  if (cached) return cached;

  const chunks: ShowChunk[] = [];
  for (const show of SHOWS) {
    const parts: [ChunkKind, string][] = [
      ['situation', situationChunk(show)],
      ['story', storyChunk(show)],
      ['texture', textureChunk(show)],
    ];
    for (const [kind, text] of parts) {
      chunks.push({ showId: show.id, kind, text, tokens: tokenize(text) });
    }
  }

  for (const character of CHARACTERS) {
    const text = characterChunk(character);
    chunks.push({
      showId: character.showId,
      kind: 'character',
      characterId: character.id,
      text,
      tokens: tokenize(text),
    });
  }

  const docFreq = new Map<string, number>();
  let totalLength = 0;
  for (const chunk of chunks) {
    totalLength += chunk.tokens.length;
    for (const term of new Set(chunk.tokens)) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  cached = {
    chunks,
    docFreq,
    avgLength: chunks.length > 0 ? totalLength / chunks.length : 1,
    chunkCount: chunks.length,
  };
  return cached;
}

export type ChunkScore = {
  chunk: ShowChunk;
  score: number;
  matchedTerms: string[];
};

/** Standard BM25 with a per-chunk-kind multiplier. */
export function scoreChunks(queryTokens: string[]): ChunkScore[] {
  const index = getChunkIndex();
  if (queryTokens.length === 0) return [];

  const queryCounts = new Map<string, number>();
  for (const token of queryTokens) {
    queryCounts.set(token, (queryCounts.get(token) ?? 0) + 1);
  }

  const results: ChunkScore[] = [];

  for (const chunk of index.chunks) {
    const termFreq = new Map<string, number>();
    for (const token of chunk.tokens) {
      termFreq.set(token, (termFreq.get(token) ?? 0) + 1);
    }

    let score = 0;
    const matchedTerms: string[] = [];

    for (const [term, queryCount] of queryCounts) {
      const freq = termFreq.get(term);
      if (!freq) continue;
      const df = index.docFreq.get(term) ?? 0;
      const idf = Math.log(1 + (index.chunkCount - df + 0.5) / (df + 0.5));
      const norm = freq * (K1 + 1);
      const denominator = freq + K1 * (1 - B + (B * chunk.tokens.length) / index.avgLength);
      score += idf * (norm / denominator) * Math.min(queryCount, 2);
      matchedTerms.push(term);
    }

    if (score > 0) {
      results.push({
        chunk,
        score: score * CHUNK_WEIGHT[chunk.kind],
        matchedTerms,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/** A short readable excerpt of a chunk, used in the retrieval trace UI. */
export function excerpt(text: string, limit = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= limit ? clean : `${clean.slice(0, limit - 1).trimEnd()}…`;
}

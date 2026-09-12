import { projectCorpus, type ProjectedCorpus } from '@/lib/graph/project';
import { getGraph, graphHasCorpus } from '@/lib/graph/store';
import type { GraphDiagnostic } from '@/lib/graph/types';

/**
 * Which corpus the app is running on.
 *
 * A supplied graph with show nodes replaces the hand-authored records in
 * `lib/data` completely — shows and characters together, never a mix, since a
 * character from one source cannot point at a show in the other. With no graph
 * supplied, or one that carries no shows, the authored corpus serves unchanged.
 *
 * Projection happens once and is shared by `lib/data/shows.ts` and
 * `lib/data/characters.ts`, so both always agree.
 */

export type CorpusSource = 'graph' | 'authored';

let projected: ProjectedCorpus | null = null;

export function graphCorpus(): ProjectedCorpus | null {
  if (!graphHasCorpus()) return null;
  if (!projected) projected = projectCorpus(getGraph());
  return projected;
}

export function corpusSource(): CorpusSource {
  return graphCorpus() ? 'graph' : 'authored';
}

/** Complaints raised while projecting the graph onto show and character records. */
export function corpusDiagnostics(): GraphDiagnostic[] {
  return graphCorpus()?.diagnostics ?? [];
}

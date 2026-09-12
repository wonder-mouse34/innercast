import { buildGraph, graphStats, nodesOfType, type Graph } from '@/lib/graph/load';
import { GRAPH_ASSET_PATH, loadGraphSources } from '@/lib/graph/source';
import type { GraphDiagnostic } from '@/lib/graph/types';

/**
 * The single runtime graph.
 *
 * Built once, lazily, from whatever documents `loadGraphSources` found. Every
 * consumer — corpus projection, traversal, the status screen — reads this, so
 * there is exactly one answer to "what graph is the app running on".
 */

let cached: Graph | null = null;
let documentName: string | undefined;

export function getGraph(): Graph {
  if (cached) return cached;
  const loaded = loadGraphSources();
  documentName = loaded.name;
  cached = buildGraph(loaded.sources, loaded.diagnostics);
  return cached;
}

/** True once a supplied graph carries show nodes, i.e. it can act as the corpus. */
export function graphHasCorpus(): boolean {
  return nodesOfType(getGraph(), 'show').length > 0;
}

/** True when a graph was supplied at all, corpus-shaped or not. */
export function graphIsSupplied(): boolean {
  return getGraph().nodes.size > 0;
}

export type GraphSummary = {
  supplied: boolean;
  assetPath: string;
  name?: string;
  stats: Record<string, number>;
  diagnostics: GraphDiagnostic[];
};

export function graphSummary(): GraphSummary {
  const graph = getGraph();
  return {
    supplied: graph.nodes.size > 0,
    assetPath: GRAPH_ASSET_PATH,
    name: documentName,
    stats: graphStats(graph),
    diagnostics: graph.diagnostics,
  };
}

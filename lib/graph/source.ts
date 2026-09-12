import graphAsset from '@/assets/graph/graph.json';
import type { GraphSource } from '@/lib/graph/load';
import { parseGraphDocument } from '@/lib/graph/schema';
import type { GraphDiagnostic } from '@/lib/graph/types';

/**
 * Where a supplied knowledge graph is read from.
 *
 * The file is bundled, so it is parsed by the bundler rather than at runtime and
 * works identically offline on web and native. It ships empty: drop a graph
 * document in its place (same shape, see `lib/graph/types.ts`) and it becomes
 * the corpus on next reload, with no other code change. While it is empty the
 * hand-authored corpus in `lib/data` keeps serving.
 */
export const GRAPH_ASSET_PATH = 'assets/graph/graph.json';

export type LoadedGraphSources = {
  sources: GraphSource[];
  diagnostics: GraphDiagnostic[];
  /** `name` from the document, when it carries one. */
  name?: string;
};

export function loadGraphSources(): LoadedGraphSources {
  const { document, diagnostics } = parseGraphDocument(graphAsset, GRAPH_ASSET_PATH);

  if (!document) return { sources: [], diagnostics };

  if (document.nodes.length === 0) {
    return {
      sources: [],
      diagnostics: [
        {
          level: 'info',
          message: `${GRAPH_ASSET_PATH} holds no nodes — running on the hand-authored corpus in lib/data.`,
        },
      ],
    };
  }

  return {
    sources: [{ source: GRAPH_ASSET_PATH, document }],
    diagnostics,
    name: document.name && document.name.length > 0 ? document.name : undefined,
  };
}

import type { GraphDiagnostic, GraphDocument, GraphEdge, GraphNode } from '@/lib/graph/types';

/**
 * An indexed, queryable graph.
 *
 * Adjacency is stored in both directions because most useful walks run against
 * the arrow: from a situation to the characters facing it, from a coping pattern
 * to the people who show it.
 */
export type Graph = {
  nodes: Map<string, GraphNode>;
  byType: Map<string, GraphNode[]>;
  edges: GraphEdge[];
  /** node id -> edges leaving it */
  out: Map<string, GraphEdge[]>;
  /** node id -> edges arriving at it */
  in: Map<string, GraphEdge[]>;
  diagnostics: GraphDiagnostic[];
  sources: string[];
};

export type GraphSource = {
  source: string;
  document: GraphDocument;
};

function push<T>(map: Map<string, T[]>, key: string, value: T): void {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
}

/**
 * Merge documents into one graph, in order: a later document wins on node id,
 * and its `props` are merged over the earlier ones so a supplied graph can
 * adjust one field of a record without restating the whole thing.
 *
 * Edges are deduped on from/type/to, keeping the strongest weight. Edges
 * pointing at a node nobody defined are dropped with a diagnostic rather than
 * silently producing dead ends in a walk.
 */
export function buildGraph(sources: GraphSource[], seed: GraphDiagnostic[] = []): Graph {
  const diagnostics: GraphDiagnostic[] = [...seed];
  const nodes = new Map<string, GraphNode>();

  for (const { document } of sources) {
    for (const node of document.nodes) {
      const existing = nodes.get(node.id);
      nodes.set(
        node.id,
        existing
          ? {
              ...existing,
              ...node,
              props:
                existing.props || node.props ? { ...existing.props, ...node.props } : undefined,
            }
          : node,
      );
    }
  }

  const byKey = new Map<string, GraphEdge>();
  let dangling = 0;
  const danglingExamples: string[] = [];

  for (const { document } of sources) {
    for (const edge of document.edges) {
      if (!nodes.has(edge.from) || !nodes.has(edge.to)) {
        dangling += 1;
        if (danglingExamples.length < 3) {
          danglingExamples.push(`${edge.from} -${edge.type}-> ${edge.to}`);
        }
        continue;
      }
      const key = `${edge.from}|${edge.type}|${edge.to}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, edge);
        continue;
      }
      byKey.set(key, {
        ...existing,
        ...edge,
        weight: Math.max(existing.weight ?? 1, edge.weight ?? 1),
      });
    }
  }

  if (dangling > 0) {
    diagnostics.push({
      level: 'warning',
      message: `${dangling} edge${dangling === 1 ? '' : 's'} dropped for pointing at a node that is not defined (e.g. ${danglingExamples.join('; ')}).`,
    });
  }

  const edges = [...byKey.values()];
  const out = new Map<string, GraphEdge[]>();
  const incoming = new Map<string, GraphEdge[]>();
  for (const edge of edges) {
    push(out, edge.from, edge);
    push(incoming, edge.to, edge);
  }

  const byType = new Map<string, GraphNode[]>();
  for (const node of nodes.values()) push(byType, node.type, node);

  return {
    nodes,
    byType,
    edges,
    out,
    in: incoming,
    diagnostics,
    sources: sources.map((entry) => entry.source),
  };
}

export function nodesOfType(graph: Graph, type: string): GraphNode[] {
  return graph.byType.get(type) ?? [];
}

/** Ids reached by following one edge type out of a node. */
export function outNeighbours(graph: Graph, id: string, type: string): GraphEdge[] {
  return (graph.out.get(id) ?? []).filter((edge) => edge.type === type);
}

/** Ids reached by following one edge type into a node. */
export function inNeighbours(graph: Graph, id: string, type: string): GraphEdge[] {
  return (graph.in.get(id) ?? []).filter((edge) => edge.type === type);
}

export function graphStats(graph: Graph): Record<string, number> {
  const stats: Record<string, number> = { nodes: graph.nodes.size, edges: graph.edges.length };
  for (const [type, list] of graph.byType) stats[type] = list.length;
  return stats;
}

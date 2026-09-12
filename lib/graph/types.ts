/**
 * Knowledge-graph format for Inner Cast.
 *
 * The graph is the corpus. Retrieval walks it, the prompt is built from the
 * subgraph the walk returned, and the language model only ever sees records
 * that came out of that walk — it is never handed the graph itself and never
 * asked to query it.
 *
 * ## Document shape
 *
 * ```jsonc
 * {
 *   "version": 1,
 *   "name": "my corpus",
 *   "nodes": [
 *     { "id": "show:the-bear", "type": "show", "label": "The Bear",
 *       "text": "prose — gets lexically indexed",
 *       "props": { "years": "2022–", "seasons": 3, "traits": { "intensity": 82 } } },
 *     { "id": "character:carmy", "type": "character", "label": "Carmen Berzatto",
 *       "props": { "role": "chef, thirties", "portrait": "…", "facing": "…" } },
 *     { "id": "situation:grief", "type": "situation", "label": "Grief" },
 *     { "id": "persona:over-functioner", "type": "persona", "label": "I take on too much" },
 *     { "id": "theme:inherited-obligation", "type": "theme", "label": "Inherited obligation" }
 *   ],
 *   "edges": [
 *     { "from": "character:carmy", "to": "show:the-bear", "type": "appears_in" },
 *     { "from": "character:carmy", "to": "situation:grief", "type": "faces", "weight": 0.9 },
 *     { "from": "character:carmy", "to": "persona:over-functioner", "type": "embodies" },
 *     { "from": "character:carmy", "to": "character:sydney", "type": "mirrors", "weight": 0.5 },
 *     { "from": "situation:grief", "to": "situation:family-conflict", "type": "co_occurs", "weight": 0.4 }
 *   ]
 * }
 * ```
 *
 * ## Rules
 * - Ids are namespaced `type:slug`. Nothing else is assumed about them.
 * - `label` is what a person reads. `text` is prose that gets tokenised into the
 *   lexical index, so put the writing that should be searchable there.
 * - `props` carries structured fields; see `lib/graph/schema.ts` for the fields
 *   read off `show` and `character` nodes. Everything is optional and defaulted.
 * - Relationships live in edges, not props: a show's themes and situations, and a
 *   character's situations and coping patterns, are all edges.
 * - `weight` is 0-1 and defaults to 1. It scales how strongly a walk crosses that
 *   edge, so it is the main dial for tuning the graph's behaviour.
 * - `situation:*` and `persona:*` ids should match the app's own taxonomies
 *   (`SituationId`, `PersonaTraitId`) so chips, filters and saved data line up.
 *   Ids outside those lists still take part in the walk, they just cannot be
 *   selected in the UI.
 * - Unknown node and edge types are kept and walked weakly rather than rejected.
 *   They show up as warnings in the graph diagnostics.
 */

/** Node types the app understands structurally. Others are walk-only. */
export const GRAPH_NODE_TYPES = ['show', 'character', 'situation', 'persona', 'theme'] as const;

export type GraphNodeType = (typeof GRAPH_NODE_TYPES)[number];

/** The edge vocabulary the traversal has tuned weights and wording for. */
export const GRAPH_EDGE_TYPES = [
  /** character -> show */
  'appears_in',
  /** character -> situation */
  'faces',
  /** character -> persona */
  'embodies',
  /** character -> theme */
  'touches',
  /** character -> character, same pattern under pressure */
  'mirrors',
  /** character -> character, opposite response to the same pressure */
  'contrasts',
  /** show -> situation */
  'speaks_to',
  /** show -> theme */
  'explores',
  /** situation -> situation */
  'co_occurs',
  /** persona -> persona */
  'akin_to',
  /** theme -> theme */
  'related_to',
] as const;

export type GraphEdgeType = (typeof GRAPH_EDGE_TYPES)[number];

export type GraphNode = {
  id: string;
  /** One of `GRAPH_NODE_TYPES`, or any other string for a walk-only node. */
  type: string;
  label: string;
  /** Prose to index lexically. */
  text?: string;
  props?: Record<string, unknown>;
};

export type GraphEdge = {
  from: string;
  to: string;
  /** One of `GRAPH_EDGE_TYPES`, or any other string for a weak generic link. */
  type: string;
  /** 0-1, defaults to 1. */
  weight?: number;
  /** Optional human note, shown in the retrieval trace when present. */
  note?: string;
};

export type GraphDocument = {
  version: number;
  name?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphDiagnostic = {
  level: 'error' | 'warning' | 'info';
  message: string;
};

/**
 * How a walk crosses an edge, in each direction.
 *
 * `decay` multiplies the strength carried into the next node, so a chain of
 * weak hops fades out on its own. The phrasing is what the retrieval trace and
 * the prompt use to describe the hop in words.
 */
export type EdgeTraversal = {
  forwardPhrase: string;
  reversePhrase: string;
  forwardDecay: number;
  reverseDecay: number;
};

export const UNKNOWN_EDGE_TRAVERSAL: EdgeTraversal = {
  forwardPhrase: 'links to',
  reversePhrase: 'is linked from',
  forwardDecay: 0.4,
  reverseDecay: 0.4,
};

export const EDGE_TRAVERSAL: Record<GraphEdgeType, EdgeTraversal> = {
  // A character carries their show with them: no loss on this hop.
  appears_in: {
    forwardPhrase: 'appears in',
    reversePhrase: 'features',
    forwardDecay: 1,
    reverseDecay: 0.5,
  },
  faces: {
    forwardPhrase: 'is living through',
    reversePhrase: 'is lived by',
    forwardDecay: 0.85,
    reverseDecay: 0.9,
  },
  embodies: {
    forwardPhrase: 'copes by',
    reversePhrase: 'shows up in',
    forwardDecay: 0.85,
    reverseDecay: 0.95,
  },
  touches: {
    forwardPhrase: 'carries',
    reversePhrase: 'is carried by',
    forwardDecay: 0.6,
    reverseDecay: 0.7,
  },
  mirrors: {
    forwardPhrase: 'copes like',
    reversePhrase: 'copes like',
    forwardDecay: 0.6,
    reverseDecay: 0.6,
  },
  contrasts: {
    forwardPhrase: 'answers the same pressure differently to',
    reversePhrase: 'answers the same pressure differently to',
    forwardDecay: 0.35,
    reverseDecay: 0.35,
  },
  speaks_to: {
    forwardPhrase: 'speaks to',
    reversePhrase: 'is spoken to by',
    forwardDecay: 0.7,
    reverseDecay: 0.75,
  },
  explores: {
    forwardPhrase: 'explores',
    reversePhrase: 'is explored in',
    forwardDecay: 0.55,
    reverseDecay: 0.6,
  },
  co_occurs: {
    forwardPhrase: 'often comes with',
    reversePhrase: 'often comes with',
    forwardDecay: 0.5,
    reverseDecay: 0.5,
  },
  akin_to: {
    forwardPhrase: 'is close to',
    reversePhrase: 'is close to',
    forwardDecay: 0.55,
    reverseDecay: 0.55,
  },
  related_to: {
    forwardPhrase: 'relates to',
    reversePhrase: 'relates to',
    forwardDecay: 0.45,
    reverseDecay: 0.45,
  },
};

export function edgeTraversal(type: string): EdgeTraversal {
  return EDGE_TRAVERSAL[type as GraphEdgeType] ?? UNKNOWN_EDGE_TRAVERSAL;
}

export function isKnownEdgeType(type: string): type is GraphEdgeType {
  return Object.hasOwn(EDGE_TRAVERSAL, type);
}

export function isKnownNodeType(type: string): type is GraphNodeType {
  return (GRAPH_NODE_TYPES as readonly string[]).includes(type);
}

/** `show:the-bear` -> `the-bear`. Returns the whole id when unprefixed. */
export function nodeSlug(id: string): string {
  const index = id.indexOf(':');
  return index === -1 ? id : id.slice(index + 1);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const showNodeId = (id: string) => `show:${id}`;
export const characterNodeId = (id: string) => `character:${id}`;
export const situationNodeId = (id: string) => `situation:${id}`;
export const personaNodeId = (id: string) => `persona:${id}`;
export const themeNodeId = (label: string) => `theme:${slugify(label)}`;

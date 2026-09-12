import type { Graph } from '@/lib/graph/load';
import { edgeTraversal, nodeSlug } from '@/lib/graph/types';
import type { GraphNode } from '@/lib/graph/types';

/**
 * Multi-hop traversal over the knowledge graph.
 *
 * A search starts from what the person told us — the self-descriptions they
 * picked and the situations they tagged — and walks outward to the characters
 * who share them and the shows those characters live in. Every hop multiplies
 * the strength carried so far by the edge's weight and the type's decay, so a
 * long chain of loose links fades out by itself and a short strong one wins.
 *
 * The walk is deterministic and keeps the winning path per node, which is what
 * lets the retrieval trace and the prompt say *why* something surfaced rather
 * than only that it scored well.
 */

export type GraphSeed = {
  id: string;
  /** 0-1 starting strength; how much of the person's signal this seed carries. */
  weight?: number;
};

export type GraphHop = {
  edgeType: string;
  /** Read in the direction travelled, e.g. "is lived by". */
  phrase: string;
  direction: 'forward' | 'reverse';
  from: string;
  to: string;
  toLabel: string;
  toType: string;
  note?: string;
  /** Strength remaining after this hop. */
  strength: number;
};

export type GraphReach = {
  id: string;
  node: GraphNode;
  strength: number;
  seedId: string;
  seedLabel: string;
  hops: GraphHop[];
};

export type CharacterReach = {
  /** Record id, i.e. the node id with its `character:` prefix removed. */
  characterId: string;
  nodeId: string;
  label: string;
  strength: number;
  hops: GraphHop[];
  seedLabel: string;
};

export type ShowReach = {
  showId: string;
  nodeId: string;
  label: string;
  /** Strength as walked, before normalisation. */
  raw: number;
  /** 0-1, relative to the strongest show this walk reached. */
  score: number;
  hops: GraphHop[];
  seedLabel: string;
  /** Anchors: the characters that carried the signal here, strongest first. */
  characters: CharacterReach[];
};

export type GraphWalk = {
  /** Every node the walk reached, with its best path. */
  reach: Map<string, GraphReach>;
  shows: ShowReach[];
  showById: Map<string, ShowReach>;
  /** Nodes expanded; useful for spotting a graph that is too dense to walk. */
  expanded: number;
};

export type WalkOptions = {
  /** Hops allowed before the closing character -> show step. Default 3. */
  maxHops?: number;
  /** Paths weaker than this are abandoned. Default 0.05. */
  minStrength?: number;
  /** Anchors kept per show. Default 3. */
  maxCharacters?: number;
  /** Hard ceiling on expansion, so a pathological graph cannot hang a search. */
  maxExpansions?: number;
};

const DEFAULTS = {
  maxHops: 3,
  minStrength: 0.05,
  maxCharacters: 3,
  maxExpansions: 20000,
} satisfies Required<WalkOptions>;

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/** Max-heap on strength. Small graphs would survive a sorted array; this keeps a big one honest. */
class Heap {
  private items: GraphReach[] = [];

  get size(): number {
    return this.items.length;
  }

  push(item: GraphReach): void {
    const items = this.items;
    items.push(item);
    let index = items.length - 1;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (items[parent].strength >= items[index].strength) break;
      [items[parent], items[index]] = [items[index], items[parent]];
      index = parent;
    }
  }

  pop(): GraphReach | undefined {
    const items = this.items;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0 && last) {
      items[0] = last;
      let index = 0;
      for (;;) {
        const left = index * 2 + 1;
        const right = left + 1;
        let largest = index;
        if (left < items.length && items[left].strength > items[largest].strength) largest = left;
        if (right < items.length && items[right].strength > items[largest].strength)
          largest = right;
        if (largest === index) break;
        [items[largest], items[index]] = [items[index], items[largest]];
        index = largest;
      }
    }
    return top;
  }
}

type Step = {
  to: string;
  factor: number;
  edgeType: string;
  phrase: string;
  direction: 'forward' | 'reverse';
  note?: string;
};

/** Every hop available out of a node, in both directions. */
function stepsFrom(graph: Graph, id: string): Step[] {
  const steps: Step[] = [];

  for (const edge of graph.out.get(id) ?? []) {
    const traversal = edgeTraversal(edge.type);
    steps.push({
      to: edge.to,
      factor: clamp01(edge.weight ?? 1) * traversal.forwardDecay,
      edgeType: edge.type,
      phrase: traversal.forwardPhrase,
      direction: 'forward',
      note: edge.note,
    });
  }

  for (const edge of graph.in.get(id) ?? []) {
    const traversal = edgeTraversal(edge.type);
    steps.push({
      to: edge.from,
      factor: clamp01(edge.weight ?? 1) * traversal.reverseDecay,
      edgeType: edge.type,
      phrase: traversal.reversePhrase,
      direction: 'reverse',
      note: edge.note,
    });
  }

  return steps;
}

export function walkGraph(graph: Graph, seeds: GraphSeed[], options: WalkOptions = {}): GraphWalk {
  const { maxHops, minStrength, maxCharacters, maxExpansions } = { ...DEFAULTS, ...options };

  const best = new Map<string, GraphReach>();
  const heap = new Heap();

  for (const seed of seeds) {
    const node = graph.nodes.get(seed.id);
    if (!node) continue;
    const strength = clamp01(seed.weight ?? 1);
    if (strength <= 0) continue;
    const existing = best.get(node.id);
    if (existing && existing.strength >= strength) continue;
    const entry: GraphReach = {
      id: node.id,
      node,
      strength,
      seedId: node.id,
      seedLabel: node.label,
      hops: [],
    };
    best.set(node.id, entry);
    heap.push(entry);
  }

  let expanded = 0;

  while (heap.size > 0 && expanded < maxExpansions) {
    const current = heap.pop();
    if (!current) break;
    // A better path to this node was found after this entry was queued.
    if (best.get(current.id) !== current) continue;
    expanded += 1;
    if (current.hops.length >= maxHops) continue;

    for (const step of stepsFrom(graph, current.id)) {
      if (step.to === current.id || step.to === current.seedId) continue;
      if (current.hops.some((hop) => hop.to === step.to)) continue;

      const strength = current.strength * step.factor;
      if (strength < minStrength) continue;

      const existing = best.get(step.to);
      if (existing && existing.strength >= strength) continue;

      const node = graph.nodes.get(step.to);
      if (!node) continue;

      const entry: GraphReach = {
        id: node.id,
        node,
        strength,
        seedId: current.seedId,
        seedLabel: current.seedLabel,
        hops: [
          ...current.hops,
          {
            edgeType: step.edgeType,
            phrase: step.phrase,
            direction: step.direction,
            from: current.id,
            to: node.id,
            toLabel: node.label,
            toType: node.type,
            note: step.note,
            strength,
          },
        ],
      };
      best.set(node.id, entry);
      heap.push(entry);
    }
  }

  return finishWalk(graph, best, expanded, maxCharacters);
}

/**
 * A character sitting on the hop limit still has to be able to name its show,
 * otherwise `maxHops` would silently hide whole titles. So after the walk,
 * every reached character gets one closing `appears_in` step.
 */
function finishWalk(
  graph: Graph,
  best: Map<string, GraphReach>,
  expanded: number,
  maxCharacters: number,
): GraphWalk {
  const characters: GraphReach[] = [];
  for (const reach of best.values()) {
    if (reach.node.type === 'character') characters.push(reach);
  }

  for (const reach of characters) {
    for (const edge of graph.out.get(reach.id) ?? []) {
      if (edge.type !== 'appears_in') continue;
      const node = graph.nodes.get(edge.to);
      if (!node || node.type !== 'show') continue;
      const traversal = edgeTraversal(edge.type);
      const strength = reach.strength * clamp01(edge.weight ?? 1) * traversal.forwardDecay;
      const existing = best.get(node.id);
      if (existing && existing.strength >= strength) continue;
      best.set(node.id, {
        id: node.id,
        node,
        strength,
        seedId: reach.seedId,
        seedLabel: reach.seedLabel,
        hops: [
          ...reach.hops,
          {
            edgeType: edge.type,
            phrase: traversal.forwardPhrase,
            direction: 'forward',
            from: reach.id,
            to: node.id,
            toLabel: node.label,
            toType: node.type,
            note: edge.note,
            strength,
          },
        ],
      });
    }
  }

  // Anchors per show, from the characters the walk actually reached.
  const anchors = new Map<string, CharacterReach[]>();
  for (const reach of characters) {
    for (const edge of graph.out.get(reach.id) ?? []) {
      if (edge.type !== 'appears_in') continue;
      const entry: CharacterReach = {
        characterId: nodeSlug(reach.id),
        nodeId: reach.id,
        label: reach.node.label,
        strength: reach.strength,
        hops: reach.hops,
        seedLabel: reach.seedLabel,
      };
      const list = anchors.get(edge.to);
      if (list) list.push(entry);
      else anchors.set(edge.to, [entry]);
    }
  }

  const shows: ShowReach[] = [];
  let strongest = 0;
  for (const reach of best.values()) {
    if (reach.node.type !== 'show') continue;
    strongest = Math.max(strongest, reach.strength);
    shows.push({
      showId: nodeSlug(reach.id),
      nodeId: reach.id,
      label: reach.node.label,
      raw: reach.strength,
      score: 0,
      hops: reach.hops,
      seedLabel: reach.seedLabel,
      characters: (anchors.get(reach.id) ?? [])
        .slice()
        .sort((a, b) => b.strength - a.strength)
        .slice(0, maxCharacters),
    });
  }

  for (const show of shows) show.score = strongest > 0 ? show.raw / strongest : 0;
  shows.sort((a, b) => b.raw - a.raw || a.showId.localeCompare(b.showId));

  return {
    reach: best,
    shows,
    showById: new Map(shows.map((show) => [show.showId, show])),
    expanded,
  };
}

/**
 * The winning path in words: "taking on too much → shows up in → Carmen
 * Berzatto → appears in → The Bear". This is what goes in front of the model
 * and in the trace, so it has to read as an argument, not as node ids.
 */
export function pathSentence(reach: { seedLabel: string; hops: GraphHop[] }): string {
  const parts = [reach.seedLabel];
  for (const hop of reach.hops) parts.push(hop.phrase, hop.toLabel);
  return parts.join(' → ');
}

/** The same path, one hop per line, for a trace that has room to breathe. */
export function pathLines(reach: { seedLabel: string; hops: GraphHop[] }): string[] {
  let from = reach.seedLabel;
  return reach.hops.map((hop) => {
    const line = `${from} ${hop.phrase} ${hop.toLabel}`;
    from = hop.toLabel;
    return hop.note ? `${line} (${hop.note})` : line;
  });
}

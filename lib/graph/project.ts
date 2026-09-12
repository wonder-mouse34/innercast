import { inNeighbours, nodesOfType, outNeighbours, type Graph } from '@/lib/graph/load';
import { characterPropsSchema, showPropsSchema } from '@/lib/graph/schema';
import { nodeSlug, type GraphDiagnostic, type GraphNode } from '@/lib/graph/types';
import { PERSONA_BY_ID } from '@/lib/data/personaTraits';
import { SITUATION_BY_ID } from '@/lib/data/situations';
import {
  type Character,
  type PersonaTraitId,
  type Show,
  type SituationId,
  type TraitVector,
} from '@/lib/types';

/**
 * Projection from graph nodes onto the app's `Show` and `Character` shapes.
 *
 * Everything above this file — screens, retrieval, reflections — keeps talking in
 * shows and characters, so a supplied graph does not ripple through the UI. Only
 * structured fields come out of `props`; every relationship (which show a
 * character is in, which situations either speaks to, which themes a show
 * carries) is read from edges.
 *
 * Missing fields are defaulted rather than rejected: a sparse graph loads and
 * simply scores with less to go on.
 */

const DEFAULT_TRAIT = 50;
const PAPER_INK = '#2a221a';

/**
 * Flat baseline for graph-derived shows/characters that don't specify trait
 * props. Written out per-axis (rather than mapped from `TRAIT_AXES`) so
 * adding an axis to `TraitVector` surfaces as a compile error here instead
 * of silently defaulting through a type assertion.
 */
function defaultTraits(): TraitVector {
  return {
    comfort: DEFAULT_TRAIT,
    humor: DEFAULT_TRAIT,
    intensity: DEFAULT_TRAIT,
    pace: DEFAULT_TRAIT,
    escapism: DEFAULT_TRAIT,
    ensemble: DEFAULT_TRAIT,
    catharsis: DEFAULT_TRAIT,
  };
}

function hashCode(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const section = ((hue % 360) + 360) / 60;
  const secondary = chroma * (1 - Math.abs((section % 2) - 1));
  const table: [number, number, number][] = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary],
  ];
  const [red, green, blue] = table[Math.floor(section) % 6];
  const match = lightness - chroma / 2;
  return `#${[red, green, blue]
    .map((channel) =>
      Math.round((channel + match) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/**
 * A stable colour pair for a show that did not supply one. The corpus stores a
 * dark base plus a vivid accent; `showTint` lifts the accent into the light
 * palette, so only the hue really matters and deriving it from the id keeps a
 * show looking the same on every launch.
 */
function derivedPalette(id: string): [string, string] {
  return [PAPER_INK, hslToHex(hashCode(id) % 360, 0.52, 0.5)];
}

function prose(...parts: (string | undefined)[]): string {
  return parts
    .map((part) => part?.trim() ?? '')
    .filter((part) => part.length > 0)
    .join(' ');
}

function isSituationId(id: string): id is SituationId {
  return Object.hasOwn(SITUATION_BY_ID, id);
}

function isPersonaId(id: string): id is PersonaTraitId {
  return Object.hasOwn(PERSONA_BY_ID, id);
}

export type ProjectedCorpus = {
  shows: Show[];
  characters: Character[];
  diagnostics: GraphDiagnostic[];
};

/**
 * Situations a node points at with one edge type, narrowed to the app's own
 * taxonomy. Ids outside it still take part in traversal — they just cannot drive
 * chips, filters or saved data, so they are reported once and dropped here.
 */
function situationsFor(
  graph: Graph,
  nodeId: string,
  edgeType: string,
  unknown: Set<string>,
): SituationId[] {
  const ids: SituationId[] = [];
  for (const edge of outNeighbours(graph, nodeId, edgeType)) {
    const target = graph.nodes.get(edge.to);
    if (!target || target.type !== 'situation') continue;
    const slug = nodeSlug(target.id);
    if (isSituationId(slug)) ids.push(slug);
    else unknown.add(slug);
  }
  return [...new Set(ids)];
}

function themesFor(graph: Graph, nodeId: string, edgeType: string): string[] {
  const labels: string[] = [];
  for (const edge of outNeighbours(graph, nodeId, edgeType)) {
    const target = graph.nodes.get(edge.to);
    if (target && target.type === 'theme') labels.push(target.label);
  }
  return labels;
}

function showNodeForCharacter(graph: Graph, node: GraphNode, propShowId?: string): string | null {
  for (const edge of outNeighbours(graph, node.id, 'appears_in')) {
    const target = graph.nodes.get(edge.to);
    if (target && target.type === 'show') return target.id;
  }
  if (propShowId) {
    if (graph.nodes.get(propShowId)?.type === 'show') return propShowId;
    const bySlug = nodesOfType(graph, 'show').find((show) => nodeSlug(show.id) === propShowId);
    if (bySlug) return bySlug.id;
  }
  return null;
}

/** Character node ids belonging to a show node, via the `appears_in` edge. */
function characterNodesForShow(graph: Graph, showNodeId: string): GraphNode[] {
  const nodes: GraphNode[] = [];
  for (const edge of inNeighbours(graph, showNodeId, 'appears_in')) {
    const source = graph.nodes.get(edge.from);
    if (source && source.type === 'character') nodes.push(source);
  }
  return nodes;
}

export function projectCorpus(graph: Graph): ProjectedCorpus {
  const diagnostics: GraphDiagnostic[] = [];
  const unknownSituations = new Set<string>();
  const unknownPersonas = new Set<string>();

  const showNodes = nodesOfType(graph, 'show');

  // Node id -> the id the rest of the app uses (`show:the-bear` -> `the-bear`).
  const showIdByNode = new Map<string, string>();
  const takenShowIds = new Set<string>();
  for (const node of showNodes) {
    let id = nodeSlug(node.id);
    if (takenShowIds.has(id)) {
      diagnostics.push({
        level: 'warning',
        message: `Two show nodes reduce to the id "${id}"; "${node.id}" was kept under "${node.id}".`,
      });
      id = node.id;
    }
    takenShowIds.add(id);
    showIdByNode.set(node.id, id);
  }

  const characters: Character[] = [];
  const characterSituationsByShowNode = new Map<string, SituationId[]>();
  const takenCharacterIds = new Set<string>();
  let orphanCharacters = 0;

  for (const node of nodesOfType(graph, 'character')) {
    const parsed = characterPropsSchema.safeParse(node.props ?? {});
    const props = parsed.success ? parsed.data : {};
    if (!parsed.success) {
      diagnostics.push({
        level: 'warning',
        message: `Character "${node.id}" has props this build does not understand; they were ignored.`,
      });
    }

    const showNodeId = showNodeForCharacter(graph, node, props.showId);
    const showId = showNodeId ? showIdByNode.get(showNodeId) : undefined;
    if (!showNodeId || !showId) {
      orphanCharacters += 1;
      continue;
    }

    const situations = situationsFor(graph, node.id, 'faces', unknownSituations);
    const personaTags: PersonaTraitId[] = [];
    for (const edge of outNeighbours(graph, node.id, 'embodies')) {
      const target = graph.nodes.get(edge.to);
      if (!target || target.type !== 'persona') continue;
      const slug = nodeSlug(target.id);
      if (isPersonaId(slug)) personaTags.push(slug);
      else unknownPersonas.add(slug);
    }

    let id = nodeSlug(node.id);
    if (takenCharacterIds.has(id)) id = node.id;
    takenCharacterIds.add(id);

    characters.push({
      id,
      showId,
      name: node.label,
      role: props.role ?? '',
      // Prose in `text` is kept alongside a supplied portrait so nothing the
      // author wrote is lost to the lexical index.
      portrait: prose(props.portrait, props.portrait === node.text ? undefined : node.text),
      facing: props.facing ?? '',
      traits: props.traits ?? [],
      personaTags: [...new Set(personaTags)],
      situations,
      arc: props.arc ?? '',
      recognizeIf: props.recognizeIf ?? '',
    });

    const existing = characterSituationsByShowNode.get(showNodeId) ?? [];
    characterSituationsByShowNode.set(showNodeId, [...existing, ...situations]);
  }

  if (orphanCharacters > 0) {
    diagnostics.push({
      level: 'warning',
      message: `${orphanCharacters} character node${
        orphanCharacters === 1 ? '' : 's'
      } left out of the corpus for having no \`appears_in\` edge to a show. They still take part in traversal.`,
    });
  }

  const shows: Show[] = showNodes.map((node) => {
    const parsed = showPropsSchema.safeParse(node.props ?? {});
    const props = parsed.success ? parsed.data : {};
    if (!parsed.success) {
      diagnostics.push({
        level: 'warning',
        message: `Show "${node.id}" has props this build does not understand; they were ignored.`,
      });
    }

    const id = showIdByNode.get(node.id) ?? nodeSlug(node.id);
    const ownSituations = situationsFor(graph, node.id, 'speaks_to', unknownSituations);
    // A graph that only tags its people still gets show-level situations.
    const situations =
      ownSituations.length > 0
        ? ownSituations
        : [...new Set(characterSituationsByShowNode.get(node.id) ?? [])];

    const characterThemes = characterNodesForShow(graph, node.id).flatMap((character) =>
      themesFor(graph, character.id, 'touches'),
    );
    const themes = [...new Set([...themesFor(graph, node.id, 'explores'), ...characterThemes])];

    // Prose in `text` is kept even when a synopsis was supplied, so the lexical
    // index sees everything the author wrote about this show.
    const synopsis = prose(props.synopsis, props.synopsis === node.text ? undefined : node.text);

    return {
      id,
      title: props.title ?? node.label,
      years: props.years ?? '',
      seasons: props.seasons ?? 1,
      episodes: props.episodes ?? 8,
      runtimeMinutes: props.runtimeMinutes ?? 45,
      origin: props.origin ?? '',
      genres: props.genres ?? [],
      logline: props.logline ?? '',
      synopsis,
      tone: props.tone ?? [],
      themes,
      situations,
      traits: { ...defaultTraits(), ...props.traits },
      contentWarnings: props.contentWarnings ?? [],
      whyItHelps: props.whyItHelps ?? '',
      afterward: props.afterward ?? '',
      keywords: props.keywords ?? [],
      palette: props.palette ?? derivedPalette(id),
    };
  });

  if (unknownSituations.size > 0) {
    diagnostics.push({
      level: 'warning',
      message: `Situation ids outside the app's taxonomy, dropped from show and character records — ${[
        ...unknownSituations,
      ]
        .slice(0, 8)
        .join(', ')}${unknownSituations.size > 8 ? ', …' : ''}.`,
    });
  }
  if (unknownPersonas.size > 0) {
    diagnostics.push({
      level: 'warning',
      message: `Self-description ids outside the app's taxonomy, dropped from character records — ${[
        ...unknownPersonas,
      ]
        .slice(0, 8)
        .join(', ')}${unknownPersonas.size > 8 ? ', …' : ''}.`,
    });
  }

  return { shows, characters, diagnostics };
}

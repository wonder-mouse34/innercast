import { z } from 'zod';

import {
  isKnownEdgeType,
  isKnownNodeType,
  type GraphDiagnostic,
  type GraphDocument,
  type GraphEdge,
  type GraphNode,
} from '@/lib/graph/types';

/**
 * Validation for an incoming graph document.
 *
 * Parsing is per node and per edge on purpose: one malformed entry in a
 * hand-edited file should cost that entry and a diagnostic line, not the whole
 * corpus. Everything structural is optional and defaulted downstream, so a
 * minimal graph loads and a rich one simply scores better.
 */

const traitVectorSchema = z
  .object({
    comfort: z.number().min(0).max(100),
    humor: z.number().min(0).max(100),
    intensity: z.number().min(0).max(100),
    pace: z.number().min(0).max(100),
    escapism: z.number().min(0).max(100),
    ensemble: z.number().min(0).max(100),
    catharsis: z.number().min(0).max(100),
  })
  .partial();

/** Structured fields read off a `show` node's `props`. All optional. */
export const showPropsSchema = z.object({
  title: z.string().optional(),
  years: z.string().optional(),
  seasons: z.number().int().min(1).optional(),
  episodes: z.number().int().min(1).optional(),
  runtimeMinutes: z.number().int().min(1).optional(),
  origin: z.string().optional(),
  genres: z.array(z.string()).optional(),
  logline: z.string().optional(),
  synopsis: z.string().optional(),
  tone: z.array(z.string()).optional(),
  endingTone: z.enum(['happy', 'unhappy', 'bittersweet', 'open']).optional(),
  endingNote: z.string().optional(),
  spoilerSummary: z.string().optional(),
  contentWarnings: z.array(z.string()).optional(),
  whyItHelps: z.string().optional(),
  afterward: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  palette: z.tuple([z.string(), z.string()]).optional(),
  traits: traitVectorSchema.optional(),
});

export type ShowProps = z.infer<typeof showPropsSchema>;

/** Structured fields read off a `character` node's `props`. All optional. */
export const characterPropsSchema = z.object({
  showId: z.string().optional(),
  role: z.string().optional(),
  portrait: z.string().optional(),
  facing: z.string().optional(),
  /** How they behave under pressure, as short phrases. */
  traits: z.array(z.string()).optional(),
  appearanceNote: z.string().optional(),
  arc: z.string().optional(),
  recognizeIf: z.string().optional(),
});

export type CharacterProps = z.infer<typeof characterPropsSchema>;

/** Structured fields read off a `situation` or `persona` node's `props`. */
export const taxonomyPropsSchema = z.object({
  blurb: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  nudge: traitVectorSchema.optional(),
});

const nodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  label: z.string().min(1),
  text: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional(),
});

const edgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  type: z.string().min(1),
  weight: z.number().min(0).max(1).optional(),
  note: z.string().optional(),
});

const documentSchema = z.object({
  version: z.number().int().min(1),
  name: z.string().optional(),
  nodes: z.array(z.unknown()),
  edges: z.array(z.unknown()),
});

export type ParsedGraphDocument = {
  document: GraphDocument | null;
  diagnostics: GraphDiagnostic[];
};

function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'invalid';
  const path = issue.path.join('.');
  return path.length > 0 ? `${path}: ${issue.message}` : issue.message;
}

/**
 * Validate a raw parsed JSON value into a graph document.
 *
 * `source` only appears in diagnostics, so a person editing a file by hand can
 * see which file a complaint came from.
 */
export function parseGraphDocument(raw: unknown, source: string): ParsedGraphDocument {
  const diagnostics: GraphDiagnostic[] = [];
  const outer = documentSchema.safeParse(raw);

  if (!outer.success) {
    diagnostics.push({
      level: 'error',
      message: `${source}: not a graph document (${firstIssue(outer.error)}).`,
    });
    return { document: null, diagnostics };
  }

  if (outer.data.version !== 1) {
    diagnostics.push({
      level: 'warning',
      message: `${source}: version ${outer.data.version} is newer than this build understands (1). Reading it anyway.`,
    });
  }

  const nodes: GraphNode[] = [];
  const seenIds = new Set<string>();
  const unknownNodeTypes = new Set<string>();

  outer.data.nodes.forEach((entry, index) => {
    const parsed = nodeSchema.safeParse(entry);
    if (!parsed.success) {
      diagnostics.push({
        level: 'error',
        message: `${source}: node ${index} skipped — ${firstIssue(parsed.error)}.`,
      });
      return;
    }
    if (seenIds.has(parsed.data.id)) {
      diagnostics.push({
        level: 'warning',
        message: `${source}: duplicate node id "${parsed.data.id}" — the later one wins.`,
      });
    }
    seenIds.add(parsed.data.id);
    if (!isKnownNodeType(parsed.data.type)) unknownNodeTypes.add(parsed.data.type);
    nodes.push(parsed.data);
  });

  const edges: GraphEdge[] = [];
  const unknownEdgeTypes = new Set<string>();

  outer.data.edges.forEach((entry, index) => {
    const parsed = edgeSchema.safeParse(entry);
    if (!parsed.success) {
      diagnostics.push({
        level: 'error',
        message: `${source}: edge ${index} skipped — ${firstIssue(parsed.error)}.`,
      });
      return;
    }
    if (!isKnownEdgeType(parsed.data.type)) unknownEdgeTypes.add(parsed.data.type);
    edges.push(parsed.data);
  });

  if (unknownNodeTypes.size > 0) {
    diagnostics.push({
      level: 'warning',
      message: `${source}: node types not understood structurally, kept for traversal only — ${[
        ...unknownNodeTypes,
      ].join(', ')}.`,
    });
  }
  if (unknownEdgeTypes.size > 0) {
    diagnostics.push({
      level: 'warning',
      message: `${source}: edge types outside the vocabulary, walked weakly — ${[
        ...unknownEdgeTypes,
      ].join(', ')}.`,
    });
  }

  return {
    document: { version: outer.data.version, name: outer.data.name, nodes, edges },
    diagnostics,
  };
}

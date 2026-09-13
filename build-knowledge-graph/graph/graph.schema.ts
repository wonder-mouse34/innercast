// zod schema for graph.json (InnerCast character-arc graph).
// Usage: const graph = GraphSchema.parse(require("./graph.json"));
import { z } from 'zod';

const EndingTone = z.enum(['hopeful', 'bittersweet', 'tragic', 'ambiguous']);
const Intensity = z.enum(['light', 'moderate', 'heavy']);

export const ShowNode = z.object({
  id: z.string().startsWith('show:'),
  type: z.literal('show'),
  name: z.string(),
  format: z.string(),
  genres: z.array(z.string()),
  setting: z.string(),
  culture: z.string(),
  era: z.string(),
  tone: z.string(),
  seasons: z.string(),
});

export const CharacterNode = z.object({
  id: z.string().startsWith('char:'),
  type: z.literal('character'),
  name: z.string(),
  show: z.string().startsWith('show:'),
  role: z.string(), // spoiler-safe
});

export const ArcNode = z.object({
  id: z.string().startsWith('arc:'),
  type: z.literal('arc'),
  character: z.string().startsWith('char:'),
  show: z.string().startsWith('show:'),
  // spoiler-safe, user-facing
  title: z.string(),
  literal_situation: z.string(),
  hook: z.string(),
  why_relatable: z.string(),
  watch_for: z.array(z.string()),
  start_at: z.string(),
  span: z.string(),
  ending_tone: EndingTone,
  intensity: Intensity,
  // setting-free, for matching
  pattern_label: z.string(),
  pattern_text: z.string(),
  example_user_messages: z.array(z.string()),
  // NEVER send to the answer-writing LLM
  spoiler: z.object({
    summary: z.string(),
    key_events: z.array(z.string()),
    got_right: z.string(),
    got_wrong: z.string(),
  }),
});

const LabelNode = (type: string) =>
  z.object({ id: z.string().startsWith(`${type}:`), type: z.literal(type), label: z.string() });

export const PatternNode = LabelNode('pattern').extend({ description: z.string() });

export const Node = z.discriminatedUnion('type', [
  ShowNode,
  CharacterNode,
  ArcNode,
  PatternNode,
  LabelNode('emotion'),
  LabelNode('conflict'),
  LabelNode('situation'),
  LabelNode('warning'),
]);

export const Edge = z.object({
  source: z.string(),
  target: z.string(),
  type: z.enum([
    'IN_SHOW',
    'HAS_ARC',
    'INSTANCE_OF',
    'BROADER',
    'ABOUT',
    'FACES',
    'FEELS',
    'HAS_WARNING',
    'RELATES_TO',
    'RESONATES_WITH',
  ]),
  props: z
    .object({
      weight: z.number().optional(), // ABOUT
      phase: z.enum(['start', 'middle', 'end']).optional(), // FEELS
      relation: z.string().optional(), // RELATES_TO
      bridge: z.string().optional(), // RESONATES_WITH
      arcs: z.number().optional(), // show-level HAS_WARNING
      spoiler: z.boolean().optional(), // true = may reveal plot; hide from the answer-writing LLM
    })
    .optional(),
});

export const GraphSchema = z.object({
  meta: z.object({
    name: z.string(),
    version: z.string(),
    generated: z.string(),
    counts: z.record(z.number()),
    note: z.string(),
  }),
  nodes: z.array(Node),
  edges: z.array(Edge),
});

export type Graph = z.infer<typeof GraphSchema>;

// Helper: strip spoilers before handing arcs to the answer-writing LLM.
export const safeArc = ({ spoiler, ...rest }: z.infer<typeof ArcNode>) => rest;

/**
 * Domain types for InnerCast.
 *
 * The show corpus in `lib/data/shows.ts` is the retrieval database: every field
 * that appears here is either indexed for lexical search, used for trait
 * scoring, or quoted back to the user as grounding for a recommendation.
 */

export const TRAIT_AXES = [
  'comfort',
  'humor',
  'intensity',
  'pace',
  'escapism',
  'ensemble',
  'catharsis',
] as const;

export type TraitAxis = (typeof TRAIT_AXES)[number];

/** Every axis is 0-100. */
export type TraitVector = Record<TraitAxis, number>;

export type TraitAxisMeta = {
  axis: TraitAxis;
  label: string;
  lowLabel: string;
  highLabel: string;
  question: string;
  /** How much this axis counts when scoring shows. */
  weight: number;
  /** True when a show scoring above the person's number is worse than below. */
  ceiling?: boolean;
};

export const TRAIT_META: readonly TraitAxisMeta[] = [
  {
    axis: 'comfort',
    label: 'Comfort',
    lowLabel: 'Challenge me',
    highLabel: 'Hold me steady',
    question: 'Do you want a show that pushes you or one that steadies you?',
    weight: 1.3,
  },
  {
    axis: 'humor',
    label: 'Humour',
    lowLabel: 'Straight-faced',
    highLabel: 'Make me laugh',
    question: 'How much humour do you need in the mix?',
    weight: 1,
  },
  {
    axis: 'intensity',
    label: 'Intensity',
    lowLabel: 'Gentle',
    highLabel: 'I can take a lot',
    question: 'How much intensity can you sit with tonight?',
    weight: 1.2,
    ceiling: true,
  },
  {
    axis: 'pace',
    label: 'Pace',
    lowLabel: 'Slow and quiet',
    highLabel: 'Keep it moving',
    question: 'Slow and contemplative, or something that pulls you along?',
    weight: 0.9,
  },
  {
    axis: 'escapism',
    label: 'Escapism',
    lowLabel: 'Real life',
    highLabel: 'Take me elsewhere',
    question: 'Do you want to see your own life, or leave it for a while?',
    weight: 1,
  },
  {
    axis: 'ensemble',
    label: 'Company',
    lowLabel: 'One inner life',
    highLabel: 'A whole found family',
    question: 'One person figuring it out, or a group to sit with?',
    weight: 0.8,
  },
  {
    axis: 'catharsis',
    label: 'Catharsis',
    lowLabel: 'Keep it light',
    highLabel: 'Let me cry',
    question: 'Are you looking for release, or relief?',
    weight: 1.1,
    ceiling: true,
  },
];

export type SituationId =
  | 'grief'
  | 'breakup'
  | 'divorce'
  | 'burnout'
  | 'job-loss'
  | 'career-drift'
  | 'new-city'
  | 'loneliness'
  | 'anxiety'
  | 'depression'
  | 'low-motivation'
  | 'caregiving'
  | 'new-parent'
  | 'family-conflict'
  | 'identity-questions'
  | 'coming-out'
  | 'displacement'
  | 'illness'
  | 'recovery'
  | 'money-stress'
  | 'creative-block'
  | 'insomnia'
  | 'teen-turbulence'
  | 'midlife'
  | 'friendship-rupture'
  | 'toxic-workplace'
  | 'empty-nest'
  | 're-entry'
  | 'existential-doubt'
  | 'need-to-laugh';

export type Situation = {
  id: SituationId;
  label: string;
  blurb: string;
  /** Terms that should pull this situation out of free-text input. */
  keywords: string[];
  /** Gentle prior on the trait vector when this situation is detected. */
  nudge: Partial<TraitVector>;
};

/**
 * How someone describes themselves, independent of what they want to watch.
 * Characters in the corpus carry the same tags, so a person can be matched to a
 * person on screen rather than only to a genre.
 */
export type PersonaTraitId =
  | 'caretaker'
  | 'deflector'
  | 'withdrawer'
  | 'overthinker'
  | 'over-functioner'
  | 'peacekeeper'
  | 'outsider'
  | 'rebuilder'
  | 'quietly-angry'
  | 'seeker'
  | 'stoic'
  | 'tender'
  | 'perfectionist'
  | 'drifter'
  | 'newly-alone'
  | 'striver';

export type PersonaTrait = {
  id: PersonaTraitId;
  /** First-person chip label, e.g. "I'm the one everyone leans on". */
  label: string;
  /** Short expansion shown under the label. */
  blurb: string;
  /** Terms that surface this pattern from free-text input. */
  keywords: string[];
};

/**
 * A person on screen. This is the unit a recommendation is built around: the
 * app argues from a character's inner life outward to the show.
 */
export type Character = {
  id: string;
  showId: string;
  name: string;
  /** Their place in the story, e.g. "line cook, late twenties". */
  role: string;
  /** Their inner life in a sentence or two. Quoted back to the user. */
  portrait: string;
  /** What they are living through — the bridge to the person's situation. */
  facing: string;
  /** How they behave under pressure. Indexed for lexical search. */
  traits: string[];
  /** Self-descriptions this character mirrors. */
  personaTags: PersonaTraitId[];
  situations: SituationId[];
  /** Where they appear when they are not present throughout the series. */
  appearanceNote?: string;
  /** What shifts for them across the series. */
  arc: string;
  /** Completes "You may recognise yourself in them if …". */
  recognizeIf: string;
};

export type Show = {
  id: string;
  title: string;
  years: string;
  seasons: number;
  episodes: number;
  runtimeMinutes: number;
  origin: string;
  genres: string[];
  logline: string;
  synopsis: string;
  tone: string[];
  /** Ending classification, intentionally hidden until spoilers are revealed. */
  endingTone?: 'happy' | 'unhappy' | 'bittersweet' | 'open';
  /** Spoiler-bearing explanation of the ending classification. */
  endingNote?: string;
  /** Expanded story description that may contain spoilers. */
  spoilerSummary?: string;
  themes: string[];
  situations: SituationId[];
  traits: TraitVector;
  contentWarnings: string[];
  /** The claim the app makes about this show's usefulness. Quoted to the user. */
  whyItHelps: string;
  /** What tends to be left behind after watching — feeds reflection prompts. */
  afterward: string;
  keywords: string[];
  palette: [string, string];
};

export type ChunkKind = 'situation' | 'story' | 'texture' | 'character';

export type ShowChunk = {
  showId: string;
  kind: ChunkKind;
  text: string;
  tokens: string[];
  /** Set on `character` chunks. */
  characterId?: string;
};

export type ScoreBreakdown = {
  lexical: number;
  traitFit: number;
  situation: number;
  /** How closely someone on screen mirrors this person and their situation. */
  character: number;
  /**
   * How strongly the knowledge graph connects this person to this show, 0-1
   * relative to the strongest show the walk reached. Absent on sessions saved
   * before a graph was in play, and zero when the walk never got here.
   */
  graph?: number;
  total: number;
};

/**
 * The path the graph walk took to reach a show, already in words.
 *
 * Kept as plain strings so the trace UI and the prompt can use it without
 * knowing anything about nodes and edges.
 */
export type GraphTrace = {
  /** What the walk started from: a self-description or a situation. */
  seedLabel: string;
  /** The whole path on one line, "→" between hops. */
  sentence: string;
  /** One hop per line, for a trace with room to breathe. */
  lines: string[];
  strength: number;
  /** Characters the walk passed through on the way here, strongest first. */
  anchors: { characterId: string; name: string; sentence: string; strength: number }[];
};

/** A person on screen who lines up with the person watching. */
export type MatchedCharacter = {
  characterId: string;
  name: string;
  showId: string;
  score: number;
  /** Self-descriptions shared with the person. */
  sharedPersona: PersonaTraitId[];
  sharedSituations: SituationId[];
  /** Words from their record that echoed what the person wrote. */
  matchedTerms: string[];
};

export type RetrievedShow = {
  show: Show;
  score: ScoreBreakdown;
  /** Chunk kinds that matched, best first. */
  matchedChunks: { kind: ChunkKind; score: number; excerpt: string }[];
  matchedTerms: string[];
  matchedSituations: SituationId[];
  /** Characters who line up with this person, best first. */
  matchedCharacters: MatchedCharacter[];
  /** How the knowledge graph got from this person to this show, when it did. */
  graphPath?: GraphTrace;
  /** Axes where the show sits close to what the person asked for. */
  alignedAxes: TraitAxis[];
  /** Axes where the show pushes past what the person asked for. */
  strainedAxes: TraitAxis[];
};

export type RecommendationEngine = 'local-model' | 'on-device';

export type Recommendation = {
  showId: string;
  /** Why this show, in the app's voice, grounded in the retrieved record. */
  reason: string;
  /** The character the recommendation is built around. */
  characterId?: string;
  characterName?: string;
  /** One sentence on how that character lines up with this person. */
  characterLink?: string;
  /** Optional caution: content, commitment, or timing. */
  caution?: string;
  fit: number;
};

export type MatchSession = {
  id: string;
  createdAt: string;
  situationText: string;
  selectedSituations: SituationId[];
  traits: TraitVector;
  /** Self-descriptions in play when this match ran. */
  personaTags?: PersonaTraitId[];
  /** Genres selected for this match. Empty means the full library. */
  selectedGenres?: import('@/lib/genres').GenreFilter[];
  engine: RecommendationEngine;
  engineNote?: string;
  modelName?: string;
  recommendations: Recommendation[];
  retrieval: {
    showId: string;
    score: ScoreBreakdown;
    matchedTerms: string[];
    matchedSituations: SituationId[];
    chunkKinds: ChunkKind[];
    /** Ids of the characters that carried this show into the results. */
    characterIds?: string[];
    /** The graph path that reached this show, when a graph was in play. */
    graphPath?: GraphTrace;
  }[];
};

export type WatchStatus = 'saved' | 'watching' | 'finished' | 'not-for-me';

export type WatchEntry = {
  showId: string;
  status: WatchStatus;
  updatedAt: string;
  fromSessionId?: string;
};

export type MoodScore = 1 | 2 | 3 | 4 | 5;

export type ReflectionAnswer = {
  promptId: string;
  prompt: string;
  answer: string;
};

export type Reflection = {
  id: string;
  createdAt: string;
  showId?: string;
  /** Character context is optional so entries saved before guided reflection remain valid. */
  characterId?: string;
  characterName?: string;
  situationText?: string;
  situations: SituationId[];
  moodBefore: MoodScore;
  moodAfter?: MoodScore;
  answers: ReflectionAnswer[];
  takeaway?: string;
  sharedToCircleIds: string[];
};

export type ReflectionPrompt = {
  id: string;
  text: string;
  /** `any` prompts are always eligible. */
  situations: SituationId[] | 'any';
  kind: 'opening' | 'deepening' | 'closing';
};

export type CirclePost = {
  id: string;
  author: string;
  initials: string;
  createdAt: string;
  body: string;
  showId?: string;
  likes: number;
  isMine?: boolean;
};

export type Circle = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  situations: SituationId[];
  traitProfile: Partial<TraitVector>;
  memberCount: number;
  cadence: string;
  weeklyPrompt: string;
  nowWatchingShowId?: string;
  posts: CirclePost[];
  isCustom?: boolean;
};

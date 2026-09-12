/**
 * Domain types for Lantern.
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

export type ChunkKind = 'situation' | 'story' | 'texture';

export type ShowChunk = {
  showId: string;
  kind: ChunkKind;
  text: string;
  tokens: string[];
};

export type ScoreBreakdown = {
  lexical: number;
  traitFit: number;
  situation: number;
  total: number;
};

export type RetrievedShow = {
  show: Show;
  score: ScoreBreakdown;
  /** Chunk kinds that matched, best first. */
  matchedChunks: { kind: ChunkKind; score: number; excerpt: string }[];
  matchedTerms: string[];
  matchedSituations: SituationId[];
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
  /** Optional caution: content, commitment, or timing. */
  caution?: string;
  /** How to watch it — dosing, episode to start on, what to pair it with. */
  howToWatch?: string;
  fit: number;
};

export type MatchSession = {
  id: string;
  createdAt: string;
  situationText: string;
  selectedSituations: SituationId[];
  traits: TraitVector;
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

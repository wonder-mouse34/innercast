import type { ReflectionPrompt, SituationId } from '@/lib/types';

/**
 * Reflection prompt bank. Prompts are selected by matching a show's situation
 * tags against the entry's situations, with `any` prompts as filler so every
 * reflection has an opening, a deepening and a closing question.
 */
export const REFLECTION_PROMPTS: readonly ReflectionPrompt[] = [
  {
    id: 'open-why-now',
    text: 'What made you reach for something to watch tonight?',
    situations: 'any',
    kind: 'opening',
  },
  {
    id: 'open-scene',
    text: 'Which moment stayed with you after the screen went off?',
    situations: 'any',
    kind: 'opening',
  },
  {
    id: 'open-recognise',
    text: 'Who in it did you recognise, and how did that feel?',
    situations: 'any',
    kind: 'opening',
  },
  {
    id: 'grief-said',
    text: 'Is there something the show said about loss that you have not been able to say?',
    situations: ['grief', 'caregiving', 'illness'],
    kind: 'deepening',
  },
  {
    id: 'grief-permission',
    text: 'What did it give you permission to feel that you had been holding back?',
    situations: ['grief', 'breakup', 'divorce', 'friendship-rupture', 'empty-nest'],
    kind: 'deepening',
  },
  {
    id: 'burnout-cost',
    text: 'Where in your week are you paying a cost you have stopped noticing?',
    situations: ['burnout', 'toxic-workplace', 'caregiving', 'new-parent'],
    kind: 'deepening',
  },
  {
    id: 'burnout-one-thing',
    text: 'Name one thing you could put down this week without anything collapsing.',
    situations: ['burnout', 'toxic-workplace', 'anxiety', 'money-stress'],
    kind: 'closing',
  },
  {
    id: 'anxiety-body',
    text: 'How did your body feel while you watched — tighter, or looser?',
    situations: ['anxiety', 'insomnia', 'illness', 'depression'],
    kind: 'deepening',
  },
  {
    id: 'lonely-who',
    text: 'Who came to mind while you watched, and what stops you contacting them?',
    situations: ['loneliness', 'new-city', 'friendship-rupture', 'displacement', 'empty-nest'],
    kind: 'deepening',
  },
  {
    id: 'identity-mirror',
    text: 'Which part of the character was you, and which part do you wish were you?',
    situations: ['identity-questions', 'coming-out', 'midlife', 'career-drift', 're-entry'],
    kind: 'deepening',
  },
  {
    id: 'family-sentence',
    text: 'If you could say one sentence to the family member on your mind, what would it be?',
    situations: ['family-conflict', 'caregiving', 'displacement', 'teen-turbulence'],
    kind: 'deepening',
  },
  {
    id: 'recovery-honest',
    text: 'What did it show you about the pattern you are trying not to repeat?',
    situations: ['recovery', 'depression', 'low-motivation'],
    kind: 'deepening',
  },
  {
    id: 'work-worth',
    text: 'What are you currently trading, and is the trade still one you agree with?',
    situations: ['career-drift', 'job-loss', 'toxic-workplace', 'creative-block', 'midlife'],
    kind: 'deepening',
  },
  {
    id: 'money-fear',
    text: 'What is the fear underneath the number you keep checking?',
    situations: ['money-stress', 'job-loss'],
    kind: 'deepening',
  },
  {
    id: 'creative-small',
    text: 'What is the smallest version of the thing you are avoiding making?',
    situations: ['creative-block', 'low-motivation'],
    kind: 'closing',
  },
  {
    id: 'existential-comfort',
    text: 'What did it offer you in place of an answer?',
    situations: ['existential-doubt', 'grief', 'illness'],
    kind: 'deepening',
  },
  {
    id: 'teen-younger',
    text: 'What would you tell the younger version of yourself who is in this episode?',
    situations: ['teen-turbulence', 'coming-out', 'identity-questions'],
    kind: 'deepening',
  },
  {
    id: 'laugh-noticed',
    text: 'What did you laugh at, and when did you last laugh like that off-screen?',
    situations: ['need-to-laugh', 'depression', 'burnout'],
    kind: 'deepening',
  },
  {
    id: 'reentry-pace',
    text: 'What are you expecting yourself to do at full speed that deserves half?',
    situations: ['re-entry', 'illness', 'recovery', 'new-parent'],
    kind: 'closing',
  },
  {
    id: 'close-carry',
    text: 'What are you taking from tonight into tomorrow?',
    situations: 'any',
    kind: 'closing',
  },
  {
    id: 'close-kinder',
    text: 'What would being one degree kinder to yourself look like this week?',
    situations: 'any',
    kind: 'closing',
  },
  {
    id: 'close-next',
    text: 'Is there one small thing this makes you want to do differently?',
    situations: 'any',
    kind: 'closing',
  },
];

export const MOOD_LABELS: Record<number, string> = {
  1: 'Very low',
  2: 'Low',
  3: 'Level',
  4: 'Steadier',
  5: 'Good',
};

const KIND_ORDER: ReflectionPrompt['kind'][] = ['opening', 'deepening', 'closing'];

function matchesSituations(prompt: ReflectionPrompt, situations: SituationId[]): boolean {
  if (prompt.situations === 'any') return false;
  return prompt.situations.some((situation) => situations.includes(situation));
}

/**
 * Prompts for one kind, most relevant first: situation-specific prompts before
 * the general ones, so a grief entry never opens with a generic question.
 */
export function promptPool(
  kind: ReflectionPrompt['kind'],
  situations: SituationId[],
): ReflectionPrompt[] {
  const ofKind = REFLECTION_PROMPTS.filter((prompt) => prompt.kind === kind);
  const specific = ofKind.filter((prompt) => matchesSituations(prompt, situations));
  const general = ofKind.filter((prompt) => !matchesSituations(prompt, situations));
  return [...specific, ...general];
}

/** One opening, one deepening and one closing question for a set of situations. */
export function selectPrompts(situations: SituationId[]): ReflectionPrompt[] {
  return KIND_ORDER.map((kind) => promptPool(kind, situations)[0]).filter(
    (prompt): prompt is ReflectionPrompt => Boolean(prompt),
  );
}

/** Look a prompt up by id, for entries saved with questions no longer shown. */
export function promptById(id: string): ReflectionPrompt | undefined {
  return REFLECTION_PROMPTS.find((prompt) => prompt.id === id);
}

/** The next question of the same kind, cycling through the pool. */
export function swapPrompt(current: ReflectionPrompt, situations: SituationId[]): ReflectionPrompt {
  const pool = promptPool(current.kind, situations);
  if (pool.length < 2) return current;
  const index = pool.findIndex((prompt) => prompt.id === current.id);
  return pool[(index + 1) % pool.length];
}

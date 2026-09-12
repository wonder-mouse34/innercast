import { PERSONA_TRAITS } from '@/lib/data/personaTraits';
import { SITUATIONS } from '@/lib/data/situations';
import type { PersonaTraitId, SituationId } from '@/lib/types';

const STOPWORDS = new Set([
  'a',
  'about',
  'after',
  'again',
  'all',
  'also',
  'am',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'being',
  'but',
  'by',
  'can',
  'cannot',
  'did',
  'do',
  'does',
  'doing',
  'done',
  'for',
  'from',
  'get',
  'got',
  'had',
  'has',
  'have',
  'having',
  'he',
  'her',
  'here',
  'him',
  'his',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'like',
  'me',
  'more',
  'most',
  'much',
  'my',
  'no',
  'not',
  'now',
  'of',
  'on',
  'one',
  'only',
  'or',
  'other',
  'our',
  'out',
  'over',
  'own',
  'really',
  'she',
  'should',
  'so',
  'some',
  'something',
  'still',
  'such',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'thing',
  'things',
  'this',
  'those',
  'to',
  'too',
  'up',
  'us',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'will',
  'with',
  'would',
  'you',
  'your',
]);

const CONTRACTIONS: Record<string, string> = {
  "can't": 'cannot',
  "won't": 'will not',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "i'm": 'i am',
  "i've": 'i have',
  "it's": 'it is',
  "that's": 'that is',
  "there's": 'there is',
  "haven't": 'have not',
  "hasn't": 'has not',
  "isn't": 'is not',
  "wasn't": 'was not',
  "aren't": 'are not',
  "couldn't": 'could not',
  "shouldn't": 'should not',
  "wouldn't": 'would not',
  "we're": 'we are',
  "they're": 'they are',
  "you're": 'you are',
};

/**
 * Query-side vocabulary bridge. People describe situations in plain words; the
 * corpus is written in another register. Each key expands to extra query terms.
 */
const SYNONYMS: Record<string, string[]> = {
  sad: ['grief', 'depression', 'sorrow'],
  cry: ['catharsis', 'grief', 'tears'],
  crying: ['catharsis', 'grief'],
  tired: ['exhausted', 'burnout', 'depleted'],
  exhausted: ['burnout', 'depleted'],
  stressed: ['anxiety', 'burnout', 'overwhelmed'],
  overwhelmed: ['anxiety', 'burnout'],
  scared: ['anxiety', 'fear', 'dread'],
  angry: ['rage', 'fury', 'resentment'],
  rage: ['anger', 'resentment'],
  numb: ['depression', 'flat', 'empty'],
  stuck: ['drift', 'stagnant', 'rut'],
  lonely: ['loneliness', 'isolation', 'alone'],
  friend: ['friendship', 'friends'],
  friends: ['friendship'],
  work: ['job', 'career', 'workplace', 'office'],
  job: ['work', 'career', 'workplace'],
  boss: ['workplace', 'office', 'corporate'],
  money: ['debt', 'precarity', 'financial', 'poverty'],
  broke: ['money', 'debt', 'precarity'],
  mum: ['mother', 'parent', 'family'],
  mom: ['mother', 'parent', 'family'],
  dad: ['father', 'parent', 'family'],
  parents: ['family', 'mother', 'father'],
  kids: ['children', 'parenting'],
  baby: ['newborn', 'parenting', 'infant'],
  sick: ['illness', 'diagnosis', 'health'],
  hospital: ['illness', 'medical', 'treatment'],
  therapy: ['therapist', 'counselling', 'mental health'],
  therapist: ['therapy', 'counselling'],
  drinking: ['alcohol', 'addiction', 'sober'],
  sober: ['sobriety', 'recovery', 'addiction'],
  divorce: ['separation', 'marriage', 'divorced'],
  breakup: ['heartbreak', 'relationship', 'ex'],
  moved: ['moving', 'relocation', 'new city'],
  immigrant: ['migration', 'diaspora', 'displacement'],
  faith: ['religion', 'belief', 'god'],
  god: ['faith', 'religion'],
  gay: ['queer', 'coming out'],
  queer: ['gay', 'coming out', 'lesbian'],
  funny: ['comedy', 'humour', 'laugh'],
  laugh: ['comedy', 'funny', 'humour'],
  light: ['gentle', 'comfort', 'low stakes'],
  gentle: ['comfort', 'soothing', 'calm'],
  sleep: ['insomnia', 'night', 'awake'],
  school: ['teenagers', 'adolescence', 'high school'],
  teenager: ['adolescence', 'teenagers', 'school'],
  art: ['creative', 'craft', 'making'],
  writing: ['creative', 'craft', 'writer'],
  purpose: ['meaning', 'existential'],
  meaning: ['purpose', 'existential', 'mortality'],
  death: ['mortality', 'grief', 'dying'],
  dying: ['death', 'mortality', 'terminal'],
  hopeless: ['despair', 'depression'],
};

/** Light suffix stripping — enough to match "grieving" against "grief" family. */
export function stem(word: string): string {
  let out = word;
  const rules: [string, string][] = [
    ['ingly', ''],
    ['edly', ''],
    ['ing', ''],
    ['ies', 'y'],
    ['ied', 'y'],
    ['ness', ''],
    ['ments', 'ment'],
    ['ed', ''],
    ['es', ''],
    ['s', ''],
  ];
  for (const [suffix, replacement] of rules) {
    if (out.length > suffix.length + 3 && out.endsWith(suffix)) {
      out = out.slice(0, out.length - suffix.length) + replacement;
      break;
    }
  }
  return out;
}

export function normalizeText(input: string): string {
  let text = input.toLowerCase();
  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    text = text.split(contraction).join(expansion);
  }
  return text
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Content-bearing stems, deduplicated. */
export function tokenize(input: string): string[] {
  const normalized = normalizeText(input);
  if (!normalized) return [];
  const tokens: string[] = [];
  for (const raw of normalized.split(' ')) {
    const word = raw.replace(/^['-]+|['-]+$/g, '');
    if (word.length < 2 || STOPWORDS.has(word)) continue;
    tokens.push(stem(word));
  }
  return tokens;
}

/** Query tokens plus synonym expansion, so plain language reaches the corpus. */
export function tokenizeQuery(input: string): string[] {
  const normalized = normalizeText(input);
  const base = tokenize(input);
  const expanded = new Set(base);
  for (const raw of normalized.split(' ')) {
    const extras = SYNONYMS[raw];
    if (!extras) continue;
    for (const extra of extras) for (const token of tokenize(extra)) expanded.add(token);
  }
  return [...expanded];
}

export type SituationHit = { id: SituationId; strength: number; matched: string[] };

/**
 * Read situation tags out of free text. Multi-word keywords are matched as
 * phrases, single words against the stemmed token set.
 */
export function detectSituations(input: string): SituationHit[] {
  const normalized = normalizeText(input);
  if (!normalized) return [];
  const tokenSet = new Set(tokenize(input));
  const hits: SituationHit[] = [];

  for (const situation of SITUATIONS) {
    const matched: string[] = [];
    let strength = 0;
    for (const keyword of situation.keywords) {
      if (keyword.includes(' ')) {
        if (normalized.includes(keyword)) {
          matched.push(keyword);
          strength += 2;
        }
        continue;
      }
      if (tokenSet.has(stem(keyword))) {
        matched.push(keyword);
        strength += 1;
      }
    }
    if (strength > 0) hits.push({ id: situation.id, strength, matched });
  }

  return hits.sort((a, b) => b.strength - a.strength);
}

export type PersonaHit = { id: PersonaTraitId; strength: number; matched: string[] };

/**
 * Read self-description patterns out of free text, the same way situations are
 * read. Phrases are matched against the normalized string so "I keep the peace"
 * lands even though every word in it is a stopword on its own.
 */
export function detectPersonas(input: string): PersonaHit[] {
  const normalized = normalizeText(input);
  if (!normalized) return [];
  const tokenSet = new Set(tokenize(input));
  const hits: PersonaHit[] = [];

  for (const trait of PERSONA_TRAITS) {
    const matched: string[] = [];
    let strength = 0;
    for (const keyword of trait.keywords) {
      if (keyword.includes(' ')) {
        if (normalized.includes(keyword)) {
          matched.push(keyword);
          strength += 2;
        }
        continue;
      }
      if (tokenSet.has(stem(keyword))) {
        matched.push(keyword);
        strength += 1;
      }
    }
    if (strength > 0) hits.push({ id: trait.id, strength, matched });
  }

  return hits.sort((a, b) => b.strength - a.strength);
}

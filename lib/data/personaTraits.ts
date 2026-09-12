import type { PersonaTrait, PersonaTraitId } from '@/lib/types';

/**
 * Self-description taxonomy.
 *
 * These are the person's own patterns, not their viewing preferences. Every
 * character in `lib/data/characters.ts` carries tags from this list, which is
 * what lets the app match a person to a person on screen rather than to a genre.
 */
export const PERSONA_TRAITS: readonly PersonaTrait[] = [
  {
    id: 'caretaker',
    label: 'I hold everyone else up',
    blurb: 'People come to you. Nobody asks how you are.',
    keywords: [
      'caring for',
      'looking after',
      'everyone relies on me',
      'everyone depends on me',
      'hold it together for',
      'carer',
      'caregiver',
      'nobody asks',
      'strong one',
      'responsible for everyone',
    ],
  },
  {
    id: 'deflector',
    label: 'I joke instead of saying it',
    blurb: 'Humour arrives before the honest sentence does.',
    keywords: [
      'joke about it',
      'make jokes',
      'laugh it off',
      'sarcastic',
      'deflect',
      'making light of',
      'funny about it',
    ],
  },
  {
    id: 'withdrawer',
    label: 'I go quiet when it is too much',
    blurb: 'You disappear rather than ask for anything.',
    keywords: [
      'go quiet',
      'shut down',
      'withdraw',
      'isolate',
      'stopped replying',
      'cancel plans',
      'avoid people',
      'hiding',
      'shut myself',
    ],
  },
  {
    id: 'overthinker',
    label: 'I think everything to death',
    blurb: 'You replay conversations and rehearse ones that never happen.',
    keywords: [
      'overthinking',
      'overthink',
      'ruminating',
      'spiralling',
      'spiraling',
      'racing thoughts',
      'cannot switch off',
      'replaying',
      'analysing',
      'analyzing',
    ],
  },
  {
    id: 'over-functioner',
    label: 'I work harder when I am falling apart',
    blurb: 'Productivity is how you avoid sitting still.',
    keywords: [
      'working more',
      'keep busy',
      'staying busy',
      'throwing myself into work',
      'overworking',
      'cannot sit still',
      'distract myself with work',
      'burying myself',
    ],
  },
  {
    id: 'peacekeeper',
    label: 'I keep the peace instead of being honest',
    blurb: 'You would rather absorb it than start something.',
    keywords: [
      'keep the peace',
      'avoid conflict',
      'do not want a fight',
      'people pleaser',
      'saying yes',
      'cannot say no',
      'smoothing things over',
      'walking on eggshells',
    ],
  },
  {
    id: 'outsider',
    label: 'I have never quite belonged',
    blurb: 'Every room feels like one you wandered into.',
    keywords: [
      'do not belong',
      'do not fit in',
      'outsider',
      'on the edge of',
      'never fitted',
      'odd one out',
      'different from everyone',
      'imposter',
    ],
  },
  {
    id: 'rebuilder',
    label: 'I am starting over from scratch',
    blurb: 'The old life is gone and the new one is unfurnished.',
    keywords: [
      'starting over',
      'start again',
      'from scratch',
      'rebuilding',
      'new chapter',
      'blank slate',
      'starting from nothing',
      'fresh start',
    ],
  },
  {
    id: 'quietly-angry',
    label: 'I am angrier than I let on',
    blurb: 'Something under the surface has nowhere to go.',
    keywords: [
      'furious',
      'resentful',
      'resentment',
      'bitter',
      'seething',
      'angry',
      'rage',
      'unfair',
      'holding it in',
    ],
  },
  {
    id: 'seeker',
    label: 'I am working out who I am',
    blurb: 'The old answers about yourself stopped fitting.',
    keywords: [
      'who i am',
      'figuring myself out',
      'identity',
      'do not know myself',
      'searching',
      'questioning everything',
      'what i believe',
      'lost myself',
    ],
  },
  {
    id: 'stoic',
    label: 'I get on with it rather than talk',
    blurb: 'Feelings are handled privately, or not at all.',
    keywords: [
      'get on with it',
      'do not talk about',
      'keep it to myself',
      'not a talker',
      'stiff upper lip',
      'push through',
      'no point complaining',
      'suck it up',
    ],
  },
  {
    id: 'tender',
    label: 'I feel everything very hard',
    blurb: 'Small things land at full volume.',
    keywords: [
      'too sensitive',
      'cry easily',
      'feel everything',
      'thin skinned',
      'takes things to heart',
      'emotional',
      'tender',
      'overwhelmed by feelings',
    ],
  },
  {
    id: 'perfectionist',
    label: 'Good enough never feels enough',
    blurb: 'The bar moves the moment you reach it.',
    keywords: [
      'perfectionist',
      'never good enough',
      'not good enough',
      'high standards',
      'failing at',
      'should be further',
      'behind everyone',
      'not achieving',
    ],
  },
  {
    id: 'drifter',
    label: 'I do not know what I want next',
    blurb: 'No pull in any direction, just the current.',
    keywords: [
      'do not know what i want',
      'drifting',
      'aimless',
      'no direction',
      'lost',
      'coasting',
      'going through the motions',
      'no plan',
    ],
  },
  {
    id: 'newly-alone',
    label: 'I am on my own for the first time in a while',
    blurb: 'The evenings are suddenly yours to fill.',
    keywords: [
      'on my own',
      'living alone',
      'by myself',
      'empty flat',
      'empty house',
      'moved out',
      'first time alone',
      'nobody home',
    ],
  },
  {
    id: 'striver',
    label: 'I need something to aim at',
    blurb: 'You are steadied by ambition, not by rest.',
    keywords: [
      'need a goal',
      'ambitious',
      'driven',
      'need a project',
      'something to work towards',
      'need purpose',
      'want to build',
      'prove myself',
    ],
  },
];

export const PERSONA_BY_ID: Record<PersonaTraitId, PersonaTrait> = Object.fromEntries(
  PERSONA_TRAITS.map((trait) => [trait.id, trait]),
) as Record<PersonaTraitId, PersonaTrait>;

export function personaLabel(id: PersonaTraitId): string {
  return PERSONA_BY_ID[id]?.label ?? id;
}

/** Third-person phrasing, for describing a character rather than the person. */
export function personaEcho(id: PersonaTraitId): string {
  const map: Record<PersonaTraitId, string> = {
    caretaker: 'holds everyone else up',
    deflector: 'jokes instead of saying it',
    withdrawer: 'goes quiet when it is too much',
    overthinker: 'thinks everything to death',
    'over-functioner': 'works harder the worse it gets',
    peacekeeper: 'keeps the peace instead of being honest',
    outsider: 'has never quite belonged',
    rebuilder: 'is starting over from scratch',
    'quietly-angry': 'is angrier than they let on',
    seeker: 'is working out who they are',
    stoic: 'gets on with it rather than talk',
    tender: 'feels everything very hard',
    perfectionist: 'cannot call anything good enough',
    drifter: 'does not know what they want next',
    'newly-alone': 'is on their own for the first time in a while',
    striver: 'needs something to aim at',
  };
  return map[id] ?? id;
}

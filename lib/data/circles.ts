import type { Circle } from '@/lib/types';

type SeedPost = {
  id: string;
  author: string;
  initials: string;
  hoursAgo: number;
  body: string;
  showId?: string;
  likes: number;
};

type SeedCircle = Omit<Circle, 'posts'> & { posts: SeedPost[] };

const SEEDS: readonly SeedCircle[] = [
  {
    id: 'first-year-without',
    name: 'The First Year Without',
    tagline: 'For people in the first twelve months after a death.',
    description:
      'A slow-moving circle for anyone inside the first year of a bereavement. We watch things about loss on purpose, and things about nothing at all when that is what the week needs.',
    situations: ['grief', 'caregiving', 'existential-doubt'],
    traitProfile: { catharsis: 76, comfort: 66, intensity: 48 },
    memberCount: 312,
    cadence: 'One show a fortnight · Sunday thread',
    weeklyPrompt: 'What has someone said to you recently that actually helped?',
    nowWatchingShowId: 'after-life',
    posts: [
      {
        id: 'p1',
        author: 'Mira',
        initials: 'MI',
        hoursAgo: 5,
        body: 'Episode four of After Life broke me open in a good way. The bench scenes are the only depiction of grief small talk I have believed.',
        showId: 'after-life',
        likes: 24,
      },
      {
        id: 'p2',
        author: 'Tomas',
        initials: 'TO',
        hoursAgo: 20,
        body: 'Nine months in. I could not do anything heavy this week so I watched Midnight Diner instead and did not feel guilty about it. Progress, maybe.',
        showId: 'midnight-diner',
        likes: 41,
      },
      {
        id: 'p3',
        author: 'Ade',
        initials: 'AD',
        hoursAgo: 52,
        body: 'Warning for the group: the family dinner episode of The Bear is extraordinary and I was not remotely ready for it. Have someone to text afterwards.',
        showId: 'the-bear',
        likes: 18,
      },
    ],
  },
  {
    id: 'running-on-empty',
    name: 'Running On Empty',
    tagline: 'Burnout, and the slow business of refilling.',
    description:
      'We are all tired in slightly different ways. This circle leans towards short episodes, low intensity, and shows about work that make it clear the problem was never your character.',
    situations: ['burnout', 'toxic-workplace', 'anxiety', 'career-drift'],
    traitProfile: { comfort: 74, intensity: 30, pace: 38 },
    memberCount: 587,
    cadence: 'One short series a month · midweek check-in',
    weeklyPrompt: 'What did you drop this week, and what happened?',
    nowWatchingShowId: 'severance',
    posts: [
      {
        id: 'p1',
        author: 'Jules',
        initials: 'JU',
        hoursAgo: 3,
        body: 'Severance is uncomfortably close to home but somehow easier than watching a show about someone who is just sad. Displacement works.',
        showId: 'severance',
        likes: 33,
      },
      {
        id: 'p2',
        author: 'Priya',
        initials: 'PR',
        hoursAgo: 26,
        body: 'Watched Enlightened after someone here recommended it. The basement. The BASEMENT. I have been in that basement for two years.',
        showId: 'enlightened',
        likes: 27,
      },
      {
        id: 'p3',
        author: 'Sam',
        initials: 'SA',
        hoursAgo: 70,
        body: 'Reminder that Bake Off counts as recovery. Two episodes, no thoughts, asleep by ten.',
        showId: 'bake-off',
        likes: 52,
      },
    ],
  },
  {
    id: 'new-here',
    name: 'New Here',
    tagline: 'Recently moved, nobody to call yet.',
    description:
      'For people rebuilding a social life from zero in a new city or country. Heavy on ensembles and found families, because that is what an empty flat needs.',
    situations: ['new-city', 'loneliness', 'displacement', 'identity-questions'],
    traitProfile: { ensemble: 82, comfort: 72, humor: 62 },
    memberCount: 244,
    cadence: 'Rolling recommendations · Friday night watch-along',
    weeklyPrompt: 'What is one thing about this place you are starting to like?',
    nowWatchingShowId: 'schitts-creek',
    posts: [
      {
        id: 'p1',
        author: 'Lena',
        initials: 'LE',
        hoursAgo: 8,
        body: 'Three weeks in a city where I know two people. Schitt\u2019s Creek is doing the work of a friend group until I find one.',
        showId: 'schitts-creek',
        likes: 46,
      },
      {
        id: 'p2',
        author: 'Kofi',
        initials: 'KO',
        hoursAgo: 34,
        body: 'Pachinko helped me stop framing my move as a failure. Different scale entirely, but the reframe held.',
        showId: 'pachinko',
        likes: 19,
      },
    ],
  },
  {
    id: 'quiet-hours',
    name: 'Quiet Hours',
    tagline: 'For 2am. Nothing frightening, nothing loud.',
    description:
      'A circle for insomniacs, night shifts, new parents and anyone recovering. Strict rules: gentle, short, no cliffhangers, no jump scares, nothing that will keep you awake thinking.',
    situations: ['insomnia', 'anxiety', 'illness', 'new-parent'],
    traitProfile: { comfort: 92, intensity: 16, pace: 26, catharsis: 24 },
    memberCount: 806,
    cadence: 'Always on · post whenever you are awake',
    weeklyPrompt: 'What got you back to sleep last night?',
    nowWatchingShowId: 'midnight-diner',
    posts: [
      {
        id: 'p1',
        author: 'Noor',
        initials: 'NO',
        hoursAgo: 2,
        body: 'It is 3:40 and Midnight Diner episode 11 is exactly the right length for the middle of the night.',
        showId: 'midnight-diner',
        likes: 15,
      },
      {
        id: 'p2',
        author: 'Danny',
        initials: 'DA',
        hoursAgo: 14,
        body: 'Newborn week five. Bluey is seven minutes long which is the entire length of my attention span right now.',
        showId: 'bluey',
        likes: 63,
      },
      {
        id: 'p3',
        author: 'Ruth',
        initials: 'RU',
        hoursAgo: 44,
        body: 'Post-surgery and cannot handle anything with tension. Extraordinary Attorney Woo has been perfect. One case, resolved, done.',
        showId: 'extraordinary-attorney-woo',
        likes: 29,
      },
    ],
  },
  {
    id: 'second-act',
    name: 'Second Act',
    tagline: 'Starting over in the middle of your life.',
    description:
      'Forties, fifties, and a strong suspicion that the plan needs rewriting. Career changes, divorces, empty nests, and shows about people who begin again far too late and do it anyway.',
    situations: ['midlife', 'divorce', 'career-drift', 'empty-nest', 'job-loss'],
    traitProfile: { humor: 62, comfort: 58, catharsis: 58 },
    memberCount: 391,
    cadence: 'One series a month · monthly video call',
    weeklyPrompt: 'What would you start if nobody you knew was watching?',
    nowWatchingShowId: 'hacks',
    posts: [
      {
        id: 'p1',
        author: 'Bernard',
        initials: 'BE',
        hoursAgo: 11,
        body: 'Fifty-four, newly divorced, and Our Flag Means Death has somehow become instructional viewing. Stede quits his entire life in episode one.',
        showId: 'our-flag-means-death',
        likes: 38,
      },
      {
        id: 'p2',
        author: 'Yuki',
        initials: 'YU',
        hoursAgo: 40,
        body: 'Halt and Catch Fire season four is the best thing I have seen about failing at something and going back in anyway.',
        showId: 'halt-and-catch-fire',
        likes: 22,
      },
    ],
  },
  {
    id: 'the-long-shift',
    name: 'The Long Shift',
    tagline: 'For people looking after someone else.',
    description:
      'Carers, parents of small children, adult children of ill parents. We talk honestly about resentment as well as love, and we watch things that fit into forty minutes of stolen time.',
    situations: ['caregiving', 'new-parent', 'illness', 'family-conflict', 'burnout'],
    traitProfile: { comfort: 76, humor: 66, catharsis: 60 },
    memberCount: 468,
    cadence: 'Weekly thread · no obligation to reply',
    weeklyPrompt: 'What did you need this week that you did not ask for?',
    nowWatchingShowId: 'please-like-me',
    posts: [
      {
        id: 'p1',
        author: 'Grace',
        initials: 'GR',
        hoursAgo: 6,
        body: 'Please Like Me is the only show that has got the psychiatric ward visits right for me. Funny in the corridor, terrified in the car park.',
        showId: 'please-like-me',
        likes: 31,
      },
      {
        id: 'p2',
        author: 'Marco',
        initials: 'MA',
        hoursAgo: 29,
        body: 'Better Things, season three. The invisible labour thing. My mother-in-law watched it with me and we both went very quiet.',
        showId: 'better-things',
        likes: 25,
      },
      {
        id: 'p3',
        author: 'Fen',
        initials: 'FE',
        hoursAgo: 61,
        body: 'Call the Midwife remains my reset button. Someone competent arrives and helps. That is the whole appeal.',
        showId: 'call-the-midwife',
        likes: 44,
      },
    ],
  },
  {
    id: 'telling-people',
    name: 'Telling People',
    tagline: 'Coming out, at any age.',
    description:
      'Whether you are fifteen and planning a conversation or forty-five and starting over, this circle watches the stories where honesty is survivable, and talks about the ones where it was not.',
    situations: ['coming-out', 'identity-questions', 'family-conflict', 'teen-turbulence'],
    traitProfile: { comfort: 76, ensemble: 72, humor: 60 },
    memberCount: 529,
    cadence: 'Two threads a week · strict no-outing rule',
    weeklyPrompt: 'Who has made this easier for you, and do they know?',
    nowWatchingShowId: 'heartstopper',
    posts: [
      {
        id: 'p1',
        author: 'Ellis',
        initials: 'EL',
        hoursAgo: 9,
        body: 'Heartstopper is the version I did not get, and watching it at thirty-one turned out to be a kind of repair rather than a wound.',
        showId: 'heartstopper',
        likes: 57,
      },
      {
        id: 'p2',
        author: 'Bea',
        initials: 'BE',
        hoursAgo: 33,
        body: 'The Rose family in Schitt\u2019s Creek is the only fictional family I have envied. No coming-out drama, just a dad rearranging the room.',
        showId: 'schitts-creek',
        likes: 48,
      },
    ],
  },
  {
    id: 'unfinished-work',
    name: 'Unfinished Work',
    tagline: 'Blocked, stalled, or scared of the thing.',
    description:
      'Writers, makers, and people with a project that has not moved in months. We watch shows about craft and obsession, and we report one small piece of progress a week.',
    situations: ['creative-block', 'low-motivation', 'career-drift', 'identity-questions'],
    traitProfile: { pace: 44, escapism: 56, comfort: 52 },
    memberCount: 276,
    cadence: 'Monday progress thread · one episode a week',
    weeklyPrompt: 'What is the smallest thing you moved forward this week?',
    nowWatchingShowId: 'chefs-table',
    posts: [
      {
        id: 'p1',
        author: 'Imre',
        initials: 'IM',
        hoursAgo: 16,
        body: 'One episode of Chef\u2019s Table before working is now a ritual. Somebody else\u2019s conviction, borrowed for an hour.',
        showId: 'chefs-table',
        likes: 30,
      },
      {
        id: 'p2',
        author: 'Wren',
        initials: 'WR',
        hoursAgo: 47,
        body: 'Station Eleven made me stop treating my work as optional. A troupe performing Shakespeare after the end of the world is quite the argument.',
        showId: 'station-eleven',
        likes: 26,
      },
    ],
  },
];

function hoursAgoToIso(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

/** Circles are seeded into the store on first launch. */
export function buildSeedCircles(): Circle[] {
  return SEEDS.map((seed) => ({
    ...seed,
    posts: seed.posts.map(({ hoursAgo, ...post }) => ({
      ...post,
      createdAt: hoursAgoToIso(hoursAgo),
    })),
  }));
}

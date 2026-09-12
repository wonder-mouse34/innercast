import { charactersForShow, getCharacter } from '@/lib/data/characters';
import { personaEcho } from '@/lib/data/personaTraits';
import { situationLabel } from '@/lib/data/situations';
import type {
  Character,
  MatchedCharacter,
  Recommendation,
  RetrievedShow,
  TraitAxis,
  TraitVector,
} from '@/lib/types';

/**
 * On-device rationale writer.
 *
 * Used when no local model is reachable. Every sentence is assembled from the
 * retrieved record and the character records inside it, so the claims stay
 * identical to what a model would be given as context — nothing is invented.
 *
 * The argument runs the same way round as the model's: one person on screen
 * first, then the show they are in.
 */

const HIGH_PHRASE: Record<TraitAxis, string> = {
  comfort: 'steadying rather than demanding',
  humor: 'genuinely funny',
  intensity: 'unflinching',
  pace: 'quick moving',
  escapism: 'set well away from your own life',
  ensemble: 'a whole group to sit with',
  catharsis: 'built to make you feel it',
};

const LOW_PHRASE: Record<TraitAxis, string> = {
  comfort: 'willing to challenge you',
  humor: 'played straight',
  intensity: 'gentle on the nervous system',
  pace: 'slow and quiet',
  escapism: 'close to real life',
  ensemble: 'focused on one inner life',
  catharsis: 'light on the heart',
};

function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function firstName(name: string): string {
  return name.split(' ')[0];
}

function axisPhrases(candidate: RetrievedShow, limit = 2): string[] {
  return candidate.alignedAxes
    .slice(0, limit)
    .map((axis) => (candidate.show.traits[axis] >= 50 ? HIGH_PHRASE[axis] : LOW_PHRASE[axis]));
}

function buildCaution(candidate: RetrievedShow, traits: TraitVector): string | undefined {
  const { show } = candidate;
  const notes: string[] = [];

  if (show.traits.intensity > traits.intensity + 18) {
    notes.push('heavier than you said you could take tonight');
  }
  if (show.traits.catharsis > traits.catharsis + 22) {
    notes.push('it will ask for tears');
  }
  const realWarnings = show.contentWarnings.filter(
    (warning) => warning !== 'none' && warning !== 'none significant',
  );
  if (realWarnings.length > 0 && notes.length > 0) {
    notes.push(`content notes: ${joinList(realWarnings.slice(0, 3))}`);
  } else if (realWarnings.length > 0 && candidate.matchedSituations.length > 0) {
    notes.push(`content notes: ${joinList(realWarnings.slice(0, 3))}`);
  }

  if (notes.length === 0) return undefined;
  const sentence = joinList(notes);
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
}

/** The person on screen this recommendation is argued from. */
function anchorCharacter(
  candidate: RetrievedShow,
): { character: Character; matched?: MatchedCharacter } | undefined {
  const matched = candidate.matchedCharacters[0];
  const character = matched
    ? getCharacter(matched.characterId)
    : charactersForShow(candidate.show.id)[0];
  if (!character) return undefined;
  return { character, matched };
}

/** One sentence on what this person and that character have in common. */
function buildCharacterLink(character: Character, matched?: MatchedCharacter): string {
  const name = firstName(character.name);

  if (matched && matched.sharedPersona.length > 0) {
    const echoes = matched.sharedPersona.slice(0, 2).map(personaEcho);
    return `You said that about yourself, and ${name} ${joinList(echoes)}.`;
  }
  if (matched && matched.sharedSituations.length > 0) {
    const situations = matched.sharedSituations
      .slice(0, 2)
      .map((id) => situationLabel(id).toLowerCase());
    return `${name} is in the middle of ${joinList(situations)}, which is where your description landed.`;
  }
  if (matched && matched.matchedTerms.length > 0) {
    return `${name}'s record picks up ${joinList(matched.matchedTerms.slice(0, 3))} from what you wrote.`;
  }
  return `You may recognise yourself in ${name} if ${character.recognizeIf}`;
}

export function synthesizeRecommendations(
  candidates: RetrievedShow[],
  traits: TraitVector,
  limit = 4,
): Recommendation[] {
  return candidates.slice(0, limit).map((candidate) => {
    const phrases = axisPhrases(candidate);
    const anchor = anchorCharacter(candidate);
    const sentences: string[] = [];

    if (anchor) {
      const { character } = anchor;
      // Character first: who they are and what they are carrying. The overlap
      // with this person is stated separately, in characterLink.
      sentences.push(`${character.name}, ${character.role}. ${character.facing}`);
      sentences.push(candidate.show.whyItHelps);
    } else {
      sentences.push(candidate.show.whyItHelps);
      const situations = candidate.matchedSituations.slice(0, 2).map(situationLabel);
      if (situations.length > 0) {
        sentences.push(
          `Its record is filed under ${joinList(situations.map((label) => label.toLowerCase()))}, which is where your description landed.`,
        );
      }
    }

    if (phrases.length > 0) {
      sentences.push(`Tonally it is ${joinList(phrases)} — close to what you asked for.`);
    }

    return {
      showId: candidate.show.id,
      characterId: anchor?.character.id,
      characterName: anchor?.character.name,
      characterLink: anchor ? buildCharacterLink(anchor.character, anchor.matched) : undefined,
      reason: sentences.join(' '),
      caution: buildCaution(candidate, traits),
      fit: Math.round(candidate.score.total * 100),
    };
  });
}

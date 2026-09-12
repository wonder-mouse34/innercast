import { situationLabel } from '@/lib/data/situations';
import type { Recommendation, RetrievedShow, TraitAxis, TraitVector } from '@/lib/types';

/**
 * On-device rationale writer.
 *
 * Used when no local model is reachable. Every sentence is assembled from the
 * retrieved record, so the claims stay identical to what a model would be given
 * as context — there is no invented information here.
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

function buildHowToWatch(candidate: RetrievedShow): string {
  const { show } = candidate;
  const totalHours = Math.round((show.episodes * show.runtimeMinutes) / 60);

  if (show.runtimeMinutes <= 12) {
    return 'Episodes are tiny. Put one on in a gap and stop whenever you like.';
  }
  if (show.seasons === 1) {
    return `One season, ${show.episodes} episodes, about ${totalHours} hours end to end. It has a finish line.`;
  }
  if (show.runtimeMinutes <= 30) {
    return `Half-hour episodes — one or two a night is a real dose, and season one stands on its own.`;
  }
  if (show.seasons >= 5) {
    return `Long series, but you are only committing to season one. ${show.runtimeMinutes}-minute episodes want a proper sitting.`;
  }
  return `${show.runtimeMinutes}-minute episodes. Give it a full evening rather than half your attention.`;
}

export function synthesizeRecommendations(
  candidates: RetrievedShow[],
  traits: TraitVector,
  limit = 4,
): Recommendation[] {
  return candidates.slice(0, limit).map((candidate) => {
    const phrases = axisPhrases(candidate);
    const situations = candidate.matchedSituations.slice(0, 2).map(situationLabel);

    const sentences: string[] = [candidate.show.whyItHelps];
    if (situations.length > 0) {
      sentences.push(
        `Its record is filed under ${joinList(situations.map((label) => label.toLowerCase()))}, which is where your description landed.`,
      );
    }
    if (phrases.length > 0) {
      sentences.push(`Tonally it is ${joinList(phrases)} — close to what you asked for.`);
    }

    return {
      showId: candidate.show.id,
      reason: sentences.join(' '),
      caution: buildCaution(candidate, traits),
      howToWatch: buildHowToWatch(candidate),
      fit: Math.round(candidate.score.total * 100),
    };
  });
}

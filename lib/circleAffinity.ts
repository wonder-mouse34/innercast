import { axisSummary } from '@/lib/rag/retrieve';
import { situationLabel } from '@/lib/data/situations';
import { typedEntries } from '@/lib/utils';
import type { Circle, SituationId, TraitAxis, TraitVector } from '@/lib/types';

export type CircleAffinity = {
  circle: Circle;
  /** 0-1, how close this circle sits to the person's profile and recent situations. */
  score: number;
  reasons: string[];
  sharedSituations: SituationId[];
};

/**
 * Circle affinity is deliberately simple and explainable: how close the circle's
 * declared taste profile sits to the person's own axes, plus how much the circle's
 * situations overlap with what they have actually been bringing to the app.
 */
export function scoreCircle(
  circle: Circle,
  traits: TraitVector,
  recentSituations: SituationId[],
): CircleAffinity {
  const axes = typedEntries(circle.traitProfile).filter(
    (entry): entry is [TraitAxis, number] => entry[1] !== undefined,
  );

  let closenessSum = 0;
  let bestAxis: { axis: TraitAxis; value: number; closeness: number } | undefined;
  for (const [axis, value] of axes) {
    const closeness = 1 - Math.abs(traits[axis] - value) / 100;
    closenessSum += closeness;
    if (!bestAxis || closeness > bestAxis.closeness) bestAxis = { axis, value, closeness };
  }
  const traitCloseness = axes.length > 0 ? closenessSum / axes.length : 0.5;

  const shared = circle.situations.filter((situation) => recentSituations.includes(situation));
  const overlap = circle.situations.length > 0 ? shared.length / circle.situations.length : 0;

  const score = recentSituations.length > 0 ? traitCloseness * 0.6 + overlap * 0.4 : traitCloseness;

  const reasons: string[] = [];
  if (shared.length > 0) {
    reasons.push(
      `Built around ${shared.slice(0, 2).map(situationLabel).join(' and ').toLowerCase()}, which you have been sitting with`,
    );
  }
  if (bestAxis && bestAxis.closeness >= 0.7) {
    reasons.push(`Watches the way you do: ${axisSummary(bestAxis.axis, bestAxis.value)}`);
  }
  if (reasons.length === 0) {
    reasons.push(`A different rhythm to yours — ${circle.cadence.toLowerCase()}`);
  }

  return { circle, score, reasons, sharedSituations: shared };
}

export function rankCircles(
  circles: Circle[],
  traits: TraitVector,
  recentSituations: SituationId[],
): CircleAffinity[] {
  return circles
    .map((circle) => scoreCircle(circle, traits, recentSituations))
    .sort((a, b) => b.score - a.score);
}

export function affinityLabel(score: number): string {
  if (score >= 0.8) return 'Very close fit';
  if (score >= 0.65) return 'Close fit';
  if (score >= 0.5) return 'Some overlap';
  return 'A stretch';
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diff / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.round(days / 7)}w ago`;
}

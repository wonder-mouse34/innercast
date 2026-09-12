import { View } from 'react-native';
import { Typography } from 'heroui-native';

import { MOOD_LABELS } from '@/lib/data/reflectionPrompts';
import { cn } from '@/lib/utils';
import type { MoodScore } from '@/lib/types';

type Props = {
  before: MoodScore;
  after?: MoodScore;
  className?: string;
};

/** Compact "Low → Steadier" badge used in the journal list and entry header. */
export function MoodDelta({ before, after, className }: Props) {
  const shift = after === undefined ? 0 : after - before;
  const tone =
    after === undefined
      ? 'bg-background-tertiary'
      : shift > 0
        ? 'bg-success-soft'
        : shift < 0
          ? 'bg-warning-soft'
          : 'bg-background-tertiary';

  return (
    <View
      className={cn(
        'flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1',
        tone,
        className,
      )}
    >
      <Typography type="body-xs" weight="medium">
        {MOOD_LABELS[before]}
      </Typography>
      {after === undefined ? (
        <Typography type="body-xs" color="muted">
          · no after yet
        </Typography>
      ) : (
        <>
          <Typography type="body-xs" color="muted">
            →
          </Typography>
          <Typography type="body-xs" weight="semibold">
            {MOOD_LABELS[after]}
          </Typography>
        </>
      )}
    </View>
  );
}

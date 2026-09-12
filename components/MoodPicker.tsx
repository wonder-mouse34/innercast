import { Pressable, View } from 'react-native';
import { Typography } from 'heroui-native';

import { MOOD_LABELS } from '@/lib/data/reflectionPrompts';
import { cn } from '@/lib/utils';
import type { MoodScore } from '@/lib/types';

const SCORES: MoodScore[] = [1, 2, 3, 4, 5];

type Props = {
  value?: MoodScore;
  onChange: (value: MoodScore) => void;
  label?: string;
  caption?: string;
};

/**
 * Five-step mood scale. Deliberately worded rather than numeric, so nobody has
 * to decide what "3/5" means about their evening.
 */
export function MoodPicker({ value, onChange, label, caption }: Props) {
  return (
    <View className="gap-2.5">
      {label ? (
        <Typography type="body-sm" weight="semibold">
          {label}
        </Typography>
      ) : null}
      <View className="flex-row gap-2">
        {SCORES.map((score) => {
          const selected = value === score;
          return (
            <Pressable
              key={score}
              onPress={() => onChange(score)}
              accessibilityRole="button"
              accessibilityLabel={MOOD_LABELS[score]}
              accessibilityState={{ selected }}
              className={cn(
                'flex-1 items-center gap-1 rounded-2xl border px-1 py-2.5',
                selected ? 'border-accent bg-accent-soft' : 'border-border bg-background-secondary',
              )}
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
            >
              <View
                className={cn(
                  'rounded-full',
                  selected ? 'bg-accent' : 'bg-foreground/35',
                  score === 1 && 'h-1.5 w-1.5',
                  score === 2 && 'h-2 w-2',
                  score === 3 && 'h-2.5 w-2.5',
                  score === 4 && 'h-3 w-3',
                  score === 5 && 'h-3.5 w-3.5',
                )}
              />
              <Typography
                type="body-xs"
                weight={selected ? 'semibold' : 'normal'}
                className={cn('text-center', selected ? 'text-accent-soft-foreground' : undefined)}
                color={selected ? undefined : 'muted'}
              >
                {MOOD_LABELS[score]}
              </Typography>
            </Pressable>
          );
        })}
      </View>
      {caption ? (
        <Typography type="body-xs" color="muted" className="leading-5">
          {caption}
        </Typography>
      ) : null}
    </View>
  );
}

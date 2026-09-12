import { Typography } from 'heroui-native';
import { View } from 'react-native';

import { cn } from '@/lib/utils';

type Props = {
  label: string;
  /** 0-1. */
  value: number;
  className?: string;
  tone?: 'accent' | 'muted';
};

export function ScoreBar({ label, value, className, tone = 'accent' }: Props) {
  const pct = Math.max(2, Math.min(100, Math.round(value * 100)));

  return (
    <View className={cn('gap-1', className)}>
      <View className="flex-row items-center justify-between">
        <Typography type="body-xs" color="muted">
          {label}
        </Typography>
        <Typography type="body-xs" color="muted">
          {Math.round(value * 100)}
        </Typography>
      </View>
      <View className="bg-background-tertiary h-1.5 overflow-hidden rounded-full">
        <View
          className={cn('h-full rounded-full', tone === 'accent' ? 'bg-accent' : 'bg-muted')}
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}

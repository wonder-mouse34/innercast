import type { ReactNode } from 'react';
import { Typography } from 'heroui-native';
import { View } from 'react-native';

import { cn } from '@/lib/utils';

type Props = {
  title: string;
  caption?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({ title, caption, action, className }: Props) {
  return (
    <View className={cn('mb-3 flex-row items-end justify-between gap-3', className)}>
      <View className="flex-1">
        <Typography type="h5" weight="semibold">
          {title}
        </Typography>
        {caption ? (
          <Typography type="body-sm" color="muted" className="mt-1">
            {caption}
          </Typography>
        ) : null}
      </View>
      {action}
    </View>
  );
}

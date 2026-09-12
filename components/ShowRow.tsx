import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Typography } from 'heroui-native';
import { router } from 'expo-router';

import { ShowArtwork } from '@/components/ShowArtwork';
import { cn } from '@/lib/utils';
import type { Show } from '@/lib/types';

type Props = {
  show: Show;
  subtitle?: string;
  accessory?: ReactNode;
  onPress?: () => void;
  className?: string;
};

export function ShowRow({ show, subtitle, accessory, onPress, className }: Props) {
  const handlePress =
    onPress ?? (() => router.push({ pathname: '/show/[id]', params: { id: show.id } }));

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${show.title}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      className={cn('flex-row items-center gap-3 py-2', className)}
    >
      <ShowArtwork show={show} size="sm" />
      <View className="flex-1">
        <Typography type="body" weight="medium" numberOfLines={1}>
          {show.title}
        </Typography>
        <Typography type="body-xs" color="muted" numberOfLines={2} className="mt-0.5">
          {subtitle ?? `${show.years} · ${show.genres.slice(0, 2).join(', ')}`}
        </Typography>
      </View>
      {accessory}
    </Pressable>
  );
}

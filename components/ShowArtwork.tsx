import { Typography } from 'heroui-native';

import { LinearGradient } from '@/components/ui/primitives/LinearGradient';
import { showTint } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { Show } from '@/lib/types';

type Size = 'sm' | 'md' | 'lg' | 'hero';

const SIZE_CLASS: Record<Size, string> = {
  sm: 'h-12 w-12 rounded-2xl',
  md: 'h-16 w-16 rounded-2xl',
  lg: 'h-24 w-24 rounded-3xl',
  hero: 'h-40 w-full rounded-3xl',
};

const TEXT_TYPE: Record<Size, 'body-sm' | 'body' | 'h4' | 'h2'> = {
  sm: 'body-sm',
  md: 'body',
  lg: 'h4',
  hero: 'h2',
};

/** Two-letter monogram, so the corpus needs no artwork licensing. */
export function monogram(title: string): string {
  const words = title
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '··';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

type Props = {
  show: Show;
  size?: Size;
  className?: string;
};

export function ShowArtwork({ show, size = 'md', className }: Props) {
  const tint = showTint(show.palette);

  return (
    <LinearGradient
      colors={[tint.from, tint.to]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={cn('items-center justify-center overflow-hidden', SIZE_CLASS[size], className)}
      style={{ borderWidth: 1, borderColor: tint.border }}
    >
      <Typography
        type={TEXT_TYPE[size]}
        weight="bold"
        style={{ color: tint.ink, letterSpacing: 1 }}
      >
        {monogram(show.title)}
      </Typography>
    </LinearGradient>
  );
}

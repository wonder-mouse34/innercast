import { Slider, Typography } from 'heroui-native';
import { View } from 'react-native';

import { TRAIT_META, type TraitAxis, type TraitVector } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  traits: TraitVector;
  onChange: (axis: TraitAxis, value: number) => void;
  /** Restrict to a subset of axes, in TRAIT_META order. */
  axes?: readonly TraitAxis[];
  className?: string;
};

/** Shared trait editor used by onboarding, the profile tab and tonight's tuning. */
export function TraitSliders({ traits, onChange, axes, className }: Props) {
  const metas = axes ? TRAIT_META.filter((meta) => axes.includes(meta.axis)) : TRAIT_META;

  return (
    <View className={cn('gap-5', className)}>
      {metas.map((meta) => (
        <View key={meta.axis} className="gap-2">
          <View className="flex-row items-baseline justify-between gap-3">
            <Typography type="body-sm" weight="medium">
              {meta.label}
            </Typography>
            <Typography type="body-xs" color="muted">
              {traits[meta.axis]}
            </Typography>
          </View>
          <Slider
            value={traits[meta.axis]}
            minValue={0}
            maxValue={100}
            step={1}
            onChange={(value) => onChange(meta.axis, Array.isArray(value) ? value[0] : value)}
            accessibilityLabel={meta.label}
          >
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb />
            </Slider.Track>
          </Slider>
          <View className="flex-row justify-between gap-3">
            <Typography type="body-xs" color="muted">
              {meta.lowLabel}
            </Typography>
            <Typography type="body-xs" color="muted">
              {meta.highLabel}
            </Typography>
          </View>
        </View>
      ))}
    </View>
  );
}

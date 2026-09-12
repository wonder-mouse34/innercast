import { useMemo, useState } from 'react';
import { Button, Chip } from 'heroui-native';
import { View } from 'react-native';

import { SITUATIONS } from '@/lib/data/situations';
import type { SituationId } from '@/lib/types';

/** The situations people reach for most often, kept in front of the fold. */
const PRIMARY: SituationId[] = [
  'grief',
  'breakup',
  'burnout',
  'loneliness',
  'anxiety',
  'job-loss',
  'new-city',
  'low-motivation',
  'need-to-laugh',
  'identity-questions',
  'caregiving',
  'insomnia',
];

type Props = {
  selected: SituationId[];
  onToggle: (id: SituationId) => void;
};

export function SituationChips({ selected, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false);

  const visible = useMemo(() => {
    if (expanded) return SITUATIONS;
    const primary = new Set<SituationId>([...PRIMARY, ...selected]);
    return SITUATIONS.filter((situation) => primary.has(situation.id));
  }, [expanded, selected]);

  return (
    <View>
      <View className="flex-row flex-wrap gap-2">
        {visible.map((situation) => {
          const isSelected = selected.includes(situation.id);
          return (
            <Chip
              key={situation.id}
              size="sm"
              variant={isSelected ? 'primary' : 'secondary'}
              color={isSelected ? 'accent' : 'default'}
              onPress={() => onToggle(situation.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Chip.Label>{situation.label}</Chip.Label>
            </Chip>
          );
        })}
      </View>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 self-start px-0"
        onPress={() => setExpanded((value) => !value)}
      >
        <Button.Label>
          {expanded ? 'Show fewer situations' : `Show all ${SITUATIONS.length} situations`}
        </Button.Label>
      </Button>
    </View>
  );
}

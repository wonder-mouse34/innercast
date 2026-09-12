import { Check } from 'lucide-react-native';
import { Typography } from 'heroui-native';
import { Pressable, View } from 'react-native';

import { PERSONA_TRAITS } from '@/lib/data/personaTraits';
import { useNativeThemeColor } from '@/lib/theme';
import type { PersonaTraitId } from '@/lib/types';

type Props = {
  selected: PersonaTraitId[];
  onToggle: (id: PersonaTraitId) => void;
  /** Cap enforced by the store, mirrored here so the limit is not a surprise. */
  max?: number;
  /** Show each pattern's expansion under its label. Off in tight layouts. */
  showBlurbs?: boolean;
};

/**
 * The person's own patterns, in their own words. These are matched against the
 * people on screen, so this is the strongest signal retrieval has.
 */
export function PersonaChips({ selected, onToggle, max, showBlurbs = false }: Props) {
  const [accent] = useNativeThemeColor(['accent']);
  const atLimit = typeof max === 'number' && selected.length >= max;

  if (showBlurbs) {
    return (
      <View className="gap-2">
        {PERSONA_TRAITS.map((trait) => {
          const active = selected.includes(trait.id);
          const locked = !active && atLimit;
          return (
            <Pressable
              key={trait.id}
              onPress={() => onToggle(trait.id)}
              disabled={locked}
              accessibilityRole="button"
              accessibilityLabel={`${trait.label}. ${trait.blurb}`}
              accessibilityState={{ selected: active, disabled: locked }}
              style={({ pressed }) => ({ opacity: locked ? 0.4 : pressed ? 0.8 : 1 })}
              className={`flex-row items-start gap-3 rounded-2xl border px-3.5 py-3 ${
                active ? 'border-accent bg-accent-soft' : 'border-border bg-background-secondary'
              }`}
            >
              <View
                className={`mt-0.5 h-5 w-5 items-center justify-center rounded-full border ${
                  active ? 'border-accent bg-accent-soft' : 'border-border'
                }`}
              >
                {active ? <Check color={accent} size={13} /> : null}
              </View>
              <View className="flex-1">
                <Typography
                  type="body-sm"
                  weight="semibold"
                  className={active ? 'text-accent' : ''}
                >
                  {trait.label}
                </Typography>
                <Typography type="body-xs" color="muted" className="mt-0.5 leading-5">
                  {trait.blurb}
                </Typography>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {PERSONA_TRAITS.map((trait) => {
        const active = selected.includes(trait.id);
        const locked = !active && atLimit;
        return (
          <Pressable
            key={trait.id}
            onPress={() => onToggle(trait.id)}
            disabled={locked}
            accessibilityRole="button"
            accessibilityLabel={`${trait.label}. ${trait.blurb}`}
            accessibilityState={{ selected: active, disabled: locked }}
            style={({ pressed }) => ({ opacity: locked ? 0.4 : pressed ? 0.8 : 1 })}
            className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
              active ? 'border-accent bg-accent-soft' : 'border-border bg-background-secondary'
            }`}
          >
            {active ? <Check color={accent} size={12} /> : null}
            <Typography type="body-sm" className={active ? 'text-accent' : ''}>
              {trait.label}
            </Typography>
          </Pressable>
        );
      })}
      {atLimit ? (
        <View className="justify-center px-1 py-2">
          <Typography type="body-xs" color="muted">
            {`${max} is the most that stays useful`}
          </Typography>
        </View>
      ) : null}
    </View>
  );
}

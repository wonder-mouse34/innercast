import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import {
  Button,
  Chip,
  Description,
  Input,
  Label,
  Surface,
  Switch,
  TextArea,
  TextField,
  Typography,
} from 'heroui-native';
import { router } from 'expo-router';

import { SituationChips } from '@/components/SituationChips';
import { TRAIT_META } from '@/lib/types';
import { axisSummary } from '@/lib/rag/retrieve';
import { goBackOrReplace } from '@/lib/navigation';
import { useCircleStore } from '@/lib/store/circles';
import { useProfileStore } from '@/lib/store/profile';
import { typedEntries } from '@/lib/utils';
import type { SituationId, TraitAxis, TraitVector } from '@/lib/types';

const CADENCES = [
  'One show a week · Sunday thread',
  'One show a fortnight · Sunday thread',
  'Whenever someone needs it',
  'One episode a night, together',
];

/** A circle's taste profile is the three axes where the founder leans furthest from the middle. */
function deriveTraitProfile(traits: TraitVector): Partial<TraitVector> {
  const ranked = typedEntries(traits)
    .map(([axis, value]) => ({ axis, value, distance: Math.abs(value - 50) }))
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 3);
  return Object.fromEntries(ranked.map(({ axis, value }) => [axis, value]));
}

export default function NewCircleScreen() {
  const traits = useProfileStore((state) => state.traits);
  const createCircle = useCircleStore((state) => state.createCircle);

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [situations, setSituations] = useState<SituationId[]>([]);
  const [cadence, setCadence] = useState(CADENCES[0]);
  const [weeklyPrompt, setWeeklyPrompt] = useState('');
  const [useMyTaste, setUseMyTaste] = useState(true);

  const traitProfile = useMemo(
    () => (useMyTaste ? deriveTraitProfile(traits) : {}),
    [useMyTaste, traits],
  );

  const canCreate = name.trim().length > 1 && tagline.trim().length > 1 && situations.length > 0;

  const toggleSituation = (id: SituationId) =>
    setSituations((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const handleCreate = () => {
    if (!canCreate) return;
    const circle = createCircle({
      name: name.trim(),
      tagline: tagline.trim(),
      description:
        description.trim() ||
        'A small circle watching around the same thing, at whatever pace the week allows.',
      situations,
      traitProfile,
      cadence,
      weeklyPrompt:
        weeklyPrompt.trim() || 'What did you watch this week, and what did it do for you?',
    });
    router.dismissTo({ pathname: '/circle/[id]', params: { id: circle.id } });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-4 pb-16 gap-6"
        keyboardShouldPersistTaps="handled"
      >
        <Typography type="body-sm" color="muted" className="leading-6">
          A circle is a name, a reason to gather, and one question people answer. You can change all
          of it later.
        </Typography>

        <TextField isRequired>
          <Label>Name</Label>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="The Sunday Slow Watch"
            autoCapitalize="words"
          />
        </TextField>

        <TextField isRequired>
          <Label>One line about who it is for</Label>
          <Input
            value={tagline}
            onChangeText={setTagline}
            placeholder="For people whose weeks end heavier than they start."
          />
        </TextField>

        <TextField>
          <Label>Description</Label>
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder="What happens here, and what the group avoids."
            className="min-h-24"
            multiline
            numberOfLines={4}
          />
          <Description>Optional. We fill in something plain if you leave it empty.</Description>
        </TextField>

        <View className="gap-3">
          <View>
            <Typography type="body" weight="semibold">
              What is this circle around?
            </Typography>
            <Typography type="body-sm" color="muted" className="mt-1 leading-6">
              Pick at least one. This is how the right people find it.
            </Typography>
          </View>
          <SituationChips selected={situations} onToggle={toggleSituation} />
        </View>

        <View className="gap-3">
          <Typography type="body" weight="semibold">
            Rhythm
          </Typography>
          <View className="flex-row flex-wrap gap-2">
            {CADENCES.map((option) => {
              const active = cadence === option;
              return (
                <Chip
                  key={option}
                  size="sm"
                  variant={active ? 'primary' : 'secondary'}
                  color={active ? 'accent' : 'default'}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setCadence(option)}
                >
                  <Chip.Label>{option}</Chip.Label>
                </Chip>
              );
            })}
          </View>
        </View>

        <TextField>
          <Label>The question people answer</Label>
          <TextArea
            value={weeklyPrompt}
            onChangeText={setWeeklyPrompt}
            placeholder="What did this week ask of you?"
            className="min-h-20"
            multiline
            numberOfLines={3}
          />
        </TextField>

        <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Typography type="body-sm" weight="semibold">
                Use my taste profile
              </Typography>
              <Typography type="body-xs" color="muted" className="mt-1 leading-5">
                Helps people with a similar way of watching find the circle.
              </Typography>
            </View>
            <Switch isSelected={useMyTaste} onSelectedChange={setUseMyTaste} />
          </View>

          {useMyTaste ? (
            <View className="gap-1">
              {typedEntries(traitProfile)
                .filter((entry): entry is [TraitAxis, number] => entry[1] !== undefined)
                .map(([axis, value]) => (
                  <Typography key={axis} type="body-xs" color="muted">
                    · {TRAIT_META.find((meta) => meta.axis === axis)?.label ?? axis}:{' '}
                    {axisSummary(axis, value)}
                  </Typography>
                ))}
            </View>
          ) : null}
        </Surface>

        <View className="gap-3">
          <Button variant="primary" isDisabled={!canCreate} onPress={handleCreate}>
            <Button.Label>Create circle</Button.Label>
          </Button>
          <Button variant="ghost" onPress={() => goBackOrReplace('/circles')}>
            <Button.Label>Cancel</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

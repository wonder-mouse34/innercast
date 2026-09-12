import { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Button, Input, Label, Surface, TextField, Typography } from 'heroui-native';
import { ArrowLeft, Lightbulb, Plus, X } from 'lucide-react-native';
import { router } from 'expo-router';

import { PersonaChips } from '@/components/PersonaChips';
import { TraitSliders } from '@/components/TraitSliders';
import { DEFAULT_TRAITS, MAX_PERSONA_TAGS, useProfileStore } from '@/lib/store/profile';
import { TRAIT_META } from '@/lib/types';
import { useNativeThemeColor } from '@/lib/theme';
import type { PersonaTraitId, TraitAxis, TraitVector } from '@/lib/types';

const FIRST_AXES: readonly TraitAxis[] = ['comfort', 'intensity', 'humor', 'pace'];
const SECOND_AXES: readonly TraitAxis[] = ['escapism', 'ensemble', 'catharsis'];

const COMMON_AVOIDS = [
  'child harm',
  'sexual violence',
  'suicide',
  'terminal illness',
  'addiction',
  'animal death',
];

const STEP_COUNT = 5;

export default function OnboardingScreen() {
  const setName = useProfileStore((state) => state.setName);
  const setTraits = useProfileStore((state) => state.setTraits);
  const setPersonaTags = useProfileStore((state) => state.setPersonaTags);
  const addAvoidTopic = useProfileStore((state) => state.addAvoidTopic);
  const completeOnboarding = useProfileStore((state) => state.completeOnboarding);
  const [accent, muted] = useNativeThemeColor(['accent', 'muted']);

  const [step, setStep] = useState(0);
  const [name, setLocalName] = useState('');
  const [personaTags, setLocalPersonaTags] = useState<PersonaTraitId[]>([]);
  const [traits, setLocalTraits] = useState<TraitVector>({ ...DEFAULT_TRAITS });
  const [avoids, setAvoids] = useState<string[]>([]);
  const [avoidDraft, setAvoidDraft] = useState('');

  const setTrait = useCallback((axis: TraitAxis, value: number) => {
    setLocalTraits((current) => ({ ...current, [axis]: Math.round(value) }));
  }, []);

  const togglePersona = useCallback((id: PersonaTraitId) => {
    setLocalPersonaTags((current) => {
      if (current.includes(id)) return current.filter((tag) => tag !== id);
      if (current.length >= MAX_PERSONA_TAGS) return current;
      return [...current, id];
    });
  }, []);

  const toggleAvoid = useCallback((topic: string) => {
    setAvoids((current) =>
      current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic],
    );
  }, []);

  const addDraft = useCallback(() => {
    const value = avoidDraft.trim();
    if (!value) return;
    setAvoids((current) => (current.includes(value) ? current : [...current, value]));
    setAvoidDraft('');
  }, [avoidDraft]);

  const questions = useMemo(
    () => ({
      first: TRAIT_META.filter((meta) => FIRST_AXES.includes(meta.axis)),
      second: TRAIT_META.filter((meta) => SECOND_AXES.includes(meta.axis)),
    }),
    [],
  );

  const finish = useCallback(() => {
    setName(name.trim());
    setPersonaTags(personaTags);
    setTraits(traits);
    for (const topic of avoids) addAvoidTopic(topic);
    completeOnboarding();
    router.replace('/(tabs)');
  }, [
    addAvoidTopic,
    avoids,
    completeOnboarding,
    name,
    personaTags,
    setName,
    setPersonaTags,
    setTraits,
    traits,
  ]);

  const next = useCallback(() => {
    if (step === STEP_COUNT - 1) {
      finish();
      return;
    }
    setStep((value) => value + 1);
  }, [finish, step]);

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-safe-offset-6 pb-safe-offset-10 gap-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row gap-1.5">
          {Array.from({ length: STEP_COUNT }, (_, index) => (
            <View
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= step ? 'bg-accent' : 'bg-background-tertiary'
              }`}
            />
          ))}
        </View>

        {step === 0 ? (
          <View className="gap-6">
            <View className="bg-accent-soft h-14 w-14 items-center justify-center rounded-2xl">
              <Lightbulb color={accent} size={26} />
            </View>
            <View className="gap-3">
              <Typography type="h2" weight="semibold">
                Inner Cast
              </Typography>
              <Typography type="body" color="muted" className="leading-7">
                Tell it what you are going through and it points you at someone on screen living
                something close to it — from a small, hand-written library rather than whatever is
                trending.
              </Typography>
              <Typography type="body-sm" color="muted" className="leading-6">
                Everything you write stays on this device. If you point Inner Cast at your own local
                model, that is the only place your words are ever sent.
              </Typography>
            </View>

            <TextField>
              <Label>What should it call you?</Label>
              <Input
                value={name}
                onChangeText={setLocalName}
                placeholder="Your first name"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </TextField>
          </View>
        ) : null}

        {step === 1 ? (
          <View className="gap-6">
            <View className="gap-2">
              <Typography type="h4" weight="semibold">
                Which of these sound like you?
              </Typography>
              <Typography type="body-sm" color="muted" className="leading-6">
                Inner Cast matches you to a person on screen, not a genre. Pick up to{' '}
                {MAX_PERSONA_TAGS} that ring true — this is the part that decides who you get
                pointed at.
              </Typography>
            </View>

            <PersonaChips
              selected={personaTags}
              onToggle={togglePersona}
              max={MAX_PERSONA_TAGS}
              showBlurbs
            />

            <Typography type="body-xs" color="muted" className="leading-5">
              None of it is a diagnosis, and you can change it any time in You.
            </Typography>
          </View>
        ) : null}

        {step === 2 || step === 3 ? (
          <View className="gap-6">
            <View className="gap-2">
              <Typography type="h4" weight="semibold">
                {step === 2 ? 'How you like to watch' : 'What you want it to do to you'}
              </Typography>
              <Typography type="body-sm" color="muted" className="leading-6">
                There are no wrong answers, and you can change any of this later. Tonight’s mood can
                override it on the spot.
              </Typography>
            </View>

            <Surface variant="secondary" className="gap-4 rounded-3xl p-4">
              {(step === 2 ? questions.first : questions.second).map((meta) => (
                <Typography key={meta.axis} type="body-sm" color="muted" className="leading-6">
                  · {meta.question}
                </Typography>
              ))}
            </Surface>

            <TraitSliders
              traits={traits}
              onChange={setTrait}
              axes={step === 2 ? FIRST_AXES : SECOND_AXES}
            />
          </View>
        ) : null}

        {step === 4 ? (
          <View className="gap-6">
            <View className="gap-2">
              <Typography type="h4" weight="semibold">
                Anything it should steer around?
              </Typography>
              <Typography type="body-sm" color="muted" className="leading-6">
                Shows carrying these are pushed down or left out, and you always see a warning
                before you commit to one.
              </Typography>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {COMMON_AVOIDS.map((topic) => {
                const active = avoids.includes(topic);
                return (
                  <Pressable
                    key={topic}
                    onPress={() => toggleAvoid(topic)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                    className={`rounded-full border px-3 py-2 ${
                      active ? 'border-accent bg-accent-soft' : 'border-border bg-surface'
                    }`}
                  >
                    <Typography type="body-sm" className={active ? 'text-accent' : ''}>
                      {topic}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>

            <View className="gap-3">
              <TextField>
                <Label>Something else</Label>
                <Input
                  value={avoidDraft}
                  onChangeText={setAvoidDraft}
                  placeholder="e.g. hospitals"
                  onSubmitEditing={addDraft}
                  returnKeyType="done"
                />
              </TextField>
              <Button
                variant="secondary"
                size="sm"
                className="self-start"
                isDisabled={avoidDraft.trim().length === 0}
                onPress={addDraft}
              >
                <Plus color={muted} size={15} />
                <Button.Label>Add</Button.Label>
              </Button>
            </View>

            {avoids.length > 0 ? (
              <View className="gap-2">
                <Typography type="body-sm" weight="semibold">
                  Steering clear of
                </Typography>
                <View className="flex-row flex-wrap gap-2">
                  {avoids.map((topic) => (
                    <Pressable
                      key={topic}
                      onPress={() => toggleAvoid(topic)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${topic}`}
                      className="bg-background-tertiary flex-row items-center gap-1.5 rounded-full px-3 py-2"
                      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                    >
                      <Typography type="body-sm">{topic}</Typography>
                      <X color={muted} size={13} />
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        <View className="mt-2 gap-3">
          <Button variant="primary" onPress={next}>
            <Button.Label>
              {step === STEP_COUNT - 1
                ? 'Start'
                : step === 0
                  ? 'Tell it about me'
                  : step === 1
                    ? 'That’s me'
                    : 'Continue'}
            </Button.Label>
          </Button>

          {step > 0 ? (
            <Button variant="ghost" onPress={() => setStep((value) => value - 1)}>
              <ArrowLeft color={muted} size={15} />
              <Button.Label>Back</Button.Label>
            </Button>
          ) : (
            <Button variant="ghost" onPress={finish}>
              <Button.Label>Skip, use sensible defaults</Button.Label>
            </Button>
          )}
        </View>

        {step === STEP_COUNT - 1 ? (
          <Typography type="body-xs" color="muted" className="text-center leading-5">
            You can point Inner Cast at your own local model later in You → Local model. Until then
            it ranks the library on this device.
          </Typography>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

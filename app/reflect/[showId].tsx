import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Label, Surface, TextArea, TextField, Typography } from 'heroui-native';
import { RefreshCw } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { MoodPicker } from '@/components/MoodPicker';
import { SectionHeading } from '@/components/SectionHeading';
import { ShowArtwork } from '@/components/ShowArtwork';
import { SituationChips } from '@/components/SituationChips';
import { getCharacter } from '@/lib/data/characters';
import { getShow } from '@/lib/data/shows';
import { FREE_REFLECTION_ID } from '@/lib/navigation';
import {
  guidedReflectionPrompts,
  selectPrompts,
  promptById,
  swapPrompt,
} from '@/lib/data/reflectionPrompts';
import { useNativeThemeColor } from '@/lib/theme';
import { useReflectionStore } from '@/lib/store/reflections';
import type { MoodScore, ReflectionPrompt, SituationId } from '@/lib/types';

const KIND_LABEL: Record<ReflectionPrompt['kind'], string> = {
  opening: 'To start',
  deepening: 'Going deeper',
  closing: 'Before you close the night',
};

type DisplayPrompt = {
  id: string;
  label: string;
  text: string;
  source?: ReflectionPrompt;
};

export default function ReflectScreen() {
  const { showId, characterId } = useLocalSearchParams<{
    showId: string;
    characterId?: string;
  }>();
  const [muted] = useNativeThemeColor(['muted']);
  const addReflection = useReflectionStore((state) => state.addReflection);

  const show = showId === FREE_REFLECTION_ID ? undefined : getShow(showId);
  const candidateCharacter = characterId ? getCharacter(characterId) : undefined;
  const character = candidateCharacter?.showId === show?.id ? candidateCharacter : undefined;
  const [situations, setSituations] = useState<SituationId[]>(
    () => show?.situations.slice(0, 3) ?? [],
  );
  const [situationText, setSituationText] = useState('');
  const [moodBefore, setMoodBefore] = useState<MoodScore>(3);
  const [moodAfter, setMoodAfter] = useState<MoodScore | undefined>(undefined);
  const [overrides, setOverrides] = useState<
    Partial<Record<ReflectionPrompt['kind'], ReflectionPrompt>>
  >({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [takeaway, setTakeaway] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  // Free entries continue to follow the selected situations. Reflections tied
  // to a show use a stable set of post-watch questions about that story.
  const situationalPrompts = useMemo(
    () => selectPrompts(situations).map((prompt) => overrides[prompt.kind] ?? prompt),
    [situations, overrides],
  );
  const guidedPrompts = useMemo(
    () => (show ? guidedReflectionPrompts(show, character) : []),
    [show, character],
  );
  const prompts: DisplayPrompt[] = show
    ? guidedPrompts
    : situationalPrompts.map((prompt) => ({
        id: prompt.id,
        label: KIND_LABEL[prompt.kind],
        text: prompt.text,
        source: prompt,
      }));

  const handleSwap = (prompt?: ReflectionPrompt) => {
    if (!prompt) return;
    setOverrides((current) => ({ ...current, [prompt.kind]: swapPrompt(prompt, situations) }));
  };

  const handleSave = () => {
    const shown = new Set(prompts.map((prompt) => prompt.id));
    const visibleAnswers = prompts.map((prompt) => ({
      promptId: prompt.id,
      prompt: prompt.text,
      answer: (answers[prompt.id] ?? '').trim(),
    }));
    const previousAnswers = Object.entries(answers)
      .filter(([id]) => !shown.has(id))
      .map(([id, answer]) => {
        const prompt = promptById(id);
        return prompt
          ? { promptId: prompt.id, prompt: prompt.text, answer: answer.trim() }
          : undefined;
      })
      .filter((answer): answer is { promptId: string; prompt: string; answer: string } =>
        Boolean(answer),
      );
    const filled = [...visibleAnswers, ...previousAnswers].filter(
      (answer) => answer.answer.length > 0,
    );

    if (filled.length === 0 && takeaway.trim().length === 0) {
      setError('Write at least one line — a single sentence is a real entry.');
      return;
    }

    addReflection({
      showId: show?.id,
      characterId: character?.id,
      characterName: character?.name,
      situationText: situationText.trim() || undefined,
      situations,
      moodBefore,
      moodAfter,
      answers: filled,
      takeaway: takeaway.trim() || undefined,
    });

    router.dismissTo('/journal');
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
        keyboardDismissMode="on-drag"
      >
        {show ? (
          <View className="flex-row items-center gap-3">
            <ShowArtwork show={show} size="md" />
            <View className="flex-1">
              <Typography type="body-xs" color="muted">
                Reflecting on
              </Typography>
              <Typography type="h5" weight="semibold">
                {show.title}
              </Typography>
              <Typography type="body-xs" color="muted" className="mt-0.5">
                {character ? `Through ${character.name}` : show.themes.slice(0, 3).join(' · ')}
              </Typography>
            </View>
          </View>
        ) : (
          <View className="gap-1">
            <Typography type="h4" weight="semibold">
              A quiet entry
            </Typography>
            <Typography type="body-sm" color="muted" className="leading-6">
              No show attached — just where you are tonight.
            </Typography>
          </View>
        )}

        <Surface variant="secondary" className="gap-4 rounded-3xl p-4">
          <MoodPicker
            label="Where were you before you pressed play?"
            value={moodBefore}
            onChange={setMoodBefore}
          />
        </Surface>

        <View className="gap-2.5">
          <Typography type="body-sm" weight="semibold">
            What this evening is about
          </Typography>
          <SituationChips
            selected={situations}
            onToggle={(id) =>
              setSituations((current) =>
                current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
              )
            }
          />
          <Typography type="body-xs" color="muted" className="leading-5">
            {show
              ? 'Keep the themes that were present for you while watching.'
              : 'The questions below follow whatever you pick here.'}
          </Typography>
        </View>

        {show ? null : (
          <TextField>
            <Label>In your own words</Label>
            <TextArea
              value={situationText}
              onChangeText={setSituationText}
              placeholder="A sentence about the week, if you want one."
              className="min-h-20"
              multiline
              numberOfLines={3}
            />
          </TextField>
        )}

        <View className="gap-4">
          <SectionHeading
            title="Questions"
            caption="Answer what lands. Skip the rest."
            className="mb-0"
          />
          {prompts.map((prompt) => (
            <Surface key={prompt.id} variant="default" className="gap-3 rounded-3xl p-4">
              <Typography type="body-xs" weight="semibold" color="muted">
                {prompt.label.toUpperCase()}
              </Typography>
              <Typography type="body" className="leading-6">
                {prompt.text}
              </Typography>
              <TextField>
                <TextArea
                  value={answers[prompt.id] ?? ''}
                  onChangeText={(value) =>
                    setAnswers((current) => ({ ...current, [prompt.id]: value }))
                  }
                  placeholder="Write as much or as little as you like."
                  className="min-h-24"
                  multiline
                  numberOfLines={4}
                />
              </TextField>
              {prompt.source ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-start px-0"
                  onPress={() => handleSwap(prompt.source)}
                >
                  <RefreshCw color={muted} size={14} />
                  <Button.Label>Ask me something else</Button.Label>
                </Button>
              ) : null}
            </Surface>
          ))}
        </View>

        <Surface variant="secondary" className="gap-4 rounded-3xl p-4">
          <MoodPicker
            label="And afterwards?"
            caption="Leave this for later if you have not watched yet."
            value={moodAfter}
            onChange={setMoodAfter}
          />
        </Surface>

        <TextField>
          <Label>One line to keep</Label>
          <TextArea
            value={takeaway}
            onChangeText={setTakeaway}
            placeholder="The thing you want to remember from tonight."
            className="min-h-20"
            multiline
            numberOfLines={3}
          />
        </TextField>

        {error ? (
          <Typography type="body-sm" className="text-danger">
            {error}
          </Typography>
        ) : null}

        <Button variant="primary" onPress={handleSave}>
          <Button.Label>Save to journal</Button.Label>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

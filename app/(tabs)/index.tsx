import { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Button, Label, Spinner, Surface, TextArea, TextField, Typography } from 'heroui-native';
import { Cpu, Search } from 'lucide-react-native';
import { Redirect, router } from 'expo-router';

import { GenreFilterChips } from '@/components/GenreFilterChips';
import { MarkdownAnswer } from '@/components/MarkdownAnswer';
import { MatchCard } from '@/components/MatchCard';
import { PillarsSection } from '@/components/PillarsSection';
import { SituationChips } from '@/components/SituationChips';
import { bilt } from '@/lib/bilt';
import { CHARACTERS, charactersForShow } from '@/lib/data/characters';
import { SHOWS } from '@/lib/data/shows';
import { situationLabel } from '@/lib/data/situations';
import type { GenreFilter } from '@/lib/genres';
import { useProfileHydrated } from '@/lib/store/hydration';
import { useProfileStore } from '@/lib/store/profile';
import { useSettingsStore } from '@/lib/store/settings';
import { useNativeThemeColor } from '@/lib/theme';
import type { Recommendation, Show, SituationId } from '@/lib/types';

type AskInnerCastRequest = {
  message: string;
  history: unknown[];
  situations: string[];
  genres: string[];
};

type AskInnerCastSuccess = {
  answer: string;
  history: unknown[];
  seconds: number;
};

type AskInnerCastFailure = {
  error: string;
};

type AskInnerCastResponse = AskInnerCastSuccess | AskInnerCastFailure;

function isAskInnerCastSuccess(value: AskInnerCastResponse): value is AskInnerCastSuccess {
  return 'answer' in value;
}

type InteractiveMatch = {
  show: Show;
  recommendation: Recommendation;
  characterIds: string[];
};

function searchable(value: string): string {
  return ` ${value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;
}

function mentionIndex(answer: string, label: string): number {
  const normalizedLabel = searchable(label).trim();
  return normalizedLabel ? searchable(answer).indexOf(` ${normalizedLabel} `) : -1;
}

function interactiveMatches(answer: string): InteractiveMatch[] {
  const characterMentions = CHARACTERS.map((character) => ({
    character,
    index: mentionIndex(answer, character.name),
  })).filter((entry) => entry.index >= 0);

  const charactersByShow = new Map<string, typeof characterMentions>();
  for (const entry of characterMentions) {
    const current = charactersByShow.get(entry.character.showId) ?? [];
    current.push(entry);
    charactersByShow.set(entry.character.showId, current);
  }

  const matches: (InteractiveMatch & { index: number })[] = [];
  for (const show of SHOWS) {
    const mentionedCharacters = (charactersByShow.get(show.id) ?? []).sort(
      (left, right) => left.index - right.index,
    );
    const showIndex =
      searchable(show.title).trim().length >= 5 ? mentionIndex(answer, show.title) : -1;
    if (mentionedCharacters.length === 0 && showIndex < 0) continue;

    const availableCharacters =
      mentionedCharacters.length > 0
        ? mentionedCharacters.map((entry) => entry.character)
        : charactersForShow(show.id);
    const primaryCharacter = availableCharacters[0];
    if (!primaryCharacter) continue;

    matches.push({
      show,
      characterIds: availableCharacters.map((character) => character.id),
      index: mentionedCharacters[0]?.index ?? showIndex,
      recommendation: {
        showId: show.id,
        reason: '',
        characterId: primaryCharacter.id,
        characterName: primaryCharacter.name,
        fit: 0,
      },
    });
  }

  return matches.sort((left, right) => left.index - right.index);
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still awake';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DiscoverScreen() {
  const hydrated = useProfileHydrated();
  const hasOnboarded = useProfileStore((state) => state.hasOnboarded);
  const name = useProfileStore((state) => state.name);
  const avoidTopics = useProfileStore((state) => state.avoidTopics);
  const settings = useSettingsStore((state) => state.model);
  const [accent, muted, accentForeground] = useNativeThemeColor([
    'accent',
    'muted',
    'accent-foreground',
  ]);

  const [text, setText] = useState('');
  const [selected, setSelected] = useState<SituationId[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<GenreFilter[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [history, setHistory] = useState<unknown[]>([]);

  const scrollRef = useRef<ScrollView>(null);
  const resultsY = useRef(0);
  const lastRequestRef = useRef<AskInnerCastRequest | null>(null);

  const toggleSituation = useCallback((id: SituationId) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }, []);

  const toggleGenre = useCallback((genre: GenreFilter) => {
    setSelectedGenres((current) =>
      current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre],
    );
  }, []);

  const sendRequest = useCallback(async (request: AskInnerCastRequest) => {
    lastRequestRef.current = request;
    setError(null);
    setIsMatching(true);

    try {
      const { data, error: functionError } = await bilt.functions.invoke<AskInnerCastResponse>(
        'askinnercast',
        { body: request },
      );

      if (functionError || !data || !isAskInnerCastSuccess(data)) {
        setError(
          data && 'error' in data
            ? data.error
            : "InnerCast couldn't answer right now. Please try again.",
        );
        return;
      }

      setAnswer(data.answer);
      setHistory(data.history);
    } catch {
      setError("InnerCast couldn't answer right now. Please try again.");
    } finally {
      setIsMatching(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, resultsY.current - 12), animated: true });
      });
    }
  }, []);

  const handleMatch = useCallback(() => {
    const message = text.trim();
    if (!message && selected.length === 0) {
      setError('Tell me a little about what you are going through, or pick what fits.');
      return;
    }

    void sendRequest({
      message,
      history,
      situations: selected.map(situationLabel),
      genres: selectedGenres,
    });
  }, [history, selected, selectedGenres, sendRequest, text]);

  const handleRetry = useCallback(() => {
    if (lastRequestRef.current) void sendRequest(lastRequestRef.current);
  }, [sendRequest]);

  const matches = answer ? interactiveMatches(answer) : [];

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner />
      </View>
    );
  }

  if (!hasOnboarded) return <Redirect href="/onboarding" />;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="px-5 pt-safe-offset-4 pb-16 gap-6"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
              InnerCast
            </Typography>
            <Typography type="h3" weight="semibold" className="mt-1.5">
              {greeting()}
              {name ? `, ${name}` : ''}
            </Typography>
            <Typography type="body-sm" color="muted" className="mt-1.5 leading-6">
              Describe what you are carrying tonight. 28 shows are on the shelf, each filed by what
              it helps with.
            </Typography>
          </View>
          <Pressable
            onPress={() => router.push('/settings/model')}
            accessibilityRole="button"
            accessibilityLabel="InnerCast matching details"
            className="border-border/70 rounded-2xl border p-2.5"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Cpu color={settings.enabled ? accent : muted} size={18} />
          </Pressable>
        </View>

        <Surface variant="secondary" className="gap-4 rounded-3xl p-4">
          <TextField>
            <Label>What is going on?</Label>
            <TextArea
              value={text}
              onChangeText={setText}
              placeholder="I just started a new job and want to connect with my team, but I keep overthinking every conversation and wondering if I belong."
              className="min-h-28"
              multiline
              numberOfLines={5}
            />
          </TextField>

          <View>
            <Typography type="body-sm" weight="medium" className="mb-2.5">
              Or pick what fits
            </Typography>
            <SituationChips selected={selected} onToggle={toggleSituation} />
          </View>

          <View className="border-border/60 border-t pt-3.5">
            <GenreFilterChips selected={selectedGenres} onToggle={toggleGenre} />
          </View>

          {avoidTopics.length > 0 ? (
            <Typography type="body-xs" color="muted" className="leading-5">
              Steering clear of {avoidTopics.join(', ')}.
            </Typography>
          ) : null}

          <Button variant="primary" onPress={handleMatch} isDisabled={isMatching}>
            {isMatching ? <Spinner size="sm" /> : <Search color={accentForeground} size={17} />}
            <Button.Label>
              {isMatching ? 'Finding characters for you…' : 'Find something'}
            </Button.Label>
          </Button>
        </Surface>

        <View
          className="gap-4"
          onLayout={(event) => {
            resultsY.current = event.nativeEvent.layout.y;
          }}
        >
          {isMatching ? (
            <Surface variant="secondary" className="flex-row items-center gap-3 rounded-3xl p-4">
              <Spinner size="sm" />
              <Typography type="body-sm" weight="medium">
                Finding characters for you…
              </Typography>
            </Surface>
          ) : error ? (
            <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
              <Typography type="body-sm" className="text-danger leading-6">
                {error}
              </Typography>
              <Button variant="secondary" className="self-start" onPress={handleRetry}>
                <Button.Label>Try again</Button.Label>
              </Button>
            </Surface>
          ) : answer ? (
            <View className="gap-4">
              <Surface variant="default" className="gap-3 rounded-3xl p-4">
                <Typography type="body-sm" weight="semibold">
                  For tonight
                </Typography>
                <MarkdownAnswer>{answer}</MarkdownAnswer>
              </Surface>

              {matches.map((match, index) => (
                <MatchCard
                  key={`${match.show.id}:${match.characterIds.join(',')}`}
                  recommendation={match.recommendation}
                  show={match.show}
                  rank={index + 1}
                  matchedCharacterIds={match.characterIds}
                  compact
                  showJourneyActions={false}
                />
              ))}
            </View>
          ) : (
            <Surface variant="default" className="gap-2 rounded-3xl p-4">
              <Typography type="body-sm" weight="semibold">
                How this works
              </Typography>
              <Typography type="body-sm" color="muted" className="leading-6">
                Tell InnerCast what you are going through. It will match you with characters whose
                stories may meet you there.
              </Typography>
            </Surface>
          )}
        </View>

        <PillarsSection
          onDiscoverPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

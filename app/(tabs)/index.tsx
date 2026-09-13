import { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Button, Label, Spinner, Surface, TextArea, TextField, Typography } from 'heroui-native';
import { Cpu, Search } from 'lucide-react-native';
import { Redirect, router } from 'expo-router';

import { EngineBadge } from '@/components/EngineBadge';
import { GenreFilterChips } from '@/components/GenreFilterChips';
import { MatchCard } from '@/components/MatchCard';
import { PillarsSection } from '@/components/PillarsSection';
import { SectionHeading } from '@/components/SectionHeading';
import { SituationChips } from '@/components/SituationChips';
import { getShow, SHOWS } from '@/lib/data/shows';
import type { GenreFilter } from '@/lib/genres';
import { buildSession, runMatch } from '@/lib/rag/recommend';
import { useProfileHydrated } from '@/lib/store/hydration';
import { useProfileStore } from '@/lib/store/profile';
import { useSessionStore } from '@/lib/store/sessions';
import { useSettingsStore } from '@/lib/store/settings';
import { useNativeThemeColor } from '@/lib/theme';
import type { MatchSession, SituationId } from '@/lib/types';

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
  const traits = useProfileStore((state) => state.traits);
  const personaTags = useProfileStore((state) => state.personaTags);
  const settings = useSettingsStore((state) => state.model);
  const addSession = useSessionStore((state) => state.addSession);
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
  const [session, setSession] = useState<MatchSession | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const resultsY = useRef(0);

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

  const handleMatch = useCallback(async () => {
    const message = text.trim();
    if (message.length < 4 && selected.length === 0) {
      setError('Tell me a little about what you are going through, or pick what fits.');
      return;
    }

    setError(null);
    setIsMatching(true);

    try {
      const request = {
        text: message,
        selectedSituations: selected,
        personaTags,
        traits,
        avoidTopics,
        selectedGenres,
        settings,
      };
      const outcome = await runMatch(request);
      if (outcome.recommendations.length === 0) {
        setSession(null);
        setError(outcome.engineNote ?? 'No matches cleared your preferences. Try changing them.');
        return;
      }

      const nextSession = buildSession(request, outcome);
      addSession(nextSession);
      setSession(nextSession);
    } catch {
      setError("InnerCast couldn't find a match right now. Please try again.");
    } finally {
      setIsMatching(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, resultsY.current - 12), animated: true });
      });
    }
  }, [addSession, avoidTopics, personaTags, selected, selectedGenres, settings, text, traits]);

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
              Describe what you are carrying tonight. {SHOWS.length} shows are on the shelf, each
              filed by what it helps with.
            </Typography>
          </View>
          <Pressable
            onPress={() => router.push('/settings/model')}
            accessibilityRole="button"
            accessibilityLabel="Local model settings"
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
              <Button variant="secondary" className="self-start" onPress={handleMatch}>
                <Button.Label>Try again</Button.Label>
              </Button>
            </Surface>
          ) : session ? (
            <>
              <SectionHeading title="For tonight" className="mb-0" />
              <EngineBadge
                engine={session.engine}
                modelName={session.modelName}
                note={session.engineNote}
              />
              {session.recommendations.map((recommendation, index) => {
                const show = getShow(recommendation.showId);
                const trace = session.retrieval.find(
                  (item) => item.showId === recommendation.showId,
                );
                if (!show) return null;
                return (
                  <MatchCard
                    key={recommendation.showId}
                    recommendation={recommendation}
                    show={show}
                    rank={index + 1}
                    sessionId={session.id}
                    matchedSituations={trace?.matchedSituations}
                    matchedCharacterIds={trace?.characterIds}
                  />
                );
              })}
            </>
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

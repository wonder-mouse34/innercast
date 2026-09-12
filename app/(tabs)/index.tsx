import { useCallback, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Button, Label, Spinner, Surface, TextArea, TextField, Typography } from 'heroui-native';
import { Cpu, Search } from 'lucide-react-native';
import { Redirect, router } from 'expo-router';

import { EngineBadge } from '@/components/EngineBadge';
import { GenreFilterChips } from '@/components/GenreFilterChips';
import { MatchCard } from '@/components/MatchCard';
import { PillarsSection } from '@/components/PillarsSection';
import { RetrievalTrace } from '@/components/RetrievalTrace';
import { SectionHeading } from '@/components/SectionHeading';
import { SituationChips } from '@/components/SituationChips';
import { buildSession, runMatch, type MatchOutcome } from '@/lib/rag/recommend';
import { getShow, SHOWS } from '@/lib/data/shows';
import type { GenreFilter } from '@/lib/genres';
import { situationLabel } from '@/lib/data/situations';
import { useNativeThemeColor } from '@/lib/theme';
import { useProfileHydrated } from '@/lib/store/hydration';
import { useProfileStore } from '@/lib/store/profile';
import { useSessionStore } from '@/lib/store/sessions';
import { useSettingsStore } from '@/lib/store/settings';
import type { RetrievedShow, SituationId } from '@/lib/types';

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
  const profileTraits = useProfileStore((state) => state.traits);
  const personaTags = useProfileStore((state) => state.personaTags);
  const avoidTopics = useProfileStore((state) => state.avoidTopics);
  const settings = useSettingsStore((state) => state.model);
  const sessions = useSessionStore((state) => state.sessions);
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
  const [outcome, setOutcome] = useState<MatchOutcome | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

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
    const trimmed = text.trim();
    if (trimmed.length < 4 && selected.length === 0) {
      setError('Tell me a little about tonight, or tap a situation below.');
      return;
    }

    setError(null);
    setIsMatching(true);
    // Drop the previous answer now: leaving it on screen under a spinner reads
    // as if those picks belong to the situation just typed.
    setOutcome(null);
    setSessionId(undefined);
    const request = {
      text: trimmed,
      selectedSituations: selected,
      personaTags,
      traits: profileTraits,
      avoidTopics,
      selectedGenres,
      settings,
    };

    try {
      const result = await runMatch(request);
      const session = buildSession(request, result);
      addSession(session);
      setOutcome(result);
      setSessionId(session.id);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, resultsY.current - 12), animated: true });
      });
    } catch {
      setError('Something went wrong while reading the library. Try again.');
    } finally {
      setIsMatching(false);
    }
  }, [
    addSession,
    avoidTopics,
    personaTags,
    profileTraits,
    selected,
    selectedGenres,
    settings,
    text,
  ]);

  const candidateByShow = useMemo(() => {
    const map = new Map<string, RetrievedShow>();
    for (const candidate of outcome?.retrieval.candidates ?? [])
      map.set(candidate.show.id, candidate);
    return map;
  }, [outcome]);

  const traceRows = useMemo(
    () =>
      (outcome?.retrieval.candidates ?? []).map((candidate) => ({
        showId: candidate.show.id,
        score: candidate.score,
        matchedTerms: candidate.matchedTerms,
        matchedSituations: candidate.matchedSituations,
        chunkKinds: candidate.matchedChunks.map((chunk) => chunk.kind),
        matchedCharacters: candidate.matchedCharacters,
        graphPath: candidate.graphPath,
      })),
    [outcome],
  );

  const detected = outcome?.retrieval.detectedSituations ?? [];
  const recent = sessions.slice(0, 3);

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
              Inner Cast
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
              placeholder="My grandmother died last month and the evenings are the hardest part. I can't handle anything cruel right now."
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

          {error ? (
            <Typography type="body-sm" className="text-danger">
              {error}
            </Typography>
          ) : null}

          <Button
            variant="primary"
            onPress={() => {
              void handleMatch();
            }}
            isDisabled={isMatching}
          >
            {isMatching ? <Spinner size="sm" /> : <Search color={accentForeground} size={17} />}
            <Button.Label>{isMatching ? 'Reading the library…' : 'Find something'}</Button.Label>
          </Button>
        </Surface>

        <View
          className="gap-4"
          onLayout={(event) => {
            resultsY.current = event.nativeEvent.layout.y;
          }}
        >
          {outcome ? (
            <>
              <SectionHeading
                title={
                  outcome.recommendations.length > 0
                    ? 'For tonight'
                    : 'Nothing cleared your filters'
                }
                caption={
                  detected.length > 0
                    ? `Read as ${detected.map((hit) => situationLabel(hit.id)).join(', ')}`
                    : undefined
                }
                className="mb-0"
              />

              <EngineBadge
                engine={outcome.engine}
                modelName={outcome.modelName}
                note={outcome.engineNote}
              />

              {outcome.recommendations.map((recommendation, index) => {
                const show = getShow(recommendation.showId);
                if (!show) return null;
                const candidate = candidateByShow.get(show.id);
                return (
                  <MatchCard
                    key={recommendation.showId}
                    recommendation={recommendation}
                    show={show}
                    rank={index + 1}
                    sessionId={sessionId}
                    alignedAxes={candidate?.alignedAxes}
                    matchedSituations={candidate?.matchedSituations}
                  />
                );
              })}

              {traceRows.length > 0 ? (
                <RetrievalTrace
                  rows={traceRows}
                  queryTokens={outcome.retrieval.queryTokens}
                  filteredOut={outcome.retrieval.filteredOut}
                />
              ) : null}
            </>
          ) : recent.length > 0 ? (
            <>
              <SectionHeading title="Where you were before" className="mb-0" />
              <Surface variant="secondary" className="rounded-3xl px-4 py-1">
                {recent.map((session, index) => (
                  <Pressable
                    key={session.id}
                    onPress={() =>
                      router.push({ pathname: '/session/[id]', params: { id: session.id } })
                    }
                    accessibilityRole="button"
                    className={index === 0 ? 'py-3.5' : 'border-border/50 border-t py-3.5'}
                    style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                  >
                    <Typography type="body-sm" numberOfLines={2} className="leading-5">
                      {session.situationText ||
                        session.selectedSituations.map(situationLabel).join(', ') ||
                        'Untitled evening'}
                    </Typography>
                    <Typography type="body-xs" color="muted" className="mt-1">
                      {new Date(session.createdAt).toLocaleDateString()} ·{' '}
                      {session.recommendations.length} suggestions
                    </Typography>
                  </Pressable>
                ))}
              </Surface>
            </>
          ) : (
            <Surface variant="default" className="gap-2 rounded-3xl p-4">
              <Typography type="body-sm" weight="semibold">
                How this works
              </Typography>
              <Typography type="body-sm" color="muted" className="leading-6">
                Your words are matched against a hand-written library of shows — what each one is
                about, who it helps and what it leaves behind. Only the shows that come back from
                that search are ever suggested, and you can open the search itself to see why.
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

import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Button, Chip, Separator, Surface, Typography } from 'heroui-native';
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Clock,
  PenLine,
  UserRound,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { LinearGradient } from '@/components/ui/primitives/LinearGradient';
import { ScoreBar } from '@/components/ScoreBar';
import { SectionHeading } from '@/components/SectionHeading';
import { ShowRow } from '@/components/ShowRow';
import { charactersForShow, getCharacter } from '@/lib/data/characters';
import { commitmentLabel, getShow, relatedShows } from '@/lib/data/shows';
import { goBackOrReplace } from '@/lib/navigation';
import { monogram } from '@/components/ShowArtwork';
import { personaLabel } from '@/lib/data/personaTraits';
import { situationLabel } from '@/lib/data/situations';
import { useNativeThemeColor, withAlpha } from '@/lib/theme';
import { useProfileStore } from '@/lib/store/profile';
import { useSessionStore } from '@/lib/store/sessions';
import { useWatchlistStore } from '@/lib/store/watchlist';
import { TRAIT_META, type Show, type TraitVector, type WatchStatus } from '@/lib/types';

const STATUS_OPTIONS: { status: WatchStatus; label: string }[] = [
  { status: 'saved', label: 'Saved' },
  { status: 'watching', label: 'Watching' },
  { status: 'finished', label: 'Finished' },
  { status: 'not-for-me', label: 'Not for me' },
];

function AxisCompare({ show, traits }: { show: Show; traits: TraitVector }) {
  return (
    <View className="gap-3.5">
      {TRAIT_META.map((meta) => {
        const showValue = show.traits[meta.axis];
        const yours = traits[meta.axis];
        const gap = Math.abs(showValue - yours);
        const note =
          gap <= 12 ? 'close to you' : showValue > yours ? `${gap} above you` : `${gap} below you`;

        return (
          <View key={meta.axis} className="gap-1.5">
            <View className="flex-row items-baseline justify-between gap-3">
              <Typography type="body-sm">{meta.label}</Typography>
              <Typography type="body-xs" color="muted">
                {note}
              </Typography>
            </View>
            <View className="bg-background-tertiary h-2 rounded-full">
              <View
                className="bg-accent/80 h-2 rounded-full"
                style={{ width: `${Math.max(2, showValue)}%` }}
              />
              <View
                className="bg-foreground absolute h-3.5 w-0.5 rounded-full"
                style={{ left: `${Math.min(99, Math.max(1, yours))}%`, top: -3 }}
              />
            </View>
          </View>
        );
      })}
      <Typography type="body-xs" color="muted" className="leading-5">
        The bar is where the show sits; the line is where you said you are.
      </Typography>
    </View>
  );
}

export default function ShowDetailScreen() {
  const { id, sessionId } = useLocalSearchParams<{ id: string; sessionId?: string }>();
  const [accent, muted, warning, accentForeground, background, foreground] = useNativeThemeColor([
    'accent',
    'muted',
    'warning',
    'accent-foreground',
    'background',
    'foreground',
  ]);

  const traits = useProfileStore((state) => state.traits);
  const personaTags = useProfileStore((state) => state.personaTags);
  const sessions = useSessionStore((state) => state.sessions);
  const entries = useWatchlistStore((state) => state.entries);
  const setStatus = useWatchlistStore((state) => state.setStatus);
  const removeShow = useWatchlistStore((state) => state.removeShow);

  const show = getShow(id);
  const entry = entries.find((item) => item.showId === id);
  const session = sessions.find((item) => item.id === sessionId);
  const recommendation = session?.recommendations.find((item) => item.showId === id);
  const trace = session?.retrieval.find((item) => item.showId === id);
  const related = useMemo(() => (show ? relatedShows(show) : []), [show]);
  const characters = useMemo(() => (show ? charactersForShow(show.id) : []), [show]);

  if (!show) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Typography type="h5" weight="semibold" className="text-center">
          That show is not in the library
        </Typography>
        <Button variant="secondary" onPress={() => goBackOrReplace('/')}>
          <Button.Label>Back to Discover</Button.Label>
        </Button>
      </View>
    );
  }

  const isSaved = entry?.status === 'saved' || entry?.status === 'watching';

  return (
    <ScrollView className="flex-1" contentContainerClassName="pb-16">
      <LinearGradient
        colors={[show.palette[0], show.palette[1]]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-safe-offset-3 gap-5 px-5 pb-7"
      >
        {/* Scrim: show palettes run from dark to bright, so theme text needs a
            dark base underneath it to stay readable on the bright end. */}
        <LinearGradient
          colors={[withAlpha(background, 0.2), withAlpha(background, 0.85)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="absolute inset-0"
        />

        <Pressable
          onPress={() => goBackOrReplace('/')}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="bg-background/40 h-10 w-10 items-center justify-center rounded-full"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <ArrowLeft color={foreground} size={20} />
        </Pressable>

        <View className="gap-2">
          <Typography
            type="body-xs"
            weight="semibold"
            className="text-foreground/85"
            style={{ letterSpacing: 2 }}
          >
            {monogram(show.title)} · {show.origin.toUpperCase()}
          </Typography>
          <Typography type="h2" weight="bold" className="text-foreground">
            {show.title}
          </Typography>
          <Typography type="body-sm" className="text-foreground/75">
            {show.years} · {show.genres.join(' · ')}
          </Typography>
          <Typography type="body-sm" className="text-foreground/90 mt-1 leading-6">
            {show.logline}
          </Typography>
        </View>
      </LinearGradient>

      <View className="gap-6 px-5 pt-6">
        {recommendation ? (
          <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
            <View className="flex-row items-center justify-between gap-3">
              <Typography type="body-sm" weight="semibold">
                Why this came up for you
              </Typography>
              <View className="bg-accent-soft rounded-2xl px-2.5 py-1">
                <Typography type="body-xs" weight="bold" className="text-accent-soft-foreground">
                  {recommendation.fit} fit
                </Typography>
              </View>
            </View>
            {recommendation.characterName ? (
              <View className="flex-row items-center gap-1.5">
                <UserRound color={accent} size={14} />
                <Typography type="body-xs" weight="semibold" className="text-accent flex-1">
                  {`Through ${recommendation.characterName}`}
                </Typography>
              </View>
            ) : null}
            <Typography type="body-sm" className="leading-6">
              {recommendation.reason}
            </Typography>
            {recommendation.characterLink ? (
              <Typography type="body-xs" color="muted" className="leading-5 italic">
                {recommendation.characterLink}
              </Typography>
            ) : null}
            {recommendation.howToWatch ? (
              <View className="flex-row gap-2">
                <Clock color={muted} size={14} style={{ marginTop: 3 }} />
                <Typography type="body-xs" color="muted" className="flex-1 leading-5">
                  {recommendation.howToWatch}
                </Typography>
              </View>
            ) : null}
            {recommendation.caution ? (
              <View className="bg-warning-soft/60 flex-row gap-2 rounded-2xl px-3 py-2.5">
                <AlertTriangle color={warning} size={14} style={{ marginTop: 3 }} />
                <Typography
                  type="body-xs"
                  className="text-warning-soft-foreground flex-1 leading-5"
                >
                  {recommendation.caution}
                </Typography>
              </View>
            ) : null}
            {session ? (
              <Typography type="body-xs" color="muted">
                From your match on {new Date(session.createdAt).toLocaleDateString()} ·{' '}
                {session.engine === 'local-model'
                  ? `written by ${session.modelName ?? 'your local model'}`
                  : 'written on this device'}
              </Typography>
            ) : null}
          </Surface>
        ) : null}

        <View className="gap-3">
          <SectionHeading
            title="Who you would be sitting with"
            caption="The people this show is built around, and when they tend to land."
            className="mb-0"
          />
          {characters.map((character) => {
            const shared = character.personaTags.filter((tag) => personaTags.includes(tag));
            const anchored = recommendation?.characterId === character.id;
            return (
              <Surface
                key={character.id}
                variant={anchored ? 'secondary' : 'default'}
                className={`gap-2 rounded-3xl p-4 ${anchored ? 'border-accent/50 border' : ''}`}
              >
                <View className="flex-row items-center gap-2">
                  <UserRound color={anchored ? accent : muted} size={15} />
                  <Typography type="body-sm" weight="semibold" className="flex-1">
                    {character.name}
                  </Typography>
                  <Typography
                    type="body-xs"
                    color="muted"
                    numberOfLines={1}
                    className="max-w-[45%]"
                  >
                    {character.role}
                  </Typography>
                </View>
                <Typography type="body-sm" className="leading-6">
                  {character.portrait}
                </Typography>
                <Typography type="body-xs" color="muted" className="leading-5">
                  Carrying: {character.facing}
                </Typography>
                <Typography type="body-xs" color="muted" className="leading-5">
                  You may recognise yourself in them if {character.recognizeIf}
                </Typography>
                {shared.length > 0 ? (
                  <View className="mt-0.5 flex-row flex-wrap gap-1.5">
                    {shared.map((tag) => (
                      <View key={tag} className="bg-accent-soft rounded-full px-2.5 py-1">
                        <Typography type="body-xs" className="text-accent-soft-foreground">
                          {personaLabel(tag)}
                        </Typography>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Surface>
            );
          })}
        </View>

        <Separator />

        <View className="gap-3">
          <SectionHeading title="What it does for people" className="mb-0" />
          <Typography type="body" className="leading-7">
            {show.whyItHelps}
          </Typography>
          <Typography type="body-sm" color="muted" className="leading-6">
            Afterwards: {show.afterward}
          </Typography>
        </View>

        <Separator />

        <View className="gap-3">
          <SectionHeading
            title="The show itself"
            caption={commitmentLabel(show)}
            className="mb-0"
          />
          <Typography type="body-sm" className="leading-6">
            {show.synopsis}
          </Typography>
          <View className="mt-1 flex-row flex-wrap gap-1.5">
            {show.tone.map((tone) => (
              <View key={tone} className="border-border/70 rounded-full border px-2.5 py-1">
                <Typography type="body-xs" color="muted">
                  {tone}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <SectionHeading title="Themes it sits with" className="mb-0" />
          <View className="flex-row flex-wrap gap-1.5">
            {show.themes.map((theme) => (
              <View key={theme} className="bg-background-secondary rounded-full px-2.5 py-1.5">
                <Typography type="body-xs">{theme}</Typography>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <SectionHeading title="Filed under" className="mb-0" />
          <View className="flex-row flex-wrap gap-1.5">
            {show.situations.map((situation) => (
              <View key={situation} className="bg-accent-soft/70 rounded-full px-2.5 py-1.5">
                <Typography type="body-xs" className="text-accent-soft-foreground">
                  {situationLabel(situation)}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        {show.contentWarnings.length > 0 ? (
          <Surface variant="default" className="gap-2 rounded-3xl p-4">
            <View className="flex-row items-center gap-2">
              <AlertTriangle color={warning} size={15} />
              <Typography type="body-sm" weight="semibold">
                Worth knowing before you start
              </Typography>
            </View>
            <Typography type="body-sm" color="muted" className="leading-6">
              {show.contentWarnings.join(' · ')}
            </Typography>
          </Surface>
        ) : null}

        <Surface variant="secondary" className="gap-4 rounded-3xl p-4">
          <SectionHeading title="How it lines up with you" className="mb-0" />
          <AxisCompare show={show} traits={traits} />
        </Surface>

        {trace ? (
          <Surface variant="default" className="gap-3 rounded-3xl p-4">
            <Typography type="body-sm" weight="semibold">
              How it surfaced
            </Typography>
            <ScoreBar label="Character match" value={trace.score.character} />
            <ScoreBar label="Text match" value={trace.score.lexical} />
            <ScoreBar label="Trait fit" value={trace.score.traitFit} />
            <ScoreBar label="Situation overlap" value={trace.score.situation} />
            {(trace.characterIds ?? []).length > 0 ? (
              <Typography type="body-xs" color="muted" className="leading-5">
                Carried by{' '}
                {(trace.characterIds ?? [])
                  .map((characterId) => getCharacter(characterId)?.name)
                  .filter((value): value is string => Boolean(value))
                  .join(', ')}
              </Typography>
            ) : null}
            {trace.matchedTerms.length > 0 ? (
              <Typography type="body-xs" color="muted" className="leading-5">
                Matched on {trace.matchedTerms.slice(0, 10).join(', ')}
              </Typography>
            ) : null}
          </Surface>
        ) : null}

        <View className="gap-3">
          <SectionHeading title="Where you are with it" className="mb-0" />
          <View className="flex-row flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => {
              const active = entry?.status === option.status;
              return (
                <Chip
                  key={option.status}
                  size="sm"
                  variant={active ? 'primary' : 'secondary'}
                  color={active ? 'accent' : 'default'}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() =>
                    active ? removeShow(show.id) : setStatus(show.id, option.status, sessionId)
                  }
                >
                  <Chip.Label>{option.label}</Chip.Label>
                </Chip>
              );
            })}
          </View>
        </View>

        <View className="flex-row gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onPress={() => (isSaved ? removeShow(show.id) : setStatus(show.id, 'saved', sessionId))}
          >
            {isSaved ? (
              <BookmarkCheck color={accent} size={17} />
            ) : (
              <Bookmark color={muted} size={17} />
            )}
            <Button.Label>{isSaved ? 'On your list' : 'Save for later'}</Button.Label>
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onPress={() =>
              router.push({ pathname: '/reflect/[showId]', params: { showId: show.id } })
            }
          >
            <PenLine color={accentForeground} size={17} />
            <Button.Label>Reflect</Button.Label>
          </Button>
        </View>

        {related.length > 0 ? (
          <View className="gap-1">
            <SectionHeading
              title="Nearby on the shelf"
              caption="Filed under similar situations"
              className="mb-1"
            />
            {related.map((item) => (
              <ShowRow
                key={item.id}
                show={item}
                subtitle={item.logline}
                accessory={<ChevronRight color={muted} size={18} />}
              />
            ))}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

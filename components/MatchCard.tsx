import {
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Clock,
  PenLine,
  UserRound,
} from 'lucide-react-native';
import { Button, Surface, Typography } from 'heroui-native';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { ShowArtwork } from '@/components/ShowArtwork';
import { axisSummary } from '@/lib/rag/retrieve';
import { commitmentLabel } from '@/lib/data/shows';
import { situationLabel } from '@/lib/data/situations';
import { useNativeThemeColor } from '@/lib/theme';
import { useWatchlistStore } from '@/lib/store/watchlist';
import type { Recommendation, Show, SituationId, TraitAxis } from '@/lib/types';

type Props = {
  recommendation: Recommendation;
  show: Show;
  rank: number;
  sessionId?: string;
  alignedAxes?: TraitAxis[];
  matchedSituations?: SituationId[];
};

export function MatchCard({
  recommendation,
  show,
  rank,
  sessionId,
  alignedAxes = [],
  matchedSituations = [],
}: Props) {
  const [accent, warning, muted, accentForeground] = useNativeThemeColor([
    'accent',
    'warning',
    'muted',
    'accent-foreground',
  ]);
  const entries = useWatchlistStore((state) => state.entries);
  const setStatus = useWatchlistStore((state) => state.setStatus);
  const removeShow = useWatchlistStore((state) => state.removeShow);

  const entry = entries.find((item) => item.showId === show.id);
  const isSaved = entry?.status === 'saved' || entry?.status === 'watching';

  const openDetail = () =>
    router.push({
      pathname: '/show/[id]',
      params: { id: show.id, ...(sessionId ? { sessionId } : {}) },
    });

  const openReflection = () =>
    router.push({ pathname: '/reflect/[showId]', params: { showId: show.id } });

  const toggleSave = () => {
    if (isSaved) removeShow(show.id);
    else setStatus(show.id, 'saved', sessionId);
  };

  const alignedPhrases = alignedAxes
    .slice(0, 3)
    .map((axis) => axisSummary(axis, show.traits[axis]))
    .filter(Boolean);

  return (
    <Pressable
      onPress={openDetail}
      accessibilityRole="button"
      accessibilityLabel={`Open ${show.title}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Surface variant="secondary" className="gap-3.5 rounded-3xl p-4">
        <View className="flex-row items-center gap-3">
          <ShowArtwork show={show} size="md" />
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Typography type="body-xs" color="muted">
                {rank}
              </Typography>
              <Typography type="h5" weight="semibold" className="flex-1" numberOfLines={2}>
                {show.title}
              </Typography>
            </View>
            <Typography type="body-xs" color="muted" className="mt-1">
              {show.years} · {show.origin}
            </Typography>
            <Typography type="body-xs" color="muted" className="mt-0.5">
              {commitmentLabel(show)}
            </Typography>
          </View>
          <View className="bg-accent-soft items-center justify-center rounded-2xl px-2.5 py-1.5">
            <Typography type="body-sm" weight="bold" className="text-accent-soft-foreground">
              {recommendation.fit}
            </Typography>
            <Typography type="body-xs" className="text-accent-soft-foreground opacity-80">
              fit
            </Typography>
          </View>
        </View>

        <View className="gap-1.5">
          {recommendation.characterName ? (
            <View className="flex-row items-center gap-1.5">
              <UserRound color={accent} size={13} />
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
        </View>

        {alignedPhrases.length > 0 || matchedSituations.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5">
            {alignedPhrases.map((phrase) => (
              <View key={phrase} className="border-border/70 rounded-full border px-2.5 py-1">
                <Typography type="body-xs" color="muted">
                  {phrase}
                </Typography>
              </View>
            ))}
            {matchedSituations.slice(0, 2).map((id) => (
              <View key={id} className="bg-accent-soft/70 rounded-full px-2.5 py-1">
                <Typography type="body-xs" className="text-accent-soft-foreground">
                  {situationLabel(id)}
                </Typography>
              </View>
            ))}
          </View>
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
            <Typography type="body-xs" className="text-warning-soft-foreground flex-1 leading-5">
              {recommendation.caution}
            </Typography>
          </View>
        ) : null}

        <View className="flex-row gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onPress={toggleSave}>
            {isSaved ? (
              <BookmarkCheck color={accent} size={16} />
            ) : (
              <Bookmark color={muted} size={16} />
            )}
            <Button.Label>{isSaved ? 'On your list' : 'Save'}</Button.Label>
          </Button>
          <Button variant="primary" size="sm" className="flex-1" onPress={openReflection}>
            <PenLine size={16} color={accentForeground} />
            <Button.Label>Reflect</Button.Label>
          </Button>
        </View>
      </Surface>
    </Pressable>
  );
}

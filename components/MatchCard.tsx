import { useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff,
  PenLine,
  UserRound,
} from 'lucide-react-native';
import { Button, Surface, Typography } from 'heroui-native';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { ShowArtwork } from '@/components/ShowArtwork';
import { axisSummary } from '@/lib/rag/retrieve';
import { commitmentLabel } from '@/lib/data/shows';
import { getCharacter } from '@/lib/data/characters';
import { reflectHref } from '@/lib/navigation';
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

function endingLabel(show: Show): string {
  if (!show.endingTone) return 'Not classified in this library record';
  return `${show.endingTone.charAt(0).toUpperCase()}${show.endingTone.slice(1)}`;
}

export function MatchCard({
  recommendation,
  show,
  rank,
  sessionId,
  alignedAxes = [],
  matchedSituations = [],
}: Props) {
  const [spoilersVisible, setSpoilersVisible] = useState(false);
  const [accent, warning, muted, accentForeground] = useNativeThemeColor([
    'accent',
    'warning',
    'muted',
    'accent-foreground',
  ]);
  const entries = useWatchlistStore((state) => state.entries);
  const setStatus = useWatchlistStore((state) => state.setStatus);
  const removeShow = useWatchlistStore((state) => state.removeShow);

  const character = recommendation.characterId
    ? getCharacter(recommendation.characterId)
    : undefined;
  const entry = entries.find((item) => item.showId === show.id);
  const isSaved = entry?.status === 'saved' || entry?.status === 'watching';

  const openDetail = () =>
    router.push({
      pathname: '/show/[id]',
      params: { id: show.id, ...(sessionId ? { sessionId } : {}) },
    });

  const openReflection = () => router.push(reflectHref(show.id, recommendation.characterId));

  const toggleSave = () => {
    if (isSaved) removeShow(show.id);
    else setStatus(show.id, 'saved', sessionId);
  };

  const alignedPhrases = alignedAxes
    .slice(0, 3)
    .map((axis) => axisSummary(axis, show.traits[axis]))
    .filter(Boolean);

  return (
    <Surface variant="secondary" className="gap-3.5 rounded-3xl p-4">
      <Pressable
        onPress={openDetail}
        accessibilityRole="button"
        accessibilityLabel={`Open ${recommendation.characterName ?? show.title} in ${show.title}`}
        className="flex-row items-center gap-3"
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      >
        <ShowArtwork show={show} size="md" />
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2">
            <Typography type="body-xs" color="muted">
              {rank}
            </Typography>
            <UserRound color={accent} size={14} />
            <Typography type="h5" weight="semibold" className="flex-1" numberOfLines={2}>
              {recommendation.characterName ?? show.title}
            </Typography>
          </View>
          {character?.role ? (
            <Typography type="body-xs" color="muted" numberOfLines={1}>
              {character.role}
            </Typography>
          ) : null}
          <Typography type="body-sm" weight="medium" className="mt-1" numberOfLines={2}>
            in {show.title}
          </Typography>
          <Typography type="body-xs" color="muted">
            {show.years} · {commitmentLabel(show)}
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
      </Pressable>

      {character?.appearanceNote ? (
        <Typography type="body-xs" weight="semibold" className="text-accent">
          Appears in: {character.appearanceNote}
        </Typography>
      ) : null}

      <View className="gap-1.5">
        <Typography type="body-sm" className="leading-6">
          {recommendation.reason}
        </Typography>
        {recommendation.characterLink ? (
          <Typography type="body-xs" color="muted" className="leading-5 italic">
            {recommendation.characterLink}
          </Typography>
        ) : null}
      </View>

      <View className="gap-1">
        <Typography type="body-xs" weight="semibold">
          Overall sentiment
        </Typography>
        <Typography type="body-xs" color="muted" className="leading-5">
          {show.tone.length > 0 ? show.tone.join(' · ') : 'Not yet described'}
        </Typography>
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

      {recommendation.caution ? (
        <View className="bg-warning-soft/60 flex-row gap-2 rounded-2xl px-3 py-2.5">
          <AlertTriangle color={warning} size={14} style={{ marginTop: 3 }} />
          <Typography type="body-xs" className="text-warning-soft-foreground flex-1 leading-5">
            {recommendation.caution}
          </Typography>
        </View>
      ) : null}

      <Button
        variant="ghost"
        size="sm"
        className="self-start px-0"
        onPress={() => setSpoilersVisible((value) => !value)}
      >
        {spoilersVisible ? <EyeOff color={muted} size={15} /> : <Eye color={muted} size={15} />}
        <Button.Label>
          {spoilersVisible ? 'Hide story spoilers' : 'Reveal story and ending'}
        </Button.Label>
      </Button>

      {spoilersVisible ? (
        <Surface variant="default" className="gap-2 rounded-2xl p-3">
          <Typography type="body-xs" weight="semibold" className="text-warning">
            Spoilers below
          </Typography>
          <Typography type="body-sm" className="leading-6">
            {show.spoilerSummary ?? show.synopsis}
          </Typography>
          <Typography type="body-xs" weight="semibold">
            Ending: {endingLabel(show)}
          </Typography>
          {show.endingNote ? (
            <Typography type="body-xs" color="muted" className="leading-5">
              {show.endingNote}
            </Typography>
          ) : null}
        </Surface>
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
  );
}

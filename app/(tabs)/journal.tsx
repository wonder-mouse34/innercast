import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Button, Chip, Surface, Typography } from 'heroui-native';
import { ChevronRight, PenLine } from 'lucide-react-native';
import { router } from 'expo-router';

import { MoodDelta } from '@/components/MoodDelta';
import { SectionHeading } from '@/components/SectionHeading';
import { ShowArtwork } from '@/components/ShowArtwork';
import { getShow } from '@/lib/data/shows';
import { FREE_REFLECTION_ID, reflectHref } from '@/lib/navigation';
import { situationLabel } from '@/lib/data/situations';
import { useNativeThemeColor } from '@/lib/theme';
import { useReflectionStore } from '@/lib/store/reflections';
import type { Reflection } from '@/lib/types';

type Filter = 'all' | 'with-show' | 'awaiting' | 'lifted';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'with-show', label: 'Tied to a show' },
  { id: 'awaiting', label: 'No after yet' },
  { id: 'lifted', label: 'Ended better' },
];

function matchesFilter(entry: Reflection, filter: Filter): boolean {
  switch (filter) {
    case 'with-show':
      return Boolean(entry.showId);
    case 'awaiting':
      return entry.moodAfter === undefined;
    case 'lifted':
      return entry.moodAfter !== undefined && entry.moodAfter > entry.moodBefore;
    default:
      return true;
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function TrendCard({ entries }: { entries: Reflection[] }) {
  const withAfter = entries.filter((entry) => entry.moodAfter !== undefined);
  const recent = withAfter.slice(0, 12).toReversed();
  const lifts = withAfter.filter((entry) => (entry.moodAfter ?? 0) > entry.moodBefore).length;
  const average =
    withAfter.length > 0
      ? withAfter.reduce((sum, entry) => sum + ((entry.moodAfter ?? 0) - entry.moodBefore), 0) /
        withAfter.length
      : 0;

  if (withAfter.length < 2) {
    return (
      <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
        <Typography type="body-sm" weight="semibold">
          Your mood trend appears here
        </Typography>
        <Typography type="body-sm" color="muted" className="leading-6">
          Note how you felt before and after a couple of evenings and this turns into a picture of
          what actually helps.
        </Typography>
      </Surface>
    );
  }

  return (
    <Surface variant="secondary" className="gap-4 rounded-3xl p-4">
      <View className="flex-row items-end justify-between gap-3">
        <View className="flex-1">
          <Typography type="body-sm" weight="semibold">
            How your evenings land
          </Typography>
          <Typography type="body-xs" color="muted" className="mt-1 leading-5">
            {lifts} of {withAfter.length} entries ended better than they started
          </Typography>
        </View>
        <Typography type="h5" weight="bold" className="text-accent">
          {average > 0 ? '+' : ''}
          {average.toFixed(1)}
        </Typography>
      </View>

      <View className="h-16 flex-row items-end gap-1.5">
        {recent.map((entry) => {
          const after = entry.moodAfter ?? entry.moodBefore;
          const shift = after - entry.moodBefore;
          return (
            <View key={entry.id} className="flex-1 items-center gap-1">
              <View
                className={
                  shift < 0
                    ? 'bg-warning/70 w-full rounded-t-md'
                    : 'bg-accent/80 w-full rounded-t-md'
                }
                style={{ height: Math.max(4, after * 9) }}
              />
              <View className="bg-foreground/25 h-px w-full" />
            </View>
          );
        })}
      </View>
      <Typography type="body-xs" color="muted">
        Bar height is how you felt after watching, oldest on the left.
      </Typography>
    </Surface>
  );
}

function EntryCard({ entry }: { entry: Reflection }) {
  const [muted] = useNativeThemeColor(['muted']);
  const show = entry.showId ? getShow(entry.showId) : undefined;
  const snippet = entry.takeaway ?? entry.answers[0]?.answer ?? '';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/journal/[entryId]', params: { entryId: entry.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Open entry from ${formatDate(entry.createdAt)}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    >
      <Surface variant="default" className="mb-3 gap-3 rounded-3xl p-4">
        <View className="flex-row items-center gap-3">
          {show ? <ShowArtwork show={show} size="sm" /> : null}
          <View className="flex-1">
            <Typography type="body-xs" color="muted">
              {formatDate(entry.createdAt)}
            </Typography>
            <Typography type="body" weight="semibold" numberOfLines={1}>
              {show ? show.title : 'A quiet entry'}
            </Typography>
          </View>
          <ChevronRight color={muted} size={18} />
        </View>

        <MoodDelta before={entry.moodBefore} after={entry.moodAfter} />

        {snippet ? (
          <Typography type="body-sm" color="muted" className="leading-6" numberOfLines={3}>
            {snippet}
          </Typography>
        ) : null}

        {entry.situations.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5">
            {entry.situations.slice(0, 3).map((situation) => (
              <View key={situation} className="bg-background-tertiary rounded-full px-2 py-1">
                <Typography type="body-xs" color="muted">
                  {situationLabel(situation)}
                </Typography>
              </View>
            ))}
          </View>
        ) : null}

        {entry.sharedToCircleIds.length > 0 ? (
          <Typography type="body-xs" className="text-accent">
            Shared with {entry.sharedToCircleIds.length}{' '}
            {entry.sharedToCircleIds.length === 1 ? 'circle' : 'circles'}
          </Typography>
        ) : null}
      </Surface>
    </Pressable>
  );
}

export default function JournalScreen() {
  const entries = useReflectionStore((state) => state.entries);
  const [filter, setFilter] = useState<Filter>('all');
  const [accentForeground] = useNativeThemeColor(['accent-foreground']);

  const visible = useMemo(
    () => entries.filter((entry) => matchesFilter(entry, filter)),
    [entries, filter],
  );

  return (
    <FlatList
      data={visible}
      keyExtractor={(entry) => entry.id}
      className="flex-1"
      contentContainerClassName="px-5 pt-4 pb-16"
      renderItem={({ item }) => <EntryCard entry={item} />}
      ListHeaderComponent={
        <View className="gap-5 pb-4">
          <SectionHeading
            title="Your journal"
            caption={
              entries.length === 0
                ? 'Nothing here yet'
                : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
            }
            className="mb-0"
          />

          <TrendCard entries={entries} />

          <Button variant="primary" onPress={() => router.push(reflectHref(FREE_REFLECTION_ID))}>
            <PenLine color={accentForeground} size={17} />
            <Button.Label>Write an entry</Button.Label>
          </Button>

          {entries.length > 1 ? (
            <View className="flex-row flex-wrap gap-2">
              {FILTERS.map((option) => {
                const active = filter === option.id;
                return (
                  <Chip
                    key={option.id}
                    size="sm"
                    variant={active ? 'primary' : 'secondary'}
                    color={active ? 'accent' : 'default'}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setFilter(option.id)}
                  >
                    <Chip.Label>{option.label}</Chip.Label>
                  </Chip>
                );
              })}
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <Surface variant="secondary" className="gap-2 rounded-3xl p-5">
          <Typography type="body" weight="semibold">
            {entries.length === 0 ? 'Start after your next episode' : 'Nothing under that filter'}
          </Typography>
          <Typography type="body-sm" color="muted" className="leading-6">
            {entries.length === 0
              ? 'A reflection takes two minutes: how you arrived, one question, one line to keep.'
              : 'Try another filter, or write a new entry.'}
          </Typography>
        </Surface>
      }
    />
  );
}

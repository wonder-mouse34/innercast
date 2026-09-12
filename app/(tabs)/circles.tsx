import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Chip, Surface, Typography } from 'heroui-native';
import { Plus, Users } from 'lucide-react-native';
import { router } from 'expo-router';

import { SectionHeading } from '@/components/SectionHeading';
import { affinityLabel, rankCircles, relativeTime } from '@/lib/circleAffinity';
import { getShow } from '@/lib/data/shows';
import { situationLabel } from '@/lib/data/situations';
import { useCircleStore } from '@/lib/store/circles';
import { useNativeThemeColor } from '@/lib/theme';
import { useProfileStore } from '@/lib/store/profile';
import { useReflectionStore } from '@/lib/store/reflections';
import { useSessionStore } from '@/lib/store/sessions';
import type { Circle, SituationId } from '@/lib/types';

type CardProps = {
  circle: Circle;
  reasons?: string[];
  score?: number;
  joined: boolean;
};

function CircleCard({ circle, reasons, score, joined }: CardProps) {
  const [muted] = useNativeThemeColor(['muted']);
  const nowWatching = circle.nowWatchingShowId ? getShow(circle.nowWatchingShowId) : undefined;
  const latest = circle.posts[0];

  return (
    <Surface variant="default" className="gap-3 rounded-3xl p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Typography type="body" weight="semibold">
            {circle.name}
          </Typography>
          <Typography type="body-sm" color="muted" className="mt-1 leading-6">
            {circle.tagline}
          </Typography>
        </View>
        {score !== undefined ? (
          <View className="bg-accent-soft rounded-full px-2.5 py-1">
            <Typography type="body-xs" className="text-accent-soft-foreground">
              {affinityLabel(score)}
            </Typography>
          </View>
        ) : null}
      </View>

      <View className="flex-row items-center gap-2">
        <Users color={muted} size={14} />
        <Typography type="body-xs" color="muted">
          {circle.memberCount.toLocaleString()} members · {circle.cadence}
        </Typography>
      </View>

      {reasons && reasons.length > 0 ? (
        <View className="gap-1.5">
          {reasons.map((reason) => (
            <Typography key={reason} type="body-xs" color="muted" className="leading-5">
              · {reason}
            </Typography>
          ))}
        </View>
      ) : null}

      {nowWatching ? (
        <Typography type="body-xs" color="muted">
          Now watching{' '}
          <Typography type="body-xs" className="text-accent">
            {nowWatching.title}
          </Typography>
        </Typography>
      ) : null}

      {joined && latest ? (
        <Surface variant="secondary" className="gap-1 rounded-2xl p-3">
          <Typography type="body-xs" color="muted">
            {latest.author} · {relativeTime(latest.createdAt)}
          </Typography>
          <Typography type="body-sm" numberOfLines={2} className="leading-6">
            {latest.body}
          </Typography>
        </Surface>
      ) : null}

      <Button
        variant={joined ? 'secondary' : 'primary'}
        size="sm"
        className="self-start"
        onPress={() => router.push({ pathname: '/circle/[id]', params: { id: circle.id } })}
      >
        <Button.Label>{joined ? 'Open circle' : 'Take a look'}</Button.Label>
      </Button>
    </Surface>
  );
}

export default function CirclesScreen() {
  const circles = useCircleStore((state) => state.circles);
  const joinedIds = useCircleStore((state) => state.joinedIds);
  const traits = useProfileStore((state) => state.traits);
  const sessions = useSessionStore((state) => state.sessions);
  const entries = useReflectionStore((state) => state.entries);
  const [accentForeground] = useNativeThemeColor(['accent-foreground']);

  const recentSituations = useMemo(() => {
    const counts = new Map<SituationId, number>();
    for (const session of sessions.slice(0, 8)) {
      for (const situation of session.selectedSituations) {
        counts.set(situation, (counts.get(situation) ?? 0) + 1);
      }
    }
    for (const entry of entries.slice(0, 8)) {
      for (const situation of entry.situations) {
        counts.set(situation, (counts.get(situation) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([situation]) => situation);
  }, [sessions, entries]);

  const joined = useMemo(
    () => circles.filter((circle) => joinedIds.includes(circle.id)),
    [circles, joinedIds],
  );

  const suggestions = useMemo(
    () =>
      rankCircles(
        circles.filter((circle) => !joinedIds.includes(circle.id)),
        traits,
        recentSituations,
      ),
    [circles, joinedIds, traits, recentSituations],
  );

  return (
    <ScrollView className="flex-1" contentContainerClassName="px-5 pt-4 pb-16 gap-8">
      <View className="gap-4">
        <Typography type="body-sm" color="muted" className="leading-6">
          Small groups watching around the same thing. Nothing you write here leaves your device
          unless you post it.
        </Typography>
        <Button variant="primary" onPress={() => router.push('/circle/new')}>
          <Plus color={accentForeground} size={17} />
          <Button.Label>Start a circle</Button.Label>
        </Button>
      </View>

      {joined.length > 0 ? (
        <View className="gap-3">
          <SectionHeading
            title="Your circles"
            caption={`${joined.length} joined`}
            className="mb-0"
          />
          {joined.map((circle) => (
            <CircleCard key={circle.id} circle={circle} joined />
          ))}
        </View>
      ) : null}

      <View className="gap-3">
        <SectionHeading
          title={joined.length > 0 ? 'More circles for you' : 'Circles for you'}
          caption={
            recentSituations.length > 0
              ? `Ranked against your profile and ${recentSituations
                  .slice(0, 2)
                  .map(situationLabel)
                  .join(', ')
                  .toLowerCase()}`
              : 'Ranked against your taste profile'
          }
          className="mb-0"
        />

        {recentSituations.length === 0 ? (
          <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
            <Typography type="body-sm" color="muted" className="leading-6">
              Once you have asked for a match or written an entry, this list starts leaning toward
              what you are actually carrying.
            </Typography>
          </Surface>
        ) : null}

        {suggestions.map(({ circle, reasons, score, sharedSituations }) => (
          <View key={circle.id} className="gap-2">
            <CircleCard circle={circle} reasons={reasons} score={score} joined={false} />
            {sharedSituations.length > 0 ? (
              <View className="flex-row flex-wrap gap-1.5 px-1">
                {sharedSituations.slice(0, 3).map((situation) => (
                  <Chip key={situation} size="sm" variant="secondary">
                    <Chip.Label>{situationLabel(situation)}</Chip.Label>
                  </Chip>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

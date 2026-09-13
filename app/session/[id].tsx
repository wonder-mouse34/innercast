import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Surface, Typography } from 'heroui-native';
import { useLocalSearchParams } from 'expo-router';

import { EngineBadge } from '@/components/EngineBadge';
import { MatchCard } from '@/components/MatchCard';
import { RetrievalTrace } from '@/components/RetrievalTrace';
import { SectionHeading } from '@/components/SectionHeading';
import { TRAIT_META } from '@/lib/types';
import { axisSummary } from '@/lib/rag/retrieve';
import { getShow } from '@/lib/data/shows';
import { goBackOrReplace } from '@/lib/navigation';
import { personaLabel } from '@/lib/data/personaTraits';
import { relativeTime } from '@/lib/circleAffinity';
import { situationLabel } from '@/lib/data/situations';
import { useSessionStore } from '@/lib/store/sessions';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessions = useSessionStore((state) => state.sessions);
  const session = useMemo(() => sessions.find((entry) => entry.id === id), [id, sessions]);

  if (!session) {
    return (
      <View className="bg-background flex-1 gap-4 px-5 pt-10">
        <Typography type="h5" weight="semibold">
          This match is no longer saved
        </Typography>
        <Typography type="body-sm" color="muted" className="leading-6">
          History keeps your most recent evenings. This one has been cleared.
        </Typography>
        <Button variant="secondary" className="self-start" onPress={() => goBackOrReplace('/you')}>
          <Button.Label>Back</Button.Label>
        </Button>
      </View>
    );
  }

  const traitLines = TRAIT_META.filter((meta) => Math.abs(session.traits[meta.axis] - 50) >= 12)
    .slice(0, 4)
    .map((meta) => axisSummary(meta.axis, session.traits[meta.axis]));

  const traceBySituation = new Map(session.retrieval.map((row) => [row.showId, row]));

  return (
    <ScrollView className="bg-background flex-1" contentContainerClassName="px-5 pt-2 pb-16 gap-5">
      <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
        <Typography type="body-xs" color="muted">
          {relativeTime(session.createdAt)} · {new Date(session.createdAt).toLocaleString()}
        </Typography>
        {session.situationText ? (
          <Typography type="body" className="leading-7">
            “{session.situationText}”
          </Typography>
        ) : null}
        {session.selectedSituations.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {session.selectedSituations.map((situation) => (
              <View key={situation} className="bg-background-tertiary rounded-full px-3 py-1.5">
                <Typography type="body-xs">{situationLabel(situation)}</Typography>
              </View>
            ))}
          </View>
        ) : null}
        {(session.personaTags ?? []).length > 0 ? (
          <Typography type="body-xs" color="muted" className="leading-5">
            You described yourself as {(session.personaTags ?? []).map(personaLabel).join(', ')}.
          </Typography>
        ) : null}
        {traitLines.length > 0 ? (
          <Typography type="body-xs" color="muted" className="leading-5">
            Asked for {traitLines.join(', ')}.
          </Typography>
        ) : null}
      </Surface>

      <EngineBadge
        engine={session.engine}
        modelName={session.modelName}
        note={session.engineNote}
      />

      <SectionHeading title="What it suggested" className="mb-0" />

      {session.recommendations.map((recommendation, index) => {
        const show = getShow(recommendation.showId);
        if (!show) return null;
        return (
          <MatchCard
            key={recommendation.showId}
            recommendation={recommendation}
            show={show}
            rank={index + 1}
            sessionId={session.id}
            matchedSituations={traceBySituation.get(show.id)?.matchedSituations}
            matchedCharacterIds={traceBySituation.get(show.id)?.characterIds}
          />
        );
      })}

      {session.retrieval.length > 0 ? <RetrievalTrace rows={session.retrieval} /> : null}
    </ScrollView>
  );
}

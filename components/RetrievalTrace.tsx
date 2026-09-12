import { ChevronDown, ChevronUp, Database } from 'lucide-react-native';
import { Surface, Typography } from 'heroui-native';
import { Pressable, View } from 'react-native';
import { useState } from 'react';

import { ScoreBar } from '@/components/ScoreBar';
import { getShow } from '@/lib/data/shows';
import { situationLabel } from '@/lib/data/situations';
import { useNativeThemeColor } from '@/lib/theme';
import type { ChunkKind, ScoreBreakdown, SituationId } from '@/lib/types';

export type TraceRow = {
  showId: string;
  score: ScoreBreakdown;
  matchedTerms: string[];
  matchedSituations: SituationId[];
  chunkKinds: ChunkKind[];
};

type Props = {
  rows: TraceRow[];
  queryTokens?: string[];
  filteredOut?: { showId: string; reason: string }[];
};

const CHUNK_LABEL: Record<ChunkKind, string> = {
  situation: 'situation record',
  story: 'story record',
  texture: 'tone record',
};

/**
 * The app's honesty surface: exactly which library records were pulled, how
 * they scored, and what the avoid list removed before the model saw anything.
 */
export function RetrievalTrace({ rows, queryTokens = [], filteredOut = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [muted] = useNativeThemeColor(['muted']);

  return (
    <Surface variant="default" className="rounded-3xl p-4">
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="flex-row items-center gap-2.5"
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Database color={muted} size={16} />
        <View className="flex-1">
          <Typography type="body-sm" weight="semibold">
            What the library returned
          </Typography>
          <Typography type="body-xs" color="muted" className="mt-0.5">
            {rows.length} shows retrieved
            {filteredOut.length > 0 ? ` · ${filteredOut.length} filtered out` : ''}
          </Typography>
        </View>
        {open ? <ChevronUp color={muted} size={18} /> : <ChevronDown color={muted} size={18} />}
      </Pressable>

      {open ? (
        <View className="mt-4 gap-4">
          {queryTokens.length > 0 ? (
            <View>
              <Typography type="body-xs" weight="semibold" color="muted" className="mb-1.5">
                Search terms built from your words
              </Typography>
              <Typography type="body-xs" color="muted" className="leading-5">
                {queryTokens.slice(0, 28).join(' · ')}
              </Typography>
            </View>
          ) : null}

          {rows.map((row, index) => {
            const show = getShow(row.showId);
            if (!show) return null;
            return (
              <View key={row.showId} className="border-border/60 gap-2 rounded-2xl border p-3">
                <View className="flex-row items-center justify-between gap-2">
                  <Typography type="body-sm" weight="medium" className="flex-1" numberOfLines={1}>
                    {index + 1}. {show.title}
                  </Typography>
                  <Typography type="body-xs" color="muted">
                    total {Math.round(row.score.total * 100)}
                  </Typography>
                </View>
                <ScoreBar label="Text match" value={row.score.lexical} />
                <ScoreBar label="Trait fit" value={row.score.traitFit} />
                <ScoreBar label="Situation overlap" value={row.score.situation} />
                {row.matchedSituations.length > 0 ? (
                  <Typography type="body-xs" color="muted">
                    Filed under {row.matchedSituations.map(situationLabel).join(', ')}
                  </Typography>
                ) : null}
                {row.matchedTerms.length > 0 ? (
                  <Typography type="body-xs" color="muted">
                    Matched on {row.matchedTerms.slice(0, 8).join(', ')}
                  </Typography>
                ) : null}
                {row.chunkKinds.length > 0 ? (
                  <Typography type="body-xs" color="muted">
                    From {[...new Set(row.chunkKinds)].map((kind) => CHUNK_LABEL[kind]).join(', ')}
                  </Typography>
                ) : null}
              </View>
            );
          })}

          {filteredOut.length > 0 ? (
            <View>
              <Typography type="body-xs" weight="semibold" color="muted" className="mb-1.5">
                Held back for you
              </Typography>
              {filteredOut.map((item) => (
                <Typography key={item.showId} type="body-xs" color="muted" className="leading-5">
                  {getShow(item.showId)?.title ?? item.showId} — {item.reason}
                </Typography>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </Surface>
  );
}

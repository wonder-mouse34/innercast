import { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Button, Input, Surface, TextField, Typography } from 'heroui-native';
import {
  ChevronRight,
  Cpu,
  Network,
  Plus,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react-native';
import { router } from 'expo-router';

import { SectionHeading } from '@/components/SectionHeading';
import { ShowRow } from '@/components/ShowRow';
import { getShow } from '@/lib/data/shows';
import { graphSummary } from '@/lib/graph/store';
import { relativeTime } from '@/lib/circleAffinity';
import { situationLabel } from '@/lib/data/situations';
import { useCircleStore } from '@/lib/store/circles';
import { useNativeThemeColor } from '@/lib/theme';
import { useProfileStore } from '@/lib/store/profile';
import { useReflectionStore } from '@/lib/store/reflections';
import { useSessionStore } from '@/lib/store/sessions';
import { useSettingsStore } from '@/lib/store/settings';
import { useWatchlistStore } from '@/lib/store/watchlist';
import { type Show, type WatchEntry, type WatchStatus } from '@/lib/types';

const STATUS_LABEL: Record<WatchStatus, string> = {
  saved: 'Saved for later',
  watching: 'Watching now',
  finished: 'Finished',
  'not-for-me': 'Not for me',
};

const STATUS_ORDER: WatchStatus[] = ['watching', 'saved', 'finished', 'not-for-me'];

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 gap-0.5">
      <Typography type="h4" weight="semibold">
        {value}
      </Typography>
      <Typography type="body-xs" color="muted" className="leading-4">
        {label}
      </Typography>
    </View>
  );
}

export default function YouScreen() {
  const avoidTopics = useProfileStore((state) => state.avoidTopics);
  const addAvoidTopic = useProfileStore((state) => state.addAvoidTopic);
  const removeAvoidTopic = useProfileStore((state) => state.removeAvoidTopic);

  const sessions = useSessionStore((state) => state.sessions);
  const clearSessions = useSessionStore((state) => state.clearSessions);
  const reflections = useReflectionStore((state) => state.entries);
  const watchEntries = useWatchlistStore((state) => state.entries);
  const removeShow = useWatchlistStore((state) => state.removeShow);
  const joinedIds = useCircleStore((state) => state.joinedIds);
  const model = useSettingsStore((state) => state.model);
  const lastTestOk = useSettingsStore((state) => state.lastTestOk);

  const [accent, muted] = useNativeThemeColor(['accent', 'muted']);
  const [avoidDraft, setAvoidDraft] = useState('');
  const graph = useMemo(() => graphSummary(), []);

  const addDraft = useCallback(() => {
    const value = avoidDraft.trim();
    if (!value) return;
    addAvoidTopic(value);
    setAvoidDraft('');
  }, [addAvoidTopic, avoidDraft]);

  const shelf = useMemo(() => {
    const rows: { entry: WatchEntry; show: Show }[] = [];
    for (const entry of watchEntries) {
      const show = getShow(entry.showId);
      if (show) rows.push({ entry, show });
    }
    return rows.sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.entry.status) - STATUS_ORDER.indexOf(b.entry.status) ||
        b.entry.updatedAt.localeCompare(a.entry.updatedAt),
    );
  }, [watchEntries]);

  const recentSessions = useMemo(() => sessions.slice(0, 6), [sessions]);

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 pb-16 gap-7"
        keyboardShouldPersistTaps="handled"
      >
        <Surface variant="secondary" className="rounded-3xl p-4">
          <View className="flex-row gap-3">
            <Stat value={sessions.length} label="evenings guided" />
            <Stat value={reflections.length} label="reflections" />
            <Stat value={watchEntries.length} label="shows on your shelf" />
            <Stat value={joinedIds.length} label="circles" />
          </View>
        </Surface>

        <View>
          <SectionHeading
            title="Steer around"
            caption="Shows carrying these lose ground, and you always get a warning first."
          />
          <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
            {avoidTopics.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {avoidTopics.map((topic) => (
                  <Pressable
                    key={topic}
                    onPress={() => removeAvoidTopic(topic)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${topic}`}
                    className="bg-background-tertiary flex-row items-center gap-1.5 rounded-full px-3 py-2"
                    style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                  >
                    <Typography type="body-sm">{topic}</Typography>
                    <X color={muted} size={13} />
                  </Pressable>
                ))}
              </View>
            ) : (
              <Typography type="body-sm" color="muted" className="leading-6">
                Nothing listed yet. Add anything you would rather not be sent toward.
              </Typography>
            )}

            <View className="flex-row items-end gap-2">
              <View className="flex-1">
                <TextField>
                  <Input
                    value={avoidDraft}
                    onChangeText={setAvoidDraft}
                    placeholder="e.g. hospitals"
                    onSubmitEditing={addDraft}
                    returnKeyType="done"
                  />
                </TextField>
              </View>
              <Button
                variant="secondary"
                size="sm"
                isDisabled={avoidDraft.trim().length === 0}
                onPress={addDraft}
              >
                <Plus color={muted} size={15} />
                <Button.Label>Add</Button.Label>
              </Button>
            </View>
          </Surface>
        </View>

        <View>
          <SectionHeading
            title="Your shelf"
            caption="Everything you saved, started or set aside."
          />
          <Surface variant="secondary" className="rounded-3xl px-4 py-1">
            {shelf.length === 0 ? (
              <Typography type="body-sm" color="muted" className="py-4 leading-6">
                Nothing here yet. Save a show from a match and it lands on this shelf.
              </Typography>
            ) : (
              shelf.map((row, index) => (
                <View
                  key={row.show.id}
                  className={index === 0 ? 'py-1.5' : 'border-border/50 border-t py-1.5'}
                >
                  <ShowRow
                    show={row.show}
                    subtitle={`${STATUS_LABEL[row.entry.status]} · ${relativeTime(row.entry.updatedAt)}`}
                    accessory={
                      <Pressable
                        onPress={() => removeShow(row.show.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${row.show.title} from your shelf`}
                        hitSlop={8}
                        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                      >
                        <Trash2 color={muted} size={16} />
                      </Pressable>
                    }
                  />
                </View>
              ))
            )}
          </Surface>
        </View>

        <View>
          <SectionHeading
            title="Past evenings"
            caption="Every match keeps its reasoning, so you can go back to it."
            action={
              sessions.length > 0 ? (
                <Button variant="ghost" size="sm" className="px-0" onPress={clearSessions}>
                  <Button.Label>Clear</Button.Label>
                </Button>
              ) : undefined
            }
          />
          <Surface variant="secondary" className="rounded-3xl px-4 py-1">
            {recentSessions.length === 0 ? (
              <Typography type="body-sm" color="muted" className="py-4 leading-6">
                No matches yet. Describe an evening in Discover and it will be kept here.
              </Typography>
            ) : (
              recentSessions.map((session, index) => (
                <Pressable
                  key={session.id}
                  onPress={() =>
                    router.push({ pathname: '/session/[id]', params: { id: session.id } })
                  }
                  accessibilityRole="button"
                  className={
                    index === 0
                      ? 'flex-row items-center gap-3 py-3.5'
                      : 'border-border/50 flex-row items-center gap-3 border-t py-3.5'
                  }
                  style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                >
                  <View className="flex-1">
                    <Typography type="body-sm" numberOfLines={2} className="leading-5">
                      {session.situationText ||
                        session.selectedSituations.map(situationLabel).join(', ') ||
                        'Untitled evening'}
                    </Typography>
                    <Typography type="body-xs" color="muted" className="mt-1">
                      {relativeTime(session.createdAt)} · {session.recommendations.length}{' '}
                      suggestions ·{' '}
                      {session.engine === 'local-model' ? 'your local model' : 'on-device'}
                    </Typography>
                  </View>
                  <ChevronRight color={muted} size={18} />
                </Pressable>
              ))
            )}
          </Surface>
        </View>

        <View className="gap-3">
          <Pressable
            onPress={() => router.push('/settings/model')}
            accessibilityRole="button"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Surface variant="secondary" className="flex-row items-center gap-3 rounded-3xl p-4">
              {model.enabled ? (
                <Cpu color={accent} size={20} />
              ) : (
                <Smartphone color={muted} size={20} />
              )}
              <View className="flex-1">
                <Typography type="body" weight="medium">
                  Local model
                </Typography>
                <Typography type="body-xs" color="muted" className="mt-1 leading-5">
                  {model.enabled
                    ? `${model.model || 'no model name'} at ${model.baseUrl}${
                        lastTestOk === undefined
                          ? ''
                          : lastTestOk
                            ? ' · reachable'
                            : ' · unreachable'
                      }`
                    : 'Off — matches are ranked on this device'}
                </Typography>
              </View>
              <ChevronRight color={muted} size={18} />
            </Surface>
          </Pressable>

          <Pressable
            onPress={() => router.push('/settings/graph')}
            accessibilityRole="button"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Surface variant="secondary" className="flex-row items-center gap-3 rounded-3xl p-4">
              <Network color={graph.supplied ? accent : muted} size={20} />
              <View className="flex-1">
                <Typography type="body" weight="medium">
                  Knowledge graph
                </Typography>
                <Typography type="body-xs" color="muted" className="mt-1 leading-5">
                  {graph.supplied
                    ? `${graph.name ?? 'Loaded'} — ${graph.stats.nodes} nodes, ${graph.stats.edges} links${
                        graph.diagnostics.length > 0
                          ? ` · ${graph.diagnostics.length} to look at`
                          : ''
                      }`
                    : 'None supplied — matching on the built-in library'}
                </Typography>
              </View>
              <ChevronRight color={muted} size={18} />
            </Surface>
          </Pressable>

          <Pressable
            onPress={() => router.push('/onboarding')}
            accessibilityRole="button"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Surface variant="secondary" className="flex-row items-center gap-3 rounded-3xl p-4">
              <Sparkles color={muted} size={20} />
              <View className="flex-1">
                <Typography type="body" weight="medium">
                  Run the setup again
                </Typography>
                <Typography type="body-xs" color="muted" className="mt-1 leading-5">
                  Walk back through the questions if your usual settings no longer fit.
                </Typography>
              </View>
              <ChevronRight color={muted} size={18} />
            </Surface>
          </Pressable>
        </View>

        <Typography type="body-xs" color="muted" className="leading-5">
          Your profile, reflections and history live on this device only.
        </Typography>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

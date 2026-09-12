import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Chip, Separator, Surface, TextArea, TextField, Typography } from 'heroui-native';
import { Share2, Trash2 } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { MoodDelta } from '@/components/MoodDelta';
import { MoodPicker } from '@/components/MoodPicker';
import { SectionHeading } from '@/components/SectionHeading';
import { ShowRow } from '@/components/ShowRow';
import { getShow } from '@/lib/data/shows';
import { goBackOrReplace } from '@/lib/navigation';
import { situationLabel } from '@/lib/data/situations';
import { useCircleStore } from '@/lib/store/circles';
import { useNativeThemeColor } from '@/lib/theme';
import { useReflectionStore } from '@/lib/store/reflections';

export default function JournalEntryScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const [muted, danger] = useNativeThemeColor(['muted', 'danger']);

  const entry = useReflectionStore((state) => state.entries.find((item) => item.id === entryId));
  const updateReflection = useReflectionStore((state) => state.updateReflection);
  const removeReflection = useReflectionStore((state) => state.removeReflection);
  const markShared = useReflectionStore((state) => state.markShared);

  const circles = useCircleStore((state) => state.circles);
  const joinedIds = useCircleStore((state) => state.joinedIds);
  const addPost = useCircleStore((state) => state.addPost);

  const [takeaway, setTakeaway] = useState(entry?.takeaway ?? '');
  const [sharePickerOpen, setSharePickerOpen] = useState(false);

  if (!entry) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Typography type="h5" weight="semibold" className="text-center">
          This entry is no longer here
        </Typography>
        <Button variant="secondary" onPress={() => goBackOrReplace('/journal')}>
          <Button.Label>Back to journal</Button.Label>
        </Button>
      </View>
    );
  }

  const show = entry.showId ? getShow(entry.showId) : undefined;
  const joined = circles.filter((circle) => joinedIds.includes(circle.id));
  const shareBody = entry.takeaway ?? entry.answers[0]?.answer ?? '';

  const handleShare = (circleId: string) => {
    addPost(circleId, shareBody, entry.showId);
    markShared(entry.id, circleId);
    setSharePickerOpen(false);
  };

  const handleDelete = () => {
    removeReflection(entry.id);
    goBackOrReplace('/journal');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-4 pb-16 gap-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-3">
          <Typography type="body-xs" color="muted">
            {new Date(entry.createdAt).toLocaleString(undefined, {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
          <Typography type="h3" weight="semibold">
            {show ? show.title : 'A quiet entry'}
          </Typography>
          <MoodDelta before={entry.moodBefore} after={entry.moodAfter} />
          {entry.situationText ? (
            <Typography type="body-sm" color="muted" className="leading-6">
              “{entry.situationText}”
            </Typography>
          ) : null}
          {entry.situations.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5">
              {entry.situations.map((situation) => (
                <View key={situation} className="bg-background-secondary rounded-full px-2.5 py-1">
                  <Typography type="body-xs" color="muted">
                    {situationLabel(situation)}
                  </Typography>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {entry.moodAfter === undefined ? (
          <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
            <MoodPicker
              label="Watched it since? Add how it left you."
              onChange={(value) => updateReflection(entry.id, { moodAfter: value })}
            />
          </Surface>
        ) : null}

        {entry.answers.length > 0 ? (
          <View className="gap-4">
            <SectionHeading title="What you wrote" className="mb-0" />
            {entry.answers.map((answer) => (
              <View key={answer.promptId} className="gap-2">
                <Typography type="body-sm" weight="semibold" color="muted" className="leading-6">
                  {answer.prompt}
                </Typography>
                <Typography type="body" className="leading-7">
                  {answer.answer}
                </Typography>
                <Separator className="mt-2" />
              </View>
            ))}
          </View>
        ) : null}

        <TextField>
          <SectionHeading title="One line to keep" className="mb-0" />
          <TextArea
            value={takeaway}
            onChangeText={setTakeaway}
            placeholder="Add or edit the line you want to remember."
            className="mt-2 min-h-20"
            multiline
            numberOfLines={3}
          />
          {takeaway.trim() !== (entry.takeaway ?? '') ? (
            <Button
              variant="secondary"
              size="sm"
              className="mt-2 self-start"
              onPress={() => updateReflection(entry.id, { takeaway: takeaway.trim() || undefined })}
            >
              <Button.Label>Save line</Button.Label>
            </Button>
          ) : null}
        </TextField>

        {show ? (
          <View className="gap-1">
            <SectionHeading title="The show" className="mb-1" />
            <ShowRow show={show} subtitle={show.logline} />
          </View>
        ) : null}

        <View className="gap-3">
          <SectionHeading
            title="Share with a circle"
            caption={
              shareBody
                ? 'Only the line you choose to share leaves this device.'
                : 'Write a line first, then you can share it.'
            }
            className="mb-0"
          />

          {entry.sharedToCircleIds.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5">
              {entry.sharedToCircleIds.map((circleId) => {
                const circle = circles.find((item) => item.id === circleId);
                return (
                  <View key={circleId} className="bg-accent-soft rounded-full px-2.5 py-1">
                    <Typography type="body-xs" className="text-accent-soft-foreground">
                      Shared with {circle?.name ?? 'a circle'}
                    </Typography>
                  </View>
                );
              })}
            </View>
          ) : null}

          {sharePickerOpen ? (
            joined.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {joined.map((circle) => (
                  <Chip
                    key={circle.id}
                    size="sm"
                    variant="secondary"
                    disabled={entry.sharedToCircleIds.includes(circle.id)}
                    onPress={() => handleShare(circle.id)}
                  >
                    <Chip.Label>{circle.name}</Chip.Label>
                  </Chip>
                ))}
              </View>
            ) : (
              <Surface variant="default" className="gap-3 rounded-3xl p-4">
                <Typography type="body-sm" color="muted" className="leading-6">
                  You have not joined a circle yet.
                </Typography>
                <Button
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  onPress={() => router.push('/circles')}
                >
                  <Button.Label>Find circles</Button.Label>
                </Button>
              </Surface>
            )
          ) : (
            <Button
              variant="secondary"
              className="self-start"
              isDisabled={!shareBody}
              onPress={() => setSharePickerOpen(true)}
            >
              <Share2 color={muted} size={16} />
              <Button.Label>Choose a circle</Button.Label>
            </Button>
          )}
        </View>

        <Button variant="ghost" className="self-start px-0" onPress={handleDelete}>
          <Trash2 color={danger} size={16} />
          <Button.Label className="text-danger">Delete this entry</Button.Label>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

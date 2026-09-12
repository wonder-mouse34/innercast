import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Button, Surface, TextArea, Typography } from 'heroui-native';
import { Heart, Users } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { SectionHeading } from '@/components/SectionHeading';
import { ShowRow } from '@/components/ShowRow';
import { getShow } from '@/lib/data/shows';
import { goBackOrReplace } from '@/lib/navigation';
import { relativeTime } from '@/lib/circleAffinity';
import { situationLabel } from '@/lib/data/situations';
import { useCircleStore } from '@/lib/store/circles';
import { useNativeThemeColor } from '@/lib/theme';
import type { CirclePost } from '@/lib/types';

function PostCard({
  post,
  liked,
  onToggleLike,
}: {
  post: CirclePost;
  liked: boolean;
  onToggleLike: () => void;
}) {
  const [muted, accent] = useNativeThemeColor(['muted', 'accent']);
  const show = post.showId ? getShow(post.showId) : undefined;

  return (
    <Surface variant="default" className="gap-3 rounded-3xl p-4">
      <View className="flex-row items-center gap-3">
        <View className="bg-accent-soft h-9 w-9 items-center justify-center rounded-full">
          <Typography type="body-xs" weight="semibold" className="text-accent-soft-foreground">
            {post.initials}
          </Typography>
        </View>
        <View className="flex-1">
          <Typography type="body-sm" weight="semibold">
            {post.isMine ? 'You' : post.author}
          </Typography>
          <Typography type="body-xs" color="muted">
            {relativeTime(post.createdAt)}
          </Typography>
        </View>
      </View>

      <Typography type="body" className="leading-7">
        {post.body}
      </Typography>

      {show ? (
        <Pressable
          onPress={() => router.push({ pathname: '/show/[id]', params: { id: show.id } })}
          accessibilityRole="button"
          accessibilityLabel={`Open ${show.title}`}
          className="bg-background-secondary self-start rounded-full px-3 py-1.5"
        >
          <Typography type="body-xs" className="text-accent">
            {show.title}
          </Typography>
        </Pressable>
      ) : null}

      <Pressable
        onPress={onToggleLike}
        accessibilityRole="button"
        accessibilityLabel={liked ? 'Remove your response' : 'Say this helped'}
        accessibilityState={{ selected: liked }}
        className="flex-row items-center gap-2 self-start pt-1"
      >
        <Heart color={liked ? accent : muted} size={16} fill={liked ? accent : 'transparent'} />
        <Typography type="body-xs" color="muted">
          {post.likes} felt this
        </Typography>
      </Pressable>
    </Surface>
  );
}

export default function CircleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [muted] = useNativeThemeColor(['muted']);

  const circle = useCircleStore((state) => state.circles.find((item) => item.id === id));
  const joinedIds = useCircleStore((state) => state.joinedIds);
  const likedPostIds = useCircleStore((state) => state.likedPostIds);
  const join = useCircleStore((state) => state.join);
  const leave = useCircleStore((state) => state.leave);
  const addPost = useCircleStore((state) => state.addPost);
  const toggleLike = useCircleStore((state) => state.toggleLike);

  const [draft, setDraft] = useState('');

  const joined = useMemo(
    () => (circle ? joinedIds.includes(circle.id) : false),
    [circle, joinedIds],
  );

  if (!circle) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Typography type="h5" weight="semibold" className="text-center">
          That circle is not here
        </Typography>
        <Button variant="secondary" onPress={() => goBackOrReplace('/circles')}>
          <Button.Label>Back to circles</Button.Label>
        </Button>
      </View>
    );
  }

  const nowWatching = circle.nowWatchingShowId ? getShow(circle.nowWatchingShowId) : undefined;

  const handlePost = () => {
    const body = draft.trim();
    if (!body) return;
    addPost(circle.id, body);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 pb-16 gap-7"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-3">
          <Typography type="h3" weight="semibold">
            {circle.name}
          </Typography>
          <Typography type="body" color="muted" className="leading-7">
            {circle.description}
          </Typography>
          <View className="flex-row items-center gap-2">
            <Users color={muted} size={14} />
            <Typography type="body-xs" color="muted">
              {circle.memberCount.toLocaleString()} members · {circle.cadence}
            </Typography>
          </View>
          <View className="flex-row flex-wrap gap-1.5">
            {circle.situations.map((situation) => (
              <View key={situation} className="bg-background-secondary rounded-full px-2.5 py-1">
                <Typography type="body-xs" color="muted">
                  {situationLabel(situation)}
                </Typography>
              </View>
            ))}
          </View>

          <Button
            variant={joined ? 'secondary' : 'primary'}
            className="mt-1 self-start"
            onPress={() => (joined ? leave(circle.id) : join(circle.id))}
          >
            <Button.Label>{joined ? 'Leave circle' : 'Join circle'}</Button.Label>
          </Button>
        </View>

        <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
          <Typography type="body-xs" color="muted">
            This week&apos;s prompt
          </Typography>
          <Typography type="body" weight="medium" className="leading-7">
            {circle.weeklyPrompt}
          </Typography>
        </Surface>

        {nowWatching ? (
          <View className="gap-1">
            <SectionHeading title="Now watching together" className="mb-1" />
            <ShowRow show={nowWatching} subtitle={nowWatching.logline} />
          </View>
        ) : null}

        <View className="gap-3">
          <SectionHeading
            title="Threads"
            caption={
              circle.posts.length === 0
                ? 'No one has written yet'
                : `${circle.posts.length} ${circle.posts.length === 1 ? 'post' : 'posts'}`
            }
            className="mb-0"
          />

          {joined ? (
            <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
              <TextArea
                value={draft}
                onChangeText={setDraft}
                placeholder="Answer the prompt, or say what you have been watching."
                className="min-h-20"
                multiline
                numberOfLines={3}
              />
              <View className="flex-row items-center justify-between gap-3">
                <Typography type="body-xs" color="muted" className="flex-1 leading-5">
                  Posts stay on this device in this build.
                </Typography>
                <Button size="sm" isDisabled={!draft.trim()} onPress={handlePost}>
                  <Button.Label>Post</Button.Label>
                </Button>
              </View>
            </Surface>
          ) : (
            <Surface variant="secondary" className="gap-2 rounded-3xl p-4">
              <Typography type="body-sm" color="muted" className="leading-6">
                Join to write in this circle. You can read the threads either way.
              </Typography>
            </Surface>
          )}

          {circle.posts.length === 0 ? (
            <Typography type="body-sm" color="muted" className="leading-6">
              Be the first to answer the prompt.
            </Typography>
          ) : (
            circle.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                liked={likedPostIds.includes(post.id)}
                onToggleLike={() => toggleLike(circle.id, post.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

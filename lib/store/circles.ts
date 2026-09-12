import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildSeedCircles } from '@/lib/data/circles';
import { createId } from '@/lib/utils';
import type { Circle, SituationId, TraitVector } from '@/lib/types';

export type NewCircle = {
  name: string;
  tagline: string;
  description: string;
  situations: SituationId[];
  traitProfile: Partial<TraitVector>;
  cadence: string;
  weeklyPrompt: string;
};

type CircleState = {
  circles: Circle[];
  joinedIds: string[];
  likedPostIds: string[];
  join: (circleId: string) => void;
  leave: (circleId: string) => void;
  addPost: (circleId: string, body: string, showId?: string) => void;
  toggleLike: (circleId: string, postId: string) => void;
  createCircle: (input: NewCircle) => Circle;
};

export const useCircleStore = create<CircleState>()(
  persist(
    (set) => ({
      circles: buildSeedCircles(),
      joinedIds: [],
      likedPostIds: [],
      join: (circleId) =>
        set((state) =>
          state.joinedIds.includes(circleId)
            ? state
            : {
                joinedIds: [...state.joinedIds, circleId],
                circles: state.circles.map((circle) =>
                  circle.id === circleId
                    ? { ...circle, memberCount: circle.memberCount + 1 }
                    : circle,
                ),
              },
        ),
      leave: (circleId) =>
        set((state) =>
          state.joinedIds.includes(circleId)
            ? {
                joinedIds: state.joinedIds.filter((id) => id !== circleId),
                circles: state.circles.map((circle) =>
                  circle.id === circleId
                    ? { ...circle, memberCount: Math.max(0, circle.memberCount - 1) }
                    : circle,
                ),
              }
            : state,
        ),
      addPost: (circleId, body, showId) =>
        set((state) => ({
          circles: state.circles.map((circle) =>
            circle.id === circleId
              ? {
                  ...circle,
                  posts: [
                    {
                      id: createId(),
                      author: 'You',
                      initials: 'YU',
                      createdAt: new Date().toISOString(),
                      body: body.trim(),
                      showId,
                      likes: 0,
                      isMine: true,
                    },
                    ...circle.posts,
                  ],
                }
              : circle,
          ),
        })),
      toggleLike: (circleId, postId) =>
        set((state) => {
          const liked = state.likedPostIds.includes(postId);
          return {
            likedPostIds: liked
              ? state.likedPostIds.filter((id) => id !== postId)
              : [...state.likedPostIds, postId],
            circles: state.circles.map((circle) =>
              circle.id === circleId
                ? {
                    ...circle,
                    posts: circle.posts.map((post) =>
                      post.id === postId
                        ? { ...post, likes: Math.max(0, post.likes + (liked ? -1 : 1)) }
                        : post,
                    ),
                  }
                : circle,
            ),
          };
        }),
      createCircle: (input) => {
        const circle: Circle = {
          id: createId(),
          ...input,
          memberCount: 1,
          posts: [],
          isCustom: true,
        };
        set((state) => ({
          circles: [circle, ...state.circles],
          joinedIds: [...state.joinedIds, circle.id],
        }));
        return circle;
      },
    }),
    {
      name: 'lantern-circles',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

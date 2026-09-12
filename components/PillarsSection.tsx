import { Pressable, View } from 'react-native';
import { Surface, Typography } from 'heroui-native';
import { ChevronRight, Compass, NotebookPen, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';

import { SectionHeading } from '@/components/SectionHeading';
import { useNativeThemeColor } from '@/lib/theme';

type Pillar = {
  key: string;
  title: string;
  body: string;
  icon: LucideIcon;
  action: string;
  onPress: () => void;
};

type Props = {
  /** Called when the Discover pillar is tapped — usually scrolls back to the prompt. */
  onDiscoverPress?: () => void;
};

export function PillarsSection({ onDiscoverPress }: Props) {
  const [accent, muted] = useNativeThemeColor(['accent', 'muted']);

  const pillars: Pillar[] = [
    {
      key: 'discover',
      title: 'Discover',
      body: 'Say what you are carrying and meet a character living the same thing.',
      icon: Compass,
      action: 'Start above',
      onPress: () => onDiscoverPress?.(),
    },
    {
      key: 'reflect',
      title: 'Reflect',
      body: 'Write down what a show left you with, and watch how your mood moves.',
      icon: NotebookPen,
      action: 'Open your journal',
      onPress: () => router.push('/journal'),
    },
    {
      key: 'connect',
      title: 'Connect',
      body: 'Sit with people watching from the same place, one prompt a week.',
      icon: Users,
      action: 'Find your circles',
      onPress: () => router.push('/circles'),
    },
  ];

  return (
    <View>
      <SectionHeading
        title="Discover, Reflect, Connect"
        caption="The three things Lantern is for."
      />
      <Surface variant="secondary" className="rounded-3xl px-4 py-1">
        {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <Pressable
              key={pillar.key}
              onPress={pillar.onPress}
              accessibilityRole="button"
              accessibilityLabel={`${pillar.title} — ${pillar.action}`}
              className={
                index === 0
                  ? 'flex-row items-start gap-3.5 py-4'
                  : 'border-border/50 flex-row items-start gap-3.5 border-t py-4'
              }
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
            >
              <View className="bg-accent/15 mt-0.5 rounded-2xl p-2.5">
                <Icon color={accent} size={18} />
              </View>
              <View className="flex-1">
                <Typography type="body-sm" weight="semibold">
                  {pillar.title}
                </Typography>
                <Typography type="body-sm" color="muted" className="mt-1 leading-6">
                  {pillar.body}
                </Typography>
                <Typography type="body-xs" className="text-accent mt-1.5">
                  {pillar.action}
                </Typography>
              </View>
              <View className="mt-1">
                <ChevronRight color={muted} size={18} />
              </View>
            </Pressable>
          );
        })}
      </Surface>
    </View>
  );
}

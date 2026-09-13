import { Button, Surface, Typography } from 'heroui-native';
import { View } from 'react-native';
import { router } from 'expo-router';

import { useProfileStore } from '@/lib/store/profile';

export default function OnboardingScreen() {
  const completeOnboarding = useProfileStore((state) => state.completeOnboarding);

  const start = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View className="bg-background py-safe-offset-8 flex-1 justify-center px-5">
      <View className="gap-6">
        <View className="gap-3">
          <Typography type="body-xs" color="muted" className="tracking-widest uppercase">
            InnerCast
          </Typography>
          <Typography type="h1" weight="bold" className="leading-tight">
            Find the character who meets you where you are.
          </Typography>
          <Typography type="body" color="muted" className="leading-7">
            Describe what is going on, choose a genre if you want, and InnerCast will look for a
            person on screen whose experience speaks to yours.
          </Typography>
        </View>

        <Surface variant="secondary" className="gap-3 rounded-3xl p-4">
          <Typography type="body-sm" weight="semibold">
            Your words stay on this device
          </Typography>
          <Typography type="body-sm" color="muted" className="leading-6">
            You can start without creating a profile. If you choose to Connect with a circle, we
            will ask what name you want to use there.
          </Typography>
        </Surface>

        <Button variant="primary" onPress={start}>
          <Button.Label>Start discovering</Button.Label>
        </Button>
      </View>
    </View>
  );
}

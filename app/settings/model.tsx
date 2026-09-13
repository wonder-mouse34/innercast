import { ScrollView, View } from 'react-native';
import { Surface, Typography } from 'heroui-native';
import { Cpu } from 'lucide-react-native';

import { SectionHeading } from '@/components/SectionHeading';
import { useNativeThemeColor } from '@/lib/theme';

export default function ModelSettingsScreen() {
  const [accent] = useNativeThemeColor(['accent']);

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="px-5 pt-5 pb-safe-offset-8 gap-5"
    >
      <SectionHeading
        title="InnerCast matching"
        caption="Character matching is handled by the private InnerCast server automation."
      />

      <Surface variant="secondary" className="gap-4 rounded-3xl p-4">
        <View className="flex-row items-start gap-3">
          <View className="bg-accent/10 rounded-2xl p-2.5">
            <Cpu color={accent} size={20} />
          </View>
          <View className="flex-1 gap-1">
            <Typography type="body" weight="semibold">
              Server automation
            </Typography>
            <Typography type="body-sm" color="muted" className="leading-6">
              Discover sends your message and selected chips to askInnerCast. The app does not
              connect to a language model directly.
            </Typography>
          </View>
        </View>

        <View className="border-border/60 gap-1 border-t pt-4">
          <Typography type="body-xs" color="muted">
            Model address
          </Typography>
          <Typography type="body-sm" weight="medium">
            Empty
          </Typography>
        </View>
      </Surface>

      <Typography type="body-xs" color="muted" className="leading-5">
        Conversation history is passed back only through askInnerCast so follow-up messages stay in
        the same session.
      </Typography>
    </ScrollView>
  );
}

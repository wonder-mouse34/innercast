import { Compass, NotebookPen, UserRound, Users } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useNativeThemeColor } from '@/lib/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const mobileBottomPadding = Math.max(insets.bottom, 6);
  const [background, panel, foreground, border, accent, muted] = useNativeThemeColor([
    'background',
    'background-secondary',
    'foreground',
    'border',
    'accent',
    'muted',
  ]);

  return (
    <>
      {/* `expo-status-bar` accepts a string appearance value rather than a style object. */}
      {/* eslint-disable-next-line react/style-prop-object -- Expo StatusBar API requires a string style. */}
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: background },
          headerTintColor: foreground,
          headerTitleStyle: { color: foreground, fontFamily: 'Inter_600SemiBold', fontSize: 17 },
          headerShadowVisible: false,
          sceneStyle: { backgroundColor: background },
          tabBarStyle: {
            backgroundColor: panel,
            borderTopColor: border,
            borderTopWidth: 1,
            elevation: 0,
            shadowColor: 'transparent',
            shadowOpacity: 0,
            shadowRadius: 0,
            height: isWeb ? 64 : 58 + mobileBottomPadding,
            paddingTop: isWeb ? 0 : 6,
            paddingBottom: isWeb ? 0 : mobileBottomPadding,
          },
          tabBarItemStyle: { minHeight: 52 },
          tabBarIconStyle: { marginTop: 1 },
          tabBarLabelStyle: {
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            lineHeight: 14,
          },
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: muted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Discover',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Compass color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Reflect',
            tabBarIcon: ({ color, size }) => <NotebookPen color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="circles"
          options={{
            title: 'Connect',
            tabBarIcon: ({ color, size }) => <Users color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="you"
          options={{
            title: 'You',
            tabBarIcon: ({ color, size }) => <UserRound color={color} size={size ?? 24} />,
          }}
        />
      </Tabs>
    </>
  );
}

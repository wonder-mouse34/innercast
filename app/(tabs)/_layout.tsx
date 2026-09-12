import { Compass, NotebookPen, UserRound, Users } from 'lucide-react-native';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useNativeThemeColor } from '@/lib/theme';

export default function TabLayout() {
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
            height: Platform.OS === 'web' ? 64 : undefined,
          },
          tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
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

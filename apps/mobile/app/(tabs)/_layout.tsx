import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 10, color: focused ? '#22c55e' : '#71717a', marginTop: 2 }}>
        {name}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#18181b',
          borderTopColor: '#27272a',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#71717a',
        headerStyle: { backgroundColor: '#09090b' },
        headerTintColor: '#f4f4f5',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused }) => <TabIcon name="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

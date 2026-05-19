import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
};

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthGroup = segments[0] === 'sign-in' || segments[0] === 'sign-up';
    if (!isSignedIn && !inAuthGroup) {
      router.replace('/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoaded]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#09090b' },
        headerTintColor: '#f4f4f5',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#09090b' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="sign-in"
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="sign-up"
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="recommendations"
        options={{ title: 'Recommendations', headerStyle: { backgroundColor: '#09090b' }, headerTintColor: '#f4f4f5' }}
      />
      <Stack.Screen
        name="meal/[id]"
        options={{ title: 'Meal Details', headerStyle: { backgroundColor: '#09090b' }, headerTintColor: '#f4f4f5' }}
      />
      <Stack.Screen
        name="shopping-list"
        options={{ title: 'Shopping List', headerStyle: { backgroundColor: '#09090b' }, headerTintColor: '#f4f4f5' }}
      />
      <Stack.Screen
        name="feedback"
        options={{ title: 'Feedback', headerStyle: { backgroundColor: '#09090b' }, headerTintColor: '#f4f4f5' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <InitialLayout />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

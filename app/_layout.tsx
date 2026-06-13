import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { COLORS } from '@/constants/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/signup" />
        <Stack.Screen name="(onboarding)/survey" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="plan/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="plan/results" />
      </Stack>
    </AuthProvider>
  );
}

import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { subscribeToAuth, getUserProfile } from '../services/firebase';
import { useAppStore } from '../store';
import { COLORS } from '../constants';

export default function RootLayout() {
  const { setUser, setAuthLoading, isAuthLoading } = useAppStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
        setAuthLoading(false);
        if (profile?.onboardingComplete) {
          router.replace('/(app)');
        } else {
          router.replace('/(onboarding)/interests');
        }
      } else {
        setUser(null);
        setAuthLoading(false);
        router.replace('/(auth)/login');
      }
    });
    return unsubscribe;
  }, []);

  if (isAuthLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

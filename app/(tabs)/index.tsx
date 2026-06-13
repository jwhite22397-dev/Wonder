import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { COLORS, GRADIENTS } from '@/constants/theme';
import { getSavedPlans } from '@/lib/storage';
import { MODE_LABELS, PlanMode, SavedPlan } from '@/lib/types';
import { useState } from 'react';

export default function HomeScreen() {
  const { user } = useAuth();
  const [recentPlans, setRecentPlans] = useState<SavedPlan[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getSavedPlans(user.id).then((plans) => setRecentPlans(plans.slice(0, 3)));
      }
    }, [user])
  );

  const startPlan = (mode: PlanMode) => {
    router.push({ pathname: '/plan/create', params: { mode } });
  };

  return (
    <LinearGradient colors={[...GRADIENTS.hero]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
            <Text style={styles.headline}>What are we planning today?</Text>
          </View>

          <View style={styles.modeGrid}>
            {(Object.keys(MODE_LABELS) as PlanMode[]).map((mode) => {
              const info = MODE_LABELS[mode];
              return (
                <Card key={mode} style={styles.modeCard} onPress={() => startPlan(mode)}>
                  <View style={styles.modeIconWrap}>
                    <Ionicons
                      name={info.icon as keyof typeof Ionicons.glyphMap}
                      size={28}
                      color={COLORS.primaryLight}
                    />
                  </View>
                  <Text style={styles.modeTitle}>{info.title}</Text>
                  <Text style={styles.modeSubtitle}>{info.subtitle}</Text>
                </Card>
              );
            })}
          </View>

          <Button
            title="Create a Custom Plan"
            onPress={() => startPlan('date')}
            style={styles.cta}
          />

          {recentPlans.length > 0 && (
            <View style={styles.recent}>
              <Text style={styles.recentTitle}>Recent plans</Text>
              {recentPlans.map((plan) => (
                <Card
                  key={plan.id}
                  style={styles.recentCard}
                  onPress={() =>
                    router.push({
                      pathname: '/plan/results',
                      params: { planId: plan.id },
                    })
                  }
                >
                  <Text style={styles.recentMode}>
                    {MODE_LABELS[plan.request.mode].title}
                  </Text>
                  <Text style={styles.recentDate}>
                    {new Date(plan.request.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    · {plan.itineraries.length} options
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 28 },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  modeGrid: { gap: 12 },
  modeCard: {
    marginBottom: 0,
  },
  modeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(232, 67, 147, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modeSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cta: { marginTop: 24 },
  recent: { marginTop: 32 },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  recentCard: { padding: 16 },
  recentMode: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  recentDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

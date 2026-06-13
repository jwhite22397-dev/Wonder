import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getSavedPlans } from '@/lib/storage';
import { MODE_LABELS, SavedPlan } from '@/lib/types';
import { formatDuration } from '@/lib/recommendationEngine';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SavedPlan[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (user) getSavedPlans(user.id).then(setPlans);
    }, [user])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Plans</Text>
        <Text style={styles.subtitle}>Past itineraries you've generated</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {plans.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No plans yet</Text>
            <Text style={styles.emptyText}>
              Head to Home and create your first itinerary!
            </Text>
          </View>
        ) : (
          plans.map((plan) => {
            const selected = plan.itineraries.find((i) => i.id === plan.selectedItineraryId);
            return (
              <Card
                key={plan.id}
                onPress={() =>
                  router.push({ pathname: '/plan/results', params: { planId: plan.id } })
                }
              >
                <View style={styles.planRow}>
                  <View style={styles.planInfo}>
                    <Text style={styles.planMode}>{MODE_LABELS[plan.request.mode].title}</Text>
                    <Text style={styles.planDate}>
                      {new Date(plan.request.date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    {selected ? (
                      <Text style={styles.planSelected}>✓ {selected.title}</Text>
                    ) : (
                      <Text style={styles.planOptions}>{plan.itineraries.length} options generated</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </View>
                {selected && (
                  <Text style={styles.planMeta}>
                    {selected.stops.length} stops · {formatDuration(selected.totalDurationMinutes)} ·{' '}
                    {selected.totalCostEstimate}
                  </Text>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 24, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  scroll: { padding: 24, paddingTop: 8 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planInfo: { flex: 1 },
  planMode: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  planDate: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  planSelected: { fontSize: 13, color: COLORS.success, marginTop: 6 },
  planOptions: { fontSize: 13, color: COLORS.primaryLight, marginTop: 6 },
  planMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 12 },
});

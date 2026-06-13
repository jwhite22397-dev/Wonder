import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/components/ui';
import { COLORS, GRADIENTS } from '@/constants/theme';
import { formatDuration } from '@/lib/recommendationEngine';
import { getPlanById, updateSavedPlan } from '@/lib/storage';
import { Itinerary, MODE_LABELS, SavedPlan } from '@/lib/types';

function ItineraryCard({
  itinerary,
  index,
  selected,
  onSelect,
}: {
  itinerary: Itinerary;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      style={[styles.itineraryCard, selected && styles.itinerarySelected]}
      onPress={onSelect}
    >
      <View style={styles.itineraryHeader}>
        <View style={styles.optionBadge}>
          <Text style={styles.optionBadgeText}>Option {index + 1}</Text>
        </View>
        {selected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        )}
      </View>

      <Text style={styles.itineraryTitle}>{itinerary.title}</Text>
      <Text style={styles.itinerarySubtitle}>{itinerary.subtitle}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{formatDuration(itinerary.totalDurationMinutes)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{itinerary.totalCostEstimate}</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {itinerary.stops.map((stop, i) => (
          <View key={`${stop.venue.id}-${i}`} style={styles.stop}>
            <View style={styles.stopLine}>
              <View
                style={[
                  styles.stopDot,
                  stop.venue.type === 'food' ? styles.foodDot : styles.activityDot,
                ]}
              />
              {i < itinerary.stops.length - 1 && <View style={styles.stopConnector} />}
            </View>
            <View style={styles.stopContent}>
              <Text style={styles.stopTime}>{stop.time}</Text>
              <Text style={styles.stopName}>{stop.venue.name}</Text>
              <Text style={styles.stopDesc}>{stop.venue.description}</Text>
              {stop.note && <Text style={styles.stopNote}>{stop.note}</Text>}
              <View style={styles.stopTags}>
                <Text style={styles.stopTag}>
                  {stop.venue.type === 'food' ? '🍽' : '🎯'} {stop.venue.category}
                </Text>
                <Text style={styles.stopTag}>⭐ {stop.venue.rating}</Text>
                <Text style={styles.stopTag}>{stop.venue.durationMinutes} min</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

export default function ResultsScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  useFocusEffect(
    useCallback(() => {
      if (planId) {
        getPlanById(planId).then((found) => {
          if (found) {
            setPlan(found);
            setSelectedId(found.selectedItineraryId);
          }
        });
      }
    }, [planId])
  );

  const handleSelect = async (itineraryId: string) => {
    if (!plan) return;
    setSelectedId(itineraryId);
    const updated = { ...plan, selectedItineraryId: itineraryId };
    setPlan(updated);
    await updateSavedPlan(updated);
  };

  if (!plan) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.loadingText}>Loading plans...</Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={[...GRADIENTS.hero]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Button title="← Back" variant="ghost" onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Pick your plan</Text>
            <Text style={styles.headerSubtitle}>
              {MODE_LABELS[plan.request.mode].title} ·{' '}
              {new Date(plan.request.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>
            We found {plan.itineraries.length} tailored itineraries based on your interests, budget, and
            location. Tap one to select it!
          </Text>

          {plan.itineraries.map((itinerary, index) => (
            <ItineraryCard
              key={itinerary.id}
              itinerary={itinerary}
              index={index}
              selected={selectedId === itinerary.id}
              onSelect={() => handleSelect(itinerary.id)}
            />
          ))}

          <Button
            title="Create Another Plan"
            variant="secondary"
            onPress={() => router.push('/plan/create')}
            style={styles.newPlanBtn}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: COLORS.textSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  scroll: { padding: 20, paddingBottom: 40 },
  intro: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 20,
  },
  itineraryCard: { marginBottom: 20 },
  itinerarySelected: {
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  itineraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionBadge: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  optionBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.secondary },
  selectedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  selectedText: { color: COLORS.success, fontWeight: '600', fontSize: 13 },
  itineraryTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  itinerarySubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: COLORS.textSecondary },
  timeline: { marginTop: 4 },
  stop: { flexDirection: 'row', marginBottom: 4 },
  stopLine: { width: 24, alignItems: 'center' },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  foodDot: { backgroundColor: COLORS.warning },
  activityDot: { backgroundColor: COLORS.accent },
  stopConnector: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  stopContent: { flex: 1, paddingBottom: 16, paddingLeft: 8 },
  stopTime: { fontSize: 12, fontWeight: '700', color: COLORS.primaryLight },
  stopName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  stopDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, lineHeight: 18 },
  stopNote: { fontSize: 12, color: COLORS.accent, fontStyle: 'italic', marginTop: 2 },
  stopTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  stopTag: {
    fontSize: 11,
    color: COLORS.textMuted,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  newPlanBtn: { marginTop: 8 },
});

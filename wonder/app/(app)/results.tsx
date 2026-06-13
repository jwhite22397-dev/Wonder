import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { COLORS, GRADIENTS, PLAN_MODES } from '../../constants';
import { Itinerary, ItineraryStop } from '../../types';

const STOP_COLORS: Record<string, string> = {
  activity: COLORS.primary,
  food: COLORS.secondary,
  travel: COLORS.textMuted,
  rest: COLORS.success,
};

function StopCard({ stop, index }: { stop: ItineraryStop; index: number }) {
  const dotColor = STOP_COLORS[stop.type] ?? COLORS.primary;
  return (
    <View style={styles.stopCard}>
      <View style={styles.stopTimeline}>
        <View style={[styles.stopDot, { backgroundColor: dotColor }]} />
        {index !== -1 && <View style={[styles.stopLine, { backgroundColor: dotColor + '40' }]} />}
      </View>
      <View style={styles.stopContent}>
        <View style={styles.stopHeader}>
          <Text style={styles.stopEmoji}>{stop.emoji}</Text>
          <View style={styles.stopMeta}>
            <Text style={styles.stopTime}>{stop.time}</Text>
            <Text style={styles.stopDuration}>· {stop.duration}</Text>
          </View>
          <View style={[styles.stopTypeBadge, { backgroundColor: dotColor + '22' }]}>
            <Text style={[styles.stopTypeText, { color: dotColor }]}>{stop.type}</Text>
          </View>
        </View>
        <Text style={styles.stopName}>{stop.name}</Text>
        <Text style={styles.stopDesc}>{stop.description}</Text>
        {stop.address && (
          <View style={styles.stopDetail}>
            <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.stopDetailText}>{stop.address}</Text>
          </View>
        )}
        {stop.estimatedCost && (
          <View style={styles.stopDetail}>
            <Ionicons name="wallet-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.stopDetailText}>{stop.estimatedCost}</Text>
          </View>
        )}
        {stop.tips && (
          <View style={styles.tipBox}>
            <Text style={styles.tipLabel}>💡 Tip</Text>
            <Text style={styles.tipText}>{stop.tips}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ItineraryModal({
  plan,
  visible,
  onClose,
  gradient,
}: {
  plan: Itinerary | null;
  visible: boolean;
  onClose: () => void;
  gradient: string[];
}) {
  if (!plan) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <LinearGradient colors={['#0F172A', '#1a0533']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalTopBar}>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Full Itinerary</Text>
            <View style={{ width: 36 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={gradient as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHero}
            >
              <Text style={styles.modalHeroEmoji}>{plan.emoji}</Text>
              <Text style={styles.modalHeroTitle}>{plan.title}</Text>
              <Text style={styles.modalHeroTagline}>{plan.tagline}</Text>
            </LinearGradient>

            <View style={styles.modalStats}>
              <View style={styles.stat}>
                <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{plan.totalDuration}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="wallet-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{plan.totalEstimatedCost}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="star-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{plan.vibe}</Text>
              </View>
            </View>

            {plan.highlights.length > 0 && (
              <View style={styles.highlightsCard}>
                <Text style={styles.highlightsTitle}>Highlights</Text>
                {plan.highlights.map((h, i) => (
                  <View key={i} style={styles.highlightRow}>
                    <Text style={styles.highlightBullet}>✦</Text>
                    <Text style={styles.highlightText}>{h}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.stopsTitle}>Your Itinerary</Text>
            {plan.stops.map((stop, i) => (
              <StopCard key={i} stop={stop} index={i < plan.stops.length - 1 ? i : -1} />
            ))}

            <View style={styles.bestForCard}>
              <Text style={styles.bestForTitle}>✨ Best for</Text>
              <Text style={styles.bestForText}>{plan.bestFor}</Text>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function PlanCard({
  plan,
  index,
  gradient,
  onExpand,
}: {
  plan: Itinerary;
  index: number;
  gradient: string[];
  onExpand: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onExpand}
      style={styles.planCard}
    >
      <LinearGradient
        colors={gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.planCardBanner}
      >
        <View style={styles.planBannerContent}>
          <Text style={styles.planEmoji}>{plan.emoji}</Text>
          <View style={styles.planBannerText}>
            <Text style={styles.planCardLabel}>Option {index + 1}</Text>
            <Text style={styles.planCardTitle}>{plan.title}</Text>
            <Text style={styles.planCardTagline}>{plan.tagline}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.planCardBody}>
        <View style={styles.planMeta}>
          <View style={styles.planMetaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.planMetaText}>{plan.totalDuration}</Text>
          </View>
          <View style={styles.planMetaItem}>
            <Ionicons name="wallet-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.planMetaText}>{plan.totalEstimatedCost}</Text>
          </View>
          <View style={[styles.vibeBadge]}>
            <Text style={styles.vibeBadgeText}>{plan.vibe}</Text>
          </View>
        </View>

        {plan.stops.slice(0, 3).map((stop, i) => (
          <View key={i} style={styles.stopPreview}>
            <Text style={styles.stopPreviewEmoji}>{stop.emoji}</Text>
            <View style={styles.stopPreviewText}>
              <Text style={styles.stopPreviewTime}>{stop.time}</Text>
              <Text style={styles.stopPreviewName} numberOfLines={1}>{stop.name}</Text>
            </View>
          </View>
        ))}
        {plan.stops.length > 3 && (
          <Text style={styles.moreStops}>+{plan.stops.length - 3} more stops</Text>
        )}

        <View style={styles.expandHint}>
          <Text style={styles.expandHintText}>Tap to view full itinerary</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ResultsScreen() {
  const { generatedPlans, currentPlanRequest, clearPlans } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<Itinerary | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const modeInfo = PLAN_MODES.find((m) => m.value === currentPlanRequest?.mode) ?? PLAN_MODES[2];
  const cardGradients = [GRADIENTS.primary, GRADIENTS.date, GRADIENTS.friends];

  if (!generatedPlans) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient colors={['#0F172A', '#1a0533']} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.emptyContent}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyTitle}>No plans yet</Text>
          <Text style={styles.emptySubtitle}>
            Head to the Plan tab to generate your personalized itineraries.
          </Text>
          <Button
            title="Create a Plan"
            onPress={() => router.push('/(app)/generate')}
            style={{ width: 200 }}
          />
        </SafeAreaView>
      </View>
    );
  }

  const plans = [generatedPlans.plan1, generatedPlans.plan2, generatedPlans.plan3];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1a0533']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              clearPlans();
              router.push('/(app)/generate');
            }}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.topBarTitle}>Your 3 Ideas</Text>
            <Text style={styles.topBarSub}>{modeInfo.emoji} {modeInfo.label} outing</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              clearPlans();
              router.push('/(app)/generate');
            }}
            style={styles.regenerateBtn}
          >
            <Ionicons name="refresh" size={18} color={COLORS.primaryLight} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.introText}>
            Tap any plan to see the full itinerary with timings, descriptions, and tips.
          </Text>

          {plans.map((plan, i) => (
            <PlanCard
              key={plan.id ?? i}
              plan={plan}
              index={i}
              gradient={cardGradients[i % cardGradients.length]}
              onExpand={() => {
                setSelectedPlan(plan);
                setModalVisible(true);
              }}
            />
          ))}

          <View style={styles.bottomActions}>
            <Button
              title="Plan another outing"
              onPress={() => {
                clearPlans();
                router.push('/(app)/generate');
              }}
              variant="outline"
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <ItineraryModal
        plan={selectedPlan}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedPlan(null);
        }}
        gradient={cardGradients[plans.findIndex((p) => p === selectedPlan) % cardGradients.length]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  topBarSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  regenerateBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  introText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  planCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  planCardBanner: {
    padding: 20,
  },
  planBannerContent: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  planEmoji: {
    fontSize: 36,
  },
  planBannerText: {
    flex: 1,
  },
  planCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  planCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  planCardTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  planCardBody: {
    padding: 16,
    gap: 10,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  planMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  planMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  vibeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    backgroundColor: `${COLORS.primary}33`,
  },
  vibeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
    textTransform: 'capitalize',
  },
  stopPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.cardBorder,
    paddingLeft: 10,
  },
  stopPreviewEmoji: {
    fontSize: 18,
  },
  stopPreviewText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stopPreviewTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    minWidth: 64,
  },
  stopPreviewName: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  moreStops: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingLeft: 12,
  },
  expandHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  expandHintText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  bottomActions: {
    marginTop: 8,
    alignItems: 'center',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalScroll: {
    paddingBottom: 48,
  },
  modalHero: {
    padding: 28,
    marginHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeroEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  modalHeroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  modalHeroTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  highlightsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  highlightsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  highlightBullet: {
    color: COLORS.primaryLight,
    fontSize: 12,
    marginTop: 2,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  stopsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  stopCard: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  stopTimeline: {
    alignItems: 'center',
    marginRight: 12,
    width: 16,
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    zIndex: 1,
  },
  stopLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  stopContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stopEmoji: {
    fontSize: 20,
  },
  stopMeta: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  stopTime: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  stopDuration: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  stopTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  stopTypeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  stopName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  stopDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  stopDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  stopDetailText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  tipBox: {
    backgroundColor: `${COLORS.accent}15`,
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  tipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 2,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bestForCard: {
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: `${COLORS.primary}33`,
  },
  bestForTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginBottom: 4,
  },
  bestForText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

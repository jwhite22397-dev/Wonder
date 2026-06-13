import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store';
import { COLORS, PLAN_MODES, GRADIENTS } from '../../constants';
import { PlanMode } from '../../types';

function ModeCard({
  mode,
  label,
  description,
  emoji,
  gradient,
  onPress,
}: {
  mode: PlanMode;
  label: string;
  description: string;
  emoji: string;
  gradient: string[];
  onPress: () => void;
}) {
  const modeColors = {
    solo: COLORS.solo,
    friends: COLORS.friends,
    date: COLORS.date,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.modeCardWrapper}
    >
      <LinearGradient
        colors={gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.modeCardGradient}
      >
        <Text style={styles.modeEmoji}>{emoji}</Text>
        <Text style={styles.modeLabel}>{label}</Text>
        <Text style={styles.modeDesc}>{description}</Text>
        <View style={styles.modeArrow}>
          <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user, clearPlans } = useAppStore();
  const greeting = getGreeting();

  const handleModeSelect = (mode: PlanMode) => {
    clearPlans();
    router.push({
      pathname: '/(app)/generate',
      params: { mode },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1a0533']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.name}>{user?.displayName ?? 'Explorer'} 👋</Text>
            </View>
            <View style={styles.logo}>
              <Text style={styles.logoText}>✨</Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <LinearGradient
              colors={GRADIENTS.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <Text style={styles.heroTitle}>What are you wondering?</Text>
              <Text style={styles.heroSubtitle}>
                Pick a vibe and we'll build you 3 perfect itineraries in seconds.
              </Text>
            </LinearGradient>
          </View>

          <Text style={styles.sectionTitle}>Choose your outing type</Text>

          <View style={styles.modesGrid}>
            {PLAN_MODES.map((m) => (
              <ModeCard
                key={m.value}
                mode={m.value}
                label={m.label}
                description={m.description}
                emoji={m.emoji}
                gradient={m.gradient}
                onPress={() => handleModeSelect(m.value)}
              />
            ))}
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 How Wonder works</Text>
            <View style={styles.tipsList}>
              {[
                { icon: '📍', text: 'Tell us where you are and how far you want to go' },
                { icon: '📅', text: 'Pick your date, time window, and budget' },
                { icon: '✨', text: 'Get 3 fully personalized itineraries instantly' },
                { icon: '🗺️', text: 'Each plan includes activities and food spots' },
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipIcon}>{tip.icon}</Text>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  logoText: {
    fontSize: 22,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 28,
  },
  heroGradient: {
    padding: 24,
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  modesGrid: {
    gap: 12,
    marginBottom: 28,
  },
  modeCardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  modeCardGradient: {
    padding: 22,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  modeEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  modeLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  modeDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  modeArrow: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIcon: {
    fontSize: 18,
    lineHeight: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});

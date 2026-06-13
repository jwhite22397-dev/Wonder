import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { generateItineraries } from '../../services/openai';
import { getUserProfile } from '../../services/firebase';
import { useAppStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Chip } from '../../components/ui/Chip';
import {
  COLORS,
  GRADIENTS,
  BUDGET_OPTIONS,
  PLAN_MODES,
} from '../../constants';
import { BudgetRange, PlanMode, PlanRequest } from '../../types';

const TIME_OPTIONS = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
  '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function TimeSelector({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) {
  return (
    <View style={styles.timeSelectorWrap}>
      <Text style={styles.timeSelectorLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
        {options.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => onChange(t)}
            style={[styles.timeChip, value === t && styles.timeChipSelected]}
          >
            <Text style={[styles.timeChipText, value === t && styles.timeChipTextSelected]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function GenerateScreen() {
  const { mode: modeParam } = useLocalSearchParams<{ mode?: PlanMode }>();
  const { user, setPlanRequest, setGeneratedPlans } = useAppStore();

  const [mode, setMode] = useState<PlanMode>(modeParam ?? 'date');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState('12:00 PM');
  const [endTime, setEndTime] = useState('9:00 PM');
  const [budget, setBudget] = useState<BudgetRange>('moderate');
  const [radius, setRadius] = useState(15);
  const [groupSize, setGroupSize] = useState(2);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modeInfo = PLAN_MODES.find((m) => m.value === mode)!;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!location.trim()) newErrors.location = 'Please enter your location';
    if (!date) newErrors.date = 'Please enter a date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to generate plans.');
      return;
    }

    const openaiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!openaiKey) {
      Alert.alert(
        'API Key Missing',
        'Please add your OpenAI API key (EXPO_PUBLIC_OPENAI_API_KEY) to the .env file to generate plans.',
      );
      return;
    }

    setLoading(true);
    try {
      let partnerInterests = undefined;
      if (mode === 'date' && partnerEmail.trim()) {
        // In a real app, fetch partner profile by email invitation
        // For now we use user's own interests as a proxy
        partnerInterests = user.interests;
      }

      const request: PlanRequest = {
        mode,
        date: formatDateForPrompt(date),
        startTime,
        endTime,
        location: { address: location.trim() },
        radiusMiles: radius,
        budget,
        groupSize: mode === 'solo' ? 1 : groupSize,
        specialRequests: specialRequests.trim() || undefined,
        partnerInterests,
      };

      setPlanRequest(request);
      const plans = await generateItineraries(request, user.interests);
      setGeneratedPlans(plans);
      router.push('/(app)/results');
    } catch (err) {
      console.error('Generate error:', err);
      Alert.alert(
        'Generation Failed',
        'Could not generate plans. Check your API key and internet connection.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1a0533']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Plan Your Outing</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mode selector */}
          <SectionHeader
            title="What kind of outing?"
            subtitle="This shapes how we tailor your itinerary"
          />
          <View style={styles.modesRow}>
            {PLAN_MODES.map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() => setMode(m.value)}
                style={[styles.modeChip, mode === m.value && styles.modeChipSelected]}
              >
                <LinearGradient
                  colors={mode === m.value ? (m.gradient as [string, string]) : ['transparent', 'transparent']}
                  style={styles.modeChipGradient}
                >
                  <Text style={styles.modeChipEmoji}>{m.emoji}</Text>
                  <Text style={[styles.modeChipLabel, mode === m.value && styles.modeChipLabelSelected]}>
                    {m.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Location */}
          <SectionHeader
            title="Where are you?"
            subtitle="City, neighborhood, or full address"
          />
          <Input
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Nashville, TN or Downtown Chicago"
            icon="location-outline"
            error={errors.location}
            autoCapitalize="words"
          />

          {/* Date */}
          <SectionHeader title="When?" />
          <Input
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            icon="calendar-outline"
            error={errors.date}
          />

          {/* Time window */}
          <SectionHeader
            title="Time window"
            subtitle="When do you want to start and end?"
          />
          <TimeSelector
            label="Start time"
            value={startTime}
            options={TIME_OPTIONS}
            onChange={setStartTime}
          />
          <TimeSelector
            label="End time"
            value={endTime}
            options={TIME_OPTIONS}
            onChange={setEndTime}
          />

          {/* Radius */}
          <SectionHeader
            title={`Drive radius: ${radius} miles`}
            subtitle="How far are you willing to travel?"
          />
          <View style={styles.sliderWrapper}>
            <Text style={styles.sliderLabel}>0 mi</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={100}
              step={1}
              value={radius}
              onValueChange={setRadius}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.surfaceLight}
              thumbTintColor={COLORS.primaryLight}
            />
            <Text style={styles.sliderLabel}>100 mi</Text>
          </View>

          {/* Budget */}
          <SectionHeader
            title="Budget per person"
            subtitle="We'll keep all suggestions within this range"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.budgetScroll}>
            {BUDGET_OPTIONS.map((b) => (
              <TouchableOpacity
                key={b.value}
                onPress={() => setBudget(b.value)}
                style={[styles.budgetCard, budget === b.value && styles.budgetCardSelected]}
              >
                <Text style={styles.budgetEmoji}>{b.emoji}</Text>
                <Text style={[styles.budgetLabel, budget === b.value && styles.budgetLabelSelected]}>
                  {b.label}
                </Text>
                <Text style={styles.budgetDesc}>{b.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Group size (friends/date only) */}
          {mode !== 'solo' && (
            <>
              <SectionHeader
                title={`Group size: ${groupSize} people`}
                subtitle={mode === 'date' ? 'Including you and your partner' : 'Total number of people'}
              />
              <View style={styles.sliderWrapper}>
                <Text style={styles.sliderLabel}>2</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={2}
                  maximumValue={20}
                  step={1}
                  value={groupSize}
                  onValueChange={setGroupSize}
                  minimumTrackTintColor={COLORS.secondary}
                  maximumTrackTintColor={COLORS.surfaceLight}
                  thumbTintColor={COLORS.secondaryLight}
                />
                <Text style={styles.sliderLabel}>20</Text>
              </View>
            </>
          )}

          {/* Partner email (date mode) */}
          {mode === 'date' && (
            <>
              <SectionHeader
                title="Partner's account (optional)"
                subtitle="Enter your partner's email to blend their interests into the plan"
              />
              <Input
                value={partnerEmail}
                onChangeText={setPartnerEmail}
                placeholder="partner@example.com"
                keyboardType="email-address"
                icon="heart-outline"
              />
            </>
          )}

          {/* Special requests */}
          <SectionHeader
            title="Anything else?"
            subtitle="Special requests, themes, or restrictions (optional)"
          />
          <Input
            value={specialRequests}
            onChangeText={setSpecialRequests}
            placeholder="e.g. surprise element, avoid crowded places, must include a bookstore..."
            multiline
            numberOfLines={3}
            autoCapitalize="sentences"
          />

          <Button
            title={loading ? 'Crafting your plans...' : '✨ Generate 3 Itineraries'}
            onPress={handleGenerate}
            loading={loading}
            gradient={modeInfo.gradient}
            style={styles.generateBtn}
          />

          {loading && (
            <Text style={styles.loadingHint}>
              Our AI is crafting personalized itineraries just for you...
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateForPrompt(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
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
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 8,
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  modesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  modeChip: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  modeChipSelected: {
    borderColor: 'transparent',
  },
  modeChipGradient: {
    padding: 14,
    alignItems: 'center',
  },
  modeChipEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  modeChipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modeChipLabelSelected: {
    color: COLORS.white,
  },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    minWidth: 36,
    textAlign: 'center',
  },
  budgetScroll: {
    marginBottom: 4,
  },
  budgetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    minWidth: 90,
  },
  budgetCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}22`,
  },
  budgetEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  budgetLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  budgetLabelSelected: {
    color: COLORS.primaryLight,
  },
  budgetDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  timeSelectorWrap: {
    marginBottom: 12,
  },
  timeSelectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  timeScroll: {
    flexDirection: 'row',
  },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  timeChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}22`,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  timeChipTextSelected: {
    color: COLORS.primaryLight,
  },
  generateBtn: {
    marginTop: 20,
  },
  loadingHint: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 12,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

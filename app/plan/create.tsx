import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Chip, Input, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  BUDGET_OPTIONS,
  COLORS,
  DURATION_OPTIONS,
  RADIUS_OPTIONS,
} from '@/constants/theme';
import { generateItineraries } from '@/lib/recommendationEngine';
import { getOtherUsers, getUserById, savePlan } from '@/lib/storage';
import {
  BudgetLevel,
  LocationCoords,
  PlanMode,
  PlanRequest,
  SavedPlan,
  UserProfile,
} from '@/lib/types';

const TIME_OPTIONS = ['09:00', '10:00', '11:00', '12:00', '14:00', '17:00', '18:00', '19:00'];

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function CreatePlanScreen() {
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<PlanMode>((modeParam as PlanMode) || 'date');
  const [partnerIds, setPartnerIds] = useState<string[]>([]);
  const [otherUsers, setOtherUsers] = useState<UserProfile[]>([]);
  const [date, setDate] = useState(tomorrowISO());
  const [startTime, setStartTime] = useState('11:00');
  const [durationHours, setDurationHours] = useState(4);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [budget, setBudget] = useState<BudgetLevel>('moderate');
  const [radiusMiles, setRadiusMiles] = useState(15);
  const [includeFood, setIncludeFood] = useState(true);
  const [includeActivities, setIncludeActivities] = useState(true);
  const [locating, setLocating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setBudget(user.defaultBudget);
      setRadiusMiles(user.defaultRadiusMiles);
    }
  }, [user]);

  useEffect(() => {
    if (user && (mode === 'date' || mode === 'friends')) {
      getOtherUsers(user.id).then(setOtherUsers);
    }
  }, [user, mode]);

  const useCurrentLocation = async () => {
    setLocating(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Enter a city name instead.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        label: 'Current location',
      });
      setLocationLabel('Current location');
    } catch {
      setLocation({ latitude: 37.7749, longitude: -122.4194, label: 'San Francisco, CA' });
      setLocationLabel('San Francisco, CA (demo)');
    } finally {
      setLocating(false);
    }
  };

  const setManualLocation = () => {
    setLocation({ latitude: 37.7749, longitude: -122.4194, label: locationLabel || 'Custom area' });
  };

  const togglePartner = (id: string) => {
    if (partnerIds.includes(id)) {
      setPartnerIds(partnerIds.filter((p) => p !== id));
    } else {
      const max = mode === 'date' ? 1 : 5;
      if (partnerIds.length < max) {
        setPartnerIds([...partnerIds, id]);
      }
    }
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) {
      if (mode === 'date') return partnerIds.length === 1;
      if (mode === 'friends') return partnerIds.length >= 1;
      return true;
    }
    if (step === 2) return !!date && !!startTime;
    if (step === 3) return !!location;
    if (step === 4) return includeFood || includeActivities;
    return true;
  };

  const handleGenerate = async () => {
    if (!user || !location) return;
    setGenerating(true);
    setError('');

    try {
      const participantIds = [user.id, ...partnerIds];
      const profiles: UserProfile[] = [user];
      for (const id of partnerIds) {
        const p = await getUserById(id);
        if (p) profiles.push(p);
      }

      const request: PlanRequest = {
        mode,
        participantIds,
        date,
        startTime,
        durationHours,
        location,
        budget,
        radiusMiles,
        includeFood,
        includeActivities,
      };

      const itineraries = generateItineraries(request, profiles);

      if (itineraries.length === 0) {
        setError('No itineraries found. Try expanding your radius or budget.');
        setGenerating(false);
        return;
      }

      const plan: SavedPlan = {
        id: `plan_${Date.now()}`,
        request,
        itineraries,
        createdAt: new Date().toISOString(),
      };

      await savePlan(plan);
      router.replace({ pathname: '/plan/results', params: { planId: plan.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate plans');
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      if (step === 3 && !location && locationLabel) setManualLocation();
      setStep(step + 1);
    } else {
      handleGenerate();
    }
  };

  const stepTitles = ['Plan type', 'Who\'s joining?', 'When?', 'Where?', 'Details'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Button title="✕" variant="ghost" onPress={() => router.back()} style={styles.closeBtn} />
        <Text style={styles.stepIndicator}>
          Step {step + 1} of 5 · {stepTitles[step]}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <ScreenHeader title="What kind of plan?" subtitle="Choose how you're spending your time." />
            {(['solo', 'friends', 'date'] as PlanMode[]).map((m) => (
              <Chip
                key={m}
                label={m === 'solo' ? '🧘 Solo' : m === 'friends' ? '👯 Friends' : '💕 Date'}
                selected={mode === m}
                onPress={() => {
                  setMode(m);
                  setPartnerIds([]);
                }}
              />
            ))}
          </>
        )}

        {step === 1 && (
          <>
            <ScreenHeader
              title={mode === 'date' ? 'Who\'s your date?' : mode === 'friends' ? 'Invite friends' : 'Flying solo'}
              subtitle={
                mode === 'date'
                  ? 'Select your partner\'s Wonder account so we can blend both your interests.'
                  : mode === 'friends'
                    ? 'Pick friends who\'ve completed their surveys.'
                    : 'We\'ll plan based on your interests alone.'
              }
            />
            {mode === 'solo' ? (
              <Text style={styles.soloNote}>Just you! We'll personalize everything to your profile.</Text>
            ) : otherUsers.length === 0 ? (
              <View style={styles.emptyPartners}>
                <Ionicons name="people-outline" size={40} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>No other users yet</Text>
                <Text style={styles.emptyText}>
                  Have your {mode === 'date' ? 'partner' : 'friends'} create a Wonder account and complete
                  their survey. For now, we'll plan using your interests only.
                </Text>
              </View>
            ) : (
              otherUsers.map((u) => (
                <Chip
                  key={u.id}
                  label={`${u.name} (${u.interests.slice(0, 2).join(', ')}...)`}
                  selected={partnerIds.includes(u.id)}
                  onPress={() => togglePartner(u.id)}
                />
              ))
            )}
          </>
        )}

        {step === 2 && (
          <>
            <ScreenHeader title="When are you free?" subtitle="Pick a date, start time, and how long you have." />
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <Input value={date} onChangeText={setDate} placeholder="2026-06-14" />
            <Text style={styles.label}>Start time</Text>
            <View style={styles.chipGrid}>
              {TIME_OPTIONS.map((t) => (
                <Chip key={t} label={t} selected={startTime === t} onPress={() => setStartTime(t)} />
              ))}
            </View>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.chipGrid}>
              {DURATION_OPTIONS.map((d) => (
                <Chip
                  key={d.hours}
                  label={d.label}
                  selected={durationHours === d.hours}
                  onPress={() => setDurationHours(d.hours)}
                />
              ))}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <ScreenHeader
              title="Where are you?"
              subtitle="We'll find spots within your drive radius from here."
            />
            <Button
              title={locating ? 'Getting location...' : '📍 Use current location'}
              variant="secondary"
              onPress={useCurrentLocation}
              loading={locating}
            />
            <Text style={styles.orText}>or enter an area name</Text>
            <Input
              placeholder="e.g. Downtown, Austin TX"
              value={locationLabel}
              onChangeText={setLocationLabel}
            />
            {location && (
              <View style={styles.locationConfirm}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.locationText}>{location.label ?? locationLabel}</Text>
              </View>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <ScreenHeader title="Fine-tune your plan" subtitle="Budget, radius, and what to include." />
            <Text style={styles.label}>Budget</Text>
            <View style={styles.chipGrid}>
              {BUDGET_OPTIONS.map((b) => (
                <Chip
                  key={b.id}
                  label={b.label}
                  selected={budget === b.id}
                  onPress={() => setBudget(b.id)}
                />
              ))}
            </View>
            <Text style={styles.label}>Willing to drive</Text>
            <View style={styles.chipGrid}>
              {RADIUS_OPTIONS.map((miles) => (
                <Chip
                  key={miles}
                  label={`${miles} mi`}
                  selected={radiusMiles === miles}
                  onPress={() => setRadiusMiles(miles)}
                />
              ))}
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Include food stops</Text>
              <Switch
                value={includeFood}
                onValueChange={setIncludeFood}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Include activities</Text>
              <Switch
                value={includeActivities}
                onValueChange={setIncludeActivities}
                trackColor={{ true: COLORS.primary }}
              />
            </View>
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} style={styles.backBtn} />
        )}
        <Button
          title={step === 4 ? 'Generate 3 Plans ✨' : 'Continue'}
          onPress={handleNext}
          disabled={!canProceed()}
          loading={generating}
          style={styles.nextBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeBtn: { width: 48 },
  stepIndicator: { flex: 1, textAlign: 'center', color: COLORS.textSecondary, fontSize: 13 },
  scroll: { padding: 24, paddingBottom: 100 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  soloNote: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  emptyPartners: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  orText: { textAlign: 'center', color: COLORS.textSecondary, marginVertical: 16 },
  locationConfirm: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  locationText: { color: COLORS.success, fontSize: 14 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toggleLabel: { fontSize: 16, color: COLORS.text },
  error: { color: COLORS.error, marginTop: 16, fontSize: 14 },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  backBtn: { flex: 0.35 },
  nextBtn: { flex: 1 },
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CITIES } from './src/data/cities';
import {
  BUDGET_OPTIONS,
  DAY_OPTIONS,
  FOOD_OPTIONS,
  INTEREST_OPTIONS,
  MODE_OPTIONS,
  TIME_OPTIONS,
} from './src/data/options';
import { generateItineraryOptions } from './src/utils/planner';
import {
  BudgetTier,
  DayType,
  FoodTag,
  HangoutMode,
  InterestTag,
  ItineraryOption,
  PlannerRequest,
  TimeSlot,
  UserProfile,
} from './src/types';

const STORAGE_KEY = 'wonder-mobile-state';

interface SignUpDraft {
  displayName: string;
  email: string;
  password: string;
  homeCityId: string;
  maxDriveMiles: string;
  budgetTier: BudgetTier;
  interests: InterestTag[];
  foodInterests: FoodTag[];
  preferredDayTypes: DayType[];
  preferredTimeSlots: TimeSlot[];
}

const DEFAULT_SIGN_UP: SignUpDraft = {
  displayName: '',
  email: '',
  password: '',
  homeCityId: CITIES[0].id,
  maxDriveMiles: '20',
  budgetTier: 'medium',
  interests: [],
  foodInterests: [],
  preferredDayTypes: ['weekday', 'weekend'],
  preferredTimeSlots: ['afternoon', 'evening'],
};

function toggleItem<T>(items: T[], value: T): T[] {
  if (items.includes(value)) {
    return items.filter((item) => item !== value);
  }
  return [...items, value];
}

function SelectPill(props: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.pill, props.selected && styles.pillSelected]}
      onPress={props.onPress}
    >
      <Text style={[styles.pillText, props.selected && styles.pillTextSelected]}>
        {props.label}
      </Text>
    </Pressable>
  );
}

export default function App() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [signup, setSignup] = useState<SignUpDraft>(DEFAULT_SIGN_UP);
  const [validationMessage, setValidationMessage] = useState('');

  const [mode, setMode] = useState<HangoutMode>('date');
  const [dayType, setDayType] = useState<DayType>('weekend');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('evening');
  const [cityId, setCityId] = useState(CITIES[0].id);
  const [budgetPerPerson, setBudgetPerPerson] = useState('65');
  const [maxDriveMiles, setMaxDriveMiles] = useState('20');
  const [includeFood, setIncludeFood] = useState(true);
  const [includeActivities, setIncludeActivities] = useState(true);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [results, setResults] = useState<ItineraryOption[]>([]);
  const [resultsMessage, setResultsMessage] = useState('');

  const activeProfile = useMemo(
    () => accounts.find((profile) => profile.id === activeProfileId) ?? null,
    [accounts, activeProfileId],
  );

  useEffect(() => {
    async function hydrateState(): Promise<void> {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setIsHydrated(true);
        return;
      }

      try {
        const parsed = JSON.parse(stored) as {
          accounts: UserProfile[];
          activeProfileId: string | null;
        };
        setAccounts(parsed.accounts ?? []);
        setActiveProfileId(parsed.activeProfileId ?? null);
      } finally {
        setIsHydrated(true);
      }
    }

    hydrateState().catch(() => {
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accounts, activeProfileId }),
    ).catch(() => undefined);
  }, [accounts, activeProfileId, isHydrated]);

  useEffect(() => {
    if (!activeProfile) {
      return;
    }

    setCityId(activeProfile.homeCityId);
    setMaxDriveMiles(String(activeProfile.maxDriveMiles));
    setParticipantIds((previous) => {
      if (previous.length > 0) {
        return previous;
      }
      return [activeProfile.id];
    });
  }, [activeProfile]);

  useEffect(() => {
    if (!activeProfile) {
      return;
    }

    if (mode === 'solo') {
      setParticipantIds([activeProfile.id]);
      return;
    }

    setParticipantIds((current) => {
      const cleaned = current.filter((id) => accounts.some((profile) => profile.id === id));
      if (!cleaned.includes(activeProfile.id)) {
        cleaned.unshift(activeProfile.id);
      }
      return cleaned;
    });
  }, [mode, activeProfile, accounts]);

  function createProfile(): void {
    if (!signup.displayName || !signup.email || !signup.password) {
      setValidationMessage('Name, email, and password are required.');
      return;
    }
    if (signup.interests.length === 0) {
      setValidationMessage('Pick at least one core interest.');
      return;
    }
    if (signup.preferredDayTypes.length === 0 || signup.preferredTimeSlots.length === 0) {
      setValidationMessage('Select availability preferences.');
      return;
    }

    const miles = Number.parseFloat(signup.maxDriveMiles);
    if (Number.isNaN(miles) || miles <= 0) {
      setValidationMessage('Driving radius must be a positive number.');
      return;
    }

    const profile: UserProfile = {
      id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      displayName: signup.displayName.trim(),
      email: signup.email.trim().toLowerCase(),
      password: signup.password,
      homeCityId: signup.homeCityId,
      maxDriveMiles: miles,
      budgetTier: signup.budgetTier,
      interests: signup.interests,
      foodInterests: signup.foodInterests,
      availability: {
        preferredDayTypes: signup.preferredDayTypes,
        preferredTimeSlots: signup.preferredTimeSlots,
      },
    };

    setAccounts((previous) => [...previous, profile]);
    setActiveProfileId(profile.id);
    setParticipantIds([profile.id]);
    setCreatingProfile(false);
    setSignup(DEFAULT_SIGN_UP);
    setValidationMessage('');
  }

  function onToggleParticipant(profileId: string): void {
    if (!activeProfile) {
      return;
    }

    if (mode === 'solo') {
      setParticipantIds([activeProfile.id]);
      return;
    }

    setParticipantIds((current) => {
      const next = current.includes(profileId)
        ? current.filter((id) => id !== profileId)
        : [...current, profileId];

      if (!next.includes(activeProfile.id)) {
        next.unshift(activeProfile.id);
      }

      if (mode === 'date' && next.length > 2) {
        return next.slice(0, 2);
      }

      return next;
    });
  }

  function buildPlans(): void {
    if (!activeProfile) {
      return;
    }
    if (!includeFood && !includeActivities) {
      setResults([]);
      setResultsMessage('Enable food and/or activities to build an itinerary.');
      return;
    }
    if (mode === 'date' && participantIds.length !== 2) {
      setResults([]);
      setResultsMessage('Date mode needs exactly 2 participants.');
      return;
    }
    if (mode === 'friendship' && participantIds.length < 2) {
      setResults([]);
      setResultsMessage('Friendship mode needs at least 2 participants.');
      return;
    }

    const request: PlannerRequest = {
      mode,
      cityId,
      dayType,
      timeSlot,
      participantIds,
      includeFood,
      includeActivities,
      maxDriveMiles: Number.parseFloat(maxDriveMiles) || activeProfile.maxDriveMiles,
      budgetPerPerson: Number.parseFloat(budgetPerPerson) || 50,
    };

    const itinerary = generateItineraryOptions(request, accounts);
    setResults(itinerary);

    if (itinerary.length === 0) {
      setResultsMessage(
        'No matches found for these constraints. Try increasing radius or budget, or widen time options.',
      );
      return;
    }

    setResultsMessage(`Generated ${itinerary.length} itinerary options.`);
  }

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.heading}>Loading Wonder...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const showSignup = accounts.length === 0 || creatingProfile;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Wonder Itinerary Builder</Text>
        <Text style={styles.subtitle}>
          Build 3 personalized ideas for solo, friendship, or date plans.
        </Text>

        {showSignup ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Create Account + Survey</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#8f9ab3"
              value={signup.displayName}
              onChangeText={(value) => setSignup((previous) => ({ ...previous, displayName: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8f9ab3"
              keyboardType="email-address"
              autoCapitalize="none"
              value={signup.email}
              onChangeText={(value) => setSignup((previous) => ({ ...previous, email: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8f9ab3"
              secureTextEntry
              value={signup.password}
              onChangeText={(value) => setSignup((previous) => ({ ...previous, password: value }))}
            />

            <Text style={styles.label}>Home City</Text>
            <View style={styles.rowWrap}>
              {CITIES.map((city) => (
                <SelectPill
                  key={city.id}
                  label={city.label}
                  selected={signup.homeCityId === city.id}
                  onPress={() => setSignup((previous) => ({ ...previous, homeCityId: city.id }))}
                />
              ))}
            </View>

            <Text style={styles.label}>Default Drive Radius (miles)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={signup.maxDriveMiles}
              onChangeText={(value) => setSignup((previous) => ({ ...previous, maxDriveMiles: value }))}
            />

            <Text style={styles.label}>Budget Tier</Text>
            <View style={styles.rowWrap}>
              {BUDGET_OPTIONS.map((option) => (
                <SelectPill
                  key={option.value}
                  label={option.label}
                  selected={signup.budgetTier === option.value}
                  onPress={() => setSignup((previous) => ({ ...previous, budgetTier: option.value }))}
                />
              ))}
            </View>

            <Text style={styles.label}>Interests</Text>
            <View style={styles.rowWrap}>
              {INTEREST_OPTIONS.map((option) => (
                <SelectPill
                  key={option.value}
                  label={option.label}
                  selected={signup.interests.includes(option.value)}
                  onPress={() =>
                    setSignup((previous) => ({
                      ...previous,
                      interests: toggleItem(previous.interests, option.value),
                    }))
                  }
                />
              ))}
            </View>

            <Text style={styles.label}>Food Preferences</Text>
            <View style={styles.rowWrap}>
              {FOOD_OPTIONS.map((option) => (
                <SelectPill
                  key={option.value}
                  label={option.label}
                  selected={signup.foodInterests.includes(option.value)}
                  onPress={() =>
                    setSignup((previous) => ({
                      ...previous,
                      foodInterests: toggleItem(previous.foodInterests, option.value),
                    }))
                  }
                />
              ))}
            </View>

            <Text style={styles.label}>Preferred Day Types</Text>
            <View style={styles.rowWrap}>
              {DAY_OPTIONS.map((option) => (
                <SelectPill
                  key={option.value}
                  label={option.label}
                  selected={signup.preferredDayTypes.includes(option.value)}
                  onPress={() =>
                    setSignup((previous) => ({
                      ...previous,
                      preferredDayTypes: toggleItem(previous.preferredDayTypes, option.value),
                    }))
                  }
                />
              ))}
            </View>

            <Text style={styles.label}>Preferred Time Slots</Text>
            <View style={styles.rowWrap}>
              {TIME_OPTIONS.map((option) => (
                <SelectPill
                  key={option.value}
                  label={option.label}
                  selected={signup.preferredTimeSlots.includes(option.value)}
                  onPress={() =>
                    setSignup((previous) => ({
                      ...previous,
                      preferredTimeSlots: toggleItem(previous.preferredTimeSlots, option.value),
                    }))
                  }
                />
              ))}
            </View>

            {validationMessage ? <Text style={styles.errorText}>{validationMessage}</Text> : null}
            <Pressable style={styles.primaryButton} onPress={createProfile}>
              <Text style={styles.primaryButtonText}>Save Profile</Text>
            </Pressable>
            {accounts.length > 0 ? (
              <Pressable style={styles.secondaryButton} onPress={() => setCreatingProfile(false)}>
                <Text style={styles.secondaryButtonText}>Back to Planner</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Profiles</Text>
              <Text style={styles.helperText}>
                Every user gets their own signup survey, so group plans can blend preferences.
              </Text>
              <View style={styles.rowWrap}>
                {accounts.map((profile) => (
                  <SelectPill
                    key={profile.id}
                    label={profile.displayName}
                    selected={activeProfileId === profile.id}
                    onPress={() => setActiveProfileId(profile.id)}
                  />
                ))}
              </View>
              <Pressable style={styles.secondaryButton} onPress={() => setCreatingProfile(true)}>
                <Text style={styles.secondaryButtonText}>Add Another Profile</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Plan Builder</Text>

              <Text style={styles.label}>Mode</Text>
              <View style={styles.rowWrap}>
                {MODE_OPTIONS.map((option) => (
                  <SelectPill
                    key={option.value}
                    label={option.label}
                    selected={mode === option.value}
                    onPress={() => setMode(option.value)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Participants</Text>
              <View style={styles.rowWrap}>
                {accounts.map((profile) => (
                  <SelectPill
                    key={profile.id}
                    label={profile.displayName}
                    selected={participantIds.includes(profile.id)}
                    onPress={() => onToggleParticipant(profile.id)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Day + Time</Text>
              <View style={styles.rowWrap}>
                {DAY_OPTIONS.map((option) => (
                  <SelectPill
                    key={option.value}
                    label={option.label}
                    selected={dayType === option.value}
                    onPress={() => setDayType(option.value)}
                  />
                ))}
              </View>
              <View style={styles.rowWrap}>
                {TIME_OPTIONS.map((option) => (
                  <SelectPill
                    key={option.value}
                    label={option.label}
                    selected={timeSlot === option.value}
                    onPress={() => setTimeSlot(option.value)}
                  />
                ))}
              </View>

              <Text style={styles.label}>City</Text>
              <View style={styles.rowWrap}>
                {CITIES.map((city) => (
                  <SelectPill
                    key={city.id}
                    label={city.label}
                    selected={cityId === city.id}
                    onPress={() => setCityId(city.id)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Budget Per Person (USD)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={budgetPerPerson}
                onChangeText={setBudgetPerPerson}
              />

              <Text style={styles.label}>Max Drive Radius (miles)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={maxDriveMiles}
                onChangeText={setMaxDriveMiles}
              />

              <View style={styles.toggleRow}>
                <Text style={styles.label}>Include Food</Text>
                <Switch value={includeFood} onValueChange={setIncludeFood} />
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.label}>Include Activities</Text>
                <Switch value={includeActivities} onValueChange={setIncludeActivities} />
              </View>

              <Pressable style={styles.primaryButton} onPress={buildPlans}>
                <Text style={styles.primaryButtonText}>Generate 3 Ideas</Text>
              </Pressable>
              {resultsMessage ? <Text style={styles.helperText}>{resultsMessage}</Text> : null}
            </View>

            {results.map((itinerary, index) => (
              <View key={itinerary.id} style={styles.card}>
                <Text style={styles.sectionTitle}>Option {index + 1}</Text>
                <Text style={styles.itineraryTitle}>{itinerary.title}</Text>
                <Text style={styles.helperText}>{itinerary.summary}</Text>
                <Text style={styles.metricText}>
                  Cost/person: ${itinerary.totalCostPerPerson.toFixed(0)} | Drive:{' '}
                  {itinerary.estimatedDriveMiles.toFixed(1)} mi
                </Text>
                {itinerary.stops.map((stop) => (
                  <View key={stop.venue.id} style={styles.stopRow}>
                    <Text style={styles.stopTitle}>
                      • {stop.venue.title} ({stop.venue.kind})
                    </Text>
                    <Text style={styles.stopMeta}>
                      ${stop.venue.costPerPerson} · {stop.venue.durationMinutes} min · score{' '}
                      {stop.score.toFixed(1)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    padding: 16,
    paddingBottom: 44,
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#111c35',
    borderRadius: 14,
    padding: 14,
    borderColor: '#24375a',
    borderWidth: 1,
    gap: 10,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    color: '#dce6ff',
    fontSize: 14,
    fontWeight: '600',
  },
  helperText: {
    color: '#c1cee8',
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#2c456f',
    backgroundColor: '#132443',
    color: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#3b5683',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  pillText: {
    color: '#c8d7f0',
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#ffffff',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#3d5b8f',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#d7e6ff',
    fontWeight: '600',
  },
  errorText: {
    color: '#fecaca',
    fontSize: 13,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itineraryTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  metricText: {
    color: '#dbeafe',
    fontSize: 13,
    fontWeight: '600',
  },
  stopRow: {
    borderTopWidth: 1,
    borderTopColor: '#2a3f67',
    paddingTop: 8,
    gap: 3,
  },
  stopTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  stopMeta: {
    color: '#bed0ef',
    fontSize: 12,
  },
  heading: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
});

import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Chip, ScreenHeader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  ACTIVITY_OPTIONS,
  BUDGET_OPTIONS,
  DIETARY_OPTIONS,
  ENERGY_OPTIONS,
  FOOD_OPTIONS,
  RADIUS_OPTIONS,
  COLORS,
} from '@/constants/theme';
import {
  ActivityCategory,
  BudgetLevel,
  DietaryPreference,
  EnergyLevel,
  FoodCategory,
} from '@/lib/types';

const STEPS = ['Activities', 'Food', 'Preferences', 'Defaults'];

export default function SurveyScreen() {
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<ActivityCategory[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<FoodCategory[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryPreference[]>(['none']);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('moderate');
  const [defaultBudget, setDefaultBudget] = useState<BudgetLevel>('moderate');
  const [defaultRadiusMiles, setDefaultRadiusMiles] = useState(15);
  const [loading, setLoading] = useState(false);

  const toggleItem = <T extends string>(list: T[], item: T, setter: (v: T[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const toggleDietary = (item: DietaryPreference) => {
    if (item === 'none') {
      setDietaryRestrictions(['none']);
      return;
    }
    const withoutNone = dietaryRestrictions.filter((d) => d !== 'none');
    if (withoutNone.includes(item)) {
      const next = withoutNone.filter((d) => d !== item);
      setDietaryRestrictions(next.length ? next : ['none']);
    } else {
      setDietaryRestrictions([...withoutNone, item]);
    }
  };

  const canProceed = () => {
    if (step === 0) return interests.length >= 2;
    if (step === 1) return foodPreferences.length >= 2;
    return true;
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    if (!user) return;
    setLoading(true);
    try {
      await updateProfile({
        ...user,
        interests,
        foodPreferences,
        dietaryRestrictions,
        energyLevel,
        defaultBudget,
        defaultRadiusMiles,
        surveyCompleted: true,
      });
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressRow}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.progressItem}>
            <View style={[styles.progressDot, i <= step && styles.progressDotActive]} />
            <Text style={[styles.progressLabel, i <= step && styles.progressLabelActive]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <>
            <ScreenHeader
              title="What do you love doing?"
              subtitle="Pick at least 2 activities you're into. We'll use these to find hikes, concerts, museums, and more."
            />
            <View style={styles.chipGrid}>
              {ACTIVITY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={interests.includes(opt.id)}
                  onPress={() => toggleItem(interests, opt.id, setInterests)}
                  icon={
                    <Ionicons
                      name={opt.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={interests.includes(opt.id) ? COLORS.primaryLight : COLORS.textSecondary}
                    />
                  }
                />
              ))}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <ScreenHeader
              title="What's your food vibe?"
              subtitle="Pick at least 2 cuisines and dining styles you enjoy."
            />
            <View style={styles.chipGrid}>
              {FOOD_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={foodPreferences.includes(opt.id)}
                  onPress={() => toggleItem(foodPreferences, opt.id, setFoodPreferences)}
                  icon={
                    <Ionicons
                      name={opt.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={
                        foodPreferences.includes(opt.id) ? COLORS.primaryLight : COLORS.textSecondary
                      }
                    />
                  }
                />
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <ScreenHeader
              title="A few more preferences"
              subtitle="Help us fine-tune your recommendations."
            />
            <Text style={styles.sectionLabel}>Dietary restrictions</Text>
            <View style={styles.chipGrid}>
              {DIETARY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={dietaryRestrictions.includes(opt.id)}
                  onPress={() => toggleDietary(opt.id)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Energy level</Text>
            {ENERGY_OPTIONS.map((opt) => (
              <Chip
                key={opt.id}
                label={`${opt.label} — ${opt.description}`}
                selected={energyLevel === opt.id}
                onPress={() => setEnergyLevel(opt.id)}
              />
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <ScreenHeader
              title="Default settings"
              subtitle="You can always change these when creating a plan."
            />
            <Text style={styles.sectionLabel}>Typical budget</Text>
            <View style={styles.chipGrid}>
              {BUDGET_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={defaultBudget === opt.id}
                  onPress={() => setDefaultBudget(opt.id)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>How far will you drive?</Text>
            <View style={styles.chipGrid}>
              {RADIUS_OPTIONS.map((miles) => (
                <Chip
                  key={miles}
                  label={`${miles} mi`}
                  selected={defaultRadiusMiles === miles}
                  onPress={() => setDefaultRadiusMiles(miles)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} style={styles.backBtn} />
        )}
        <Button
          title={step === STEPS.length - 1 ? 'Finish Setup' : 'Continue'}
          onPress={handleNext}
          loading={loading}
          disabled={!canProceed()}
          style={styles.nextBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginBottom: 4,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  progressLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  progressLabelActive: {
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
  scroll: {
    padding: 24,
    paddingBottom: 100,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  backBtn: { flex: 0.4 },
  nextBtn: { flex: 1 },
});

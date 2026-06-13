import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, updateUserInterests } from '../../services/firebase';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { useAppStore } from '../../store';
import {
  COLORS,
  ACTIVITY_CATEGORIES,
  DIETARY_OPTIONS,
  VIBE_OPTIONS,
} from '../../constants';
import { ActivityCategory, UserInterests } from '../../types';

const STEPS = [
  { key: 'categories', title: "What's your scene?", subtitle: 'Pick everything that excites you — we use this to shape your outings.' },
  { key: 'vibes', title: 'What vibe are you?', subtitle: 'Select the energy you most want to feel during an outing.' },
  { key: 'dietary', title: 'Any food preferences?', subtitle: 'We\'ll make sure every food suggestion works for you.' },
  { key: 'avoid', title: 'Anything off limits?', subtitle: 'Skip anything you\'d rather not do — totally optional.' },
];

export default function InterestsScreen() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { setUser, user } = useAppStore();

  const [selectedCategories, setSelectedCategories] = useState<ActivityCategory[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [avoidCategories, setAvoidCategories] = useState<ActivityCategory[]>([]);

  const toggleCategory = (val: ActivityCategory, list: ActivityCategory[], setter: React.Dispatch<React.SetStateAction<ActivityCategory[]>>) => {
    setter(list.includes(val) ? list.filter((c) => c !== val) : [...list, val]);
  };

  const toggleString = (val: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(list.includes(val) ? list.filter((c) => c !== val) : [...list, val]);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    setLoading(true);
    try {
      const interests: UserInterests = {
        categories: selectedCategories,
        dietaryPreferences: selectedDietary,
        favoriteVibe: selectedVibes,
        avoidCategories,
      };
      await updateUserInterests(firebaseUser.uid, interests);
      if (user) {
        setUser({ ...user, interests, onboardingComplete: true });
      }
      router.replace('/(app)');
    } catch {
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const renderStepContent = () => {
    switch (currentStep.key) {
      case 'categories':
        return (
          <View style={styles.chipsContainer}>
            {ACTIVITY_CATEGORIES.map((cat) => (
              <Chip
                key={cat.value}
                label={cat.label}
                emoji={cat.emoji}
                selected={selectedCategories.includes(cat.value)}
                onPress={() => toggleCategory(cat.value, selectedCategories, setSelectedCategories)}
              />
            ))}
          </View>
        );
      case 'vibes':
        return (
          <View style={styles.chipsContainer}>
            {VIBE_OPTIONS.map((vibe) => (
              <Chip
                key={vibe.value}
                label={vibe.label}
                emoji={vibe.emoji}
                selected={selectedVibes.includes(vibe.value)}
                onPress={() => toggleString(vibe.value, selectedVibes, setSelectedVibes)}
              />
            ))}
          </View>
        );
      case 'dietary':
        return (
          <View style={styles.chipsContainer}>
            {DIETARY_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                emoji={opt.emoji}
                selected={selectedDietary.includes(opt.value)}
                onPress={() => toggleString(opt.value, selectedDietary, setSelectedDietary)}
              />
            ))}
          </View>
        );
      case 'avoid':
        return (
          <View style={styles.chipsContainer}>
            {ACTIVITY_CATEGORIES.map((cat) => (
              <Chip
                key={cat.value}
                label={cat.label}
                emoji={cat.emoji}
                selected={avoidCategories.includes(cat.value)}
                onPress={() => toggleCategory(cat.value, avoidCategories, setAvoidCategories)}
              />
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1a0533']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.progressBar}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= step && styles.progressDotActive,
                i < step && styles.progressDotDone,
              ]}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>Step {step + 1} of {STEPS.length}</Text>
            <Text style={styles.title}>{currentStep.title}</Text>
            <Text style={styles.subtitle}>{currentStep.subtitle}</Text>
          </View>

          {renderStepContent()}
        </ScrollView>

        <View style={styles.bottomActions}>
          {step > 0 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          <Button
            title={isLastStep ? "Let's go! ✨" : 'Continue'}
            onPress={handleNext}
            loading={loading}
            style={styles.nextBtn}
          />
          {!isLastStep && (
            <TouchableOpacity onPress={handleNext} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 8,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surfaceLight,
  },
  progressDotActive: {
    backgroundColor: COLORS.primaryLight,
  },
  progressDotDone: {
    backgroundColor: COLORS.primary,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  stepHeader: {
    marginBottom: 28,
  },
  stepNumber: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  bottomActions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  nextBtn: {
    width: '100%',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  backBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Chip } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  ACTIVITY_OPTIONS,
  COLORS,
  FOOD_OPTIONS,
} from '@/constants/theme';
import { BUDGET_LABELS } from '@/lib/types';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const interestLabels = user?.interests
    .map((id) => ACTIVITY_OPTIONS.find((o) => o.id === id)?.label)
    .filter(Boolean);

  const foodLabels = user?.foodPreferences
    .map((id) => FOOD_OPTIONS.find((o) => o.id === id)?.label)
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Activity interests</Text>
          <View style={styles.chipRow}>
            {interestLabels?.map((label) => (
              <Chip key={label} label={label!} selected onPress={() => {}} />
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Food preferences</Text>
          <View style={styles.chipRow}>
            {foodLabels?.map((label) => (
              <Chip key={label} label={label!} selected onPress={() => {}} />
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.settingRow}>
            <Ionicons name="wallet-outline" size={20} color={COLORS.primaryLight} />
            <Text style={styles.settingLabel}>Default budget</Text>
            <Text style={styles.settingValue}>
              {user ? BUDGET_LABELS[user.defaultBudget] : '—'}
            </Text>
          </View>
          <View style={styles.settingRow}>
            <Ionicons name="navigate-outline" size={20} color={COLORS.primaryLight} />
            <Text style={styles.settingLabel}>Drive radius</Text>
            <Text style={styles.settingValue}>{user?.defaultRadiusMiles} miles</Text>
          </View>
          <View style={styles.settingRow}>
            <Ionicons name="flash-outline" size={20} color={COLORS.primaryLight} />
            <Text style={styles.settingLabel}>Energy level</Text>
            <Text style={styles.settingValue}>{user?.energyLevel}</Text>
          </View>
        </Card>

        <Button
          title="Retake Interest Survey"
          variant="secondary"
          onPress={() => router.push('/(onboarding)/survey')}
          style={styles.surveyBtn}
        />
        <Button title="Sign Out" variant="ghost" onPress={handleSignOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  settingLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  settingValue: { fontSize: 14, color: COLORS.textSecondary },
  surveyBtn: { marginBottom: 12 },
});

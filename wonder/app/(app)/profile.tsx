import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signOutUser, updateUserInterests } from '../../services/firebase';
import { useAppStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import {
  COLORS,
  GRADIENTS,
  ACTIVITY_CATEGORIES,
  DIETARY_OPTIONS,
  VIBE_OPTIONS,
} from '../../constants';
import { ActivityCategory, UserInterests } from '../../types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={COLORS.textMuted} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, setUser, clearPlans } = useAppStore();
  const [editingInterests, setEditingInterests] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<ActivityCategory[]>(
    user?.interests.categories ?? []
  );
  const [selectedVibes, setSelectedVibes] = useState<string[]>(user?.interests.favoriteVibe ?? []);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(user?.interests.dietaryPreferences ?? []);
  const [avoidCategories, setAvoidCategories] = useState<ActivityCategory[]>(
    user?.interests.avoidCategories ?? []
  );

  const toggleCategory = (
    val: ActivityCategory,
    list: ActivityCategory[],
    setter: React.Dispatch<React.SetStateAction<ActivityCategory[]>>
  ) => {
    setter(list.includes(val) ? list.filter((c) => c !== val) : [...list, val]);
  };

  const toggleString = (
    val: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(list.includes(val) ? list.filter((c) => c !== val) : [...list, val]);
  };

  const handleSaveInterests = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const interests: UserInterests = {
        categories: selectedCategories,
        dietaryPreferences: selectedDietary,
        favoriteVibe: selectedVibes,
        avoidCategories,
      };
      await updateUserInterests(user.uid, interests);
      setUser({ ...user, interests });
      setEditingInterests(false);
    } catch {
      Alert.alert('Error', 'Could not save interests. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOutUser();
            clearPlans();
            setUser(null);
          } catch {
            Alert.alert('Error', 'Failed to sign out.');
          }
        },
      },
    ]);
  };

  if (!user) return null;

  const categoryCount = user.interests.categories.length;
  const vibeCount = user.interests.favoriteVibe.length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1a0533']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={GRADIENTS.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.heroName}>{user.displayName}</Text>
              <Text style={styles.heroEmail}>{user.email}</Text>
            </LinearGradient>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{categoryCount}</Text>
              <Text style={styles.statLabel}>Interests</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{vibeCount}</Text>
              <Text style={styles.statLabel}>Vibes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{user.interests.dietaryPreferences.length}</Text>
              <Text style={styles.statLabel}>Dietary</Text>
            </View>
          </View>

          {/* Account info */}
          <Section title="Account">
            <View style={styles.infoCard}>
              <InfoRow icon="person-outline" label="Name" value={user.displayName} />
              <View style={styles.divider} />
              <InfoRow icon="mail-outline" label="Email" value={user.email} />
            </View>
          </Section>

          {/* Interests */}
          <Section title="My Interests">
            {!editingInterests ? (
              <View>
                <TouchableOpacity
                  onPress={() => setEditingInterests(true)}
                  style={styles.editInterestsBtn}
                >
                  <Text style={styles.editInterestsBtnText}>Edit Interests</Text>
                  <Ionicons name="pencil" size={14} color={COLORS.primaryLight} />
                </TouchableOpacity>

                <View style={styles.interestGroups}>
                  {user.interests.categories.length > 0 && (
                    <View style={styles.interestGroup}>
                      <Text style={styles.interestGroupLabel}>Activities</Text>
                      <View style={styles.chips}>
                        {user.interests.categories.map((c) => {
                          const cat = ACTIVITY_CATEGORIES.find((a) => a.value === c);
                          return (
                            <View key={c} style={styles.chip}>
                              <Text style={styles.chipText}>{cat?.emoji} {cat?.label ?? c}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {user.interests.favoriteVibe.length > 0 && (
                    <View style={styles.interestGroup}>
                      <Text style={styles.interestGroupLabel}>Vibes</Text>
                      <View style={styles.chips}>
                        {user.interests.favoriteVibe.map((v) => {
                          const vibe = VIBE_OPTIONS.find((o) => o.value === v);
                          return (
                            <View key={v} style={styles.chip}>
                              <Text style={styles.chipText}>{vibe?.emoji} {vibe?.label ?? v}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {user.interests.dietaryPreferences.length > 0 && (
                    <View style={styles.interestGroup}>
                      <Text style={styles.interestGroupLabel}>Dietary</Text>
                      <View style={styles.chips}>
                        {user.interests.dietaryPreferences.map((d) => {
                          const diet = DIETARY_OPTIONS.find((o) => o.value === d);
                          return (
                            <View key={d} style={styles.chip}>
                              <Text style={styles.chipText}>{diet?.emoji} {diet?.label ?? d}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {user.interests.avoidCategories.length > 0 && (
                    <View style={styles.interestGroup}>
                      <Text style={styles.interestGroupLabel}>Avoid</Text>
                      <View style={styles.chips}>
                        {user.interests.avoidCategories.map((c) => {
                          const cat = ACTIVITY_CATEGORIES.find((a) => a.value === c);
                          return (
                            <View key={c} style={[styles.chip, styles.chipAvoid]}>
                              <Text style={styles.chipText}>{cat?.emoji} {cat?.label ?? c}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {categoryCount === 0 && vibeCount === 0 && (
                    <TouchableOpacity
                      onPress={() => setEditingInterests(true)}
                      style={styles.emptyInterests}
                    >
                      <Text style={styles.emptyInterestsText}>
                        No interests set yet. Tap Edit Interests to personalize your plans.
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.editInterestsPanel}>
                <Text style={styles.editLabel}>Activities I enjoy</Text>
                <View style={styles.chipsWrap}>
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

                <Text style={styles.editLabel}>My vibes</Text>
                <View style={styles.chipsWrap}>
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

                <Text style={styles.editLabel}>Dietary preferences</Text>
                <View style={styles.chipsWrap}>
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

                <Text style={styles.editLabel}>Activities to avoid</Text>
                <View style={styles.chipsWrap}>
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

                <View style={styles.editActions}>
                  <Button title="Save Interests" onPress={handleSaveInterests} loading={saving} />
                  <Button
                    title="Cancel"
                    onPress={() => setEditingInterests(false)}
                    variant="ghost"
                  />
                </View>
              </View>
            )}
          </Section>

          {/* Sign out */}
          <View style={styles.dangerZone}>
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 16,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  heroEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statNum: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  editInterestsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  editInterestsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  interestGroups: {
    gap: 16,
  },
  interestGroup: {
    gap: 8,
  },
  interestGroupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: `${COLORS.primary}22`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}44`,
  },
  chipAvoid: {
    backgroundColor: `${COLORS.error}15`,
    borderColor: `${COLORS.error}40`,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  emptyInterests: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  emptyInterestsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  editInterestsPanel: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  editActions: {
    gap: 10,
    marginTop: 8,
  },
  dangerZone: {
    marginTop: 8,
    alignItems: 'center',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.error,
  },
});

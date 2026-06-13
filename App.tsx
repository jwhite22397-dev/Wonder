import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type PlanMode = "solo" | "friends" | "date";
type ActivityType =
  | "hikes"
  | "sports"
  | "concerts"
  | "museums"
  | "eateries"
  | "tours"
  | "coffee"
  | "markets"
  | "games"
  | "wellness";

type Profile = {
  id: string;
  name: string;
  interests: ActivityType[];
  availability: string;
  location: string;
  budget: number;
  radius: number;
  foodPreferences: string;
};

type Venue = {
  id: string;
  title: string;
  type: ActivityType;
  durationMinutes: number;
  cost: number;
  distanceMiles: number;
  mood: PlanMode[];
  description: string;
};

type Itinerary = {
  title: string;
  budgetNote: string;
  distanceNote: string;
  reason: string;
  stops: string[];
};

const ACTIVITY_OPTIONS: ActivityType[] = [
  "hikes",
  "sports",
  "concerts",
  "museums",
  "eateries",
  "tours",
  "coffee",
  "markets",
  "games",
  "wellness",
];

const SAMPLE_VENUES: Venue[] = [
  {
    id: "ridge-loop",
    title: "Sunset Ridge Loop",
    type: "hikes",
    durationMinutes: 95,
    cost: 0,
    distanceMiles: 8,
    mood: ["solo", "friends", "date"],
    description: "easy overlook trail with a photo-worthy finish",
  },
  {
    id: "arena-night",
    title: "Downtown Sports Night",
    type: "sports",
    durationMinutes: 150,
    cost: 45,
    distanceMiles: 12,
    mood: ["friends", "date"],
    description: "local game with casual seats and crowd energy",
  },
  {
    id: "listening-room",
    title: "Listening Room Set",
    type: "concerts",
    durationMinutes: 120,
    cost: 30,
    distanceMiles: 6,
    mood: ["friends", "date"],
    description: "intimate live music without needing a full late night",
  },
  {
    id: "modern-gallery",
    title: "Modern Art Gallery",
    type: "museums",
    durationMinutes: 90,
    cost: 18,
    distanceMiles: 4,
    mood: ["solo", "friends", "date"],
    description: "walkable exhibits with conversation starters",
  },
  {
    id: "chef-counter",
    title: "Chef Counter Tasting",
    type: "eateries",
    durationMinutes: 80,
    cost: 52,
    distanceMiles: 5,
    mood: ["date"],
    description: "small plates built for sharing",
  },
  {
    id: "food-hall",
    title: "Neighborhood Food Hall",
    type: "eateries",
    durationMinutes: 70,
    cost: 24,
    distanceMiles: 7,
    mood: ["solo", "friends", "date"],
    description: "multiple stalls so everyone can pick their craving",
  },
  {
    id: "history-walk",
    title: "Hidden History Walking Tour",
    type: "tours",
    durationMinutes: 75,
    cost: 20,
    distanceMiles: 3,
    mood: ["solo", "friends", "date"],
    description: "guided route through local landmarks",
  },
  {
    id: "slow-coffee",
    title: "Slow Bar Coffee Flight",
    type: "coffee",
    durationMinutes: 45,
    cost: 14,
    distanceMiles: 2,
    mood: ["solo", "friends", "date"],
    description: "low-pressure tasting with cozy seating",
  },
  {
    id: "night-market",
    title: "Open-Air Night Market",
    type: "markets",
    durationMinutes: 100,
    cost: 22,
    distanceMiles: 10,
    mood: ["friends", "date"],
    description: "street food, local makers, and room to wander",
  },
  {
    id: "arcade-lounge",
    title: "Arcade Lounge Challenge",
    type: "games",
    durationMinutes: 85,
    cost: 26,
    distanceMiles: 9,
    mood: ["solo", "friends", "date"],
    description: "retro games and friendly competition",
  },
  {
    id: "sound-bath",
    title: "Sound Bath Reset",
    type: "wellness",
    durationMinutes: 60,
    cost: 28,
    distanceMiles: 6,
    mood: ["solo", "friends", "date"],
    description: "calm studio session for a quieter plan",
  },
];

const emptyProfile = (): Profile => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: "",
  interests: [],
  availability: "",
  location: "",
  budget: 80,
  radius: 15,
  foodPreferences: "",
});

const starterProfiles: Profile[] = [
  {
    id: "me",
    name: "Me",
    interests: ["hikes", "concerts", "eateries"],
    availability: "Friday after 6 PM",
    location: "Atlanta, GA",
    budget: 90,
    radius: 20,
    foodPreferences: "tacos, ramen, dessert",
  },
  {
    id: "partner",
    name: "Girlfriend",
    interests: ["museums", "coffee", "markets"],
    availability: "Friday after 6 PM",
    location: "Atlanta, GA",
    budget: 80,
    radius: 15,
    foodPreferences: "vegetarian-friendly, coffee, small plates",
  },
];

const planModeLabels: Record<PlanMode, string> = {
  solo: "Solo",
  friends: "Friends",
  date: "Date",
};

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>(starterProfiles);
  const [draftProfile, setDraftProfile] = useState<Profile>(() => emptyProfile());
  const [selectedIds, setSelectedIds] = useState<string[]>(["me", "partner"]);
  const [planMode, setPlanMode] = useState<PlanMode>("date");

  const selectedProfiles = useMemo(
    () => profiles.filter((profile) => selectedIds.includes(profile.id)),
    [profiles, selectedIds],
  );

  const itineraries = useMemo(
    () => buildItineraries(selectedProfiles, planMode),
    [selectedProfiles, planMode],
  );

  const saveProfile = () => {
    const name = draftProfile.name.trim();
    if (!name) {
      return;
    }

    const interests: ActivityType[] = draftProfile.interests.length
      ? draftProfile.interests
      : ["eateries"];

    const newProfile: Profile = {
      ...draftProfile,
      name,
      availability: draftProfile.availability.trim() || "Flexible",
      location: draftProfile.location.trim() || "Current location",
      foodPreferences: draftProfile.foodPreferences.trim() || "open to anything",
      interests,
    };

    setProfiles((current) => [...current, newProfile]);
    setSelectedIds((current) => [...current, newProfile.id]);
    setDraftProfile(emptyProfile());
  };

  const toggleSelectedProfile = (profileId: string) => {
    setSelectedIds((current) => {
      if (current.includes(profileId)) {
        return current.filter((id) => id !== profileId);
      }
      return [...current, profileId];
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Wonder</Text>
          <Text style={styles.title}>Plan something worth leaving the house for.</Text>
          <Text style={styles.subtitle}>
            Create individual interest profiles, pick solo/friends/date mode, then get
            three itinerary ideas that blend food, activities, availability, budget,
            location, and drive radius.
          </Text>
        </View>

        <Section title="1. Choose plan type">
          <View style={styles.segmentedControl}>
            {(["solo", "friends", "date"] as PlanMode[]).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setPlanMode(mode)}
                style={[styles.segment, planMode === mode && styles.segmentActive]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    planMode === mode && styles.segmentTextActive,
                  ]}
                >
                  {planModeLabels[mode]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="2. Sign-up survey profiles">
          <Text style={styles.helperText}>
            Each person gets their own account-style profile so the itinerary can look
            for overlaps and tradeoffs across the group.
          </Text>
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              selected={selectedIds.includes(profile.id)}
              onPress={() => toggleSelectedProfile(profile.id)}
            />
          ))}
        </Section>

        <Section title="Add another person">
          <TextInput
            accessibilityLabel="Name"
            placeholder="Name"
            value={draftProfile.name}
            onChangeText={(name) => setDraftProfile((profile) => ({ ...profile, name }))}
            style={styles.input}
          />
          <Text style={styles.fieldLabel}>Interests</Text>
          <InterestPicker
            selectedInterests={draftProfile.interests}
            onToggle={(interest) =>
              setDraftProfile((profile) => ({
                ...profile,
                interests: toggleItem(profile.interests, interest),
              }))
            }
          />
          <TextInput
            accessibilityLabel="Availability"
            placeholder="Availability, e.g. Saturday 1-8 PM"
            value={draftProfile.availability}
            onChangeText={(availability) =>
              setDraftProfile((profile) => ({ ...profile, availability }))
            }
            style={styles.input}
          />
          <TextInput
            accessibilityLabel="Location"
            placeholder="Location, e.g. Nashville, TN"
            value={draftProfile.location}
            onChangeText={(location) =>
              setDraftProfile((profile) => ({ ...profile, location }))
            }
            style={styles.input}
          />
          <View style={styles.row}>
            <NumberInput
              label="Budget"
              prefix="$"
              value={draftProfile.budget}
              onChange={(budget) =>
                setDraftProfile((profile) => ({ ...profile, budget }))
              }
            />
            <NumberInput
              label="Drive radius"
              suffix=" mi"
              value={draftProfile.radius}
              onChange={(radius) =>
                setDraftProfile((profile) => ({ ...profile, radius }))
              }
            />
          </View>
          <TextInput
            accessibilityLabel="Food preferences"
            placeholder="Food preferences"
            value={draftProfile.foodPreferences}
            onChangeText={(foodPreferences) =>
              setDraftProfile((profile) => ({ ...profile, foodPreferences }))
            }
            style={styles.input}
          />
          <Pressable style={styles.primaryButton} onPress={saveProfile}>
            <Text style={styles.primaryButtonText}>Save survey profile</Text>
          </Pressable>
        </Section>

        <Section title="3. Pick from three itineraries">
          {selectedProfiles.length === 0 ? (
            <Text style={styles.helperText}>
              Select at least one profile above to generate itinerary ideas.
            </Text>
          ) : (
            itineraries.map((itinerary, index) => (
              <ItineraryCard
                key={itinerary.title}
                itinerary={itinerary}
                index={index}
              />
            ))
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ProfileCard({
  profile,
  selected,
  onPress,
}: {
  profile: Profile;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.profileCard, selected && styles.profileCardSelected]}
    >
      <View style={styles.profileHeader}>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={[styles.selectionPill, selected && styles.selectionPillActive]}>
          {selected ? "Included" : "Tap to include"}
        </Text>
      </View>
      <Text style={styles.profileMeta}>
        {profile.location} • {profile.availability}
      </Text>
      <Text style={styles.profileMeta}>
        ${profile.budget} budget • {profile.radius} mi radius
      </Text>
      <View style={styles.chipRow}>
        {profile.interests.map((interest) => (
          <View key={interest} style={styles.smallChip}>
            <Text style={styles.smallChipText}>{formatInterest(interest)}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.foodText}>Food: {profile.foodPreferences}</Text>
    </Pressable>
  );
}

function InterestPicker({
  selectedInterests,
  onToggle,
}: {
  selectedInterests: ActivityType[];
  onToggle: (interest: ActivityType) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {ACTIVITY_OPTIONS.map((interest) => {
        const selected = selectedInterests.includes(interest);
        return (
          <Pressable
            key={interest}
            onPress={() => onToggle(interest)}
            style={[styles.interestChip, selected && styles.interestChipSelected]}
          >
            <Text
              style={[
                styles.interestChipText,
                selected && styles.interestChipTextSelected,
              ]}
            >
              {formatInterest(interest)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <View style={styles.numberInputGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType="numeric"
        value={`${value}`}
        onChangeText={(text) => onChange(Number.parseInt(text, 10) || 0)}
        style={styles.input}
      />
      <Text style={styles.inputHint}>
        {prefix}
        {value}
        {suffix}
      </Text>
    </View>
  );
}

function ItineraryCard({
  itinerary,
  index,
}: {
  itinerary: Itinerary;
  index: number;
}) {
  return (
    <View style={styles.itineraryCard}>
      <Text style={styles.itineraryNumber}>Option {index + 1}</Text>
      <Text style={styles.itineraryTitle}>{itinerary.title}</Text>
      <Text style={styles.reason}>{itinerary.reason}</Text>
      <View style={styles.noteRow}>
        <Text style={styles.note}>{itinerary.budgetNote}</Text>
        <Text style={styles.note}>{itinerary.distanceNote}</Text>
      </View>
      {itinerary.stops.map((stop, stopIndex) => (
        <View key={stop} style={styles.stopRow}>
          <Text style={styles.stopIndex}>{stopIndex + 1}</Text>
          <Text style={styles.stopText}>{stop}</Text>
        </View>
      ))}
    </View>
  );
}

function buildItineraries(profiles: Profile[], planMode: PlanMode): Itinerary[] {
  if (profiles.length === 0) {
    return [];
  }

  const budget = Math.min(...profiles.map((profile) => profile.budget));
  const radius = Math.min(...profiles.map((profile) => profile.radius));
  const location = mostSpecificLocation(profiles);
  const availability = mergeAvailability(profiles);
  const sharedInterests = getRankedInterests(profiles);
  const preferredVenues = SAMPLE_VENUES.filter(
    (venue) =>
      venue.mood.includes(planMode) &&
      venue.distanceMiles <= Math.max(radius, 1) &&
      venue.cost <= Math.max(budget, 1),
  ).sort((a, b) => scoreVenue(b, sharedInterests) - scoreVenue(a, sharedInterests));

  const foodStops = preferredVenues.filter((venue) => venue.type === "eateries");
  const activityStops = preferredVenues.filter((venue) => venue.type !== "eateries");
  const fallbackFood = foodStops[0] ?? SAMPLE_VENUES.find((venue) => venue.type === "eateries");

  return [0, 1, 2].map((offset) => {
    const firstActivity =
      activityStops[offset % Math.max(activityStops.length, 1)] ??
      SAMPLE_VENUES[offset % SAMPLE_VENUES.length];
    const secondActivity =
      activityStops[(offset + 2) % Math.max(activityStops.length, 1)] ??
      SAMPLE_VENUES[(offset + 2) % SAMPLE_VENUES.length];
    const food = foodStops[offset % Math.max(foodStops.length, 1)] ?? fallbackFood;
    const stops = compact([
      `${availability}: meet near ${location} and start with ${firstActivity.title}, a ${firstActivity.description}.`,
      food
        ? `Grab food at ${food.title}; it matches preferences like ${foodPreferenceSummary(
            profiles,
          )}.`
        : undefined,
      `Add ${secondActivity.title} for ${secondActivity.durationMinutes} minutes of ${secondActivity.description}.`,
      planMode === "date"
        ? "End with a quick check-in: each person picks what they would repeat next time."
        : "Save the favorite stop so Wonder can tune the next plan.",
    ]);

    const totalCost = compact([firstActivity, food, secondActivity]).reduce(
      (sum, venue) => sum + venue.cost,
      0,
    );
    const maxDistance = Math.max(
      firstActivity.distanceMiles,
      food?.distanceMiles ?? 0,
      secondActivity.distanceMiles,
    );

    return {
      title: itineraryTitle(planMode, offset, firstActivity, food),
      budgetNote: `$${totalCost} estimated total per person`,
      distanceNote: `${maxDistance} mi max drive`,
      reason: reasonText(profiles, sharedInterests, planMode),
      stops,
    };
  });
}

function scoreVenue(venue: Venue, rankedInterests: ActivityType[]) {
  const interestScore = rankedInterests.includes(venue.type)
    ? rankedInterests.length - rankedInterests.indexOf(venue.type)
    : 0;
  const foodBoost = venue.type === "eateries" ? 1 : 0;

  return interestScore * 3 + foodBoost - venue.distanceMiles / 10 - venue.cost / 100;
}

function getRankedInterests(profiles: Profile[]) {
  const counts = ACTIVITY_OPTIONS.map((interest) => ({
    interest,
    count: profiles.filter((profile) => profile.interests.includes(interest)).length,
  }));

  return counts
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count)
    .map(({ interest }) => interest);
}

function mergeAvailability(profiles: Profile[]) {
  const availability = profiles.map((profile) => profile.availability).filter(Boolean);
  return availability.length ? availability.join(" + ") : "Flexible time";
}

function mostSpecificLocation(profiles: Profile[]) {
  const location = profiles.find((profile) => profile.location.trim().length > 0)?.location;
  return location ?? "your area";
}

function reasonText(
  profiles: Profile[],
  sharedInterests: ActivityType[],
  planMode: PlanMode,
) {
  const names = profiles.map((profile) => profile.name).join(", ");
  const interests = sharedInterests.slice(0, 3).map(formatInterest).join(", ");
  const modeCopy =
    planMode === "solo"
      ? "a solo reset"
      : planMode === "friends"
        ? "a friend hang"
        : "a date";

  return `Built for ${modeCopy} with ${names}; prioritizes ${interests || "food and flexible activities"}.`;
}

function itineraryTitle(
  planMode: PlanMode,
  offset: number,
  activity: Venue,
  food?: Venue,
) {
  const themes = {
    solo: ["Reset", "Explore", "Treat Yourself"],
    friends: ["Group Energy", "Easy Yes", "Adventure"],
    date: ["Shared Spark", "Cozy Chemistry", "Playful Night"],
  };
  const foodCopy = food ? ` + ${food.title}` : "";

  return `${themes[planMode][offset]}: ${activity.title}${foodCopy}`;
}

function foodPreferenceSummary(profiles: Profile[]) {
  return profiles
    .map((profile) => profile.foodPreferences)
    .filter(Boolean)
    .join("; ");
}

function compact<T>(items: Array<T | undefined | null>) {
  return items.filter((item): item is T => item != null);
}

function toggleItem<T>(items: T[], item: T) {
  return items.includes(item)
    ? items.filter((currentItem) => currentItem !== item)
    : [...items, item];
}

function formatInterest(interest: ActivityType) {
  return interest.charAt(0).toUpperCase() + interest.slice(1);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff7ed",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: "#251605",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },
  eyebrow: {
    color: "#fbbf24",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 38,
    marginTop: 10,
  },
  subtitle: {
    color: "#fed7aa",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#451a03",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionTitle: {
    color: "#251605",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 12,
  },
  helperText: {
    color: "#6b4e35",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#ffedd5",
    borderRadius: 18,
    padding: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: "#ea580c",
  },
  segmentText: {
    color: "#9a3412",
    fontSize: 14,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#ffffff",
  },
  profileCard: {
    borderColor: "#fed7aa",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fffaf5",
  },
  profileCardSelected: {
    borderColor: "#ea580c",
    backgroundColor: "#fff7ed",
  },
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  profileName: {
    color: "#251605",
    fontSize: 18,
    fontWeight: "800",
  },
  selectionPill: {
    color: "#9a3412",
    fontSize: 12,
    fontWeight: "700",
  },
  selectionPillActive: {
    color: "#16a34a",
  },
  profileMeta: {
    color: "#6b4e35",
    fontSize: 13,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  smallChip: {
    backgroundColor: "#ffedd5",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  smallChipText: {
    color: "#9a3412",
    fontSize: 12,
    fontWeight: "700",
  },
  foodText: {
    color: "#6b4e35",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fffaf5",
    borderColor: "#fed7aa",
    borderWidth: 1,
    borderRadius: 14,
    color: "#251605",
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fieldLabel: {
    color: "#251605",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  interestChip: {
    borderColor: "#fed7aa",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  interestChipSelected: {
    backgroundColor: "#ea580c",
    borderColor: "#ea580c",
  },
  interestChipText: {
    color: "#9a3412",
    fontSize: 13,
    fontWeight: "700",
  },
  interestChipTextSelected: {
    color: "#ffffff",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  numberInputGroup: {
    flex: 1,
  },
  inputHint: {
    color: "#9a3412",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: -8,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#251605",
    borderRadius: 16,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  itineraryCard: {
    backgroundColor: "#251605",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  itineraryNumber: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  itineraryTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 27,
    marginTop: 6,
  },
  reason: {
    color: "#fed7aa",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  noteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  note: {
    backgroundColor: "#431407",
    borderRadius: 999,
    color: "#ffedd5",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stopRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  stopIndex: {
    backgroundColor: "#ea580c",
    borderRadius: 999,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    height: 24,
    lineHeight: 24,
    textAlign: "center",
    width: 24,
  },
  stopText: {
    color: "#fff7ed",
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

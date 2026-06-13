# ✨ Wonder — Your Personal Outing Planner

Wonder is a React Native (Expo) mobile app that generates **3 personalized itineraries** for any outing — solo adventures, friend hangouts, or romantic dates. Answer a quick survey, set your location and budget, and get a full day plan with activities, food, and timing tailored to you.

---

## Features

- **Three outing modes:** Solo, Friends, Date
- **Interest survey** on signup — each user builds their own taste profile
- **Full itinerary generation** — 3 distinct plans with stops, timings, costs, and tips
- **Radius control** — limit suggestions to how far you're willing to drive
- **Budget selector** — Free → Luxury
- **Partner blending** — in Date mode, blend your partner's interests into the plan
- **Activity types** — hikes, concerts, museums, sports events, eateries, tours, arcades, and more
- **Edit interests anytime** from your profile
- **Dietary preferences** respected in all food suggestions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Framework | React Native (Expo SDK 56) |
| Navigation | Expo Router v5 |
| Authentication | Firebase Auth |
| Database | Firebase Firestore |
| AI Planner | OpenAI GPT-4o |
| State | Zustand |
| UI | Custom components + Expo Linear Gradient |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo`)
- [Expo Go](https://expo.dev/go) on your phone (for testing)

### Setup

1. **Clone and install**

```bash
cd wonder
npm install
```

2. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with:

- **OpenAI API Key** — from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Firebase config** — from [console.firebase.google.com](https://console.firebase.google.com):
  1. Create a new project
  2. Enable **Authentication → Email/Password**
  3. Enable **Firestore Database** (start in test mode for dev)
  4. Add a **Web App** to get your config values

3. **Run the app**

```bash
npm start
```

Scan the QR code with Expo Go on your phone.

---

## App Flow

```
Sign Up → Interest Survey → Home
                                ↓
                    Pick outing type (Solo / Friends / Date)
                                ↓
                    Set location, date, time, budget, radius
                                ↓
                    ✨ AI generates 3 itineraries
                                ↓
                    Tap any plan to see full itinerary
```

---

## Firestore Structure

```
users/
  {uid}/
    uid: string
    email: string
    displayName: string
    interests:
      categories: string[]
      dietaryPreferences: string[]
      favoriteVibe: string[]
      avoidCategories: string[]
    onboardingComplete: boolean
    createdAt: number
```

---

## Project Structure

```
wonder/
├── app/
│   ├── _layout.tsx          # Root layout, auth listener
│   ├── index.tsx            # Redirect to login
│   ├── (auth)/
│   │   ├── login.tsx        # Sign in screen
│   │   └── signup.tsx       # Create account screen
│   ├── (onboarding)/
│   │   └── interests.tsx    # 4-step interest survey
│   └── (app)/
│       ├── index.tsx        # Home — outing type selection
│       ├── generate.tsx     # Plan creation form
│       ├── results.tsx      # 3 itinerary cards + detail modal
│       └── profile.tsx      # User profile + edit interests
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Chip.tsx
├── services/
│   ├── firebase.ts          # Auth + Firestore operations
│   └── openai.ts            # GPT-4o itinerary generation
├── store/
│   └── index.ts             # Zustand global state
├── types/
│   └── index.ts             # TypeScript types
└── constants/
    └── index.ts             # Colors, categories, options
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI API key for itinerary generation |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

---

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

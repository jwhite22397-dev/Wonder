# Wonder

Wonder is a mobile app that generates personalized outing itineraries — complete with food stops and activities — based on your interests, availability, location, budget, and how far you're willing to drive.

Whether you're planning a solo adventure, a friends hangout, or a date night, Wonder surveys each person individually and blends everyone's preferences into **3 tailored itinerary options** to pick from.

## Features

- **Individual accounts** with interest surveys at sign-up (activities, food, dietary needs, energy level)
- **Three plan modes**: Solo, Friends, and Date
- **Partner linking** — connect with other Wonder users so date/friend plans reflect everyone's tastes
- **Smart itinerary generation** — hikes, concerts, museums, tours, eateries, and more
- **Customizable per outing**: date, time, duration, budget, drive radius, food/activity toggles
- **Location-aware** — uses GPS or manual area entry, respects your drive radius
- **Plan history** — revisit and select from past generated itineraries

## Tech Stack

- [Expo](https://expo.dev) (React Native) with TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- AsyncStorage for local persistence (MVP — ready to swap for a backend)

## Getting Started

```bash
npm install
npm start
```

Then scan the QR code with **Expo Go** on your phone, or press `i` for iOS simulator / `a` for Android emulator.

### Demo flow

1. **Sign up** and complete the interest survey
2. Create a second account on another device/simulator for date/friend linking
3. From **Home**, pick Solo, Friends, or Date
4. Set when, where, budget, and radius
5. Get **3 itinerary options** with a full timeline of stops

## Project Structure

```
app/                  # Screens (Expo Router)
  (auth)/             # Login & signup
  (onboarding)/       # Interest survey
  (tabs)/             # Home, Plans history, Profile
  plan/               # Create plan wizard & results
components/           # Shared UI components
context/              # Auth state
lib/                  # Storage, recommendation engine, venue data
constants/            # Theme & survey options
```

## Roadmap

- Backend API with real venue/event data (Google Places, Eventbrite, Yelp)
- Push notifications for plan reminders
- Share itineraries with partners via link
- Calendar integration

## License

MIT

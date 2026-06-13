# Wonder

Wonder is an Expo/React Native mobile app that helps people pick what to do
and what to eat. It supports solo plans, friend hangs, and romantic dates by
combining quick survey profiles with availability, location, budget, and drive
radius constraints.

## What it does

- Captures individual account-style survey profiles during sign-up.
- Tracks interests such as hikes, sports, concerts, museums, eateries, tours,
  coffee, markets, games, and wellness.
- Lets users choose whether they are planning solo, with friends, or for a date.
- Includes availability, location, food preferences, per-person budget, and
  maximum drive radius in the itinerary logic.
- Produces three itinerary options that can combine food and activities.

The current implementation uses an in-app sample venue catalog so the planning
experience can run immediately. A production version can replace that catalog
with live events, maps, reservations, and restaurant APIs.

## Run locally

```bash
npm install
npm run start
```

Then open the project in Expo Go or an emulator.

## Useful commands

```bash
npm run typecheck
npm test
```

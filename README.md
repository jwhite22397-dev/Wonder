# 🧭 Wonder

**Stop wondering what to do.** Wonder is a mobile-first app that turns a quick survey of
your interests, availability, location, and budget into **three ready-to-go itineraries**
to pick from — blending food *and* activities into a real plan for the day or night.

It works for three different occasions:

- 🧘 **Solo** — treat yourself to a plan just for you.
- 👯 **Friends** — blend the whole crew's tastes into one hangout.
- 💕 **Date** — merge you and your partner's interests into something special for two.

Each plan is a full **itinerary** — an ordered timeline of stops (eateries, hikes, concerts,
museums, sports, tours, arcades, spas, and more) with times, per-person costs, travel
distances, "why we picked this" reasons, and one-tap Google Maps directions.

---

## ✨ Features

- **Individual accounts with interest surveys.** On sign-up, each person rates what they
  love across food and activities, sets their vibe (relaxed↔adventurous, intimate↔lively,
  familiar↔novel), and notes dietary needs. Plans are tailored to those profiles.
- **Account linking.** Connect with friends and your partner via a 6-character invite code.
  Date and Friends plans **blend everyone's surveys** so the itinerary works for the whole group.
- **Three modes** — Solo, Friends, Date — that change which venues are favored
  (e.g. romantic/intimate for dates, lively/group-friendly for friends, easy solo spots when alone).
- **Drive radius.** Choose exactly how far you're willing to travel (1–100 miles).
- **Budget aware.** Set a per-person budget; itineraries are built to stay within it.
- **Availability aware.** Pick a date and a time window; Wonder fills the time with the right
  meals (breakfast/lunch/dinner/dessert/drinks) and activities, in chronological order with travel time.
- **Food and/or activities.** Toggle either or both.
- **3 distinct itineraries** every time — *The Crowd-Pleaser*, *The Adventure*, and *The Cozy One* —
  so you always have choices.
- **Save & revisit** your chosen plans, with directions ready in Maps.
- **Installable PWA** — add it to your phone's home screen and it behaves like a native app.

---

## 🏗️ Architecture

A small monorepo with two workspaces:

```
wonder/
├── server/                 # Node.js + Express + SQLite API
│   └── src/
│       ├── index.js        # API server (also serves the built client)
│       ├── db.js           # SQLite schema (users, connections, plans)
│       ├── auth.js         # JWT auth + middleware
│       ├── routes/         # auth, survey, connections, plans
│       ├── data/
│       │   ├── taxonomy.js # interest taxonomy (single source of truth)
│       │   └── venues.js   # location-agnostic venue/activity catalog
│       └── engine/         # the itinerary generator
│           ├── geo.js      # distance + deterministic placement
│           ├── scoring.js  # how well a venue fits a group/mode/vibe/budget
│           └── itinerary.js# assembles 3 timed, budgeted itineraries
└── client/                 # React + Vite + TypeScript PWA (mobile-first)
    └── src/
        ├── pages/          # Welcome, Survey, Home, Results, PlanDetail, Saved, Friends, Profile
        ├── components/     # UI primitives + itinerary timeline
        └── lib/            # API client + auth context
```

### How the itinerary engine works

Because Wonder shouldn't depend on a paid maps/events API to be useful, the venue catalog in
[`server/src/data/venues.js`](server/src/data/venues.js) is **location-agnostic**: each entry is a
tagged template (cuisine/activity tags, price level, typical duration, mode suitability, energy,
how romantic, indoor/outdoor, day-parts, dietary info). At request time the engine deterministically
**places** each template within your search radius, then:

1. **Filters** by radius, category toggles, day-part availability, and dietary constraints.
2. **Scores** every venue against the *merged* group profile — interest match (mutual enjoyment
   matters more for groups), mode suitability, vibe alignment, romance (for dates), distance, and budget fit.
3. **Assembles** a chronological timeline, inserting the right meals for the time of day and filling
   gaps with activities, tracking running cost and travel time.
4. Produces **three diversified variants** (balanced / high-energy / relaxed) that avoid reusing the same spots.

> 🔌 **Real venue data is built in via Google Places** (see below). The catalog above is the
> automatic fallback used when no API key is configured, so the app always works.

### Real places via Google Places API (New)

Wonder ships with a pluggable provider ([`server/src/engine/providers/google.js`](server/src/engine/providers/google.js)):

- **With a key** (`GOOGLE_MAPS_API_KEY`), each plan request does a few **Nearby Search (New)**
  calls around the user's location/radius, maps the results (cuisine/type → interest tags, price
  level, ratings, etc.) into the engine's venue shape, and uses **real businesses**. Results are
  cached per location for 6 hours to limit API cost.
- **Without a key**, it transparently falls back to the demo catalog. If a live call fails, it also
  falls back — a plan is never empty.

The Results screen shows a badge (📍 *Real places near you* vs 🧪 *Demo places*) so you always know
which source produced a plan.

**To enable it:**

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project, enable
   **Places API (New)**, enable billing, and create an **API key** (restrict it to the Places API).
2. Set it as an environment variable wherever the server runs:
   - Local: `GOOGLE_MAPS_API_KEY=your_key npm start`
   - Render: add `GOOGLE_MAPS_API_KEY` in the service's **Environment** tab (the included
     `render.yaml` already declares it), then redeploy.
3. That's it — new plans will use live nearby venues.

---

## 🚀 Getting started

Requirements: **Node.js 20+**.

```bash
# from the repo root
npm install

# (optional) seed two connected demo accounts to try Date/Friends mode instantly
npm --workspace server run seed
#   alex@example.com / password123
#   sam@example.com  / password123   (connected as partners, based in San Francisco)

# run API (:4000) and client dev server (:5173) together
npm run dev
```

Then open **http://localhost:5173** (the dev server proxies `/api` to the backend).

### Production build

```bash
npm run build      # builds the client into client/dist
npm start          # the API server also serves the built client at :4000
```

Open **http://localhost:4000** and "Add to Home Screen" to install it as an app.

### Deploy & install on your phone (no terminal needed)

Wonder is a PWA, so you install it by opening it at a public HTTPS URL and tapping
**Add to Home screen** — no `.apk` required. A `render.yaml` blueprint is included so you
can deploy entirely from a phone browser:

1. Go to **[dashboard.render.com](https://dashboard.render.com)** and sign in with GitHub.
2. **New + → Blueprint**, pick this repo, choose the branch, and **Apply**. Render reads
   `render.yaml`, installs, builds, and starts the app (one web service serving API + UI).
3. When it's live, open the `…onrender.com` URL in **Chrome** → **⋮ → Install app /
   Add to Home screen**. Sign up in the app and start planning.

Notes: Render's free tier sleeps after inactivity (first load may take ~30–60s to wake), and
its filesystem is ephemeral — for durable accounts/plans add a persistent disk or an external
database. To remove the browser address bar (full TWA), serve the `assetlinks.json` from a
generated Android package; not needed just to test.

### Configuration

The server reads these optional environment variables:

| Variable     | Default                  | Purpose                          |
| ------------ | ------------------------ | -------------------------------- |
| `PORT`                | `4000`                  | API / static server port               |
| `JWT_SECRET`          | `wonder-dev-secret-…`   | Set a strong secret in production       |
| `DB_PATH`             | `server/data/wonder.db` | SQLite database file location           |
| `GOOGLE_MAPS_API_KEY` | _(unset)_               | Enables real venues via Places API (New) |

---

## 🧪 Tech notes

- Auth uses JWTs (30-day expiry) stored in `localStorage`; passwords hashed with bcrypt.
- Data persists in a local SQLite file (`better-sqlite3`) — no external DB to set up.
- The client is a single-page PWA with an offline app-shell via `vite-plugin-pwa`.
- The repo uses `legacy-peer-deps=true` (see `.npmrc`) to keep the Vite/plugin peer tree happy under npm workspaces.

Plan less, do more. 💫

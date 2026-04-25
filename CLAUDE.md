# Race Cockpit — Complete Project Brief

## What is this project
A real-time web dashboard for a **running coach** monitoring an athlete during a half marathon or marathon. The coach has an iPad with the live dashboard. The athlete has a Garmin watch with LiveTrack enabled.

---

## Product Vision

### Three parts of the app

#### 1. Pre-race setup (`/setup`)
- Race plan: route, target time, negative/positive split
- Fuel plan: gels by km or time intervals (flexible)
- Checklist: sleep, hydration, nutrition, weather
- Morning recommendations based on weather and wearable data
- Input field for Garmin LiveTrack URL

#### 2. Live race dashboard (`/dashboard`) — PRIMARY MVP
Coach iPad view with:
- **Status bar** at top: overall race status (ok/warning/danger) + specific recommendation what to tell the athlete
- **4 metric cards**: pace vs plan, HR (zone), cadence, finish prediction — each with action label (v pohodě / hlídat / zrychlit / ubrat)
- **GPS map**: live athlete position on route
- **Pace chart**: bar chart of pace per km vs plan
- **Fuel plan**: gel timeline with status (done/next/upcoming) + alert when to prepare next gel
- **Split times**: comparison vs planned splits
- **Extra metrics**: vertical oscillation, ground contact time, elevation/temperature
- **Data status**: Garmin connection status, last update time

#### 3. Runner alerts (future)
- Push notifications to Garmin: gels, pace corrections
- Out of scope for MVP

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui |
| Charts | Recharts |
| Deployment | Vercel (free tier) |
| Data — Phase 1 | Mock data with simulated live updates |
| Data — Phase 2 | Garmin LiveTrack scraping |
| Data — Phase 3 | Garmin Health API (if approved) |

---

## Current Project State (as of April 25, 2026)

- [x] Design mockup completed
- [x] Architecture decided
- [x] TypeScript types specified
- [x] Next.js project initialized (Next.js 16 / React 19)
- [x] Full frontend dashboard built with all components
- [x] Mock data engine with 5-second live simulation
- [x] Czech-language coaching recommendations
- [x] Dark theme responsive layout
- [x] Deployed on Vercel
- [ ] Garmin LiveTrack API route (`/api/garmin`)
- [ ] LiveTrack URL input in dashboard
- [ ] Pre-race setup page (`/setup`)
- [ ] README updated to reflect actual project

---

## File Structure

```
src/
  app/
    page.tsx                  ← redirect to /dashboard
    dashboard/
      page.tsx                ← coach live dashboard
    setup/
      page.tsx                ← pre-race setup (TODO)
    api/
      garmin/
        route.ts              ← Garmin LiveTrack polling (TODO)
    layout.tsx
  components/
    dashboard/
      StatusBar.tsx           ← race status + recommendation for athlete
      MetricCard.tsx          ← single metric with action label
      MetricGrid.tsx          ← row of 4 metric cards
      PaceChart.tsx           ← bar chart km vs plan
      MapBox.tsx              ← GPS map (SVG placeholder → real coords)
      FuelPlan.tsx            ← gel timeline + alerts
      SplitTimes.tsx          ← split times vs plan
      ExtraMetrics.tsx        ← cadence, oscillation, ground contact
      DataSources.tsx         ← Garmin connection status
    setup/
      RacePlanForm.tsx        ← (TODO)
      FuelPlanForm.tsx        ← (TODO)
      PreRaceChecklist.tsx    ← (TODO)
  lib/
    types.ts                  ← TypeScript interfaces
    mockData.ts               ← realistic mock data
    raceLogic.ts              ← calculation logic
  hooks/
    useRaceData.ts            ← hook: mock now → LiveTrack later
```

---

## TypeScript Types (`types.ts`)

```typescript
export type RaceStatus = {
  level: 'ok' | 'warning' | 'danger'
  title: string
  recommendation: string  // what to tell the athlete
}

export type ActionLabel = {
  text: string   // "v pohodě" | "hlídat" | "zrychlit" | "ubrat" | "v pořádku"
  type: 'ok' | 'warn' | 'bad' | 'info'
}

export type FuelItem = {
  id: string
  name: string
  type: string
  km: number
  status: 'done' | 'next' | 'upcoming'
  kmAway?: number
}

export type KmSplit = {
  km: number
  actual?: number   // seconds per km, undefined = not yet reached
  planned: number
}

export type ExtraMetrics = {
  verticalOscillation: number  // cm
  groundContact: number        // ms
  elevationGain: number        // m
  temperature: number          // °C
}

export type DataStatus = {
  garminLiveTrack: 'online' | 'offline' | 'connecting'
  heartRate: 'online' | 'offline'
  lastGpsSync: Date
}

export type RaceData = {
  pace: number              // seconds per km (current)
  plannedPace: number       // seconds per km (plan)
  heartRate: number         // bpm
  maxHeartRate: number
  hrZone: 1 | 2 | 3 | 4 | 5
  cadence: number           // spm
  distance: number          // km completed
  totalDistance: number     // km total (21.1 for half marathon)
  prediction: number        // finish prediction in seconds
  plannedFinish: number     // planned finish time in seconds
  kmSplits: KmSplit[]
  fuelPlan: FuelItem[]
  extraMetrics: ExtraMetrics
  dataStatus: DataStatus
  raceStatus: RaceStatus
  timestamp: Date
}
```

---

## Calculation Logic (`raceLogic.ts`)

### `getActionLabel(metric, data): ActionLabel`

**Pace:**
- `ok` — within 5s of plan
- `warn` — 5–15s faster than plan (too fast)
- `bad` — 15s+ faster or behind plan

**Heart rate:**
- `ok` — zone 1–3
- `warn` — zone 4 (monitor)
- `bad` — zone 5 (too high)

**Cadence:**
- `ok` — 170–185 spm
- `warn` — outside this range

**Prediction:**
- `info` — show delta vs planned finish (+ or −)

### `getRaceStatus(data): RaceStatus`
```
danger:  HR zone 5  OR pace 20s+ behind plan
warning: HR zone 4  OR pace 10–20s off plan
ok:      HR ≤ zone 3 AND pace within 10s of plan
```

### `formatPace(seconds): string`
Convert seconds to "4:52" format

### `formatTime(seconds): string`
Convert seconds to "1:42:30" format

### `calcPrediction(distance, totalDistance, currentPace): number`
Simple prediction: remaining km × current pace

---

## Mock Data (`mockData.ts`)
Simulating km 13.4 of a half marathon:

```typescript
pace: 292,           // 4:52 /km
plannedPace: 295,    // 4:55 /km
heartRate: 162,
maxHeartRate: 178,
hrZone: 4,
cadence: 178,
distance: 13.4,
totalDistance: 21.1,
prediction: 6150,    // 1:42:30
plannedFinish: 6240, // 1:44:00
raceStatus: {
  level: 'warning',
  title: 'Mírně nad plánem tempa — HR stoupá do zóny 4',
  recommendation: 'Doporuč závodníkovi: zkus zpomalit o 5–8 s/km na km 14–16, udržíš energii do závěru'
},
fuelPlan: [
  { id: '1', name: 'Gel #1 — Isostar', km: 7.0, status: 'done' },
  { id: '2', name: 'Gel #2 — Caffeine', km: 14.0, status: 'next', kmAway: 0.6 },
  { id: '3', name: 'Gel #3 — Isostar', km: 19.0, status: 'upcoming' }
],
extraMetrics: {
  verticalOscillation: 8.2,
  groundContact: 228,
  elevationGain: 12,
  temperature: 14
}
```

### Live simulation in `useRaceData.ts`
```typescript
// Every 5 seconds add small random variations:
pace += Math.random() * 6 - 3           // ±3 seconds
heartRate += Math.round(Math.random() * 4 - 2)  // ±2 bpm
distance += 0.013                        // ~14m per 5s at pace 4:52

// TODO: replace with Garmin LiveTrack polling
```

---

## Design System

### Colors (dark theme)
```css
--bg-primary: #1a1a2e
--bg-panel: #16213e
--bg-map: #0f3460
--text-primary: #e2e8f0
--text-muted: #94a3b8
--text-hint: #64748b
--border: rgba(255,255,255,0.08)
--color-ok: #22c55e
--color-warn: #fbbf24
--color-bad: #ef4444
--color-info: #60a5fa
--color-runner: #3b82f6
```

### Layout (iPad landscape — 1024×768)
```
[TOP BAR: race name + LIVE badge + Simulated data badge]
[STATUS BAR: race status + recommendation text + level badge]
[METRIC GRID: 4 cards — pace | HR | cadence | prediction]
[LEFT COL: GPS map + pace chart] [RIGHT SIDEBAR: fuel + splits + extra + data status]
```

### Component conventions
- Each `MetricCard` receives: `label`, `value`, `unit`, `delta`, `actionLabel`
- `StatusBar` receives: `raceStatus: RaceStatus`
- Simulated data = "Simulated data" badge in top bar
- Dashboard refreshes every 5s via useRaceData hook
- UI language is Czech (athlete recommendations, labels, status messages)
- Designed for iPad landscape (1024×768)

---

## Garmin Integration Roadmap

### Phase 1 — MVP (DONE)
Mock data with simulated live updates.

### Phase 2 — LiveTrack scraping (NEXT)
```
Athlete starts LiveTrack on Garmin watch
→ Garmin generates a public URL (e.g. livetrack.garmin.com/session/XXXXX/token/XXXXX)
→ Coach pastes this URL into the dashboard before the race
→ Next.js API route (src/app/api/garmin/route.ts) polls this URL every 5s
→ We parse position + HR + pace from the response
→ useRaceData hook switches from mock data to real data
→ Dashboard shows "Live" badge instead of "Simulated data"
```

Implementation files needed:
- `src/app/api/garmin/route.ts` — server-side polling of LiveTrack URL
- Update `useRaceData.ts` — if LiveTrack URL set → fetch from API, else → mock data
- Add LiveTrack URL input to dashboard top bar (store in localStorage)

### Phase 3 — Garmin Health API
- Requires Garmin developer account approval
- URL: developer.garmin.com → Health API
- For historical data + advanced metrics

---

## What to build next

1. **Garmin LiveTrack API route** — `src/app/api/garmin/route.ts`
   - Accept a LiveTrack URL as query param
   - Fetch and parse the Garmin LiveTrack response
   - Return data in RaceData format

2. **LiveTrack URL input** — add to dashboard top bar
   - Simple text input for the coach to paste the URL
   - Save to localStorage so it persists on refresh
   - Show "Connecting..." status while fetching

3. **Update useRaceData hook**
   - If LiveTrack URL in localStorage → poll `/api/garmin` every 5s
   - If no URL → fall back to mock data simulation

4. **Pre-race setup page** — `src/app/setup/page.tsx`
   - Race plan form (target time, distance, split preference)
   - Fuel plan builder (add gels by km)
   - Pre-race checklist (sleep, hydration, nutrition, weather)

---

## Notes for Claude Code
- This is the owner's first project — prefer simplicity and readable code with comments
- Always explain what and why, not just how
- For each new feature check consistency with types in `types.ts`
- MapBox component — SVG placeholder only, do not install map libraries
- PaceChart — div-based bars, no charting library needed for MVP
- **Always commit directly to the `main` branch. Never create or push to a separate feature branch.**

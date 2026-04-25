Race Dashboard — Project Context for Claude Code
Co je tento projekt
Webová aplikace pro coache/trenéra ke sledování závodníka v reálném čase během běžeckého závodu (maratony, půlmaratony). Coach má iPad s live dashboardem, závodník má Garmin hodinky.
---
Vize produktu
Tři hlavní části aplikace
1. Pre-race setup (`/setup`)
Nastavení race plánu: trasa, cílový čas, negativní/pozitivní split
Fuel plán: gely podle km nebo časových intervalů (flexibilní)
Checklist: spánek, hydratace, výživa, počasí
Morning recommendations na základě počasí a dat z wearables
Napojení na Garmin LiveTrack URL
2. Live race dashboard (`/dashboard`) — PRIMÁRNÍ MVP
Coach iPad view se:
Status bar nahoře: celkový race status (ok/warning/danger) + konkrétní doporučení co říct závodníkovi
4 metric cards: tempo vs plán, HR (zóna), kadence, predikce cíle — každá s action labelem (v pohodě / hlídat / zrychlit / ubrat)
GPS mapa: live pozice závodníka na trase
Pace chart: sloupcový graf tempo po km vs plán
Fuel plán: timeline gelů se stavem (done/next/upcoming) + alert kdy připravit gel
Split časy: porovnání se záměrem
Další metriky: vertikální oscilace, ground contact time, výška/teplota
Data status: Garmin připojení, čas poslední aktualizace
3. Runner alerts (budoucnost)
Notifikace do Garminu: gely, tempo korekce
Zatím mimo scope MVP
---
Tech stack
Vrstva	Technologie
Framework	Next.js 14 (App Router)
Jazyk	TypeScript
Styling	Tailwind CSS
Komponenty	shadcn/ui
Deployment	Vercel (free tier)
Data — MVP	Mock data se simulovanými live updaty
Data — v2	Garmin LiveTrack scraping
Data — v3	Garmin Health API (pokud dostupné)
---
Struktura projektu
```
src/
  app/
    page.tsx                  ← redirect na /dashboard
    dashboard/
      page.tsx                ← coach live dashboard
    setup/
      page.tsx                ← pre-race setup
    layout.tsx
  components/
    dashboard/
      StatusBar.tsx           ← race status + doporučení pro závodníka
      MetricCard.tsx          ← jednotlivá metrika s action labelem
      MetricGrid.tsx          ← řada 4 metric cards
      PaceChart.tsx           ← sloupcový graf km vs plán
      MapBox.tsx              ← GPS mapa (SVG placeholder → real coords)
      FuelPlan.tsx            ← timeline gelů + alerty
      SplitTimes.tsx          ← split časy vs plán
      ExtraMetrics.tsx        ← kadence, oscilace, ground contact
      DataSources.tsx         ← status Garmin připojení
    setup/
      RacePlanForm.tsx
      FuelPlanForm.tsx
      PreRaceChecklist.tsx
  lib/
    types.ts                  ← TypeScript interfaces
    mockData.ts               ← realistická mock data
    raceLogic.ts              ← výpočetní logika
  hooks/
    useRaceData.ts            ← hook (mock → LiveTrack → API)
```
---
TypeScript typy (`types.ts`)
```typescript
type RaceStatus = {
  level: 'ok' | 'warning' | 'danger'
  title: string
  recommendation: string  // co říct závodníkovi
}

type ActionLabel = {
  text: string   // "v pohodě" | "hlídat" | "zrychlit" | "ubrat" | "v pořádku"
  type: 'ok' | 'warn' | 'bad' | 'info'
}

type FuelItem = {
  id: string
  name: string
  type: string
  km: number
  status: 'done' | 'next' | 'upcoming'
  kmAway?: number
}

type KmSplit = {
  km: number
  actual?: number   // sekundy na km, undefined = ještě neproběhlo
  planned: number
}

type ExtraMetrics = {
  verticalOscillation: number  // cm
  groundContact: number        // ms
  elevationGain: number        // m
  temperature: number          // °C
}

type DataStatus = {
  garminLiveTrack: 'online' | 'offline' | 'connecting'
  heartRate: 'online' | 'offline'
  lastGpsSync: Date
}

type RaceData = {
  pace: number              // sekundy na km (aktuální)
  plannedPace: number       // sekundy na km (plán)
  heartRate: number         // bpm
  maxHeartRate: number
  hrZone: 1 | 2 | 3 | 4 | 5
  cadence: number           // spm
  distance: number          // km uběhnuté
  totalDistance: number     // km celkem (21.1 pro půlmaraton)
  prediction: number        // predikce cíle v sekundách
  plannedFinish: number     // plánovaný čas cíle v sekundách
  kmSplits: KmSplit\[]
  fuelPlan: FuelItem\[]
  extraMetrics: ExtraMetrics
  dataStatus: DataStatus
  raceStatus: RaceStatus
  timestamp: Date
}
```
---
Výpočetní logika (`raceLogic.ts`)
`getActionLabel(metric, value, context): ActionLabel`
Tempo:
`ok` — v rámci 5s od plánu
`warn` — 5–15s rychleji než plán (pozor, moc rychle)
`bad` — 15s+ rychleji nebo za plánem
Heart rate:
`ok` — zóna 1–3
`warn` — zóna 4 (hlídat)
`bad` — zóna 5 (příliš vysoká)
Kadence:
`ok` — 170–185 spm
`warn` — mimo tento rozsah
Predikce:
`info` — zobrazit delta vs plánovaný čas (+ nebo −)
`getRaceStatus(data): RaceStatus`
```
danger:  HR zóna 5  NEBO tempo 20s+ za plánem
warning: HR zóna 4  NEBO tempo 10–20s off
ok:      HR ≤ zóna 3 A tempo do 10s od plánu
```
`formatPace(seconds): string`
Převod sekund na formát "4:52"
`calcPrediction(distance, totalDistance, currentPace): number`
Jednoduchá predikce: zbývající km × aktuální tempo
---
Mock data (`mockData.ts`)
Simulace km 13.4 z půlmaratonu:
```typescript
const mockRaceData: RaceData = {
  pace: 292,           // 4:52 /km
  plannedPace: 295,    // 4:55 /km
  heartRate: 162,
  maxHeartRate: 178,
  hrZone: 4,
  cadence: 178,
  distance: 13.4,
  totalDistance: 21.1,
  prediction: 6150,   // 1:42:30
  plannedFinish: 6240, // 1:44:00
  raceStatus: {
    level: 'warning',
    title: 'Mírně nad plánem tempa — HR stoupá do zóny 4',
    recommendation: 'Doporuč závodníkovi: zkus zpomalit o 5–8 s/km na km 14–16, udržíš energii do závěru'
  },
  fuelPlan: \[
    { id: '1', name: 'Gel #1 — Isostar', km: 7.0, status: 'done' },
    { id: '2', name: 'Gel #2 — Caffeine', km: 14.0, status: 'next', kmAway: 0.6 },
    { id: '3', name: 'Gel #3 — Isostar', km: 19.0, status: 'upcoming' }
  ],
  // ... splits, extraMetrics, dataStatus
}
```
Simulace live dat v `useRaceData.ts`
```typescript
// Každých 5 sekund přidat malé náhodné variace:
pace += Math.random() \* 6 - 3          // ±3 sekundy
heartRate += Math.round(Math.random() \* 4 - 2)  // ±2 bpm
distance += 0.013                       // \~14m za 5s při tempu 4:52

// TODO: replace with Garmin LiveTrack polling
```
---
Design systém
Barvy (dark theme)
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
Layout (iPad landscape — 1024×768)
```
\[TOP BAR: název závodu + live badge]
\[STATUS BAR: race status + recommendation + level badge]
\[METRIC GRID: 4 cards — tempo | HR | kadence | predikce]
\[LEFT COL: mapa + pace chart] \[RIGHT SIDEBAR: fuel + splits + extra + data status]
```
Konvence komponent
Každý `MetricCard` dostane: `label`, `value`, `unit`, `delta`, `actionLabel`
`StatusBar` dostane: `raceStatus: RaceStatus`
Simulovaná data = badge "Simulated data" v top baru
Dashboard se refreshuje každých 5s (useRaceData hook)
---
Garmin integrace (roadmapa)
Fáze 1 — MVP (teď)
Mock data se simulovanými live updaty.
Fáze 2 — LiveTrack scraping
```
Závodník zapne LiveTrack na Garminu
→ Garmin pošle URL (npr. share.garmin.com/XXXXX)
→ My tuto URL zadáme do setup stránky
→ Backend (Next.js API route) polluje tuto URL každých 5s
→ Parsujeme pozici + HR + tempo
→ Posíláme na dashboard přes Server-Sent Events nebo polling
```
Soubory: `src/app/api/garmin/route.ts`
Fáze 3 — Garmin Health API
Vyžaduje schválení Garmin developer účtu
URL: developer.garmin.com → Health API
Pro historická data + pokročilé metriky
---
Příkazy pro rychlý start
```bash
# Inicializace projektu
npx create-next-app@latest race-dashboard --typescript --tailwind --app --src-dir --import-alias "@/\*"
cd race-dashboard
npx shadcn@latest init

# Dev server
npm run dev
# → otevři localhost:3000

# Build
npm run build
```
---
Aktuální stav projektu
[x] Design mockup hotový (vizuální reference v kontextu)
[x] Architektura rozhodnutá
[x] Typy a logika specifikovaná
[ ] Next.js projekt inicializován
[ ] Komponenty vytvořeny
[ ] Mock data a live simulace
[ ] Garmin LiveTrack napojení
[ ] Pre-race setup stránka
[ ] Deploy na Vercel
---
Poznámky pro Claude Code
Toto je první projekt majitele — preferuj jednoduchost a čitelný kód s komentáři
Vždy vysvětli co a proč děláš, nejen jak
Při každé nové feature zkontroluj konzistenci s typy v `types.ts`
MapBox komponenta — zatím SVG placeholder, neinstaluj mapové knihovny
PaceChart — vlastní div-based bary, ne charting library (jednodušší pro MVP)

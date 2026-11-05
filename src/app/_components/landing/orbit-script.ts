/**
 * The orbit hero, as a pure function of how far you've scrolled through its pin. `progress` runs 0 → 1. Each ring
 * pulls its apps into the M over its own window, outer rings first, so your own five land last. Garmin and Strava
 * stop at `DOCK_PULL`, just outside the M, because they aren't connected yet. Scrolling back up runs it backwards.
 */

export type OrbitAppId =
  | "hevy"
  | "garmin"
  | "strava"
  | "sheets"
  | "ai"
  | "notion"
  | "excel"
  | "calendar"
  | "googlefit"
  | "nike"
  | "peloton";

export type OrbitApp = { id: OrbitAppId; name: string; ring: 0 | 1 | 2; angle: number; next?: true };

// Ring 0 is the setup this was built to replace. Angles are degrees, clockwise from three o'clock.
export const ORBIT_APPS: OrbitApp[] = [
  { id: "hevy", name: "Hevy", ring: 0, angle: -90 },
  { id: "garmin", name: "Garmin", ring: 0, angle: -18, next: true },
  { id: "strava", name: "Strava", ring: 0, angle: 54, next: true },
  { id: "sheets", name: "Google Sheets", ring: 0, angle: 126 },
  { id: "ai", name: "AI chat", ring: 0, angle: 198 },
  { id: "notion", name: "Notion", ring: 1, angle: -50 },
  { id: "calendar", name: "Google Calendar", ring: 1, angle: 70 },
  { id: "excel", name: "Excel", ring: 1, angle: 190 },
  { id: "googlefit", name: "Google Fit", ring: 2, angle: 10 },
  { id: "nike", name: "Nike Run Club", ring: 2, angle: 130 },
  { id: "peloton", name: "Peloton", ring: 2, angle: 250 },
];

export const DOCK_PULL = 0.55;

export type OrbitState = {
  /** 0 → 1 per app: how far from its ring toward the M. */
  pulls: Record<OrbitAppId, number>;
  /** Everything that's coming in has landed; the copy swaps to the one-place line. */
  merged: boolean;
  /** 0 → 1: the pink live glow on the M. */
  glow: number;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// Where each ring's first tile starts and finishes; each later tile on the ring runs STAGGER later.
const WINDOWS: Record<OrbitApp["ring"], [number, number]> = { 2: [0.05, 0.45], 1: [0.2, 0.6], 0: [0.4, 0.72] };
const STAGGER = 0.04;
const MERGED_AT = 0.9;
const GLOW_FROM = 0.85;

export function orbitStateAt(progress: number): OrbitState {
  const p = clamp01(progress);
  const seen: Record<number, number> = {};
  const pulls = {} as Record<OrbitAppId, number>;
  for (const app of ORBIT_APPS) {
    const index = (seen[app.ring] = (seen[app.ring] ?? -1) + 1);
    const [from, to] = WINDOWS[app.ring];
    const pull = easeInOut(clamp01((p - from - index * STAGGER) / (to - from)));
    pulls[app.id] = app.next ? Math.min(pull, DOCK_PULL) : pull;
  }
  return { pulls, merged: p >= MERGED_AT, glow: clamp01((p - GLOW_FROM) / (1 - GLOW_FROM)) };
}

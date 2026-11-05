/**
 * The apps that drift round the M in the hero: the tools an athlete juggles today. Each ring spreads its apps
 * evenly, so adding one is a one-line change. Angles are degrees, clockwise from three o'clock.
 */

export type OrbitAppId =
  | "hevy"
  | "garmin"
  | "strava"
  | "sheets"
  | "calendar"
  | "notion"
  | "nike"
  | "fitbit"
  | "coros"
  | "whoop"
  | "oura"
  | "samsunghealth"
  | "applefitness"
  | "applehealth";

export type OrbitApp = { id: OrbitAppId; name: string; ring: 0 | 1 | 2; angle: number };

// The owner's list, by ring. Ring 2 waits for the marks that aren't in Simple Icons (see PENDING_APPS).
const RINGS: [OrbitApp["ring"], number, [OrbitAppId, string][]][] = [
  [0, -90, [["hevy", "Hevy"], ["garmin", "Garmin"], ["strava", "Strava"], ["sheets", "Google Sheets"]]],
  [1, -45, [["calendar", "Google Calendar"], ["notion", "Notion"], ["nike", "Nike"], ["fitbit", "Fitbit"]]],
  [2, -70, []],
];

export const ORBIT_APPS: OrbitApp[] = RINGS.flatMap(([ring, offset, apps]) =>
  apps.map(([id, name], i) => ({ id, name, ring, angle: offset + (i * 360) / apps.length })),
);

/** On the owner's list, but out of the orbit until a usable official mark is sourced. */
export const PENDING_APPS: OrbitAppId[] = ["coros", "whoop", "oura", "samsunghealth", "applefitness", "applehealth"];

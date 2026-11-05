import { describe, expect, it } from "vitest";

import { ORBIT_APPS, PENDING_APPS } from "./orbit-apps";

describe("orbit apps", () => {
  it("shows the owner's list and nothing else", () => {
    const shown = ORBIT_APPS.map((a) => a.id);
    expect([...shown, ...PENDING_APPS].sort()).toEqual(
      [
        "applefitness",
        "applehealth",
        "calendar",
        "coros",
        "fitbit",
        "garmin",
        "hevy",
        "nike",
        "notion",
        "oura",
        "samsunghealth",
        "sheets",
        "strava",
        "whoop",
      ].sort(),
    );
    expect(new Set(shown).size).toBe(shown.length);
    for (const id of PENDING_APPS) expect(shown).not.toContain(id);
  });

  it("spreads each ring's apps evenly round it", () => {
    for (const ring of [0, 1, 2] as const) {
      const angles = ORBIT_APPS.filter((a) => a.ring === ring)
        .map((a) => a.angle)
        .sort((x, y) => x - y);
      const gaps = angles.map((a, i) => ((angles[(i + 1) % angles.length]! - a + 360) % 360) || 360);
      for (const g of gaps) expect(g).toBeCloseTo(360 / angles.length, 5);
    }
  });
});

import { describe, expect, it } from "vitest";

import { DOCK_PULL, ORBIT_APPS, orbitStateAt } from "./orbit-script";

const steps = Array.from({ length: 101 }, (_, i) => i / 100);
const ids = (pred: (a: (typeof ORBIT_APPS)[number]) => boolean) => ORBIT_APPS.filter(pred).map((a) => a.id);

describe("orbitStateAt", () => {
  it("leaves every app in its ring at the top", () => {
    const s = orbitStateAt(0);
    for (const a of ORBIT_APPS) expect(s.pulls[a.id]).toBe(0);
    expect(s.merged).toBe(false);
    expect(s.glow).toBe(0);
  });

  it("pulls every app home except the two that are next", () => {
    const s = orbitStateAt(1);
    expect(s.pulls.garmin).toBe(DOCK_PULL);
    expect(s.pulls.strava).toBe(DOCK_PULL);
    for (const id of ids((a) => !a.next)) expect(s.pulls[id], id).toBe(1);
    expect(s.merged).toBe(true);
    expect(s.glow).toBe(1);
  });

  it("lands the outer rings before your five", () => {
    const first = steps.find((p) => ids((a) => a.ring === 0).some((id) => orbitStateAt(p).pulls[id] > 0.5));
    expect(first).toBeDefined();
    const s = orbitStateAt(first!);
    for (const id of ids((a) => a.ring === 2)) expect(s.pulls[id], id).toBeGreaterThanOrEqual(0.9);
  });

  it("never pushes an app back out while you scroll down", () => {
    for (const a of ORBIT_APPS) {
      let last = -1;
      for (const p of steps) {
        const pull = orbitStateAt(p).pulls[a.id];
        expect(pull, `${a.id} at ${p}`).toBeGreaterThanOrEqual(last);
        last = pull;
      }
    }
  });

  it("swaps to the one-place copy only once everything has landed", () => {
    expect(orbitStateAt(0.85).merged).toBe(false);
    expect(orbitStateAt(0.92).merged).toBe(true);
    const s = orbitStateAt(0.9);
    for (const id of ids((a) => !a.next)) expect(s.pulls[id], id).toBe(1);
    expect(orbitStateAt(0.84).glow).toBe(0);
    expect(orbitStateAt(1).glow).toBe(1);
  });

  it("clamps and is a pure function of position", () => {
    expect(orbitStateAt(-1)).toEqual(orbitStateAt(0));
    expect(orbitStateAt(3)).toEqual(orbitStateAt(1));
    expect(orbitStateAt(0.37)).toEqual(orbitStateAt(0.37));
  });

  it("keeps Freddy's five on the inner ring", () => {
    expect(ids((a) => a.ring === 0).sort()).toEqual(["ai", "garmin", "hevy", "sheets", "strava"]);
    expect(ids((a) => a.next === true).sort()).toEqual(["garmin", "strava"]);
  });
});

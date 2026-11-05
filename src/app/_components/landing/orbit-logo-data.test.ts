import { describe, expect, it } from "vitest";

import { ORBIT_LOGOS } from "./orbit-logo-data";
import { ORBIT_APPS } from "./orbit-script";

describe("orbit logos", () => {
  it("has a logo for every app in the orbit", () => {
    for (const a of ORBIT_APPS) {
      expect(ORBIT_LOGOS[a.id], a.id).toBeDefined();
      expect(ORBIT_LOGOS[a.id].fill, a.id).toMatch(/^#[0-9a-f]{6}$/i);
      if (a.id !== "ai") expect(ORBIT_LOGOS[a.id].path?.length ?? 0, a.id).toBeGreaterThan(20);
    }
  });
});

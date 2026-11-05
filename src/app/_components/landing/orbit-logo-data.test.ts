import { describe, expect, it } from "vitest";

import { ORBIT_LOGOS } from "./orbit-logo-data";
import { ORBIT_APPS } from "./orbit-apps";

describe("orbit logos", () => {
  it("has a logo for every app in the orbit", () => {
    for (const a of ORBIT_APPS) {
      const logo = ORBIT_LOGOS[a.id];
      expect(logo, a.id).toBeDefined();
      expect(logo?.fill, a.id).toMatch(/^#[0-9a-f]{6}$/i);
      expect(logo?.path.length ?? 0, a.id).toBeGreaterThan(20);
    }
  });
});

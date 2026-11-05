import { DELOAD_FRACTION } from "~/engine/constants";
import { PROFICIENCY_TEMPLATE } from "~/domain/onboarding-template";
import type { ExperienceLevel } from "~/schema";

export interface ShapeWeek {
  /** 1-based week number. */
  week: number;
  /** This week's sets as a share of a hard week's (0–1). */
  scale: number;
  deload: boolean;
}

/**
 * The first block's shape, so the wizard can show it before it exists without a query. Onboarding leaves every
 * weekly target at its floor (MEV, or the MEV–MAV midpoint for beginners), so the engine's ramp is held flat:
 * every hard week plans the same sets and the deload plans about DELOAD_FRACTION of them. Sets only rise once
 * the weekly check-ins propose it. block-shape.test.ts holds this against the real generator. A shape, not a
 * set count.
 */
export function blockShape(proficiency: ExperienceLevel): ShapeWeek[] {
  const { blockLengthWeeks, deloadWeekIndex } = PROFICIENCY_TEMPLATE[proficiency];
  return Array.from({ length: blockLengthWeeks }, (_, i) => {
    const deload = i + 1 === deloadWeekIndex;
    return { week: i + 1, scale: deload ? DELOAD_FRACTION : 1, deload };
  });
}

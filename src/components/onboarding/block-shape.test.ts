import { describe, expect, it } from "vitest";
import { EXERCISE_LIBRARY } from "~/domain/exercise-library";
import { DEFAULT_LANDMARKS } from "~/domain/landmarks";
import { buildConstraintSetInput } from "~/domain/onboarding-template";
import { generateMesocycle, resolveConstraints } from "~/engine";
import type { ExperienceLevel, MuscleGroup, SplitType } from "~/schema";
import { blockShape } from "./block-shape";

// The wizard draws the block before it exists, so its shape must stay what the engine would generate.
function weeklySets(proficiency: ExperienceLevel, splitType: SplitType, days: number, priorityMuscles: MuscleGroup[]) {
  const input = buildConstraintSetInput({
    sex: "MALE",
    age: 30,
    heightCm: 180,
    weightKg: 80,
    daysPerWeek: days,
    sessionLengthCapMin: 120,
    splitType,
    proficiency,
    priorityMuscles,
    scheduleMode: "DAY",
    availability: [],
    timezone: "UTC",
  });
  const spec = resolveConstraints(input, { experienceLevel: proficiency, phase: "MAINTAIN", landmarks: DEFAULT_LANDMARKS });
  if (spec.kind !== "resolved") throw new Error("fixture should resolve");
  return generateMesocycle(spec, EXERCISE_LIBRARY, DEFAULT_LANDMARKS).weeks.map((w) => ({
    deload: w.isDeload,
    sets: w.sessions.reduce((n, s) => n + s.prescriptions.reduce((m, p) => m + p.sets, 0), 0),
  }));
}

const CASES = [
  ["BEGINNER", "FULL_BODY", 5, []],
  ["INTERMEDIATE", "UPPER_LOWER", 4, []],
  ["INTERMEDIATE", "PUSH_PULL_LEGS", 6, ["CHEST", "BACK"]],
  ["ADVANCED", "UPPER_LOWER", 5, ["QUADS", "SIDE_DELTS", "BICEPS"]],
] as const;

describe("blockShape", () => {
  it.each(CASES)("matches a generated %s %s block (%i days)", (p, split, days, priority) => {
    const shape = blockShape(p);
    const plan = weeklySets(p, split, days, [...priority]);
    expect(shape.map((w) => w.deload)).toEqual(plan.map((w) => w.deload));

    const hard = plan.filter((w) => !w.deload).map((w) => w.sets);
    const deload = plan.find((w) => w.deload)!.sets;
    // Every hard week plans the same sets, give or take rounding; the deload plans roughly the shape's share.
    expect((Math.max(...hard) - Math.min(...hard)) / Math.max(...hard), JSON.stringify(plan)).toBeLessThan(0.05);
    const share = shape.find((w) => w.deload)!.scale;
    expect(Math.abs(deload / hard[0]! - share)).toBeLessThan(0.1);
  });
});

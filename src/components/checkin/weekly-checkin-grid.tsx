"use client";

import { Button } from "~/components/ui-kit/app-shell-kit";
import type { MuscleGroup } from "~/schema";

export interface MuscleScore {
  muscle: MuscleGroup;
  recovery: number;
  joint: number;
}

const RECOVERY_LABELS = ["Wrecked", "Sore", "Okay", "Fresh"];
const JOINT_LABELS = ["Fine", "Niggle", "Achy", "Painful"];

function humanMuscle(m: string): string {
  return m.charAt(0) + m.slice(1).toLowerCase().replace(/_/g, " ");
}

/** A 0-3 selector drawn like Segmented: a sunken pill track with a raised white thumb on
 * the choice. Neutral on purpose: a row of pink picks would spend the One Signal on input. */
function Scale({
  value,
  onChange,
  labels,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  labels: string[];
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex gap-0.5 rounded-pill bg-sunken p-0.5">
      {labels.map((label, i) => (
        <button
          key={i}
          type="button"
          aria-pressed={value === i}
          title={label}
          onClick={() => onChange(i)}
          className={
            "h-8 min-w-10 rounded-pill border px-3 text-nav font-medium tabular-nums transition-[background-color,border-color,color,box-shadow] duration-200 " +
            (value === i
              ? "border-border-strong bg-surface-raised font-semibold text-fg shadow-control"
              : "border-transparent text-fg-muted hover:bg-hover hover:text-fg")
          }
        >
          {i}
        </button>
      ))}
    </div>
  );
}

export function WeeklyCheckInGrid({
  muscles,
  onChange,
  onSubmit,
  isPending,
}: {
  muscles: MuscleScore[];
  onChange: (next: MuscleScore[]) => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  function set(muscle: MuscleGroup, key: "recovery" | "joint", v: number) {
    onChange(muscles.map((m) => (m.muscle === muscle ? { ...m, [key]: v } : m)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col divide-y divide-border-subtle">
        {muscles.map((m) => (
          <div key={m.muscle} className="py-4 first:pt-0">
            <div className="text-card-title text-fg">{humanMuscle(m.muscle)}</div>
            {/* Divs, not labels: a label forwards a click on its text to the first button inside, which
                quietly set the score to 0. Each group carries its own aria-label. */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-meta font-medium text-fg-muted">
                  Recovery <span className="font-normal text-fg-soft">· {RECOVERY_LABELS[m.recovery]}</span>
                </span>
                <Scale value={m.recovery} onChange={(v) => set(m.muscle, "recovery", v)} labels={RECOVERY_LABELS} ariaLabel={`${humanMuscle(m.muscle)} recovery`} />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-meta font-medium text-fg-muted">
                  Joints <span className="font-normal text-fg-soft">· {JOINT_LABELS[m.joint]}</span>
                </span>
                <Scale value={m.joint} onChange={(v) => set(m.muscle, "joint", v)} labels={JOINT_LABELS} ariaLabel={`${humanMuscle(m.muscle)} joint stress`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button variant="primary" size="lg" loading={isPending} onClick={onSubmit} className="w-full">
        {isPending ? "Reading your week…" : "See next week's plan"}
      </Button>
    </div>
  );
}

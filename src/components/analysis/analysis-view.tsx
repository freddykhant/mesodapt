"use client";

import { useState } from "react";
import { LandmarkBar } from "~/components/viz/landmark-bar";
import { BodyMap } from "~/components/viz/body-map";
import { ZoneLegend } from "~/components/viz/zone-legend";
import { zoneFor } from "~/components/viz/zone";
import { PageHeader, Panel } from "~/components/ui-kit/app-shell-kit";
import type { LandmarkBarDatum, MesocycleView } from "~/views/types";
import type { MuscleGroup } from "~/schema";

/** Body-map regions are large areas, so they take the soft zone fill and a full-strength
 *  outline. Data hues only; hover adds a navy outline and never recolours a region. */
const ZONE_VAR: Record<string, string> = {
  rest: "var(--color-zone-rest-soft)",
  building: "var(--color-zone-building-soft)",
  optimal: "var(--color-zone-optimal-soft)",
  max: "var(--color-zone-max-soft)",
};
const ZONE_STROKE: Record<string, string> = {
  rest: "var(--color-zone-rest)",
  building: "var(--color-zone-building)",
  optimal: "var(--color-zone-optimal)",
  max: "var(--color-zone-max)",
};
const ZONE_NAME: Record<string, string> = { rest: "Rest", building: "Building", optimal: "Optimal", max: "Max" };

function humanMuscle(m: string): string {
  return m.charAt(0) + m.slice(1).toLowerCase().replace(/_/g, " ");
}

export function AnalysisView({ block }: { block: MesocycleView }) {
  const [weekIndex, setWeekIndex] = useState(block.currentWeekIndex);
  const [hover, setHover] = useState<MuscleGroup | null>(null);
  const week = block.weeks.find((w) => w.index === weekIndex)!;

  const bars: LandmarkBarDatum[] = week.cells
    .map((c) => ({ muscle: c.muscle, planned: c.plannedSets, mev: c.mev, mav: c.mav, mrv: c.mrv }))
    .sort((a, b) => b.planned / b.mrv - a.planned / a.mrv); // closeness to MRV, risk on top

  const scaleMax = Math.max(...week.cells.map((c) => c.mrv)) * 1.1;
  const cellFor = (m: MuscleGroup) => week.cells.find((c) => c.muscle === m);
  const fillFor = (m: MuscleGroup): string => {
    const cell = cellFor(m);
    if (!cell) return "var(--color-sunken)";
    return ZONE_VAR[zoneFor(cell.plannedSets, cell)]!;
  };
  const strokeFor = (m: MuscleGroup): string => {
    const cell = cellFor(m);
    if (!cell) return "var(--color-border-strong)";
    return ZONE_STROKE[zoneFor(cell.plannedSets, cell)]!;
  };
  const hoverCell = hover ? cellFor(hover) : undefined;

  const perSession = week.sessions.map((s) => ({
    label: s.label,
    sets: s.prescriptions.reduce((n, p) => n + p.sets, 0),
  }));
  const maxSession = Math.max(...perSession.map((s) => s.sets));

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-6 pt-10 pb-20 md:px-10">
      <PageHeader
        eyebrow="Block"
        title="Analysis"
        description="Planned sets for each muscle against its MEV, MAV and MRV landmarks."
        actions={
          <label className="flex items-center gap-2 text-nav text-fg-muted">
            Week
            <select
              value={weekIndex}
              onChange={(e) => setWeekIndex(Number(e.target.value))}
              className="h-9 rounded-pill border border-border bg-surface-raised px-3 text-nav text-fg tabular-nums shadow-control outline-none transition-colors hover:border-border-strong focus-visible:border-border-strong"
            >
              {block.weeks.map((w) => (
                <option key={w.index} value={w.index}>
                  {w.isDeload ? "Deload" : `Week ${w.index}`}
                  {w.index === block.currentWeekIndex ? " (this week)" : ""}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <Panel padding="lg" className="animate-rise">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="text-card-title text-fg">Volume against landmarks</h2>
          <ZoneLegend />
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr]">
          <div className="mx-auto w-full max-w-[320px] self-start lg:mx-0">
            <div className="rounded-callout bg-sunken p-3">
              <BodyMap fillFor={fillFor} strokeFor={strokeFor} active={hover} onHover={setHover} />
            </div>
            {/* Readout for the hovered region; holds its line so the layout never jumps. */}
            <p className="mt-2.5 h-[18px] text-meta text-fg-muted tabular-nums" aria-live="polite">
              {hover && hoverCell ? (
                <>
                  <span className="font-medium text-fg">{humanMuscle(hover)}</span> · {hoverCell.plannedSets} sets ·{" "}
                  {ZONE_NAME[zoneFor(hoverCell.plannedSets, hoverCell)]}
                </>
              ) : hover ? (
                <>
                  <span className="font-medium text-fg">{humanMuscle(hover)}</span> · not trained this week
                </>
              ) : (
                <span className="text-fg-subtle">Point at a muscle to see its sets</span>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            {bars.map((d) => (
              <LandmarkBar key={d.muscle} datum={d} scaleMax={scaleMax} active={d.muscle === hover} />
            ))}
          </div>
        </div>
      </Panel>

      <Panel padding="lg" className="animate-rise">
        <h2 className="text-card-title text-fg">Sets per session</h2>
        <div className="mt-5 flex items-end gap-3">
          {perSession.map((s, i) => (
            <div key={s.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="mb-0.5 text-meta font-medium text-fg tabular-nums">{s.sets}</div>
              <div className="flex h-24 w-full items-end">
                {/* Sky bars as in VolumeBars: height is the data, the hue is chrome and encodes nothing. */}
                <div
                  className="w-full origin-bottom animate-grow rounded-[6px] bg-sky/45"
                  style={{ height: `${(s.sets / maxSession) * 100}%`, animationDelay: `${i * 45}ms` }}
                />
              </div>
              <div className="w-full truncate text-center text-meta text-fg-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

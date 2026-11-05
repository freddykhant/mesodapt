import { zoneFor } from "~/components/viz/zone";
import type { LandmarkBarDatum, Zone } from "~/views/types";

import { ZONE_FILL as FILL } from "~/components/viz/zone-legend";

const ZONE_NAME: Record<Zone, string> = { rest: "Rest", building: "Building", optimal: "Optimal", max: "Max" };

function label(m: string): string {
  return m.replace(/_/g, " ").toLowerCase();
}

/** One muscle against its landmarks: soft zone bands as the track, the planned sets as a
 *  full-strength zone bar, hairline ticks at MEV/MAV/MRV so adjacent pale bands still part.
 *  `active` lifts the row when its body-map region is hovered. */
export function LandmarkBar({ datum, scaleMax, active }: { datum: LandmarkBarDatum; scaleMax: number; active?: boolean }) {
  const zone = zoneFor(datum.planned, datum);
  const pct = (v: number) => `${Math.min(100, (v / scaleMax) * 100)}%`;
  return (
    <div
      className={
        "-mx-2 flex items-center gap-3 rounded-control px-2 py-1 transition-colors duration-200 " +
        (active ? "bg-hover" : "")
      }
    >
      <div
        className={
          "w-20 shrink-0 truncate text-right text-meta capitalize transition-colors duration-200 sm:w-24 " +
          (active ? "font-medium text-fg" : "text-fg-muted")
        }
      >
        {label(datum.muscle)}
      </div>
      <div className="relative h-3 flex-1 overflow-hidden rounded-pill bg-sunken">
        {/* zone bands (track) */}
        <div className="absolute inset-y-0 left-0 bg-zone-rest-soft" style={{ width: pct(datum.mev) }} />
        <div className="absolute inset-y-0 bg-zone-building-soft" style={{ left: pct(datum.mev), width: pct(datum.mav - datum.mev) }} />
        <div className="absolute inset-y-0 bg-zone-optimal-soft" style={{ left: pct(datum.mav), width: pct(datum.mrv - datum.mav) }} />
        <div className="absolute inset-y-0 bg-zone-max-soft" style={{ left: pct(datum.mrv), right: 0 }} />
        {/* landmark ticks */}
        {[datum.mev, datum.mav, datum.mrv].map((v, i) => (
          <div key={i} aria-hidden className="absolute inset-y-0 w-px bg-surface-raised" style={{ left: pct(v) }} />
        ))}
        {/* planned fill */}
        <div className={"absolute inset-y-0 left-0 rounded-pill " + FILL[zone]} style={{ width: pct(datum.planned) }} />
        {/* actual marker */}
        {datum.actual !== undefined ? (
          <div className="absolute inset-y-0 w-0.5 rounded-pill bg-fg" style={{ left: pct(datum.actual) }} />
        ) : null}
      </div>
      {/* Below sm the zone name drops; the bar's hue and the legend carry it. */}
      <div className="flex shrink-0 items-center gap-2 text-meta tabular-nums sm:w-[104px]">
        <span className="w-8 text-right font-medium text-fg">{datum.planned}</span>
        <span className="hidden text-fg-muted sm:inline">{ZONE_NAME[zone]}</span>
      </div>
    </div>
  );
}

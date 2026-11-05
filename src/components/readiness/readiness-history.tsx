import { Panel, Spine, SpineItem } from "~/components/ui-kit/app-shell-kit";
import { readinessState } from "~/components/viz/readiness-state";
import { READINESS_DOT } from "~/components/readiness/readiness-chip";
import type { ReadinessView } from "~/views/types";

/** The engine's weekly readiness samples up to this week, newest first, on the kit Spine.
 *  Later weeks in the series are left off: they haven't happened yet. Same one-decimal values
 *  as the chart; the state is readinessState's classification. Presentation only. */
export function ReadinessHistory({ readiness }: { readiness: ReadinessView }) {
  const past = readiness.series.filter((p) => p.weekIndex <= readiness.currentWeekIndex).reverse();
  if (past.length === 0) return null;

  return (
    <Panel as="section" aria-labelledby="readiness-history-title" padding="none" className="p-6 md:p-8">
      <h2 id="readiness-history-title" className="text-card-title text-fg">
        Week by week
      </h2>
      <p className="mt-0.5 text-card-desc text-fg-muted">Your form at the end of each week so far</p>
      <Spine className="mt-6">
        {past.map((p) => {
          const state = readinessState(p);
          return (
            <SpineItem
              dense
              key={p.weekIndex}
              lead={p.weekIndex === readiness.currentWeekIndex ? `Week ${p.weekIndex} · this week` : `Week ${p.weekIndex}`}
            >
              <div className="flex items-center gap-2 text-list text-fg">
                <span className={`size-2 rounded-full ${READINESS_DOT[state]}`} aria-hidden />
                {state}
              </div>
              <p className="mt-0.5 text-meta text-fg-muted tabular-nums">
                Fitness {p.fitness.toFixed(1)} · Fatigue {p.fatigue.toFixed(1)} · Form {p.form.toFixed(1)}
              </p>
            </SpineItem>
          );
        })}
      </Spine>
    </Panel>
  );
}

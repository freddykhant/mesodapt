"use client";

import { Check } from "lucide-react";
import { api } from "~/trpc/react";
import { Button, Panel } from "~/components/ui-kit/app-shell-kit";

/** End-of-week entry point. Renders only when the week is resolved and no terminal
 * progression decision exists yet. Primary (sky) CTA: pink is kept for the proposal's
 * accept and the schedule's live marks on the same page. `onOpen` is supplied by
 * WeeklyCheckInFlow, which mounts this as its internal trigger. */
export function WeeklyCheckInEntry({ weekIndex, onOpen }: { weekIndex: number; onOpen: () => void }) {
  const q = api.checkin.getWeeklyCheckIn.useQuery({ weekIndex });
  const view = q.data;
  if (!view) return null;

  if (view.status === "APPLIED") {
    return (
      <Panel padding="sm" className="flex items-center gap-2.5 px-5 text-card-desc text-fg-muted">
        <Check className="size-4 shrink-0" aria-hidden />
        <span className="tabular-nums">Week {weekIndex} progression applied to Week {weekIndex + 1}</span>
      </Panel>
    );
  }
  if (view.status !== "READY" && view.status !== "SUBMITTED") return null;

  const submitted = view.status === "SUBMITTED";
  return (
    <Panel padding="lg" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <div className="text-card-title text-fg tabular-nums">Week {weekIndex} is done. How did it feel?</div>
        <p className="mt-1 text-card-desc text-fg-muted">
          {submitted
            ? "Next week’s proposal is ready. Nothing changes until you accept it."
            : "Rate recovery and joints for each muscle you trained. Next week’s sets are worked out from it."}
        </p>
      </div>
      <Button variant="primary" onClick={onOpen}>
        {submitted ? "See proposal" : "Check in"}
      </Button>
    </Panel>
  );
}

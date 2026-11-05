"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, ArrowRight, ArrowUp, TriangleAlert } from "lucide-react";
import { Button } from "~/components/ui-kit/app-shell-kit";
import type { DeloadProposalView, ProgressionProposalView } from "~/views/types";

const CAUSE_COPY: Record<string, string> = {
  responding_well: "responding well",
  under_recovered: "under-recovered",
  joint_stress: "joint stress",
  approaching_mrv: "approaching your ceiling",
  on_track: "on track",
  default_progression: "steady progression",
};

function humanMuscle(m: string): string {
  return m.charAt(0) + m.slice(1).toLowerCase().replace(/_/g, " ");
}

/** "Chest, back and quads". Wording only; the list is the engine's. */
function humanList(ms: string[]): string {
  const names = ms.map((m, i) => (i === 0 ? humanMuscle(m) : humanMuscle(m).toLowerCase()));
  return names.length < 2 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function ProgressionProposalDialog({
  proposal,
  onAccept,
  onReject,
  isPending,
  errorMessage,
}: {
  proposal: ProgressionProposalView | DeloadProposalView;
  onAccept: () => void;
  onReject: () => void;
  isPending: boolean;
  errorMessage?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  // Modal keyboard contract: focus moves into the dialog on open, Escape
  // closes it, Tab is trapped inside, and focus returns to the trigger on
  // close. Mirrors src/components/block/reschedule-dialog.tsx.
  useEffect(() => {
    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onReject();
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
        if (f.length === 0) return;
        const first = f[0]!;
        const last = f[f.length - 1]!;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); restoreFocusTo.current?.focus(); };
  }, [onReject]);

  const SCRIM = "fixed inset-0 z-50 grid place-items-center bg-scrim p-4 backdrop-blur-[2px] animate-fade";
  const SHEET = "w-full max-w-[460px] rounded-sheet bg-surface-raised p-6 shadow-pop outline-none animate-rise";
  const ROW = "flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-callout bg-sunken px-3.5 py-2.5";

  if (proposal.kind === "DELOAD") {
    return (
      <div
        className={SCRIM}
        onClick={(e) => { if (e.target === e.currentTarget) onReject(); }}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="deload-title"
          className={SHEET}
        >
          <h2 id="deload-title" className="text-card-title text-fg tabular-nums">Deload in Week {proposal.appliesToWeekIndex}?</h2>
          <p className="mt-1.5 text-card-desc text-fg-muted">
            {proposal.fatiguedMuscles.length > 0
              ? `${humanList(proposal.fatiguedMuscles)} sat at their ceiling and came in under-recovered two weeks running.`
              : "Several muscles sat at their ceiling and came in under-recovered two weeks running."}{" "}
            A deload cuts next week to the sets below. Nothing changes until you accept.
          </p>
          <div className="mt-5 flex flex-col gap-1.5">
            {proposal.rows.map((r) => (
              <div key={r.muscle} className={ROW}>
                <span className="text-list text-fg">{humanMuscle(r.muscle)}</span>
                <span className="text-nav text-fg-muted tabular-nums">
                  {r.plannedSets} → <span className="font-medium text-fg">{r.deloadedSets}</span>
                  <span className="ml-2 text-meta">{r.delta}</span>
                </span>
              </div>
            ))}
          </div>
          {errorMessage ? (
            <p role="alert" className="mt-3 rounded-callout bg-callout px-3.5 py-2.5 text-card-desc text-fg-soft">{errorMessage}</p>
          ) : null}
          <div className="mt-6 flex items-center justify-end gap-2">
            <Button variant="ghost" disabled={isPending} onClick={onReject}>Keep pushing</Button>
            <Button variant="accent" disabled={isPending} onClick={onAccept}>Accept deload</Button>
          </div>
        </div>
      </div>
    );
  }

  const informational = proposal.kind !== "CHANGES";
  const title =
    proposal.kind === "BLOCK_END"
      ? "That was the block’s last week"
      : proposal.kind === "DELOAD_HOLD"
        ? `Week ${proposal.appliesToWeekIndex} is your planned deload`
        : `Proposed changes for Week ${proposal.appliesToWeekIndex}`;
  const subtitle =
    proposal.kind === "BLOCK_END"
      ? "There’s no next week in this block, so there’s nothing to adjust."
      : proposal.kind === "DELOAD_HOLD"
        ? "Its sets stay as planned so you can recover."
        : "From your check-in and where each muscle sits against its landmarks. Nothing changes until you accept.";

  return (
    <div className={SCRIM} onClick={(e) => { if (e.target === e.currentTarget) onReject(); }}>
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="prog-title" aria-describedby="prog-desc" className={SHEET}>
        <h2 id="prog-title" className="text-card-title text-fg">{title}</h2>
        <p id="prog-desc" className="mt-1.5 text-card-desc text-fg-muted">{subtitle}</p>

        {proposal.advisory ? (
          // A sunken well, not the pink callout: the accept below is this sheet's one pink.
          <div role="note" className="mt-4 flex items-start gap-2.5 rounded-callout border border-border-subtle bg-sunken px-3.5 py-3 text-card-desc text-fg-soft">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
            <span>{proposal.advisory}</span>
          </div>
        ) : null}

        {!informational ? (
          <div className="mt-5 flex flex-col gap-1.5">
            {proposal.closeCall && proposal.adjustments.length > 0 ? (
              <p className="mb-1 text-meta text-fg-muted">
                The model that weighs borderline muscles was close to 50/50 on some of these. If one doesn’t match how
                your week felt, keep the plan as it is.
              </p>
            ) : null}
            {proposal.adjustments.length === 0 ? (
              <p className={ROW + " text-card-desc text-fg-muted"}>No muscle needs a change, so next week stays as planned.</p>
            ) : (
              proposal.adjustments.map((a) => (
                <div key={a.muscle} className={ROW}>
                  <div className="flex items-center gap-2 text-nav whitespace-nowrap text-fg tabular-nums">
                    <span className="text-list">{humanMuscle(a.muscle)}</span>
                    <span className="text-fg-muted">{a.plannedSets} → {a.adjustedSets}</span>
                    {/* Direction as a glyph, not a zone hue: green-for-up would read as "Optimal". */}
                    <span className="inline-flex items-center gap-0.5 font-medium">
                      {a.delta > 0 ? (
                        <ArrowUp className="size-3.5 text-fg-muted" aria-hidden />
                      ) : a.delta < 0 ? (
                        <ArrowDown className="size-3.5 text-fg-muted" aria-hidden />
                      ) : null}
                      {a.delta > 0 ? `+${a.delta}` : a.delta}
                    </span>
                  </div>
                  <span className="text-meta text-fg-muted">
                    {CAUSE_COPY[a.cause] ?? a.cause}{a.swapCandidate ? " · consider a swap" : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : null}

        {errorMessage ? (
          <p role="alert" className="mt-3 rounded-callout bg-callout px-3.5 py-2.5 text-card-desc text-fg-soft">{errorMessage}</p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-2">
          {informational ? (
            <Button variant="primary" onClick={onReject}>Got it</Button>
          ) : (
            <>
              <Button variant="ghost" disabled={isPending} onClick={onReject}>Keep as-is</Button>
              <Button variant="accent" disabled={isPending} loading={isPending} trailingIcon={ArrowRight} onClick={onAccept}>
                Accept plan
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Info } from "lucide-react";
import { Button } from "~/components/ui-kit/app-shell-kit";

/** Shown while the athlete has unconfirmed moves. Nothing is saved until Confirm. It floats
 * over the board (the board's dock places it), so the week never shifts when it appears. */
export function DraftBar({
  changeCount,
  warnings,
  carryForward,
  onCarryForward,
  onDiscard,
  onConfirm,
  pending,
  stale,
  error,
}: {
  changeCount: number;
  warnings: string[];
  carryForward: boolean;
  onCarryForward: (v: boolean) => void;
  onDiscard: () => void;
  onConfirm: () => void;
  pending: boolean;
  /** The saved week changed elsewhere since this draft began: Confirm is off. */
  stale: boolean;
  error: string | null;
}) {
  return (
    <div
      className="animate-rise flex flex-col gap-3 rounded-card border border-border bg-surface-raised p-4 shadow-pop"
      role="region"
      aria-label="Unsaved schedule changes"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-list text-fg tabular-nums">
          {changeCount} unsaved {changeCount === 1 ? "change" : "changes"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            disabled={pending}
          >
            Discard
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={onConfirm}
            disabled={pending || stale}
          >
            {pending ? "Saving…" : "Confirm"}
          </Button>
        </div>
      </div>
      {stale ? (
        <p className="flex gap-2 rounded-control bg-callout px-3 py-2 text-card-desc text-fg-soft">
          <Info className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
          This week changed somewhere else. Discard to see the latest.
        </p>
      ) : null}
      {warnings.length > 0 ? (
        <ul className="flex flex-col gap-1 text-card-desc text-fg-soft">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : (
        <p className="text-card-desc text-fg-muted">
          No recovery concerns with this layout.
        </p>
      )}
      <label className="flex items-center gap-2 border-t border-border-subtle pt-3 text-card-desc text-fg-muted">
        <input
          type="checkbox"
          checked={carryForward}
          onChange={(e) => onCarryForward(e.target.checked)}
          disabled={pending}
          className="size-4 accent-ink"
        />
        Use this layout for the remaining weeks
      </label>
      {error ? (
        <p className="rounded-control bg-callout px-3 py-2 text-card-desc text-fg-soft">
          {error}
        </p>
      ) : null}
    </div>
  );
}

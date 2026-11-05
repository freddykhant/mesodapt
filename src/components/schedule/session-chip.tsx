"use client";

import { useDraggable } from "@dnd-kit/core";
import { CalendarX, Check, ChevronDown, GripVertical } from "lucide-react";
import { useFlip } from "~/components/ui-kit/app-shell-kit";
import type { Placement } from "~/engine/schedule";
import type { ScheduleSessionView } from "~/views/schedule";
import { parseCellId } from "./draft";

export interface MoveOption {
  value: string; // cellId
  label: string;
}

/** One session on the board. Pointer and touch users drag the top half; keyboard and
 * screen-reader users use the "Move to…" menu, which offers the same legal targets.
 * A saved move hops the chip from its old cell to its new one (useFlip) and leaves it
 * wearing the pink ring; an unsaved draft move only pencils it in with a dashed edge. */
export function SessionChip({
  session,
  editable,
  changed,
  moved = false,
  drafting = false,
  moveOptions,
  onMove,
  onCantMake,
}: {
  session: ScheduleSessionView;
  editable: boolean;
  /** Placed differently in the open draft than in the saved week. */
  changed: boolean;
  /** Moved by the last saved change: the one live thing on the board. */
  moved?: boolean;
  /** A draft is open. Its moves are previews, so they never hop. */
  drafting?: boolean;
  moveOptions: MoveOption[];
  onMove: (target: Placement) => void;
  /** Block this session's day or half-day for this week. Absent when not offered. */
  onCantMake?: () => void;
}) {
  const draggable = editable && !session.locked;
  const { listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: session.id,
    disabled: !draggable,
  });
  // Draft chips take a different key, so a preview move never reads as a hop.
  const flip = useFlip<HTMLDivElement>(
    drafting ? `draft:${session.id}` : session.id,
  );
  const status =
    session.status === "COMPLETED"
      ? "Done"
      : session.status === "MISSED"
        ? "Missed"
        : null;
  const StatusIcon = session.status === "COMPLETED" ? Check : CalendarX;

  return (
    // dnd-kit drives `transform` inline; the lift uses the separate `scale` property and
    // box-shadow, so it eases in and out without fighting the drag.
    <div
      ref={(el) => {
        setNodeRef(el);
        flip.current = el;
      }}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={[
        "group/chip relative rounded-callout border transition-[scale,box-shadow,border-color,background-color] duration-200 ease-out",
        session.locked
          ? "border-border-subtle bg-surface"
          : "bg-surface-raised shadow-card hover:shadow-card-hover",
        changed
          ? "border-dashed border-border-strong"
          : moved
            ? "border-accent ring-[3px] ring-accent/15"
            : session.locked
              ? ""
              : "border-border",
        isDragging ? "z-20 scale-[1.03] shadow-pop" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="p-3">
        <div
          {...(draggable ? listeners : {})}
          className={
            draggable
              ? "touch-manipulation select-none " +
                (isDragging ? "cursor-grabbing" : "cursor-grab")
              : undefined
          }
        >
          <div className="flex items-start justify-between gap-2">
            <div
              className={
                "text-list min-w-0 truncate " +
                (session.locked ? "text-fg-muted" : "text-fg")
              }
            >
              {session.label}
            </div>
            {draggable ? (
              <GripVertical
                className="mt-0.5 size-4 shrink-0 text-fg-subtle opacity-50 transition-opacity group-hover/chip:opacity-100"
                aria-hidden
              />
            ) : null}
          </div>
          <div className="text-meta mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-fg-muted">
            <span className="tabular-nums">{session.estimatedMinutes} min</span>
            {status ? (
              <span className="inline-flex items-center gap-1 text-fg-soft">
                <StatusIcon className="size-3.5" aria-hidden />
                {status}
              </span>
            ) : null}
            {changed ? (
              <span className="rounded-pill bg-sunken px-2 py-px text-[12px] font-medium text-fg-soft">
                Not saved
              </span>
            ) : moved ? (
              <span className="rounded-pill bg-selection px-2 py-px text-[12px] font-medium text-accent">
                Moved
              </span>
            ) : null}
          </div>
        </div>
        {draggable && (moveOptions.length > 0 || onCantMake) ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {moveOptions.length > 0 ? (
              <div className="relative min-w-0 flex-1">
                <select
                  aria-label={`Move ${session.label} to another time`}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) onMove(parseCellId(e.target.value));
                  }}
                  className="text-meta h-7 w-full min-w-[96px] cursor-pointer appearance-none rounded-pill bg-sunken pr-7 pl-3 font-medium text-fg-muted transition-colors hover:bg-press hover:text-fg"
                >
                  <option value="">Move to…</option>
                  {moveOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-fg-subtle"
                  aria-hidden
                />
              </div>
            ) : null}
            {onCantMake ? (
              <button
                type="button"
                aria-label={`Can’t make ${session.label}`}
                onClick={onCantMake}
                className="text-meta h-7 shrink-0 rounded-pill px-2.5 font-medium text-fg-muted transition-colors hover:bg-hover hover:text-fg"
              >
                Can&rsquo;t make this
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

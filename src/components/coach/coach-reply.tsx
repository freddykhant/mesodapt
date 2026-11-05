"use client";

import { Sparkles } from "lucide-react";
import { Button, GlassCard, GlassSheet } from "~/components/ui-kit/app-shell-kit";
import type { CoachFinalReply, CoachReply } from "~/views/coach";

// The kit's ghost button is drawn for the light page; on night glass its text and wash
// come from the on-ink tokens instead.
const GHOST_ON_GLASS = "text-on-ink-muted! hover:bg-ink-well! hover:text-on-ink!";

function Lines({ lines, muted }: { lines: string[]; muted?: boolean }) {
  return (
    <ul
      className={
        "flex flex-col gap-1 text-card-desc tabular-nums " +
        (muted ? "text-on-ink-muted" : "text-on-ink")
      }
    >
      {lines.map((l, i) => (
        <li key={`${i}:${l}`}>{l}</li>
      ))}
    </ul>
  );
}

/** One coach reply, on the navy glass sheet because the model read the message. The card
 * with the prism edge is what the model understood; answers the engine worked out sit on
 * plain glass. Every string shown comes from the server's reply; this component adds only
 * fixed labels. */
export function CoachReplyCard({
  reply,
  pending,
  blocked,
  error,
  onConfirm,
  onSkip,
  onChoose,
  onDismiss,
}: {
  reply: CoachReply;
  pending: boolean;
  /** Why a change cannot be confirmed right now, or null. */
  blocked: string | null;
  error: string | null;
  onConfirm: (
    reply: Extract<
      CoachFinalReply,
      { kind: "confirm_block" | "confirm_unblock" }
    >,
  ) => void;
  onSkip: (sessionId: string) => void;
  onChoose: (reply: CoachFinalReply) => void;
  onDismiss: () => void;
}) {
  // While a new message is being read the coach box wears the prism edge, so this card
  // gives it up: one prism edge on screen at a time.
  const model = pending ? "plain" : "model";
  return (
    <GlassSheet as="div" className="animate-rise flex flex-col gap-4">
      <p className="flex items-center gap-1.5 text-meta font-medium text-on-ink-muted">
        <Sparkles className="size-3.5 text-prism-amber" aria-hidden />
        Coach
      </p>
      {reply.kind === "confirm_block" || reply.kind === "confirm_unblock" ? (
        <>
          <GlassCard tone={model} className="flex flex-col gap-2">
            <p className="text-card-title text-on-ink">{reply.summary}</p>
            {reply.kind === "confirm_block" && reply.alreadyBlockedLine ? (
              <p className="text-meta text-on-ink-muted">
                {reply.alreadyBlockedLine}
              </p>
            ) : null}
            {reply.kind === "confirm_unblock" && reply.notes.length > 0 ? (
              <Lines lines={reply.notes} muted />
            ) : null}
          </GlassCard>
          {blocked ? (
            <p className="text-meta text-on-ink-muted">{blocked}</p>
          ) : null}
          <div className="flex items-center gap-2">
            <Button
              variant="accent"
              size="sm"
              aria-label={`Confirm: ${reply.summary}`}
              disabled={pending || blocked !== null}
              onClick={() => onConfirm(reply)}
            >
              Confirm
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={GHOST_ON_GLASS}
              disabled={pending}
              onClick={onDismiss}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : reply.kind === "skip" ? (
        <>
          <GlassCard tone={model}>
            <p className="text-card-title text-on-ink">{reply.summary}</p>
          </GlassCard>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={pending}
              onClick={() => onSkip(reply.sessionId)}
            >
              Skip {reply.label}…
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={GHOST_ON_GLASS}
              onClick={onDismiss}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : reply.kind === "clarify" ? (
        <>
          <GlassCard tone={model}>
            <p className="text-card-title text-on-ink">{reply.question}</p>
          </GlassCard>
          <div className="flex flex-wrap gap-2">
            {reply.choices.map((c, i) => (
              <Button
                key={i}
                variant="secondary"
                size="sm"
                onClick={() => onChoose(c.reply)}
              >
                {c.label}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={"self-start " + GHOST_ON_GLASS}
            onClick={onDismiss}
          >
            Never mind
          </Button>
        </>
      ) : (
        <>
          <GlassCard className="flex flex-col gap-2">
            {reply.kind === "answer" ? (
              <p className="text-eyebrow font-medium text-on-ink-subtle">
                From the engine
              </p>
            ) : null}
            <Lines lines={reply.lines} />
          </GlassCard>
          <Button
            variant="ghost"
            size="sm"
            className={"self-start " + GHOST_ON_GLASS}
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        </>
      )}
      {error ? <p className="text-card-desc text-on-ink">{error}</p> : null}
    </GlassSheet>
  );
}

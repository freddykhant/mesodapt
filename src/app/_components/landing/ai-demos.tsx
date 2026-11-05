"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { useReveal } from "./use-reveal";

/**
 * The four live demos in the intelligence sheet. Each one plays once, in steps, when it's scrolled into view.
 * Under reduced motion it jumps straight to its last step. Illustrative only: nothing here talks to the engine.
 */
function useSteps(count: number, gapMs: number) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!revealed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(count);
      return;
    }
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => setStep(i + 1), 250 + i * gapMs),
    );
    return () => timers.forEach(clearTimeout);
  }, [revealed, count, gapMs]);
  return { ref, step };
}

const show = (on: boolean) =>
  "transition-[opacity,transform] duration-500 ease-[var(--ease-out)] " +
  (on ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0");

/* ── 01: it reads a messy text ─────────────────────────────────────────────────────────────────────── */

const MESSAGE = "i can train thursday AM, but got dinner plans PM";

export function ReadsYouDemo() {
  const { ref, step } = useSteps(4, 650);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (step < 1) return;
    if (step > 1) {
      setChars(MESSAGE.length);
      return;
    }
    const id = setInterval(
      () => setChars((c) => (c >= MESSAGE.length ? c : c + 1)),
      18,
    );
    return () => clearInterval(id);
  }, [step]);
  const chips = ["Thursday 13", "Evening", "Busy"];
  return (
    <div ref={ref} className="flex h-full flex-col justify-center gap-3">
      <div className="bg-on-ink text-card-desc text-night ml-auto max-w-[88%] rounded-[18px] rounded-br-[6px] px-3.5 py-2">
        {MESSAGE.slice(0, chars) || " "}
        {step === 1 && chars < MESSAGE.length ? (
          <span className="bg-night ml-px inline-block h-3.5 w-px translate-y-[2px]" />
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Sparkles
          className={"text-prism-amber size-3.5 " + show(step >= 2)}
          aria-hidden
        />
        {chips.map((c, i) => (
          <span
            key={c}
            style={{ transitionDelay: step >= 2 ? `${i * 110}ms` : "0ms" }}
            className={
              "rounded-pill bg-ink-well text-meta text-on-ink px-2.5 py-1 tabular-nums " +
              show(step >= 2)
            }
          >
            {c}
          </span>
        ))}
      </div>
      <div
        className={
          "rounded-control bg-ink-well flex items-center justify-between gap-3 px-3 py-2 " +
          show(step >= 3)
        }
      >
        <span className="text-card-desc text-on-ink-muted">
          Block out Thursday evening?
        </span>
        <span
          className={
            "rounded-pill text-meta px-2.5 py-1 font-semibold transition-colors duration-300 " +
            (step >= 4 ? "bg-pink text-on-ink" : "bg-on-ink/10 text-on-ink")
          }
        >
          {step >= 4 ? "Blocked" : "Block it"}
        </span>
      </div>
    </div>
  );
}

/* ── 02: it builds the options and ranks them ──────────────────────────────────────────────────────── */

const OPTIONS = [
  { label: "Best recovery", detail: "Upper B to Friday", fill: "92%" },
  {
    label: "Fewest changes",
    detail: "Upper B to Saturday, Lower B to Sunday",
    fill: "71%",
  },
  {
    label: "Keeps your usual times",
    detail: "Upper B to Wednesday",
    fill: "58%",
  },
];

export function WeighsUpDemo() {
  const { ref, step } = useSteps(2, 900);
  return (
    <div ref={ref} className="flex h-full flex-col justify-center gap-1.5">
      {OPTIONS.map((o, i) => {
        const first = i === 0 && step >= 2;
        return (
          <div
            key={o.label}
            className={
              "rounded-control border px-3 py-1.5 transition-[border-color,box-shadow] duration-500 " +
              (first
                ? "border-pink/70 shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-pink)_18%,transparent)]"
                : "border-ink-border")
            }
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-card-desc text-on-ink font-semibold">
                {o.label}
              </span>
              <span
                className={
                  "text-meta text-accent-on-ink font-semibold transition-opacity duration-300 " +
                  (first ? "opacity-100" : "opacity-0")
                }
              >
                Shown first
              </span>
            </div>
            <div className="text-meta text-on-ink-subtle mt-0.5 truncate">
              {o.detail}
            </div>
            <div className="rounded-pill bg-ink-well mt-1 h-1 overflow-hidden">
              <div
                style={{
                  width: step >= 1 ? o.fill : "0%",
                  transitionDelay: `${i * 140}ms`,
                }}
                className={
                  "rounded-pill h-full transition-[width] duration-700 ease-[var(--ease-out)] " +
                  (first ? "bg-pink" : "bg-on-ink/45")
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 03: it reads your check-in and sets next week ─────────────────────────────────────────────────── */

const CHECK_IN = [
  { muscle: "Chest", felt: "Felt fresh", from: 14, to: 16 },
  { muscle: "Back", felt: "Felt okay", from: 16, to: 17 },
  { muscle: "Quads", felt: "Still sore", from: 14, to: 14 },
];

export function RecoveryDemo() {
  const { ref, step } = useSteps(2, 850);
  return (
    <div ref={ref} className="flex h-full flex-col justify-center">
      <div className="text-meta text-on-ink-subtle mb-2 flex items-center justify-between">
        <span>Sunday check-in</span>
        <span>Next week</span>
      </div>
      {CHECK_IN.map((r, i) => {
        const hold = r.to === r.from;
        return (
          <div
            key={r.muscle}
            className={
              "flex items-center gap-2.5 py-2 tabular-nums " +
              (i > 0 ? "border-ink-border border-t" : "")
            }
          >
            <span className="text-card-desc text-on-ink w-14 font-semibold">
              {r.muscle}
            </span>
            <span
              style={{ transitionDelay: step >= 1 ? `${i * 120}ms` : "0ms" }}
              className={
                "rounded-pill bg-ink-well text-meta text-on-ink-muted px-2 py-0.5 " +
                show(step >= 1)
              }
            >
              {r.felt}
            </span>
            <span className="text-card-desc text-on-ink ml-auto flex items-center gap-1.5">
              {r.from}
              <ArrowRight
                className={
                  "text-on-ink-subtle size-3.5 transition-opacity duration-300 " +
                  (step >= 2 ? "opacity-100" : "opacity-0")
                }
                aria-hidden
              />
              <span
                style={{ transitionDelay: step >= 2 ? `${i * 120}ms` : "0ms" }}
                className={
                  "min-w-[60px] font-semibold " +
                  (hold ? "text-on-ink-muted" : "text-accent-on-ink") +
                  show(step >= 2)
                }
              >
                {hold ? "hold" : `${r.to} sets`}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── 04: every change carries its reasons ──────────────────────────────────────────────────────────── */

const REASONS = [
  "Thursday is date night",
  "Four days since Upper A",
  "All 17 sets kept",
];

export function ReasonsDemo() {
  const { ref, step } = useSteps(REASONS.length, 420);
  return (
    <div ref={ref} className="flex h-full flex-col justify-center">
      <div className="rounded-control bg-ink-well p-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-card-desc text-on-ink font-semibold">
            Upper B moved to Friday
          </span>
          <span className="rounded-pill bg-pink text-meta text-on-ink px-2 py-0.5 font-semibold">
            Accepted
          </span>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {REASONS.map((r, i) => (
            <li
              key={r}
              className={
                "text-card-desc text-on-ink-muted flex items-center gap-2 " +
                show(step > i)
              }
            >
              <Check
                className="text-accent-on-ink size-3.5 shrink-0"
                aria-hidden
              />
              {r}
            </li>
          ))}
        </ul>
        <div className="border-ink-border text-meta text-on-ink-subtle mt-3 border-t pt-2.5">
          Saved 13 Nov · worked out by the engine
        </div>
      </div>
    </div>
  );
}

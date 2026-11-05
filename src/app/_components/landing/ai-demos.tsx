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
    const timers = Array.from({ length: count }, (_, i) => setTimeout(() => setStep(i + 1), 250 + i * gapMs));
    return () => timers.forEach(clearTimeout);
  }, [revealed, count, gapMs]);
  return { ref, step };
}

const show = (on: boolean) =>
  "transition-[opacity,transform] duration-500 ease-[var(--ease-out)] " +
  (on ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0");

/* ── 01: it reads a messy text ─────────────────────────────────────────────────────────────────────── */

const MESSAGE = "cant do thurs nite, dinner w/ sam";

export function ReadsYouDemo() {
  const { ref, step } = useSteps(4, 650);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (step < 1) return;
    if (step > 1) {
      setChars(MESSAGE.length);
      return;
    }
    const id = setInterval(() => setChars((c) => (c >= MESSAGE.length ? c : c + 1)), 18);
    return () => clearInterval(id);
  }, [step]);
  const chips = ["Thursday 13", "Evening", "Busy"];
  return (
    <div ref={ref} className="flex h-full flex-col justify-center gap-3">
      <div className="ml-auto max-w-[88%] rounded-[18px] rounded-br-[6px] bg-on-ink px-3.5 py-2 text-card-desc text-night">
        {MESSAGE.slice(0, chars) || " "}
        {step === 1 && chars < MESSAGE.length ? (
          <span className="ml-px inline-block h-3.5 w-px translate-y-[2px] bg-night" />
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Sparkles className={"size-3.5 text-prism-amber " + show(step >= 2)} aria-hidden />
        {chips.map((c, i) => (
          <span
            key={c}
            style={{ transitionDelay: step >= 2 ? `${i * 110}ms` : "0ms" }}
            className={"rounded-pill bg-ink-well px-2.5 py-1 text-meta text-on-ink tabular-nums " + show(step >= 2)}
          >
            {c}
          </span>
        ))}
      </div>
      <div className={"flex items-center justify-between gap-3 rounded-control bg-ink-well px-3 py-2 " + show(step >= 3)}>
        <span className="text-card-desc text-on-ink-muted">Block out Thursday evening?</span>
        <span
          className={
            "rounded-pill px-2.5 py-1 text-meta font-semibold transition-colors duration-300 " +
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
  { label: "Fewest changes", detail: "Upper B to Saturday, Lower B to Sunday", fill: "71%" },
  { label: "Keeps your usual times", detail: "Upper B to Wednesday", fill: "58%" },
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
              (first ? "border-pink/70 shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-pink)_18%,transparent)]" : "border-ink-border")
            }
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-card-desc font-semibold text-on-ink">{o.label}</span>
              <span
                className={
                  "text-meta font-semibold text-accent-on-ink transition-opacity duration-300 " +
                  (first ? "opacity-100" : "opacity-0")
                }
              >
                Shown first
              </span>
            </div>
            <div className="mt-0.5 truncate text-meta text-on-ink-subtle">{o.detail}</div>
            <div className="mt-1 h-1 overflow-hidden rounded-pill bg-ink-well">
              <div
                style={{ width: step >= 1 ? o.fill : "0%", transitionDelay: `${i * 140}ms` }}
                className={
                  "h-full rounded-pill transition-[width] duration-700 ease-[var(--ease-out)] " +
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
      <div className="mb-2 flex items-center justify-between text-meta text-on-ink-subtle">
        <span>Sunday check-in</span>
        <span>Next week</span>
      </div>
      {CHECK_IN.map((r, i) => {
        const hold = r.to === r.from;
        return (
          <div
            key={r.muscle}
            className={"flex items-center gap-2.5 py-2 tabular-nums " + (i > 0 ? "border-t border-ink-border" : "")}
          >
            <span className="w-14 text-card-desc font-semibold text-on-ink">{r.muscle}</span>
            <span
              style={{ transitionDelay: step >= 1 ? `${i * 120}ms` : "0ms" }}
              className={"rounded-pill bg-ink-well px-2 py-0.5 text-meta text-on-ink-muted " + show(step >= 1)}
            >
              {r.felt}
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-card-desc text-on-ink">
              {r.from}
              <ArrowRight
                className={"size-3.5 text-on-ink-subtle transition-opacity duration-300 " + (step >= 2 ? "opacity-100" : "opacity-0")}
                aria-hidden
              />
              <span
                style={{ transitionDelay: step >= 2 ? `${i * 120}ms` : "0ms" }}
                className={
                  "min-w-[60px] font-semibold " + (hold ? "text-on-ink-muted " : "text-accent-on-ink ") + show(step >= 2)
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

const REASONS = ["Thursday is date night", "Four days since Upper A", "All 17 sets kept"];

export function ReasonsDemo() {
  const { ref, step } = useSteps(REASONS.length, 420);
  return (
    <div ref={ref} className="flex h-full flex-col justify-center">
      <div className="rounded-control bg-ink-well p-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-card-desc font-semibold text-on-ink">Upper B moved to Friday</span>
          <span className="rounded-pill bg-pink px-2 py-0.5 text-meta font-semibold text-on-ink">Accepted</span>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {REASONS.map((r, i) => (
            <li key={r} className={"flex items-center gap-2 text-card-desc text-on-ink-muted " + show(step > i)}>
              <Check className="size-3.5 shrink-0 text-accent-on-ink" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-ink-border pt-2.5 text-meta text-on-ink-subtle">
          Saved 13 Nov · worked out by the engine
        </div>
      </div>
    </div>
  );
}

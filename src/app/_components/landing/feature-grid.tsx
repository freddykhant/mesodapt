import {
  CalendarRange,
  CircleGauge,
  ClipboardCheck,
  Dumbbell,
  Gauge,
  Grid2x2,
  Undo2,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { DEMO_CUE } from "./demo-cue";
import { PROGRESSION, READINESS_SERIES } from "./demo-data";
import { Container, LandingSection } from "./primitives";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
  art?: ReactNode;
};

// The rest of the app, each tagged with when it does its job. Every claim here is live in the product today.
const FEATURES: Feature[] = [
  {
    icon: Undo2,
    title: "Missed a session",
    body: "It offers ways to make it up and marks the one it would pick. Your plan stays put until you choose.",
    art: <MissedArt />,
  },
  {
    icon: Gauge,
    title: "Readiness",
    body: "Fitness, fatigue and form from the sets you log, so you know how fresh you are before you train.",
    art: <ReadinessArt />,
  },
  {
    icon: Utensils,
    title: "Fuel cues",
    body: "Lifting in the morning and running at night? It tells you roughly how much to eat in between.",
    art: <CueArt />,
  },
  {
    icon: ClipboardCheck,
    title: "Sunday check-in",
    body: "Tell it how each muscle feels and it sets next week's numbers to match, sore quads included.",
    art: <CheckInArt />,
  },
  {
    icon: CalendarRange,
    title: "A block written for you",
    body: "Your days, your split and how long you've been lifting become six weeks of training.",
  },
  {
    icon: CircleGauge,
    title: "Volume that fits",
    body: "Each muscle's weekly sets sit between what grows it and what you can recover from.",
  },
  {
    icon: Dumbbell,
    title: "Set-by-set logging",
    body: "Weight, reps and how many you had left in the tank, for every set you do.",
  },
  {
    icon: Grid2x2,
    title: "Your week board",
    body: "Drag sessions between days and mark the ones you can't train. It warns you before recovery suffers.",
  },
];

/** Everything else the app does, as a hairline grid: four with a small picture of the feature, four compact. */
export function FeatureGrid() {
  return (
    <LandingSection
      id="week"
      labelledBy="features-title"
      className="overflow-hidden pt-28 pb-32 sm:pt-36"
    >
      {/* A faint page grid behind the section, fading out at the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [mask-image:radial-gradient(60%_55%_at_50%_45%,#000,transparent)] bg-[size:56px_56px]"
      />
      <Container>
        <div className="mx-auto max-w-[640px] text-center">
          <h2
            id="features-title"
            className="text-landing-h2 text-fg mt-3 text-balance"
          >
            Everything your training week{" "}
            <span className="text-sky">needs</span>
          </h2>
        </div>

        <ul className="rounded-card border-border bg-border mt-16 grid gap-px overflow-hidden border sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <FeatureCell key={f.title} feature={f} />
          ))}
        </ul>
      </Container>
    </LandingSection>
  );
}

function FeatureCell({ feature: f }: { feature: Feature }) {
  const Icon = f.icon;
  return (
    <li className="bg-canvas flex flex-col p-6 sm:p-7">
      <div className="flex items-center gap-2.5">
        <Icon className="text-sky-strong size-[18px] shrink-0" aria-hidden />
        <h3 className="text-card-title text-fg">{f.title}</h3>
      </div>
      {/* The little hook from the icon down into the description. */}
      <p className="text-card-desc text-fg-muted before:border-border-strong relative mt-1.5 pl-7 before:absolute before:top-[-2px] before:left-[8px] before:h-[12px] before:w-[10px] before:rounded-bl-[5px] before:border-b before:border-l">
        {f.body}
      </p>
      {f.art ? (
        <div
          aria-hidden
          className="mt-7 flex h-[150px] items-center justify-center [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]"
        >
          {f.art}
        </div>
      ) : null}
      <div className="mt-auto flex items-center gap-3 pt-6">
        <span className="bg-border h-px flex-1" />
        <span className="text-fg-subtle font-mono text-[11px] tracking-[0.06em] uppercase">
          {f.when}
        </span>
      </div>
    </li>
  );
}

/* ── The pictures: small, pale versions of the real screens ────────────────────────────────────────── */

const card =
  "rounded-control border border-border bg-surface-raised shadow-card";

function MissedArt() {
  const options = [
    "Make it up Wednesday",
    "Fold half into Upper B",
    "Let it go",
  ];
  return (
    <div className="flex w-full max-w-[220px] flex-col gap-1.5">
      {options.map((o, i) => (
        <div
          key={o}
          className={
            card +
            " flex items-center justify-between gap-2 px-2.5 py-2 text-[12px] leading-4" +
            (i === 0
              ? "border-sky/60 text-fg ring-sky/10 ring-[3px]"
              : "text-fg-subtle")
          }
        >
          <span className="truncate">{o}</span>
          {i === 0 ? (
            <span className="rounded-pill bg-sky/12 text-sky-strong shrink-0 px-1.5 text-[10px] font-semibold">
              Pick
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ReadinessArt() {
  const W = 220;
  const H = 96;
  const values = READINESS_SERIES.flatMap((p) => [p.fitness, p.fatigue]);
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const pt = (i: number, v: number) =>
    `${(i / (READINESS_SERIES.length - 1)) * W},${8 + (1 - (v - min) / span) * (H - 16)}`;
  const line = (key: "fitness" | "fatigue") =>
    READINESS_SERIES.map((p, i) => pt(i, p[key])).join(" ");
  const last = READINESS_SERIES.at(-1)!;
  return (
    <div className={card + " w-full max-w-[240px] p-2.5"}>
      <div className="flex items-center justify-between text-[11px] leading-4">
        <span className="text-fg font-semibold">Form</span>
        <span className="rounded-pill bg-sky/12 text-sky-strong px-1.5 font-semibold">
          Productive
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-1.5 h-[84px] w-full overflow-visible"
      >
        <polyline
          points={line("fatigue")}
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          className="stroke-fg-subtle/60"
        />
        <polyline
          points={line("fitness")}
          fill="none"
          strokeWidth={2.2}
          strokeLinecap="round"
          className="stroke-sky"
        />
        <circle
          cx={W}
          cy={pt(READINESS_SERIES.length - 1, last.fitness).split(",")[1]}
          r={3.5}
          className="fill-sky"
        />
      </svg>
    </div>
  );
}

function CueArt() {
  return (
    <div className="flex w-full max-w-[230px] flex-col gap-2">
      <div className="flex gap-1.5 text-[11px] leading-4">
        <span className={card + " text-fg px-2 py-1 font-semibold"}>
          Lower B · AM
        </span>
        <span className="bg-border-strong h-px flex-1 self-center" />
        <span className={card + " text-fg px-2 py-1 font-semibold"}>
          Run · PM
        </span>
      </div>
      <div className={card + " p-2.5"}>
        <div className="text-fg flex items-center gap-1.5 text-[12px] leading-4 font-semibold">
          <Utensils className="text-pink size-3.5" aria-hidden />
          {DEMO_CUE.title}
        </div>
        <p className="text-fg-muted mt-1 text-[11px] leading-[15px] tabular-nums">
          {DEMO_CUE.line}
        </p>
      </div>
    </div>
  );
}

function CheckInArt() {
  return (
    <div className={card + " w-full max-w-[220px] px-2.5 py-1.5"}>
      {PROGRESSION.map((p, i) => (
        <div
          key={p.muscle}
          className={
            "flex items-center justify-between gap-2 py-1.5 text-[12px] leading-4 tabular-nums " +
            (i > 0 ? "border-border border-t" : "")
          }
        >
          <span className="text-fg">{p.muscle}</span>
          {p.to === null ? (
            <span className="text-fg-subtle">{p.from} · hold</span>
          ) : (
            <span className="text-fg font-semibold">
              {p.from} <span className="text-fg-subtle">→</span>{" "}
              <span className="text-sky-strong">{p.to}</span>
            </span>
          )}
        </div>
      ))}
      <div className="flex justify-end pt-1 pb-0.5">
        <span className="rounded-pill bg-ink text-on-ink px-2 py-0.5 text-[10px] font-semibold">
          Accept week 4
        </span>
      </div>
    </div>
  );
}

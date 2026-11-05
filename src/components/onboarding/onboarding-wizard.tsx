"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CircleAlert } from "lucide-react";
import {
  MUSCLE_GROUPS,
  type ExperienceLevel,
  type MuscleGroup,
  type ScheduleMode,
  type Sex,
  type SplitType,
} from "~/schema";
import { api } from "~/trpc/react";
import type { AvailabilityCellInput } from "~/engine/schedule";
import { buildSessionSlots } from "~/engine/split";
import { AvailabilityGrid } from "~/components/schedule/availability-grid";
import { openDayCount } from "~/components/schedule/availability";
import { Button, Callout, VolumeBars } from "~/components/ui-kit/app-shell-kit";
import { blockShape } from "./block-shape";

const SPLIT_OPTIONS: { value: SplitType; label: string; hint: string }[] = [
  { value: "FULL_BODY", label: "Full Body", hint: "Every muscle in every session. Good if you train two or three days a week." },
  { value: "UPPER_LOWER", label: "Upper / Lower", hint: "Upper body one day, lower body the next." },
  { value: "PUSH_PULL_LEGS", label: "Push / Pull / Legs", hint: "Pushing muscles, pulling muscles, then legs. Suits five or six days a week." },
];

const PROFICIENCY_OPTIONS: { value: ExperienceLevel; label: string; hint: string }[] = [
  { value: "BEGINNER", label: "Beginner", hint: "New to structured training. Your first block runs 4 weeks." },
  { value: "INTERMEDIATE", label: "Intermediate", hint: "A year or two of steady training. Your first block runs 6 weeks." },
  { value: "ADVANCED", label: "Advanced", hint: "Years of hard training. Your first block runs 8 weeks." },
];

function muscleLabel(m: string): string {
  return m.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const STEPS: { title: string; subtitle: string }[] = [
  {
    title: "About you",
    subtitle:
      "Your bodyweight sizes the carb and protein amounts in your coach cues. I keep age, sex and height on your profile too, though nothing in the plan uses them today.",
  },
  {
    title: "Your schedule",
    subtitle: "Pick what a normal week allows. Every session gets built to fit under your cap.",
  },
  { title: "Your split", subtitle: "This decides which muscles share a session. Pick the one you'd look forward to." },
  {
    title: "Experience & priorities",
    subtitle: "This sets how long your first block runs, and which muscles get first claim on your session time.",
  },
  {
    title: "Your week",
    subtitle: "Tell me when you can train. You can change this any time in Settings.",
  },
];

export function OnboardingWizard() {
  const router = useRouter();
  const createPlan = api.onboarding.createPlan.useMutation({
    onSuccess: () => {
      router.refresh();
      router.push("/app/block");
    },
  });

  const [step, setStep] = useState(0);

  // Bio + logistics kept as strings so number inputs can be cleared; parsed on submit.
  const [sex, setSex] = useState<Sex | null>(null);
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionLengthCapMin, setSessionLengthCapMin] = useState("75");
  const [splitType, setSplitType] = useState<SplitType>("UPPER_LOWER");
  const [proficiency, setProficiency] = useState<ExperienceLevel>("INTERMEDIATE");
  const [priorityMuscles, setPriorityMuscles] = useState<MuscleGroup[]>([]);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("DAY");
  const [availability, setAvailability] = useState<AvailabilityCellInput[]>([]);

  const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

  const stepValid = (s: number): boolean => {
    if (s === 0) {
      const a = num(age), h = num(heightCm), w = num(weightKg);
      return (
        sex !== null &&
        Number.isInteger(a) && a >= 13 && a <= 100 &&
        h >= 120 && h <= 250 &&
        w >= 30 && w <= 300
      );
    }
    if (s === 1) {
      const cap = num(sessionLengthCapMin);
      return daysPerWeek >= 1 && daysPerWeek <= 7 && Number.isInteger(cap) && cap >= 15 && cap <= 240;
    }
    return true; // steps 2–4 always have a valid default selection
  };

  const canContinue = stepValid(step);
  const isLast = step === STEPS.length - 1;

  function togglePriority(m: MuscleGroup) {
    setPriorityMuscles((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : prev.length >= 3 ? prev : [...prev, m],
    );
  }

  function submit() {
    if (sex === null) return;
    createPlan.mutate({
      sex,
      age: num(age),
      heightCm: num(heightCm),
      weightKg: num(weightKg),
      daysPerWeek,
      sessionLengthCapMin: num(sessionLengthCapMin),
      splitType,
      proficiency,
      priorityMuscles,
      scheduleMode,
      availability,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });
  }

  const cap = num(sessionLengthCapMin);
  const stage = (
    <BlockStage
      step={step}
      isLast={isLast}
      daysPerWeek={daysPerWeek}
      capMin={stepValid(1) ? cap : null}
      splitType={splitType}
      proficiency={proficiency}
      priorityMuscles={priorityMuscles}
      openDays={openDayCount(availability)}
    />
  );

  return (
    <div className="grid gap-x-16 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="flex min-w-0 flex-col gap-8">
        {/* Progress */}
        <div className="flex items-center gap-3">
          <ol className="flex flex-1 gap-1.5" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                aria-current={i === step ? "step" : undefined}
                className={
                  "h-1 flex-1 rounded-pill transition-colors duration-300 ease-soft " +
                  (i <= step ? "bg-sky" : "bg-press")
                }
              >
                <span className="sr-only">
                  {s.title}
                  {i < step ? " (done)" : i === step ? " (current)" : ""}
                </span>
              </li>
            ))}
          </ol>
          <span className="text-meta tabular-nums text-fg-subtle" aria-hidden>
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Step heading + fields — keyed so each step rises in */}
        <div key={step} className="animate-rise flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-page-title text-balance text-fg">{STEPS[step]!.title}</h1>
            <p className="max-w-[52ch] text-body text-fg-muted">{STEPS[step]!.subtitle}</p>
          </div>

          <div className="flex flex-col gap-7">
            {step === 0 && (
              <>
                <FieldGroup legend="Sex">
                  <div className="grid grid-cols-2 gap-2">
                    {(["MALE", "FEMALE"] as const).map((s) => (
                      <Choice key={s} selected={sex === s} onClick={() => setSex(s)}>
                        {s === "MALE" ? "Male" : "Female"}
                      </Choice>
                    ))}
                  </div>
                </FieldGroup>
                <NumberField label="Age" value={age} onChange={setAge} placeholder="28" />
                <div className="grid grid-cols-2 gap-4">
                  <NumberField label="Height" value={heightCm} onChange={setHeightCm} placeholder="180" unit="cm" />
                  <NumberField label="Weight" value={weightKg} onChange={setWeightKg} placeholder="82" unit="kg" />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <FieldGroup legend="Training days per week">
                  <div className="grid grid-cols-7 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <Choice key={d} selected={daysPerWeek === d} onClick={() => setDaysPerWeek(d)}>
                        <span className="tabular-nums">{d}</span>
                      </Choice>
                    ))}
                  </div>
                </FieldGroup>
                <NumberField
                  label="Session length cap"
                  value={sessionLengthCapMin}
                  onChange={setSessionLengthCapMin}
                  placeholder="75"
                  unit="min"
                  hint="Warm-up included. Anything from 15 to 240 minutes."
                />
              </>
            )}

            {step === 2 && (
              <FieldGroup legend="Split" hideLegend>
                <div className="flex flex-col gap-2">
                  {SPLIT_OPTIONS.map((o) => (
                    <CardChoice
                      key={o.value}
                      selected={splitType === o.value}
                      onClick={() => setSplitType(o.value)}
                      title={o.label}
                      hint={o.hint}
                    />
                  ))}
                </div>
              </FieldGroup>
            )}

            {step === 3 && (
              <>
                <FieldGroup legend="Experience">
                  <div className="flex flex-col gap-2">
                    {PROFICIENCY_OPTIONS.map((o) => (
                      <CardChoice
                        key={o.value}
                        selected={proficiency === o.value}
                        onClick={() => {
                          setProficiency(o.value);
                          if (o.value === "BEGINNER") setPriorityMuscles([]);
                        }}
                        title={o.label}
                        hint={o.hint}
                      />
                    ))}
                  </div>
                </FieldGroup>
                {proficiency === "BEGINNER" ? (
                  <Note>
                    A beginner block gives every muscle the same weight, so priority muscles are switched off here.
                  </Note>
                ) : (
                  <FieldGroup
                    legend={
                      <>
                        Priority muscles{" "}
                        <span className="font-normal text-fg-subtle">
                          · optional, <span className="tabular-nums">{priorityMuscles.length}</span> of 3
                        </span>
                      </>
                    }
                  >
                    <p className="-mt-1 mb-3 text-card-desc text-fg-muted">
                      These go into your sessions first, so they keep their sets if time runs short.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MUSCLE_GROUPS.map((m) => {
                        const on = priorityMuscles.includes(m);
                        const disabled = !on && priorityMuscles.length >= 3;
                        return (
                          <button
                            key={m}
                            type="button"
                            disabled={disabled}
                            aria-pressed={on}
                            onClick={() => togglePriority(m)}
                            className={
                              "inline-flex h-8 items-center gap-1.5 rounded-pill border px-3.5 text-nav transition-[background-color,border-color,color,opacity] duration-200 active:scale-[0.98] " +
                              (on
                                ? "border-sky bg-sunken text-sky-strong"
                                : disabled
                                  ? "cursor-not-allowed border-border-subtle bg-surface text-fg-subtle opacity-50"
                                  : "border-border bg-surface-raised text-fg-soft shadow-control hover:border-border-strong hover:text-fg")
                            }
                          >
                            {on ? <Check className="-ml-0.5 size-3.5" strokeWidth={2.5} aria-hidden /> : null}
                            {muscleLabel(m)}
                          </button>
                        );
                      })}
                    </div>
                  </FieldGroup>
                )}
              </>
            )}

            {step === 4 && (
              <>
                <FieldGroup legend="How you plan your week">
                  <div className="flex flex-col gap-2">
                    <CardChoice
                      selected={scheduleMode === "DAY"}
                      onClick={() => setScheduleMode("DAY")}
                      title="One session a day"
                      hint="Plan by day. The simplest view."
                    />
                    <CardChoice
                      selected={scheduleMode === "HALF_DAY"}
                      onClick={() => setScheduleMode("HALF_DAY")}
                      title="AM / PM"
                      hint="Plan by morning and afternoon, with room for two-a-days."
                    />
                  </div>
                </FieldGroup>
                <FieldGroup
                  legend={
                    <>
                      When you can train <span className="font-normal text-fg-subtle">· optional</span>
                    </>
                  }
                >
                  <p className="-mt-1 mb-3 text-card-desc text-fg-muted">
                    Tap a slot to cycle Available, Preferred and Blocked. Leave it alone and every day counts as
                    available.
                  </p>
                  <AvailabilityGrid mode={scheduleMode} value={availability} onChange={setAvailability} />
                </FieldGroup>
                {openDayCount(availability) < daysPerWeek ? (
                  <Note>
                    You train {daysPerWeek} days a week but have left {openDayCount(availability)} open
                    {scheduleMode === "HALF_DAY" ? ", so some days will have two sessions or stay unplaced" : ", so some sessions will start unplaced"}.
                    You can place them yourself afterwards.
                  </Note>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Phones: the block shows up once, right before you create it. */}
        {isLast ? <div className="lg:hidden">{stage}</div> : null}

        {createPlan.isError && <Callout icon={CircleAlert}>{createPlan.error.message}</Callout>}

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-border-subtle pt-6">
          <Button
            variant="ghost"
            size="lg"
            icon={ArrowLeft}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || createPlan.isPending}
            aria-hidden={step === 0 ? true : undefined}
            className={"-ml-3 " + (step === 0 ? "invisible" : "")}
          >
            Back
          </Button>
          {isLast ? (
            <Button variant="primary" size="lg" onClick={submit} loading={createPlan.isPending}>
              Create my plan
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              trailingIcon={ArrowRight}
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue}
            >
              Continue
            </Button>
          )}
        </div>
      </div>

      {/* Wide screens: the block stays pinned beside the steps and fills in as you answer. */}
      <aside aria-label="Your first block" className="hidden lg:block">
        <div className="sticky top-10 pt-11">{stage}</div>
      </aside>
    </div>
  );
}

/* ── The block, building as you answer ─────────────────────────────────────────────────────────── */

/** The first block, drawn from the wizard's own answers: the template's weeks, the split's session names, the
 *  cap and the open days. Nothing here is fetched; it is what `createPlan` will build from the same input. */
function BlockStage({
  step,
  isLast,
  daysPerWeek,
  capMin,
  splitType,
  proficiency,
  priorityMuscles,
  openDays,
}: {
  step: number;
  isLast: boolean;
  daysPerWeek: number;
  /** Null while the cap field doesn't hold a valid number. */
  capMin: number | null;
  splitType: SplitType;
  proficiency: ExperienceLevel;
  priorityMuscles: MuscleGroup[];
  openDays: number;
}) {
  const shape = blockShape(proficiency);
  const hardWeeks = shape.filter((w) => !w.deload).length;
  const deloadWeek = shape.find((w) => w.deload)?.week ?? shape.length;
  const sessions = buildSessionSlots(splitType, daysPerWeek).map((s) => s.label);
  const showWeeks = step >= 3;
  const summary =
    `Weeks 1 to ${hardWeeks} plan the same sets. Week ${deloadWeek} is a deload at about half of them.`;

  return (
    <div className="relative">
      {/* A sky glow for the card to float on, the landing stage's. Onboarding is the one app screen that has it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -top-6 -bottom-10 -z-10 hidden rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-sky)_22%,transparent),transparent)] blur-2xl lg:block"
      />
      <div className="rounded-card border border-border bg-surface-raised p-5 shadow-pop sm:p-6">
        <div className="text-eyebrow font-medium text-fg-subtle">Block 1</div>
        <h2 className={"mt-1 text-fg " + (isLast ? "text-section" : "text-card-title")}>
          {isLast ? "Here's your block" : "Your first block"}
        </h2>
        <p className="mt-1 text-card-desc text-fg-muted">
          {step === 0
            ? "It fills in as you answer. Nothing is saved until you press Create my plan."
            : showWeeks
              ? `${shape.length} weeks, ${daysPerWeek} ${daysPerWeek === 1 ? "session" : "sessions"} a week.`
              : "It fills in as you answer."}
        </p>

        <div className="mt-5">
          {showWeeks ? (
            // Re-keyed so the bars grow again for a new block length, and once more for the reveal.
            <div key={`${proficiency}-${isLast}`}>
              <VolumeBars
                weeks={shape.map((w) => ({ label: `W${w.week}`, sets: w.scale, deload: w.deload }))}
                current={0}
                summary={`${summary} Week 1 is where you start.`}
              />
              <p className="mt-3 text-meta text-fg-muted">{summary}</p>
            </div>
          ) : (
            <div className="flex h-[148px] items-center justify-center rounded-control bg-sunken px-6 text-center text-meta text-fg-muted">
              Your weeks show up once you pick your experience.
            </div>
          )}
        </div>

        {step >= 1 ? (
          <dl className="mt-5 flex flex-col divide-y divide-border-subtle border-t border-border-subtle">
            {step >= 2 ? (
              <Fact label="Each week">
                <ul className="flex flex-wrap justify-end gap-1">
                  {sessions.map((s) => (
                    <li key={s} className="rounded-pill bg-sunken px-2 py-0.5 text-meta font-medium text-fg-soft">
                      {s}
                    </li>
                  ))}
                </ul>
              </Fact>
            ) : (
              <Fact label="Each week">
                <span className="tabular-nums">
                  {daysPerWeek} {daysPerWeek === 1 ? "session" : "sessions"}
                </span>
              </Fact>
            )}
            <Fact label="Session cap">
              {capMin === null ? "Not set yet" : <span className="tabular-nums">{capMin} min</span>}
            </Fact>
            {showWeeks && proficiency !== "BEGINNER" && priorityMuscles.length > 0 ? (
              <Fact label="Filled first">{priorityMuscles.map(muscleLabel).join(", ")}</Fact>
            ) : null}
            {step >= 4 ? (
              <Fact label="Open days">
                <span className="tabular-nums">{openDays} of 7</span>
              </Fact>
            ) : null}
          </dl>
        ) : null}

        {isLast ? (
          <p className="mt-5 rounded-control bg-sunken px-3.5 py-3 text-card-desc text-fg-soft">
            Week 1 starts the day you create it. After each weekly check-in Mesodapt proposes next week&apos;s sets,
            and they only change if you accept.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex animate-fade items-start justify-between gap-4 py-3">
      <dt className="shrink-0 text-card-desc text-fg-muted">{label}</dt>
      <dd className="min-w-0 text-right text-card-desc font-medium text-fg">{children}</dd>
    </div>
  );
}

/* ── Fields ────────────────────────────────────────────────────────────────────────────────────── */

const INPUT =
  "h-11 w-full rounded-control border border-transparent bg-sunken px-3 text-body tabular-nums text-fg outline-none " +
  "transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-fg-subtle " +
  "hover:bg-press focus:border-border-strong focus:bg-surface-raised focus:shadow-control " +
  // hide the number spinners
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const LABEL = "text-nav font-medium text-fg-soft";

/** A labelled group of buttons. fieldset + legend, not <label>: a label would forward clicks on its text to the first button. */
function FieldGroup({
  legend,
  hideLegend,
  children,
}: {
  legend: React.ReactNode;
  /** When the step heading already says it: keep the group name for screen readers only. */
  hideLegend?: boolean;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className={hideLegend ? "sr-only" : "mb-2.5 p-0 " + LABEL}>{legend}</legend>
      {children}
    </fieldset>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="rounded-control bg-sunken px-3.5 py-3 text-card-desc text-fg-muted">{children}</p>;
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
  unit,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  unit?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className={LABEL}>{label}</span>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT + (unit ? " pr-12" : "")}
        />
        {unit ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-nav text-fg-subtle">
            {unit}
          </span>
        ) : null}
      </div>
      {hint ? <span className="-mt-1 text-meta text-fg-muted">{hint}</span> : null}
    </label>
  );
}

// Selection is sky, the brand: picking an answer isn't live state, so the one pink stays on the block's week 1.
function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        "h-11 rounded-control border text-list transition-[background-color,border-color,color,box-shadow] duration-200 active:scale-[0.98] " +
        (selected
          ? "border-sky bg-sunken text-sky-strong ring-1 ring-sky"
          : "border-border bg-surface-raised text-fg-soft shadow-control hover:border-border-strong hover:text-fg")
      }
    >
      {children}
    </button>
  );
}

function CardChoice({
  selected,
  onClick,
  title,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        "flex items-start gap-3.5 rounded-callout border p-4 text-left transition-[background-color,border-color,box-shadow] duration-200 " +
        (selected
          ? "border-sky bg-sunken ring-1 ring-sky"
          : "border-border bg-surface-raised shadow-control hover:border-border-strong")
      }
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-list text-fg">{title}</span>
        <span className="text-card-desc text-fg-muted">{hint}</span>
      </span>
      <span
        aria-hidden
        className={
          "mt-px flex size-5 shrink-0 items-center justify-center rounded-pill border transition-colors duration-200 " +
          (selected ? "border-ink bg-ink text-on-ink" : "border-border-strong bg-surface-raised")
        }
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

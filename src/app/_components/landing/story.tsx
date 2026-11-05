"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Chip, buttonClass } from "~/components/ui-kit/app-shell-kit";
import { Container } from "./primitives";
import { STORY_MESSAGE, storyStateAt, type StoryState } from "./story-script";

const CAPTIONS = [
  {
    title: "Date night lands on a Thursday",
    body: "Mesodapt understands there's more to life, we'll make your training work and you enjoy date night.",
  },
  {
    title: "Your session finds Friday, enjoy your date night",
    body: "Looks like Friday works: your upper body has had adequate rest since Monday, and you still get every set in.",
  },
  {
    title: "You get the final say",
    body: "Mesodapt proposes the new scheduled session, but nothing changes until you accept. You can also move it back to Thursday if you want.",
  },
  {
    title: "Zoom out and that week is one of six",
    body: "Your training builds a little every week, up to about as much as your body can recover from. Then comes an easy week to recharge, and the next block starts stronger than the last one did.",
  },
  {
    title: "Run a line across the tops",
    body: "and you've drawn the logo. I wanted the M to be the shape the app spends all its time building for you.",
  },
];

/**
 * The scroll story, straight after the orbit hero. A short lead-in sits where the story starts. The stage (the week board, later the block) stays pinned while
 * the captions scroll past, and each caption changes what's on it. Position is read from the captions' boxes on
 * every scroll frame and handed to `storyStateAt`, so scrolling back up plays it backwards. Purely
 * presentational: nothing here talks to the engine.
 */
export function Story() {
  const steps = useRef<(HTMLElement | null)[]>([]);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      // Phones pin the stage at the top, so the reading line sits lower, in the space under it.
      const line =
        window.innerHeight *
        (window.matchMedia("(min-width: 1024px)").matches ? 0.5 : 0.66);
      let p = 0;
      steps.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top <= line) p = i + Math.min(1, (line - r.top) / r.height);
      });
      setPos(Math.round(p * 1000) / 1000);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const s = storyStateAt(pos);
  const active = Math.floor(pos);

  return (
    <section id="story" aria-labelledby="story-title" className="relative">
      <Container className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.25fr)] lg:gap-x-14">
        <div
          ref={(el) => {
            steps.current[0] = el;
          }}
          className="flex flex-col justify-center pt-12 pb-10 sm:pt-16 lg:col-start-1 lg:min-h-[calc(100svh-96px)] lg:pt-0 lg:pb-16"
        >
          <h2
            id="story-title"
            className="text-landing-h3 text-fg max-w-[18ch] text-balance"
          >
            Here&apos;s what that looks like in a real week
          </h2>
        </div>

        {/* The stage. On phones it pins to the top and the captions scroll up underneath it. */}
        <div className="bg-canvas sticky top-0 z-10 -mx-4 [mask-image:linear-gradient(to_bottom,#000_calc(100%-24px),transparent)] px-4 pt-3 pb-6 sm:-mx-8 sm:px-8 lg:top-[calc(50svh-230px)] lg:col-start-2 lg:row-start-1 lg:row-end-7 lg:mx-0 lg:self-start lg:bg-transparent lg:[mask-image:none] lg:p-0">
          <p className="sr-only">
            Demo: you tell Mesodapt you can&apos;t train Thursday because of
            date night, and it proposes moving Upper B to Friday. Nothing
            changes until you accept. Zoomed out, that week sits in a block
            whose weekly training climbs, eases off for a week and climbs again,
            tracing the M in the logo.
          </p>
          <Stage s={s} />
        </div>

        {CAPTIONS.map((c, i) => (
          <div
            key={c.title}
            id={`step-${i + 1}`}
            ref={(el) => {
              steps.current[i + 1] = el;
            }}
            className="flex min-h-[64svh] items-center lg:col-start-1 lg:min-h-[88svh]"
          >
            <div
              className={
                "max-w-[42ch] transition-opacity duration-500 " +
                (active === i + 1 ? "opacity-100" : "lg:opacity-40")
              }
            >
              <div className="text-nav text-sky-strong font-semibold tabular-nums">
                0{i + 1}
              </div>
              <h2 className="text-landing-h3 text-fg mt-2 text-balance">
                {c.title}
              </h2>
              <p className="text-body text-fg-muted mt-4 sm:text-[17px] sm:leading-[26px]">
                {c.body}
              </p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

/* ── The stage ─────────────────────────────────────────────────────────────────────────────────────── */

function Stage({ s }: { s: StoryState }) {
  return (
    <div aria-hidden className="relative h-[318px] sm:h-[392px] lg:h-[460px]">
      {/* A sky glow the stage floats on, warming to pink once something on it is live. */}
      <div className="pointer-events-none absolute -inset-x-10 top-6 bottom-10 -z-10 hidden rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-sky)_26%,transparent),transparent)] blur-2xl lg:block" />
      <div
        className={
          "pointer-events-none absolute right-0 bottom-0 -z-10 hidden size-72 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-pink)_22%,transparent),transparent)] blur-2xl transition-opacity duration-700 lg:block " +
          (s.moved && !s.zoomed ? "opacity-100" : "opacity-0")
        }
      />
      <WeekCard s={s} />
      <AcceptCard shown={s.proposed} />
      <BlockChart shown={s.zoomed} draw={s.draw} />
    </div>
  );
}

const DAYS = [
  { short: "M", day: "Mon", date: 10 },
  { short: "T", day: "Tue", date: 11 },
  { short: "W", day: "Wed", date: 12 },
  { short: "T", day: "Thu", date: 13 },
  { short: "F", day: "Fri", date: 14 },
  { short: "S", day: "Sat", date: 15 },
  { short: "S", day: "Sun", date: 16 },
] as const;

// `short` is the phone label: a 7-day board leaves ~40px per session card at 360px.
const PLANNED: Record<string, { name: string; short: string; sets: number }> = {
  Mon: { name: "Upper A", short: "Up A", sets: 18 },
  Tue: { name: "Lower A", short: "Lo A", sets: 16 },
  Sat: { name: "Lower B", short: "Lo B", sets: 15 },
};

function WeekCard({ s }: { s: StoryState }) {
  const typing = s.typed.length > 0 && s.typed.length < STORY_MESSAGE.length;
  // The coach box wears the prism edge only while the model is reading what you typed.
  const reading = s.typed.length > 0 && !s.moved;
  return (
    <div
      className={
        "rounded-card border-border bg-surface shadow-pop absolute inset-x-0 top-0 border p-3 transition-[opacity,transform,filter] duration-500 ease-[var(--ease-out)] sm:p-4 " +
        (s.zoomed
          ? "pointer-events-none -translate-y-4 scale-[0.94] opacity-0 blur-[3px]"
          : "")
      }
    >
      <div
        className={
          "rounded-pill bg-surface-raised text-body shadow-control flex h-11 items-center gap-2 border pr-1.5 pl-4 transition-colors " +
          (reading ? "border-prism" : "border-border")
        }
      >
        <span
          className={
            "min-w-0 flex-1 truncate " +
            (s.typed ? "text-fg" : "text-fg-subtle")
          }
        >
          {s.typed || "What changed this week?"}
          {typing ? (
            <span className="bg-fg ml-px inline-block h-4 w-px translate-y-[3px]" />
          ) : null}
        </span>
        <span className="bg-ink text-on-ink flex size-8 shrink-0 items-center justify-center rounded-full">
          <ArrowRight className="size-4" />
        </span>
      </div>

      <div className="mt-4 mb-2.5 flex items-center justify-between gap-2 px-0.5">
        <span className="text-nav text-fg font-semibold">Week 3 of 6</span>
        <Chip tone="building">Form · Productive</Chip>
      </div>

      <div className="grid grid-cols-7 gap-1 [--hop:8px] sm:gap-1.5 sm:[--hop:14px]">
        {DAYS.map((d) => {
          const planned = PLANNED[d.day];
          const isThu = d.day === "Thu";
          return (
            <div key={d.day} className="min-w-0">
              <div className="text-fg-subtle truncate px-0.5 pb-1.5 text-[11px] leading-4 tabular-nums">
                <span className="text-fg-soft font-semibold">
                  <span className="sm:hidden">{d.short}</span>
                  <span className="hidden sm:inline">{d.day}</span>
                </span>
                <span className="hidden md:inline"> {d.date}</span>
              </div>
              <div
                className={
                  "rounded-tile relative flex min-h-[92px] flex-col gap-1 p-0.5 transition-colors duration-300 sm:min-h-[132px] sm:p-1 " +
                  (isThu && s.busy
                    ? "bg-[repeating-linear-gradient(135deg,var(--color-press)_0_5px,transparent_5px_10px)]"
                    : "bg-sunken")
                }
              >
                {isThu ? <Traveller s={s} /> : null}
                {planned ? (
                  <Session
                    name={planned.name}
                    short={planned.short}
                    sets={planned.sets}
                    look="planned"
                  />
                ) : null}
                {d.day === "Sat" ? (
                  <span className="bg-press text-fg-soft rounded-[7px] px-1 py-1 text-[11px] leading-[14px] sm:px-1.5">
                    Run<span className="hidden sm:inline"> · easy</span>
                  </span>
                ) : null}
                {isThu ? (
                  <span
                    className={
                      "text-fg-muted mt-auto px-0.5 pb-0.5 text-[11px] leading-4 font-medium transition-opacity duration-300 " +
                      (s.busy ? "opacity-100" : "opacity-0")
                    }
                  >
                    <span className="md:hidden">Busy</span>
                    <span className="hidden md:inline">Date night</span>
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Upper B: leaves a dashed outline on Thursday and slides one column right, onto Friday. */
function Traveller({ s }: { s: StoryState }) {
  const hop: CSSProperties = {
    transform: s.moved
      ? "translateX(calc(100% + var(--hop)))"
      : "translateX(0)",
  };
  return (
    <div className="relative">
      <div
        className={
          "transition-opacity duration-300 " +
          (s.busy ? "opacity-100" : "opacity-0")
        }
      >
        <Session name="Upper B" short="Up B" sets={17} look="ghost" />
      </div>
      <div
        style={hop}
        className="absolute inset-0 z-10 transition-transform duration-700 ease-[var(--ease-out)]"
      >
        <Session
          name="Upper B"
          short="Up B"
          sets={17}
          look={s.moved ? "moved" : "planned"}
        />
      </div>
    </div>
  );
}

function Session({
  name,
  short,
  sets,
  look,
}: {
  name: string;
  short: string;
  sets: number;
  look: "planned" | "ghost" | "moved";
}) {
  const cls = {
    planned: "border-border bg-surface-raised text-fg",
    ghost: "border-dashed border-border-strong bg-transparent text-fg-subtle",
    // The one live signal on the board: the session that just moved.
    moved:
      "border-accent bg-surface-raised text-fg shadow-card ring-[3px] ring-accent/15",
  }[look];
  return (
    <div
      className={
        "h-full overflow-hidden rounded-[7px] border px-1 py-1 text-[11px] leading-[14px] font-semibold whitespace-nowrap transition-[border-color,box-shadow] duration-300 sm:px-1.5 sm:py-1.5 sm:text-[12px] " +
        cls
      }
    >
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{name}</span>
      <span className="text-fg-muted hidden font-normal tabular-nums sm:block">
        {sets} sets
      </span>
    </div>
  );
}

function AcceptCard({ shown }: { shown: boolean }) {
  return (
    <div
      className={
        "border-border bg-surface-raised shadow-pop absolute inset-x-3 top-[176px] z-20 rounded-[18px] border p-4 transition-[opacity,transform] duration-500 ease-[var(--ease-out)] sm:top-[236px] sm:right-[-12px] sm:left-auto sm:w-[340px] lg:top-[262px] lg:right-[-28px] " +
        (shown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0")
      }
    >
      <div className="text-card-title text-fg">Move Upper B to Friday?</div>
      <p className="text-card-desc text-fg-muted mt-1">
        Thursday&apos;s date night. Friday still gives your upper body plenty of
        rest, and you keep all 17 sets.
      </p>
      <div className="mt-3 flex justify-end gap-1.5">
        <span className={buttonClass("ghost", "sm")}>Not now</span>
        <span className={buttonClass("accent", "sm")}>Accept move</span>
      </div>
    </div>
  );
}

/* ── The block, and the M drawn over it ────────────────────────────────────────────────────────────── */

// The mark's own path, so the line drawn over the bars is the logo exactly. See DESIGN.md → Brand.
const M_PATH = "M4 19.25V11.75L10 6.75V15.25H14V9.75L20 4.75V19.25";
const BASE = 19.25;
// Where the M's top edge sits at x: two climbs on the same slope, with the flat deload notch between.
const edge = (x: number) =>
  x <= 10
    ? 11.75 - (x - 4) * (5 / 6)
    : x < 14
      ? 15.25
      : 9.75 - (x - 14) * (5 / 6);
const BAR_W = 0.62;
const CLEAR = 1.0; // room between a bar's top and the line, so the stroke never sits on a bar

const BARS = [
  ...[5, 6, 7, 8, 9].map((x, i) => ({
    x,
    kind: "block" as const,
    week: i + 1,
  })),
  { x: 12, kind: "deload" as const, week: 6 },
  ...[15, 16, 17, 18, 19].map((x, i) => ({
    x,
    kind: "next" as const,
    week: i + 1,
  })),
];

function BlockChart({ shown, draw }: { shown: boolean; draw: number }) {
  return (
    <div
      className={
        "absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 " +
        (shown ? "opacity-100" : "pointer-events-none opacity-0")
      }
    >
      <div className="relative aspect-square h-[88%] max-w-full">
        <svg viewBox="2 3 20 18" className="size-full overflow-visible">
          {BARS.map((b, i) => {
            const top = edge(b.x) + CLEAR;
            const isNow = b.kind === "block" && b.week === 3;
            return (
              <rect
                key={i}
                x={b.x - BAR_W / 2}
                y={top}
                width={BAR_W}
                height={BASE - top}
                rx={BAR_W / 2}
                style={{ transitionDelay: shown ? `${120 + i * 45}ms` : "0ms" }}
                className={
                  "origin-bottom transition-transform duration-500 ease-[var(--ease-out)] [transform-box:fill-box] " +
                  (shown ? "scale-y-100" : "scale-y-0") +
                  (isNow
                    ? "fill-accent"
                    : b.kind === "deload"
                      ? "fill-zone-rest/35"
                      : "fill-sky/45")
                }
              />
            );
          })}
          <path
            d={M_PATH}
            pathLength={1}
            fill="none"
            strokeWidth={0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - draw}
            className="stroke-fg"
          />
        </svg>
        <span
          className={
            "rounded-pill bg-selection text-accent absolute -translate-x-1/2 px-2 py-0.5 text-[11px] leading-4 font-semibold whitespace-nowrap transition-opacity duration-300 " +
            (shown && draw === 0 ? "opacity-100" : "opacity-0")
          }
          style={{
            left: `${((7 - 2) / 20) * 100}%`,
            top: `${((edge(7) + CLEAR - 3) / 18) * 100 - 9}%`,
          }}
        >
          Week 3
        </span>
      </div>
      <div className="text-meta text-fg-muted grid w-[80%] grid-cols-[6fr_4fr_6fr] text-center tabular-nums">
        <span>Weeks 1–5</span>
        <span>Easy week</span>
        <span>Next block</span>
      </div>
    </div>
  );
}

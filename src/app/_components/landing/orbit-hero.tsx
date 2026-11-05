"use client";

import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Mark } from "~/components/ui-kit/app-shell-kit";
import { SignInButton } from "~/app/_components/auth-buttons";
import { AppTile } from "./orbit-logos";
import { DOCK_PULL, ORBIT_APPS, orbitStateAt, type OrbitApp } from "./orbit-script";

// Per ring: its radius var, its turn, and the tile size and strength. Radii live in CSS vars on the orbit so phones
// get a tighter orbit (and no outer ring) without a resize listener.
const RINGS: Record<OrbitApp["ring"], { spin: string; tile: string; opacity: number; phone: boolean }> = {
  0: { spin: "", tile: "size-12 sm:size-14", opacity: 1, phone: true },
  1: { spin: "[animation-direction:reverse] [animation-duration:120s]", tile: "size-10 sm:size-11", opacity: 0.85, phone: true },
  2: { spin: "[animation-duration:150s]", tile: "size-9", opacity: 0.6, phone: false },
};
// The orbit is a tilted ring: everything sits on an ellipse this much shorter than it is wide.
const TILT = 0.72;
// Garmin and Strava drift a little outward while everything else comes in: they wait at the edge, clear of the M.
const DOCK_RADIUS = 1.12;

/**
 * The page's opening: the apps an athlete juggles, orbiting the M. The section is tall and its stage pins; how far
 * you've scrolled through it is handed to `orbitStateAt`, which pulls the apps into the M. Garmin and Strava dock
 * outside it as "Next" because they aren't connected yet. Presentational only.
 */
export function OrbitHero() {
  const section = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
      setProgress(Math.round(p * 1000) / 1000);
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

  const s = orbitStateAt(progress);

  return (
    <section ref={section} id="orbit" aria-labelledby="hero-title" className="relative h-[170svh] sm:h-[200svh]">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 overflow-hidden px-4 pb-6 sm:gap-10">
        <p className="sr-only">
          Hevy, Garmin, Strava, Google Sheets and an AI chat, pulled into one app. Garmin and Strava are connecting next.
        </p>
        <Orbit pulls={s.pulls} glow={s.glow} />

        <div className="grid w-full max-w-[760px] text-center">
          <div
            className={
              "col-start-1 row-start-1 flex flex-col items-center transition-opacity " +
              (s.merged ? "pointer-events-none opacity-0 duration-200" : "opacity-100 duration-500 delay-150")
            }
          >
            <h1 id="hero-title" className="animate-rise text-display text-fg max-w-[22ch] text-balance">
              Experience a <span className="text-sky">truly intelligent</span> training scheduler like never before
            </h1>
            <p className="animate-rise text-body text-fg-muted mt-5 max-w-[52ch] text-balance [animation-delay:60ms] sm:text-[17px] sm:leading-[26px]">
              Work runs late, or a birthday lands on leg day. Tell Mesodapt what came up the way you&apos;d text a mate,
              and it reworks your week so every session still fits with enough rest in between. Nothing moves until you
              say yes.
            </p>
            <div className="animate-rise mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 [animation-delay:120ms]">
              <SignInButton />
              <a
                href="#step-1"
                className="rounded-pill text-nav text-fg-muted hover:text-fg inline-flex items-center gap-1.5 transition-colors"
              >
                Scroll to see it rescue date night
                <ArrowDown className="size-4" aria-hidden />
              </a>
            </div>
          </div>

          <div
            aria-hidden={!s.merged}
            className={
              "col-start-1 row-start-1 flex flex-col items-center justify-center transition-opacity " +
              (s.merged ? "opacity-100 duration-500 delay-150" : "pointer-events-none opacity-0 duration-200")
            }
          >
            <p className="text-display text-fg text-balance">
              One place for <span className="text-sky">all of it</span>
            </p>
            <p className="text-body text-fg-muted mt-5 max-w-[44ch] text-balance sm:text-[17px] sm:leading-[26px]">
              Your training plan and your coach, in one app. Garmin and Strava are joining next.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Orbit({ pulls, glow }: { pulls: Record<OrbitApp["id"], number>; glow: number }) {
  return (
    <div
      aria-hidden
      className="relative h-[230px] w-full max-w-[560px] shrink-0 [--r0:96px] [--r1:146px] [--r2:0px] sm:h-[330px] sm:[--r0:128px] sm:[--r1:184px] sm:[--r2:240px]"
    >
      {/* A sky glow the orbit floats on. */}
      <div className="pointer-events-none absolute inset-x-[10%] inset-y-0 -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-sky)_22%,transparent),transparent)] blur-2xl" />

      {([0, 1, 2] as const).map((ring) => (
        <div key={ring} className={"orbit-spin absolute inset-0 " + RINGS[ring].spin + (RINGS[ring].phone ? "" : " hidden sm:block")}>
          <span
            style={{ width: `calc(var(--r${ring}) * 2)`, height: `calc(var(--r${ring}) * 2 * ${TILT})` }}
            className="border-sky/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border"
          />
          {ORBIT_APPS.filter((a) => a.ring === ring).map((a) => (
            <OrbitTile key={a.id} app={a} pull={pulls[a.id]} />
          ))}
        </div>
      ))}

      <span
        style={{
          boxShadow: `0 0 0 ${8 + glow * 6}px color-mix(in srgb, var(--color-pink) ${glow * 14}%, color-mix(in srgb, var(--color-sky) 10%, transparent)), 0 14px 40px color-mix(in srgb, var(--color-pink) ${glow * 45}%, color-mix(in srgb, var(--color-sky) 35%, transparent))`,
        }}
        className="bg-ink text-on-ink absolute top-1/2 left-1/2 z-20 flex size-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[22px] sm:size-[88px] sm:rounded-[26px]"
      >
        <Mark className="size-10 sm:size-12" />
      </span>
    </div>
  );
}

function OrbitTile({ app, pull }: { app: OrbitApp; pull: number }) {
  const ring = RINGS[app.ring];
  // How much of the ring's radius the tile still has; it shrinks and fades on the way in, except the two that dock.
  const reach = app.next ? 1 - (pull / DOCK_PULL) * (1 - DOCK_RADIUS) : 1 - pull;
  const scale = app.next ? 1 - (pull / DOCK_PULL) * 0.2 : 1 - 0.6 * pull;
  const opacity = app.next ? ring.opacity : ring.opacity * (1 - pull);
  const docked = app.next && pull >= DOCK_PULL;
  const style = {
    "--a": `calc(${app.angle}deg + var(--orbit-spin))`,
    transform: `translate(-50%, -50%) translate(calc(cos(var(--a)) * var(--r${app.ring}) * ${reach}), calc(sin(var(--a)) * var(--r${app.ring}) * ${reach * TILT})) scale(${scale})`,
    opacity,
  } as CSSProperties;
  return (
    <span style={style} className="absolute top-1/2 left-1/2 z-10 flex flex-col items-center">
      <AppTile
        id={app.id}
        className={
          ring.tile +
          " outline-offset-4 transition-[outline-color] duration-300 " +
          (docked ? "outline-border-strong outline-[1.5px] outline-dashed" : "outline-transparent")
        }
      />
      {app.next ? (
        <span
          className={
            "text-meta text-fg-muted absolute top-full mt-2 font-semibold whitespace-nowrap transition-opacity duration-300 " +
            (docked ? "opacity-100" : "opacity-0")
          }
        >
          Next
        </span>
      ) : null}
    </span>
  );
}

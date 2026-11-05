import type { CSSProperties } from "react";

import { Mark } from "~/components/ui-kit/app-shell-kit";
import { ORBIT_APPS, type OrbitApp } from "./orbit-apps";
import { AppTile } from "./orbit-logos";

// Per ring: its turn, and the tile size and strength. Radii live in CSS vars on the orbit so phones get a tighter
// orbit (and no outer ring) without a resize listener.
const RINGS: Record<
  OrbitApp["ring"],
  { spin: string; tile: string; opacity: number; phone: boolean }
> = {
  0: { spin: "", tile: "size-12 sm:size-14", opacity: 1, phone: true },
  1: {
    spin: "[--orbit-dir:reverse] [--orbit-dur:120s]",
    tile: "size-10 sm:size-11",
    opacity: 0.85,
    phone: true,
  },
  2: { spin: "[--orbit-dur:150s]", tile: "size-9", opacity: 0.6, phone: false },
};
// The orbit is a tilted ring: everything sits on an ellipse this much shorter than it is wide.
const TILT = 0.72;

const NAMES = ORBIT_APPS.map((a) => a.name);

/** The page's opening: the apps an athlete juggles, drifting slowly round the M, over the headline. */
export function OrbitHero() {
  return (
    <section
      id="orbit"
      aria-labelledby="hero-title"
      className="relative flex min-h-[calc(100svh-88px)] flex-col items-center justify-center gap-8 overflow-hidden px-4 pt-6 pb-12 sm:gap-10 [@media(max-height:800px)]:gap-5"
    >
      <p className="sr-only">
        {NAMES.slice(0, -1).join(", ")} and {NAMES.at(-1)} around the Mesodapt
        mark.
      </p>
      <Orbit />

      <div className="flex w-full max-w-[760px] flex-col items-center text-center">
        <h1
          id="hero-title"
          className="animate-rise text-display text-fg max-w-[22ch] text-balance"
        >
          Experience a <span className="text-sky">truly intelligent</span>{" "}
          training scheduler like never before
        </h1>
        <p className="animate-rise text-body text-fg-muted mt-5 max-w-[52ch] text-balance [animation-delay:60ms] sm:text-[17px] sm:leading-[26px]">
          All your training in one platform, with an intelligent engine and
          scheduler that adapts to you.
        </p>
      </div>
    </section>
  );
}

function Orbit() {
  return (
    <div
      aria-hidden
      className={
        "relative h-[230px] w-full max-w-[560px] shrink-0 [--r0:96px] [--r1:146px] [--r2:0px] sm:h-[330px] sm:[--r0:128px] sm:[--r1:184px] sm:[--r2:240px] " +
        // Short screens (a 768px laptop, an SE) get a smaller orbit so the CTA still fits on the first screen.
        "[@media(max-height:800px)]:h-[200px] [@media(max-height:800px)]:[--r0:84px] [@media(max-height:800px)]:[--r1:128px] sm:[@media(max-height:800px)]:h-[270px] sm:[@media(max-height:800px)]:[--r0:108px] sm:[@media(max-height:800px)]:[--r1:156px] sm:[@media(max-height:800px)]:[--r2:204px]"
      }
    >
      {/* A sky glow the orbit floats on. */}
      <div className="pointer-events-none absolute inset-x-[10%] inset-y-0 -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-sky)_22%,transparent),transparent)] blur-2xl" />

      {([0, 1, 2] as const).map((ring) => (
        <div
          key={ring}
          className={
            "orbit-spin absolute inset-0 " +
            RINGS[ring].spin +
            (RINGS[ring].phone ? "" : " hidden sm:block")
          }
        >
          <span
            style={{
              width: `calc(var(--r${ring}) * 2)`,
              height: `calc(var(--r${ring}) * 2 * ${TILT})`,
            }}
            className="border-sky/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border"
          />
          {ORBIT_APPS.filter((a) => a.ring === ring).map((a) => (
            <OrbitTile key={a.id} app={a} />
          ))}
        </div>
      ))}

      <span className="bg-ink text-on-ink absolute top-1/2 left-1/2 z-20 flex size-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[22px] shadow-[0_0_0_8px_color-mix(in_srgb,var(--color-sky)_10%,transparent),0_14px_40px_color-mix(in_srgb,var(--color-sky)_35%,transparent)] sm:size-[88px] sm:rounded-[26px]">
        <Mark className="size-10 sm:size-12" />
      </span>
    </div>
  );
}

/** Places itself on its ring with cos()/sin() of the ring's inherited turn, so it drifts without spinning. */
function OrbitTile({ app }: { app: OrbitApp }) {
  const ring = RINGS[app.ring];
  const style = {
    "--a": `calc(${app.angle}deg + var(--orbit-spin))`,
    transform: `translate(-50%, -50%) translate(calc(cos(var(--a)) * var(--r${app.ring})), calc(sin(var(--a)) * var(--r${app.ring}) * ${TILT}))`,
    opacity: ring.opacity,
  } as CSSProperties;
  return (
    <span style={style} className="absolute top-1/2 left-1/2 z-10">
      <AppTile id={app.id} className={ring.tile} />
    </span>
  );
}

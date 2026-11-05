# Apps Orbit Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open the landing on a Macro-style orbit of real app logos around the M. Scrolling pulls them in, while Garmin and Strava dock outside as "Next". Then the date-night story starts, and the founder Letter is rewritten to Freddy's real five-app story.

**Architecture:** A pure, unit-tested `orbitStateAt(progress)` (modelled on `story-script.ts`) turns pin progress into per-tile pull fractions and a few flags. A client `OrbitHero` measures that progress from a tall section with a sticky inner stage, and renders rings that drift slowly with CSS. Each tile is translated along its ring angle by `radius × (1 − pull)`. Logos are bundled as inline SVG path data.

**Tech Stack:** Next 15, React 19, Tailwind v4 role tokens (`theme.css`), lucide-react, vitest (node environment, so pure functions only).

**Spec:** `docs/superpowers/specs/2026-11-05-apps-orbit-hero-design.md`

## Global Constraints

- White landing ground; no phone or device mock; no new animation library.
- Real logos, bundled locally as inline SVG (no runtime CDN). Simple Icons path data only for apps it has; don't redraw anyone's logo. The AI tile is our own icon, and there's no Claude logo anywhere.
- Garmin and Strava never merge into the M; they dock outside it with a "Next" label.
- Every string under `src/app/_components/landing` passes `copy-guard.test.ts` (no seamless/unlock/journey…, no ", not x", no "actually", no stacked fragments).
- Claims stay true to PRODUCT.md: endurance and the Garmin/Strava integrations are not built.
- Reduced motion: no idle drift and no between-frame tile transitions; the scroll-linked merge still follows the scroll.
- Phones: 16px gutter, no horizontal page scroll.
- No co-author or session trailers in commit messages (owner rule).

## Review Focus

- **Scroll back up after the merge:** tiles un-merge smoothly. Pinned by `orbitStateAt` being pure in Task 1.
- **Resize or rotate mid-pin:** progress recomputes with no jump to a stale value. The `resize` listener is in Task 3, checked by hand in Task 5.
- **Reduced motion:** rings don't turn and tiles don't tween, but merge state still tracks scroll. Task 3 step, checked in Task 5.
- **First paint and hydration:** the server renders progress 0 (all tiles out), so there's no hydration mismatch. Pinned by `orbitStateAt(0)` in Task 1, checked in Task 5.
- **Phone width:** outer tiles can't widen the page. The stage clips them (`overflow-hidden`), checked at 390px in Task 5.

---

### Task 1: Orbit data and scroll script

**Files:**
- Create: `src/app/_components/landing/orbit-script.ts`
- Test: `src/app/_components/landing/orbit-script.test.ts`

**Interfaces:**
- Produces:
  - `type OrbitAppId = "hevy" | "garmin" | "strava" | "sheets" | "ai" | "notion" | "excel" | "calendar" | "googlefit" | "nike" | "peloton"`
  - `ORBIT_APPS: { id: OrbitAppId; name: string; ring: 0 | 1 | 2; angle: number /* degrees */; next?: true }[]`. Ring 0 is Freddy's five (hevy, garmin, strava, sheets, ai), with `next: true` on garmin and strava. Rings 1 and 2 hold three each of the other six (ring 1: notion, calendar, excel; ring 2: googlefit, nike, peloton), spread so no two tiles on a ring sit closer than 40°. Progress runs 0→1 over the pin.
  - `type OrbitState = { pulls: Record<OrbitAppId, number>; merged: boolean; glow: number }`
  - `orbitStateAt(progress: number): OrbitState`
  - `DOCK_PULL = 0.55`: the pull at which `next` apps stop.

- [ ] **Step 1: Write the failing tests** in `orbit-script.test.ts`:
  - `"leaves every app in its ring at the top"`: `orbitStateAt(0)` has every pull `0`, `merged: false`, `glow: 0`.
  - `"pulls every app home except the two that are next"`: at `orbitStateAt(1)`, `pulls.garmin` and `pulls.strava` equal `DOCK_PULL`, every other pull is `1`, `merged: true`, `glow: 1`.
  - `"lands the outer rings before your five"`: at the first progress (0.01 steps) where any ring-0 app's pull exceeds 0.5, every ring-2 app's pull is already ≥ 0.9.
  - `"never pushes an app back out while you scroll down"`: for each app, pull is non-decreasing over progress 0→1 in 0.01 steps.
  - `"swaps to the one-place copy only once everything has landed"`: `merged` is false at 0.85 and true at 0.92, and every non-next pull is 1 at 0.9. `glow` is 0 at 0.84 and 1 at 1.
  - `"clamps and is a pure function of position"`: `orbitStateAt(-1)` equals `orbitStateAt(0)`, `orbitStateAt(3)` equals `orbitStateAt(1)`, and two calls at 0.37 are deep-equal.
  - `"keeps Freddy's five on the inner ring"`: the ring-0 ids are exactly hevy, garmin, strava, sheets, ai, and the only `next` ids are garmin and strava.

- [ ] **Step 2: Run and see them fail**

  Run: `npx vitest run src/app/_components/landing/orbit-script.test.ts`
  Expected: FAIL, cannot resolve `./orbit-script`.

- [ ] **Step 3: Implement `orbit-script.ts`**

  Each ring pulls over its own window, so outer rings land first. Within a ring, tiles stagger slightly by index. Ease with cubic ease-in-out. Ring windows (start→end for the tile at index 0, with each later tile on the ring shifted 0.04 later): ring 2 runs 0.05→0.45, ring 1 runs 0.2→0.6, ring 0 runs 0.4→0.72. The last ring-0 tile ends at 0.88. `next` apps take `min(pull, DOCK_PULL)`. `merged = progress >= 0.9`. `glow` ramps 0→1 from 0.85 to 1. Doc comment in the style of `story-script.ts`.

- [ ] **Step 4: Run and see them pass**

  Run: `npx vitest run src/app/_components/landing/orbit-script.test.ts`
  Expected: 7 passed.

- [ ] **Step 5: Commit**: `git commit -m "feat(landing): orbit scroll script, outer rings land first and Garmin and Strava dock"`

---

### Task 2: Logos

**Files:**
- Create: `src/app/_components/landing/orbit-logo-data.ts` (node-safe data)
- Create: `src/app/_components/landing/orbit-logos.tsx` (`AppTile`)
- Test: `src/app/_components/landing/orbit-logo-data.test.ts`

**Interfaces:**
- Consumes: `OrbitAppId`, `ORBIT_APPS` from Task 1.
- Produces: in `orbit-logo-data.ts`, `ORBIT_LOGOS: Record<OrbitAppId, { fill: string /* brand hex */; path?: string /* 24×24 SVG path */ }>` and, in `orbit-logos.tsx`, `function AppTile({ id, className }: { id: OrbitAppId; className?: string }): JSX.Element`. The tile is a squircle (`rounded-[28%]`) filled with the brand colour, with the white glyph centred at 55% of the tile size. `ai` has no `path` and renders lucide `MessageCircle` with a `Sparkles` badge, on `bg-night` with a faint `border-prism`-style edge.

- [ ] **Step 1: Write the failing test** `"has a logo for every app in the orbit"`: every `ORBIT_APPS` id is a key of `ORBIT_LOGOS`, and every id except `ai` has a non-empty `path`. Import `ORBIT_LOGOS` from `./orbit-logo-data`.

- [ ] **Step 2: Run it**: it fails on the missing module.

- [ ] **Step 3: Fill `orbit-logo-data.ts`**

  Copy `path` and `hex` from `simple-icons@16.36.0` (`https://cdn.jsdelivr.net/npm/simple-icons@16.36.0/icons/<slug>.svg`, with brand hex in its `data/simple-icons.json`). Slugs: `hevy`, `garmin`, `strava`, `googlesheets`, `notion`, `microsoftexcel`, `googlecalendar`, `googlefit`, `nike`, `peloton`. Add a header comment: path data is CC0 from Simple Icons, the trademarks belong to their owners, and Apple Notes, Apple Health, MyFitnessPal, Whoop, Oura, Strong, TrainingPeaks and Zwift are left out until an official press-kit mark is sourced. If a brand hex is too light for a white glyph (contrast < 3:1), use the brand's dark variant or a near-black fill.

- [ ] **Step 4: Run** `npx vitest run src/app/_components/landing`. Expected: all pass, copy guard included.

- [ ] **Step 5: Commit**: `git commit -m "feat(landing): bundle orbit app logos"`

---

### Task 3: OrbitHero, the top bar and the Story hand-off

**Files:**
- Create: `src/app/_components/landing/orbit-hero.tsx` (client)
- Modify: `src/app/_components/landing/index.tsx` (render `<OrbitHero />` before `<Story />`)
- Modify: `src/app/_components/landing/story.tsx` (remove the h1, subtext, CTA and scroll link from step 0; add the lead-in)
- Modify: `src/app/_components/landing/top-bar.tsx` (Get started)

**Interfaces:**
- Consumes: `orbitStateAt`, `ORBIT_APPS` (Task 1); `AppTile` (Task 2); kit `Mark`; `SignInButton` (`variant`, `size`, `label`, `showIcon`).
- Produces: `export function OrbitHero(): JSX.Element`.

- [ ] **Step 1: Build `OrbitHero`**
  - The section is `id="top-orbit"`, `aria-labelledby="hero-title"`, height `h-[200svh]` (`h-[170svh]` below `sm`). Inside it, a `sticky top-0 h-svh overflow-hidden` stage.
  - Progress is `clamp((−rect.top) / (rect.height − innerHeight))`, measured in a rAF-throttled scroll and resize listener as in `Story`.
  - **Orbit:** centred in the upper ~55% of the stage. There are three ring outlines (`border-sky/15`). Ring radii are 120/190/260px at `lg`, 92/140 on phones, where ring 2 is hidden below `sm`. Each ring is an absolutely positioned wrapper turning with a CSS animation: ring 0 at 90s, ring 1 at 120s reversed, ring 2 at 150s. Tiles counter-rotate at the same duration so they stay upright. Add the keyframes to `theme.css` beside `prism-turn`, and disable them under `prefers-reduced-motion`.
  - **Each tile** sits at `rotate(angle) translateX(radius × (1 − pull)) rotate(−angle)`, at `scale(1 − 0.6 × pull)` and `opacity` `1 − pull` for non-`next` apps. Ring 0 tiles are 56px, ring 1 are 44px at 0.8 opacity, ring 2 are 36px at 0.55 opacity. Under reduced motion, drop the `transition` on tiles.
  - **`next` apps** at `pull === DOCK_PULL` get a dashed outline (`outline-dashed outline-1.5 outline-border-strong outline-offset-4`) and a "Next" micro-label below (`text-meta text-fg-muted`).
  - **The M:** the kit `Mark` in a 88px `bg-ink` tile with `text-on-ink`. Its box-shadow mixes in the pink glow by `glow` (`color-mix(in srgb, var(--color-pink) {glow×45}%, transparent)`).
  - **Copy, under the orbit and centred:** the h1 `id="hero-title"` is "Experience a <span class=text-sky>truly intelligent</span> training scheduler like never before" (`text-display`, `max-w-[18ch]`, centred). Then the current subtext, `<SignInButton />`, and the "Scroll to see it rescue date night" link to `#step-1`. When `merged`, cross-fade that block out and a second block in. The second block is `aria-hidden` when not merged: "One place for all of it", with "Your block, your lifts and your coach, in one app. Garmin and Strava are next." Both stay in the DOM; only opacity and pointer-events change.
  - **sr-only line:** "Hevy, Garmin, Strava, Google Sheets and an AI chat, pulled into one app. Garmin and Strava are connecting next." The orbit itself is `aria-hidden`.

- [ ] **Step 2: Story hand-off.** In `story.tsx`, delete the h1, subtext, CTA and scroll link from step 0, and drop the `SignInButton` and `ArrowDown` imports if they're unused. Step 0 keeps its ref and min-height and holds an h2 `id="story-title"` lead-in in `text-landing-h3`: "Here's what that looks like on a busy week". Change the section's `aria-labelledby` to `story-title`.

- [ ] **Step 3: Top bar.** Replace the secondary sign-in with `<SignInButton variant="primary" size="md" label="Get started" showIcon={false} />`.

- [ ] **Step 4: Verify**: `npx vitest run src/app/_components/landing && npx tsc --noEmit -p . && npx eslint src/app/_components/landing`. All green.

- [ ] **Step 5: Commit**: `git commit -m "feat(landing): orbit hero opens the page, Get started in the top bar"`

---

### Task 4: Letter rewrite

**Files:**
- Modify: `src/app/_components/landing/letter.tsx`

- [ ] **Step 1: Rewrite the copy** in Freddy's first person, keeping the structure, signature, email and closing CTA.
  - H2: "I built this because my training lived in five apps".
  - Paragraph 1 says what each did. Hevy for lifts, progressive overload and volume; Garmin for runs, swims and rides; Strava to keep all of it and for the social side. Then everything exported into one Google Sheet, and that sheet handed to Claude for coaching and insights, every time something changed.
  - Paragraph 2: Mesodapt is the one place he wanted instead. It runs hypertrophy blocks today, with the scheduler and the coach box, and Garmin and Strava are next.
  - `TOOLS` chips (struck through) become five short, real-sounding details, e.g. `Hevy: volume per muscle`, `Garmin: Sunday long run`, `Strava: kudos`, `Sheets: export_all_v3`, `Claude: "how's my week looking?"`. Keep the arrow and the Mesodapt pill.

- [ ] **Step 2: Verify**: `npx vitest run src/app/_components/landing`. The copy guard passes.

- [ ] **Step 3: Commit**: `git commit -m "feat(landing): the Letter tells the real five-app story"`

---

### Task 5: Browser check

- [ ] **Step 1:** In a signed-out window, load `http://localhost:3000/` at 1440×900. Screenshot rest, ~50% (mid-merge), 100% (merged, M glowing, Garmin and Strava docked with "Next"), then scroll back to the top (un-merged), then the hand-off into Story caption 01.
- [ ] **Step 2:** Repeat at 390×844 and check there's no horizontal scrollbar (`document.documentElement.scrollWidth === innerWidth`).
- [ ] **Step 3:** With reduced motion emulated, the rings don't turn and the scroll still drives the merge.
- [ ] **Step 4:** Fix anything found, re-run Task 3 Step 4, commit, and send the owner screenshots for a visual LGTM.

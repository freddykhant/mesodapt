# Apps orbit hero + Letter rewrite (landing)

Date: 2026-11-05 · Branch: `freddy/landing-copy` · Status: approved in chat, pending doc review

## Intent

The landing should open on the problem every self-coached athlete recognises: their training lives in five apps glued together by hand. The owner's own setup was Hevy for lifts, progressive overload and volume; Garmin for runs, swims and rides; Strava to keep that data and for the social side; a Google Sheet that everything got exported into; and an AI chat (Claude) fed that sheet for coaching and insights. The export-and-paste loop in the middle was the pain.

The pitch is the one Macro (macro.com, a16z) makes for work tools: scattered tools → one platform that does the job better. A visitor should finish the hero thinking "that's my setup" and believing one app can replace it. It's the strongest convenience pitch on the page, so it goes first; the date-night scheduler story follows.

## Goals

- A Macro-style hero on the existing white page: the M tile in the centre, faint sky rings, real app logos orbiting it.
- Scrolling pulls the apps into the M. This is the "unify" moment.
- Honest about today: Mesodapt replaces the Sheet, Hevy-style logging and progression, and the AI chat. Garmin and Strava are not connected yet (PRODUCT.md: biodata integrations deferred), so they dock outside the M marked "connecting next" and never merge.
- A primary **Get started** button in the top bar, top right.
- The founder Letter stays as the page's close, rewritten to the owner's real story above.

## Non-goals

- No phone or device mock (the owner dropped it).
- No change to the date-night story's beats, the WeekDiary, or the Intelligence sheet beyond what the reflow needs.
- No real Garmin/Strava integration work.

## Anti-goals (failure even if it works)

- Implying Garmin or Strava are connected today.
- AI-sounding copy. `copy-guard.test.ts` rules apply, plus the owner's voice: plain words, written for athletes short on time, not engineers.
- A busy, jittery orbit. Macro's is slow and calm; the motion should feel expensive, not frantic.
- Claude's logo anywhere. The AI app is a generic AI chat icon (a sparkle in a chat bubble). The Letter may name Claude in words.

## Decided by the owner

| Decision | Choice |
|---|---|
| Direction | Macro-style orbit around the M. No phone. |
| Ground | The white page (today's hero), not navy. |
| Placement | First on the page; the scheduler scroll story comes straight after. |
| Logos | Real app logos. |
| Garmin, Strava | Shown, but as "connecting next", outside the M after the merge. |
| Top bar | **Get started** primary button, top right. |
| Letter | Stays at the bottom, rewritten to the real story. |

The owner knows Strava's and Garmin's brand guidelines restrict logo use to approved integrations and chose real logos anyway.

## The design

### Page order

TopBar → **OrbitHero** (new) → Story (date night, starting at caption 01) → WeekDiary → Intelligence → Letter (rewritten) → footer.

### TopBar

Replace the secondary "Sign in" with the primary `SignInButton` labelled **Get started**. The anchor links stay.

### OrbitHero

- **Layout, at rest:** the orbit sits above the copy, centred, like Macro's hero. The M tile (kit `Mark` in the sky tile, larger than the nav one) sits in the centre of three faint sky rings. Below it: the h1 "Experience a <sky>truly intelligent</sky> training scheduler like never before", the current subtext, the sign-in CTA, and a small scroll cue.
- **Inner ring (your five):** Hevy, Garmin, Strava, Google Sheets, AI chat (generic). Largest tiles, full opacity.
- **Outer rings (what others juggle):** fitness and notes apps people use, e.g. Notion, Excel, Google Calendar, Google Fit, Nike Run Club, Peloton, plus Apple Notes, Apple Health, MyFitnessPal, Whoop, Oura, Strong, TrainingPeaks, Zwift where a usable logo exists (see Logos). They get smaller and fainter with each ring out.
- **Idle motion:** the rings drift very slowly (one turn in ~60–90s, alternate rings counter-rotating). Tiles stay upright.
- **Scroll, pinned:** the hero pins for about one extra screen of scroll. Progress 0→1 pulls every tile toward the M along an ease-in curve: outer rings first, inner ring last, each tile shrinking and fading as it lands. Garmin and Strava stop short at a docking position just outside the M, gain a dashed outline and a small "Next" label, and stay there. When the merge finishes, the M gets the pink live glow, and the copy cross-fades to a one-place line (working copy: "One place for all of it", with a sentence along the lines of "Your block, your lifts and your coach, in one app. Garmin and Strava are next."). Then the pin releases into the Story.
- **Scrubbed, not triggered:** like the Story, state is a pure function of scroll position, so scrolling back up un-merges.
- **Reduced motion:** no idle drift, and tile moves don't animate between frames. The scroll-linked merge still follows the scroll, because the user drives it, as the Story's M draw does. *(Claude's call.)*
- **Phones:** keep the inner ring and one outer ring, scale everything down, and shorten the pin. No horizontal page scroll; 16px side gutter.
- **Accessibility:** the orbit is `aria-hidden`; an sr-only sentence says what it shows ("Hevy, Garmin, Strava, Google Sheets and an AI chat, pulled into one app; Garmin and Strava are connecting next"). The h1 stays the page's only h1.

### Story

The h1, subtext and CTA move to OrbitHero. The Story section keeps its pinned stage and captions 01–05. Its old hero slot (step 0) becomes a short lead-in with an h2 so the scroll maths, which treats step 0 as position 0, keeps working.

### Letter

Rewrite in Freddy's first-person voice:

- H2 along the lines of "I built this because my training lived in five apps".
- Body: Hevy for lifts, progressive overload and volume; Garmin for runs, swims and rides; Strava to keep it all and for the social side; exporting everything into one Google Sheet; then giving that sheet to Claude for coaching and insights, every time. Close with what Mesodapt does today (hypertrophy blocks, with the scheduler and coach box) and that Garmin and Strava are next.
- The struck-through chips become those five, each with a short real detail (e.g. "Hevy: volume per muscle", "Sheets: export_all_v3"), ending in the Mesodapt pill.
- Keep the signature, the email and the closing CTA.

## Constraints

- Next 15 / React 19, Tailwind v4 role tokens from `theme.css`, kit components (`Mark`, `SignInButton`, `buttonClass`). No new animation library; the Story already scrubs with rAF + CSS transforms, so follow that.
- Follow `story-script.ts`: put the orbit's scroll state in a pure, unit-tested function.
- Every string in `src/app/_components/landing` passes `copy-guard.test.ts`.
- Claims stay true to PRODUCT.md.
- DESIGN.md's Quiet Motion Rule: this hero is a sanctioned landing exception, in the same family as the scrubbed M draw.

## Logos (builder's call within these bounds)

- Bundle logos locally as inline SVG; no runtime CDN. Simple Icons (CC0 path data, trademark stays with the owners) has Hevy, Strava, Garmin, Google Sheets, Notion, Microsoft Excel, Nike, Peloton, Google Fit and Google Calendar. Render each as an app-icon squircle: brand colour fill, white glyph.
- Apple Notes, Apple Health, MyFitnessPal, Whoop, Oura, Strong, TrainingPeaks, Fitbod and Zwift aren't in Simple Icons. Use the official press-kit mark where one is published; otherwise leave the app out. Don't redraw anyone's logo.
- The AI chat tile is our own generic icon (lucide `MessageCircle` + `Sparkles` style), on a neutral or prism-tinted fill.

## Left to the builder

- Exact ring radii, tile sizes, counts per ring, and drift speeds.
- The easing and stagger of the pull-in, and how far Garmin and Strava dock.
- Final wording of the post-merge line and the Letter, inside the voice rules. The owner reviews the copy at the visual check.
- Whether the Story's lead-in (old step 0) gets visible copy or is a spacer.

## Done when

- Landing tests (including a new orbit-script test and the copy guard), `tsc` and eslint pass.
- Checked in a browser at desktop and phone widths: rest, mid-merge, merged, scroll back up, and reduced motion.
- The owner gives a visual LGTM.

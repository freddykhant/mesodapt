import {
  BatteryLow,
  FileText,
  Hand,
  HelpCircle,
  Layers,
  MessageCircle,
  Moon,
  Pause,
  Repeat,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { GlassCard, GlassSheet } from "~/components/ui-kit/app-shell-kit";
import { ReadsYouDemo, ReasonsDemo, RecoveryDemo, WeighsUpDemo } from "./ai-demos";
import { Container } from "./primitives";

const CELLS: {
  id: string;
  title: ReactNode;
  body: string;
  points: [LucideIcon, string][];
  demo: ReactNode;
  model?: boolean;
}[] = [
  {
    id: "ai-reads",
    model: true,
    title: (
      <>
        Understands you <Em>the way you text</Em>
      </>
    ),
    body: "Typos, slang and half-finished sentences are fine. A language model works out which day you mean and what changed, and if it can't tell, it asks.",
    points: [
      [MessageCircle, "Works out the day and time from how you put it"],
      [HelpCircle, "Asks which day when you're vague"],
      [ShieldCheck, "Only sees your week, with no names or emails"],
    ],
    demo: <ReadsYouDemo />,
  },
  {
    id: "ai-weighs",
    title: (
      <>
        Weighs up <Em>every way your week could go</Em>
      </>
    ),
    body: "When a session has to move, it builds the options and checks each one for rest between sessions, missed sets and the times you like to train. You see the best one first.",
    points: [
      [Layers, "Up to three ways to rearrange your week"],
      [Moon, "Keeps rest between sessions that hit the same muscles"],
      [Hand, "Nothing moves until you tap Accept"],
    ],
    demo: <WeighsUpDemo />,
  },
  {
    id: "ai-recovery",
    title: (
      <>
        Learns <Em>how you recover</Em>
      </>
    ),
    body: "Every Sunday you tell it how each muscle feels. It puts that next to what you lifted and plans next week to match, so you push when you're fresh and ease off when you're sore.",
    points: [
      [TrendingUp, "Adds sets when you're bouncing back well"],
      [Pause, "Holds steady while a muscle is still sore"],
      [BatteryLow, "Suggests an easy week early if you need one"],
    ],
    demo: <RecoveryDemo />,
  },
  {
    id: "ai-reasons",
    title: (
      <>
        Every number <Em>comes with a reason</Em>
      </>
    ),
    body: "The language model never writes a number. Your sets and your schedule are worked out by the training engine, so the same week always gets the same answer, and every change keeps a note of why.",
    points: [
      [FileText, "Every change is saved with its reason"],
      [Repeat, "Same week in, same plan out"],
      [Sparkles, "Nothing in your plan is made up by the AI"],
    ],
    demo: <ReasonsDemo />,
  },
];

function Em({ children }: { children: ReactNode }) {
  return <span className="text-accent-on-ink">{children}</span>;
}

/**
 * The intelligence sheet: the one dark sheet on the page. A slow prism turns behind heavy frosted glass. Each cell
 * is a live demo over a blueprint grid, then what it does in plain words. The prism edge marks the one cell where
 * a language model reads you; hot pink is the athlete's, as everywhere else.
 */
export function Engine() {
  return (
    <GlassSheet size="page" id="intelligence" aria-labelledby="intelligence-title">
      <Container className="pt-24 pb-28 sm:pt-28 sm:pb-36">
        <p className="flex items-center gap-2 text-nav font-semibold text-accent-on-ink">
          <Sparkles className="size-4 text-prism-amber" aria-hidden />
          Intelligence
        </p>
        <h2 id="intelligence-title" className="mt-3 max-w-[22ch] text-landing-h2 text-balance text-on-ink">
          Text it like a training partner and it plans like a sports scientist
        </h2>
        <p className="mt-6 max-w-[58ch] text-body text-on-ink-muted sm:text-[17px] sm:leading-[26px]">
          Two kinds of smarts sit behind your week. A language model reads what you type and works out what you mean.
          A training engine does all the maths, from your sets to your rest days, starting from your own training.
        </p>

        <ol className="mt-14 grid gap-3 md:grid-cols-2 lg:gap-4">
          {CELLS.map((c, i) => (
            <GlassCard key={c.id} as="li" tone={c.model ? "model" : "plain"} flush className="overflow-hidden">
              <div className="relative isolate h-[252px] border-b border-ink-border px-5 pt-10 pb-5 sm:px-6">
                {/* Blueprint grid under the demo, fading out toward the edges. */}
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-[linear-gradient(var(--color-ink-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-ink-border)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(75%_85%_at_50%_50%,#000,transparent)]"
                />
                <span
                  aria-hidden
                  className="absolute top-3.5 right-5 font-mono text-[11px] tracking-[0.08em] text-on-ink-subtle sm:right-6"
                >
                  AI · 0{i + 1}
                </span>
                <div aria-hidden className="h-full">
                  {c.demo}
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <h3 id={c.id} className="text-section text-balance text-on-ink sm:text-[22px] sm:leading-7">
                  {c.title}
                </h3>
                <p className="mt-2.5 text-body text-on-ink-muted">{c.body}</p>
                <ul className="mt-5 border-t border-ink-border">
                  {c.points.map(([Icon, text]) => (
                    <li
                      key={text}
                      className="flex items-center gap-3 border-b border-ink-border py-3 text-card-desc text-on-ink last:border-b-0 last:pb-0"
                    >
                      <Icon className="size-4 shrink-0 text-accent-on-ink" aria-hidden />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          ))}
        </ol>
      </Container>
    </GlassSheet>
  );
}

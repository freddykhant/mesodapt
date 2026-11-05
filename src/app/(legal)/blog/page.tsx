import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import { Mark } from "~/components/ui-kit/app-shell-kit";

export const metadata: Metadata = { title: "Why I built Mesodapt · Mesodapt" };

// What Mesodapt has replaced gets struck through. Garmin and Strava sit after it, dashed, because they're next.
const REPLACED = ["Hevy: volume per muscle", "Sheets: export_all_v3", "Claude: “how’s my week looking?”"];
const NEXT = ["Garmin: Sunday long run", "Strava: kudos"];

/** The founder's note, moved off the landing. One post for now; this becomes an index when there's a second. */
export default function BlogPage() {
  return (
    <article className="animate-rise">
      <p className="text-eyebrow font-medium text-fg-subtle">Blog</p>
      <h1 className="mt-3 text-page-title text-fg text-balance">I built this because my training lived in five apps</h1>
      <p className="mt-2 text-meta text-fg-muted">5 November 2026</p>

      <div className="mt-8 flex flex-col gap-5 text-body text-fg-soft sm:text-[17px] sm:leading-[28px]">
        <p>
          Hevy for my lifts, to keep an eye on progressive overload and how much volume each muscle was getting.
          My Garmin for runs, swims and rides, with Strava keeping all of it and my mates&apos; kudos. Every week
          I&apos;d export the lot into one Google Sheet, paste that sheet into Claude and ask how my training was
          going. When something changed, I did the whole export again.
        </p>
        <p>
          Mesodapt is the one place I wanted instead. It runs your hypertrophy block today, with the scheduler and
          the coach box doing the reshuffling, and bringing in Garmin and Strava is what I&apos;m working on next.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {REPLACED.map((t) => (
          <s
            key={t}
            className="inline-flex h-[32px] items-center rounded-pill bg-sunken px-3 text-card-desc text-fg-subtle"
          >
            {t}
          </s>
        ))}
        <ArrowRight className="mx-1 size-4 text-fg-subtle" aria-hidden />
        <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface-raised py-1 pr-3.5 pl-1 text-list text-fg shadow-card">
          <span className="flex size-7 items-center justify-center rounded-full bg-ink text-on-ink">
            <Mark className="size-4" />
          </span>
          Mesodapt
        </span>
        {NEXT.map((t) => (
          <span
            key={t}
            className="inline-flex h-[32px] items-center gap-1.5 rounded-pill border border-dashed border-border-strong px-3 text-card-desc text-fg-muted"
          >
            {t}
            <span className="text-meta font-semibold text-fg-subtle">next</span>
          </span>
        ))}
      </div>

      <p className="mt-10 text-list text-fg">Freddy</p>
      <p className="text-meta text-fg-muted">
        Questions come straight to me at{" "}
        <a href="mailto:freddyhmk@gmail.com" className="text-fg underline decoration-border-strong underline-offset-2 hover:decoration-fg">
          freddyhmk@gmail.com
        </a>
      </p>
    </article>
  );
}

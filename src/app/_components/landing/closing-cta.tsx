import Link from "next/link";

import { buttonClass } from "~/components/ui-kit/app-shell-kit";
import { SignInButton } from "~/app/_components/auth-buttons";
import { LandingSection } from "./primitives";

/** The page's close: one line and the way in, with room around it. */
export function ClosingCta() {
  return (
    <LandingSection labelledBy="closing-title" className="bg-atmosphere -mt-10 rounded-t-sheet-xl bg-canvas">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center px-4 pt-36 pb-40 text-center sm:px-8 sm:pt-44 sm:pb-48">
        <h2 id="closing-title" className="text-display text-fg max-w-[16ch] text-balance">
          Train around your life, starting this week
        </h2>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <SignInButton size="lg" label="Get started" showIcon={false} />
          <Link href="/blog" className={buttonClass("secondary", "lg")}>
            Why I built it
          </Link>
        </div>
      </div>
    </LandingSection>
  );
}

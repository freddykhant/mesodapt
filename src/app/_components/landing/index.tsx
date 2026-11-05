import { ClosingCta } from "./closing-cta";
import { Engine } from "./engine";
import { OrbitHero } from "./orbit-hero";
import { SiteFooter } from "./site-footer";
import { Story } from "./story";
import { TopBar } from "./top-bar";
import { WeekDiary } from "./week-diary";

/** Signed-out landing. The session redirect lives in `page.tsx`; this is markup only. */
export function Landing() {
  return (
    <div id="top" className="bg-atmosphere flex min-h-screen flex-col">
      <TopBar />
      <main id="main" className="flex-1">
        <OrbitHero />
        <Story />
        <WeekDiary />
        <Engine />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}

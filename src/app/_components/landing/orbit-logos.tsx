import { MessageCircle, Sparkles } from "lucide-react";

import { ORBIT_LOGOS } from "./orbit-logo-data";
import type { OrbitAppId } from "./orbit-script";

/** One app in the orbit, as an app-icon squircle: brand colour, white mark. Size it with `className`. */
export function AppTile({ id, className }: { id: OrbitAppId; className?: string }) {
  const { fill, path } = ORBIT_LOGOS[id];
  return (
    <span
      style={{ backgroundColor: fill }}
      className={
        "relative flex items-center justify-center rounded-[28%] text-white shadow-[0_8px_20px_-6px_rgba(7,16,25,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]" +
        (className ? " " + className : "")
      }
    >
      {path ? (
        <svg viewBox="0 0 24 24" className="size-[55%]" fill="currentColor" aria-hidden>
          <path d={path} />
        </svg>
      ) : (
        // The AI chat is ours: a chat bubble with the prism's amber spark.
        <span className="relative size-[55%]">
          <MessageCircle className="size-full" strokeWidth={2.2} aria-hidden />
          <Sparkles className="absolute -top-[18%] -right-[22%] size-[52%] text-prism-amber" aria-hidden />
        </span>
      )}
    </span>
  );
}

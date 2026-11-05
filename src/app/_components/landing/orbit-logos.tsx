import { ORBIT_LOGOS } from "./orbit-logo-data";
import type { OrbitAppId } from "./orbit-apps";

/**
 * One app in the orbit, as an app-icon squircle. `mono` (the default) is a white tile with a grey mark, so the M is
 * the only colour in the orbit; `brand` is the app's own colour with a white mark. Size it with `className`.
 */
export function AppTile({ id, tone = "mono", className }: { id: OrbitAppId; tone?: "mono" | "brand"; className?: string }) {
  const logo = ORBIT_LOGOS[id];
  if (!logo) throw new Error(`No orbit logo for ${id}`);
  return (
    <span
      style={tone === "brand" ? { backgroundColor: logo.fill } : undefined}
      className={
        "relative flex items-center justify-center rounded-[28%] " +
        (tone === "brand"
          ? "text-white shadow-[0_8px_20px_-6px_rgba(7,16,25,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]"
          : "border-border bg-surface-raised text-fg-muted shadow-card border") +
        (className ? " " + className : "")
      }
    >
      <svg viewBox="0 0 24 24" className={logo.wide ? "size-[86%]" : "size-[55%]"} fill="currentColor" aria-hidden>
        <path d={logo.path} />
      </svg>
    </span>
  );
}

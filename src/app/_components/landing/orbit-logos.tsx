import { ORBIT_LOGOS } from "./orbit-logo-data";
import type { OrbitAppId } from "./orbit-apps";

/** One app in the orbit, as an app-icon squircle: brand colour, white mark. Size it with `className`. */
export function AppTile({ id, className }: { id: OrbitAppId; className?: string }) {
  const logo = ORBIT_LOGOS[id];
  if (!logo) throw new Error(`No orbit logo for ${id}`);
  return (
    <span
      style={{ backgroundColor: logo.fill }}
      className={
        "relative flex items-center justify-center rounded-[28%] text-white shadow-[0_8px_20px_-6px_rgba(7,16,25,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]" +
        (className ? " " + className : "")
      }
    >
      <svg viewBox="0 0 24 24" className={logo.wide ? "size-[86%]" : "size-[55%]"} fill="currentColor" aria-hidden>
        <path d={logo.path} />
      </svg>
    </span>
  );
}

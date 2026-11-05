import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

/** A native <select> dressed as a secondary pill, with the chevron drawn in. Native so the platform picker, keyboard
 *  and screen readers all just work. Always give it an accessible name (a <label> or aria-label). */
export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <span className={"relative inline-flex" + (className ? " " + className : "")}>
      <select
        {...rest}
        className="h-9 w-full appearance-none rounded-pill border border-border bg-surface-raised pr-9 pl-4 text-nav text-fg tabular-nums shadow-control outline-none transition-colors hover:border-border-strong focus-visible:border-border-strong disabled:opacity-45"
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-subtle"
        aria-hidden
      />
    </span>
  );
}

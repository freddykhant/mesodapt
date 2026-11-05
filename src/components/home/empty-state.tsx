import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Panel } from "~/components/ui-kit/app-shell-kit";

/** Empty state on a Panel (DESIGN.md → Loading & empty states): 40px aura tile, one title, one line, an optional action.
 *  Candidate for the kit (shared by Now, Readiness, Coach and Library). */
export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  label,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  /** Accessible name for the region. */
  label?: string;
}) {
  return (
    <Panel
      as="section"
      aria-label={label ?? title}
      padding="none"
      className="flex flex-col items-center px-6 py-12 text-center md:py-16"
    >
      <span className="bg-aura flex size-10 items-center justify-center rounded-control text-fg-soft">
        <Icon className="size-5" aria-hidden />
      </span>
      <h2 className="mt-4 text-card-title text-fg">{title}</h2>
      {children ? <p className="mt-1 max-w-[44ch] text-card-desc text-pretty text-fg-muted">{children}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </Panel>
  );
}

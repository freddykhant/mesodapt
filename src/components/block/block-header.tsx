import { Chip, VolumeBars } from "~/components/ui-kit/app-shell-kit";
import type { MesocycleView } from "~/views/types";

function statusLabel(s: MesocycleView["status"]): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

/** What the bars say, for screen readers: the climb, the deload and where you are. */
function volumeSummary(block: MesocycleView): string {
  const training = block.weeks.filter((w) => !w.isDeload);
  const deload = block.weeks.find((w) => w.isDeload);
  const parts: string[] = [];
  if (training.length > 0) {
    const first = training[0]!;
    const peak = training.reduce((a, b) => (b.totalSets > a.totalSets ? b : a));
    parts.push(
      `Planned sets go from ${first.totalSets} in week ${first.index} to ${peak.totalSets} in week ${peak.index}`,
    );
  }
  if (deload) parts.push(`then ${deload.totalSets} in the week ${deload.index} deload`);
  const sentence = parts.length > 0 ? parts.join(", ") + ". " : "";
  return `${sentence}You're in week ${block.currentWeekIndex} of ${block.blockLengthWeeks}.`;
}

export function BlockHeader({ block }: { block: MesocycleView }) {
  const current = block.weeks.findIndex((w) => w.isCurrent);
  return (
    <header className="animate-rise flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
      <div className="min-w-0">
        <div className="mb-1.5 text-eyebrow font-medium text-fg-subtle">Training block</div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-page-title text-fg">{block.name}</h1>
          <Chip tone="neutral">{statusLabel(block.status)}</Chip>
        </div>
        <div className="mt-1.5 text-body text-fg-muted">
          {block.splitLabel} · {block.daysPerWeek} days/week · Week {block.currentWeekIndex} of{" "}
          {block.blockLengthWeeks}
        </div>
      </div>
      <div className="w-full shrink-0 md:w-[340px]">
        <VolumeBars
          label="Planned sets per week"
          weeks={block.weeks.map((w) => ({
            label: w.isDeload ? "DL" : `Wk ${w.index}`,
            sets: w.totalSets,
            deload: w.isDeload,
          }))}
          current={current === -1 ? undefined : current}
          summary={volumeSummary(block)}
        />
      </div>
    </header>
  );
}

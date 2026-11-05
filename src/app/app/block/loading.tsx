import { Panel, Skeleton } from "~/components/ui-kit/app-shell-kit";

/** Mirrors BlockHeader + BlockGrid: title, weekly volume bars, then label column x week columns. */
export default function BlockLoading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto flex w-full max-w-[1240px] flex-col gap-10 px-6 pt-10 pb-20 md:px-10"
    >
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
        <div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2.5 h-9 w-64" />
          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        </div>
        <div className="w-full md:w-[340px]">
          <Skeleton className="h-3 w-36" />
          <div className="mt-2 flex h-28 items-end gap-1.5 sm:gap-2">
            {["h-[52%]", "h-[64%]", "h-[76%]", "h-[88%]", "h-[40%]"].map((h) => (
              <Skeleton key={h} className={"flex-1 rounded-[6px] " + h} />
            ))}
          </div>
          <Skeleton className="mt-2 h-3 w-full" />
        </div>
      </header>
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="hidden h-4 w-72 sm:block" />
        </div>
        <Panel padding="none" className="overflow-hidden">
          <div className="grid gap-1 p-3 sm:p-4" style={{ gridTemplateColumns: "minmax(96px, 168px) repeat(5, minmax(0, 1fr))" }}>
            <span />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="mx-auto mb-1 h-8 w-12 rounded-control" />
            ))}
            {Array.from({ length: 8 }).map((_, r) => (
              <div key={r} className="contents">
                <Skeleton className="my-auto h-4 w-20" />
                {Array.from({ length: 5 }).map((__, c) => (
                  <Skeleton key={c} className="h-9 w-full rounded-control" />
                ))}
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

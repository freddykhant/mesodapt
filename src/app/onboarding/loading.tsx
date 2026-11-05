import { Skeleton } from "~/components/ui-kit/app-shell-kit";

/** Wizard-shaped placeholder while the session/block check resolves. */
export default function OnboardingLoading() {
  return (
    <div className="grid gap-x-16 lg:grid-cols-[minmax(0,1fr)_400px]" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-1 flex-1 rounded-pill" />
            ))}
          </div>
          <Skeleton className="h-4 w-8" />
        </div>

        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-5 w-96 max-w-full" />
          <Skeleton className="h-5 w-72 max-w-full" />
        </div>

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-4 w-12" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-11 rounded-control" />
              <Skeleton className="h-11 rounded-control" />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-11 rounded-control" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2.5">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-11 rounded-control" />
            </div>
            <div className="flex flex-col gap-2.5">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-11 rounded-control" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-border-subtle pt-6">
          <Skeleton className="h-11 w-32 rounded-pill" />
        </div>
      </div>

      {/* The block card, wide screens only (the wizard shows it there from the first step). */}
      <div className="hidden pt-11 lg:block">
        <div className="rounded-card border border-border bg-surface-raised p-6 shadow-pop">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="mt-2 h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-64" />
          <Skeleton className="mt-5 h-[148px] rounded-control" />
        </div>
      </div>
    </div>
  );
}

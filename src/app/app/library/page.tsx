import { Library } from "lucide-react";
import { EmptyState, PageHeader } from "~/components/ui-kit/app-shell-kit";

export default function LibraryStub() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Library"
        title="Library"
        description="The exercises and splits your plans are built from."
      />
      <div className="animate-rise [animation-delay:60ms]">
        <EmptyState icon={Library} title="Nothing to browse here yet">
          Your block already picks from the exercise library, where each lift is tagged with the
          muscles it trains. I haven’t built the page to browse it yet.
        </EmptyState>
      </div>
    </div>
  );
}

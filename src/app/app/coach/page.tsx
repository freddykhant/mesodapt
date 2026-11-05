import { MessageSquare } from "lucide-react";
import { ButtonLink, PageHeader } from "~/components/ui-kit/app-shell-kit";
import { EmptyState } from "~/components/home/empty-state";

export default function CoachStub() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Coach"
        title="Coach"
        description="Notes and answers about your block, in one place."
      />
      <div className="animate-rise [animation-delay:60ms]">
        <EmptyState
          icon={MessageSquare}
          title="Your coach history isn’t here yet"
          action={
            <ButtonLink href="/app/block" variant="secondary" size="sm">
              Open your block
            </ButtonLink>
          }
        >
          I keep every message you send the coach, but I haven’t built the page to read them back
          yet. For now the coach sits at the top of each week in your block.
        </EmptyState>
      </div>
    </div>
  );
}

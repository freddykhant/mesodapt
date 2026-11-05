import type { ReactNode } from "react";
import { PageHeader, Panel } from "~/components/ui-kit/app-shell-kit";
import { SchedulePrefsForm } from "~/components/schedule/schedule-prefs-form";
import { getSession } from "~/server/better-auth/server";

/** Luma-style settings section: what it is on the left, the controls on the right. */
function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-border-subtle pt-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-card-title text-fg">{title}</h2>
        <p className="mt-1 text-card-desc text-fg-muted">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4">
      <span className="text-list text-fg">{label}</span>
      <span className="min-w-0 truncate text-body text-fg-muted">{children}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const session = await getSession();
  const user = session?.user;
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" description="Your account, and the standing week Mesodapt plans around." />

      <div className="flex animate-rise flex-col gap-8 [animation-delay:60ms]">
        <Section title="Account" description="You sign in with Google. It shares your basic profile and email, nothing else.">
          <Panel padding="none">
            <div className="flex items-center gap-3.5 px-5 py-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-aura text-card-title text-fg-soft">
                {user?.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="truncate text-list text-fg">{user?.name}</div>
                <div className="truncate text-card-desc text-fg-muted">{user?.email}</div>
              </div>
            </div>
            <div className="divide-y divide-border-subtle border-t border-border-subtle">
              <Field label="Sign-in">Google</Field>
              <div className="px-5 py-4">
                <div className="text-list text-fg">Deleting your account</div>
                <p className="mt-0.5 text-card-desc text-fg-muted">
                  There&apos;s no button for it yet. Email me at{" "}
                  <a
                    href="mailto:freddyhmk@gmail.com"
                    // Links read as they do on the privacy page, the one pink on this screen.
                    className="text-accent underline-offset-2 hover:underline"
                  >
                    freddyhmk@gmail.com
                  </a>{" "}
                  from this address and I&apos;ll delete it, along with your profile, plan, logs, check-ins and
                  coach-box messages.
                </p>
              </div>
            </div>
          </Panel>
        </Section>

        <Section
          title="Training week"
          description="How your week board is laid out, and when you can train."
        >
          <SchedulePrefsForm />
        </Section>
      </div>
    </div>
  );
}

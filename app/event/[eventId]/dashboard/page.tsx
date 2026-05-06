import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/dashboard";
import { DashboardLive } from "@/components/DashboardLive";
import { PushToggle } from "@/components/PushToggle";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const initial = await getDashboardData(eventId);
  if (!initial) redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Notifications
          </p>
          <p className="text-sm text-muted-foreground">
            Reçois un ping quand un invité rejoint le BBQ.
          </p>
        </div>
        <PushToggle eventId={eventId} />
      </div>
      <hr className="bbq-divider" />
      <DashboardLive eventId={eventId} initial={initial} />
    </div>
  );
}

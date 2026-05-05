import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/dashboard";
import { DashboardLive } from "@/components/DashboardLive";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const initial = await getDashboardData(eventId);
  if (!initial) redirect("/");

  return <DashboardLive eventId={eventId} initial={initial} />;
}

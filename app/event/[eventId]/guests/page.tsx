import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/dashboard";
import { GuestsList } from "@/components/GuestsList";

export const dynamic = "force-dynamic";

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const initial = await getDashboardData(eventId);
  if (!initial) redirect("/");

  return <GuestsList eventId={eventId} initial={initial} />;
}

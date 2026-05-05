import { redirect } from "next/navigation";
import { getGuestContext } from "@/lib/actions/guest";
import { GuestSelector } from "@/components/GuestSelector";
import { Toaster } from "@/components/ui/sonner";

export default async function SelectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const ctx = await getGuestContext(code);
  if (!ctx) redirect(`/bbq/${code}`);
  if (!ctx.guest) redirect(`/bbq/${code}`);

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-6">
          <p className="text-3xl">🔥🍖</p>
          <h1 className="text-2xl font-black tracking-tight">
            {ctx.event.name}
          </h1>
        </header>
        <GuestSelector
          eventCode={code}
          firstName={ctx.guest.firstName}
          items={ctx.items}
          initialSelections={ctx.selections}
          committedByOthers={ctx.committedByOthers ?? {}}
        />
        <Toaster />
      </div>
    </main>
  );
}

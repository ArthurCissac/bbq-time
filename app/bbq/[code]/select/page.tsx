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
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Barbecue
          </p>
          <h1 className="font-display-tight text-4xl font-medium mt-2 leading-tight">
            {ctx.event.name}
          </h1>
          <div className="mt-3 mx-auto h-px w-12 bg-foreground/40" />
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

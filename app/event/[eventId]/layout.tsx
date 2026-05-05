import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { EventNav } from "@/components/EventNav";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const ev = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!ev) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:underline"
            >
              ← Tous les BBQ
            </Link>
            <h1 className="text-3xl font-display font-extrabold tracking-tight mt-1">
              {ev.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Code : <code className="font-mono">{ev.code}</code>
            </p>
          </div>
          <EventNav eventId={ev.id} />
        </header>
        {children}
      </div>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { EventNav } from "@/components/EventNav";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <main className="min-h-screen p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/" aria-label="Retour à l'accueil">
              <Logo size="sm" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground tracking-wider uppercase border-b border-transparent hover:border-foreground transition-colors pb-0.5"
              >
                ← Tous les BBQ
              </Link>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pt-2">
            <div>
              <h1 className="font-display-tight text-4xl md:text-5xl font-medium leading-tight">
                {ev.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Code : <code className="font-mono uppercase tracking-widest">{ev.code}</code>
              </p>
            </div>
            <EventNav eventId={ev.id} />
          </div>
        </header>

        <hr className="bbq-divider" />

        {children}
      </div>
    </main>
  );
}

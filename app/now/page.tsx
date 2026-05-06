import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function NowPage() {
  const active = await db.query.events.findFirst({
    where: eq(events.isActive, true),
  });

  if (active) redirect(`/bbq/${active.code}`);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        <Logo size="md" className="justify-center" />
        <div className="bbq-card p-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            En attente
          </p>
          <h1 className="font-display-tight text-3xl font-medium leading-tight">
            Aucun BBQ <span className="text-ember">en cours</span>
          </h1>
          <div className="mx-auto h-px w-12 bg-foreground/40" />
          <p className="text-muted-foreground">
            L'organisateur n'a pas encore activé de BBQ. Reviens plus tard.
          </p>
          <Link href="/">
            <Button variant="outline" className="mt-2">
              Espace organisateur →
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

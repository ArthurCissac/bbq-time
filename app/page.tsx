import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, guests } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateField } from "@/components/DateField";
import { Logo, LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DeleteEventButton } from "@/components/DeleteEventButton";
import { createEvent, activateEvent } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allEvents = await db.query.events.findMany({
    orderBy: [desc(events.createdAt)],
    limit: 20,
  });

  const counts = await db
    .select({
      eventId: guests.eventId,
      count: sql<number>`count(*)::int`,
    })
    .from(guests)
    .groupBy(guests.eventId);
  const guestCount = new Map<string, number>(
    counts.map((c) => [c.eventId, Number(c.count)]),
  );

  return (
    <main className="min-h-screen p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-12 md:space-y-16">
        {/* Hero */}
        <header className="pt-6 md:pt-10">
          <div className="flex items-center justify-between mb-10">
            <Logo size="lg" />
            <ThemeToggle />
          </div>
          <h1 className="font-display-tight text-5xl md:text-7xl font-medium leading-[0.95]">
            Qui veut <span className="text-ember">manger</span> quoi.
          </h1>
          <p className="mt-4 font-display text-2xl md:text-3xl text-foreground/85 leading-tight tracking-tight">
            Le BBQ entre amis, sans le casse-tête.
          </p>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Tes potes scannent le QR posé sur la table. Chacun choisit ce qu'il
            a envie de manger. Toi, tu vois tout.
          </p>
          <div className="mt-6">
            <Link
              href="/suggestions"
              className="text-sm text-foreground border-b border-foreground/30 hover:border-foreground transition-colors pb-0.5"
            >
              Modifier mes suggestions →
            </Link>
          </div>
        </header>

        {/* Nouveau BBQ */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl font-medium">Nouveau BBQ</h2>
            <span className="bbq-pill">Créer</span>
          </div>
          <div className="bbq-card p-6">
            <form
              action={async (formData) => {
                "use server";
                await createEvent({
                  name: formData.get("name") as string,
                  eventDate: formData.get("eventDate")
                    ? new Date(formData.get("eventDate") as string)
                    : null,
                });
              }}
              className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end"
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom du BBQ</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  maxLength={80}
                  placeholder="Soirée grillades du samedi"
                  className="h-11"
                />
              </div>
              <DateField />
              <Button
                type="submit"
                className="h-11 bg-coal hover:bg-coal/90 text-ivory px-6"
              >
                Créer
              </Button>
            </form>
          </div>
        </section>

        {/* Tous les BBQ */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-2xl font-medium">Tes BBQ</h2>
            <p className="text-xs text-muted-foreground">
              Le QR fixe pointe vers le BBQ <span className="text-ember font-semibold">Actif</span>
            </p>
          </div>
          {allEvents.length === 0 ? (
            <div className="bbq-card p-10 text-center">
              <LogoMark size={32} className="mx-auto text-muted-foreground" />
              <p className="mt-3 text-muted-foreground italic">
                Pas encore de BBQ. Lance le premier ci-dessus.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {allEvents.map((ev) => (
                <article
                  key={ev.id}
                  className={
                    ev.isActive
                      ? "bbq-card overflow-hidden ring-1 ring-ember"
                      : "bbq-card overflow-hidden bbq-card-clickable"
                  }
                >
                  <Link
                    href={`/event/${ev.id}/items`}
                    className="block p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-xl font-medium leading-tight tracking-tight truncate">
                        {ev.name}
                      </h3>
                      <code className="text-[10px] tracking-widest font-mono uppercase bg-secondary text-muted-foreground px-2 py-0.5 rounded shrink-0">
                        {ev.code}
                      </code>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                      <span>
                        {ev.eventDate
                          ? new Date(ev.eventDate).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })
                          : "Date non définie"}
                      </span>
                      {(guestCount.get(ev.id) ?? 0) > 0 ? (
                        <span className="bbq-pill">
                          👥 {guestCount.get(ev.id)} invité
                          {(guestCount.get(ev.id) ?? 0) > 1 ? "s" : ""}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                  <div className="px-5 pb-4 pt-1 flex items-center justify-between">
                    <DeleteEventButton eventId={ev.id} eventName={ev.name} />
                    {ev.isActive ? (
                      <span className="bbq-pill bbq-pill-ember">● Actif</span>
                    ) : (
                      <form
                        action={async () => {
                          "use server";
                          await activateEvent(ev.id);
                        }}
                      >
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-coal/20 hover:bg-coal hover:text-ivory hover:border-coal"
                        >
                          Activer
                        </Button>
                      </form>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Rejoindre via code (compact) */}
        <section>
          <div className="bbq-card p-5 flex items-center gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              T'as un code BBQ ?
            </p>
            <form
              action={async (formData) => {
                "use server";
                const code = String(formData.get("code") ?? "")
                  .trim()
                  .toLowerCase();
                if (code) redirect(`/bbq/${code}`);
              }}
              className="flex gap-2 flex-1 min-w-[200px]"
            >
              <Label htmlFor="code" className="sr-only">
                Code BBQ
              </Label>
              <Input
                id="code"
                name="code"
                required
                placeholder="k3xa9p"
                maxLength={12}
                className="font-mono uppercase tracking-widest h-9 flex-1"
              />
              <Button type="submit" variant="outline" size="sm" className="h-9">
                Rejoindre
              </Button>
            </form>
          </div>
        </section>

        <footer className="pt-6 pb-10 text-center">
          <p className="text-xs text-muted-foreground tracking-wider uppercase">
            Barbecue · par <a href="https://nexflow.fr" className="hover:text-foreground transition-colors">Nexflow</a>
          </p>
        </footer>
      </div>
    </main>
  );
}

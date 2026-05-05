import Link from "next/link";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DateField } from "@/components/DateField";
import { createEvent, activateEvent } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allEvents = await db.query.events.findMany({
    orderBy: [desc(events.createdAt)],
    limit: 20,
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center relative">
          <h1 className="text-6xl font-display font-extrabold tracking-tight">
            BBQ <span className="text-red-700">Time</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Crée un BBQ, partage le QR, vois ce que tout le monde veut.
          </p>
          <Link
            href="/suggestions"
            className="inline-block mt-3 text-sm text-red-600 hover:underline"
          >
            ⚡ Modifier les suggestions →
          </Link>
        </header>

        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle>🎩 Nouveau BBQ</CardTitle>
            <CardDescription>
              Crée un événement, ajoute les items, partage le QR avec tes invités.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nom du BBQ</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  maxLength={80}
                  placeholder="BBQ retour de Cécile"
                />
              </div>
              <DateField />
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Créer 🔥
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📲 Rejoindre un BBQ</CardTitle>
            <CardDescription>
              Si quelqu'un t'a partagé un code (sans QR sous la main).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                "use server";
                const code = String(formData.get("code") ?? "")
                  .trim()
                  .toLowerCase();
                if (code) redirect(`/bbq/${code}`);
              }}
              className="flex gap-2"
            >
              <Label htmlFor="code" className="sr-only">
                Code BBQ
              </Label>
              <Input
                id="code"
                name="code"
                required
                placeholder="ex: k3xa9p"
                maxLength={12}
                className="font-mono uppercase tracking-widest"
              />
              <Button type="submit" variant="outline">
                Rejoindre
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold">Tous les BBQ</h2>
            <p className="text-xs text-muted-foreground">
              Le QR fixe (3D) pointe vers le BBQ marqué <strong>● Actif</strong>
            </p>
          </div>
          {allEvents.length === 0 ? (
            <p className="text-muted-foreground italic">
              Aucun BBQ pour l'instant. Lance le premier !
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {allEvents.map((ev) => (
                <Card
                  key={ev.id}
                  className={
                    ev.isActive
                      ? "border-2 border-green-500 bg-green-50/30 overflow-hidden"
                      : "border-2 hover:border-red-400 transition-colors overflow-hidden"
                  }
                >
                  <Link
                    href={`/event/${ev.id}/items`}
                    className="block hover:bg-orange-50/50 transition-colors"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-2 font-display">
                        <span className="truncate">{ev.name}</span>
                        <code className="text-xs bg-orange-100 text-orange-900 px-2 py-1 rounded font-mono shrink-0">
                          {ev.code}
                        </code>
                      </CardTitle>
                      <CardDescription>
                        {ev.eventDate
                          ? new Date(ev.eventDate).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })
                          : "Pas de date"}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                  <div className="px-6 pb-4 flex justify-end">
                    {ev.isActive ? (
                      <Badge className="bg-green-600 hover:bg-green-700">
                        ● Actif
                      </Badge>
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
                          className="h-7 text-xs"
                        >
                          Activer
                        </Button>
                      </form>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <p className="text-center text-xs text-muted-foreground pt-8">
          Made with 🔥 by Nexflow
        </p>
      </div>
    </main>
  );
}

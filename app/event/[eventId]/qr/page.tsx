import { headers } from "next/headers";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { QRDisplay } from "@/components/QRDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { activateEvent } from "@/lib/actions/admin";

export default async function QRPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const ev = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!ev) return null;

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const fixedUrl = `${proto}://${host}/now`;
  const directUrl = `${proto}://${host}/bbq/${ev.code}`;

  return (
    <div className="space-y-4">
      <Card className="border-2 border-border">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">📲 QR fixe (imprimé 3D)</h2>
            {ev.isActive ? (
              <Badge className="bg-green-600 hover:bg-green-700">
                ● Actif
              </Badge>
            ) : (
              <Badge variant="outline">Inactif</Badge>
            )}
          </div>
          <p className="text-muted-foreground mb-6 max-w-md">
            Ce QR pointe vers <code className="bg-secondary px-1.5 py-0.5 rounded">/now</code> et
            redirige toujours vers le BBQ <strong>actif</strong>. C'est celui à
            imprimer en 3D — tu n'auras jamais à le changer.
          </p>
          <QRDisplay url={fixedUrl} code="now" />

          {!ev.isActive ? (
            <form
              action={async () => {
                "use server";
                await activateEvent(ev.id);
              }}
              className="mt-6"
            >
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700"
                size="lg"
              >
                🔥 Activer ce BBQ
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Le QR fixe redirigera vers ce BBQ après activation.
              </p>
            </form>
          ) : (
            <p className="text-sm text-green-700 dark:text-green-400 mt-4 font-medium">
              ✓ Ton QR fixe redirige actuellement vers ce BBQ.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-bold">🔗 Lien direct (option de secours)</h3>
          <p className="text-sm text-muted-foreground">
            Si quelqu'un ne peut pas scanner, partage ce lien direct vers
            <strong> ce BBQ uniquement</strong> :
          </p>
          <code className="block break-all bg-secondary p-2 rounded font-mono text-xs">
            {directUrl}
          </code>
          <p className="text-sm text-muted-foreground">
            Code court : <code className="font-mono font-bold">{ev.code}</code>
          </p>
          <Link
            href="/now"
            target="_blank"
            className="text-sm text-red-600 hover:underline"
          >
            Tester le QR fixe →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

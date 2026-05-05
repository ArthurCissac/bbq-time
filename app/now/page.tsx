import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NowPage() {
  const active = await db.query.events.findFirst({
    where: eq(events.isActive, true),
  });

  if (active) redirect(`/bbq/${active.code}`);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md border-2 border-orange-200">
        <CardContent className="p-8 text-center space-y-4">
          <h1 className="text-3xl font-display font-extrabold tracking-tight">
            Aucun BBQ en cours
          </h1>
          <div className="mx-auto h-1 w-12 rounded-full bg-red-700" />
          <p className="text-muted-foreground">
            L'organisateur n'a pas encore lancé de BBQ. Reviens plus tard !
          </p>
          <Link href="/">
            <Button variant="outline">Espace organisateur →</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

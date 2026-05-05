import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { joinEvent } from "@/lib/actions/guest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const ev = await db.query.events.findFirst({
    where: eq(events.code, code.toLowerCase()),
  });
  if (!ev) notFound();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md border-2 border-red-500 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-display font-extrabold tracking-tight">
            {ev.name}
          </CardTitle>
          <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-red-700" />
          <p className="text-muted-foreground mt-3">
            Rejoins le BBQ et choisis ce que tu veux.
          </p>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              await joinEvent({
                code,
                firstName: formData.get("firstName") as string,
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="firstName">Ton prénom</Label>
              <Input
                id="firstName"
                name="firstName"
                required
                maxLength={30}
                autoFocus
                placeholder="Arthur"
                className="text-lg h-12"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg bg-red-600 hover:bg-red-700"
            >
              Je rejoins le BBQ 🔥
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { joinEvent } from "@/lib/actions/guest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";

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
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" className="justify-center" />
        </div>
        <div className="bbq-card p-8 space-y-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Tu es invité au
            </p>
            <h1 className="font-display-tight text-4xl font-medium mt-2 leading-tight">
              {ev.name}
            </h1>
            <div className="mx-auto mt-3 h-px w-12 bg-foreground/40" />
          </div>
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
            <div className="space-y-1.5">
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
              className="w-full h-12 text-base bg-coal hover:bg-coal/90 text-ivory"
            >
              Je rejoins
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

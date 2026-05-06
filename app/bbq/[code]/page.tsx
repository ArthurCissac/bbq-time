import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { Logo } from "@/components/Logo";
import { JoinForm } from "@/components/JoinForm";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
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
          <JoinForm code={code} />
        </div>
      </div>
    </main>
  );
}

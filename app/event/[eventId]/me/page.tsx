import { redirect } from "next/navigation";
import {
  getGuestContextByEventId,
  joinEventById,
  leaveEventById,
} from "@/lib/actions/guest";
import { GuestSelector } from "@/components/GuestSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";

export default async function MePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const ctx = await getGuestContextByEventId(eventId);
  if (!ctx) redirect("/");

  if (!ctx.guest) {
    return (
      <Card className="border-2 border-orange-200 max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="font-display">🍽️ Tu manges aussi ?</CardTitle>
          <p className="text-sm text-muted-foreground">
            Identifie-toi pour choisir tes items, comme tes invités.
          </p>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              await joinEventById({
                eventId,
                firstName: formData.get("firstName") as string,
              });
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label htmlFor="firstName">Ton prénom</Label>
              <Input
                id="firstName"
                name="firstName"
                required
                maxLength={30}
                placeholder="Arthur"
                className="text-lg h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-red-600 hover:bg-red-700"
            >
              S'inscrire au BBQ 🔥
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Tu es inscrit comme <strong>{ctx.guest.firstName}</strong>
        </p>
        <form
          action={async () => {
            "use server";
            await leaveEventById(eventId);
          }}
        >
          <Button type="submit" variant="ghost" size="sm">
            Changer de prénom
          </Button>
        </form>
      </div>
      <GuestSelector
        eventCode={ctx.event.code}
        firstName={ctx.guest.firstName}
        items={ctx.items}
        initialSelections={ctx.selections}
        committedByOthers={ctx.committedByOthers ?? {}}
      />
      <Toaster />
    </div>
  );
}

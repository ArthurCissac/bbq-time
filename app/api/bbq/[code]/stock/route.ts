import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, and, ne, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, guests, selections, items } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const event = await db.query.events.findFirst({
    where: eq(events.code, code.toLowerCase()),
  });
  if (!event) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Exclure le guest courant via cookie
  const c = await cookies();
  const myToken = c.get(`bbq_guest:${event.id}`)?.value;
  let myGuestId: string | null = null;
  if (myToken) {
    const me = await db.query.guests.findFirst({
      where: and(eq(guests.token, myToken), eq(guests.eventId, event.id)),
    });
    myGuestId = me?.id ?? null;
  }

  const otherGuests = await db.query.guests.findMany({
    where: myGuestId
      ? and(eq(guests.eventId, event.id), ne(guests.id, myGuestId))
      : eq(guests.eventId, event.id),
  });
  const otherIds = otherGuests.map((g) => g.id);
  const otherSels =
    otherIds.length === 0
      ? []
      : await db.query.selections.findMany({
          where: inArray(selections.guestId, otherIds),
        });
  const committedByOthers: Record<string, number> = {};
  for (const s of otherSels) {
    committedByOthers[s.itemId] =
      (committedByOthers[s.itemId] ?? 0) + s.quantity;
  }

  // Items à jour (au cas où l'admin a changé qty/name)
  const eventItems = await db.query.items.findMany({
    where: eq(items.eventId, event.id),
    orderBy: (i, { asc }) => [asc(i.sortOrder), asc(i.name)],
  });

  return NextResponse.json(
    { committedByOthers, items: eventItems },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

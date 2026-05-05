import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, items, guests, selections } from "@/lib/db/schema";

export type DashboardData = {
  eventName: string;
  eventCode: string;
  totals: Array<{
    itemId: string;
    name: string;
    emoji: string;
    category: string;
    hasCookingPref: boolean;
    quantity: number;
    remainingQty: number;
    availableQty: number | null;
    cookingBreakdown: Record<string, number>;
    participants: Array<{
      selectionId: string;
      guestId: string;
      guestName: string;
      quantity: number;
      cookingPref: string | null;
      notes: string | null;
      served: boolean;
    }>;
    allServed: boolean;
  }>;
  guests: Array<{
    id: string;
    firstName: string;
    joinedAt: string;
    servedAt: string | null;
    selections: Array<{
      selectionId: string;
      itemId: string;
      itemName: string;
      itemEmoji: string;
      quantity: number;
      cookingPref: string | null;
      notes: string | null;
      servedAt: string | null;
    }>;
  }>;
};

export async function getDashboardData(
  eventId: string,
): Promise<DashboardData | null> {
  const ev = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!ev) return null;

  const eventItems = await db.query.items.findMany({
    where: eq(items.eventId, eventId),
    orderBy: (i, { asc }) => [asc(i.sortOrder), asc(i.name)],
  });

  const eventGuests = await db.query.guests.findMany({
    where: eq(guests.eventId, eventId),
    orderBy: (g, { asc }) => [asc(g.joinedAt)],
  });

  const guestIds = eventGuests.map((g) => g.id);
  const allSelections =
    guestIds.length === 0
      ? []
      : await db.query.selections.findMany({
          where: inArray(selections.guestId, guestIds),
        });

  const itemMap = new Map(eventItems.map((i) => [i.id, i]));
  const guestMap = new Map(eventGuests.map((g) => [g.id, g]));

  const totals = eventItems.map((item) => {
    const selsForItem = allSelections.filter(
      (s) => s.itemId === item.id && s.quantity > 0,
    );
    const cookingBreakdown: Record<string, number> = {};
    let quantity = 0;
    let remainingQty = 0;
    const participants: Array<{
      selectionId: string;
      guestId: string;
      guestName: string;
      quantity: number;
      cookingPref: string | null;
      notes: string | null;
      served: boolean;
    }> = [];
    for (const s of selsForItem) {
      quantity += s.quantity;
      const isServed = !!s.servedAt;
      if (!isServed) remainingQty += s.quantity;
      const guest = guestMap.get(s.guestId);
      participants.push({
        selectionId: s.id,
        guestId: s.guestId,
        guestName: guest?.firstName ?? "?",
        quantity: s.quantity,
        cookingPref: s.cookingPref,
        notes: s.notes,
        served: isServed,
      });
      if (s.cookingPref) {
        cookingBreakdown[s.cookingPref] =
          (cookingBreakdown[s.cookingPref] ?? 0) + s.quantity;
      }
    }
    return {
      itemId: item.id,
      name: item.name,
      emoji: item.emoji,
      category: item.category,
      hasCookingPref: item.hasCookingPref,
      quantity,
      remainingQty,
      availableQty: item.availableQty,
      cookingBreakdown,
      participants,
      allServed: selsForItem.length > 0 && remainingQty === 0,
    };
  });

  const guestData = eventGuests.map((g) => {
    const sels = allSelections
      .filter((s) => s.guestId === g.id && s.quantity > 0)
      .map((s) => {
        const item = itemMap.get(s.itemId);
        return {
          selectionId: s.id,
          itemId: s.itemId,
          itemName: item?.name ?? "?",
          itemEmoji: item?.emoji ?? "❓",
          quantity: s.quantity,
          cookingPref: s.cookingPref,
          notes: s.notes,
          servedAt: s.servedAt ? s.servedAt.toISOString() : null,
        };
      });
    return {
      id: g.id,
      firstName: g.firstName,
      joinedAt: g.joinedAt.toISOString(),
      servedAt: g.servedAt ? g.servedAt.toISOString() : null,
      selections: sels,
    };
  });

  return {
    eventName: ev.name,
    eventCode: ev.code,
    totals,
    guests: guestData,
  };
}

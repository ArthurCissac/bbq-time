import { neon } from "@neondatabase/serverless";

// Raw Neon SQL — bypass Drizzle pour éviter tout cache de query.
const sqlRaw = neon(process.env.DATABASE_URL!);

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

type EventRow = {
  id: string;
  name: string;
  code: string;
};

type ItemRow = {
  id: string;
  event_id: string;
  name: string;
  emoji: string;
  category: string;
  has_cooking_pref: boolean;
  available_qty: number | null;
  description: string | null;
  sort_order: number;
};

type GuestRow = {
  id: string;
  event_id: string;
  first_name: string;
  joined_at: string;
  served_at: string | null;
};

type SelectionRow = {
  id: string;
  guest_id: string;
  item_id: string;
  quantity: number;
  cooking_pref: string | null;
  notes: string | null;
  served_at: string | null;
};

export async function getDashboardData(
  eventId: string,
): Promise<DashboardData | null> {
  const evRows = (await sqlRaw`SELECT id, name, code FROM events WHERE id = ${eventId}`) as EventRow[];
  if (evRows.length === 0) return null;
  const ev = evRows[0];

  const eventItems = (await sqlRaw`
    SELECT id, event_id, name, emoji, category, has_cooking_pref,
           available_qty, description, sort_order
    FROM items
    WHERE event_id = ${eventId}
    ORDER BY sort_order ASC, name ASC
  `) as ItemRow[];

  const eventGuests = (await sqlRaw`
    SELECT id, event_id, first_name, joined_at::text, served_at::text
    FROM guests
    WHERE event_id = ${eventId}
    ORDER BY joined_at ASC
  `) as GuestRow[];

  let allSelections: SelectionRow[] = [];
  if (eventGuests.length > 0) {
    const ids = eventGuests.map((g) => g.id);
    allSelections = (await sqlRaw`
      SELECT id, guest_id, item_id, quantity, cooking_pref, notes, served_at::text
      FROM selections
      WHERE guest_id = ANY(${ids}::uuid[])
    `) as SelectionRow[];
  }

  const itemMap = new Map(eventItems.map((i) => [i.id, i]));
  const guestMap = new Map(eventGuests.map((g) => [g.id, g]));

  const totals = eventItems.map((item) => {
    const selsForItem = allSelections.filter(
      (s) => s.item_id === item.id && s.quantity > 0,
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
      const isServed = !!s.served_at;
      if (!isServed) remainingQty += s.quantity;
      const guest = guestMap.get(s.guest_id);
      participants.push({
        selectionId: s.id,
        guestId: s.guest_id,
        guestName: guest?.first_name ?? "?",
        quantity: s.quantity,
        cookingPref: s.cooking_pref,
        notes: s.notes,
        served: isServed,
      });
      if (s.cooking_pref) {
        cookingBreakdown[s.cooking_pref] =
          (cookingBreakdown[s.cooking_pref] ?? 0) + s.quantity;
      }
    }
    return {
      itemId: item.id,
      name: item.name,
      emoji: item.emoji,
      category: item.category,
      hasCookingPref: item.has_cooking_pref,
      quantity,
      remainingQty,
      availableQty: item.available_qty,
      cookingBreakdown,
      participants,
      allServed: selsForItem.length > 0 && remainingQty === 0,
    };
  });

  const guestData = eventGuests.map((g) => {
    const sels = allSelections
      .filter((s) => s.guest_id === g.id && s.quantity > 0)
      .map((s) => {
        const item = itemMap.get(s.item_id);
        return {
          selectionId: s.id,
          itemId: s.item_id,
          itemName: item?.name ?? "?",
          itemEmoji: item?.emoji ?? "❓",
          quantity: s.quantity,
          cookingPref: s.cooking_pref,
          notes: s.notes,
          servedAt: s.served_at ?? null,
        };
      });
    return {
      id: g.id,
      firstName: g.first_name,
      joinedAt: g.joined_at,
      servedAt: g.served_at ?? null,
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

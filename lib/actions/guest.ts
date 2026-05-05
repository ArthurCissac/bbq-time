"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and, sql, ne, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, guests, items, selections } from "@/lib/db/schema";
import {
  joinEventSchema,
  upsertSelectionSchema,
  type JoinEventInput,
  type UpsertSelectionInput,
} from "@/lib/schemas";
import { checkLimit, joinLimiter, guestLimiter } from "@/lib/rate-limit";

const GUEST_COOKIE = "bbq_guest";

async function clientKey(prefix: string): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "anon";
  return `${prefix}:${ip}`;
}

function setGuestCookie(eventId: string, token: string) {
  cookies().set(`${GUEST_COOKIE}:${eventId}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

function readGuestCookie(eventId: string): string | undefined {
  return cookies().get(`${GUEST_COOKIE}:${eventId}`)?.value;
}

export async function joinEvent(input: JoinEventInput) {
  const limit = await checkLimit(joinLimiter, await clientKey("join"));
  if (!limit.ok) throw new Error("RATE_LIMITED");

  const data = joinEventSchema.parse(input);

  const event = await db.query.events.findFirst({
    where: eq(events.code, data.code.toLowerCase()),
  });
  if (!event) throw new Error("EVENT_NOT_FOUND");

  // If a guest cookie already exists for this event, reuse it
  const existingToken = readGuestCookie(event.id);
  if (existingToken) {
    const existing = await db.query.guests.findFirst({
      where: and(eq(guests.token, existingToken), eq(guests.eventId, event.id)),
    });
    if (existing) {
      redirect(`/bbq/${event.code}/select`);
    }
  }

  const [created] = await db
    .insert(guests)
    .values({
      eventId: event.id,
      firstName: data.firstName,
    })
    .returning();

  setGuestCookie(event.id, created.token);
  revalidatePath(`/admin/${event.id}/dashboard`);
  redirect(`/bbq/${event.code}/select`);
}

export async function getGuestContext(code: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.code, code.toLowerCase()),
  });
  if (!event) return null;

  const token = readGuestCookie(event.id);
  if (!token) return { event, guest: null, items: [], selections: [] };

  const guest = await db.query.guests.findFirst({
    where: and(eq(guests.token, token), eq(guests.eventId, event.id)),
  });
  if (!guest) return { event, guest: null, items: [], selections: [] };

  const eventItems = await db.query.items.findMany({
    where: eq(items.eventId, event.id),
    orderBy: (i, { asc }) => [asc(i.sortOrder), asc(i.name)],
  });

  const guestSelections = await db.query.selections.findMany({
    where: eq(selections.guestId, guest.id),
  });

  // Sum of quantities committed by OTHER guests for each item
  const otherGuests = await db.query.guests.findMany({
    where: and(eq(guests.eventId, event.id), ne(guests.id, guest.id)),
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

  return {
    event,
    guest,
    items: eventItems,
    selections: guestSelections,
    committedByOthers,
  };
}

export async function upsertSelection(
  eventCode: string,
  input: UpsertSelectionInput,
) {
  const limit = await checkLimit(guestLimiter, await clientKey("sel"));
  if (!limit.ok) throw new Error("RATE_LIMITED");

  const data = upsertSelectionSchema.parse(input);

  const event = await db.query.events.findFirst({
    where: eq(events.code, eventCode.toLowerCase()),
  });
  if (!event) throw new Error("EVENT_NOT_FOUND");

  const token = readGuestCookie(event.id);
  if (!token) throw new Error("NO_GUEST_TOKEN");

  const guest = await db.query.guests.findFirst({
    where: and(eq(guests.token, token), eq(guests.eventId, event.id)),
  });
  if (!guest) throw new Error("GUEST_NOT_FOUND");

  // Verify item belongs to this event
  const item = await db.query.items.findFirst({
    where: and(eq(items.id, data.itemId), eq(items.eventId, event.id)),
  });
  if (!item) throw new Error("ITEM_NOT_FOUND");

  await db
    .insert(selections)
    .values({
      guestId: guest.id,
      itemId: data.itemId,
      quantity: data.quantity,
      cookingPref: data.cookingPref ?? null,
      notes: data.notes ?? null,
    })
    .onConflictDoUpdate({
      target: [selections.guestId, selections.itemId],
      set: {
        quantity: data.quantity,
        cookingPref: data.cookingPref ?? null,
        notes: data.notes ?? null,
        updatedAt: sql`now()`,
      },
    });

  revalidatePath(`/admin/${event.id}/dashboard`);
}

export async function leaveEvent(eventCode: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.code, eventCode.toLowerCase()),
  });
  if (event) cookies().delete(`${GUEST_COOKIE}:${event.id}`);
  redirect(`/bbq/${eventCode}`);
}

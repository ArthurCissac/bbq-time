"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, items, guests, selections } from "@/lib/db/schema";
import {
  createEventSchema,
  upsertItemSchema,
  type CreateEventInput,
  type UpsertItemInput,
} from "@/lib/schemas";
import { generateEventCode } from "@/lib/code";

export async function createEvent(input: CreateEventInput) {
  const data = createEventSchema.parse(input);

  let code = generateEventCode();
  for (let i = 0; i < 5; i++) {
    const exists = await db.query.events.findFirst({
      where: eq(events.code, code),
    });
    if (!exists) break;
    code = generateEventCode();
  }

  // New event becomes the active one — deactivate all others first
  await db.update(events).set({ isActive: false });

  const [created] = await db
    .insert(events)
    .values({
      code,
      name: data.name,
      eventDate: data.eventDate ?? null,
      isActive: true,
    })
    .returning();

  revalidatePath("/");
  revalidatePath("/now");
  redirect(`/event/${created.id}/items`);
}

export async function activateEvent(eventId: string) {
  await db
    .update(events)
    .set({ isActive: false })
    .where(ne(events.id, eventId));
  await db
    .update(events)
    .set({ isActive: true })
    .where(eq(events.id, eventId));

  revalidatePath("/");
  revalidatePath("/now");
  revalidatePath(`/event/${eventId}/qr`);
}

export async function deleteEvent(eventId: string) {
  await db.delete(events).where(eq(events.id, eventId));
  revalidatePath("/");
  redirect("/");
}

export async function upsertItem(input: UpsertItemInput) {
  const data = upsertItemSchema.parse(input);

  if (data.id) {
    await db
      .update(items)
      .set({
        name: data.name,
        emoji: data.emoji,
        category: data.category,
        hasCookingPref: data.hasCookingPref,
        availableQty: data.availableQty ?? null,
        sortOrder: data.sortOrder,
      })
      .where(and(eq(items.id, data.id), eq(items.eventId, data.eventId)));
  } else {
    await db.insert(items).values({
      eventId: data.eventId,
      name: data.name,
      emoji: data.emoji,
      category: data.category,
      hasCookingPref: data.hasCookingPref,
      availableQty: data.availableQty ?? null,
      sortOrder: data.sortOrder,
    });
  }

  revalidatePath(`/event/${data.eventId}/items`);
  revalidatePath(`/event/${data.eventId}/dashboard`);
}

export async function quickAddItem(
  eventId: string,
  suggestion: {
    name: string;
    emoji: string;
    category: "viande" | "accompagnement" | "boisson" | "dessert" | "autre";
    hasCookingPref: boolean;
    defaultQty: number;
  },
) {
  await db.insert(items).values({
    eventId,
    name: suggestion.name,
    emoji: suggestion.emoji,
    category: suggestion.category,
    hasCookingPref: suggestion.hasCookingPref,
    availableQty: suggestion.defaultQty,
  });
  revalidatePath(`/event/${eventId}/items`);
  revalidatePath(`/event/${eventId}/dashboard`);
}

export async function toggleGuestServed(
  eventId: string,
  guestId: string,
  served: boolean,
) {
  await db
    .update(guests)
    .set({ servedAt: served ? new Date() : null })
    .where(and(eq(guests.id, guestId), eq(guests.eventId, eventId)));
  revalidatePath(`/event/${eventId}/dashboard`);
}

export async function toggleSelectionServed(
  eventId: string,
  selectionId: string,
  served: boolean,
) {
  await db
    .update(selections)
    .set({ servedAt: served ? new Date() : null })
    .where(eq(selections.id, selectionId));
  revalidatePath(`/event/${eventId}/dashboard`);
}

export async function updateItemQty(
  eventId: string,
  itemId: string,
  availableQty: number | null,
) {
  await db
    .update(items)
    .set({ availableQty })
    .where(and(eq(items.id, itemId), eq(items.eventId, eventId)));
  revalidatePath(`/event/${eventId}/items`);
  revalidatePath(`/event/${eventId}/dashboard`);
}

export async function deleteItem(eventId: string, itemId: string) {
  await db
    .delete(items)
    .where(and(eq(items.id, itemId), eq(items.eventId, eventId)));
  revalidatePath(`/event/${eventId}/items`);
}

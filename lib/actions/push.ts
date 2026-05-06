"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { events, pushSubscriptions } from "@/lib/db/schema";
import { notifyEvent } from "@/lib/push";

const subscribeSchema = z.object({
  eventId: z.string().uuid(),
  endpoint: z.string().url().max(2000),
  p256dh: z.string().min(1).max(500),
  auth: z.string().min(1).max(500),
  label: z.string().max(60).optional().nullable(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

export async function subscribePush(input: SubscribeInput) {
  const data = subscribeSchema.parse(input);

  const ev = await db.query.events.findFirst({
    where: eq(events.id, data.eventId),
  });
  if (!ev) throw new Error("EVENT_NOT_FOUND");

  await db
    .insert(pushSubscriptions)
    .values({
      eventId: data.eventId,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      label: data.label ?? null,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        eventId: data.eventId,
        p256dh: data.p256dh,
        auth: data.auth,
        label: data.label ?? null,
      },
    });

  revalidatePath(`/event/${data.eventId}/dashboard`);
}

export async function unsubscribePush(eventId: string, endpoint: string) {
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.eventId, eventId),
        eq(pushSubscriptions.endpoint, endpoint),
      ),
    );
  revalidatePath(`/event/${eventId}/dashboard`);
}

export async function sendTestNotif(eventId: string) {
  const ev = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!ev) return;
  await notifyEvent(eventId, {
    title: `Test — ${ev.name}`,
    body: "Si tu reçois ça, les notifs marchent 🎉",
    url: `/event/${eventId}/dashboard`,
    tag: "test",
  });
}

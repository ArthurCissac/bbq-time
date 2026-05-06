import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

const PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const CONTACT = process.env.VAPID_CONTACT ?? "mailto:hello@example.com";

let vapidConfigured = false;

function ensureVapid(): boolean {
  if (vapidConfigured) return true;
  if (!PUBLIC || !PRIVATE) return false;
  webpush.setVapidDetails(CONTACT, PUBLIC, PRIVATE);
  vapidConfigured = true;
  return true;
}

export async function notifyEvent(
  eventId: string,
  payload: { title: string; body: string; url?: string; tag?: string },
) {
  if (!ensureVapid()) return;

  const subs = await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.eventId, eventId),
  });

  if (subs.length === 0) return;

  const data = JSON.stringify(payload);

  await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          data,
        );
      } catch (err: unknown) {
        const e = err as { statusCode?: number };
        // 404/410 = subscription expired, clean up
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, s.id));
        }
      }
    }),
  );
}

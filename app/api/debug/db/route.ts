import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, guests } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const masked = url.replace(/:([^:@]+)@/, ":****@");
  const host = url.match(/@([^/]+)\//)?.[1] ?? "?";

  try {
    const sql = neon(url);
    const raw = await sql`
      SELECT id, first_name, event_id::text
      FROM guests
      WHERE event_id = '8606822a-9ddb-4179-9215-19c69c1650b7'
    `;

    // Drizzle path
    const ev = await db.query.events.findFirst({
      where: eq(events.id, "8606822a-9ddb-4179-9215-19c69c1650b7"),
    });
    const drizzleGuests = await db.query.guests.findMany({
      where: eq(guests.eventId, "8606822a-9ddb-4179-9215-19c69c1650b7"),
    });

    return NextResponse.json(
      {
        host,
        masked_url: masked,
        raw_sql_guests: raw,
        drizzle_event: ev,
        drizzle_guests: drizzleGuests,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    return NextResponse.json(
      { error: String(e), masked_url: masked, host },
      { status: 500 },
    );
  }
}

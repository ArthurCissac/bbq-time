import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  // Mask password for safety
  const masked = url.replace(/:([^:@]+)@/, ":****@");
  // Just the host
  const host = url.match(/@([^/]+)\//)?.[1] ?? "?";

  try {
    const sql = neon(url);
    const r = await sql`SELECT
      current_database() as db,
      current_user as usr,
      inet_server_addr()::text as srv,
      now()::text as now,
      (SELECT count(*) FROM events) as events_count,
      (SELECT count(*) FROM guests) as guests_count`;
    return NextResponse.json(
      { masked_url: masked, host, info: r[0] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    return NextResponse.json(
      { error: String(e), masked_url: masked, host },
      { status: 500 },
    );
  }
}

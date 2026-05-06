import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await getDashboardData(id);
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

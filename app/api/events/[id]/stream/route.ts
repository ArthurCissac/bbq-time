import { NextRequest } from "next/server";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const data = await getDashboardData(id);
  if (!data) return new Response("Not found", { status: 404 });

  const encoder = new TextEncoder();
  let closed = false;
  let lastPayload = "";

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, payload: unknown) => {
        if (closed) return;
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`),
        );
      };

      send("init", data);
      lastPayload = JSON.stringify(data);

      const interval = setInterval(async () => {
        if (closed) return;
        try {
          const fresh = await getDashboardData(id);
          if (!fresh) return;
          const next = JSON.stringify(fresh);
          if (next !== lastPayload) {
            lastPayload = next;
            send("update", fresh);
          } else {
            send("ping", { t: Date.now() });
          }
        } catch {
          // swallow
        }
      }, 2500);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

import { NextResponse } from "next/server";
import { sseClients, SSEClient } from "@/lib/sseBroadcast";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = (url.searchParams.get("role") || "customer") as SSEClient["role"];
  const tableNumber = url.searchParams.get("table") || undefined;
  const kdsStation = (url.searchParams.get("kdsStation") || "both") as SSEClient["kdsStation"];
  const clientId = `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const stream = new ReadableStream({
    start(controller) {
      const client: SSEClient = {
        id: clientId,
        tableNumber,
        role,
        kdsStation,
        controller,
      };
      sseClients.set(clientId, client);

      // Bağlantı onayı gönder
      controller.enqueue(
        new TextEncoder().encode(
          `event: connected\ndata: ${JSON.stringify({ clientId, role, tableNumber })}\n\n`
        )
      );

      // Heartbeat — 25 saniyede bir ping (proxy timeout engellemek için)
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
          sseClients.delete(clientId);
        }
      }, 25000);

      // Bağlantı koptuğunda temizle
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        sseClients.delete(clientId);
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      sseClients.delete(clientId);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

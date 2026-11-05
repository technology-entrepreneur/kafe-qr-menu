// SSE (Server-Sent Events) Yayıncı Kütüphanesi
// route dosyasından izole edilmiştir (Next.js route exports kısıtlaması nedeniyle)

export type SSEClient = {
  id: string;
  tableNumber?: string;
  role: "customer" | "kds" | "waiter" | "admin";
  kdsStation?: "kitchen" | "bar" | "hookah" | "both" | "all";
  controller: ReadableStreamDefaultController;
};

const g = globalThis as any;
if (!g._sseClients) g._sseClients = new Map<string, SSEClient>();
export const sseClients: Map<string, SSEClient> = g._sseClients;

export function broadcastSSE(
  event: string,
  data: unknown,
  filter?: (client: SSEClient) => boolean
) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const clients = Array.from(sseClients.values());
  for (const client of clients) {
    if (!filter || filter(client)) {
      try {
        client.controller.enqueue(new TextEncoder().encode(payload));
      } catch {
        sseClients.delete(client.id);
      }
    }
  }
}


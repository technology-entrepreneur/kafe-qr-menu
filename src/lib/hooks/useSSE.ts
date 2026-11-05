// SSE bağlantısı için React hook
// Sunucudan gerçek zamanlı olayları dinler

import { useEffect, useRef, useCallback } from "react";

type SSEOptions = {
  role: "customer" | "kds" | "waiter" | "admin";
  tableNumber?: string | null;
  kdsStation?: "kitchen" | "bar" | "hookah" | "both" | "all";
  onEvent?: (event: string, data: unknown) => void;
  enabled?: boolean;
};

export function useSSE({ role, tableNumber, kdsStation, onEvent, enabled = true }: SSEOptions) {
  const esRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams({ role });
    if (tableNumber) params.set("table", tableNumber);
    if (kdsStation) params.set("kdsStation", kdsStation);

    const es = new EventSource(`/api/stream?${params.toString()}`);
    esRef.current = es;

    const events = [
      "connected",
      "new_order",
      "order_status_changed",
      "service_call",
      "service_call_updated",
      "product_availability_changed",
      "session_opened",
      "session_closed",
      "table_transferred",
      "partial_payment_received",
    ];

    events.forEach((eventName) => {
      es.addEventListener(eventName, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          onEventRef.current?.(eventName, data);
        } catch {}
      });
    });

    es.onerror = () => {
      es.close();
      // 3 saniye sonra yeniden bağlan
      setTimeout(connect, 3000);
    };

    return es;
  }, [enabled, role, tableNumber, kdsStation]);

  useEffect(() => {
    const es = connect();
    return () => {
      es?.close();
      esRef.current?.close();
    };
  }, [connect]);

  return esRef;
}


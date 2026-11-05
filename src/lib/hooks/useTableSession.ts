// Masa Oturumu (TableSession) Hook
// Müşteri masaya oturduğu andan kalktığına kadar aktif oturumu yönetir
// sessionStorage ile persist edilir, SSE ile anlık güncellenir

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSSE } from "./useSSE";

export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";

export type ActiveOrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions: { name: string; price: number }[];
  status: OrderStatus;
  kdsStation: string;
  isPaid?: boolean;
};

export type ActiveOrder = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  totalAmount: number;
  source: "customer" | "waiter";
  items: ActiveOrderItem[];
  kdsStation: string;
};

export type TableSessionData = {
  id: string;
  tableNumber: string;
  sessionToken: string;
  status: string;
  openedAt: string;
  totalAmount: number;
  orders: ActiveOrder[];
};

const SESSION_STORAGE_KEY = "table_session";

export function useTableSession(tableNumber: string | null | undefined) {
  const [session, setSession] = useState<TableSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReset, setSessionReset] = useState(false);
  const initRef = useRef(false);

  // sessionStorage'dan oturumu yükle
  const loadFromStorage = useCallback(() => {
    if (!tableNumber) return null;
    try {
      const stored = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_${tableNumber}`);
      if (stored) {
        const parsed: TableSessionData = JSON.parse(stored);
        if (parsed.status === "OPEN") return parsed;
      }
    } catch {}
    return null;
  }, [tableNumber]);

  // sessionStorage'a kaydet
  const saveToStorage = useCallback((sess: TableSessionData | null) => {
    if (!tableNumber) return;
    if (sess) {
      try {
        sessionStorage.setItem(`${SESSION_STORAGE_KEY}_${tableNumber}`, JSON.stringify(sess));
      } catch {}
    } else {
      try {
        sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_${tableNumber}`);
      } catch {}
    }
  }, [tableNumber]);

  // Sunucudan oturumu başlat/getir
  const initSession = useCallback(async () => {
    if (!tableNumber || initRef.current) return;
    initRef.current = true;
    setIsLoading(true);

    // Önce cache'den dene
    const cached = loadFromStorage();
    if (cached) {
      setSession(cached);
    }

    try {
      // Sunucudan doğrula / aç
      const res = await fetch(`/api/sessions/${encodeURIComponent(tableNumber)}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setSession(data.session);
          saveToStorage(data.session);
        }
      }
    } catch {
      // Offline — cache yeterli
    } finally {
      setIsLoading(false);
    }
  }, [tableNumber, loadFromStorage, saveToStorage]);

  useEffect(() => {
    if (tableNumber) {
      initRef.current = false;
      initSession();
    }
  }, [tableNumber, initSession]);

  // SSE olaylarını dinle
  useSSE({
    role: "customer",
    tableNumber: tableNumber || undefined,
    enabled: Boolean(tableNumber),
    onEvent(event, data: any) {
      if (event === "new_order" && data.tableNumber === tableNumber) {
        // Yeni sipariş geldi — oturuma ekle
        setSession((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            totalAmount: prev.totalAmount + (data.order.totalAmount || 0),
            orders: [...prev.orders, data.order],
          };
          saveToStorage(updated);
          return updated;
        });
      }

      if (event === "order_status_changed" && data.tableNumber === tableNumber) {
        // Sipariş durumu güncellendi
        setSession((prev) => {
          if (!prev) return prev;
          const updatedOrders = prev.orders.map((o) =>
            o.id === data.orderId
              ? {
                  ...o,
                  status: data.status,
                  items: o.items.map((item) => ({ ...item, status: data.status })),
                }
              : o
          );
          const updated = { ...prev, orders: updatedOrders };
          saveToStorage(updated);
          return updated;
        });
      }

      if (event === "partial_payment_received" && data.tableNumber === tableNumber) {
        // Parçalı ödeme alındı — ödenen kalemleri işaretle
        setSession((prev) => {
          if (!prev) return prev;
          const paidIds = new Set(data.itemIds || []);
          const updatedOrders = prev.orders.map((o) => ({
            ...o,
            items: o.items.map((it) => (paidIds.has(it.id) ? { ...it, isPaid: true } : it)),
          }));
          const updated = { ...prev, orders: updatedOrders };
          saveToStorage(updated);
          return updated;
        });
      }

      if (event === "session_closed" && data.tableNumber === tableNumber) {
        // Oturum kapatıldı — ekranı sıfırla
        saveToStorage(null);
        setSession(null);
        setSessionReset(true);
        // 3 saniye sonra sıfırlama bayrağını kaldır
        setTimeout(() => setSessionReset(false), 3000);
      }
    },
  });

  // Toplam masa tutarı (Tüm siparişler)
  const grandTotal = session?.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalAmount, 0) ?? 0;

  // Ödenen tutar (Kısmi tahsilatlar)
  const paidTotal = session?.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => {
      const paidItemsTotal = o.items
        ? o.items.filter((it) => it.isPaid).reduce((s, it) => s + it.totalPrice, 0)
        : 0;
      return sum + paidItemsTotal;
    }, 0) ?? 0;

  // Kalan ödenecek tutar (Açık bakiye)
  const totalAmount = Math.max(0, grandTotal - paidTotal);

  // Tüm kalemler düz liste
  const allItems = session?.orders
    .filter((o) => o.status !== "CANCELLED")
    .flatMap((o) => o.items) ?? [];

  return {
    session,
    isLoading,
    sessionReset,
    totalAmount,
    grandTotal,
    paidTotal,
    allItems,
  };
}


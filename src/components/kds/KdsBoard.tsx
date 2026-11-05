"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChefHat,
  Coffee,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  RefreshCw,
  Printer,
  Flame,
} from "lucide-react";
import { useSSE } from "@/lib/hooks/useSSE";
import ThermalReceipt, { ThermalPrintData } from "@/components/print/ThermalReceipt";
import { triggerThermalPrint } from "@/lib/printerService";

type KdsStationFilter = "all" | "kitchen" | "bar" | "hookah";

interface OrderItemData {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptions?: { name: string; price: number }[];
  status: string;
  kdsStation: string;
}

interface OrderData {
  id: string;
  sessionId: string;
  tableNumber: string;
  source: string;
  status: "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
  kdsStation: "kitchen" | "bar" | "hookah" | "both";
  totalAmount: number;
  notes?: string;
  createdAt: string;
  acceptedAt?: string;
  readyAt?: string;
  servedAt?: string;
  items: OrderItemData[];
}

interface CoalCallData {
  id: string;
  tableNumber: string;
  createdAt: string;
}

interface KdsBoardProps {
  cafeName: string;
  initialOrders?: OrderData[];
}

export default function KdsBoard({ cafeName, initialOrders = [] }: KdsBoardProps) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [stationFilter, setStationFilter] = useState<KdsStationFilter>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [printData, setPrintData] = useState<ThermalPrintData | null>(null);
  const [now, setNow] = useState(Date.now());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [coalCalls, setCoalCalls] = useState<CoalCallData[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kds_auto_print");
      if (stored === "true") setAutoPrint(true);
    } catch {}
  }, []);

  const toggleAutoPrint = () => {
    const next = !autoPrint;
    setAutoPrint(next);
    try {
      localStorage.setItem("kds_auto_print", String(next));
    } catch {}
  };

  const handlePrintOrder = (order: OrderData) => {
    const receiptData: ThermalPrintData = {
      type: "kitchen",
      tableNumber: order.tableNumber,
      orderId: order.id,
      source: order.source,
      kdsStation: order.kdsStation,
      createdAt: order.createdAt,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
      })),
    };

    triggerThermalPrint(receiptData, (d) => setPrintData(d));
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const playChime = (type: "order" | "coal" = "order") => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type === "coal" ? "triangle" : "sine";
      const startFreq = type === "coal" ? 440 : 587.33;
      const endFreq = type === "coal" ? 659.25 : 880;

      osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {}
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders((prev) => {
            // Yeni sipariş var mı kontrol et, varsa ses çal
            const prevIds = new Set(prev.map((o) => o.id));
            const hasNewOrder = data.orders.some((o: OrderData) => !prevIds.has(o.id) && o.status === "PENDING");
            if (hasNewOrder && prev.length > 0) {
              playChime("order");
            }
            return data.orders;
          });
        }
      }

      const cRes = await fetch("/api/service-calls?status=PENDING");
      if (cRes.ok) {
        const cData = await cRes.json();
        const coals = (cData.calls || [])
          .filter((c: any) => c.type === "hookah_coal")
          .map((c: any) => ({
            id: c.id,
            tableNumber: c.tableNumber,
            createdAt: c.createdAt,
          }));
        setCoalCalls(coals);
      }
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
    // 5 saniyede bir arka planda sessizce canlı senkronizasyon (SSE yedeği)
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useSSE({
    role: "kds",
    onEvent(event, data: any) {
      if (event === "new_order") {
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === data.order.id);
          if (exists) return prev;
          playChime("order");

          if (autoPrint) {
            handlePrintOrder(data.order);
          }

          return [data.order, ...prev];
        });
      }

      if (event === "order_status_changed") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === data.orderId ? { ...o, status: data.status, ...data.order } : o
          )
        );
      }

      if (event === "service_call" && data.type === "hookah_coal") {
        playChime("coal");
        setCoalCalls((prev) => [
          {
            id: data.call.id,
            tableNumber: data.tableNumber,
            createdAt: data.call.createdAt,
          },
          ...prev.filter((c) => c.id !== data.call.id),
        ]);
      }

      if (event === "service_call_updated") {
        setCoalCalls((prev) => prev.filter((c) => c.id !== data.callId));
      }
    },
  });

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: "PREPARING" | "READY" | "SERVED"
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStatus,
                  ...(newStatus === "SERVED" ? { servedAt: new Date().toISOString() } : {}),
                }
              : o
          )
        );
      }
    } catch {}
    setUpdatingId(null);
  };

  const handleResolveCoal = async (callId: string) => {
    try {
      await fetch(`/api/service-calls/${callId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
      setCoalCalls((prev) => prev.filter((c) => c.id !== callId));
    } catch {}
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === "CANCELLED") return false;
      if (!showCompleted && o.status === "SERVED") return false;

      if (stationFilter === "kitchen") {
        if (o.kdsStation === "bar" || o.kdsStation === "hookah") return false;
      }
      if (stationFilter === "bar") {
        if (o.kdsStation === "kitchen" || o.kdsStation === "hookah") return false;
      }
      if (stationFilter === "hookah") {
        if (o.kdsStation !== "hookah") return false;
      }

      return true;
    });
  }, [orders, stationFilter, showCompleted]);

  const servedHookahTimers = useMemo(() => {
    return orders
      .filter((o) => o.kdsStation === "hookah" && o.status === "SERVED" && o.servedAt)
      .map((o) => {
        const diffMs = now - new Date(o.servedAt!).getTime();
        const elapsedMinutes = Math.floor(diffMs / 60000);
        const elapsedSeconds = Math.floor((diffMs % 60000) / 1000);
        const isTimeForCoal = elapsedMinutes >= 25;

        return {
          orderId: o.id,
          tableNumber: o.tableNumber,
          servedAt: o.servedAt!,
          elapsedMinutes,
          elapsedSeconds,
          isTimeForCoal,
        };
      })
      .sort((a, b) => b.elapsedMinutes - a.elapsedMinutes);
  }, [orders, now]);

  const getElapsedMinutes = (dateStr: string) => {
    const diffMs = now - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const getElapsedSeconds = (dateStr: string) => {
    const diffMs = now - new Date(dateStr).getTime();
    return Math.max(0, Math.floor((diffMs % 60000) / 1000));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ÜST BİLGİ VE KONTROL PANELİ */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white leading-tight">
                {cafeName} KDS
              </h1>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Canlı
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Mutfak ve Bar Ekranı
            </p>
          </div>
        </div>

        {/* Filtre ve Kontroller */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setStationFilter("all")}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                stationFilter === "all"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStationFilter("kitchen")}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                stationFilter === "kitchen"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Mutfak
            </button>
            <button
              onClick={() => setStationFilter("bar")}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                stationFilter === "bar"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setStationFilter("hookah")}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                stationFilter === "hookah"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Nargile
            </button>
          </div>

          <button
            onClick={toggleAutoPrint}
            className={`px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              autoPrint
                ? "bg-emerald-950 border-emerald-700 text-emerald-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Otomatik fiş yazdırma durumu"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {autoPrint ? "Oto-Yazdır: Açık" : "Oto-Yazdır: Kapalı"}
            </span>
          </button>

          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-2 py-1.5 rounded border text-xs font-medium transition-colors ${
              showCompleted
                ? "bg-slate-800 border-slate-700 text-white"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Servis edilen siparişleri göster/gizle"
          >
            <span className="hidden md:inline">
              {showCompleted ? "Tamamlananlar: Açık" : "Tamamlananlar: Kapalı"}
            </span>
            <span className="md:hidden">
              {showCompleted ? "Tüm" : "Aktif"}
            </span>
          </button>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playChime("order");
            }}
            className={`p-1.5 rounded border transition-colors ${
              soundEnabled
                ? "bg-slate-800 border-slate-700 text-slate-200"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
            title={soundEnabled ? "Ses Açık" : "Ses Kapalı"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={fetchOrders}
            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MOBİL FİLTRE */}
      <div className="sm:hidden p-2 bg-slate-950 border-b border-slate-800 grid grid-cols-4 gap-1">
        <button
          onClick={() => setStationFilter("all")}
          className={`py-1 rounded text-xs font-medium ${
            stationFilter === "all" ? "bg-slate-800 text-white" : "bg-slate-900 text-slate-400"
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setStationFilter("kitchen")}
          className={`py-1 rounded text-xs font-medium ${
            stationFilter === "kitchen" ? "bg-slate-800 text-white" : "bg-slate-900 text-slate-400"
          }`}
        >
          Mutfak
        </button>
        <button
          onClick={() => setStationFilter("bar")}
          className={`py-1 rounded text-xs font-medium ${
            stationFilter === "bar" ? "bg-slate-800 text-white" : "bg-slate-900 text-slate-400"
          }`}
        >
          Bar
        </button>
        <button
          onClick={() => setStationFilter("hookah")}
          className={`py-1 rounded text-xs font-medium ${
            stationFilter === "hookah" ? "bg-slate-800 text-white" : "bg-slate-900 text-slate-400"
          }`}
        >
          Nargile
        </button>
      </div>

      {/* NARGİLE & KÖZ BİLGİLENDİRME BARI */}
      {(stationFilter === "hookah" || stationFilter === "all") && (coalCalls.length > 0 || servedHookahTimers.length > 0) && (
        <div className="bg-slate-900 border-b border-slate-800 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 uppercase tracking-wider">
              Nargile & Köz Takibi
            </span>
            <span className="text-slate-400">
              25 dakika köz süresi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {coalCalls.map((call) => (
              <div
                key={call.id}
                className="p-2.5 rounded bg-rose-950/70 border border-rose-800 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-sm font-bold text-white">
                    Masa {call.tableNumber}
                  </div>
                  <div className="text-xs text-rose-300">
                    Köz Yenileme Talebi
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleResolveCoal(call.id)}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors"
                >
                  Tamamlandı
                </button>
              </div>
            ))}

            {servedHookahTimers.map((timer) => (
              <div
                key={timer.orderId}
                className={`p-2.5 rounded border flex items-center justify-between gap-2 ${
                  timer.isTimeForCoal
                    ? "bg-amber-950/60 border-amber-700"
                    : "bg-slate-950 border-slate-800"
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    Masa {timer.tableNumber}
                  </div>
                  <div className="text-xs text-slate-400 font-mono tabular-nums">
                    {timer.elapsedMinutes} dk {timer.elapsedSeconds} sn
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    timer.isTimeForCoal
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {timer.isTimeForCoal ? "Köz Vakti" : "Aktif"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SİPARİŞ KARTLARI IZGARASI */}
      <main className="flex-1 p-4">
        {filteredOrders.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-300">
              Bekleyen Sipariş Yok
            </h2>
            <p className="text-xs text-slate-500 max-w-xs">
              Yeni siparişler düştüğünde burada listelenecektir.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredOrders.map((order) => {
              const minutes = getElapsedMinutes(order.createdAt);
              const seconds = getElapsedSeconds(order.createdAt);
              const isBar = order.kdsStation === "bar";
              const isHookah = order.kdsStation === "hookah";

              const isWarningSLA = minutes >= 8 && minutes < 12;
              const isCriticalSLA = minutes >= 12;

              return (
                <div
                  key={order.id}
                  className={`rounded-lg border flex flex-col justify-between overflow-hidden bg-slate-900 ${
                    isCriticalSLA
                      ? "border-rose-700"
                      : isWarningSLA
                      ? "border-amber-700"
                      : order.status === "READY"
                      ? "border-emerald-700"
                      : "border-slate-800"
                  }`}
                >
                  {/* Kart Başlığı */}
                  <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        Masa {order.tableNumber}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {isHookah ? "Nargile" : isBar ? "Bar" : "Mutfak"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePrintOrder(order)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Fiş Yazdır"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <div
                        className={`px-2 py-0.5 rounded text-xs font-mono font-medium tabular-nums ${
                          isCriticalSLA
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : isWarningSLA
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                      </div>
                    </div>
                  </div>

                  {/* Kalemler */}
                  <div className="p-3 flex-1 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-2 text-xs pb-1.5 border-b border-slate-800/60 last:border-0 last:pb-0"
                      >
                        <span className="font-bold text-amber-400 tabular-nums">
                          {item.quantity}x
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-100 leading-snug">
                            {item.productName}
                          </p>
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <div className="space-y-0.5 mt-0.5">
                              {item.selectedOptions.map((opt, optIdx) => (
                                <p key={optIdx} className="text-[11px] text-slate-400">
                                  + {opt.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {order.notes && (
                      <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                        Not: {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="p-2.5 bg-slate-950 border-t border-slate-800">
                    {order.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                        disabled={updatingId === order.id}
                        className="w-full py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors"
                      >
                        Hazırlanıyor
                      </button>
                    )}

                    {order.status === "PREPARING" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, "READY")}
                        disabled={updatingId === order.id}
                        className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                      >
                        Hazır / Servise Çıkar
                      </button>
                    )}

                    {order.status === "READY" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, "SERVED")}
                        disabled={updatingId === order.id}
                        className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
                      >
                        Servis Edildi
                      </button>
                    )}

                    {order.status === "SERVED" && (
                      <div className="w-full py-1 text-center text-xs text-slate-500">
                        Servis Edildi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ThermalReceipt data={printData} />
    </div>
  );
}

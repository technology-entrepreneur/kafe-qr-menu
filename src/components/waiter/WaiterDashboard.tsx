"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users2,
  Bell,
  CreditCard,
  Banknote,
  Receipt,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Utensils,
  ChevronRight,
  LogOut,
  X,
  Search,
  ArrowRightLeft,
  Flame,
  Check,
  Printer,
} from "lucide-react";
import { formatMoney } from "@/lib/cartMath";
import { useSSE } from "@/lib/hooks/useSSE";
import { CategoryItem, ProductItem } from "@/types/menu";
import ThermalReceipt, { ThermalPrintData } from "@/components/print/ThermalReceipt";
import { triggerThermalPrint } from "@/lib/printerService";

interface ServiceCallItem {
  id: string;
  sessionId: string;
  tableNumber: string;
  type: string;
  notes?: string;
  paymentNote?: string;
  status: string;
  createdAt: string;
}

interface OrderItemSummary {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isPaid: boolean;
}

interface TableSummary {
  tableNumber: string;
  sessionId?: string;
  status: "OPEN" | "CLOSED";
  totalAmount: number;
  ordersCount: number;
  lastOrderAt?: string;
  hasCall?: boolean;
  hasCoalCall?: boolean;
  items?: OrderItemSummary[];
}

interface WaiterDashboardProps {
  cafeName: string;
  categories: CategoryItem[];
}

export default function WaiterDashboard({
  cafeName,
  categories,
}: WaiterDashboardProps) {
  const [activeTab, setActiveTab] = useState<"tables" | "calls">("tables");
  const [calls, setCalls] = useState<ServiceCallItem[]>([]);
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Masa Taşıma (Transfer) Modalı
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [targetTable, setTargetTable] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Kısmi Ödeme Modalı
  const [isPartialPayOpen, setIsPartialPayOpen] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isSubmittingPartialPay, setIsSubmittingPartialPay] = useState(false);

  // Masaya manuel sipariş ekleme modalı
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedOrderItems, setSelectedOrderItems] = useState<Record<string, number>>({});
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Masayı kapatma modalı
  const [closingTable, setClosingTable] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Termal Yazdırma State'leri
  const [autoPrintBill, setAutoPrintBill] = useState(false);
  const [printData, setPrintData] = useState<ThermalPrintData | null>(null);

  // 80mm Kasa Hesap Adisyonu Yazdır
  const handlePrintBill = (tbl: TableSummary, paymentMethod?: string) => {
    if (!tbl.items || tbl.items.length === 0) return;

    const total = tbl.items.reduce((s, i) => s + i.totalPrice, 0);
    const paid = tbl.items.filter((i) => i.isPaid).reduce((s, i) => s + i.totalPrice, 0);
    const remaining = total - paid;

    const billData: ThermalPrintData = {
      type: "bill",
      cafeName,
      tableNumber: tbl.tableNumber,
      printedAt: new Date(),
      items: tbl.items.map((i) => ({
        id: i.id,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
        isPaid: i.isPaid,
      })),
      totalAmount: total,
      paidAmount: paid > 0 ? paid : undefined,
      remainingAmount: remaining,
      paymentMethod,
    };

    triggerThermalPrint(billData, (d) => setPrintData(d));
  };

  // 1 sn saat
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Tüm ürünler düz listesi
  const allProducts = useMemo(() => {
    return categories.flatMap((c) => c.products || []);
  }, [categories]);

  // Çağrıları ve Masaları Çek
  const fetchData = async () => {
    try {
      // Bekleyen çağrıları çek
      const cRes = await fetch("/api/service-calls?status=PENDING");
      let activeCalls: ServiceCallItem[] = [];
      if (cRes.ok) {
        const cData = await cRes.json();
        activeCalls = cData.calls || [];
        setCalls(activeCalls);
      }

      // Siparişleri çekip masa özetlerini oluştur
      const oRes = await fetch("/api/orders");
      if (oRes.ok) {
        const oData = await oRes.json();
        const orders = oData.orders || [];

        // Masa bazlı grupla (Standart 15 masa)
        const tableMap = new Map<string, TableSummary>();
        for (let i = 1; i <= 15; i++) {
          const tNum = String(i);
          tableMap.set(tNum, {
            tableNumber: tNum,
            status: "CLOSED",
            totalAmount: 0,
            ordersCount: 0,
            items: [],
          });
        }

        orders.forEach((ord: any) => {
          if (ord.status !== "CANCELLED") {
            const existing: TableSummary = tableMap.get(ord.tableNumber) || {
              tableNumber: ord.tableNumber,
              status: "CLOSED",
              totalAmount: 0,
              ordersCount: 0,
              items: [],
            };

            existing.status = "OPEN";
            existing.sessionId = ord.sessionId;
            existing.lastOrderAt = ord.createdAt;

            // Ödenmemiş kalemlerin tutarını topla
            const orderItems = ord.items || [];
            orderItems.forEach((it: any) => {
              existing.items = existing.items || [];
              existing.items.push({
                id: it.id,
                productName: it.productName,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                totalPrice: it.totalPrice,
                isPaid: it.isPaid ?? false,
              });

              if (!it.isPaid) {
                existing.totalAmount += it.totalPrice;
              }
            });

            existing.ordersCount += 1;
            tableMap.set(ord.tableNumber, existing);
          }
        });

        // Masalara çağrı durumlarını ata
        activeCalls.forEach((call) => {
          const t = tableMap.get(call.tableNumber);
          if (t) {
            t.hasCall = true;
            if (call.type === "hookah_coal") {
              t.hasCoalCall = true;
            }
          }
        });

        setTables(Array.from(tableMap.values()));
      }
    } catch {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  // SSE Canlı Akışı
  useSSE({
    role: "waiter",
    onEvent(event, data: any) {
      if (event === "service_call") {
        setCalls((prev) => [data.call, ...prev.filter((c) => c.id !== data.call.id)]);
        fetchData();

        // Eğer hesap istendiyse ve otomatik yazdırma açıksa adisyon çıkar
        if (autoPrintBill && data.call.type?.startsWith("bill")) {
          const targetTbl = tables.find((t) => t.tableNumber === data.tableNumber);
          if (targetTbl) {
            handlePrintBill(targetTbl, data.paymentNote);
          }
        }
      }
      if (event === "service_call_updated") {
        setCalls((prev) => prev.filter((c) => c.id !== data.callId));
        fetchData();
      }
      if (
        event === "new_order" ||
        event === "session_closed" ||
        event === "order_status_changed" ||
        event === "table_transferred" ||
        event === "partial_payment_received"
      ) {
        fetchData();
      }
    },
  });

  // Çağrıyı Yanıtla / Tamamla
  const handleResolveCall = async (callId: string) => {
    try {
      await fetch(`/api/service-calls/${callId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
      setCalls((prev) => prev.filter((c) => c.id !== callId));
      fetchData();
    } catch {}
  };

  // MASA TAŞIMA (TRANSFER)
  const handleTransferTable = async () => {
    if (!selectedTable || !targetTable) return;
    setIsTransferring(true);
    try {
      const res = await fetch("/api/sessions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromTable: selectedTable,
          toTable: targetTable,
        }),
      });

      if (res.ok) {
        setIsTransferOpen(false);
        setSelectedTable(null);
        setTargetTable("");
        fetchData();
      }
    } catch {}
    setIsTransferring(false);
  };

  // KISMİ ÖDEME ALMA
  const handlePartialPayment = async () => {
    if (!selectedTable || selectedItemIds.length === 0) return;
    setIsSubmittingPartialPay(true);
    try {
      const res = await fetch("/api/orders/partial-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: selectedTable,
          itemIds: selectedItemIds,
        }),
      });

      if (res.ok) {
        setIsPartialPayOpen(false);
        setSelectedItemIds([]);
        fetchData();
      }
    } catch {}
    setIsSubmittingPartialPay(false);
  };

  // Masayı Kapat / Ödeme Al (Canlı Oturumu Sıfırlar)
  const handleCloseTableSession = async (
    tableNumber: string,
    paymentMethod: "cash" | "card"
  ) => {
    setIsClosing(true);
    try {
      const res = await fetch(`/api/sessions/${encodeURIComponent(tableNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pay", paymentMethod }),
      });

      if (res.ok) {
        setClosingTable(null);
        fetchData();
      }
    } catch {}
    setIsClosing(false);
  };

  // Garson Tarafından Masaya Sipariş Gönderme
  const handleAddOrderToTable = async () => {
    if (!selectedTable) return;

    const itemsToSend: any[] = [];
    Object.entries(selectedOrderItems).forEach(([productId, qty]) => {
      if (qty > 0) {
        const prod = allProducts.find((p) => p.id === productId);
        if (prod) {
          const name = prod.name.toLowerCase();
          const station =
            name.includes("nargile") || name.includes("hookah") || name.includes("köz")
              ? "hookah"
              : name.includes("kahve") || name.includes("latte") || name.includes("çay") || name.includes("brew")
              ? "bar"
              : "kitchen";

          itemsToSend.push({
            productId: prod.id,
            productName: prod.name,
            productPrice: prod.price,
            quantity: qty,
            selectedOptions: [],
            unitPrice: prod.price,
            totalPrice: prod.price * qty,
            kdsStation: station,
          });
        }
      }
    });

    if (itemsToSend.length === 0) return;

    setIsSubmittingOrder(true);
    try {
      const sessRes = await fetch(
        `/api/sessions/${encodeURIComponent(selectedTable)}`,
        { method: "POST" }
      );
      const sessData = await sessRes.json();
      const sessionId = sessData.session?.id;

      const totalAmount = itemsToSend.reduce((s, i) => s + i.totalPrice, 0);

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          tableNumber: selectedTable,
          source: "waiter",
          items: itemsToSend,
          notes: orderNotes.trim() || undefined,
          totalAmount,
        }),
      });

      if (orderRes.ok) {
        setIsAddOrderOpen(false);
        setSelectedOrderItems({});
        setOrderNotes("");
        fetchData();
      }
    } catch {}
    setIsSubmittingOrder(false);
  };

  const currentActiveTable = useMemo(() => {
    return tables.find((t) => t.tableNumber === selectedTable) || null;
  }, [tables, selectedTable]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ÜST HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white">
              {cafeName} Garson Terminali
            </h1>
            <p className="text-[11px] text-slate-400">
              Masa, Sipariş ve Kasa Takibi
            </p>
          </div>
        </div>

        {/* Sekmeler & Bekleyen Çağrı Rozeti */}
        <div className="flex items-center gap-2">
          {/* Oto-Adisyon Yazdırma Butonu */}
          <button
            onClick={() => setAutoPrintBill(!autoPrintBill)}
            className={`py-1.5 px-2.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              autoPrintBill
                ? "bg-emerald-950 border-emerald-700 text-emerald-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Hesap istendiğinde otomatik termal adisyon çıkar"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {autoPrintBill ? "Oto-Adisyon: Açık" : "Oto-Adisyon: Kapalı"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tables")}
            className={`py-1.5 px-3 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "tables"
                ? "bg-slate-800 text-white border border-slate-700"
                : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Masalar</span>
          </button>

          <button
            onClick={() => setActiveTab("calls")}
            className={`relative py-1.5 px-3 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "calls"
                ? "bg-slate-800 text-white border border-slate-700"
                : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Çağrılar</span>
            {calls.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {calls.length}
              </span>
            )}
          </button>

          <button
            onClick={fetchData}
            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Yenile"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* İÇERİK */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {activeTab === "calls" ? (
          /* ÇAĞRILAR SEKMESİ */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-200">
                Gelen Çağrılar ve İstekler ({calls.length})
              </h2>
              <span className="text-xs text-stone-500">
                2 dakikayı geçen çağrılar acil kırmızı alarm verir
              </span>
            </div>

            {calls.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mx-auto" />
                <p className="text-sm font-bold text-stone-300">
                  Bekleyen Çağrı Yok
                </p>
                <p className="text-xs text-stone-500">
                  Misafirlerinizin tüm çağrıları yanıtlandı.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calls.map((call) => {
                  const waitSeconds = Math.max(
                    0,
                    Math.floor((now - new Date(call.createdAt).getTime()) / 1000)
                  );
                  const isUrgent = waitSeconds >= 120;
                  const isCoal = call.type === "hookah_coal";

                  return (
                    <div
                      key={call.id}
                      className={`p-3.5 rounded-lg border flex flex-col justify-between transition-colors ${
                        isCoal
                          ? "bg-slate-900 border-purple-600"
                          : isUrgent
                          ? "bg-slate-900 border-rose-600"
                          : "bg-slate-900 border-slate-800"
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                            Masa {call.tableNumber}
                          </span>
                          <span
                            className={`text-xs font-mono tabular-nums px-2 py-0.5 rounded flex items-center gap-1 ${
                              isUrgent
                                ? "bg-rose-950 text-rose-300 border border-rose-800"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{waitSeconds} sn</span>
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            {isCoal ? (
                              <Flame className="w-3.5 h-3.5 text-purple-400" />
                            ) : (
                              <Bell className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <h4 className="font-semibold text-xs text-white">
                              {call.type === "hookah_coal"
                                ? "Köz Talebi"
                                : call.type === "waiter"
                                ? "Garson Çağrısı"
                                : "Hesap Talebi"}
                            </h4>
                          </div>

                          {call.paymentNote && (
                            <p className="text-xs text-amber-400 font-medium mt-1">
                              Ödeme Yöntemi: {call.paymentNote}
                            </p>
                          )}
                          {call.notes && (
                            <p className="text-xs text-slate-300 mt-1 bg-slate-950 p-2 rounded border border-slate-800">
                              {call.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleResolveCall(call.id)}
                        className="mt-3 w-full py-1.5 rounded font-medium text-xs flex items-center justify-center gap-1.5 transition-colors bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tamamlandı</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* MASALAR SEKMESİ (ESNAF DOSTU RENK KODLARIYLA) */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-stone-200">
                  Canlı Masa Haritası (15 Masa)
                </h2>
                <p className="text-xs text-stone-500">
                  Masaya tıkla: Sipariş ekle, masa taşı veya kısmi/tam ödeme al
                </p>
              </div>

              {/* Esnaf Renk Rehberi */}
              <div className="flex items-center gap-3 text-[11px] font-semibold text-stone-400 bg-stone-900/80 p-2 rounded-xl border border-stone-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Boş
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Dolu
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Çağrı/Hesap
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Köz İsteği
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {tables.map((tbl) => {
                const isOpen = tbl.status === "OPEN" && tbl.totalAmount > 0;
                const hasCall = tbl.hasCall;
                const hasCoal = tbl.hasCoalCall;

                // Renk kodu belirleme:
                let borderClass = "border-stone-800/80 hover:border-stone-700 bg-stone-900/40";
                let statusBadge = "Boş / Müsait";
                let badgeClass = "bg-stone-800 text-stone-400";

                if (hasCoal) {
                  borderClass = "border-purple-600 bg-slate-900";
                  statusBadge = "Köz Bekliyor";
                  badgeClass = "bg-purple-950 text-purple-300 border border-purple-800";
                } else if (hasCall) {
                  borderClass = "border-rose-600 bg-slate-900";
                  statusBadge = "Çağrı Var";
                  badgeClass = "bg-rose-950 text-rose-300 border border-rose-800";
                } else if (isOpen) {
                  borderClass = "border-slate-700 bg-slate-900";
                  statusBadge = "Dolu";
                  badgeClass = "bg-amber-950 text-amber-300 border border-amber-800";
                }

                return (
                  <div
                    key={tbl.tableNumber}
                    onClick={() => setSelectedTable(tbl.tableNumber)}
                    className={`p-3 rounded-lg border flex flex-col justify-between transition-colors cursor-pointer group ${borderClass}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-white">
                          Masa {tbl.tableNumber}
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            hasCoal
                              ? "bg-purple-500"
                              : hasCall
                              ? "bg-rose-500"
                              : isOpen
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                      </div>

                      <div className="mt-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded inline-block font-medium ${badgeClass}`}>
                          {statusBadge}
                        </span>

                        <div className="mt-1.5">
                          {isOpen ? (
                            <>
                              <p className="text-[11px] text-slate-400">
                                Tutar:
                              </p>
                              <p className="text-sm font-bold text-amber-400 tabular-nums">
                                {formatMoney(tbl.totalAmount)}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-slate-500 pt-1">
                              Müsait
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-slate-200">
                      <span>İşlemler</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* SEÇİLİ MASA İŞLEMLERİ MODALI */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedTable(null)}
            className="fixed inset-0 bg-black/60"
          />

          <div className="relative w-full max-w-sm rounded-lg bg-slate-900 border border-slate-800 p-5 z-10 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Masa {selectedTable}
                </h3>
                {currentActiveTable && currentActiveTable.totalAmount > 0 && (
                  <p className="text-xs text-amber-400 font-semibold mt-0.5 tabular-nums">
                    Aktif Adisyon: {formatMoney(currentActiveTable.totalAmount)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Aksiyon Seçenekleri */}
            <div className="space-y-2 pt-1">
              {/* Masaya Sipariş Ekle */}
              <button
                type="button"
                onClick={() => setIsAddOrderOpen(true)}
                className="w-full py-2.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Masaya Sipariş Ekle</span>
              </button>

              {/* 80mm Hesap Adisyonu Yazdır Butonu */}
              {currentActiveTable && currentActiveTable.items && currentActiveTable.items.length > 0 && (
                <button
                  type="button"
                  onClick={() => handlePrintBill(currentActiveTable)}
                  className="w-full py-2.5 px-3 rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4 text-slate-300" />
                  <span>80mm Adisyon Yazdır</span>
                </button>
              )}

              {/* Masa Taşı (Transfer) */}
              <button
                type="button"
                onClick={() => setIsTransferOpen(true)}
                className="w-full py-2.5 px-3 rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4 text-sky-400" />
                <span>Masa Taşı (Transfer)</span>
              </button>

              {/* Kısmi Ödeme */}
              {currentActiveTable && currentActiveTable.items && currentActiveTable.items.some((i) => !i.isPaid) && (
                <button
                  type="button"
                  onClick={() => setIsPartialPayOpen(true)}
                  className="w-full py-2.5 px-3 rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <span>Kısmi Ödeme Al</span>
                </button>
              )}

              {/* Masayı Kapat */}
              <button
                type="button"
                onClick={() => {
                  setClosingTable(selectedTable);
                  setSelectedTable(null);
                }}
                className="w-full py-2.5 px-3 rounded bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Hesabı Kapat / Masayı Boşalt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MASA TAŞIMA MODALI */}
      {isTransferOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsTransferOpen(false)}
            className="fixed inset-0 bg-black/60"
          />

          <div className="relative w-full max-w-sm rounded-lg bg-slate-900 border border-slate-800 p-5 z-10 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Masa {selectedTable} Taşınıyor
              </h3>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Masa {selectedTable} üzerindeki tüm aktif siparişler hedef masaya aktarılacaktır.
            </p>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Hedef Masa:
              </label>
              <select
                value={targetTable}
                onChange={(e) => setTargetTable(e.target.value)}
                className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-xs text-white"
              >
                <option value="">Seçiniz...</option>
                {tables
                  .filter((t) => t.tableNumber !== selectedTable)
                  .map((t) => (
                    <option key={t.tableNumber} value={t.tableNumber}>
                      Masa {t.tableNumber} {t.status === "OPEN" ? `(Dolu - ₺${t.totalAmount})` : "(Boş)"}
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleTransferTable}
              disabled={isTransferring || !targetTable}
              className="w-full py-2.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{isTransferring ? "Aktarılıyor..." : `Masa ${targetTable}'ye Taşı`}</span>
            </button>
          </div>
        </div>
      )}

      {/* KISMİ ÖDEME ALMA MODALI */}
      {isPartialPayOpen && selectedTable && currentActiveTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsPartialPayOpen(false)}
            className="fixed inset-0 bg-black/60"
          />

          <div className="relative w-full max-w-md rounded-lg bg-slate-900 border border-slate-800 p-5 z-10 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Masa {selectedTable} • Kısmi Ödeme
                </h3>
                <p className="text-xs text-slate-400">
                  Ödenen ürünleri işaretleyin
                </p>
              </div>
              <button
                onClick={() => setIsPartialPayOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ürün Listesi */}
            <div className="flex-1 overflow-y-auto space-y-1.5 py-3 no-scrollbar">
              {(currentActiveTable.items || []).map((item) => {
                const isSelected = selectedItemIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.isPaid) return;
                      setSelectedItemIds((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((id) => id !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                    className={`p-2.5 rounded border flex items-center justify-between transition-colors ${
                      item.isPaid
                        ? "bg-slate-950 border-slate-900 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "bg-amber-950/40 border-amber-600 cursor-pointer"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center ${
                          item.isPaid
                            ? "bg-emerald-950 text-emerald-400"
                            : isSelected
                            ? "bg-amber-500 text-slate-950"
                            : "border border-slate-700 text-transparent"
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${item.isPaid ? "line-through text-slate-500" : "text-white"}`}>
                          {item.quantity}x {item.productName}
                        </p>
                        {item.isPaid && (
                          <span className="text-[10px] text-emerald-400 font-medium">
                            Ödendi
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-amber-400 tabular-nums">
                      {formatMoney(item.totalPrice)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Alt Toplam & Ödeme Butonu */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Seçilen Tutar:</span>
                <span className="text-base font-bold text-amber-400 tabular-nums">
                  {formatMoney(
                    (currentActiveTable.items || [])
                      .filter((i) => selectedItemIds.includes(i.id))
                      .reduce((s, i) => s + i.totalPrice, 0)
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePartialPayment}
                disabled={isSubmittingPartialPay || selectedItemIds.length === 0}
                className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmittingPartialPay ? "İşleniyor..." : "Seçilenleri Tahsil Et"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MASAYI KAPATMA ONAY MODALI */}
      {closingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setClosingTable(null)}
            className="fixed inset-0 bg-black/60"
          />

          <div className="relative w-full max-w-sm rounded-lg bg-slate-900 border border-slate-800 p-5 z-10 space-y-3.5 text-center">
            <div className="w-10 h-10 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                Masa {closingTable} Kapatılıyor
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Ödeme alındığında oturum kapatılır ve masa sıfırlanır.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={isClosing}
                onClick={() => handleCloseTableSession(closingTable, "cash")}
                className="py-2.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-750 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nakit</span>
              </button>

              <button
                type="button"
                disabled={isClosing}
                onClick={() => handleCloseTableSession(closingTable, "card")}
                className="py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Kredi Kartı / POS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GARSON SİPARİŞ GİRİŞ MODALI */}
      {isAddOrderOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsAddOrderOpen(false)}
            className="fixed inset-0 bg-black/60"
          />

          <div className="relative w-full max-w-md rounded-lg bg-slate-900 border border-slate-800 p-5 z-10 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                Masa {selectedTable} İçin Sipariş Gir
              </h3>
              <button
                onClick={() => setIsAddOrderOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Arama */}
            <div className="py-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-full rounded bg-slate-950 border border-slate-800 py-1.5 pl-8 pr-2.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Ürün Listesi */}
            <div className="flex-1 overflow-y-auto space-y-1.5 py-2 no-scrollbar">
              {allProducts
                .filter((p) =>
                  p.name.toLowerCase().includes(searchProduct.toLowerCase())
                )
                .map((prod) => {
                  const qty = selectedOrderItems[prod.id] || 0;

                  return (
                    <div
                      key={prod.id}
                      className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-medium text-white">{prod.name}</p>
                        <p className="text-[11px] text-amber-400 font-semibold tabular-nums">
                          {formatMoney(prod.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {qty > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrderItems((prev) => ({
                                ...prev,
                                [prod.id]: Math.max(0, qty - 1),
                              }))
                            }
                            className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                        )}
                        {qty > 0 && (
                          <span className="w-5 text-center text-xs font-bold text-slate-200 tabular-nums">
                            {qty}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrderItems((prev) => ({
                              ...prev,
                              [prod.id]: qty + 1,
                            }))
                          }
                          className="w-6 h-6 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Not ve Gönder */}
            <div className="pt-2.5 border-t border-slate-800 space-y-2">
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Mutfak / Bar notu..."
                className="w-full rounded bg-slate-950 border border-slate-800 py-1.5 px-2.5 text-xs text-white"
              />

              <button
                type="button"
                onClick={handleAddOrderToTable}
                disabled={isSubmittingOrder}
                className="w-full py-2.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <span>Siparişi Gönder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 80MM TERMAL FİŞ GİZLİ YAZDIRMA BİLEŞENİ */}
      <ThermalReceipt data={printData} />
    </div>
  );
}

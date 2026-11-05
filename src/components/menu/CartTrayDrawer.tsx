"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, X, Trash2, Utensils, Plus, Minus, Bell,
  CheckCircle2, AlertCircle, Loader2, Receipt,
} from "lucide-react";
import { useMenuStore } from "@/lib/store";
import { calculateCartSummary, formatMoney } from "@/lib/cartMath";
import { Language } from "@/types/menu";
import { triggerGoldenConfetti } from "@/lib/confetti";
import { t } from "@/lib/translations";

interface CartTrayDrawerProps {
  language?: Language;
  tableNumber?: string | null;
  sessionId?: string | null;
  onTableSelected?: (table: string) => void;
  onOrderSuccess?: (orders: any[]) => void;
  onOpenActiveOrders?: () => void;
}

// KDS istasyonu belirle (kategori/ürün bazlı — Mutfak / Bar / Nargile)
function getKdsStation(productName: string): "kitchen" | "bar" | "hookah" {
  const name = productName.toLowerCase();
  const hookahKeywords = ["nargile", "hookah", "shisha", "köz", "lüle", "marpuç", "tütün"];
  if (hookahKeywords.some((kw) => name.includes(kw))) return "hookah";

  const barKeywords = ["kahve", "latte", "espresso", "cold brew", "tea", "çay",
    "smoothie", "juice", "meyve", "içecek", "drink", "brew", "macchiato",
    "cappuccino", "flat white", "mocha", "americano", "nitro"];
  return barKeywords.some((kw) => name.includes(kw)) ? "bar" : "kitchen";
}

export default function CartTrayDrawer({
  language = "tr",
  tableNumber,
  sessionId,
  onTableSelected,
  onOrderSuccess,
  onOpenActiveOrders,
}: CartTrayDrawerProps) {
  const isEn = language === "en";
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart } =
    useMenuStore();
  const [orderSent, setOrderSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [manualTableNumber, setManualTableNumber] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("preferred_table_number") || "";
      } catch {}
    }
    return "";
  });

  const effectiveTable = (tableNumber || manualTableNumber).trim();

  const { total: totalTrayPrice, itemCount: totalQuantity } = calculateCartSummary(cart);

  const handleSendOrder = async (e: React.MouseEvent) => {
    if (!effectiveTable) {
      setError(t("tableRequiredNotice", language));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Oturum yoksa aç
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const sessRes = await fetch(`/api/sessions/${encodeURIComponent(effectiveTable)}`, {
          method: "POST",
        });
        if (sessRes.ok) {
          const sessData = await sessRes.json();
          activeSessionId = sessData.session?.id;
        }
      }

      if (!activeSessionId) {
        throw new Error(language === "tr" ? "Oturum açılamadı" : "Session could not be opened");
      }

      try {
        localStorage.setItem("preferred_table_number", effectiveTable);
      } catch {}

      if (onTableSelected) {
        onTableSelected(effectiveTable);
      }

      // Sipariş kalemlerini hazırla
      const items = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productPrice: item.product.price,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
        unitPrice: item.product.price + item.selectedOptions.reduce((s, o) => s + o.price, 0),
        totalPrice: item.totalPrice,
        kdsStation: getKdsStation(item.product.name),
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          tableNumber: effectiveTable,
          source: "customer",
          items,
          totalAmount: totalTrayPrice,
        }),
      });

      if (!res.ok) {
        let errMsg = isEn ? "Order could not be sent." : "Sipariş gönderilemedi.";
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      let createdOrders = [];
      try {
        const data = await res.json();
        createdOrders = data.orders || [];
      } catch {}

      // Başarılı — confetti + onay ekranı
      try {
        triggerGoldenConfetti(0.5, 0.5);
      } catch {}

      // Masa oturumunu anında güncelle (Optimistic & Direct State Sync)
      if (createdOrders.length > 0 && onOrderSuccess) {
        onOrderSuccess(createdOrders);
      }

      clearCart();
      setOrderSent(true);
    } catch (err: any) {
      setError(
        err.message ||
          (isEn ? "Order could not be sent. Please try again." : "Sipariş gönderilemedi. Tekrar deneyin.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    if (orderSent) setOrderSent(false);
    setError(null);
    setIsCartOpen(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseAndReset}
            className="fixed inset-0 bg-slate-950/70"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-t-xl sm:rounded-lg bg-slate-900 border-t sm:border border-slate-800 text-slate-100 shadow-xl z-10 max-h-[88vh] flex flex-col font-sans overflow-hidden"
          >
            {/* Handle */}
            <div className="sm:hidden mx-auto my-2.5 h-1 w-10 rounded-full bg-slate-700" />

            {/* Sipariş Onay Ekranı */}
            {orderSent ? (
              <div className="p-6 flex flex-col items-center text-center my-auto space-y-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    {t("orderSent", language)}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {tableNumber
                      ? `${t("table", language)} ${tableNumber}`
                      : t("orderSent", language)}
                  </p>
                </div>

                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  {t("orderSentDesc", language)}
                </p>

                <div className="pt-2 w-full space-y-2">
                  {onOpenActiveOrders && (
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseAndReset();
                        onOpenActiveOrders();
                      }}
                      className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{language === "tr" ? "Masa Hesabımı Gör" : "View Table Tab"}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCloseAndReset}
                    className="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-300 transition-colors cursor-pointer"
                  >
                    {t("backToMenu", language)}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Başlık */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 border border-slate-700 text-slate-300">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white">
                          {t("orderTray", language)} ({totalQuantity})
                        </h3>
                        {effectiveTable ? (
                          <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
                            {t("table", language)} {effectiveTable}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            {t("selectTablePill", language)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title={t("clearTray", language)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCloseAndReset}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Hata Mesajı */}
                {error && (
                  <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Masa Seçici (Eğer URL'de masa yoksa) */}
                {!tableNumber && (
                  <div className="mx-5 mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">
                        {t("selectOrEnterTable", language)}
                      </span>
                      {effectiveTable && (
                        <span className="text-[11px] font-bold text-amber-400">
                          ✓ {t("table", language)} {effectiveTable}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "12", "15"].map((tbl) => (
                        <button
                          key={tbl}
                          type="button"
                          onClick={() => {
                            setManualTableNumber(tbl);
                            setError(null);
                            try { localStorage.setItem("preferred_table_number", tbl); } catch {}
                            if (onTableSelected) onTableSelected(tbl);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            effectiveTable === tbl
                              ? "bg-amber-500 text-slate-950 border-amber-400 scale-105"
                              : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                          }`}
                        >
                          {tbl}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="text"
                        value={manualTableNumber}
                        onChange={(e) => {
                          setManualTableNumber(e.target.value);
                          setError(null);
                          try { localStorage.setItem("preferred_table_number", e.target.value); } catch {}
                          if (onTableSelected && e.target.value.trim()) onTableSelected(e.target.value.trim());
                        }}
                        placeholder={language === "tr" ? "Veya elle masa no yazın (Örn: 4)" : "Or enter table no (e.g. 4)"}
                        className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Ürün Listesi */}
                {cart.length === 0 ? (
                  <div className="p-8 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-stone-300">
                      {isEn ? "Your tray is currently empty" : "Tepsinizde henüz ürün yok"}
                    </p>
                    <p className="text-xs text-stone-500 max-w-xs">
                      {isEn
                        ? "Select your favorite coffee, dessert or combo deals to start your order."
                        : "Menüden kahve, tatlı veya kampanyalı menüleri seçerek tepsinize ekleyebilirsiniz."}
                    </p>
                  </div>
                ) : (
                  <div className="p-5 overflow-y-auto space-y-3 flex-1 no-scrollbar">
                    {cart.map((item, idx) => {
                      const prodName = isEn && item.product.nameEn ? item.product.nameEn : item.product.name;
                      const itemUnitPrice = item.quantity > 0 ? item.totalPrice / item.quantity : 0;
                      const station = getKdsStation(item.product.name);

                      return (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 rounded-2xl bg-stone-900/80 border border-stone-800/80 p-3.5 shadow-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs sm:text-sm text-white truncate">{prodName}</h4>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                                {station === "hookah" ? "Nargile" : station === "bar" ? "Bar" : "Mutfak"}
                              </span>
                            </div>

                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {item.selectedOptions.map((opt, sIdx) => (
                                  <p key={sIdx} className="text-[11px] text-amber-400/90">
                                    + {opt.name} ({opt.price > 0 ? `+₺${opt.price}` : isEn ? "Free" : "Ücretsiz"})
                                  </p>
                                ))}
                              </div>
                            )}

                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl p-0.5">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(idx, item.quantity - 1)}
                                  className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-center font-black text-xs text-amber-400">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(idx, item.quantity + 1)}
                                  className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-[11px] text-stone-500 font-medium">
                                {formatMoney(itemUnitPrice)} / {isEn ? "ea" : "adet"}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end justify-between h-full gap-2 flex-shrink-0">
                            <span className="text-sm font-extrabold text-amber-400 font-display">
                              {formatMoney(item.totalPrice)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(idx)}
                              className="text-stone-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
                      <Utensils className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span className="leading-relaxed">
                        {isEn
                          ? "Orders are sent directly to kitchen & bar."
                          : "Siparişler doğrudan mutfak ve bara iletilir."}
                      </span>
                    </div>
                  </div>
                )}

                {/* Alt Toplam & Gönder */}
                {cart.length > 0 && (
                  <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {t("total", language)}
                        </span>
                        <p className="text-base font-bold text-amber-400 tabular-nums">
                          {formatMoney(totalTrayPrice)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCartOpen(false)}
                        className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-900 border border-slate-800 transition-colors"
                      >
                        {t("close", language)}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOrder}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                      <span>
                        {isSubmitting
                          ? t("sending", language)
                          : `${t("sendOrder", language)} (${formatMoney(totalTrayPrice)})`}
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

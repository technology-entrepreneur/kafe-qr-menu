"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Language } from "@/types/menu";
import { useMenuStore } from "@/lib/store";
import { calculateCartSummary, formatMoney } from "@/lib/cartMath";

interface FloatingBarProps {
  tableNumber?: string | null;
  googleReviewUrl?: string | null;
  language: Language;
}

export default function FloatingBar({
  tableNumber,
  googleReviewUrl,
  language,
}: FloatingBarProps) {
  const isEn = language === "en";
  const { cart, setIsCartOpen } = useMenuStore();

  const summary = calculateCartSummary(cart);
  const totalCartCount = summary.itemCount;

  return (
    <AnimatePresence>
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-40 max-w-lg mx-auto pointer-events-none">
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="pointer-events-auto w-full"
          >
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-stone-950 font-bold shadow-[0_12px_40px_rgba(245,158,11,0.35)] active:scale-[0.98] transition-all cursor-pointer group"
            >
              {/* Sol: Sepet İkonu ve Tutar Bilgisi */}
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl bg-stone-950/20 flex items-center justify-center text-stone-950">
                  <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-950 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-stone-950" />
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[11px] uppercase tracking-wider font-extrabold opacity-75">
                    {tableNumber
                      ? isEn
                        ? `Table ${tableNumber} • Order Tray`
                        : `Masa ${tableNumber} • Sipariş Tepsiniz`
                      : isEn
                      ? "Your Order Tray"
                      : "Sipariş Tepsiniz"}
                  </p>
                  <p className="text-sm font-black">
                    {totalCartCount} {isEn ? (totalCartCount === 1 ? "item" : "items") : "çeşit"} • {formatMoney(summary.total)}
                  </p>
                </div>
              </div>

              {/* Sağ: İncele Aksiyonu ve İleri Oku */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-950/15 group-hover:bg-stone-950/25 transition-colors text-xs font-black">
                <span>{isEn ? "View Order" : "Siparişi İncele"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

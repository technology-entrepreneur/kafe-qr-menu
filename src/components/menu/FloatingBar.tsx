"use client";

import React from "react";
import { ShoppingBag, Bell, Receipt, ArrowRight } from "lucide-react";
import { CartItem, Language } from "@/types/menu";
import { calculateCartSummary, formatMoney } from "@/lib/cartMath";
import { useMenuStore } from "@/lib/store";
import { t } from "@/lib/translations";

interface FloatingBarProps {
  cart?: CartItem[];
  setIsCartOpen?: (open: boolean) => void;
  tableNumber?: string | null;
  onOpenActiveOrders: () => void;
  onOpenServiceCall: () => void;
  onOpenBillSplit?: () => void;
  activeTableTotal?: number;
  activeOrdersCount?: number;
  googleReviewUrl?: string | null;
  language: Language;
}

export default function FloatingBar({
  cart: propsCart,
  setIsCartOpen: propsSetIsCartOpen,
  tableNumber,
  onOpenActiveOrders,
  onOpenServiceCall,
  onOpenBillSplit,
  activeTableTotal = 0,
  activeOrdersCount = 0,
  googleReviewUrl,
  language,
}: FloatingBarProps) {
  const storeCart = useMenuStore((s) => s.cart);
  const storeSetIsCartOpen = useMenuStore((s) => s.setIsCartOpen);
  const cart = propsCart || storeCart;
  const setIsCartOpen = propsSetIsCartOpen || storeSetIsCartOpen;

  const isEn = language === "en";
  const summary = calculateCartSummary(cart);
  const totalCartCount = summary.itemCount;

  return (
    <div className="fixed bottom-3 inset-x-3 z-40 max-w-lg mx-auto pointer-events-none flex flex-col gap-2">
      {/* 1. SEPET ÇUBUĞU */}
      {totalCartCount > 0 && (
        <div className="pointer-events-auto w-full">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-semibold border border-amber-500 transition-colors shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-amber-700/40 flex items-center justify-center text-slate-950">
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs uppercase font-medium text-slate-950/80">
                  {tableNumber ? `${t("table", language)} ${tableNumber}` : t("cart", language)}
                </div>
                <div className="text-sm font-bold tabular-nums">
                  {totalCartCount} • {formatMoney(summary.total)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold bg-amber-700/30 px-2.5 py-1.5 rounded">
              <span>{t("viewCart", language)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* 2. MASA HİZMET VE ADİSYON ÇUBUĞU */}
      {tableNumber && (
        <div className="pointer-events-auto w-full grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenServiceCall}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 active:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors shadow"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">
              {t("callWaiter", language)}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenActiveOrders}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 active:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors shadow"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Receipt className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">
                {t("tab", language)}
              </span>
            </div>
            <span className="font-bold text-amber-400 tabular-nums">
              {formatMoney(activeTableTotal)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

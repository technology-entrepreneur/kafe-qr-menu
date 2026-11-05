"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users2,
  X,
  Check,
  Plus,
  Minus,
  Calculator,
  Percent,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { formatMoney } from "@/lib/cartMath";
import { Language } from "@/types/menu";
import { ActiveOrderItem } from "@/lib/hooks/useTableSession";
import { t } from "@/lib/translations";

interface BillSplitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: ActiveOrderItem[];
  totalTableAmount: number;
  tableNumber: string;
  language?: Language;
  onRequestBillWithSplit?: (myShare: number) => void;
}

type SplitMode = "equal" | "itemized";

export default function BillSplitDrawer({
  isOpen,
  onClose,
  items,
  totalTableAmount,
  tableNumber,
  language = "tr",
  onRequestBillWithSplit,
}: BillSplitDrawerProps) {
  const isEn = language === "en";

  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [personCount, setPersonCount] = useState<number>(2);

  // Ürün bazlı seçim: item id -> seçilen adet
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [tipPercent, setTipPercent] = useState<number>(0);

  // Henüz ödenmemiş kalemleri filtrele
  const unpaidItems = useMemo(() => items.filter((it) => !it.isPaid), [items]);

  // Eşit bölüşüm tutarı
  const equalPerPerson =
    personCount > 0 ? totalTableAmount / personCount : totalTableAmount;

  // Ürün bazlı seçilenlerin toplamı
  const itemizedSubtotal = useMemo(() => {
    return unpaidItems.reduce((acc, item) => {
      const count = selectedItems[item.id] || 0;
      return acc + count * item.unitPrice;
    }, 0);
  }, [unpaidItems, selectedItems]);

  // Seçilen moda göre taban tutar
  const baseShare = splitMode === "equal" ? equalPerPerson : itemizedSubtotal;
  const tipAmount = (baseShare * tipPercent) / 100;
  const finalMyShare = baseShare + tipAmount;

  // Ürün seçimi değiştir
  const handleItemToggle = (itemId: string, maxQuantity: number) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      if (current >= maxQuantity) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: current + 1 };
    });
  };

  const handleItemCountChange = (
    itemId: string,
    delta: number,
    maxQuantity: number
  ) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      const nextVal = current + delta;
      if (nextVal <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: Math.min(nextVal, maxQuantity) };
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-t-xl sm:rounded-lg bg-slate-900 border-t sm:border border-slate-800 text-slate-100 shadow-xl z-10 max-h-[90vh] flex flex-col font-sans overflow-hidden"
          >
            {/* Tutamaç */}
            <div className="sm:hidden mx-auto my-3 h-1 w-10 rounded-full bg-slate-700" />

            {/* Başlık */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {t("splitBill", language)}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                      {t("table", language)} {tableNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {t("equalSplit", language)} / {t("itemizedSplit", language)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mod Seçimi (Eşit vs Ürün Bazlı) */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/40">
              <div className="grid grid-cols-2 p-1 rounded-md bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSplitMode("equal")}
                  className={`py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    splitMode === "equal"
                      ? "bg-amber-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Users2 className="w-3.5 h-3.5" />
                  <span>{t("equalSplit", language)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitMode("itemized")}
                  className={`py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    splitMode === "itemized"
                      ? "bg-amber-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{t("itemizedSplit", language)}</span>
                </button>
              </div>
            </div>

            {/* İçerik */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {splitMode === "equal" ? (
                /* EŞİT BÖLÜŞÜM AYARI */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase font-medium tracking-wide">
                      {isEn ? "Total Table Bill" : "Toplam Masa Tutarı"}
                    </span>
                    <p className="text-xl font-bold tabular-nums text-white">
                      {formatMoney(totalTableAmount)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200">
                        {isEn ? "Number of Guests:" : "Masadaki Kişi Sayısı:"}
                      </span>
                      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-1 gap-2">
                        <button
                          type="button"
                          onClick={() => setPersonCount((p) => Math.max(2, p - 1))}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-bold tabular-nums text-amber-500">
                          {personCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPersonCount((p) => Math.min(20, p + 1))}
                          className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Hızlı Kişi Sayısı Rozetleri */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {[2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPersonCount(num)}
                          className={`flex-1 py-1 rounded text-xs font-semibold tabular-nums border transition-colors ${
                            personCount === num
                              ? "bg-amber-600 border-amber-600 text-white"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {num} {isEn ? "p" : "kişi"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ÜRÜN BAZLI SEÇİM */
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 mb-1">
                    {isEn
                      ? "Select the items you ordered to see your exact portion:"
                      : "Kendi tükettiğiniz ürünleri seçin:"}
                  </p>

                  {unpaidItems.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-6">
                      {isEn ? "No unpaid active orders to split." : "Bölünecek ödenmemiş sipariş bulunmuyor."}
                    </p>
                  ) : (
                    unpaidItems.map((item) => {
                      const count = selectedItems[item.id] || 0;
                      const isSelected = count > 0;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleItemToggle(item.id, item.quantity)}
                          className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-500/40"
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-amber-600 text-white"
                                  : "border border-slate-700 bg-slate-900 text-transparent"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-medium text-white truncate">
                                {item.productName}
                              </h4>
                              <p className="text-[11px] tabular-nums text-slate-400">
                                {formatMoney(item.unitPrice)} • {item.quantity}{" "}
                                {isEn ? "ordered" : "adet"}
                              </p>
                            </div>
                          </div>

                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 flex-shrink-0"
                          >
                            {isSelected && item.quantity > 1 && (
                              <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleItemCountChange(item.id, -1, item.quantity)
                                  }
                                  className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-xs font-medium tabular-nums text-amber-400">
                                  {count}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleItemCountChange(item.id, 1, item.quantity)
                                  }
                                  className="w-5 h-5 rounded bg-slate-800 text-white flex items-center justify-center"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <span className="text-xs font-semibold tabular-nums text-amber-400">
                              {formatMoney(
                                count > 0 ? count * item.unitPrice : item.unitPrice
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* BAHŞİŞ / TİP SEÇENEĞİ */}
              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">
                    {isEn ? "Add Service Tip:" : "Servis Bahşişi:"}
                  </span>
                  <span className="font-semibold tabular-nums text-amber-400">
                    {tipPercent > 0 ? `+%${tipPercent} (${formatMoney(tipAmount)})` : isEn ? "None" : "Yok"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPercent(pct)}
                      className={`flex-1 py-1 rounded text-xs font-medium border transition-colors ${
                        tipPercent === pct
                          ? "bg-amber-600 border-amber-600 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {pct === 0 ? (isEn ? "0%" : "Yok") : `%${pct}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ALT ÖZET VE AKSİYON */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium tracking-wide">
                    {splitMode === "equal"
                      ? isEn
                        ? `Your Share (1/${personCount})`
                        : `Kişi Başı Pay (1/${personCount})`
                      : isEn
                      ? "Selected Items Total"
                      : "Kendi Payınızın Toplamı"}
                  </span>
                  <p className="text-xl font-bold tabular-nums text-amber-500">
                    {formatMoney(finalMyShare)}
                  </p>
                </div>

                <div className="text-right text-[11px] tabular-nums text-slate-400">
                  <p>{isEn ? "Total Bill:" : "Masa Toplamı:"} {formatMoney(totalTableAmount)}</p>
                  {tipPercent > 0 && (
                    <p className="text-amber-400">
                      +{formatMoney(tipAmount)} {isEn ? "tip" : "bahşiş"}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onRequestBillWithSplit) {
                    onRequestBillWithSplit(finalMyShare);
                  }
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm active:opacity-90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {isEn
                    ? `Request Bill With This Amount (${formatMoney(finalMyShare)})`
                    : `Bu Tutarı Ödemek İstiyorum (${formatMoney(finalMyShare)})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


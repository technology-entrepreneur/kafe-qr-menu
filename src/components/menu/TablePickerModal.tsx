"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, X, Check } from "lucide-react";
import { Language } from "@/types/menu";
import { t } from "@/lib/translations";

interface TablePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: string | null;
  onSelectTable: (tableNumber: string) => void;
  language: Language;
}

const QUICK_TABLES = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "14", "15", "16", "20",
  "Bahçe 1", "Bahçe 2", "Bahçe 3", "Teras 1", "Teras 2"
];

export default function TablePickerModal({
  isOpen,
  onClose,
  currentTable,
  onSelectTable,
  language,
}: TablePickerModalProps) {
  const [customTable, setCustomTable] = useState("");

  const handleSelect = (tableNo: string) => {
    const clean = tableNo.trim();
    if (!clean) return;
    onSelectTable(clean);
    try {
      localStorage.setItem("preferred_table_number", clean);
    } catch {}
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTable.trim()) {
      handleSelect(customTable);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-5 z-10 font-sans overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {t("selectOrEnterTable", language)}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t("tableRequiredNotice", language)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick table grid */}
            <div className="mt-3.5 space-y-3">
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto no-scrollbar p-1">
                {QUICK_TABLES.map((tableNo) => {
                  const isSelected = currentTable === tableNo;
                  return (
                    <button
                      key={tableNo}
                      type="button"
                      onClick={() => handleSelect(tableNo)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105"
                          : "bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {tableNo}
                    </button>
                  );
                })}
              </div>

              {/* Custom input */}
              <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <input
                  type="text"
                  value={customTable}
                  onChange={(e) => setCustomTable(e.target.value)}
                  placeholder={
                    language === "tr"
                      ? "Örn: 7, Bahçe-4"
                      : language === "ar"
                      ? "مثال: 7 أو الحديقة"
                      : language === "ru"
                      ? "Например: 7, Терраса"
                      : language === "de"
                      ? "Z.B.: 7, Garten-1"
                      : "e.g. 7, Patio-1"
                  }
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!customTable.trim()}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


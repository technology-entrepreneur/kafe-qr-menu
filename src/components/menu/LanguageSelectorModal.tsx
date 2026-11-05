"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, X, Check } from "lucide-react";
import { Language, SUPPORTED_LANGUAGES, LanguageConfig } from "@/types/menu";

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

const titles: Record<Language, { title: string; subtitle: string }> = {
  tr: { title: "Dil Seçimi", subtitle: "Menüyü görüntülemek istediğiniz dili seçin" },
  en: { title: "Select Language", subtitle: "Choose your preferred menu language" },
  ar: { title: "اختر اللغة", subtitle: "اختر لغتك المفضلة لعرض القائمة" },
  ru: { title: "Выбор языка", subtitle: "Выберите язык меню" },
  de: { title: "Sprache wählen", subtitle: "Wählen Sie Ihre bevorzugte Menüsprache" },
};

export default function LanguageSelectorModal({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}: LanguageSelectorModalProps) {
  const currentTitle = titles[currentLanguage] || titles.tr;

  const handleSelect = (lang: Language) => {
    onSelectLanguage(lang);
    try {
      localStorage.setItem("preferred_menu_lang", lang);
    } catch {}
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-sm rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl p-5 z-10 font-sans overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {currentTitle.title}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {currentTitle.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language Options List */}
            <div className="mt-3.5 space-y-2">
              {SUPPORTED_LANGUAGES.map((langConfig: LanguageConfig) => {
                const isSelected = langConfig.code === currentLanguage;
                return (
                  <button
                    key={langConfig.code}
                    type="button"
                    onClick={() => handleSelect(langConfig.code)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm"
                        : "bg-stone-950/70 border-stone-800 text-stone-200 hover:bg-stone-800/80 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none" role="img" aria-label={langConfig.name}>
                        {langConfig.flag}
                      </span>
                      <div>
                        <div className="text-sm font-bold leading-snug">
                          {langConfig.nativeName}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {langConfig.name} ({langConfig.code.toUpperCase()})
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


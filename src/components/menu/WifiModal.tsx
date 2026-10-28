"use client";

import { useState } from "react";
import { Wifi, Copy, Check, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Language } from "@/types/menu";

interface WifiModalProps {
  isOpen: boolean;
  onClose: () => void;
  ssid: string | null;
  password: string | null;
  language?: Language;
}

export default function WifiModal({
  isOpen,
  onClose,
  ssid,
  password,
  language = "tr",
}: WifiModalProps) {
  const isEn = language === "en";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Arka plan karartması */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Kartı */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 z-10"
          >
            {/* Kapat Butonu */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition-colors"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>

            {/* İkon & Başlık */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shadow-inner">
                <Wifi className="h-8 w-8" />
              </div>

              <h3 className="mt-4 text-xl font-bold font-display text-stone-900 dark:text-stone-100">
                {isEn ? "Guest Wi-Fi Network" : "Misafir Wi-Fi Ağı"}
              </h3>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {isEn
                  ? "Enjoy free high-speed internet during your coffee break."
                  : "Kafe süresince ücretsiz yüksek hızlı internetin keyfini çıkarın."}
              </p>
            </div>

            {/* Bilgi Kutusu */}
            <div className="mt-6 space-y-3 rounded-2xl bg-stone-50 dark:bg-stone-950/50 p-4 border border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                  {isEn ? "Network Name (SSID)" : "Ağ Adı (SSID)"}
                </span>
                <p className="font-semibold text-stone-800 dark:text-stone-200 text-sm mt-0.5">
                  {ssid || (isEn ? "Cafe_Guest" : "Kafe_Misafir")}
                </p>
              </div>

              <div className="border-t border-stone-200/60 dark:border-stone-800 pt-3">
                <span className="text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                  {isEn ? "Password" : "Şifre"}
                </span>
                <div className="mt-0.5 flex items-center justify-between">
                  <p className="font-mono text-base font-bold text-amber-700 dark:text-amber-400">
                    {password || (isEn ? "No Password" : "Şifresiz")}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-amber-700 active:scale-95 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>{isEn ? "Copied" : "Kopyalandı"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>{isEn ? "Copy" : "Kopyala"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Güvenlik Notu */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>{isEn ? "Secure & High-Speed Guest Connection" : "Güvenli & Hızlı Misafir Bağlantısı"}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

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
            className="fixed inset-0 bg-slate-950/70"
          />

          {/* Modal Kartı */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-sm overflow-hidden rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-10"
          >
            {/* Kapat Butonu */}
            <button
              onClick={onClose}
              className="absolute right-3.5 top-3.5 rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>

            {/* İkon & Başlık */}
            <div className="flex flex-col items-center text-center pt-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Wifi className="h-6 w-6" />
              </div>

              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">
                {isEn ? "Guest Wi-Fi Network" : "Misafir Wi-Fi Ağı"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? "Connect with network details below."
                  : "Aşağıdaki bilgilerle ağa bağlanabilirsiniz."}
              </p>
            </div>

            {/* Bilgi Kutusu */}
            <div className="mt-5 space-y-3 rounded-md bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                  {isEn ? "Network Name (SSID)" : "Ağ Adı (SSID)"}
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                  {ssid || (isEn ? "Cafe_Guest" : "Kafe_Misafir")}
                </p>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                  {isEn ? "Password" : "Şifre"}
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <p className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                    {password || (isEn ? "No Password" : "Şifresiz")}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded bg-amber-600 hover:bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
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
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isEn ? "Guest Connection" : "İşletme İçi Misafir Bağlantısı"}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

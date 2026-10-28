"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  Wifi,
  Sparkles,
  Globe,
  Clock,
  Coffee,
} from "lucide-react";
import { BusinessSettingsData, Language } from "@/types/menu";

interface MenuHeaderProps {
  settings: BusinessSettingsData;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  tableNumber?: string | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenWifi: () => void;
}

export default function MenuHeader({
  settings,
  searchQuery,
  onSearchChange,
  tableNumber,
  language,
  onLanguageChange,
  onOpenWifi,
}: MenuHeaderProps) {
  const isEn = language === "en";

  return (
    <div className="w-full">
      <div className="mx-auto max-w-2xl px-4 pt-3 pb-2 space-y-2.5">
        {/* ==================================================== */}
        {/* 1. ÜST ÇUBUK: Masa No, Durum, Dil & Wi-Fi Araçları  */}
        {/* ==================================================== */}
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Sol: Masa Numarası & Canlı Açık Durumu */}
          <div className="flex items-center gap-2">
            {tableNumber ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span>
                  {isEn
                    ? `Table ${tableNumber.replace(/^(masa|table)\s*/i, "").trim()}`
                    : `Masa ${tableNumber.replace(/^(masa|table)\s*/i, "").trim()}`}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isEn ? "Open Now" : "Şu an Açık"}</span>
              </span>
            )}
          </div>

          {/* Sağ: Hızlı Araçlar (Giriş Hub, Wi-Fi, Dil Seçici) */}
          <div className="flex items-center gap-1.5">
            {/* Karşılama Hub'ına Dönüş */}
            <Link
              href={tableNumber ? `/?table=${encodeURIComponent(tableNumber)}` : "/"}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/30 transition-all text-[11px] font-medium"
              title={isEn ? "Return to Welcome Hub" : "Karşılama Merkezine Dön"}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Hub" : "Giriş"}</span>
            </Link>

            {/* Wi-Fi Butonu */}
            <button
              type="button"
              onClick={onOpenWifi}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/30 transition-all text-[11px] font-medium cursor-pointer"
              title={isEn ? "Free Guest Wi-Fi" : "Ücretsiz Misafir Wi-Fi"}
            >
              <Wifi className="w-3.5 h-3.5 text-amber-400" />
              <span>Wi-Fi</span>
            </button>

            {/* Dil Seçici (TR / EN) */}
            <button
              type="button"
              onClick={() => onLanguageChange(isEn ? "tr" : "en")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-[11px] font-bold cursor-pointer"
              title={isEn ? "Switch to Turkish" : "İngilizceye Geç"}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "EN" : "TR"}</span>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 2. MARKA VİTRİNİ (Logo, İsim, Durum Alt Metni)       */}
        {/* ==================================================== */}
        <div className="flex items-center gap-3 py-0.5">
          {/* Logo */}
          <div className="relative w-11 h-11 flex-shrink-0 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 border border-amber-500/25 p-0.5 shadow-md overflow-hidden">
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={settings.cafeName}
                width={44}
                height={44}
                className="w-full h-full object-cover rounded-[14px]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-900 rounded-[14px]">
                <Coffee className="w-5 h-5 text-amber-400" />
              </div>
            )}
          </div>

          {/* İsim & Durum */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-display truncate">
              {settings.cafeName}
            </h1>
            <p className="text-[11px] text-stone-400 flex items-center gap-1.5 truncate mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {settings.workingHours ? `${settings.workingHours} • ` : ""}
                {isEn ? "Cafe, Restaurant & Lounge" : "Kafe, Restoran & Lounge"}
              </span>
            </p>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 3. GLOBAL CANLI ARAMA ÇUBUĞU                         */}
        {/* ==================================================== */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isEn
                ? "Search coffee, pastry, ingredients or allergens..."
                : "Kahve, tatlı, içerik veya alerjen ara..."
            }
            className="w-full rounded-2xl bg-stone-900/90 border border-stone-800 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
              title={isEn ? "Clear search" : "Aramayı Temizle"}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

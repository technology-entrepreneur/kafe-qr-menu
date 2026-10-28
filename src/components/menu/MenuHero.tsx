"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Wifi,
  Sparkles,
  Globe,
  Coffee,
  Tag,
  ArrowRight,
} from "lucide-react";
import { BusinessSettingsData, CampaignItem, Language } from "@/types/menu";

interface MenuHeroProps {
  settings: BusinessSettingsData;
  campaigns?: CampaignItem[];
  tableNumber?: string | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenWifi: () => void;
}

export default function MenuHero({
  settings,
  campaigns = [],
  tableNumber,
  language,
  onLanguageChange,
  onOpenWifi,
}: MenuHeroProps) {
  const isEn = language === "en";
  const activeCampaign = campaigns.find((c) => c.isActive);

  return (
    <header className="relative w-full border-b border-stone-800/60 bg-gradient-to-b from-[#120e0b] via-[#0c0a08] to-[#080706]">
      {/* Üst Ambient Sıcak Işık Efekti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-4 pb-3 space-y-3">
        {/* ==================================================== */}
        {/* 1. ÜST ÇUBUK: Masa Rozeti & Hızlı Araçlar            */}
        {/* ==================================================== */}
        <div className="flex items-center justify-between gap-2">
          {/* Masa Numarası / Durum Göstergesi */}
          <div>
            {tableNumber ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs shadow-sm shadow-amber-500/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span>
                  {isEn
                    ? `Table ${tableNumber.replace(/^(masa|table)\s*/i, "").trim()}`
                    : `Masa ${tableNumber.replace(/^(masa|table)\s*/i, "").trim()}`}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isEn ? "Open Now" : "Şu an Açık"}</span>
              </div>
            )}
          </div>

          {/* Hızlı Butonlar: Karşılama Hub'ı, Wi-Fi, Dil Seçici */}
          <div className="flex items-center gap-1.5">
            {/* Giriş Hub Linki */}
            <Link
              href={tableNumber ? `/?table=${encodeURIComponent(tableNumber)}` : "/"}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/30 transition-all text-xs font-medium cursor-pointer"
              title={isEn ? "Welcome Hub" : "Karşılama Sayfasına Dön"}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Hub" : "Giriş"}</span>
            </Link>

            {/* Wi-Fi Bilgi Butonu */}
            <button
              type="button"
              onClick={onOpenWifi}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/30 transition-all text-xs font-medium cursor-pointer"
              title={isEn ? "Free Guest Wi-Fi" : "Ücretsiz Misafir Wi-Fi"}
            >
              <Wifi className="w-3.5 h-3.5 text-amber-400" />
              <span>Wi-Fi</span>
            </button>

            {/* Dil Değiştirici */}
            <button
              type="button"
              onClick={() => onLanguageChange(isEn ? "tr" : "en")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-xs font-bold cursor-pointer"
              title={isEn ? "Türkçe diline geç" : "Switch to English"}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "EN" : "TR"}</span>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 2. MARKA VE MEKAN KİMLİĞİ (Hero Identity)           */}
        {/* ==================================================== */}
        <div className="flex items-center gap-3.5 pt-0.5 pb-1">
          {/* Logo */}
          <div className="relative w-12 h-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 border border-amber-500/30 p-0.5 shadow-lg shadow-black/60 overflow-hidden">
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={settings.cafeName}
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-[14px]"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-900 rounded-[14px]">
                <Coffee className="w-6 h-6 text-amber-400" />
              </div>
            )}
          </div>

          {/* İsim ve Durum */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              {settings.cafeName}
            </h1>
            <p className="text-xs text-stone-400 flex items-center gap-1.5 truncate mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {settings.workingHours
                  ? `${isEn ? settings.workingHours.replace("Her gün", "Daily") : settings.workingHours} • `
                  : ""}
                {isEn ? "Cafe, Restaurant & Lounge" : "Kafe, Restoran & Lounge"}
              </span>
            </p>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 3. AKTİF KAMPANYA BANNERI (Varsa Gösterilir)         */}
        {/* ==================================================== */}
        {activeCampaign && (() => {
          const discPrice =
            activeCampaign.discountedPrice ??
            (activeCampaign.title.includes("San Sebastian") ? 285 : null);
          const origPrice =
            activeCampaign.originalPrice ??
            (activeCampaign.title.includes("San Sebastian") ? 345 : null);

          return (
            <div className="mt-1 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-stone-900/90 to-amber-950/25 border border-amber-500/40 flex items-center justify-between gap-2.5 text-xs shadow-md shadow-amber-500/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center flex-shrink-0 font-bold shadow-sm shadow-amber-500/30">
                  <Tag className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-extrabold text-amber-300 truncate text-xs sm:text-sm">
                    {isEn
                      ? (activeCampaign as any).titleEn ||
                        (activeCampaign.title === "Latte + San Sebastian Menüsü"
                          ? "Latte + San Sebastian Combo"
                          : activeCampaign.title)
                      : activeCampaign.title}
                  </p>
                  {activeCampaign.subtitle && (
                    <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                      {isEn
                        ? (activeCampaign as any).subtitleEn ||
                          (activeCampaign.subtitle.includes("Belçika")
                            ? "Velvety hot latte paired with creamy Belgian chocolate cheesecake"
                            : activeCampaign.subtitle)
                        : activeCampaign.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Sağ Taraf: Fiyat ve Rozet */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                {discPrice && (
                  <div className="flex items-baseline gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-xl bg-stone-950/90 border border-amber-500/40 shadow-inner">
                    {origPrice && origPrice > discPrice && (
                      <span className="text-[10px] sm:text-[11px] font-medium text-stone-500 line-through">
                        ₺{origPrice}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-black text-amber-400 font-display tracking-tight">
                      ₺{discPrice}
                    </span>
                  </div>
                )}

                <span className="text-[9px] sm:text-[10px] font-black text-amber-300 whitespace-nowrap bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider shadow-sm">
                  {isEn
                    ? activeCampaign.badgeText === "GÜNÜN FIRSATI"
                      ? "DAILY DEAL"
                      : "SPECIAL DEAL"
                    : activeCampaign.badgeText || "Fırsat"}
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    </header>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Wifi,
  Sparkles,
  Globe,
  Coffee,
} from "lucide-react";
import { BusinessSettingsData, CampaignItem, Language } from "@/types/menu";
import CampaignSlider from "./CampaignSlider";

interface MenuHeroProps {
  settings: BusinessSettingsData;
  campaigns?: CampaignItem[];
  tableNumber?: string | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenWifi: () => void;
  onSelectCampaign?: (campaign: CampaignItem) => void;
}

export default function MenuHero({
  settings,
  campaigns = [],
  tableNumber,
  language,
  onLanguageChange,
  onOpenWifi,
  onSelectCampaign,
}: MenuHeroProps) {
  const isEn = language === "en";

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
        {/* 3. AKTİF KAMPANYALAR SLIDERI (Tüm Fırsatlar)         */}
        {/* ==================================================== */}
        {campaigns && campaigns.length > 0 && (
          <CampaignSlider
            campaigns={campaigns}
            language={language}
            onSelectCampaign={onSelectCampaign}
          />
        )}
      </div>
    </header>
  );
}

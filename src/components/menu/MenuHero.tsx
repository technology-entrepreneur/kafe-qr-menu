"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Wifi,
  Sparkles,
  Globe,
  Coffee,
  ChevronLeft,
} from "lucide-react";
import { BusinessSettingsData, CampaignItem, Language, SUPPORTED_LANGUAGES } from "@/types/menu";
import CampaignSlider from "./CampaignSlider";
import LanguageSelectorModal from "./LanguageSelectorModal";
import { t } from "@/lib/translations";

interface MenuHeroProps {
  settings: BusinessSettingsData;
  campaigns?: CampaignItem[];
  tableNumber?: string | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenWifi: () => void;
  onOpenTableModal?: () => void;
  onSelectCampaign?: (campaign: CampaignItem) => void;
}

export default function MenuHero({
  settings,
  campaigns = [],
  tableNumber,
  language,
  onLanguageChange,
  onOpenWifi,
  onOpenTableModal,
  onSelectCampaign,
}: MenuHeroProps) {
  const isEn = language === "en";
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const currentLangConfig =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const cleanTableNo = tableNumber ? tableNumber.replace(/^(masa|table)\s*/i, "").trim() : null;

  return (
    <header className="relative w-full border-b border-stone-800/60 bg-gradient-to-b from-[#14100c] via-[#0c0a08] to-[#070605] text-stone-100">
      {/* Üst Ambient Sıcak Işık Efekti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-4 pb-3 space-y-3">
        {/* ==================================================== */}
        {/* 1. ÜST ÇUBUK: Masa Rozeti & Hızlı Butonlar           */}
        {/* ==================================================== */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 text-xs overflow-x-auto no-scrollbar py-0.5 min-w-0">
          {/* Sol: Masa Numarası (QR okutulduğunda sabit rozet olarak gösterilir, seçim yaptırmaz) */}
          <div className="shrink-0">
            {cleanTableNo ? (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 font-bold text-xs shadow-sm shadow-amber-500/10 whitespace-nowrap shrink-0 select-none"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="whitespace-nowrap">{t("table", language)} {cleanTableNo}</span>
              </div>
            ) : null}
          </div>

          {/* Sağ: Karşılama, Wi-Fi, Dil Seçici */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Giriş Hub Linki */}
            <Link
              href={tableNumber ? `/?table=${encodeURIComponent(tableNumber)}` : "/"}
              className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/30 transition-all text-xs font-medium cursor-pointer shadow-sm whitespace-nowrap shrink-0"
              title={isEn ? "Welcome Hub" : "Karşılama Sayfasına Dön"}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden min-[400px]:inline">{isEn ? "Home" : "Karşılama"}</span>
              <span className="min-[400px]:hidden">{isEn ? "Home" : "Giriş"}</span>
            </Link>

            {/* Wi-Fi Bilgi Butonu */}
            <button
              type="button"
              onClick={onOpenWifi}
              className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-xs font-semibold cursor-pointer shadow-sm whitespace-nowrap shrink-0"
              title={isEn ? "Free Guest Wi-Fi" : "Ücretsiz Misafir Wi-Fi"}
            >
              <Wifi className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">Wi-Fi</span>
            </button>

            {/* 5 Dilli Seçici Buton */}
            <button
              type="button"
              onClick={() => setIsLangModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-stone-900/95 border border-stone-800 text-amber-300 hover:border-amber-500/40 hover:bg-stone-850 transition-all text-xs font-bold cursor-pointer shadow-sm whitespace-nowrap shrink-0"
              title={t("selectLanguage", language)}
            >
              <span className="text-sm leading-none shrink-0" role="img" aria-hidden="true">
                {currentLangConfig.flag}
              </span>
              <span className="whitespace-nowrap">{language.toUpperCase()}</span>
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
        {/* 3. AKTİF KAMPANYALAR SLIDERI                         */}
        {/* ==================================================== */}
        {campaigns && campaigns.length > 0 && (
          <CampaignSlider
            campaigns={campaigns}
            onSelectCampaign={onSelectCampaign}
            language={language}
          />
        )}
      </div>

      {/* 5 Dilli Seçim Modalı */}
      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLanguage={language}
        onSelectLanguage={onLanguageChange}
      />
    </header>
  );
}

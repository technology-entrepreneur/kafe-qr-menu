"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Coffee,
  Star,
  ExternalLink,
  Wifi,
  Copy,
  Check,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { CafeConfig } from "@/config/cafe";

interface WelcomeHubProps {
  tableNumber: string | null;
  config: CafeConfig;
}

export default function WelcomeHub({ tableNumber, config }: WelcomeHubProps) {
  const router = useRouter();
  const [wifiCopied, setWifiCopied] = useState(false);

  const handleNavigateMenu = () => {
    if (tableNumber) {
      router.push(`/menu?table=${encodeURIComponent(tableNumber)}`);
    } else {
      router.push("/menu");
    }
  };

  const handleGoogleReviewClick = () => {
    const url = config.actions.googleReview.url || "https://maps.google.com";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyWifi = () => {
    if (!config.wifi.password) return;
    navigator.clipboard.writeText(config.wifi.password);
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2500);
  };

  const cleanTableNo = tableNumber ? tableNumber.replace(/^(masa|table)\s*/i, "").trim() : null;

  return (
    <div className="relative min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Üst Alan: Kurumsal Başlık ve Masa Bilgisi */}
      <header className="w-full max-w-md mx-auto pt-8 px-5 flex flex-col items-center text-center">
        {cleanTableNo && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Masa {cleanTableNo}</span>
          </div>
        )}

        {/* Logo / Sembol */}
        <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 overflow-hidden">
          {config.logoUrl ? (
            <Image
              src={config.logoUrl}
              alt={config.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              priority
            />
          ) : (
            <Coffee className="w-7 h-7 text-amber-500" />
          )}
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white">
          {config.name}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {config.tagline}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {config.welcomeSubtitle}
        </p>
      </header>

      {/* Orta Bölüm: Aksiyon Kartları */}
      <main className="w-full max-w-md mx-auto px-5 py-6 flex flex-col gap-3">
        {/* Menüyü İncele Butonu */}
        <button
          onClick={handleNavigateMenu}
          className="w-full text-left p-4 rounded-lg bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-slate-950 font-semibold transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-md bg-amber-700/40 flex items-center justify-center text-slate-950">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-950 leading-tight">
                {config.actions.menu.title}
              </div>
              <div className="text-xs text-slate-900/80 mt-0.5 font-normal">
                {config.actions.menu.subtitle}
              </div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-950" />
        </button>

        {/* Google'da Değerlendirin Kartı */}
        <button
          onClick={handleGoogleReviewClick}
          className="w-full text-left p-4 rounded-lg bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border border-slate-800 text-slate-200 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-md bg-slate-800 border border-slate-700 flex flex-col items-center justify-center">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-1.5 h-1.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[11px] font-bold text-slate-200 mt-0.5 tabular-nums">
                {config.rating.score.toFixed(1)}
              </span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white leading-tight">
                {config.actions.googleReview.title}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {config.rating.countText} • Puan Verin
              </div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400" />
        </button>
      </main>

      {/* Alt Bölüm: Wi-Fi ve İletişim */}
      <footer className="w-full max-w-md mx-auto px-5 pb-8 flex flex-col items-center gap-3">
        <button
          onClick={handleCopyWifi}
          className="w-full py-2.5 px-4 rounded-md bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-300 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-slate-400" />
            <span>
              Wi-Fi: <strong className="text-white font-medium">{config.wifi.ssid || "Misafir_WiFi"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            {wifiCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Şifre Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopyala</span>
              </>
            )}
          </div>
        </button>

        {/* Sosyal Medya & Konum */}
        <div className="flex items-center gap-2 mt-1">
          {config.socials.maps && (
            <a
              href={config.socials.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Konum"
            >
              <MapPin className="w-4 h-4" />
            </a>
          )}
          {config.socials.instagram && (
            <a
              href={config.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
        </div>

        <span className="text-[11px] text-slate-500">
          {config.name} Sipariş Sistemi
        </span>
      </footer>
    </div>
  );
}

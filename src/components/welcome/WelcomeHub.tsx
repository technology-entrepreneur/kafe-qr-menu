"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  ArrowRight,
  Star,
  Sparkles,
  Wifi,
  Check,
  Copy,
  ExternalLink,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { CafeConfig } from "@/config/cafe";
import { triggerGoldenConfetti } from "@/lib/confetti";

interface WelcomeHubProps {
  config: CafeConfig;
  tableNumber?: string | null;
}

export default function WelcomeHub({ config, tableNumber }: WelcomeHubProps) {
  const router = useRouter();
  const [wifiCopied, setWifiCopied] = useState(false);
  const [reviewTriggered, setReviewTriggered] = useState(false);

  // Menü sayfasını arka planda önceden yükle (Instant transition)
  useEffect(() => {
    if (config.actions.menu.path) {
      router.prefetch(config.actions.menu.path);
    }
  }, [config.actions.menu.path, router]);

  // Wi-Fi şifresi kopyalama
  const handleCopyWifi = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(config.wifi.password);
      }
      setWifiCopied(true);
      setTimeout(() => setWifiCopied(false), 2600);
    } catch {
      setWifiCopied(true);
      setTimeout(() => setWifiCopied(false), 2600);
    }
  };

  // Google Review butonu tıklama aksiyonu (Konfeti + Yönlendirme)
  const handleGoogleReviewClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Altın ışıltılı konfeti patlat
    triggerGoldenConfetti(x, y);

    setReviewTriggered(true);

    // Kısa ve zarif bir gecikmeyle Google Maps Review sayfasına yönlendir
    setTimeout(() => {
      window.open(config.actions.googleReview.url, "_blank", "noopener,noreferrer");
      setTimeout(() => setReviewTriggered(false), 2000);
    }, 450);
  };

  // Menüye yönlendirme
  const handleNavigateMenu = () => {
    router.push(config.actions.menu.path);
  };

  // Stagger animasyon varyantları (Apple & Linear standartlarında spring physics)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 380,
        damping: 26,
      },
    },
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#080706] text-stone-100 flex flex-col justify-between overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* ==================================================== */}
      {/* 1. LÜKS AMBİYANS IŞIĞI (Breathing Ambient Orbs & Glow) */}
      {/* ==================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Üst Kehribar Işık Hüzmesi */}
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.35, 0.55, 0.35],
            x: [0, 15, -15, 0],
            y: [0, -20, 10, 0],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-gradient-to-b from-amber-500/25 via-amber-600/15 to-transparent blur-[120px]"
        />

        {/* Alt Sıcak Kahve Parıltısı */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-gradient-to-t from-amber-700/20 via-stone-900/30 to-transparent blur-[140px]"
        />

        {/* Çok hafif lüks noise / mikrogörsel doku */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* ==================================================== */}
      {/* ANA İÇERİK KONTEYNERİ (Tam Ekran, Scrollsuz Mobil Odak) */}
      {/* ==================================================== */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md mx-auto px-5 py-6 md:py-8 flex-1 flex flex-col justify-between"
      >
        {/* ==================================================== */}
        {/* ÜST BÖLÜM: MASA ETİKETİ & KAFE KİMLİĞİ               */}
        {/* ==================================================== */}
        <div className="flex flex-col items-center text-center pt-2">
          {/* Masa Numarası Rozeti (Eğer URL'de ?table=... varsa parlar) */}
          {tableNumber && (
            <motion.div
              variants={itemVariants}
              className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-amber-300 uppercase">
                {config.tableBadgePrefix} {tableNumber.replace(/^(masa|table)\s*/i, "").trim()}
              </span>
            </motion.div>
          )}

          {/* Logo / İkon */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotate: 1 }}
            className="relative mb-3.5 group cursor-pointer"
          >
            {/* Logo Arkası Altın Halka Işıltısı */}
            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-amber-500/40 via-amber-300/20 to-amber-600/40 blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-stone-800/90 to-stone-900/95 border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
              {config.logoUrl ? (
                <Image
                  src={config.logoUrl}
                  alt={config.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-stone-900">
                  <Coffee className="w-9 h-9 text-amber-400" />
                </div>
              )}
              {/* Cam parıltı efekti */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Kafe İsmi & Tagline */}
          <motion.div variants={itemVariants} className="space-y-1">
            <h2 className="text-sm font-semibold tracking-widest text-amber-400 uppercase">
              {config.tagline}
            </h2>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
              {config.name}
            </h1>
          </motion.div>

          {/* Karşılama Başlığı ve Sıcak Alt Metin */}
          <motion.div variants={itemVariants} className="mt-3 max-w-[320px]">
            <p className="text-stone-300 text-sm font-light leading-relaxed">
              {config.welcomeSubtitle}
            </p>
          </motion.div>
        </div>

        {/* ==================================================== */}
        {/* ORTA BÖLÜM: 2 BÜYÜK VE ETKİLEYİCİ EYLEM BUTONU      */}
        {/* ==================================================== */}
        <motion.div
          variants={itemVariants}
          className="my-auto py-5 flex flex-col gap-4 w-full"
        >
          {/* ---------------------------------------------------- */}
          {/* BUTON 1: "MENÜYÜ İNCELE" (Primary Action)            */}
          {/* ---------------------------------------------------- */}
          <motion.button
            onClick={handleNavigateMenu}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group relative w-full rounded-3xl p-5 text-left border border-amber-500/35 bg-gradient-to-r from-amber-500/[0.14] via-stone-900/80 to-amber-950/40 backdrop-blur-2xl shadow-[0_12px_36px_-10px_rgba(245,158,11,0.28)] hover:shadow-[0_16px_45px_-6px_rgba(245,158,11,0.4)] transition-all duration-300 overflow-hidden"
          >
            {/* Sürekli yavaşça süzülen ışıltı çizgisi (shimmer) */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1.5,
              }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent skew-x-12 pointer-events-none"
            />

            {/* İç İçerik */}
            <div className="relative z-10 flex items-center justify-between gap-4">
              {/* Sol: İkon Rozeti */}
              <div className="flex-shrink-0 w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/30">
                <div className="w-full h-full rounded-[14px] bg-[#120f0c] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                  <Coffee className="w-6 h-6 text-amber-400 group-hover:text-black transition-colors duration-300" />
                </div>
              </div>

              {/* Orta: Metin Alanı */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    {config.actions.menu.badgeText}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight font-display group-hover:text-amber-200 transition-colors">
                  {config.actions.menu.title}
                </h3>
                <p className="text-xs text-stone-300/80 truncate mt-0.5">
                  {config.actions.menu.subtitle}
                </p>
              </div>

              {/* Sağ: İleri Ok Butonu */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-400 transition-all duration-300">
                <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-black group-hover:translate-x-0.5 transition-all duration-300" />
              </div>
            </div>
          </motion.button>

          {/* ---------------------------------------------------- */}
          {/* BUTON 2: "GOOGLE'DA DEĞERLENDİRİN" (Social Proof)    */}
          {/* ---------------------------------------------------- */}
          <motion.button
            onClick={handleGoogleReviewClick}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group relative w-full rounded-3xl p-5 text-left border border-white/[0.1] hover:border-amber-400/40 bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-stone-900/90 backdrop-blur-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] hover:shadow-[0_14px_40px_-8px_rgba(245,158,11,0.2)] transition-all duration-300 overflow-hidden"
          >
            {/* Tıklanma / Konfeti Geri Bildirimi */}
            <AnimatePresence>
              {reviewTriggered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-amber-500/95 backdrop-blur-md flex items-center justify-center gap-2 text-stone-950 font-bold text-sm px-4"
                >
                  <Sparkles className="w-5 h-5 fill-stone-950" />
                  <span>Teşekkürler! Haritaya Yönlendiriliyorsunuz...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-10 flex items-center justify-between gap-4">
              {/* Sol: 5 Altın Yıldız Kümesi */}
              <div className="flex-shrink-0 w-13 h-13 rounded-2xl bg-stone-800/80 border border-white/10 flex flex-col items-center justify-center p-1.5 shadow-inner group-hover:border-amber-400/40 transition-colors">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-2.5 h-2.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-extrabold text-white mt-1">
                  {config.rating.score.toFixed(1)}
                </span>
              </div>

              {/* Orta: Başlık & Sosyal Kanıt */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Sparkles className="w-2.5 h-2.5" />
                    {config.rating.countText}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight font-display group-hover:text-amber-100 transition-colors">
                  {config.actions.googleReview.title}
                </h3>
                <p className="text-xs text-stone-400 truncate mt-0.5">
                  {config.actions.googleReview.subtitle}
                </p>
              </div>

              {/* Sağ: Dış Bağlantı / Yıldız İkonu */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:bg-amber-400/20 group-hover:border-amber-400/30 transition-all duration-300">
                <ExternalLink className="w-4 h-4 text-stone-300 group-hover:text-amber-300 transition-colors" />
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* ==================================================== */}
        {/* DİP BÖLÜM: Wİ-Fİ TEK TIK KOPYALA & SOSYAL KANIT       */}
        {/* ==================================================== */}
        <motion.footer
          variants={itemVariants}
          className="w-full pt-2 pb-1 flex flex-col items-center gap-3"
        >
          {/* Tek Tıkla Wi-Fi Kopyalama Butonu */}
          <div className="relative">
            <motion.button
              onClick={handleCopyWifi}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border text-xs font-medium backdrop-blur-xl transition-all duration-300 shadow-md ${
                wifiCopied
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-950/40"
                  : "bg-stone-900/70 border-white/[0.08] text-stone-300 hover:text-white hover:border-amber-400/30 hover:bg-stone-800/80"
              }`}
            >
              <Wifi
                className={`w-3.5 h-3.5 ${
                  wifiCopied ? "text-emerald-400 animate-bounce" : "text-amber-400"
                }`}
              />
              <span className="tracking-wide">
                {wifiCopied ? (
                  <strong className="font-semibold text-emerald-200">
                    Şifre Kopyalandı! ({config.wifi.password || "Kahve2026"})
                  </strong>
                ) : (
                  <>
                    Wi-Fi: <span className="text-white font-medium">{config.wifi.ssid || "Misafir Wi-Fi"}</span>
                  </>
                )}
              </span>
              {wifiCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Copy className="w-3 h-3 text-stone-400 group-hover:text-stone-200" />
              )}
            </motion.button>
          </div>

          {/* Sosyal Medya Mikro İkonları */}
          <div className="flex items-center gap-2.5 mt-0.5">
            {config.socials.instagram && (
              <motion.a
                href={config.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, rotate: 4 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full bg-stone-900/80 border border-white/[0.08] hover:border-amber-400/40 hover:bg-amber-500/10 text-stone-400 hover:text-amber-300 flex items-center justify-center transition-colors shadow-sm"
                title="Instagram'da Takip Edin"
              >
                {/* Instagram SVG */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </motion.a>
            )}

            {config.socials.tiktok && (
              <motion.a
                href={config.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, rotate: -4 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full bg-stone-900/80 border border-white/[0.08] hover:border-amber-400/40 hover:bg-amber-500/10 text-stone-400 hover:text-amber-300 flex items-center justify-center transition-colors shadow-sm"
                title="TikTok'ta Keşfedin"
              >
                {/* TikTok SVG */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </motion.a>
            )}

            {config.socials.maps && (
              <motion.a
                href={config.socials.maps}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, rotate: 4 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full bg-stone-900/80 border border-white/[0.08] hover:border-amber-400/40 hover:bg-amber-500/10 text-stone-400 hover:text-amber-300 flex items-center justify-center transition-colors shadow-sm"
                title="Google Haritalar'da Konum"
              >
                <MapPin className="w-4 h-4" />
              </motion.a>
            )}
          </div>

          {/* Zarif alt telif / minik imza */}
          <p className="text-[11px] text-stone-400/80 tracking-wide font-light">
            {config.tagline} • Keyifli Vakitler Dileriz
          </p>
        </motion.footer>
      </motion.main>
    </div>
  );
}

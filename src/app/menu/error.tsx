"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function MenuErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Menu Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#080706] text-stone-100 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold font-display text-white mb-2">
        Menü Yüklenirken Bir Sorun Oluştu
      </h1>
      <p className="text-xs sm:text-sm text-stone-400 max-w-sm mb-6 leading-relaxed">
        Kısa süreli bir ağ veya veri aktarım aksaklığı yaşandı. Lütfen sayfayı yeniden deneyin veya karşılama ekranına dönün.
      </p>

      <div className="flex items-center gap-3 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Yeniden Dene</span>
        </button>

        <Link
          href="/"
          className="py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Giriş</span>
        </Link>
      </div>
    </div>
  );
}

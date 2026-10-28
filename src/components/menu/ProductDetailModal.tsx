"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { ProductItem } from "@/lib/types";

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  if (!product) return null;

  const allergensList = product.allergens
    ? product.allergens.split(",").map((s) => s.trim())
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal / Bottom Sheet */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden rounded-t-[2.5rem] sm:rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 z-10 max-h-[90vh] flex flex-col"
        >
          {/* Mobil Sürükleme Tutamacı */}
          <div className="sm:hidden mx-auto my-2.5 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700" />

          {/* Kapat Butonu */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-full bg-black/40 backdrop-blur-md p-2 text-white hover:bg-black/60 transition-colors"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Ürün Görseli */}
          <div className="relative h-64 w-full bg-stone-100 dark:bg-stone-800 flex-shrink-0">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-stone-400">
                <Sparkles className="h-12 w-12" />
              </div>
            )}

            {/* Tükendi Rozeti */}
            {!product.isAvailable && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="rounded-full bg-rose-600/90 text-white font-bold text-sm tracking-wide px-4 py-1.5 shadow-lg uppercase">
                  Şu Anda Tükendi
                </span>
              </div>
            )}
          </div>

          {/* İçerik */}
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-stone-900 dark:text-stone-100">
                  {product.name}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  {product.isAvailable ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Servise Hazır
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-rose-500">
                      Geçici Olarak Servis Dışı
                    </span>
                  )}
                </div>
              </div>

              {/* Fiyat */}
              <div className="text-right flex-shrink-0">
                <span className="text-2xl font-black font-display text-amber-700 dark:text-amber-400">
                  ₺{product.price.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Açıklama */}
            {product.description && (
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                {product.description}
              </p>
            )}

            {/* Alerjen Bilgisi */}
            {allergensList.length > 0 && (
              <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 p-3.5 border border-amber-200/50 dark:border-amber-900/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>Alerjen & İçerik Uyarısı</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {allergensList.map((allergen, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-white dark:bg-stone-800 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bilgi Kutucuğu */}
            <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-3 text-center text-xs text-stone-500 dark:text-stone-400">
              Siparişinizi masanıza gelen servis personelimize iletebilirsiniz. Afiyet olsun! ☕
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

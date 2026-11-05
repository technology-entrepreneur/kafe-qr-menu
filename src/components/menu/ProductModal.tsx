"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Check,
  Sparkles,
  AlertCircle,
  ShoppingBag,
  Flame,
  ArrowRight,
  Coffee,
} from "lucide-react";
import { useMenuStore } from "@/lib/store";
import { ProductItem } from "@/lib/types";

interface ProductModalProps {
  onOpenAnotherProduct?: (product: ProductItem) => void;
}

export default function ProductModal({ onOpenAnotherProduct }: ProductModalProps) {
  const {
    selectedProduct,
    isProductModalOpen,
    closeProductModal,
    selectedOptions,
    toggleExtraOption,
    addToCart,
    openProductModal,
  } = useMenuStore();

  if (!selectedProduct || !isProductModalOpen) return null;

  // Alerjen listesi
  const allergensList = selectedProduct.allergens
    ? selectedProduct.allergens.split(",").map((s) => s.trim())
    : [];

  // Toplam Tutar Hesabı
  const extrasTotal = selectedOptions.reduce((acc, curr) => acc + curr.price, 0);
  const finalPrice = selectedProduct.price + extrasTotal;

  // Çapraz satış önerileri
  const suggestions = (selectedProduct.suggestions || [])
    .map((s) => s.suggestedProduct)
    .filter(Boolean);

  const handleSuggestionClick = (suggested: ProductItem) => {
    if (onOpenAnotherProduct) {
      onOpenAnotherProduct(suggested);
    } else {
      openProductModal(suggested);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeProductModal}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
        />

        {/* Bottom Sheet / Modal */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative w-full max-w-lg overflow-hidden rounded-t-xl sm:rounded-lg bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 z-10 max-h-[92vh] flex flex-col font-sans"
        >
          {/* Mobil Sürükleme Çubuğu */}
          <div className="sm:hidden mx-auto my-2.5 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700" />

          {/* Kapat Butonu */}
          <button
            onClick={closeProductModal}
            className="absolute right-4 top-4 z-20 rounded-full bg-black/40 backdrop-blur-md p-2 text-white hover:bg-black/60 transition-colors"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Ürün Görseli & Başlık Alanı */}
          <div className="relative h-56 w-full bg-stone-100 dark:bg-stone-800 flex-shrink-0">
            {selectedProduct.imageUrl ? (
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-stone-400">
                <Coffee className="h-12 w-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                {selectedProduct.category?.name || "Özel Lezzet"}
              </span>
              <h2 className="text-2xl font-black font-display text-white">
                {selectedProduct.name}
              </h2>
            </div>
          </div>

          {/* Kaydırılabilir İçerik Alanı */}
          <div className="p-5 overflow-y-auto space-y-6">
            {/* Açıklama */}
            {selectedProduct.description && (
              <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                {selectedProduct.description}
              </p>
            )}

            {/* 1. EKSTRA & OPSİYON SEÇİMLERİ (Süt, Şurup vb.) */}
            {selectedProduct.extraGroups && selectedProduct.extraGroups.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />
                  <span>Kişiselleştir & Ekstra Seçimi</span>
                </div>

                {selectedProduct.extraGroups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-2xl bg-stone-50 dark:bg-stone-800/60 p-4 border border-stone-200/80 dark:border-stone-700/60 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {group.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-stone-400">
                        {group.isRequired ? "Zorunlu Seçim" : "İsteğe Bağlı"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.options.map((opt) => {
                        const isSelected = selectedOptions.some(
                          (so) => so.optionId === opt.id
                        );

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              toggleExtraOption(group.id, group.title, opt, group.maxSelect)
                            }
                            className={`flex items-center justify-between rounded-xl p-2.5 text-left text-xs transition-all ${
                              isSelected
                                ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/20"
                                : "bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-amber-400"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                  isSelected
                                    ? "bg-white text-amber-700 border-white"
                                    : "border-stone-400"
                                }`}
                              >
                                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                              <span>{opt.name}</span>
                            </div>

                            <span
                              className={`text-[11px] font-semibold ${
                                isSelected ? "text-amber-100" : "text-amber-700 dark:text-amber-400"
                              }`}
                            >
                              {opt.price > 0 ? `+₺${opt.price}` : "Ücretsiz"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. "BİRLİKTE HARİKA GİDER" (ÇAPRAZ SATIŞ / CROSS-SELLING) */}
            {suggestions.length > 0 && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                  <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>Birlikte Harika Gider (Şefin Eşleştirmesi)</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {suggestions.map((sug) => (
                    <motion.div
                      key={sug.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSuggestionClick(sug)}
                      className="group cursor-pointer rounded-2xl bg-stone-50 dark:bg-stone-800/80 p-2.5 border border-stone-200/80 dark:border-stone-700 flex flex-col justify-between hover:border-amber-400 transition-all"
                    >
                      <div className="relative h-20 w-full overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-700 mb-2">
                        {sug.imageUrl && (
                          <img
                            src={sug.imageUrl}
                            alt={sug.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>

                      <div>
                        <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-1">
                          {sug.name}
                        </h5>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">
                            ₺{sug.price}
                          </span>
                          <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-0.5">
                            İncele <ArrowRight className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerjen Uyarısı */}
            {allergensList.length > 0 && (
              <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/20 p-3 border border-amber-200/50 dark:border-amber-900/30 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Alerjen Bilgisi</span>
                </div>
                <p className="mt-1 text-[11px] text-amber-800/90 dark:text-amber-400">
                  {allergensList.join(" • ")}
                </p>
              </div>
            )}
          </div>

          {/* Alt Sabit Eylem Çubuğu: Toplam Fiyat & Tepsiye Ekle */}
          <div className="border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                Toplam Tutar
              </span>
              <p className="text-2xl font-black font-display text-stone-900 dark:text-stone-100">
                ₺{finalPrice.toFixed(0)}
              </p>
            </div>

            <button
              onClick={() => addToCart(selectedProduct)}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-amber-600/25 transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Sipariş Listeme / Tepsiye Ekle</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

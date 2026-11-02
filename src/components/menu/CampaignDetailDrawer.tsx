"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Flame, Tag, ShoppingBag, Check } from "lucide-react";
import { CampaignItem, Language } from "@/types/menu";
import { useMenuStore } from "@/lib/store";
import { triggerGoldenConfetti } from "@/lib/confetti";

interface CampaignDetailDrawerProps {
  campaign: CampaignItem | null;
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

export default function CampaignDetailDrawer({
  campaign,
  isOpen,
  onClose,
  language = "tr",
}: CampaignDetailDrawerProps) {
  const isEn = language === "en";
  const [added, setAdded] = useState(false);
  const { addToCart, setIsCartOpen } = useMenuStore();

  if (!campaign) return null;

  const hasSpecificPrice = (campaign.discountedPrice !== null && campaign.discountedPrice !== undefined && campaign.discountedPrice > 0) ||
    (campaign.originalPrice !== null && campaign.originalPrice !== undefined && campaign.originalPrice > 0);
  const price = (campaign.discountedPrice ?? campaign.originalPrice) || 0;
  const originalPrice = campaign.originalPrice;
  const hasDiscount = originalPrice && campaign.discountedPrice && originalPrice > campaign.discountedPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - campaign.discountedPrice!) / originalPrice) * 100)
    : null;

  const handleAddDealToCart = (e: React.MouseEvent) => {
    if (!hasSpecificPrice) {
      onClose();
      return;
    }

    // Confetti efekti
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    triggerGoldenConfetti(x, y);

    // Sepete / Tepsiye Ekle
    addToCart({
      id: campaign.id,
      categoryId: "campaigns",
      name: campaign.title,
      nameEn: campaign.title,
      description: campaign.subtitle,
      descriptionEn: campaign.subtitle,
      price: price,
      imageUrl: campaign.imageUrl,
      isAvailable: true,
      allergens: null,
      badge: "deal",
      order: campaign.order,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
      setIsCartOpen(true);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Karartma Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Çekmece Gövdesi */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl bg-[#0c0a09] border-t sm:border border-stone-800 text-stone-100 shadow-2xl z-10 max-h-[90vh] flex flex-col font-sans overflow-hidden"
          >
            {/* Mobil Tutamaç */}
            <div className="sm:hidden mx-auto my-3 h-1.5 w-12 rounded-full bg-stone-700/80" />

            {/* Görsel Alanı */}
            <div className="relative w-full h-56 sm:h-64 bg-stone-900 overflow-hidden">
              {campaign.imageUrl ? (
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-900 text-amber-500">
                  <Flame className="w-16 h-16 opacity-30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-transparent to-black/40" />

              {/* Kapat Butonu */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-stone-300 hover:text-white flex items-center justify-center border border-white/10 active:scale-90 transition-all cursor-pointer"
                title={isEn ? "Close" : "Kapat"}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Rozet */}
              {campaign.badgeText && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-stone-950 px-3 py-1 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/30">
                    <Sparkles className="h-3.5 w-3.5" />
                    {campaign.badgeText}
                  </span>
                </div>
              )}

              {/* İndirim Yüzdesi Rozeti */}
              {discountPercent && (
                <div className="absolute bottom-4 right-4 z-20">
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 text-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow-lg">
                    %{discountPercent} {isEn ? "OFF" : "İNDİRİM"}
                  </span>
                </div>
              )}
            </div>

            {/* İçerik & Detaylar */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{isEn ? "Special Promotion Combo" : "Özel Menü Fırsatı"}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                  {campaign.title}
                </h2>
                {campaign.subtitle && (
                  <p className="mt-2 text-sm text-stone-300 leading-relaxed">
                    {campaign.subtitle}
                  </p>
                )}
              </div>

              {/* Fiyat Bilgisi veya Kampanya Avantajı */}
              {hasSpecificPrice ? (
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800/90 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      {isEn ? "Total Combo Price" : "Fırsat Menü Fiyatı"}
                    </p>
                    <div className="flex items-baseline gap-2.5 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black font-display text-amber-400">
                        ₺{price.toFixed(0)}
                      </span>
                      {originalPrice && originalPrice > price && (
                        <span className="text-sm font-semibold text-stone-500 line-through">
                          ₺{originalPrice.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {hasDiscount && (
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl inline-block">
                        {isEn
                          ? `Save ₺${(originalPrice - price).toFixed(0)}`
                          : `₺${(originalPrice - price).toFixed(0)} Kazanç`}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3 text-xs text-amber-200">
                  <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>
                    {isEn
                      ? "This special offer applies to corresponding items in the menu. Explore and add to your order tray!"
                      : "Bu özel fırsat menüdeki ilgili ürünlerde geçerlidir. Menüyü inceleyip tepsinize ekleyebilirsiniz!"}
                  </span>
                </div>
              )}
            </div>

            {/* Alt Eylem Çubuğu */}
            <div className="p-4 sm:p-5 border-t border-stone-800/80 bg-[#0c0a09]">
              {hasSpecificPrice ? (
                <button
                  type="button"
                  onClick={handleAddDealToCart}
                  disabled={added}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/20 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-80"
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>{isEn ? "Added to Tray!" : "Tepsiye Eklendi!"}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>
                        {isEn
                          ? `Add Deal to Order Tray (₺${price.toFixed(0)})`
                          : `Bu Fırsatı Tepsime Ekle (₺${price.toFixed(0)})`}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/20 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{isEn ? "Explore Menu Items" : "Menüdeki Lezzetleri İncele"}</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Sparkles, Flame, Heart, AlertCircle, Ban } from "lucide-react";
import { ProductItem, Language } from "@/types/menu";
import { formatMoney } from "@/lib/cartMath";

interface ProductCardProps {
  product: ProductItem;
  onSelect: (product: ProductItem) => void;
  language: Language;
}

export default function ProductCard({
  product,
  onSelect,
  language,
}: ProductCardProps) {
  const isEn = language === "en";
  const isAvailable = product.isAvailable;

  const displayName = isEn && product.nameEn ? product.nameEn : product.name;
  const displayDesc =
    isEn && product.descriptionEn ? product.descriptionEn : product.description;

  // Rozet Metni & Rengi
  const getBadgeInfo = () => {
    if (!product.badge) return null;
    switch (product.badge) {
      case "chef":
        return {
          label: isEn ? "Chef's Special" : "Şefin Seçimi",
          className: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          icon: Sparkles,
        };
      case "popular":
        return {
          label: isEn ? "Most Popular" : "Çok Sevilen",
          className: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          icon: Heart,
        };
      case "deal":
        return {
          label: isEn ? "Daily Deal" : "Günün Fırsatı",
          className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          icon: Flame,
        };
      case "new":
        return {
          label: isEn ? "New Flavor" : "Yeni Lezzet",
          className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          icon: Sparkles,
        };
      default:
        return {
          label: product.badge,
          className: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          icon: Sparkles,
        };
    }
  };

  const badgeInfo = getBadgeInfo();
  const [imgError, setImgError] = React.useState(false);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onSelect(product)}
      className={`group relative w-full rounded-2xl bg-stone-900/60 hover:bg-stone-900/90 border border-stone-800/80 hover:border-amber-500/30 p-3.5 sm:p-4 backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-amber-500/5 ${
        !isAvailable ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* ==================================================== */}
        {/* SOL: ÜRÜN BİLGİLERİ, TİPOGRAFİ & ALERJENLER           */}
        {/* ==================================================== */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div>
            {/* Varsa Mikro Rozet */}
            {badgeInfo && (
              <div className="mb-1.5 flex items-center gap-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${badgeInfo.className}`}
                >
                  <badgeInfo.icon className="w-2.5 h-2.5" />
                  <span>{badgeInfo.label}</span>
                </span>
              </div>
            )}

            {/* Ürün Adı */}
            <h3 className="text-sm sm:text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors tracking-tight line-clamp-2 leading-snug">
              {displayName}
            </h3>

            {/* Ürün Açıklaması (2 Satır Clamp) */}
            {displayDesc && (
              <p className="mt-1 text-xs text-stone-400 line-clamp-2 leading-relaxed">
                {displayDesc}
              </p>
            )}
          </div>

          {/* Alt Bilgi Satırı: Fiyat, Kalori ve Diyet İkonları */}
          <div className="mt-3 flex items-center flex-wrap gap-2 pt-1">
            {/* Fiyat */}
            <span className="text-base sm:text-lg font-extrabold text-amber-400 font-display tracking-tight">
              {formatMoney(product.price)}
            </span>

            {/* Kalori Bilgisi */}
            {product.calories && (
              <span className="text-[10px] font-medium text-stone-400 bg-stone-800/80 px-1.5 py-0.5 rounded-md">
                🔥 {product.calories} kcal
              </span>
            )}

            {/* Beslenme & Alerjen Etiketleri */}
            <div className="flex items-center gap-1 text-[10px]">
              {product.dietaryTags?.includes("vegan") && (
                <span
                  className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium"
                  title="Vegan"
                >
                  🌱 Vegan
                </span>
              )}
              {product.dietaryTags?.includes("gluten-free") && (
                <span
                  className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium"
                  title={isEn ? "Gluten-Free" : "Glutensiz"}
                >
                  🌾 {isEn ? "Gluten-Free" : "Glutensiz"}
                </span>
              )}
              {product.allergens && (
                <span
                  className="px-1.5 py-0.5 rounded-md bg-stone-800 text-stone-400 text-[10px] truncate max-w-[100px]"
                  title={`${isEn ? "Allergen: " : "Alerjen: "}${isEn && product.allergensEn ? product.allergensEn : product.allergens}`}
                >
                  ⚠️ {isEn && product.allergensEn ? product.allergensEn : product.allergens}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SAĞ: STÜDYO KALİTESİNDE GÖRSEL & EKLE BUTONU          */}
        {/* ==================================================== */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-stone-800 border border-stone-700/60 shadow-md">
          {product.imageUrl && !imgError ? (
            <Image
              src={product.imageUrl}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 96px, 112px"
              onError={() => setImgError(true)}
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                !isAvailable ? "grayscale contrast-125" : ""
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-500">
              <span className="text-2xl">☕</span>
            </div>
          )}

          {/* Karartma Gradyanı */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Tükendi Durumu Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-1">
              <Ban className="w-5 h-5 text-rose-400 mb-0.5" />
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                {isEn ? "Sold Out" : "Tükendi"}
              </span>
            </div>
          )}

          {/* Hızlı Eylem / İncele İkonu (Sağ Alt Köşe) */}
          {isAvailable && (
            <div className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-amber-400 transition-all duration-300">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

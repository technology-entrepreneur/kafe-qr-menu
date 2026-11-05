"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Ban, Utensils } from "lucide-react";
import { ProductItem, Language } from "@/types/menu";
import { formatMoney } from "@/lib/cartMath";
import { t, getBadgeLabel } from "@/lib/translations";

interface ProductCardProps {
  product: ProductItem;
  onSelect: (product: ProductItem) => void;
  language: Language;
  isCatalogOnly?: boolean;
}

export default function ProductCard({
  product,
  onSelect,
  language,
  isCatalogOnly = false,
}: ProductCardProps) {
  const isEn = language === "en";
  const isAvailable = product.isAvailable;
  const [imgError, setImgError] = useState(false);

  const displayName = language === "tr" ? product.name : (product.nameEn || product.name);
  const displayDesc =
    language === "tr" ? product.description : (product.descriptionEn || product.description);

  const getBadgeInfo = () => {
    if (!product.badge) return null;
    const label = getBadgeLabel(product.badge, language) || product.badge;
    switch (product.badge) {
      case "chef":
        return { label, className: "bg-slate-800 text-amber-400 border-slate-700" };
      case "popular":
        return { label, className: "bg-slate-800 text-slate-200 border-slate-700" };
      case "deal":
        return { label, className: "bg-slate-800 text-emerald-400 border-slate-700" };
      case "new":
        return { label, className: "bg-slate-800 text-sky-400 border-slate-700" };
      default:
        return { label, className: "bg-slate-800 text-slate-300 border-slate-700" };
    }
  };

  const badgeInfo = getBadgeInfo();

  return (
    <article
      onClick={() => onSelect(product)}
      className={`group relative w-full rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 transition-colors cursor-pointer ${
        !isAvailable ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Sol: Ürün Bilgileri */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div>
            {badgeInfo && (
              <div className="mb-1.5 flex items-center">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border tracking-wide uppercase ${badgeInfo.className}`}
                >
                  {badgeInfo.label}
                </span>
              </div>
            )}

            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight line-clamp-2 leading-snug">
              {displayName}
            </h3>

            {displayDesc && (
              <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {displayDesc}
              </p>
            )}
          </div>

          {/* Alt Satır: Fiyat & Etiketler */}
          <div className="mt-3 flex items-center flex-wrap gap-2 pt-1">
            <span className="text-sm font-bold text-amber-400 tabular-nums">
              {formatMoney(product.price)}
            </span>

            {product.calories && (
              <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded tabular-nums">
                {product.calories} kcal
              </span>
            )}

            <div className="flex items-center gap-1 text-[10px]">
              {product.dietaryTags?.includes("vegan") && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900 font-medium">
                  Vegan
                </span>
              )}
              {product.dietaryTags?.includes("gluten-free") && (
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  {isEn ? "Gluten-Free" : "Glutensiz"}
                </span>
              )}
              {product.allergens && (
                <span
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] truncate max-w-[120px]"
                  title={`${isEn ? "Allergen: " : "Alerjen: "}${isEn && product.allergensEn ? product.allergensEn : product.allergens}`}
                >
                  {isEn ? "Allergen: " : "Alerjen: "}{isEn && product.allergensEn ? product.allergensEn : product.allergens}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sağ: Ürün Fotoğrafı */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-md overflow-hidden bg-slate-800 border border-slate-700/80">
          {product.imageUrl && !imgError ? (
            <Image
              src={product.imageUrl}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 80px, 96px"
              onError={() => setImgError(true)}
              className={`object-cover ${!isAvailable ? "grayscale" : ""}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
              <Utensils className="w-5 h-5 text-slate-600" />
            </div>
          )}

          {/* Tükendi Durumu */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center text-center p-1">
              <Ban className="w-4 h-4 text-rose-400 mb-0.5" />
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                {t("outOfStock", language)}
              </span>
            </div>
          )}

          {/* Ekle Artı Butonu */}
          {isAvailable && !isCatalogOnly && (
            <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow transition-colors">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

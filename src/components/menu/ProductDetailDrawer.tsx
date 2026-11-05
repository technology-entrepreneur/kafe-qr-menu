"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShoppingBag,
  Ban,
  Coffee,
} from "lucide-react";
import { ProductItem, Language, SelectedExtraOption } from "@/types/menu";
import { useMenuStore } from "@/lib/store";
import { calculateItemUnitPrice, calculateLineTotal } from "@/lib/cartMath";
import { t, getBadgeLabel } from "@/lib/translations";

interface ProductDetailDrawerProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  allProducts?: ProductItem[];
  onSelectProduct?: (product: ProductItem) => void;
  isCatalogOnly?: boolean;
}

export default function ProductDetailDrawer({
  product,
  isOpen,
  onClose,
  language,
  allProducts = [],
  onSelectProduct,
  isCatalogOnly = false,
}: ProductDetailDrawerProps) {
  const isEn = language === "en";
  const [quantity, setQuantity] = useState(1);
  const [localSelectedOptions, setLocalSelectedOptions] = useState<SelectedExtraOption[]>([]);
  const [addedToast, setAddedToast] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { addToCart } = useMenuStore();

  // Ürün değiştiğinde zorunlu seçenekleri varsayılan olarak seç
  React.useEffect(() => {
    setImgError(false);
    setValidationError(null);
    if (product) {
      setQuantity(1);
      const defaults: SelectedExtraOption[] = [];
      if (product.extraGroups) {
        for (const group of product.extraGroups) {
          if (group.isRequired && group.options.length > 0) {
            const first = group.options[0];
            defaults.push({
              groupId: group.id,
              groupTitle: group.title,
              optionId: first.id,
              name: first.name,
              price: first.price,
            });
          }
        }
      }
      setLocalSelectedOptions(defaults);
    }
  }, [product]);

  const displayName =
    product && language === "tr" ? product.name : (product?.nameEn || product?.name || "");
  const displayDesc =
    product && language === "tr"
      ? product.description
      : (product?.descriptionEn || product?.description || "");
  const displayIngredients =
    product?.ingredients || [];

  // Seçenek seç/kaldır
  const handleToggleOption = (
    groupId: string,
    groupTitle: string,
    option: { id: string; name: string; price: number },
    maxSelect: number,
    isRequiredGroup = false
  ) => {
    setValidationError(null);
    const isSelected = localSelectedOptions.some((o) => o.optionId === option.id);

    if (isSelected) {
      // Zorunlu tekli seçimde aynı seçeneğe tıklandığında seçimi kaldırma (standart radyo davranışı)
      if (maxSelect === 1 && isRequiredGroup) {
        return;
      }
      setLocalSelectedOptions((prev) => prev.filter((o) => o.optionId !== option.id));
      return;
    }

    if (maxSelect === 1) {
      // Radyo butonu gibi davran
      setLocalSelectedOptions((prev) => [
        ...prev.filter((o) => o.groupId !== groupId),
        {
          groupId,
          groupTitle,
          optionId: option.id,
          name: option.name,
          price: option.price,
        },
      ]);
    } else {
      const groupCount = localSelectedOptions.filter((o) => o.groupId === groupId).length;
      if (groupCount < maxSelect) {
        setLocalSelectedOptions((prev) => [
          ...prev,
          {
            groupId,
            groupTitle,
            optionId: option.id,
            name: option.name,
            price: option.price,
          },
        ]);
      }
    }
  };

  // Dinamik toplam birim fiyat (Kuruş hassasiyetinde floating-safe hesaplama)
  const unitPrice = product
    ? calculateItemUnitPrice(product.price, localSelectedOptions)
    : 0;
  const totalPrice = calculateLineTotal(unitPrice, quantity);

  // Sepete ekleme işlemi
  const handleAddToCart = () => {
    if (!product || isAdding) return; // Çift tıklama engeli

    if (!product.isAvailable) {
      setValidationError(
        isEn ? "This item is currently sold out." : "Bu ürün şu an maalesef tükendi."
      );
      return;
    }

    // Zorunlu seçenek kontrolü
    if (product.extraGroups && product.extraGroups.length > 0) {
      for (const group of product.extraGroups) {
        if (group.isRequired) {
          const hasOption = localSelectedOptions.some((o) => o.groupId === group.id);
          if (!hasOption) {
            setValidationError(
              isEn
                ? `Please choose an option for "${group.titleEn || group.title}".`
                : `Lütfen "${group.title}" tercihinizi belirleyin.`
            );
            return;
          }
        }
      }
    }

    setIsAdding(true);
    setValidationError(null);

    try {
      addToCart(product, localSelectedOptions, quantity);
      setAddedToast(true);
      setTimeout(() => {
        setAddedToast(false);
        setIsAdding(false);
        onClose();
      }, 500);
    } catch {
      setIsAdding(false);
    }
  };

  // Çapraz satış önerileri (Önce Admin'de tanımlanmış özel öneriler, sonra ilgili/popüler lezzetler)
  const crossSellSuggestions = useMemo(() => {
    if (!product) return [];

    if (product.suggestions && product.suggestions.length > 0) {
      const explicit = product.suggestions
        .map((s) => s.suggestedProduct || allProducts.find((p) => p.id === s.suggestedProductId))
        .filter((p): p is ProductItem => Boolean(p && p.isAvailable && p.id !== product.id));

      if (explicit.length > 0) return explicit.slice(0, 3);
    }

    const sameCategory = allProducts.filter(
      (p) => p.id !== product.id && p.isAvailable && p.categoryId === product.categoryId
    );
    const populars = allProducts.filter(
      (p) => p.id !== product.id && p.isAvailable && p.badge === "popular"
    );

    const merged = Array.from(new Set([...sameCategory, ...populars, ...allProducts]));
    return merged.filter((p) => p.id !== product.id && p.isAvailable).slice(0, 3);
  }, [product, allProducts]);

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          {/* Karartma Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60"
          />

          {/* Çekmece Gövdesi (Bottom Sheet) */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto max-h-[92vh] flex flex-col rounded-t-xl bg-slate-900 border-t border-slate-800 text-slate-100 shadow-xl overflow-hidden font-sans"
          >
            {/* Üst Çekme Çubuğu & Kapatma Butonu */}
            <div className="relative pt-2.5 pb-2 flex items-center justify-center border-b border-slate-800 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-700" />
              <button
                onClick={onClose}
                className="absolute right-3.5 top-2.5 w-7 h-7 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title={isEn ? "Close" : "Kapat"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kaydırılabilir İçerik Alanı */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3.5 space-y-3.5">
              {/* 1. BÜYÜK GÖRSEL */}
              <div className="relative w-full h-48 sm:h-56 rounded-md overflow-hidden bg-slate-800 border border-slate-700">
                {product.imageUrl && !imgError ? (
                  <Image
                    src={product.imageUrl}
                    alt={displayName}
                    fill
                    sizes="(max-width: 640px) 100vw, 500px"
                    className="object-cover"
                    onError={() => setImgError(true)}
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                    <Coffee className="w-8 h-8 text-slate-600" />
                  </div>
                )}

                {/* Rozet */}
                {product.badge && (
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/90 text-amber-400 border border-slate-700 font-semibold text-[10px] uppercase tracking-wider">
                    {getBadgeLabel(product.badge, language)}
                  </div>
                )}
              </div>

              {/* 2. BAŞLIK, FİYAT & METADATA */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight">
                    {displayName}
                  </h2>
                  <span className="text-xl sm:text-2xl font-extrabold text-amber-400 font-display whitespace-nowrap">
                    ₺{unitPrice.toLocaleString("tr-TR")}
                  </span>
                </div>

                {/* Kalori & Hazırlanma Süresi Rozetleri */}
                <div className="flex items-center gap-2 pt-0.5">
                  {product.calories && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300 tabular-nums">
                      {product.calories} kcal
                    </span>
                  )}
                  {product.prepTimeMinutes && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{product.prepTimeMinutes} {isEn ? "mins" : "dk"}</span>
                    </span>
                  )}
                </div>

                {/* Açıklama */}
                {displayDesc && (
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed pt-1">
                    {displayDesc}
                  </p>
                )}
              </div>

              {/* 3. İÇİNDEKİLER & REÇETE DETAYI */}
              {displayIngredients.length > 0 && (
                <div className="rounded-md bg-slate-950 border border-slate-800 p-3 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-300">
                    <span>{t("ingredients", language)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {displayIngredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs text-slate-200"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. ALERJEN BİLGİLENDİRME KUTUSU */}
              {product.allergens && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2.5 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-amber-300">
                      {t("allergens", language)}:
                    </strong>{" "}
                    <span>
                      {product.allergens}
                    </span>
                  </div>
                </div>
              )}

              {/* 4. VARYANT / EKSTRA SEÇENEKLERİ (Süt, Şurup vb.) */}
              {product.extraGroups && product.extraGroups.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                    {isEn ? "Customize Your Order" : "Siparişinizi Özelleştirin"}
                  </h3>

                  {product.extraGroups.map((group) => (
                    <div
                      key={group.id}
                      className="rounded-2xl bg-stone-900/80 border border-stone-800 p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-200">
                          {isEn && group.titleEn ? group.titleEn : group.title}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {group.isRequired
                            ? isEn ? "Required" : "Zorunlu"
                            : group.maxSelect > 1
                            ? isEn ? `Max ${group.maxSelect}` : `Maks ${group.maxSelect}`
                            : isEn ? "Optional" : "İsteğe Bağlı"}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {group.options.map((opt) => {
                          const isOptSelected = localSelectedOptions.some(
                            (o) => o.optionId === opt.id
                          );
                          const optName = isEn && opt.nameEn ? opt.nameEn : opt.name;

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                handleToggleOption(
                                  group.id,
                                  group.title,
                                  opt,
                                  group.maxSelect,
                                  group.isRequired
                                )
                              }
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                                isOptSelected
                                  ? "bg-amber-500/15 border border-amber-500/40 text-amber-200 font-semibold"
                                  : "bg-stone-900/50 hover:bg-stone-800/80 border border-stone-800 text-stone-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isOptSelected
                                      ? "border-amber-400 bg-amber-500 text-stone-950"
                                      : "border-stone-600"
                                  }`}
                                >
                                  {isOptSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                                <span>{optName}</span>
                              </div>

                              <span className="font-medium text-stone-400">
                                {opt.price > 0 ? `+₺${opt.price}` : isEn ? "Free" : "Ücretsiz"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. ÇAPRAZ SATIŞ ÖNERİLERİ */}
              {crossSellSuggestions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-300">
                      <span>{isEn ? "Recommended with this" : "Birlikte İyi Gider"}</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {crossSellSuggestions.slice(0, 2).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (onSelectProduct) {
                            onSelectProduct(item);
                          }
                        }}
                        className="group flex flex-col p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors"
                      >
                        <div className="relative w-full h-16 rounded overflow-hidden mb-1.5 bg-slate-800">
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="120px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-200 line-clamp-1">
                          {isEn && item.nameEn ? item.nameEn : item.name}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-400 mt-0.5 tabular-nums">
                          ₺{item.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ALT SABİT AKSİYON: MİKTAR & SİPARİŞE EKLE BUTONU */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex flex-col gap-2">
              {validationError && (
                <div className="flex items-center gap-1.5 p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {isCatalogOnly ? (
                  <div className="w-full flex items-center justify-between p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <span className="text-slate-400">
                      {isEn ? "Digital Catalog (Order via waiter)" : "Görsel Menü (Sipariş için garsona iletin)"}
                    </span>
                    <span className="font-bold text-amber-400 tabular-nums text-sm">
                      ₺{unitPrice.toLocaleString("tr-TR")}
                    </span>
                  </div>
                ) : product.isAvailable ? (
                  <>
                    <div className="flex items-center gap-1.5 rounded bg-slate-900 border border-slate-800 p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs text-white tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded font-semibold text-xs transition-colors ${
                        addedToast
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-600 hover:bg-amber-500 text-slate-950"
                      }`}
                    >
                      {addedToast ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>✓</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t("addToCart", language)}</span>
                          <span className="font-bold tabular-nums">
                            • ₺{totalPrice.toLocaleString("tr-TR")}
                          </span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded font-medium text-xs bg-slate-900 border border-slate-800 text-slate-400">
                    <Ban className="w-4 h-4 text-rose-400" />
                    <span>{t("outOfStock", language)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

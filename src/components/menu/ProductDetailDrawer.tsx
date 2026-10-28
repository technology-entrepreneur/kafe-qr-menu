"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Sparkles,
  Flame,
  Check,
  AlertTriangle,
  Clock,
  Heart,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { ProductItem, Language, SelectedExtraOption } from "@/types/menu";
import { useMenuStore } from "@/lib/store";
import { calculateItemUnitPrice, calculateLineTotal } from "@/lib/cartMath";

interface ProductDetailDrawerProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  allProducts?: ProductItem[];
  onSelectProduct?: (product: ProductItem) => void;
}

export default function ProductDetailDrawer({
  product,
  isOpen,
  onClose,
  language,
  allProducts = [],
  onSelectProduct,
}: ProductDetailDrawerProps) {
  const isEn = language === "en";
  const [quantity, setQuantity] = useState(1);
  const [localSelectedOptions, setLocalSelectedOptions] = useState<SelectedExtraOption[]>([]);
  const [addedToast, setAddedToast] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { addToCart } = useMenuStore();

  // Ürün değiştiğinde zorunlu seçenekleri varsayılan olarak seç
  React.useEffect(() => {
    setImgError(false);
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
    product && isEn && product.nameEn ? product.nameEn : product?.name || "";
  const displayDesc =
    product && isEn && product.descriptionEn
      ? product.descriptionEn
      : product?.description || "";
  const displayIngredients =
    product && isEn && product.ingredientsEn && product.ingredientsEn.length > 0
      ? product.ingredientsEn
      : product?.ingredients || [];

  // Seçenek seç/kaldır
  const handleToggleOption = (
    groupId: string,
    groupTitle: string,
    option: { id: string; name: string; price: number },
    maxSelect: number
  ) => {
    const isSelected = localSelectedOptions.some((o) => o.optionId === option.id);

    if (isSelected) {
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
    setIsAdding(true);

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

  // Çapraz satış önerileri (Aynı kategoriden veya popüler 2 ürün)
  const crossSellSuggestions = product
    ? allProducts.filter((p) => p.id !== product.id && p.isAvailable).slice(0, 3)
    : [];

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          {/* Karartma Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
          />

          {/* Çekmece Gövdesi (Bottom Sheet) */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto max-h-[92vh] flex flex-col rounded-t-[32px] bg-[#0c0a09] border-t border-stone-800 text-stone-100 shadow-2xl overflow-hidden"
          >
            {/* Üst Çekme Çubuğu & Kapatma Butonu */}
            <div className="relative pt-3 pb-2 flex items-center justify-center border-b border-stone-800/60 flex-shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-stone-700/80" />
              <button
                onClick={onClose}
                className="absolute right-4 top-3 w-8 h-8 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                title={isEn ? "Close" : "Kapat"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kaydırılabilir İçerik Alanı */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
              {/* 1. BÜYÜK GÖRSEL */}
              <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shadow-md">
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
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-stone-900 text-stone-500">
                    ☕
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-transparent to-transparent opacity-80" />

                {/* Rozet */}
                {product.badge && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500/90 text-stone-950 font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-md">
                    {product.badge === "chef"
                      ? isEn ? "Chef's Special" : "Şefin Seçimi"
                      : product.badge === "popular"
                      ? isEn ? "Most Popular" : "Çok Satan"
                      : product.badge}
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] font-semibold text-stone-300">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>{product.calories} kcal</span>
                    </span>
                  )}
                  {product.prepTimeMinutes && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] font-semibold text-stone-300">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
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

              {/* 3. İÇİNDEKİLER & REÇETE DETAYI (Tüm Ürünlerde Görünür) */}
              {displayIngredients.length > 0 && (
                <div className="rounded-2xl bg-stone-900/80 border border-stone-800/90 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isEn ? "Ingredients & What's Inside" : "İçindekiler & Reçete Detayı"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {displayIngredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-800/90 border border-stone-700/60 text-xs font-medium text-stone-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <span>{ing}</span>
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
                      {isEn ? "Allergen Advisory:" : "Alerjen Uyarısı:"}
                    </strong>{" "}
                    <span>
                      {isEn && product.allergensEn
                        ? product.allergensEn
                        : product.allergens}
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
                                  group.maxSelect
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

              {/* 5. "BUNUNLA HARİKA GİDER" ÇAPRAZ SATIŞ ÖNERİLERİ */}
              {crossSellSuggestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isEn ? "Pairs Perfectly With" : "Bununla Harika Gider"}</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {crossSellSuggestions.slice(0, 2).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (onSelectProduct) {
                            onSelectProduct(item);
                          }
                        }}
                        className="group flex flex-col p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 text-left transition-all"
                      >
                        <div className="relative w-full h-20 rounded-lg overflow-hidden mb-2 bg-stone-800">
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="120px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                        </div>
                        <span className="text-xs font-bold text-stone-200 line-clamp-1 group-hover:text-amber-300">
                          {isEn && item.nameEn ? item.nameEn : item.name}
                        </span>
                        <span className="text-[11px] font-bold text-amber-400 mt-1">
                          ₺{item.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ==================================================== */}
            {/* ALT SABİT AKSİYON: MİKTAR & SİPARİŞE EKLE BUTONU     */}
            {/* ==================================================== */}
            <div className="p-4 border-t border-stone-800 bg-[#0c0a09]/95 backdrop-blur-md flex items-center gap-3">
              {/* Miktar Seçici (- 1 +) */}
              <div className="flex items-center gap-2 rounded-2xl bg-stone-900 border border-stone-800 p-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-sm text-stone-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Siparişe Ekle / Onayla Butonu */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm shadow-xl transition-all duration-300 ${
                  addedToast
                    ? "bg-emerald-500 text-stone-950 shadow-emerald-500/25"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/20"
                }`}
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isEn ? "Added to Order!" : "Siparişe Eklendi!"}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                    <span>{isEn ? "Add to Order" : "Siparişe Ekle"}</span>
                    <span className="font-extrabold tracking-tight">
                      • ₺{totalPrice.toLocaleString("tr-TR")}
                    </span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

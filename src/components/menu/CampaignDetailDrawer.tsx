"use client";

import React, { useState } from "react";
import { X, Tag, ShoppingBag, Check } from "lucide-react";
import { CampaignItem, CartItem, Language, ProductItem } from "@/types/menu";
import { useMenuStore } from "@/lib/store";
import { localizeCampaign, t } from "@/lib/translations";

interface CampaignDetailDrawerProps {
  campaign: CampaignItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: CartItem) => void;
  language?: Language;
  isCatalogOnly?: boolean;
}

export default function CampaignDetailDrawer({
  campaign,
  isOpen,
  onClose,
  onAddToCart,
  language = "tr",
  isCatalogOnly = false,
}: CampaignDetailDrawerProps) {
  const isEn = language === "en";
  const [added, setAdded] = useState(false);
  const storeAddToCart = useMenuStore((s) => s.addToCart);
  const storeSetIsCartOpen = useMenuStore((s) => s.setIsCartOpen);

  if (!isOpen || !campaign) return null;

  const localizedCamp = localizeCampaign(campaign, language) || campaign;
  const price = campaign.discountedPrice ?? campaign.originalPrice;
  const originalPrice = campaign.originalPrice;
  const hasDiscount = originalPrice && price && originalPrice > price;
  const hasSpecificPrice = typeof price === "number" && price > 0;

  const handleAddDealToCart = () => {
    if (!hasSpecificPrice) return;

    const pseudoProduct: ProductItem = {
      id: `camp_${campaign.id}`,
      name: localizedCamp.title,
      price: price!,
      categoryId: "deals",
      order: 0,
      allergens: null,
      isAvailable: true,
      imageUrl: campaign.imageUrl,
      description: localizedCamp.subtitle,
      badge: "deal",
    };

    if (onAddToCart) {
      const cartItem: CartItem = {
        product: pseudoProduct,
        quantity: 1,
        selectedOptions: [],
        totalPrice: price!,
      };
      onAddToCart(cartItem);
    } else {
      storeAddToCart(pseudoProduct, [], 1);
    }

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
      storeSetIsCartOpen(true);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60"
      />

      <div className="relative w-full max-w-sm rounded-lg bg-slate-900 border border-slate-800 text-slate-100 shadow-xl overflow-hidden z-10 font-sans">
        {/* Görsel Alanı */}
        <div className="relative w-full h-44 bg-slate-800">
          {campaign.imageUrl ? (
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
              <Tag className="w-8 h-8 text-slate-600" />
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title={isEn ? "Close" : "Kapat"}
          >
            <X className="w-4 h-4" />
          </button>

          {localizedCamp.badgeText && (
            <div className="absolute top-2.5 left-2.5 z-20">
              <span className="rounded bg-amber-500 text-slate-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {localizedCamp.badgeText}
              </span>
            </div>
          )}
        </div>

        {/* İçerik */}
        <div className="p-4 space-y-3">
          <div>
            <h2 className="text-base font-bold text-white">
              {localizedCamp.title}
            </h2>
            {localizedCamp.subtitle && (
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {localizedCamp.subtitle}
              </p>
            )}
          </div>

          {hasSpecificPrice ? (
            <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">
                  {isEn ? "Price" : "Fiyat"}
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-lg font-bold text-amber-400 tabular-nums">
                    ₺{price!.toFixed(0)}
                  </span>
                  {originalPrice && originalPrice > price! && (
                    <span className="text-xs text-slate-500 line-through tabular-nums">
                      ₺{originalPrice.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>

              {hasDiscount && (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  %{Math.round(((originalPrice! - price!) / originalPrice!) * 100)} İndirim
                </span>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-400">
              {isEn
                ? "This offer applies to selected menu items."
                : "Bu fırsat menüdeki ilgili ürünlerde geçerlidir."}
            </div>
          )}

          {isCatalogOnly ? (
            <div className="w-full flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400">
                {isEn ? "Digital Catalog (Order via waiter)" : "Görsel Menü (Sipariş için garsona iletin)"}
              </span>
              {hasSpecificPrice && (
                <span className="font-bold text-amber-400 tabular-nums text-sm">
                  ₺{price!.toFixed(0)}
                </span>
              )}
            </div>
          ) : hasSpecificPrice ? (
            <button
              type="button"
              onClick={handleAddDealToCart}
              disabled={added}
              className="w-full py-2.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isEn ? "Added!" : "Sepete Eklendi!"}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {isEn
                      ? `Add to Cart (₺${price!.toFixed(0)})`
                      : `Sepete Ekle (₺${price!.toFixed(0)})`}
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              <span>{isEn ? "Browse Menu" : "Menüyü İncele"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

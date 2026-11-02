"use client";

import { motion } from "framer-motion";
import { Sparkles, Flame, ArrowRight } from "lucide-react";
import { CampaignItem, Language } from "@/types/menu";

interface CampaignSliderProps {
  campaigns: CampaignItem[];
  onSelectCampaign?: (campaign: CampaignItem) => void;
  language?: Language;
}

export default function CampaignSlider({
  campaigns,
  onSelectCampaign,
  language = "tr",
}: CampaignSliderProps) {
  const isEn = language === "en";
  const activeCampaigns = (campaigns || []).filter((c) => c.isActive);

  if (activeCampaigns.length === 0) return null;

  const isSingle = activeCampaigns.length === 1;

  return (
    <div className="w-full space-y-2 pt-0.5 pb-2">
      {/* Başlık & Kaydır Göstergesi */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-400">
          <Flame className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
          <span>
            {isEn
              ? `Daily Deals & Combos (${activeCampaigns.length})`
              : `Günün Fırsatları & Kampanyalar (${activeCampaigns.length})`}
          </span>
        </div>
        {!isSingle && (
          <span className="text-[10px] text-stone-400 font-medium">
            {isEn ? "Swipe →" : "Kaydırın →"}
          </span>
        )}
      </div>

      {/* Yatay Kaydırılabilir Kartlar */}
      <div
        className={`no-scrollbar flex items-stretch gap-3 pb-1 -mx-4 px-4 scroll-smooth ${
          isSingle ? "" : "overflow-x-auto snap-x snap-mandatory"
        }`}
      >
        {activeCampaigns.map((camp) => (
          <motion.div
            key={camp.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCampaign && onSelectCampaign(camp)}
            className={`group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white shadow-xl border border-stone-800/90 hover:border-amber-500/50 transition-all ${
              isSingle ? "w-full" : "w-[85%] sm:w-[320px] snap-center"
            }`}
          >
            {/* Arka Plan Görseli & Gradyan Karartması */}
            {camp.imageUrl && (
              <div className="absolute inset-0">
                <img
                  src={camp.imageUrl}
                  alt={camp.title}
                  className="h-full w-full object-cover opacity-35 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/75 to-stone-950/20" />
              </div>
            )}

            {/* İçerik */}
            <div className="relative z-10 flex h-full flex-col justify-between p-3.5 sm:p-4 min-h-[145px]">
              <div>
                {/* Rozet */}
                {camp.badgeText && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-stone-950 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md shadow-amber-500/20">
                    <Sparkles className="h-3 w-3" />
                    {camp.badgeText}
                  </span>
                )}

                <h3 className="mt-2 text-sm sm:text-base font-extrabold font-display leading-tight text-white group-hover:text-amber-300 transition-colors">
                  {camp.title}
                </h3>

                {camp.subtitle && (
                  <p className="mt-1 text-xs text-stone-300/90 line-clamp-2 leading-relaxed">
                    {camp.subtitle}
                  </p>
                )}
              </div>

              {/* Alt Fiyat ve Fırsat Butonu */}
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
                <div className="flex items-baseline gap-2">
                  {camp.discountedPrice ? (
                    <>
                      <span className="text-base sm:text-lg font-black font-display text-amber-400">
                        ₺{camp.discountedPrice.toFixed(0)}
                      </span>
                      {camp.originalPrice && (
                        <span className="text-xs text-stone-500 line-through">
                          ₺{camp.originalPrice.toFixed(0)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs font-bold text-amber-400">
                      {isEn ? "Special Combo Deal" : "Özel Menü Fırsatı"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white group-hover:bg-amber-500 group-hover:text-stone-950 transition-all">
                  <span>{isEn ? "View Deal" : "Fırsatı Gör"}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

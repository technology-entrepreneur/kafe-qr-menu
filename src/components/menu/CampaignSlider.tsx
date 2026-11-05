"use client";

import React from "react";
import { ArrowRight, Tag } from "lucide-react";
import { CampaignItem, Language } from "@/types/menu";
import { localizeCampaign, t } from "@/lib/translations";

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
  const activeCampaigns = (campaigns || []).filter((c) => c.isActive);

  if (activeCampaigns.length === 0) return null;

  const isSingle = activeCampaigns.length === 1;

  return (
    <div className="w-full space-y-2 pt-1 pb-1">
      {/* Başlık */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Tag className="h-3.5 w-3.5 text-amber-500" />
          <span>
            {t("specialOffers", language)} ({activeCampaigns.length})
          </span>
        </div>
        {!isSingle && (
          <span className="text-[10px] text-slate-500">
            {t("scroll", language)}
          </span>
        )}
      </div>

      {/* Yatay Kaydırılabilir Kartlar */}
      <div
        className={`no-scrollbar flex items-stretch gap-2.5 pb-1 -mx-4 px-4 scroll-smooth ${
          isSingle ? "" : "overflow-x-auto snap-x snap-mandatory"
        }`}
      >
        {activeCampaigns.map((rawCamp) => {
          const camp = localizeCampaign(rawCamp, language) || rawCamp;
          return (
            <div
              key={camp.id}
              onClick={() => onSelectCampaign && onSelectCampaign(camp)}
              className={`group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-slate-900 text-white border border-slate-800 hover:border-slate-700 transition-colors ${
                isSingle ? "w-full" : "w-[85%] sm:w-[320px] snap-center"
              }`}
            >
              {camp.imageUrl && (
                <div className="absolute inset-0">
                  <img
                    src={camp.imageUrl}
                    alt={camp.title}
                    className="h-full w-full object-cover opacity-25"
                  />
                  <div className="absolute inset-0 bg-slate-950/70" />
                </div>
              )}

              <div className="relative z-10 flex h-full flex-col justify-between p-3.5 min-h-[130px]">
                <div>
                  {camp.badgeText && (
                    <span className="inline-block rounded bg-amber-500 text-slate-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {camp.badgeText}
                    </span>
                  )}

                  <h3 className="mt-1.5 text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                    {camp.title}
                  </h3>

                  {camp.subtitle && (
                    <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">
                      {camp.subtitle}
                    </p>
                  )}
                </div>

                {/* Alt Fiyat */}
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-800 pt-2">
                  <div className="flex items-baseline gap-2">
                    {camp.discountedPrice ? (
                      <>
                        <span className="text-sm font-bold text-amber-400 tabular-nums">
                          ₺{camp.discountedPrice.toFixed(0)}
                        </span>
                        {camp.originalPrice && (
                          <span className="text-xs text-slate-500 line-through tabular-nums">
                            ₺{camp.originalPrice.toFixed(0)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-slate-300">
                        {t("specialOffers", language)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors">
                    <span>{t("viewDeal", language)}</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

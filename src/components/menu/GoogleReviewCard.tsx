"use client";

import React from "react";
import { Star, ExternalLink, MessageSquare } from "lucide-react";
import { Language } from "@/types/menu";
import { t } from "@/lib/translations";

interface GoogleReviewCardProps {
  reviewUrl: string | null;
  cafeName: string;
  language?: Language;
}

export default function GoogleReviewCard({
  reviewUrl,
  cafeName,
  language = "tr",
}: GoogleReviewCardProps) {
  const targetUrl = reviewUrl || "https://maps.google.com";

  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
            <span className="ml-1 text-xs font-semibold text-slate-300 tabular-nums">4.9 / 5</span>
          </div>

          <h3 className="mt-1.5 text-sm font-semibold text-white">
            {t("reviewTitle", language)}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400 max-w-sm">
            {t("reviewDesc", language)}
          </p>
        </div>

        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{t("reviewBtn", language)}</span>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </a>
      </div>
    </div>
  );
}

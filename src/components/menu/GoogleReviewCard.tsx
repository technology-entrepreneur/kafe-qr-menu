"use client";

import { Star, MessageSquareHeart, ExternalLink, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { triggerGoldenConfetti } from "@/lib/confetti";

import { Language } from "@/types/menu";

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
  const isEn = language === "en";
  const targetUrl = reviewUrl || "https://maps.google.com";

  const handleReviewClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    triggerGoldenConfetti(x, y);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-6 text-white shadow-xl shadow-amber-500/10 dark:shadow-none"
    >
      {/* Arka plan dekoratif daire */}
      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {/* 5 Yıldız */}
          <div className="flex items-center gap-1 text-amber-200">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-300 text-amber-300" />
            ))}
            <span className="ml-1 text-xs font-semibold text-white/90">5.0 / 5</span>
          </div>

          <h3 className="mt-2 text-lg font-bold font-display leading-tight text-white">
            {isEn ? "Loved your experience?" : "Deneyiminizi sevdiniz mi?"}
          </h3>
          <p className="mt-1 text-xs text-amber-100/90 leading-relaxed max-w-sm">
            {isEn
              ? `Support ${cafeName} by sharing your feedback and star rating on Google Maps.`
              : `${cafeName} kahveleri ve lezzetleri hakkındaki değerli görüşlerinizi Google'da paylaşarak bize destek olabilirsiniz.`}
          </p>
        </div>

        {/* Buton */}
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleReviewClick}
          className="flex-shrink-0 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-amber-900 shadow-md hover:bg-amber-50 active:scale-95 transition-all"
        >
          <MessageSquareHeart className="h-4 w-4 text-amber-600" />
          <span>{isEn ? "Rate on Google" : "Google'da Değerlendir"}</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-60" />
        </a>
      </div>
    </motion.div>
  );
}

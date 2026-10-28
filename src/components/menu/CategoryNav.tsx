"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CategoryItem, Language } from "@/types/menu";

interface CategoryNavProps {
  categories: CategoryItem[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  language: Language;
}

export default function CategoryNav({
  categories,
  activeCategoryId,
  onSelectCategory,
  language,
}: CategoryNavProps) {
  const isEn = language === "en";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Aktif sekme değiştiğinde, onu yatay barda ortalayacak şekilde kaydır
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const tab = activeTabRef.current;

      const containerWidth = container.offsetWidth;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;

      const targetScrollLeft = tabLeft - containerWidth / 2 + tabWidth / 2;

      container.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    }
  }, [activeCategoryId]);

  if (!categories || categories.length === 0) return null;

  return (
    <nav className="w-full pb-2.5 pt-1 overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 max-w-2xl mx-auto scroll-smooth touch-pan-x select-none"
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          const displayName = isEn && category.nameEn ? category.nameEn : category.name;
          const count = category.products?.length || 0;

          return (
            <button
              key={category.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => onSelectCategory(category.id)}
              className={`relative flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0 cursor-pointer select-none ${
                isActive
                  ? "text-stone-950 shadow-lg shadow-amber-500/25"
                  : "bg-stone-900/90 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800/90"
              }`}
            >
              {/* Aktif Pill Animasyonlu Zemin (Spring Physics) */}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full z-0"
                />
              )}

              {/* İkon */}
              {category.icon && (
                <span className="relative z-10 text-sm leading-none">
                  {category.icon}
                </span>
              )}

              {/* Kategori Adı */}
              <span className="relative z-10">{displayName}</span>

              {/* Ürün Sayısı Rozeti */}
              <span
                className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                  isActive
                    ? "bg-stone-950/25 text-stone-950"
                    : "bg-stone-800 text-stone-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

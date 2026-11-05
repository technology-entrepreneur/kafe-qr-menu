"use client";

import React, { useRef, useEffect } from "react";
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
    <nav className="w-full py-1.5 border-t border-stone-800/60">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-4 max-w-2xl mx-auto scroll-smooth select-none py-0.5"
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          const displayName = language === "tr" ? category.name : (category.nameEn || category.name);
          const count = category.products?.length || 0;

          return (
            <button
              key={category.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => onSelectCategory(category.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                isActive
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm shadow-amber-500/10"
                  : "bg-stone-900/90 text-stone-400 hover:text-stone-200 border border-stone-800 hover:border-stone-700"
              }`}
            >
              <span>{displayName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums font-semibold ${
                  isActive
                    ? "bg-amber-500/30 text-amber-200"
                    : "bg-stone-800 text-stone-500"
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

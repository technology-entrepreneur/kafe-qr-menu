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
    <nav className="w-full py-2 bg-slate-950 border-b border-slate-800">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-4 max-w-2xl mx-auto scroll-smooth select-none"
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer ${
                isActive
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>{displayName}</span>
              <span
                className={`text-[10px] px-1 rounded tabular-nums ${
                  isActive
                    ? "bg-slate-700 text-slate-200"
                    : "bg-slate-800 text-slate-500"
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

"use client";

import { useEffect, useRef } from "react";
import { CategoryItem } from "@/lib/types";

interface CategoryTabsProps {
  categories: CategoryItem[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Aktif sekme değiştikçe yatayda görünür alana merkezle
  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      const container = containerRef.current;
      const tab = activeTabRef.current;

      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;
      const containerWidth = container.offsetWidth;

      container.scrollTo({
        left: tabLeft - containerWidth / 2 + tabWidth / 2,
        behavior: "smooth",
      });
    }
  }, [activeCategoryId]);

  return (
    <div className="sticky top-0 z-30 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div
        ref={containerRef}
        className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-2.5 max-w-xl mx-auto"
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          return (
            <button
              key={category.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => onSelectCategory(category.id)}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 shadow-md scale-105"
                  : "bg-stone-100 text-stone-600 dark:bg-stone-800/80 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

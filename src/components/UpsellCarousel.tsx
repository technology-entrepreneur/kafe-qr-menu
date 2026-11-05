'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Wine,
  UtensilsCrossed,
} from 'lucide-react';
import { RecommendationResult } from '@/app/api/upsell/route';

export interface CartInputItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  categoryId?: string;
  categoryName?: string;
}

export interface UpsellCarouselProps {
  cartItems: CartInputItem[];
  onAddToCart: (item: RecommendationResult) => Promise<void> | void;
  currencySymbol?: string;
  language?: 'tr' | 'en';
  timeOfDay?: 'breakfast' | 'lunch' | 'dinner' | 'late_night';
  title?: string;
  className?: string;
}

export function UpsellCarousel({
  cartItems,
  onAddToCart,
  currencySymbol = '₺',
  language = 'tr',
  timeOfDay,
  title,
  className = '',
}: UpsellCarouselProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousCartIdsRef = useRef<string>('');

  // 1. Debounced fetch to react to real-time cart mutations without request flooding
  const fetchRecommendations = useCallback(async () => {
    if (!cartItems || cartItems.length === 0) {
      setRecommendations([]);
      return;
    }

    // Compare cart item IDs to avoid redundant queries when quantities change slightly
    const currentCartKey = cartItems
      .map((item) => item.id)
      .sort()
      .join(',');

    if (currentCartKey === previousCartIdsRef.current && recommendations.length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          language,
          timeOfDay,
        }),
      });

      if (!response.ok) {
        throw new Error(`Upsell fetch failed with status ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      previousCartIdsRef.current = currentCartKey;
    } catch (err) {
      console.error('[UpsellCarousel] Error fetching recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cartItems, language, timeOfDay, recommendations.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 450); // 450ms debounce

    return () => clearTimeout(timer);
  }, [fetchRecommendations]);

  // Handle 1-Tap Quick Add with feedback animation
  const handleQuickAdd = async (item: RecommendationResult) => {
    setAddingId(item.id);
    try {
      await onAddToCart(item);
      setAddedIds((prev) => ({ ...prev, [item.id]: true }));
      // Temporarily mark as added, then reset or remove from carousel
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [item.id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to add upsell item to cart:', err);
    } finally {
      setAddingId(null);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // If cart is empty and not loading, hide carousel
  if (cartItems.length === 0 || (!isLoading && recommendations.length === 0)) {
    return null;
  }

  const defaultTitle =
    language === 'tr' ? 'Aura Sommelier & Şef Eşleşmeleri' : "Aura Sommelier & Chef's Pairings";

  return (
    <section className={`w-full py-3 my-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              {title || defaultTitle}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {language === 'tr'
                ? 'Siparişinize özel seçilmiş lezzet tamamlayıcıları'
                : 'Artisanal pairings curated to elevate your order'}
            </p>
          </div>
        </div>

        {/* Desktop Carousel Controls */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
            aria-label="Previous suggestions"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
            aria-label="Next suggestions"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3.5 overflow-x-auto px-4 pb-2 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Loading Skeletons */}
        {isLoading && recommendations.length === 0 && (
          <>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="flex-shrink-0 w-64 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse space-y-2.5"
              >
                <div className="w-full h-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                <div className="w-3/4 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-full h-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-1/2 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              </div>
            ))}
          </>
        )}

        {/* Recommendation Cards */}
        {recommendations.map((item) => {
          const isAdded = !!addedIds[item.id];
          const isAdding = addingId === item.id;

          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-64 snap-start p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image and Badge */}
                <div className="relative w-full h-28 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-2.5">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="256px"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <UtensilsCrossed className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  {/* Pairing Badge Chip */}
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-zinc-900/80 text-white backdrop-blur-md shadow-sm">
                    <Wine className="w-3 h-3 text-amber-400" />
                    {item.pairingBadge}
                  </span>
                </div>

                {/* Name & Category */}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {item.name}
                  </h4>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    {currencySymbol}{item.price.toFixed(2)}
                  </span>
                </div>

                {/* Sommelier Pitch / Reason */}
                <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2 italic mb-3">
                  &ldquo;{item.pairingReason}&rdquo;
                </p>
              </div>

              {/* 1-Tap Add to Cart CTA */}
              <button
                type="button"
                disabled={isAdding || isAdded}
                onClick={() => handleQuickAdd(item)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-sm'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 animate-in zoom-in" />
                    {language === 'tr' ? 'Eklendi' : 'Added!'}
                  </>
                ) : isAdding ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {language === 'tr' ? 'Ekleniyor...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    {language === 'tr' ? 'Masaya Ekle' : '1-Tap Add to Table'}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default UpsellCarousel;


"use client";

import { useState, useEffect } from "react";

/**
 * Performans & CPU Tasarrufu Sağlayan Generic Debounce Hook'u
 * Arama ve filtreleme işlemlerinde klavyeden her harf girildiğinde
 * re-render ve filtreleme döngüsünü 300ms geciktirir.
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Temizleme: Değer değiştiğinde veya bileşen unmount edildiğinde zamanlayıcıyı sıfırla
    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

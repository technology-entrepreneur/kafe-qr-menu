'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Language,
  LanguageConfig,
  SUPPORTED_LANGUAGES,
} from '@/types/menu';
import { CATEGORY_TRANSLATIONS } from '@/lib/translations';

const STORAGE_KEY = 'preferred_menu_lang';

/**
 * Common hospitality UI dictionary across all supported languages
 */
export const UI_TRANSLATIONS: Record<
  string,
  Record<Language, string>
> = {
  welcome: {
    tr: 'Hoş Geldiniz',
    en: 'Welcome',
    ar: 'أهلاً بكم',
    ru: 'Добро пожаловать',
    de: 'Herzlich Willkommen',
  },
  menu: {
    tr: 'Menü',
    en: 'Menu',
    ar: 'القائمة',
    ru: 'Меню',
    de: 'Speisekarte',
  },
  table: {
    tr: 'Masa',
    en: 'Table',
    ar: 'طاولة',
    ru: 'Стол',
    de: 'Tisch',
  },
  cart: {
    tr: 'Sepetim',
    en: 'My Cart',
    ar: 'السلة',
    ru: 'Корзина',
    de: 'Warenkorb',
  },
  addToCart: {
    tr: 'Masaya Ekle',
    en: 'Add to Table',
    ar: 'أضف إلى الطاولة',
    ru: 'Добавить к столу',
    de: 'Zum Tisch hinzufügen',
  },
  callWaiter: {
    tr: 'Garson Çağır',
    en: 'Call Waiter',
    ar: 'طلب النادل',
    ru: 'Позвать официанта',
    de: 'Kellner rufen',
  },
  requestBill: {
    tr: 'Hesap İste',
    en: 'Request Bill',
    ar: 'طلب الحساب',
    ru: 'Счёт',
    de: 'Rechnung bitte',
  },
  splitBill: {
    tr: 'Hesabı Bölüş',
    en: 'Split Bill',
    ar: 'تقسيم الحساب',
    ru: 'Разделить счёт',
    de: 'Rechnung teilen',
  },
  askAura: {
    tr: "Aura'ya Sor (Sommelier & Rehber)",
    en: 'Ask Aura (AI Sommelier & Host)',
    ar: 'اسأل أورا (المساعد الذكي)',
    ru: 'Спросить Aura (AI сомелье)',
    de: 'Frag Aura (KI-Sommelier)',
  },
  chefPairing: {
    tr: 'Şefin Eşleşme Önerisi',
    en: "Chef's Recommended Pairing",
    ar: 'اقتراح الشيف المتكامل',
    ru: 'Рекомендация шефа',
    de: 'Empfehlung des Küchenchefs',
  },
  allergens: {
    tr: 'Alerjenler',
    en: 'Allergens',
    ar: 'مسببات الحساسية',
    ru: 'Аллергены',
    de: 'Allergene',
  },
  dietaryTags: {
    tr: 'Beslenme Tercihleri',
    en: 'Dietary Preferences',
    ar: 'التفضيلات الغذائية',
    ru: 'Диетические предпочтения',
    de: 'Ernährungspräferenzen',
  },
};

/**
 * Universal Allergen Dictionary for Instant Translation
 */
export const ALLERGEN_DICTIONARY: Record<string, Record<Language, string>> = {
  gluten: {
    tr: 'Gluten',
    en: 'Gluten',
    ar: 'جلوتين',
    ru: 'Глютен',
    de: 'Gluten',
  },
  süt: {
    tr: 'Süt / Laktoz',
    en: 'Milk / Dairy (Lactose)',
    ar: 'حليب / لاكتوز',
    ru: 'Молоко / Лактоза',
    de: 'Milch / Laktose',
  },
  milk: {
    tr: 'Süt / Laktoz',
    en: 'Milk / Dairy (Lactose)',
    ar: 'حليب / لاكتوز',
    ru: 'Молоко / Лактоза',
    de: 'Milch / Laktose',
  },
  yumurta: {
    tr: 'Yumurta',
    en: 'Egg',
    ar: 'بيض',
    ru: 'Яйцо',
    de: 'Ei',
  },
  egg: {
    tr: 'Yumurta',
    en: 'Egg',
    ar: 'بيض',
    ru: 'Яйцо',
    de: 'Ei',
  },
  fındık: {
    tr: 'Kuruyemiş / Fındık',
    en: 'Tree Nuts / Hazelnuts',
    ar: 'مكسرات / بندق',
    ru: 'Орехи / Фундук',
    de: 'Schalenfrüchte / Haselnüsse',
  },
  nuts: {
    tr: 'Kuruyemiş',
    en: 'Tree Nuts',
    ar: 'مكسرات',
    ru: 'Орехи',
    de: 'Schalenfrüchte',
  },
  soya: {
    tr: 'Soya',
    en: 'Soy',
    ar: 'صويا',
    ru: 'Соя',
    de: 'Soja',
  },
  balık: {
    tr: 'Balık',
    en: 'Fish',
    ar: 'سمك',
    ru: 'Рыба',
    de: 'Fisch',
  },
  susam: {
    tr: 'Susam',
    en: 'Sesame',
    ar: 'سمسم',
    ru: 'Кунжут',
    de: 'Sesam',
  },
};

/**
 * Helper: Detect diner's device language or stored preference
 */
function detectDeviceLanguage(): Language {
  if (typeof window === 'undefined') return 'tr';

  // 1. Check local storage override
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved && SUPPORTED_LANGUAGES.some((lang) => lang.code === saved)) {
      return saved;
    }
  } catch {}

  // 2. Detect navigator browser language
  try {
    const browserLang = (navigator.languages?.[0] || navigator.language || '').toLowerCase();
    
    if (browserLang.startsWith('tr')) return 'tr';
    if (browserLang.startsWith('en')) return 'en';
    if (browserLang.startsWith('ar')) return 'ar';
    if (browserLang.startsWith('ru')) return 'ru';
    if (browserLang.startsWith('de')) return 'de';
  } catch {}

  return 'tr';
}

export function useLocalization() {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>('tr');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize on client mount
  useEffect(() => {
    const detected = detectDeviceLanguage();
    setCurrentLanguageState(detected);
    setIsInitialized(true);

    // Apply HTML dir and lang attributes
    const config = SUPPORTED_LANGUAGES.find((l) => l.code === detected);
    if (config) {
      document.documentElement.lang = detected;
      document.documentElement.dir = config.dir;
    }
  }, []);

  // Language switcher action
  const setLanguage = useCallback((lang: Language) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}

    const config = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    if (config) {
      document.documentElement.lang = lang;
      document.documentElement.dir = config.dir;
    }
  }, []);

  const languageConfig = useMemo(() => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
      SUPPORTED_LANGUAGES[0]
    );
  }, [currentLanguage]);

  const isRTL = languageConfig.dir === 'rtl';

  /**
   * Translates UI key
   */
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const entry = UI_TRANSLATIONS[key];
      if (entry && entry[currentLanguage]) {
        return entry[currentLanguage];
      }
      return fallback || key;
    },
    [currentLanguage]
  );

  /**
   * Translates category name dynamically
   */
  const translateCategory = useCallback(
    (categoryName: string): string => {
      if (!categoryName) return '';
      const match = CATEGORY_TRANSLATIONS[categoryName];
      if (match && match[currentLanguage]) {
        return match[currentLanguage];
      }
      return categoryName;
    },
    [currentLanguage]
  );

  /**
   * Dynamically translates any database product into the active language
   */
  const translateProduct = useCallback(
    <
      T extends {
        name: string;
        nameEn?: string | null;
        description?: string | null;
        descriptionEn?: string | null;
        allergens?: string | null;
        allergensEn?: string | null;
        dietary?: string | null;
      }
    >(
      product: T
    ): T & {
      displayName: string;
      displayDescription: string;
      displayAllergens: string;
      displayDietary: string[];
    } => {
      // 1. Name translation
      let displayName = product.name;
      if (currentLanguage === 'en' && product.nameEn) {
        displayName = product.nameEn;
      }

      // 2. Description translation
      let displayDescription = product.description || '';
      if (currentLanguage === 'en' && product.descriptionEn) {
        displayDescription = product.descriptionEn;
      }

      // 3. Allergens translation
      let displayAllergens = product.allergens || '';
      if (displayAllergens) {
        const rawTags = displayAllergens.split(/[,;\n]+/).map((s) => s.trim().toLowerCase());
        const translatedTags = rawTags.map((tag) => {
          const dictMatch = ALLERGEN_DICTIONARY[tag];
          if (dictMatch && dictMatch[currentLanguage]) {
            return dictMatch[currentLanguage];
          }
          return tag;
        });
        displayAllergens = translatedTags.join(', ');
      }

      // 4. Dietary tags
      const dietaryTags = (product.dietary || '')
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      return {
        ...product,
        displayName,
        displayDescription,
        displayAllergens,
        displayDietary: dietaryTags,
      };
    },
    [currentLanguage]
  );

  /**
   * AI Assistant Context Packet ready to pass to /api/chat or /api/upsell
   */
  const auraContext = useMemo(() => {
    return {
      language: currentLanguage,
      languageName: languageConfig.name,
      nativeName: languageConfig.nativeName,
      dir: languageConfig.dir,
      mandate: `Automatically respond in the diner's detected language (${languageConfig.name} - ${currentLanguage}) with high culinary precision and local gastronomic terminology.`,
    };
  }, [currentLanguage, languageConfig]);

  return {
    currentLanguage,
    languageConfig,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isRTL,
    isInitialized,
    setLanguage,
    t,
    translateCategory,
    translateProduct,
    auraContext,
  };
}

export default useLocalization;


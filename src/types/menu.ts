/**
 * qrmenum.app / Modern Restoran Standardı Menü Tip Tanımları
 */

export type DietaryTag =
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "lactose-free"
  | "nut-free"
  | "sugar-free"
  | "organic"
  | "halal";

export interface AllergenInfo {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
}

export interface ProductExtraOptionItem {
  id: string;
  groupId: string;
  name: string;
  nameEn?: string;
  price: number;
  order: number;
}

export interface ProductExtraGroupItem {
  id: string;
  productId: string;
  title: string;
  titleEn?: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  order: number;
  options: ProductExtraOptionItem[];
}

export interface ProductSuggestionItem {
  id: string;
  productId: string;
  suggestedProductId: string;
  suggestedProduct?: ProductItem;
}

export interface ProductItem {
  id: string;
  name: string;
  nameEn?: string | null;
  description: string | null;
  descriptionEn?: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  allergens: string | null;
  allergensEn?: string | null;
  dietaryTags?: DietaryTag[];
  ingredients?: string[];
  ingredientsEn?: string[];
  calories?: number | null;
  prepTimeMinutes?: number | null;
  badge?: "chef" | "popular" | "deal" | "new" | string | null;
  order: number;
  categoryId: string;
  campaignId?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  category?: CategoryItem;
  extraGroups?: ProductExtraGroupItem[];
  suggestions?: {
    id: string;
    suggestedProductId: string;
    suggestedProduct: ProductItem;
  }[];
}

export interface CategoryItem {
  id: string;
  name: string;
  nameEn?: string | null;
  icon?: string | null;
  order: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  products?: ProductItem[];
}

export interface CampaignItem {
  id: string;
  title: string;
  subtitle: string | null;
  badgeText: string | null;
  imageUrl: string | null;
  originalPrice: number | null;
  discountedPrice: number | null;
  isActive: boolean;
  order: number;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface BusinessSettingsData {
  id: string;
  cafeName: string;
  logoUrl: string | null;
  wifiSsid: string | null;
  wifiPassword: string | null;
  workingHours: string | null;
  phone: string | null;
  address: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  googleReviewUrl: string | null;
  whatsappNumber: string | null;

  // Modüler B2B İşletme Ayarları
  businessType?: "cafe" | "hookah_lounge" | "restaurant" | "bar" | string;
  isCatalogOnly?: boolean;
  hookahMode?: boolean;
  enableWaiterCall?: boolean;
  enableBillRequest?: boolean;
  enableQuickWifiBar?: boolean;
  enableGoogleReviewPrompt?: boolean;
  hookahCoalTimerMinutes?: number;
  hookahCoalCooldownMinutes?: number;
  kdsSlaDurationMinutes?: number;
  updatedAt?: string | Date;
}

export interface SelectedExtraOption {
  groupId: string;
  groupTitle: string;
  optionId: string;
  name: string;
  price: number;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
  selectedOptions: SelectedExtraOption[];
  totalPrice: number;
}

export type Language = "tr" | "en" | "ar" | "ru" | "de";

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: "tr", name: "Türkçe", nativeName: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar", name: "Arapça", nativeName: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "ru", name: "Rusça", nativeName: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "de", name: "Almanca", nativeName: "Deutsch", flag: "🇩🇪", dir: "ltr" },
];

export type ServiceCallType =
  | "waiter"
  | "bill_cash"
  | "bill_card"
  | "bill_split"
  | "hookah_coal";

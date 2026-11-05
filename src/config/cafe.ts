/**
 * Kafe & Karşılama Merkezi Yapılandırma Objesi (Gateway Hub Configuration)
 * 
 * Tüm menü linkleri, Google Review URL'i, Wi-Fi bilgileri,
 * sosyal kanallar ve Awwwards/Linear düzeyindeki görsel mikro metinler
 * tek bir merkezi noktadan yönetilir.
 */

export interface CafeRatingConfig {
  score: number;
  starsCount: number;
  countText: string;
  label: string;
}

export interface CafeWifiConfig {
  ssid: string;
  password: string;
}

export interface CafeSocialsConfig {
  instagram?: string;
  tiktok?: string;
  maps?: string;
  whatsapp?: string;
}

export interface CafeConfig {
  name: string;
  tagline: string;
  welcomeSubtitle: string;
  logoUrl: string;
  tableBadgePrefix: string;
  rating: CafeRatingConfig;
  actions: {
    menu: {
      title: string;
      subtitle: string;
      badgeText: string;
      path: string;
    };
    googleReview: {
      title: string;
      subtitle: string;
      badgeText: string;
      url: string;
    };
  };
  wifi: CafeWifiConfig;
  socials: CafeSocialsConfig;
}

export const defaultCafeConfig: CafeConfig = {
  name: "Gloriouss Café",
  tagline: "Cafe, Restaurant & Lounge",
  welcomeSubtitle: "Siparişinizi masanızdan kolayca verin ve takip edin.",
  logoUrl: "/images/logo.png",
  tableBadgePrefix: "Masa",
  rating: {
    score: 4.9,
    starsCount: 5,
    countText: "500+ Yorum",
    label: "Google Puanı",
  },
  actions: {
    menu: {
      title: "Menüyü İncele",
      subtitle: "Yiyecek, içecek ve tatlı çeşitleri",
      badgeText: "SİPARİŞ",
      path: "/menu",
    },
    googleReview: {
      title: "Google'da Değerlendirin",
      subtitle: "Görüş ve puanınızı paylaşın",
      badgeText: "4.9 Puan",
      url: "https://maps.google.com/?q=Gloriouss+Cafe+Silivri",
    },
  },
  wifi: {
    ssid: "Gloriouss_Guest",
    password: "Gloriouss2026",
  },
  socials: {
    instagram: "https://www.instagram.com/gloriousscafe/",
    tiktok: "https://www.tiktok.com/@gloriousscafe",
    maps: "https://maps.google.com/?q=Gloriouss+Cafe+Silivri",
    whatsapp: "https://wa.me/905551234567",
  },
};

/**
 * Veritabanındaki dinamik BusinessSettings ile config'i birleştirir.
 */
export function getMergedCafeConfig(
  dbSettings?: {
    cafeName?: string | null;
    logoUrl?: string | null;
    wifiSsid?: string | null;
    wifiPassword?: string | null;
    googleReviewUrl?: string | null;
    instagramUrl?: string | null;
    tiktokUrl?: string | null;
  } | null,
  table?: string | null
): CafeConfig {
  const base = { ...defaultCafeConfig };

  if (dbSettings) {
    if (dbSettings.cafeName) base.name = dbSettings.cafeName;
    if (dbSettings.logoUrl) base.logoUrl = dbSettings.logoUrl;
    if (dbSettings.wifiSsid) base.wifi.ssid = dbSettings.wifiSsid;
    if (dbSettings.wifiPassword) base.wifi.password = dbSettings.wifiPassword;
    if (dbSettings.googleReviewUrl) base.actions.googleReview.url = dbSettings.googleReviewUrl;
    if (dbSettings.instagramUrl) base.socials.instagram = dbSettings.instagramUrl;
    if (dbSettings.tiktokUrl) base.socials.tiktok = dbSettings.tiktokUrl;
  }

  // Eğer masa parametresi verilmişse menü linkine de table parametresini iliştir
  if (table) {
    base.actions.menu.path = `/menu?table=${encodeURIComponent(table)}`;
  }

  return base;
}

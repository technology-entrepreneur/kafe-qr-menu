import { prisma } from "./prisma";
import {
  CategoryItem,
  ProductItem,
  BusinessSettingsData,
  CampaignItem,
  ProductExtraGroupItem,
} from "./types";

// ==========================================
// VARSAYILAN KAMPANYALAR (CRO Fırsat Kartları)
// ==========================================
export const initialCampaigns: CampaignItem[] = [
  {
    id: "camp-1",
    title: "Latte + San Sebastian Menüsü",
    subtitle: "Kadifemsi sıcak latte ile akışkan Belçika çikolatalı cheesecake",
    badgeText: "GÜNÜN FIRSATI",
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80",
    originalPrice: 345,
    discountedPrice: 285,
    isActive: true,
    order: 1,
    createdAt: new Date(),
  },
  {
    id: "camp-2",
    title: "Kruvasan & Filtre Kahve İkilisi",
    subtitle: "Güne çıtır Fransız tereyağlı kruvasan ve taze demlenmiş kahveyle başlayın",
    badgeText: "KAHVALTI FIRSATI",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
    originalPrice: 275,
    discountedPrice: 220,
    isActive: true,
    order: 2,
    createdAt: new Date(),
  },
  {
    id: "camp-3",
    title: "2. Soğuk İçecekte %30 İndirim",
    subtitle: "Arkadaşınızla birlikte ferahlayın, 2. Iced Latte veya Cold Brew anında indirimli",
    badgeText: "ÇİFTE KEYİF",
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
    originalPrice: null,
    discountedPrice: null,
    isActive: true,
    order: 3,
    createdAt: new Date(),
  },
];

export const initialCategories: CategoryItem[] = [
  {
    id: "cat-hot",
    name: "Sıcak Kahveler",
    nameEn: "Specialty Hot Coffees",
    icon: "☕",
    order: 1,
    isActive: true,
    products: [
      {
        id: "prod-flat-white",
        name: "Flat White",
        nameEn: "Flat White",
        description: "Çift shot ristretto espresso üzerine mikro köpüklü kadifemsi sıcak süt.",
        descriptionEn: "Double ristretto espresso delicately infused with micro-foamed velvety steamed whole milk.",
        price: 135,
        imageUrl: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        allergens: "Laktoz / Süt",
        calories: 165,
        prepTimeMinutes: 4,
        badge: "popular",
        order: 1,
        categoryId: "cat-hot",
        extraGroups: [
          {
            id: "grp-milk-1",
            productId: "prod-flat-white",
            title: "Süt Tercihi",
            isRequired: false,
            minSelect: 0,
            maxSelect: 1,
            order: 1,
            options: [
              { id: "opt-1", groupId: "grp-milk-1", name: "Tam Yağlı Süt (Standart)", price: 0, order: 1 },
              { id: "opt-2", groupId: "grp-milk-1", name: "Yulaf Sütü (Bitkisel)", price: 25, order: 2 },
              { id: "opt-3", groupId: "grp-milk-1", name: "Laktozsuz Süt", price: 15, order: 3 },
              { id: "opt-4", groupId: "grp-milk-1", name: "Badem Sütü", price: 25, order: 4 },
            ],
          },
          {
            id: "grp-syrup-1",
            productId: "prod-flat-white",
            title: "Ekstra Şurup & Tatlandırıcı",
            isRequired: false,
            minSelect: 0,
            maxSelect: 2,
            order: 2,
            options: [
              { id: "opt-5", groupId: "grp-syrup-1", name: "Vanilya Şurubu", price: 18, order: 1 },
              { id: "opt-6", groupId: "grp-syrup-1", name: "Karamel Şurubu", price: 18, order: 2 },
              { id: "opt-7", groupId: "grp-syrup-1", name: "Fındık Şurubu", price: 18, order: 3 },
            ],
          },
        ],
        suggestions: [
          {
            id: "sug-1",
            suggestedProductId: "prod-cheesecake",
            suggestedProduct: {
              id: "prod-cheesecake",
              name: "San Sebastian Cheesecake",
              price: 195,
              imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
              description: "Akışkan iç dokulu, Belçika çikolatası eşliğinde.",
              descriptionEn: "Original Basque burnt cheesecake with warm Belgian chocolate.",
              isAvailable: true,
              allergens: "Süt, Yumurta, Gluten",
              order: 1,
              categoryId: "cat-dessert",
            },
          },
          {
            id: "sug-2",
            suggestedProductId: "prod-croissant",
            suggestedProduct: {
              id: "prod-croissant",
              name: "Tereyağlı Çıtır Kruvasan",
              price: 125,
              imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
              description: "Fransız tereyağlı kat kat çıtır kruvasan.",
              descriptionEn: "French butter flaky croissant.",
              isAvailable: true,
              allergens: "Gluten, Süt",
              order: 2,
              categoryId: "cat-dessert",
            },
          },
        ],
      },
      {
        id: "prod-spanish-latte",
        name: "Spanish Latte",
        nameEn: "Spanish Latte",
        description: "Espresso, taze süt ve yoğunlaştırılmış tatlı süt ile hazırlanan zengin ve dengeli lezzet.",
        descriptionEn: "Espresso, fresh steamed milk and sweetened condensed milk.",
        price: 150,
        imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        allergens: "Laktoz / Süt",
        calories: 220,
        prepTimeMinutes: 4,
        badge: "chef",
        order: 2,
        categoryId: "cat-hot",
      },
      {
        id: "prod-espresso",
        name: "Artisan Espresso (Double)",
        nameEn: "Artisan Double Espresso",
        description: "Taze kavrulmuş %100 Arabica çekirdeklerinden yoğun kremalı çift shot espresso.",
        descriptionEn: "Double shot espresso with velvety crema.",
        price: 95,
        imageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        allergens: null,
        calories: 5,
        prepTimeMinutes: 2,
        badge: null,
        order: 3,
        categoryId: "cat-hot",
      },
    ],
  },
  {
    id: "cat-cold",
    name: "Soğuk Kahveler",
    nameEn: "Cold Coffees & Iced Drinks",
    icon: "🧊",
    order: 2,
    isActive: true,
    products: [
      {
        id: "prod-cold-brew",
        name: "Nitro Cold Brew",
        nameEn: "Nitro Cold Brew",
        description: "20 saat soğuk demlenmiş kahvenin nitrojen ile köpürtülmüş ipeksi ve ferahlatıcı sunumu.",
        descriptionEn: "20-hour cold drip coffee infused with nitrogen.",
        price: 160,
        imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        allergens: null,
        calories: 15,
        prepTimeMinutes: 2,
        badge: "deal",
        order: 1,
        categoryId: "cat-cold",
      },
      {
        id: "prod-iced-latte",
        name: "Iced Caramel Macchiato",
        nameEn: "Iced Caramel Macchiato",
        description: "Buz, vanilya aromalı soğuk süt, espresso ve üzerine yoğun karamel sos gezdirilmiş serinletici tat.",
        descriptionEn: "Iced espresso with cold milk and sweet caramel drizzle.",
        price: 155,
        imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        allergens: "Laktoz / Süt",
        calories: 240,
        prepTimeMinutes: 3,
        badge: "popular",
        order: 2,
        categoryId: "cat-cold",
      },
    ],
  },
  {
    id: "cat-dessert",
    name: "Fırın & Tatlılar",
    nameEn: "Bakery & Desserts",
    icon: "🥐",
    order: 3,
    isActive: true,
    products: [
      {
        id: "prod-cheesecake",
        name: "San Sebastian Cheesecake",
        nameEn: "San Sebastian Cheesecake",
        description: "Akışkan iç dokulu, karamelize yanık kabuklu orijinal İspanyol peynir keki. Sıcak Belçika çikolatası eşliğinde.",
        descriptionEn: "Creamy Basque burnt cheesecake served with warm chocolate.",
        price: 195,
        imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        allergens: "Süt, Yumurta, Gluten",
        calories: 420,
        prepTimeMinutes: 3,
        badge: "popular",
        order: 1,
        categoryId: "cat-dessert",
      },
      {
        id: "prod-croissant",
        name: "Tereyağlı Çıtır Kruvasan",
        nameEn: "French Butter Croissant",
        description: "Fransız tereyağlı kat kat çıtır kruvasan, reçel ve tereyağı eşliğinde servis edilir.",
        descriptionEn: "Flaky butter croissant baked fresh daily.",
        price: 125,
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        allergens: "Gluten, Süt, Yumurta",
        calories: 310,
        prepTimeMinutes: 2,
        badge: "new",
        order: 2,
        categoryId: "cat-dessert",
      },
    ],
  },
  {
    id: "cat-snack",
    name: "Tost & Atıştırmalıklar",
    nameEn: "Artisan Toast & Bites",
    icon: "🥪",
    order: 4,
    isActive: true,
    products: [
      {
        id: "prod-toast",
        name: "Füme Kaburga & Cheddar Tost",
        nameEn: "Smoked Ribs & Cheddar Sourdough Toast",
        description: "Ekşi mayalı artisan ekmek arasında özel tütsülenmiş dana kaburga, erimiş cheddar peyniri ve karamelize soğan.",
        descriptionEn: "Sourdough toast with smoked beef ribs and aged cheddar cheese.",
        price: 210,
        imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        allergens: "Gluten, Süt",
        calories: 520,
        prepTimeMinutes: 7,
        badge: "chef",
        order: 1,
        categoryId: "cat-snack",
      },
    ],
  },
  {
    id: "cat-hookah",
    name: "Özel Nargileler & Mix",
    nameEn: "Special Hookah & Mix Flavors",
    icon: "💨",
    order: 5,
    isActive: true,
    products: [
      {
        id: "prod-special-hookah",
        name: "Gloriouss Special Mix Nargile",
        nameEn: "Gloriouss Special Mix Hookah",
        description: "Enfes premium tütünlerden çift aroma karışımı, özel difüzörlü takım ve meşe kömürü ile.",
        descriptionEn: "Premium dual-flavor mix with special diffuser pipe and coconut charcoal.",
        price: 320,
        imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        allergens: null,
        prepTimeMinutes: 8,
        badge: "popular",
        order: 1,
        categoryId: "cat-hookah",
        extraGroups: [
          {
            id: "grp-flavor-1",
            productId: "prod-special-hookah",
            title: "1. Ana Aroma (Zorunlu)",
            isRequired: true,
            minSelect: 1,
            maxSelect: 1,
            order: 1,
            options: [
              { id: "flv-1", groupId: "grp-flavor-1", name: "Love 66 (Kavun, Karpuz, Nane)", price: 0, order: 1 },
              { id: "flv-2", groupId: "grp-flavor-1", name: "Lady Killer (Kavun, Mango, Orman Meyvesi)", price: 0, order: 2 },
              { id: "flv-3", groupId: "grp-flavor-1", name: "Geleneksel Çift Elma (Anasonlu)", price: 0, order: 3 },
              { id: "flv-4", groupId: "grp-flavor-1", name: "Buzlu Yaban Mersini (Blueberry Chill)", price: 0, order: 4 },
              { id: "flv-5", groupId: "grp-flavor-1", name: "Damla Sakızı & Nane", price: 0, order: 5 },
            ],
          },
          {
            id: "grp-flavor-2",
            productId: "prod-special-hookah",
            title: "2. Karışım Aroması (İsteğe Bağlı Mix)",
            isRequired: false,
            minSelect: 0,
            maxSelect: 1,
            order: 2,
            options: [
              { id: "mix-1", groupId: "grp-flavor-2", name: "+ Ekstra Buz (Ice Shot)", price: 20, order: 1 },
              { id: "mix-2", groupId: "grp-flavor-2", name: "+ Taze Nane Dokunuşu", price: 20, order: 2 },
              { id: "mix-3", groupId: "grp-flavor-2", name: "+ Vanilya Yumuşatıcı", price: 20, order: 3 },
            ],
          },
          {
            id: "grp-head-type",
            productId: "prod-special-hookah",
            title: "Lüle & Marpuç Tercihi",
            isRequired: false,
            minSelect: 0,
            maxSelect: 2,
            order: 3,
            options: [
              { id: "head-1", groupId: "grp-head-type", name: "Standart Kil Lüle", price: 0, order: 1 },
              { id: "head-2", groupId: "grp-head-type", name: "Phunnel Glaze Lüle (Daha Yoğun Duman)", price: 30, order: 2 },
              { id: "head-3", groupId: "grp-head-type", name: "Buzlu Marpuç (Ice Bazooka)", price: 35, order: 3 },
            ],
          },
        ],
      },
      {
        id: "prod-classic-hookah",
        name: "Klasik Tek Aroma Nargile",
        nameEn: "Classic Single Flavor Hookah",
        description: "Seçkin klasik tatlar: Çift Elma, Üzüm Nane, Cappuccino, Limon Nane.",
        descriptionEn: "Classic single aroma flavors.",
        price: 290,
        imageUrl: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=600&q=80",
        isAvailable: true,
        allergens: null,
        prepTimeMinutes: 7,
        order: 2,
        categoryId: "cat-hookah",
      },
    ],
  },
];

export const initialSettings: BusinessSettingsData = {
  id: "default",
  cafeName: "Gloriouss Café & Lounge",
  logoUrl: "/images/logo.png",
  wifiSsid: "Gloriouss_Guest",
  wifiPassword: "Gloriouss2026",
  workingHours: "Her gün: 09:00 - 02:00",
  phone: "+90 212 727 00 00",
  address: "Piri Mehmet Paşa Mah. Sahil Kordonu, Silivri, İstanbul",
  instagramUrl: "https://www.instagram.com/gloriousscafe/",
  tiktokUrl: "https://www.tiktok.com/@gloriousscafe",
  googleReviewUrl: "https://maps.google.com/?q=Gloriouss+Cafe+Silivri",
  whatsappNumber: "905551234567",

  // Modüler B2B Ayarları
  businessType: "hookah_lounge",
  isCatalogOnly: false,
  hookahMode: true,
  enableWaiterCall: true,
  enableBillRequest: true,
  enableQuickWifiBar: true,
  enableGoogleReviewPrompt: true,
  hookahCoalTimerMinutes: 25,
  hookahCoalCooldownMinutes: 10,
  kdsSlaDurationMinutes: 10,
};

// ==========================================
// 1. KAMPANYA SORGULARI
// ==========================================
export async function getCampaigns(onlyActive = true): Promise<CampaignItem[]> {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { order: "asc" },
    });
    if (campaigns && campaigns.length > 0) {
      return campaigns as unknown as CampaignItem[];
    }
  } catch (err) {
    // DB bağlı değilse
  }
  return initialCampaigns.filter((c) => (onlyActive ? c.isActive : true));
}

export async function createCampaign(data: {
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  imageUrl?: string | null;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  isActive?: boolean;
  order?: number;
}) {
  try {
    return await prisma.campaign.create({
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        badgeText: data.badgeText || null,
        imageUrl: data.imageUrl || null,
        originalPrice: data.originalPrice || null,
        discountedPrice: data.discountedPrice || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order ?? 0,
      },
    });
  } catch (err) {
    const newCamp: CampaignItem = {
      id: `camp-${Date.now()}`,
      title: data.title,
      subtitle: data.subtitle || null,
      badgeText: data.badgeText || null,
      imageUrl: data.imageUrl || null,
      originalPrice: data.originalPrice || null,
      discountedPrice: data.discountedPrice || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      order: data.order ?? 0,
      createdAt: new Date(),
    };
    initialCampaigns.push(newCamp);
    return newCamp;
  }
}

export async function updateCampaign(
  id: string,
  data: Partial<Omit<CampaignItem, "id" | "createdAt" | "updatedAt">>
) {
  try {
    return await prisma.campaign.update({
      where: { id },
      data,
    });
  } catch (err) {
    const idx = initialCampaigns.findIndex((c) => c.id === id);
    if (idx !== -1) {
      initialCampaigns[idx] = { ...initialCampaigns[idx], ...data };
      return initialCampaigns[idx];
    }
    return null;
  }
}

export async function deleteCampaign(id: string) {
  try {
    return await prisma.campaign.delete({ where: { id } });
  } catch (err) {
    const idx = initialCampaigns.findIndex((c) => c.id === id);
    if (idx !== -1) initialCampaigns.splice(idx, 1);
    return { success: true };
  }
}

// ==========================================
// 2. KATEGORİ & GELİŞMİŞ ÜRÜN SORGULARI (Ekstralar & Çapraz Satış)
// ==========================================
export async function getCategoriesWithProducts(onlyActive = true): Promise<CategoryItem[]> {
  try {
    const categories = await prisma.category.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { order: "asc" },
      include: {
        products: {
          orderBy: { order: "asc" },
          include: {
            extraGroups: {
              orderBy: { order: "asc" },
              include: {
                options: {
                  orderBy: { order: "asc" },
                },
              },
            },
            suggestions: {
              include: {
                suggestedProduct: true,
              },
            },
          },
        },
      },
    });

    if (categories && categories.length > 0) {
      return categories as unknown as CategoryItem[];
    }
  } catch (err) {
    // DB bağlı değilse fallback
  }

  // Varsayılan fallback verisi (DB bağlantısı yoksa veya boşsa kesintisiz çalışma)
  return initialCategories.filter((c) => (onlyActive ? c.isActive : true));
}

// Tekil ürün ve ilişkilerini getirme
export async function getProductWithDetails(id: string): Promise<ProductItem | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        extraGroups: {
          orderBy: { order: "asc" },
          include: {
            options: {
              orderBy: { order: "asc" },
            },
          },
        },
        suggestions: {
          include: {
            suggestedProduct: true,
          },
        },
      },
    });
    if (product) return product as unknown as ProductItem;
  } catch {
    //
  }

  // Fallback: initialCategories içinden ürünü bul
  for (const cat of initialCategories) {
    const found = cat.products?.find((p) => p.id === id);
    if (found) return found;
  }
  return null;
}

// ==========================================
// 3. İŞLETME AYARLARI
// ==========================================
export async function getBusinessSettings(): Promise<BusinessSettingsData> {
  try {
    const settings = await prisma.businessSettings.findUnique({
      where: { id: "default" },
    });
    if (settings) {
      return settings as unknown as BusinessSettingsData;
    }
  } catch (err) {
    // DB yoksa
  }
  return initialSettings;
}

export async function updateBusinessSettings(data: Partial<BusinessSettingsData>) {
  try {
    return await prisma.businessSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        cafeName: data.cafeName || "Artisan Cafe",
        logoUrl: data.logoUrl,
        wifiSsid: data.wifiSsid,
        wifiPassword: data.wifiPassword,
        workingHours: data.workingHours,
        phone: data.phone,
        address: data.address,
        instagramUrl: data.instagramUrl,
        tiktokUrl: data.tiktokUrl,
        googleReviewUrl: data.googleReviewUrl,
        whatsappNumber: data.whatsappNumber,
        businessType: data.businessType || "cafe",
        isCatalogOnly: data.isCatalogOnly ?? false,
        hookahMode: data.hookahMode ?? false,
        enableWaiterCall: data.enableWaiterCall ?? true,
        enableBillRequest: data.enableBillRequest ?? true,
        enableQuickWifiBar: data.enableQuickWifiBar ?? true,
        enableGoogleReviewPrompt: data.enableGoogleReviewPrompt ?? true,
        hookahCoalTimerMinutes: data.hookahCoalTimerMinutes ?? 25,
        hookahCoalCooldownMinutes: data.hookahCoalCooldownMinutes ?? 10,
        kdsSlaDurationMinutes: data.kdsSlaDurationMinutes ?? 10,
      },
      update: data,
    });
  } catch (err) {
    Object.assign(initialSettings, data);
    return initialSettings;
  }
}

// ==========================================
// 3.1. TOPLU FİYAT GÜNCELLEME (Esnaf Zam/İndirim Aracı)
// ==========================================
export async function bulkUpdatePrices(
  percentage: number, // örn: 15 (%15 zam) veya -10 (%10 indirim)
  categoryId?: string,
  roundToNearest: number = 5 // örn: 5 TL'nin katına yuvarla
) {
  try {
    const whereClause = categoryId && categoryId !== "all" ? { categoryId } : {};
    const products = await prisma.product.findMany({ where: whereClause });

    for (const prod of products) {
      const multiplier = 1 + percentage / 100;
      let newPrice = prod.price * multiplier;

      if (roundToNearest > 0) {
        newPrice = Math.round(newPrice / roundToNearest) * roundToNearest;
      } else {
        newPrice = Math.round(newPrice * 100) / 100;
      }

      await prisma.product.update({
        where: { id: prod.id },
        data: { price: Math.max(1, newPrice) },
      });
    }

    return { success: true, count: products.length };
  } catch (err) {
    // In-memory fallback
    let updatedCount = 0;
    for (const cat of initialCategories) {
      if (!categoryId || categoryId === "all" || cat.id === categoryId) {
        for (const prod of cat.products || []) {
          const multiplier = 1 + percentage / 100;
          let newPrice = prod.price * multiplier;
          if (roundToNearest > 0) {
            newPrice = Math.round(newPrice / roundToNearest) * roundToNearest;
          } else {
            newPrice = Math.round(newPrice * 100) / 100;
          }
          prod.price = Math.max(1, newPrice);
          updatedCount++;
        }
      }
    }
    return { success: true, count: updatedCount };
  }
}

// ==========================================
// 4. ÇAPRAZ SATIŞ & EKSTRA GRUPLARI MUTASYONU
// ==========================================
export async function updateProductCrossSells(productId: string, suggestedProductIds: string[]) {
  try {
    // Önceki önerileri sil
    await prisma.productSuggestion.deleteMany({
      where: { productId },
    });

    // Yeni önerileri ekle
    if (suggestedProductIds.length > 0) {
      await prisma.productSuggestion.createMany({
        data: suggestedProductIds.map((targetId) => ({
          productId,
          suggestedProductId: targetId,
        })),
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addExtraGroupToProduct(
  productId: string,
  title: string,
  isRequired: boolean,
  maxSelect: number,
  options: { name: string; price: number }[]
) {
  try {
    return await prisma.productExtraGroup.create({
      data: {
        productId,
        title,
        isRequired,
        maxSelect,
        options: {
          create: options.map((opt, idx) => ({
            name: opt.name,
            price: opt.price,
            order: idx + 1,
          })),
        },
      },
      include: { options: true },
    });
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteExtraGroup(groupId: string) {
  try {
    await prisma.productExtraGroup.delete({ where: { id: groupId } });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 5. KATEGORİ MUTASYONLARI
// ==========================================
export async function createCategory(
  name: string,
  order: number,
  isActive = true,
  nameEn?: string | null,
  icon?: string | null
) {
  try {
    return await prisma.category.create({
      data: {
        name,
        order,
        isActive,
        nameEn: nameEn || null,
        icon: icon || null,
      },
    });
  } catch (err) {
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name,
      order,
      isActive,
      nameEn: nameEn || null,
      icon: icon || null,
      products: [],
    };
    initialCategories.push(newCat);
    return newCat;
  }
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    nameEn?: string | null;
    icon?: string | null;
    order?: number;
    isActive?: boolean;
  }
) {
  try {
    return await prisma.category.update({
      where: { id },
      data,
    });
  } catch (err) {
    const idx = initialCategories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      initialCategories[idx] = { ...initialCategories[idx], ...data };
      return initialCategories[idx];
    }
    return null;
  }
}

export async function deleteCategory(id: string) {
  try {
    return await prisma.category.delete({
      where: { id },
    });
  } catch (err) {
    const idx = initialCategories.findIndex((c) => c.id === id);
    if (idx !== -1) initialCategories.splice(idx, 1);
    return { success: true };
  }
}

// ==========================================
// 6. ÜRÜN MUTASYONLARI
// ==========================================
export async function createProduct(data: {
  name: string;
  nameEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable?: boolean;
  allergens?: string | null;
  allergensEn?: string | null;
  dietary?: string | null;
  calories?: number | null;
  prepTimeMinutes?: number | null;
  badge?: string | null;
  categoryId: string;
  order?: number;
}) {
  try {
    return await prisma.product.create({
      data: {
        name: data.name,
        nameEn: data.nameEn || null,
        description: data.description || null,
        descriptionEn: data.descriptionEn || null,
        price: data.price,
        imageUrl: data.imageUrl || null,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        allergens: data.allergens || null,
        allergensEn: data.allergensEn || null,
        dietary: data.dietary || null,
        calories: data.calories !== undefined ? data.calories : null,
        prepTimeMinutes: data.prepTimeMinutes !== undefined ? data.prepTimeMinutes : null,
        badge: data.badge || null,
        categoryId: data.categoryId,
        order: data.order ?? 0,
      },
    });
  } catch (err) {
    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      name: data.name,
      nameEn: data.nameEn || null,
      description: data.description || null,
      descriptionEn: data.descriptionEn || null,
      price: data.price,
      imageUrl: data.imageUrl || null,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      allergens: data.allergens || null,
      allergensEn: data.allergensEn || null,
      calories: data.calories || null,
      prepTimeMinutes: data.prepTimeMinutes || null,
      badge: data.badge || null,
      categoryId: data.categoryId,
      order: data.order ?? 0,
    };
    const cat = initialCategories.find((c) => c.id === data.categoryId);
    if (cat) {
      cat.products = cat.products || [];
      cat.products.push(newProd);
    }
    return newProd;
  }
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<ProductItem, "id" | "createdAt" | "updatedAt">>
) {
  try {
    return await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
        ...(data.allergens !== undefined && { allergens: data.allergens }),
        ...(data.allergensEn !== undefined && { allergensEn: data.allergensEn }),
        ...(data.calories !== undefined && { calories: data.calories }),
        ...(data.prepTimeMinutes !== undefined && { prepTimeMinutes: data.prepTimeMinutes }),
        ...(data.badge !== undefined && { badge: data.badge }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });
  } catch (err) {
    for (const cat of initialCategories) {
      const pIdx = (cat.products || []).findIndex((p) => p.id === id);
      if (pIdx !== -1 && cat.products) {
        cat.products[pIdx] = { ...cat.products[pIdx], ...data };
        return cat.products[pIdx];
      }
    }
    return null;
  }
}

export async function toggleProductStock(id: string) {
  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return null;
    return await prisma.product.update({
      where: { id },
      data: { isAvailable: !existing.isAvailable },
    });
  } catch (err) {
    for (const cat of initialCategories) {
      const found = (cat.products || []).find((p) => p.id === id);
      if (found) {
        found.isAvailable = !found.isAvailable;
        return found;
      }
    }
    return null;
  }
}

export async function deleteProduct(id: string) {
  try {
    return await prisma.product.delete({
      where: { id },
    });
  } catch (err) {
    for (const cat of initialCategories) {
      if (cat.products) {
        const pIdx = cat.products.findIndex((p) => p.id === id);
        if (pIdx !== -1) {
          cat.products.splice(pIdx, 1);
          return { success: true };
        }
      }
    }
    return { success: true };
  }
}

// ==========================================
// 7. ADMİN KULLANICI SORGUSU
// ==========================================
export async function getAdminByEmail(email: string) {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });
    if (admin) return admin;
  } catch {
    //
  }

  // Fallback demo admin
  if (email.toLowerCase() === "admin@kafe.com") {
    return {
      id: "admin-default",
      email: "admin@kafe.com",
      name: "Kafe Yöneticisi",
      passwordHash: "$2a$10$Z4QGkc638xpkK4qknRlfveWhsU8Awhx1DxpppBslYtK4QlUOLGgda", // admin123
    };
  }
  return null;
}


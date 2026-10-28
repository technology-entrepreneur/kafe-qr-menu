const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 CRO & Satış Odaklı Veritabanı Tohumlama başlatılıyor...");

  // 1. İşletme Ayarları
  const settings = await prisma.businessSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      cafeName: "Gloriouss Café",
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
    },
  });
  console.log("✅ İşletme ayarları hazır:", settings.cafeName);

  // 2. Admin Kullanıcı
  const defaultPassword = "admin123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@kafe.com" },
    update: { passwordHash },
    create: {
      email: "admin@kafe.com",
      name: "Kafe Müdürü",
      passwordHash,
    },
  });
  console.log("✅ Admin kullanıcısı hazır (admin@kafe.com / admin123)");

  // 3. Kampanyalar (CRO Fırsat Kartları)
  const campaignsData = [
    {
      title: "Latte + San Sebastian Menüsü",
      subtitle: "Kadifemsi sıcak latte ile Belçika çikolatalı akışkan peynir keki",
      badgeText: "GÜNÜN FIRSATI",
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80",
      originalPrice: 345,
      discountedPrice: 285,
      order: 1,
    },
    {
      title: "Kruvasan & Filtre Kahve İkilisi",
      subtitle: "Güne çıtır Fransız tereyağlı kruvasan ve taze filtre kahveyle başlayın",
      badgeText: "KAHVALTI MENÜSÜ",
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
      originalPrice: 275,
      discountedPrice: 220,
      order: 2,
    },
    {
      title: "2. Soğuk Kahvede %30 İndirim",
      subtitle: "Arkadaşınızla serinleyin; 2. Iced Latte veya Cold Brew anında indirimli",
      badgeText: "ÇİFTE KEYİF",
      imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
      originalPrice: null,
      discountedPrice: null,
      order: 3,
    },
  ];

  await prisma.campaign.deleteMany();
  for (const camp of campaignsData) {
    await prisma.campaign.create({ data: camp });
  }
  console.log("✅ Fırsat ve Kampanya kartları yüklendi.");

  // 4. Kategoriler ve Ürünler
  const hotCategory = await prisma.category.upsert({
    where: { id: "cat-hot" },
    update: {},
    create: {
      id: "cat-hot",
      name: "Sıcak Kahveler",
      nameEn: "Specialty Hot Coffees",
      icon: "☕",
      order: 1,
      isActive: true,
    },
  });

  const coldCategory = await prisma.category.upsert({
    where: { id: "cat-cold" },
    update: {},
    create: {
      id: "cat-cold",
      name: "Soğuk Kahveler",
      nameEn: "Cold Coffees & Iced Drinks",
      icon: "🧊",
      order: 2,
      isActive: true,
    },
  });

  const dessertCategory = await prisma.category.upsert({
    where: { id: "cat-dessert" },
    update: {},
    create: {
      id: "cat-dessert",
      name: "Fırın & Tatlılar",
      nameEn: "Bakery & Desserts",
      icon: "🥐",
      order: 3,
      isActive: true,
    },
  });

  const snackCategory = await prisma.category.upsert({
    where: { id: "cat-snack" },
    update: {},
    create: {
      id: "cat-snack",
      name: "Tost & Atıştırmalıklar",
      nameEn: "Artisan Toast & Bites",
      icon: "🥪",
      order: 4,
      isActive: true,
    },
  });

  // Ürünler
  const flatWhite = await prisma.product.upsert({
    where: { id: "prod-flat-white" },
    update: {},
    create: {
      id: "prod-flat-white",
      name: "Flat White",
      nameEn: "Flat White",
      description: "Çift shot ristretto espresso üzerine mikro köpüklü kadifemsi sıcak süt.",
      descriptionEn: "Double ristretto espresso delicately infused with micro-foamed velvety steamed whole milk.",
      price: 135,
      imageUrl: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      allergens: "Laktoz / Süt",
      allergensEn: "Dairy / Milk",
      calories: 165,
      prepTimeMinutes: 4,
      badge: "popular",
      order: 1,
      categoryId: hotCategory.id,
    },
  });

  const spanishLatte = await prisma.product.upsert({
    where: { id: "prod-spanish-latte" },
    update: {},
    create: {
      id: "prod-spanish-latte",
      name: "Spanish Latte",
      nameEn: "Spanish Latte",
      description: "Espresso, taze süt ve yoğunlaştırılmış tatlı süt ile hazırlanan zengin ve dengeli lezzet.",
      descriptionEn: "Espresso combined with fresh steamed milk and sweetened condensed milk for a silky finish.",
      price: 150,
      imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      allergens: "Laktoz / Süt",
      allergensEn: "Dairy / Milk",
      calories: 220,
      prepTimeMinutes: 4,
      badge: "chef",
      order: 2,
      categoryId: hotCategory.id,
    },
  });

  const coldBrew = await prisma.product.upsert({
    where: { id: "prod-cold-brew" },
    update: {},
    create: {
      id: "prod-cold-brew",
      name: "Nitro Cold Brew",
      nameEn: "Nitro Cold Brew",
      description: "20 saat soğuk demlenmiş kahvenin nitrojen ile köpürtülmüş ipeksi ve ferahlatıcı sunumu.",
      descriptionEn: "20-hour steeped slow cold drip coffee infused with nitrogen for a silky Guinness-like foam.",
      price: 160,
      imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      allergens: null,
      allergensEn: "None",
      calories: 15,
      prepTimeMinutes: 2,
      badge: "deal",
      order: 1,
      categoryId: coldCategory.id,
    },
  });

  const cheesecake = await prisma.product.upsert({
    where: { id: "prod-cheesecake" },
    update: {},
    create: {
      id: "prod-cheesecake",
      name: "San Sebastian Cheesecake",
      nameEn: "San Sebastian Cheesecake",
      description: "Akışkan iç dokulu, karamelize yanık kabuklu orijinal İspanyol peynir keki. Sıcak Belçika çikolatası eşliğinde.",
      descriptionEn: "Original Basque burnt cheesecake with a creamy molten center, served with warm Belgian milk chocolate.",
      price: 195,
      imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      allergens: "Süt, Yumurta, Gluten",
      allergensEn: "Dairy, Egg, Gluten",
      calories: 420,
      prepTimeMinutes: 3,
      badge: "popular",
      order: 1,
      categoryId: dessertCategory.id,
    },
  });

  const croissant = await prisma.product.upsert({
    where: { id: "prod-croissant" },
    update: {},
    create: {
      id: "prod-croissant",
      name: "Tereyağlı Çıtır Kruvasan",
      nameEn: "French Butter Croissant",
      description: "Fransız tereyağlı kat kat çıtır kruvasan, reçel ve tereyağı eşliğinde servis edilir.",
      descriptionEn: "Flaky, layered French butter croissant freshly baked daily, served with gourmet jam.",
      price: 125,
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      allergens: "Gluten, Süt, Yumurta",
      allergensEn: "Gluten, Dairy, Egg",
      calories: 310,
      prepTimeMinutes: 2,
      badge: "new",
      order: 2,
      categoryId: dessertCategory.id,
    },
  });

  const toast = await prisma.product.upsert({
    where: { id: "prod-toast" },
    update: {},
    create: {
      id: "prod-toast",
      name: "Füme Kaburga & Cheddar Tost",
      nameEn: "Smoked Rib & Aged Cheddar Toast",
      description: "Ekşi mayalı ekmekte eritilmiş cheddar, karamelize soğan ve füme kaburga eti.",
      descriptionEn: "Slow-smoked beef rib slices with melted aged cheddar and caramelized onion on artisanal sourdough.",
      price: 240,
      imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      allergens: "Gluten, Süt, Hardal",
      allergensEn: "Gluten, Dairy, Mustard",
      calories: 490,
      prepTimeMinutes: 8,
      badge: "chef",
      order: 1,
      categoryId: snackCategory.id,
    },
  });

  // 5. Ekstra Grupları Ekleme (Flat White & Spanish Latte için)
  await prisma.productExtraGroup.deleteMany();

  const milkGroup = await prisma.productExtraGroup.create({
    data: {
      productId: flatWhite.id,
      title: "Süt Tercihi",
      isRequired: true,
      minSelect: 1,
      maxSelect: 1,
      order: 1,
      options: {
        create: [
          { name: "Standart Tam Yağlı Süt", price: 0, order: 1 },
          { name: "Yulaf Sütü (Bitkisel)", price: 25, order: 2 },
          { name: "Badem Sütü (Bitkisel)", price: 25, order: 3 },
          { name: "Laktozsuz Süt", price: 15, order: 4 },
        ],
      },
    },
  });

  const syrupGroup = await prisma.productExtraGroup.create({
    data: {
      productId: flatWhite.id,
      title: "Ekstra Şurup & Tat",
      isRequired: false,
      minSelect: 0,
      maxSelect: 2,
      order: 2,
      options: {
        create: [
          { name: "Karamel Şurubu", price: 18, order: 1 },
          { name: "Vanilya Şurubu", price: 18, order: 2 },
          { name: "Fındık Şurubu", price: 18, order: 3 },
          { name: "Ekstra Espresso Shot", price: 35, order: 4 },
        ],
      },
    },
  });

  // Spanish Latte için de aynı ekstra gruplarını ekle
  await prisma.productExtraGroup.create({
    data: {
      productId: spanishLatte.id,
      title: "Süt Tercihi",
      isRequired: true,
      minSelect: 1,
      maxSelect: 1,
      order: 1,
      options: {
        create: [
          { name: "Standart Tam Yağlı Süt", price: 0, order: 1 },
          { name: "Yulaf Sütü", price: 25, order: 2 },
          { name: "Laktozsuz Süt", price: 15, order: 3 },
        ],
      },
    },
  });

  // 6. Çapraz Satış (Cross-Selling) Eşleştirmeleri
  await prisma.productSuggestion.deleteMany();

  // Flat White seçildiğinde -> San Sebastian & Kruvasan öner
  await prisma.productSuggestion.createMany({
    data: [
      { productId: flatWhite.id, suggestedProductId: cheesecake.id },
      { productId: flatWhite.id, suggestedProductId: croissant.id },
      // Spanish Latte -> Cheesecake & Kruvasan
      { productId: spanishLatte.id, suggestedProductId: cheesecake.id },
      { productId: spanishLatte.id, suggestedProductId: croissant.id },
      // Cold Brew -> Tost & Cheesecake
      { productId: coldBrew.id, suggestedProductId: toast.id },
      { productId: coldBrew.id, suggestedProductId: cheesecake.id },
    ],
  });

  console.log("🎉 Ekstralar, Opsiyonlar ve Çapraz Satış (Cross-Selling) başarıyla yüklendi!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

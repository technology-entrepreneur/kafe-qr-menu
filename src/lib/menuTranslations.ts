import {
  CategoryItem,
  ProductItem,
  ProductExtraGroupItem,
  Language,
} from "@/types/menu";

// ====================================================
// 1. KATEGORİ ÇEVİRİ SÖZLÜĞÜ (TR -> EN)
// ====================================================
const categoryMap: Record<string, string> = {
  "Sıcak Kahveler": "Hot Coffees",
  "Soğuk Kahveler & Buzlu İçecekler": "Cold Coffees & Iced Drinks",
  "Özel Çaylar & Matcha": "Specialty Teas & Matcha",
  "Taze Fırın & Tatlılar": "Fresh Bakery & Desserts",
  "Tostlar & Atıştırmalıklar": "Toasts & Bites",
  "Soğuk Kahveler": "Cold Coffees",
  "Fırın & Tatlılar": "Bakery & Desserts",
  "Tost & Atıştırmalıklar": "Toasts & Snacks",
  "Espresso & Özel Kahveler": "Espresso & Signature Coffees",
};

// ====================================================
// 2. ÜRÜN ÇEVİRİ VE İÇERİK VERİ TABANI
// ====================================================
interface ProductTranslationData {
  nameEn: string;
  descriptionEn: string;
  allergensEn?: string;
  ingredients: string[];
  ingredientsEn: string[];
}

const productDataMap: Record<string, ProductTranslationData> = {
  "Espresso Single / Double": {
    nameEn: "Espresso Single / Double",
    descriptionEn: "Freshly extracted single or double shot from 100% Arabica Ethiopian Yirgacheffe beans with vibrant citrus notes and intense body.",
    allergensEn: "None",
    ingredients: [
      "%100 Arabica Etiyopya Yirgacheffe Çekirdekleri",
      "Doğal Kaynak Suyu",
      "Narenciye & Bergamot Aroma Notaları",
      "Kremamsı Doğal Crema Köpüğü",
    ],
    ingredientsEn: [
      "100% Arabica Ethiopia Yirgacheffe Beans",
      "Pure Natural Spring Water",
      "Citrus & Bergamot Aroma Notes",
      "Velvety Natural Crema Head",
    ],
  },
  "Flat White": {
    nameEn: "Flat White",
    descriptionEn: "Double ristretto espresso delicately infused with micro-foamed velvety steamed whole milk for a bold yet smooth coffee taste.",
    allergensEn: "Dairy / Milk",
    ingredients: [
      "Çift Shot Ristretto Espresso",
      "Kadifemsi Mikro Köpüklü Taze Tam Yağlı Süt",
      "Dengeli ve Yoğun Kahve Gövdesi",
    ],
    ingredientsEn: [
      "Double Shot Ristretto Espresso",
      "Micro-Foamed Velvety Fresh Whole Milk",
      "Rich & Balanced Full-Bodied Profile",
    ],
  },
  "Spanish Latte": {
    nameEn: "Spanish Latte",
    descriptionEn: "Double espresso harmoniously blended with sweet condensed milk and chilled or steamed fresh milk for a rich, balanced sip.",
    allergensEn: "Dairy / Milk",
    ingredients: [
      "Duble Shot Espresso",
      "Doğal Yoğunlaştırılmış Tatlı Süt",
      "Taze Çiftlik Sütü",
      "Buz Küpleri",
    ],
    ingredientsEn: [
      "Double Shot Espresso",
      "Natural Sweet Condensed Milk",
      "Fresh Farm Whole Milk",
      "Crystal Ice Cubes",
    ],
  },
  "Salted Caramel Mocha": {
    nameEn: "Salted Caramel Mocha",
    descriptionEn: "Melted Belgian chocolate, artisan sea salt caramel syrup, double espresso, and steamed milk topped with fresh vanilla whipped cream.",
    allergensEn: "Dairy / Milk",
    ingredients: [
      "Eritilmiş Belçika Callebaut Çikolatası",
      "Artisan Deniz Tuzlu Karamel Şurubu",
      "Duble Shot Espresso",
      "Sıcak Buharlanmış Süt",
      "Taze Çırpılmış Vanilyalı Krema",
    ],
    ingredientsEn: [
      "Melted Belgian Callebaut Chocolate",
      "Artisan Sea Salt Caramel Syrup",
      "Double Espresso Shot",
      "Steamed Fresh Milk",
      "Fresh Whipped Vanilla Cream",
    ],
  },
  "Iced Americano": {
    nameEn: "Iced Americano",
    descriptionEn: "Freshly pulled double shot espresso over crystal clear ice and chilled filtered spring water for a crisp, bold flavor.",
    allergensEn: "None",
    ingredients: [
      "Taze Çekilmiş Çift Shot Espresso",
      "Kristal Arıtılmış Soğuk Su",
      "Bol Buz Küpleri",
    ],
    ingredientsEn: [
      "Freshly Extracted Double Shot Espresso",
      "Crystal Filtered Spring Water",
      "Crisp Ice Cubes",
    ],
  },
  "Nitro Cold Brew": {
    nameEn: "Nitro Cold Brew",
    descriptionEn: "20-hour cold-steeped single-origin coffee infused with nitrogen for an ultra-smooth, creamy draft pour with naturally sweet notes.",
    allergensEn: "None",
    ingredients: [
      "20 Saat Soğuk Demlenmiş Tek Köken Kolombiya Çekirdekleri",
      "Gıda Tipi Saf Nitrojen Gazı (Kadife Köpük)",
      "Sıfır İlave Şeker, Doğal Tatlılık",
    ],
    ingredientsEn: [
      "20-Hour Cold-Steeped Single-Origin Colombian Beans",
      "Pure Food-Grade Nitrogen (Velvety Crema Head)",
      "Zero Added Sugar, Natural Sweet Notes",
    ],
  },
  "Iced Pistachio Latte": {
    nameEn: "Iced Pistachio Latte",
    descriptionEn: "Authentic roasted Antep pistachio paste, pure vanilla, double espresso, and chilled milk poured over ice. Our signature iced treat.",
    allergensEn: "Pistachio (Tree Nuts), Dairy / Milk",
    ingredients: [
      "%100 Gerçek Şekersiz Antep Fıstığı Ezmesi",
      "Madagaskar Vanilya Özütü",
      "Duble Shot Espresso",
      "Soğuk Taze Süt",
      "Öğütülmüş Fıstık Taneleri",
    ],
    ingredientsEn: [
      "100% Real Unsweetened Antep Pistachio Paste",
      "Madagascar Vanilla Extract",
      "Double Shot Espresso",
      "Chilled Fresh Milk",
      "Crushed Roasted Pistachio Dust",
    ],
  },
  "Iced Ceremonial Matcha Latte": {
    nameEn: "Iced Ceremonial Matcha Latte",
    descriptionEn: "First-harvest ceremonial Grade-A Japanese Uji matcha whisked with pure vanilla and creamy oat milk over ice.",
    allergensEn: "Gluten (Optional Oat Milk)",
    ingredients: [
      "Japonya Uji Bölgesi 1. Hasat Seremoniyel A-Grade Matcha",
      "Doğal Vanilya Özütü",
      "Barista Kıvamında Yulaf Sütü",
      "Buz",
    ],
    ingredientsEn: [
      "First-Harvest Ceremonial Grade-A Matcha (Uji, Japan)",
      "Natural Madagascar Vanilla Extract",
      "Barista Creamy Oat Milk",
      "Ice Cubes",
    ],
  },
  "Hibiscus & Orman Meyveli Soğuk Çay": {
    nameEn: "Hibiscus & Wild Berries Iced Tea",
    descriptionEn: "Slow-infused whole hibiscus flowers, wild blueberries, fresh mint leaves, and an organic lemon slice. Refreshingly tart and unsweetened.",
    allergensEn: "None",
    ingredients: [
      "Organik Gül Hatmi (Hibiskus) Çiçeği",
      "Taze Yaban Mersini & Ahududu",
      "Taze Nane Yaprakları",
      "Organik Limon Dilimi",
    ],
    ingredientsEn: [
      "Organic Whole Hibiscus Blossoms",
      "Fresh Wild Blueberries & Raspberries",
      "Garden Fresh Mint Leaves",
      "Organic Lemon Wheel",
    ],
  },
  "San Sebastian Cheesecake": {
    nameEn: "San Sebastian Cheesecake",
    descriptionEn: "Authentic Basque-style baked cheesecake with a caramelized burnt crust and molten creamy center. Served with warm Belgian chocolate.",
    allergensEn: "Dairy / Milk, Eggs, Gluten",
    ingredients: [
      "Orijinal Bask Usulü Taze Krema Peyniri",
      "%35 Yağlı Taze Çırpılmış Krema",
      "Organik Köy Yumurtası",
      "Doğal Şeker",
      "Sıcak Eritilmiş Belçika Çikolatası Sosu",
    ],
    ingredientsEn: [
      "Authentic Basque Farm Cream Cheese",
      "35% Fresh Heavy Whipping Cream",
      "Organic Farm Egg Yolks",
      "Natural Cane Sugar",
      "Warm Melted Belgian Callebaut Chocolate",
    ],
  },
  "Tiramisu della Nonna": {
    nameEn: "Traditional Italian Tiramisu",
    descriptionEn: "Italian Savoiardi ladyfingers soaked in bold dark espresso, layered with fresh mascarpone zabaglione and dusted with Valrhona cocoa.",
    allergensEn: "Gluten, Dairy / Milk, Eggs",
    ingredients: [
      "İtalyan Savoiardi Kedi Dili Bisküvileri",
      "Taze İtalyan Mascarpone Peyniri",
      "Sert Çekim Espresso",
      "Organik Yumurta Sarısı",
      "Saf Valrhona Kakao Tozu",
    ],
    ingredientsEn: [
      "Italian Savoiardi Ladyfingers",
      "Fresh Italian Mascarpone Cheese",
      "Bold Espresso Soak",
      "Organic Egg Yolks",
      "100% Pure Valrhona Dark Cocoa Powder",
    ],
  },
  "Kruvasan & Çilek Dolgulu": {
    nameEn: "Strawberry Cream Croissant",
    descriptionEn: "Flaky 72-layer French butter croissant generously filled with Madagascar vanilla pastry cream and fresh local Aegean strawberries.",
    allergensEn: "Gluten, Dairy / Milk, Eggs",
    ingredients: [
      "Fransız AOP Tereyağı ile 72 Kat Lamine Hamur",
      "Madagaskar Vanilyalı İpeksi Pastacı Kreması",
      "Taze Dilimlenmiş Ege Çilekleri",
      "Pudra Şekeri Serpiştirmesi",
    ],
    ingredientsEn: [
      "72-Layer French AOP Butter Laminated Dough",
      "Silky Madagascar Vanilla Pastry Cream",
      "Fresh Sliced Aegean Strawberries",
      "Light Confectioners Sugar Dusting",
    ],
  },
  "Tereyağlı Çıtır Kruvasan": {
    nameEn: "Artisan Butter Croissant",
    descriptionEn: "Classic French all-butter flaky croissant baked golden brown every morning. Served warm with artisan preserves and farmhouse butter.",
    allergensEn: "Gluten, Dairy / Milk, Eggs",
    ingredients: [
      "%100 Fransız AOP Tereyağı",
      "Kat Kat Çıtır Lamine Kruvasan Hamuru",
      "Yanında Ev Yapımı Çilek Reçeli ve Köy Tereyağı",
    ],
    ingredientsEn: [
      "100% French AOP Butter",
      "Multi-Layer Flaky Laminated Dough",
      "Served with Homemade Strawberry Preserves & Butter",
    ],
  },
  "Füme Kaburga & Cheddar Ekşi Mayalı Tost": {
    nameEn: "Smoked Ribs & Cheddar Sourdough Toast",
    descriptionEn: "24-hour slow-smoked beef short ribs, 12-month aged melted cheddar, caramelized red onions, and Dijon aioli on toasted artisan sourdough.",
    allergensEn: "Gluten, Dairy / Milk, Mustard",
    ingredients: [
      "24 Saat Meşe Odununda Tütsülenmiş Dana Kaburga",
      "12 Ay Dinlendirilmiş Eritilmiş İngiliz Cheddar",
      "Karamelize Mor Soğan",
      "Dijon Hardallı Ev Yapımı Mayonez",
      "72 Saat Fermente Ekşi Mayalı Köy Ekmeği",
    ],
    ingredientsEn: [
      "24-Hour Oak-Smoked Beef Short Ribs",
      "12-Month Aged Melted English Cheddar",
      "Slow Caramelized Red Onions",
      "Homemade Dijon Aioli",
      "72-Hour Fermented Artisan Sourdough Bread",
    ],
  },
  "Avokado & Poşe Yumurtalı Tartin": {
    nameEn: "Avocado & Poached Egg Tartine",
    descriptionEn: "Fresh Hass avocado mash, free-range poached egg, whipped herb labneh, extra virgin olive oil, and nigella seeds on toasted sourdough.",
    allergensEn: "Gluten, Eggs, Dairy / Milk",
    ingredients: [
      "Taze Ezilmiş Olgun Hass Avokado",
      "Organik Çiftlik Poşe Yumurta",
      "Taze Otlu Süzme Labne Peyniri",
      "Soğuk Sıkım Sızma Zeytinyağı",
      "Çörek Otu, Pul Biber ve Çıtır Ekşi Maya Ekmeği",
    ],
    ingredientsEn: [
      "Fresh Mashed Ripe Hass Avocado",
      "Organic Free-Range Poached Egg",
      "Whipped Herb Farmhouse Labneh",
      "Cold-Pressed Extra Virgin Olive Oil",
      "Nigella Seeds, Chili Flakes, Toasted Sourdough",
    ],
  },
  "Füme Kaburga & Cheddar Tost": {
    nameEn: "Smoked Beef & Melted Cheddar Toast",
    descriptionEn: "Tender smoked beef short ribs, rich melted cheddar cheese, and caramelized onions on golden toasted sourdough.",
    allergensEn: "Gluten, Dairy / Milk, Mustard",
    ingredients: [
      "Tütsülenmiş Dana Kaburga Eti",
      "Eritilmiş Olgunlaşmış Cheddar Peyniri",
      "Karamelize Soğan",
      "Tereyağlı Çıtır Ekşi Mayalı Ekmek",
    ],
    ingredientsEn: [
      "Tender Smoked Beef Short Ribs",
      "Rich Melted Aged Cheddar Cheese",
      "Caramelized Onions",
      "Buttered Crispy Artisan Sourdough",
    ],
  },
  "Artisan Cortado": {
    nameEn: "Artisan Cortado",
    descriptionEn: "Equal parts double ristretto and silky steamed milk. Spanish style balanced taste.",
    allergensEn: "Dairy / Milk",
    ingredients: [
      "Çift Shot Ristretto",
      "Kadifemsi Sıcak Süt Köpüğü",
    ],
    ingredientsEn: [
      "Double Shot Ristretto",
      "Velvety Steamed Milk Foam",
    ],
  },
  "Iced Spanish Latte": {
    nameEn: "Iced Spanish Latte",
    descriptionEn: "Double shot espresso over ice with condensed sweet milk and chilled milk.",
    allergensEn: "Dairy / Milk",
    ingredients: [
      "Duble Shot Espresso",
      "Yoğunlaştırılmış Tatlı Süt",
      "Soğuk Süt",
      "Buz",
    ],
    ingredientsEn: [
      "Double Espresso Shot",
      "Condensed Sweet Milk",
      "Cold Milk",
      "Ice",
    ],
  },
};

// ====================================================
// 3. DEFAULT EKSTRA & VARYANT GRUPLARI (Her ürün için)
// ====================================================
export function getDefaultExtraGroups(
  productName: string,
  categoryId: string,
  lang: Language = "tr"
): ProductExtraGroupItem[] {
  const isEn = lang === "en";
  const lowerName = productName.toLowerCase();

  // 1. KAHVELER VE SÜTLÜ İÇECEKLER
  if (
    lowerName.includes("latte") ||
    lowerName.includes("flat white") ||
    lowerName.includes("cortado") ||
    lowerName.includes("mocha") ||
    lowerName.includes("cappuccino") ||
    lowerName.includes("matcha") ||
    categoryId.includes("hot") ||
    categoryId.includes("cold") ||
    categoryId.includes("kahve") ||
    categoryId.includes("espresso")
  ) {
    const isMilkDrink =
      !lowerName.includes("espresso single") && !lowerName.includes("americano");

    const groups: ProductExtraGroupItem[] = [];

    // Süt Tercihi (Sütlü kahveler için)
    if (isMilkDrink) {
      groups.push({
        id: "grp-milk",
        productId: "",
        title: isEn ? "Milk Choice" : "Süt Tercihi",
        titleEn: "Milk Choice",
        isRequired: false,
        minSelect: 0,
        maxSelect: 1,
        order: 1,
        options: [
          {
            id: "opt-milk-whole",
            groupId: "grp-milk",
            name: isEn ? "Whole Farm Milk" : "Tam Yağlı Çiftlik Sütü",
            nameEn: "Whole Farm Milk",
            price: 0,
            order: 1,
          },
          {
            id: "opt-milk-oat",
            groupId: "grp-milk",
            name: isEn ? "Barista Oat Milk (Vegan)" : "Barista Yulaf Sütü (Vegan)",
            nameEn: "Barista Oat Milk (Vegan)",
            price: 25,
            order: 2,
          },
          {
            id: "opt-milk-almond",
            groupId: "grp-milk",
            name: isEn ? "Almond Milk" : "Badem Sütü",
            nameEn: "Almond Milk",
            price: 25,
            order: 3,
          },
          {
            id: "opt-milk-lactosefree",
            groupId: "grp-milk",
            name: isEn ? "Lactose-Free Milk" : "Laktozsuz Süt",
            nameEn: "Lactose-Free Milk",
            price: 15,
            order: 4,
          },
        ],
      });
    }

    // Ekstra Espresso Shot
    groups.push({
      id: "grp-shot",
      productId: "",
      title: isEn ? "Espresso Shot" : "Espresso Shot",
      titleEn: "Espresso Shot",
      isRequired: false,
      minSelect: 0,
      maxSelect: 1,
      order: 2,
      options: [
        {
          id: "opt-shot-std",
          groupId: "grp-shot",
          name: isEn ? "Standard Recipe" : "Standart Reçete",
          nameEn: "Standard Recipe",
          price: 0,
          order: 1,
        },
        {
          id: "opt-shot-extra",
          groupId: "grp-shot",
          name: isEn ? "Extra Espresso Shot (+1 Shot)" : "Ekstra Espresso Shot (+1 Shot)",
          nameEn: "Extra Espresso Shot (+1 Shot)",
          price: 35,
          order: 2,
        },
      ],
    });

    // Şurup & Aroma
    groups.push({
      id: "grp-syrup",
      productId: "",
      title: isEn ? "Artisan Flavor Syrup" : "Artisan Aroma Şurubu",
      titleEn: "Artisan Flavor Syrup",
      isRequired: false,
      minSelect: 0,
      maxSelect: 1,
      order: 3,
      options: [
        {
          id: "opt-syr-none",
          groupId: "grp-syrup",
          name: isEn ? "No Syrup" : "Şurupsuz",
          nameEn: "No Syrup",
          price: 0,
          order: 1,
        },
        {
          id: "opt-syr-vanilla",
          groupId: "grp-syrup",
          name: isEn ? "Madagascar Vanilla Syrup" : "Madagaskar Vanilya Şurubu",
          nameEn: "Madagascar Vanilla Syrup",
          price: 20,
          order: 2,
        },
        {
          id: "opt-syr-caramel",
          groupId: "grp-syrup",
          name: isEn ? "Salted Caramel Syrup" : "Tuzlu Karamel Şurubu",
          nameEn: "Salted Caramel Syrup",
          price: 20,
          order: 3,
        },
        {
          id: "opt-syr-hazelnut",
          groupId: "grp-syrup",
          name: isEn ? "Roasted Hazelnut Syrup" : "Kavrulmuş Fındık Şurubu",
          nameEn: "Roasted Hazelnut Syrup",
          price: 20,
          order: 4,
        },
      ],
    });

    return groups;
  }

  // 2. FIRIN & TATLILAR
  if (
    lowerName.includes("cheesecake") ||
    lowerName.includes("tiramisu") ||
    lowerName.includes("kruvasan") ||
    lowerName.includes("croissant") ||
    categoryId.includes("fırın") ||
    categoryId.includes("tatlı") ||
    categoryId.includes("bakery") ||
    categoryId.includes("dessert")
  ) {
    return [
      {
        id: "grp-sweet-serv",
        productId: "",
        title: isEn ? "Serving Options" : "Servis & Sos Tercihi",
        titleEn: "Serving Options",
        isRequired: false,
        minSelect: 0,
        maxSelect: 1,
        order: 1,
        options: [
          {
            id: "opt-sw-std",
            groupId: "grp-sweet-serv",
            name: isEn ? "Standard Service" : "Standart Sunum",
            nameEn: "Standard Service",
            price: 0,
            order: 1,
          },
          {
            id: "opt-sw-choc",
            groupId: "grp-sweet-serv",
            name: isEn ? "Extra Warm Belgian Chocolate (+₺30)" : "Ekstra Sıcak Belçika Çikolatası (+₺30)",
            nameEn: "Extra Warm Belgian Chocolate (+₺30)",
            price: 30,
            order: 2,
          },
          {
            id: "opt-sw-ice",
            groupId: "grp-sweet-serv",
            name: isEn ? "Vanilla Gelato Scoop (+₺45)" : "1 Top Vanilyalı Gelato Dondurma (+₺45)",
            nameEn: "Vanilla Gelato Scoop (+₺45)",
            price: 45,
            order: 3,
          },
        ],
      },
    ];
  }

  // 3. TOSTLAR & ATIŞTIRMALIKLAR
  if (
    lowerName.includes("tost") ||
    lowerName.includes("tartin") ||
    lowerName.includes("toast") ||
    categoryId.includes("tost") ||
    categoryId.includes("snack")
  ) {
    return [
      {
        id: "grp-toast-bread",
        productId: "",
        title: isEn ? "Bread Selection" : "Ekmek Tercihi",
        titleEn: "Bread Selection",
        isRequired: false,
        minSelect: 0,
        maxSelect: 1,
        order: 1,
        options: [
          {
            id: "opt-tb-sour",
            groupId: "grp-toast-bread",
            name: isEn ? "Artisan Sourdough Country Bread" : "Ekşi Mayalı Köy Ekmeği",
            nameEn: "Artisan Sourdough Country Bread",
            price: 0,
            order: 1,
          },
          {
            id: "opt-tb-gf",
            groupId: "grp-toast-bread",
            name: isEn ? "Gluten-Free Bread (+₺25)" : "Glutensiz Ekmek (+₺25)",
            nameEn: "Gluten-Free Bread (+₺25)",
            price: 25,
            order: 2,
          },
        ],
      },
      {
        id: "grp-toast-extra",
        productId: "",
        title: isEn ? "Extra Add-ons" : "Ekstra Malzeme",
        titleEn: "Extra Add-ons",
        isRequired: false,
        minSelect: 0,
        maxSelect: 2,
        order: 2,
        options: [
          {
            id: "opt-te-cheddar",
            groupId: "grp-toast-extra",
            name: isEn ? "Extra Melted Cheddar (+₺30)" : "Ekstra Eritilmiş Cheddar (+₺30)",
            nameEn: "Extra Melted Cheddar (+₺30)",
            price: 30,
            order: 1,
          },
          {
            id: "opt-te-jalapeno",
            groupId: "grp-toast-extra",
            name: isEn ? "Pickled Jalapeño (+₺15)" : "Jalapeno Biber Turşusu (+₺15)",
            nameEn: "Pickled Jalapeño (+₺15)",
            price: 15,
            order: 2,
          },
        ],
      },
    ];
  }

  return [];
}

// ====================================================
// 4. KATEGORİ LOKALİZASYON YARDIMCISI
// ====================================================
export function localizeCategory(category: CategoryItem, lang: Language): CategoryItem {
  const isEn = lang === "en";
  const mappedEn = categoryMap[category.name] || category.nameEn || category.name;

  return {
    ...category,
    nameEn: mappedEn,
    products: (category.products || []).map((p) => localizeProduct(p, lang)),
  };
}

// ====================================================
// 5. ÜRÜN LOKALİZASYON & İÇERİK YARDIMCISI
// ====================================================
export function localizeProduct(product: ProductItem, lang: Language): ProductItem {
  const isEn = lang === "en";
  const transData = productDataMap[product.name];

  const nameEn = product.nameEn || transData?.nameEn || product.name;
  const descriptionEn =
    product.descriptionEn || transData?.descriptionEn || product.description;
  const allergensEn = transData?.allergensEn || product.allergens;
  const ingredients = product.ingredients || transData?.ingredients || [];
  const ingredientsEn = product.ingredientsEn || transData?.ingredientsEn || [];

  // Varsa mevcut extraGroups, yoksa default varyantlar
  const extraGroups =
    product.extraGroups && product.extraGroups.length > 0
      ? product.extraGroups
      : getDefaultExtraGroups(product.name, product.categoryId, lang);

  return {
    ...product,
    nameEn,
    descriptionEn,
    ingredients,
    ingredientsEn,
    allergens: isEn && allergensEn ? allergensEn : product.allergens,
    extraGroups,
  };
}

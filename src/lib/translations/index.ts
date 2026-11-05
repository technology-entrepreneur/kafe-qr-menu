import {
  CategoryItem,
  ProductItem,
  ProductExtraGroupItem,
  CampaignItem,
  Language,
} from "@/types/menu";
export { SUPPORTED_LANGUAGES } from "@/types/menu";

// ====================================================
// 1. KATEGORİ ÇEVİRİ TABLOSU (5 DİL)
// ====================================================
export const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  "Sıcak Kahveler": {
    tr: "Sıcak Kahveler",
    en: "Hot Coffees",
    ar: "قهوة ساخنة",
    ru: "Горячий кофе",
    de: "Heiße Kaffees",
  },
  "Soğuk Kahveler": {
    tr: "Soğuk Kahveler",
    en: "Cold Coffees",
    ar: "قهوة باردة",
    ru: "Холодный кофе",
    de: "Kalte Kaffees",
  },
  "Soğuk Kahveler & Buzlu İçecekler": {
    tr: "Soğuk Kahveler & Buzlu İçecekler",
    en: "Cold Coffees & Iced Drinks",
    ar: "قهوة ومشروبات مثلجة",
    ru: "Холодный кофе и напитки",
    de: "Kalter Kaffee & Eistees",
  },
  "Espresso & Özel Kahveler": {
    tr: "Espresso & Özel Kahveler",
    en: "Espresso & Signature Coffees",
    ar: "إسبريسو وقهوة مميزة",
    ru: "Эспрессо и авторский кофе",
    de: "Espresso & Spezialitäten",
  },
  "Özel Çaylar & Matcha": {
    tr: "Özel Çaylar & Matcha",
    en: "Specialty Teas & Matcha",
    ar: "شاي وماتشا مميز",
    ru: "Чай и матча",
    de: "Teespezialitäten & Matcha",
  },
  "Fırın & Tatlılar": {
    tr: "Fırın & Tatlılar",
    en: "Bakery & Desserts",
    ar: "المخبوزات والحلويات",
    ru: "Выпечка и десерты",
    de: "Bäckerei & Desserts",
  },
  "Taze Fırın & Tatlılar": {
    tr: "Taze Fırın & Tatlılar",
    en: "Fresh Bakery & Desserts",
    ar: "مخبوزات طازجة وحلويات",
    ru: "Свежая выпечка и десерты",
    de: "Frische Backwaren & Desserts",
  },
  "Tost & Atıştırmalıklar": {
    tr: "Tost & Atıştırmalıklar",
    en: "Toasts & Snacks",
    ar: "توست ووجبات خفيفة",
    ru: "Тосты и закуски",
    de: "Toasts & Snacks",
  },
  "Tostlar & Atıştırmalıklar": {
    tr: "Tostlar & Atıştırmalıklar",
    en: "Toasts & Bites",
    ar: "توست ومقبلات خفيفة",
    ru: "Тосты и снеки",
    de: "Toasts & Kleinigkeiten",
  },
  "Özel Nargileler & Mix": {
    tr: "Özel Nargileler & Mix",
    en: "Hookah & Signature Mix",
    ar: "شيشة ونكهات مميزة",
    ru: "Кальяны и авторские миксы",
    de: "Shisha & Spezial-Mix",
  },
};

// ====================================================
// 2. ÜRÜN ÇEVİRİ TABLOSU (5 DİL)
// ====================================================
interface ProductLangItem {
  name: string;
  description: string;
  allergens?: string;
  ingredients?: string[];
}

export const PRODUCT_TRANSLATIONS: Record<string, Record<Language, ProductLangItem>> = {
  "Espresso Single / Double": {
    tr: {
      name: "Espresso Single / Double",
      description: "%100 Arabica Etiyopya Yirgacheffe çekirdeklerinden taze çekilmiş, yoğun gövdeli espresso.",
      allergens: "Yok",
      ingredients: ["%100 Arabica Kahve Çekirdeği", "Doğal Kaynak Suyu"],
    },
    en: {
      name: "Espresso Single / Double",
      description: "Freshly extracted shot from 100% Arabica Ethiopian beans with rich crema and bold body.",
      allergens: "None",
      ingredients: ["100% Arabica Beans", "Pure Spring Water"],
    },
    ar: {
      name: "إسبريسو فردي / مضاعف",
      description: "مستخلص طازج من حبوب البن الإثيوبية أرابيكا 100% مع قوام غني ونكهة عميقة.",
      allergens: "لا يوجد",
      ingredients: ["حبوب بن أرابيكا 100%", "مياه ينابيع نقية"],
    },
    ru: {
      name: "Эспрессо Одинарный / Двойной",
      description: "Свежесваренный эспрессо из 100% арабики из Эфиопии с плотной пенкой и ярким вкусом.",
      allergens: "Нет",
      ingredients: ["100% арабика", "Родниковая вода"],
    },
    de: {
      name: "Espresso Single / Double",
      description: "Frisch zubereiteter Espresso aus 100% äthiopischen Arabica-Bohnen mit feiner Crema.",
      allergens: "Keine",
      ingredients: ["100% Arabica Bohnen", "Quellwasser"],
    },
  },
  "Flat White": {
    tr: {
      name: "Flat White",
      description: "Çift shot ristretto espresso üzerine dökülen ipeksi kadife süt köpüğü. Yoğun kahve lezzeti.",
      allergens: "Süt",
      ingredients: ["Çift Shot Ristretto", "Buharlanmış Kadifemsi Tam Yağlı Süt"],
    },
    en: {
      name: "Flat White",
      description: "Double ristretto espresso delicately infused with micro-foamed velvety steamed milk.",
      allergens: "Dairy / Milk",
      ingredients: ["Double Shot Ristretto", "Velvety Micro-foamed Whole Milk"],
    },
    ar: {
      name: "فلات وايت",
      description: "جرعة مزدوجة من إسبريسو ريستريتو مع حليب مخفوق ناعم وحريري لنكهة قهوة قوية ومتوازنة.",
      allergens: "الحليب ومنتجاته",
      ingredients: ["دبل ريستريتو إسبريسو", "حليب طازج مبخر مخملي"],
    },
    ru: {
      name: "Флэт Уайт",
      description: "Двойной шот ристретто с шелковистой микропенкой цельного молока. Насыщенный кофейный вкус.",
      allergens: "Молоко / Лактоза",
      ingredients: ["Двойной ристретто", "Взбитое цельное молоко"],
    },
    de: {
      name: "Flat White",
      description: "Doppelter Ristretto-Espresso mit feinporig aufgeschäumter warmer Vollmilch.",
      allergens: "Milch / Laktose",
      ingredients: ["Doppelter Ristretto", "Feinporig gedämpfte Milch"],
    },
  },
  "Spanish Latte": {
    tr: {
      name: "Spanish Latte",
      description: "Duble espresso, yoğunlaştırılmış tatlı süt ve soğuk/sıcak sütün muazzam karamelize uyumu.",
      allergens: "Süt",
      ingredients: ["Duble Espresso", "Yoğunlaştırılmış Tatlı Süt", "Taze Süt"],
    },
    en: {
      name: "Spanish Latte",
      description: "Double espresso blended with sweet condensed milk and chilled or steamed whole milk.",
      allergens: "Dairy / Milk",
      ingredients: ["Double Espresso", "Sweet Condensed Milk", "Fresh Whole Milk"],
    },
    ar: {
      name: "سبانش لاتيه",
      description: "مزيج متناغم من الإسبريسو المزدوج والحليب المكثف المحلى مع حليب بارد أو ساخن.",
      allergens: "الحليب ومنتجاته",
      ingredients: ["دبل إسبريسو", "حليب مكثف محلى", "حليب طازج"],
    },
    ru: {
      name: "Испанский Латте",
      description: "Двойной эспрессо со сгущенным молоком и свежим молоком. Сладкий и гармоничный вкус.",
      allergens: "Молоко / Лактоза",
      ingredients: ["Двойной эспрессо", "Сгущенное молоко", "Свежее молоко"],
    },
    de: {
      name: "Spanish Latte",
      description: "Doppelter Espresso mit gezuckerter Kondensmilch und frischer Vollmilch harmonisch verfeinert.",
      allergens: "Milch / Laktose",
      ingredients: ["Doppelter Espresso", "Gezuckerte Kondensmilch", "Frische Vollmilch"],
    },
  },
  "Iced Spanish Latte": {
    tr: {
      name: "Buzlu Spanish Latte",
      description: "Buz üzerinde çift shot espresso, yoğunlaştırılmış tatlı süt ve soğuk sütün dengesi.",
      allergens: "Süt",
      ingredients: ["Duble Espresso", "Tatlı Yoğun Süt", "Soğuk Süt", "Buz"],
    },
    en: {
      name: "Iced Spanish Latte",
      description: "Double shot espresso over ice with sweet condensed milk and chilled whole milk.",
      allergens: "Dairy / Milk",
      ingredients: ["Double Espresso", "Condensed Milk", "Cold Milk", "Ice"],
    },
    ar: {
      name: "سبانش لاتيه مثلج",
      description: "إسبريسو مثلج مع حليب مكثف محلى وحليب بارد منعش.",
      allergens: "الحليب ومنتجاته",
      ingredients: ["دبل إسبريسو", "حليب مكثف محلى", "حليب بارد", "ثلج"],
    },
    ru: {
      name: "Айс Испанский Латте",
      description: "Двойной эспрессо со льдом, сгущенным и холодным молоком. Идеально освежает.",
      allergens: "Молоко / Лактоза",
      ingredients: ["Двойной эспрессо", "Сгущенное молоко", "Холодное молоко", "Лед"],
    },
    de: {
      name: "Iced Spanish Latte",
      description: "Doppelter Espresso auf Eis mit Kondensmilch und kalter Frischmilch.",
      allergens: "Milch / Laktose",
      ingredients: ["Doppelter Espresso", "Kondensmilch", "Kalte Milch", "Eiswürfel"],
    },
  },
  "Nitro Cold Brew": {
    tr: {
      name: "Nitro Cold Brew",
      description: "20 saat soğuk demlenmiş kahvenin nitrojen ile köpürtülmüş ipeksi ve ferahlatıcı sunumu.",
      allergens: "Yok",
      ingredients: ["20 Saat Soğuk Demleme Kahve", "Saf Nitrojen İnfüzyonu"],
    },
    en: {
      name: "Nitro Cold Brew",
      description: "20-hour cold-steeped coffee infused with nitrogen for an ultra-smooth, creamy draft pour.",
      allergens: "None",
      ingredients: ["20h Cold Steeped Coffee", "Pure Nitrogen Infusion"],
    },
    ar: {
      name: "نيترو كولد برو",
      description: "قهوة مقطرة على البارد لمدة 20 ساعة معززة بالنيتروجين لقوام كريمي مخملي ومنعش.",
      allergens: "لا يوجد",
      ingredients: ["قهوة مقطرة باردة لمدة 20 ساعة", "نيتروجين نقي"],
    },
    ru: {
      name: "Нитро Колд Брю",
      description: "Холодное заваривание 20 часов с насыщением азотом. Сливочная текстура без добавления молока.",
      allergens: "Нет",
      ingredients: ["Холодное кофе 20 часов", "Чистый пищевой азот"],
    },
    de: {
      name: "Nitro Cold Brew",
      description: "20 Stunden kalt extrahierter Kaffee, mit Stickstoff gezapft für samtig-cremigen Genuss.",
      allergens: "Keine",
      ingredients: ["20h Cold Brew Kaffee", "Reiner Stickstoff"],
    },
  },
  "Iced Caramel Macchiato": {
    tr: {
      name: "Iced Caramel Macchiato",
      description: "Buz, vanilya aromalı soğuk süt, espresso ve üzerinde zengin akışkan karamel sosu.",
      allergens: "Süt",
      ingredients: ["Espresso", "Vanilyalı Soğuk Süt", "Karamel Sosu", "Buz"],
    },
    en: {
      name: "Iced Caramel Macchiato",
      description: "Ice, vanilla-flavored chilled milk, double espresso topped with rich caramel drizzle.",
      allergens: "Dairy / Milk",
      ingredients: ["Espresso", "Vanilla Chilled Milk", "Caramel Sauce", "Ice"],
    },
    ar: {
      name: "كراميل ماكياتو مثلج",
      description: "ثلج، حليب بارد بنكهة الفانيليا، إسبريسو مع صلصة الكراميل الذهبية اللذيذة.",
      allergens: "الحليب ومنتجاته",
      ingredients: ["إسبريسو", "حليب بارد بالفانيليا", "صلصة كراميل", "ثلج"],
    },
    ru: {
      name: "Айс Карамель Макиато",
      description: "Лед, ванильное молоко, двойной эспрессо и аппетитный карамельный топпинг.",
      allergens: "Молоко / Лактоза",
      ingredients: ["Эспрессо", "Ванильное молоко", "Карамельный соус", "Лед"],
    },
    de: {
      name: "Iced Caramel Macchiato",
      description: "Eis, Vanillemilch, Espresso und feinste flüssige Karamellsauce.",
      allergens: "Milch / Laktose",
      ingredients: ["Espresso", "Vanille-Milch", "Karamellsauce", "Eiswürfel"],
    },
  },
  "San Sebastian Cheesecake": {
    tr: {
      name: "San Sebastian Cheesecake",
      description: "Akışkan iç dokulu, karamelize yanık kabuklu orijinal Bask peynir keki. Sıcak Belçika çikolatasıyla.",
      allergens: "Süt, Yumurta, Gluten",
      ingredients: ["Taze Krem Peynir", "Krema", "Yumurta", "Eritilmiş Sıcak Callebaut Çikolata"],
    },
    en: {
      name: "San Sebastian Cheesecake",
      description: "Creamy molten Basque burnt cheesecake served with warm melted Belgian chocolate.",
      allergens: "Dairy, Eggs, Gluten",
      ingredients: ["Cream Cheese", "Heavy Cream", "Eggs", "Melted Callebaut Chocolate"],
    },
    ar: {
      name: "سان سيباستيان تشيز كيك",
      description: "تشيز كيك الباسك المحروق الشهير بقوام كريمي ذائب مع صوص الشوكولاتة البلجيكية الساخنة.",
      allergens: "حليب، بيض، غلوتين",
      ingredients: ["جبنة كريمية طازجة", "كريمة ثقيلة", "بيض", "شوكولاتة بلجيكية ذائبة"],
    },
    ru: {
      name: "Чизкейк Сан Себастьян",
      description: "Нежный баскский чизкейк с карамелизированной корочкой и горячим бельгийским шоколадом.",
      allergens: "Молоко, Яйца, Глютен",
      ingredients: ["Сливочный сыр", "Сливки", "Яйца", "Бельгийский шоколад"],
    },
    de: {
      name: "San Sebastian Cheesecake",
      description: "Original baskischer Brand-Käsekuchen mit cremigem Kern und heißer belgischer Schokolade.",
      allergens: "Milch, Eier, Gluten",
      ingredients: ["Frischkäse", "Sahne", "Eier", "Belgische Schokolade"],
    },
  },
  "Tereyağlı Çıtır Kruvasan": {
    tr: {
      name: "Tereyağlı Çıtır Kruvasan",
      description: "Fransız tereyağlı kat kat çıtır taze fırın kruvasan. Reçel ve tereyağı eşliğinde.",
      allergens: "Gluten, Süt, Yumurta",
      ingredients: ["Fransız Tereyağı", "Kat Kat Açılmış Kruvasan Hamuru"],
    },
    en: {
      name: "French Butter Croissant",
      description: "Flaky and golden artisan butter croissant baked fresh daily, served with butter & jam.",
      allergens: "Gluten, Dairy, Eggs",
      ingredients: ["French Butter", "Artisan Layered Pastry"],
    },
    ar: {
      name: "كرواسون فرنسي بالزبدة",
      description: "كرواسون مقرمش وذهبي محضر بالزبدة الفرنسية الفاخرة طازج يومياً مع الزبدة والمربى.",
      allergens: "غلوتين، حليب، بيض",
      ingredients: ["زبدة فرنسية", "عجينة مورقة هشة"],
    },
    ru: {
      name: "Французский круассан на масле",
      description: "Воздушный хрустящий круассан на натуральном сливочном масле. Подается с джемом.",
      allergens: "Глютен, Молоко, Яйца",
      ingredients: ["Французское масло", "Слоеное тесто"],
    },
    de: {
      name: "Butter-Croissant",
      description: "Knusprig-buttriges französisches Croissant, frisch gebacken mit Marmelade und Butter.",
      allergens: "Gluten, Milch, Eier",
      ingredients: ["Französische Butter", "Feiner Blätterteig"],
    },
  },
  "Füme Kaburga & Cheddar Tost": {
    tr: {
      name: "Füme Kaburga & Cheddar Tost",
      description: "Ekşi mayalı ekmek arasında meşe odununda tütsülenmiş kaburga eti ve erimiş sarı cheddar.",
      allergens: "Gluten, Süt",
      ingredients: ["Ekşi Mayalı Ekmek", "Füme Dana Kaburga", "İngiliz Sarı Cheddar", "Hardal Sos"],
    },
    en: {
      name: "Smoked Rib & Cheddar Toast",
      description: "Artisan sourdough toast loaded with slow-smoked beef ribs, melted sharp cheddar & dijonnaise.",
      allergens: "Gluten, Dairy",
      ingredients: ["Sourdough Bread", "Smoked Beef Ribs", "Sharp Cheddar", "Dijon Mustard"],
    },
    ar: {
      name: "توست أضلاع مدخنة وشيدر",
      description: "توست العجين المخمر مع أضلاع بقري مدخنة ببطء وجبنة شيدر ذائبة شهية.",
      allergens: "غلوتين، حليب",
      ingredients: ["خبز العجين المخمر", "لحم بقر مدخن", "جبن شيدر ذائب", "صلصة ديجون"],
    },
    ru: {
      name: "Тост с копчеными ребрышками и чеддером",
      description: "Тост на ремесленном хлебе с сочной копченой говядиной и тающим сыром чеддер.",
      allergens: "Глютен, Молоко",
      ingredients: ["Ремесленный хлеб", "Копченая говядина", "Сыр чеддер"],
    },
    de: {
      name: "Smoked Rib & Cheddar Toast",
      description: "Sauerteig-Toast mit saftigem geräuchertem Rindfleisch und geschmolzenem Cheddar.",
      allergens: "Gluten, Milch",
      ingredients: ["Sauerteigbrot", "Geräuchertes Rindfleisch", "Cheddarkäse"],
    },
  },
  "Love 66 (Kavun, Karpuz, Nane)": {
    tr: {
      name: "Love 66 (Kavun, Karpuz, Nane)",
      description: "Yaz akşamlarının efsanevi aroması: tatlı kavun, taze karpuz ve buzlu nane ferahlığı.",
      allergens: "Tütün Ürünü (18+)",
      ingredients: ["Premium Tütün", "Doğal Nektar", "Buzlu Nane"],
    },
    en: {
      name: "Love 66 (Melon, Watermelon, Mint)",
      description: "Legendary mix of sweet honey melon, refreshing summer watermelon and chilled mint.",
      allergens: "Tobacco Product (18+)",
      ingredients: ["Premium Hookah Tobacco", "Natural Fruit Essence"],
    },
    ar: {
      name: "لوف 66 (شمام، بطيخ، نعناع)",
      description: "النكهة الأسطورية المنعشة: شمام حلو مع بطيخ الصيف ولمسة نعناع مثلجة.",
      allergens: "منتج تبغ (18+)",
      ingredients: ["تبغ فاخر", "نكهة فواكه طبيعية"],
    },
    ru: {
      name: "Love 66 (Дыня, Арбуз, Мята)",
      description: "Легендарный свежий микс сладкой медовой дыни, сочного арбуза и прохладной мяты.",
      allergens: "Табачное изделие (18+)",
      ingredients: ["Премиальный табак", "Натуральные ароматизаторы"],
    },
    de: {
      name: "Love 66 (Melone, Wassermelone, Minze)",
      description: "Der legendäre Mix aus süßer Honigmelone, reifer Wassermelone und kühler Minze.",
      allergens: "Tabakprodukt (18+)",
      ingredients: ["Premium Shisha Tabak", "Fruchtaroma"],
    },
  },
  "Lady Killer (Kavun, Mango, Orman Meyvesi)": {
    tr: {
      name: "Lady Killer (Kavun, Mango, Orman Meyvesi)",
      description: "Tatlı mango, sulu kavun ve yabani böğürtlenlerin buzlu nane ile egzotik buluşması.",
      allergens: "Tütün Ürünü (18+)",
      ingredients: ["Premium Tütün", "Mango & Böğürtlen Özü"],
    },
    en: {
      name: "Lady Killer (Melon, Mango, Forest Berry)",
      description: "Exotic fusion of sweet mango, juicy melon, and wild berries with ice chill finish.",
      allergens: "Tobacco Product (18+)",
      ingredients: ["Premium Tobacco", "Exotic Berry Essence"],
    },
    ar: {
      name: "ليدي كيلر (شمام، مانجو، توت بري)",
      description: "مزيج استوائي رائع من المانجو الحلو والشمام والتوت البري مع انتعاش الثلج.",
      allergens: "منتج تبغ (18+)",
      ingredients: ["تبغ فاخر", "نكهات فواكه استوائية"],
    },
    ru: {
      name: "Lady Killer (Дыня, Манго, Лесные ягоды)",
      description: "Экзотическое сочетание сладкого манго, дыни и диких ягод с морозной свежестью.",
      allergens: "Табачное изделие (18+)",
      ingredients: ["Премиальный табак", "Экзотические ягоды"],
    },
    de: {
      name: "Lady Killer (Melone, Mango, Waldbeeren)",
      description: "Exotische Mischung aus Mango, Melone und Waldbeeren mit eiskaltem Finish.",
      allergens: "Tabakprodukt (18+)",
      ingredients: ["Premium Tabak", "Frucht- und Beerenextrakte"],
    },
  },
  "Geleneksel Çift Elma (Anasonlu)": {
    tr: {
      name: "Geleneksel Çift Elma (Anasonlu)",
      description: "Klasik nargile tutkunlarının vazgeçilmezi: yoğun anason ve kırmızı/yeşil elma aroması.",
      allergens: "Tütün Ürünü (18+)",
      ingredients: ["Klasik Çift Elma Tütünü", "Doğal Anason"],
    },
    en: {
      name: "Traditional Double Apple (Anise)",
      description: "The timeless heritage classic: bold red and green apples balanced with aromatic anise.",
      allergens: "Tobacco Product (18+)",
      ingredients: ["Traditional Apple Tobacco", "Natural Anise"],
    },
    ar: {
      name: "تفاحتين تقليدي (يانسون)",
      description: "الأصالة الكلاسيكية لعشاق الشيشة: تفاح أحمر وأخضر مع لمسة يانسون مميزة.",
      allergens: "منتج تبغ (18+)",
      ingredients: ["تبغ تفاحتين تقليدي", "يانسون طبيعي"],
    },
    ru: {
      name: "Двойное Яблоко с Анисом",
      description: "Вечная восточная классика: насыщенное зеленое и красное яблоко с терпким анисом.",
      allergens: "Табачное изделие (18+)",
      ingredients: ["Классический табак", "Натуральный анис"],
    },
    de: {
      name: "Traditioneller Doppelapfel (Anis)",
      description: "Der zeitlose Shisha-Klassiker: Roter und grüner Apfel mit aromatischem Anis.",
      allergens: "Tabakprodukt (18+)",
      ingredients: ["Traditioneller Apfeltabak", "Natürliches Anis"],
    },
  },
};

// ====================================================
// 3. UI ÇEVİRİ SÖZLÜĞÜ (5 DİL)
// ====================================================
export const UI_TRANSLATIONS: Record<string, Record<Language, string>> = {
  home: { tr: "Giriş", en: "Home", ar: "الرئيسية", ru: "Главная", de: "Startseite" },
  menu: { tr: "Menü", en: "Menu", ar: "القائمة", ru: "Меню", de: "Speisekarte" },
  searchPlaceholder: {
    tr: "Menüde ara (kahve, tatlı, alerjen...)",
    en: "Search menu (coffee, dessert, allergens...)",
    ar: "ابحث في القائمة (قهوة، حلويات...)",
    ru: "Поиск в меню (кофе, десерты...)",
    de: "Im Menü suchen (Kaffee, Dessert...)",
  },
  searchResults: { tr: "Arama Sonuçları", en: "Search Results", ar: "نتائج البحث", ru: "Результаты поиска", de: "Suchergebnisse" },
  noResults: { tr: "Sonuç bulunamadı", en: "No results found", ar: "لم يتم العثور على نتائج", ru: "Ничего не найдено", de: "Keine Ergebnisse" },
  table: { tr: "Masa", en: "Table", ar: "طاولة", ru: "Стол", de: "Tisch" },
  cart: { tr: "Sepet", en: "Cart", ar: "السلة", ru: "Корзина", de: "Warenkorb" },
  orderTray: { tr: "Sipariş Sepeti", en: "Order Tray", ar: "سلة الطلبات", ru: "Корзина заказа", de: "Bestellkorb" },
  viewCart: { tr: "Sepeti Gör", en: "View Cart", ar: "عرض السلة", ru: "Корзина", de: "Warenkorb ansehen" },
  sendOrder: { tr: "Siparişi Gönder", en: "Send Order", ar: "إرسال الطلب", ru: "Отправить заказ", de: "Bestellung absenden" },
  sending: { tr: "Gönderiliyor...", en: "Sending...", ar: "جاري الإرسال...", ru: "Отправка...", de: "Wird gesendet..." },
  orderSent: { tr: "Sipariş Alındı", en: "Order Sent", ar: "تم استلام الطلب", ru: "Заказ принят", de: "Bestellung aufgegeben" },
  orderSentDesc: {
    tr: "Siparişiniz doğrudan mutfak ve bara iletildi.",
    en: "Your order was sent directly to kitchen & bar.",
    ar: "تم إرسال طلبك مباشرة إلى المطبخ والبار.",
    ru: "Ваш заказ отправлен на кухню и в бар.",
    de: "Ihre Bestellung wurde direkt an Küche & Bar gesendet.",
  },
  backToMenu: { tr: "Menüye Dön", en: "Back to Menu", ar: "العودة للقائمة", ru: "Вернуться в меню", de: "Zurück zum Menü" },
  clearTray: { tr: "Sepeti Boşalt", en: "Clear Tray", ar: "إفراغ السلة", ru: "Очистить корзину", de: "Korb leeren" },
  emptyTray: { tr: "Sepetiniz henüz boş", en: "Your tray is empty", ar: "السلة فارغة حالياً", ru: "В корзине пока пусто", de: "Ihr Korb ist noch leer" },
  total: { tr: "Toplam", en: "Total", ar: "المجموع", ru: "Итого", de: "Gesamt" },
  options: { tr: "Seçenekler", en: "Options", ar: "خيارات", ru: "Опции", de: "Optionen" },
  addToCart: { tr: "Sepete Ekle", en: "Add to Tray", ar: "أضف إلى السلة", ru: "Добавить", de: "Hinzufügen" },
  outOfStock: { tr: "Tükendi", en: "Sold Out", ar: "نفذت الكمية", ru: "Закончилось", de: "Ausverkauft" },
  close: { tr: "Kapat", en: "Close", ar: "إغلاق", ru: "Закрыть", de: "Schließen" },
  wifi: { tr: "Wi-Fi", en: "Wi-Fi", ar: "واي فاي", ru: "Wi-Fi", de: "WLAN" },
  wifiCopied: { tr: "Şifre Kopyalandı!", en: "Password Copied!", ar: "تم نسخ كلمة المرور!", ru: "Пароль скопирован!", de: "Passwort kopiert!" },
  callWaiter: { tr: "Garson / Hesap", en: "Call Waiter", ar: "استدعاء النادل", ru: "Официант / Счет", de: "Kellner rufen" },
  callWaiterOnly: { tr: "Garson Çağır", en: "Call Waiter", ar: "استدعاء النادل", ru: "Вызов официанта", de: "Kellner rufen" },
  askBill: { tr: "Hesap İste", en: "Request Bill", ar: "طلب الفاتورة", ru: "Попросить счет", de: "Rechnung anfordern" },
  tab: { tr: "Masa Hesabım", en: "My Tab", ar: "حساب الطاولة", ru: "Счет стола", de: "Tischrechnung" },
  splitBill: { tr: "Hesabı Bölüş (Alman Usulü)", en: "Split Bill", ar: "تقسيم الفاتورة", ru: "Разделить счет", de: "Rechnung aufteilen" },
  equalSplit: { tr: "Eşit Bölüşüm", en: "Equal Split", ar: "تقسيم متساوي", ru: "Поровну", de: "Zu gleichen Teilen" },
  itemizedSplit: { tr: "Ürün Bazlı", en: "By Items", ar: "حسب الأطباق", ru: "По позициям", de: "Nach Artikeln" },
  people: { tr: "Kişi Sayısı", en: "People", ar: "عدد الأشخاص", ru: "Человек", de: "Personen" },
  perPerson: { tr: "Kişi Başı", en: "Per Person", ar: "للشخص", ru: "С человека", de: "Pro Person" },
  tip: { tr: "Bahşiş", en: "Tip", ar: "إكرامية", ru: "Чаевые", de: "Trinkgeld" },
  myShare: { tr: "Benim Payım", en: "My Share", ar: "حصتي", ru: "Моя доля", de: "Mein Anteil" },
  allergens: { tr: "Alerjenler", en: "Allergens", ar: "مسببات الحساسية", ru: "Аллергены", de: "Allergene" },
  calories: { tr: "Kalori", en: "Calories", ar: "السعرات", ru: "Калории", de: "Kalorien" },
  prepTime: { tr: "Hazırlık", en: "Prep Time", ar: "وقت التحضير", ru: "Время", de: "Zubereitung" },
  ingredients: { tr: "İçindekiler", en: "Ingredients", ar: "المكونات", ru: "Состав", de: "Zutaten" },
  specialNote: { tr: "Özel İstek / Not", en: "Special Note", ar: "ملاحظات خاصة", ru: "Пожелания", de: "Besondere Wünsche" },
  specialNotePlaceholder: {
    tr: "Az şekerli, ekstra sıcak, buzsuz vb...",
    en: "Less sweet, extra hot, no ice etc...",
    ar: "سكر خفيف، ساخن جداً، بدون ثلج...",
    ru: "Меньше сахара, погорячее, без льда...",
    de: "Weniger süß, extra heiß, ohne Eis...",
  },
  crossSellTitle: {
    tr: "Bunun Yanında Harika Gider",
    en: "Pairs Wonderfully With",
    ar: "يناسب هذا الطلب بشكل رائع",
    ru: "Отлично сочетается с",
    de: "Passt hervorragend zu",
  },
  reviewTitle: { tr: "5 Yıldızlı Deneyim", en: "5-Star Experience", ar: "تجربة 5 نجوم", ru: "5-звездочный опыт", de: "5-Sterne-Erlebnis" },
  reviewDesc: {
    tr: "Bizi Google'da değerlendirerek destek olun!",
    en: "Support us with a 5-star Google review!",
    ar: "ادعمنا بتقييم 5 نجوم على جوجل!",
    ru: "Поддержите нас отзывом в Google!",
    de: "Unterstützen Sie uns mit einer 5-Sterne Google-Bewertung!",
  },
  reviewBtn: { tr: "5 Yıldız Ver", en: "Rate 5 Stars", ar: "تقييم 5 نجوم", ru: "Оценить 5 звезд", de: "5 Sterne geben" },
  selectLanguage: { tr: "Dil Değiştir", en: "Change Language", ar: "تغيير اللغة", ru: "Сменить язык", de: "Sprache ändern" },
  cash: { tr: "Nakit", en: "Cash", ar: "نقداً", ru: "Наличные", de: "Bargeld" },
  creditCard: { tr: "Kredi Kartı", en: "Credit Card", ar: "بطاقة ائتمان", ru: "Карта", de: "Kreditkarte" },
  hookahCoal: { tr: "Köz Değişimi", en: "Coal Change", ar: "تغيير الفحم", ru: "Замена углей", de: "Kohle wechseln" },
  selectOrEnterTable: {
    tr: "Masa Numaranızı Girin veya Seçin",
    en: "Enter or Select Table Number",
    ar: "أدخل أو اختر رقم الطاولة",
    ru: "Введите или выберите номер стола",
    de: "Tischnummer eingeben oder wählen",
  },
  tableRequiredNotice: {
    tr: "Siparişinizin masanıza ulaşması için lütfen masa numaranızı seçin.",
    en: "Please select your table number so your order can be delivered.",
    ar: "يرجى اختيار رقم الطاولة لتوصيل طلبك.",
    ru: "Пожалуйста, выберите номер стола для доставки заказа.",
    de: "Bitte wählen Sie Ihre Tischnummer für die Lieferung.",
  },
  selectTablePill: {
    tr: "Masa Seç",
    en: "Select Table",
    ar: "اختر طاولة",
    ru: "Выбрать стол",
    de: "Tisch wählen",
  },
  changeTable: {
    tr: "Değiştir",
    en: "Change",
    ar: "تغيير",
    ru: "Изменить",
    de: "Ändern",
  },
  specialOffers: {
    tr: "Günün Fırsatları",
    en: "Special Offers",
    ar: "عروض اليوم",
    ru: "Спецпредложения",
    de: "Tagesangebote",
  },
  viewDeal: {
    tr: "İncele",
    en: "View",
    ar: "عرض",
    ru: "Посмотреть",
    de: "Ansehen",
  },
  scroll: {
    tr: "Kaydır →",
    en: "Scroll →",
    ar: "اسحب ←",
    ru: "Листайте →",
    de: "Wischen →",
  },
};

export function t(key: string, lang: Language): string {
  const entry = UI_TRANSLATIONS[key];
  if (!entry) return key;
  return entry[lang] || entry.en || entry.tr || key;
}

// ====================================================
// 4. EXTRA SEÇENEKLER (Varyasyonlar) 5 DİLDE
// ====================================================
export function getLocalizedExtraGroups(
  productName: string,
  categoryId: string,
  lang: Language
): ProductExtraGroupItem[] {
  const lower = productName.toLowerCase();
  const isCoffee =
    lower.includes("latte") ||
    lower.includes("white") ||
    lower.includes("cappuccino") ||
    lower.includes("macchiato") ||
    lower.includes("cortado") ||
    lower.includes("mocha") ||
    categoryId.includes("hot") ||
    categoryId.includes("espresso");

  if (isCoffee) {
    const milkTitle: Record<Language, string> = {
      tr: "Süt Tercihi",
      en: "Milk Choice",
      ar: "نوع الحليب",
      ru: "Выбор молока",
      de: "Milchsorte",
    };

    const syrupTitle: Record<Language, string> = {
      tr: "Aroma & Şurup",
      en: "Syrup & Flavor",
      ar: "نكهة وشراب",
      ru: "Сироп и аромат",
      de: "Sirup & Aroma",
    };

    return [
      {
        id: "grp-milk",
        productId: "",
        title: milkTitle[lang] || milkTitle.tr,
        isRequired: false,
        minSelect: 0,
        maxSelect: 1,
        order: 1,
        options: [
          {
            id: "opt-m1",
            groupId: "grp-milk",
            name: { tr: "Tam Yağlı Süt (Standart)", en: "Whole Milk (Standard)", ar: "حليب كامل الدسم (افتراضي)", ru: "Цельное молоко (стандарт)", de: "Vollmilch (Standard)" }[lang],
            price: 0,
            order: 1,
          },
          {
            id: "opt-m2",
            groupId: "grp-milk",
            name: { tr: "Yulaf Sütü (+₺25)", en: "Oat Milk (+₺25)", ar: "حليب الشوفان (+25 ₺)", ru: "Овсяное молоко (+₺25)", de: "Hafermilch (+₺25)" }[lang],
            price: 25,
            order: 2,
          },
          {
            id: "opt-m3",
            groupId: "grp-milk",
            name: { tr: "Badem Sütü (+₺25)", en: "Almond Milk (+₺25)", ar: "حليب اللوز (+25 ₺)", ru: "Миндальное молоко (+₺25)", de: "Mandelmilch (+₺25)" }[lang],
            price: 25,
            order: 3,
          },
          {
            id: "opt-m4",
            groupId: "grp-milk",
            name: { tr: "Laktozsuz Süt (+₺15)", en: "Lactose-Free Milk (+₺15)", ar: "حليب خالي من اللاكتوز (+15 ₺)", ru: "Безлактозное молоко (+₺15)", de: "Laktosefreie Milch (+₺15)" }[lang],
            price: 15,
            order: 4,
          },
        ],
      },
      {
        id: "grp-syrup",
        productId: "",
        title: syrupTitle[lang] || syrupTitle.tr,
        isRequired: false,
        minSelect: 0,
        maxSelect: 2,
        order: 2,
        options: [
          {
            id: "opt-s1",
            groupId: "grp-syrup",
            name: { tr: "Karamel Şurubu (+₺20)", en: "Caramel Syrup (+₺20)", ar: "شراب الكراميل (+20 ₺)", ru: "Карамельный сироп (+₺20)", de: "Karamellsirup (+₺20)" }[lang],
            price: 20,
            order: 1,
          },
          {
            id: "opt-s2",
            groupId: "grp-syrup",
            name: { tr: "Vanilya Şurubu (+₺20)", en: "Vanilla Syrup (+₺20)", ar: "شراب الفانيليا (+20 ₺)", ru: "Ванильный сироп (+₺20)", de: "Vanillesirup (+₺20)" }[lang],
            price: 20,
            order: 2,
          },
          {
            id: "opt-s3",
            groupId: "grp-syrup",
            name: { tr: "Fındık Şurubu (+₺20)", en: "Hazelnut Syrup (+₺20)", ar: "شراب البندق (+20 ₺)", ru: "Ореховый сироп (+₺20)", de: "Haselnusssirup (+₺20)" }[lang],
            price: 20,
            order: 3,
          },
        ],
      },
    ];
  }

  // Tost & Yiyecek
  if (lower.includes("tost") || lower.includes("toast") || categoryId.includes("tost")) {
    const breadTitle: Record<Language, string> = {
      tr: "Ekmek Tercihi",
      en: "Bread Selection",
      ar: "نوع الخبز",
      ru: "Выбор хлеба",
      de: "Brotsorte",
    };

    return [
      {
        id: "grp-bread",
        productId: "",
        title: breadTitle[lang] || breadTitle.tr,
        isRequired: false,
        minSelect: 0,
        maxSelect: 1,
        order: 1,
        options: [
          {
            id: "opt-b1",
            groupId: "grp-bread",
            name: { tr: "Ekşi Mayalı Köy Ekmeği", en: "Artisan Sourdough", ar: "خبز العجين المخمر", ru: "Ремесленный тартин", de: "Sauerteigbrot" }[lang],
            price: 0,
            order: 1,
          },
          {
            id: "opt-b2",
            groupId: "grp-bread",
            name: { tr: "Glutensiz Ekmek (+₺25)", en: "Gluten-Free Bread (+₺25)", ar: "خبز خالي من الغلوتين (+25 ₺)", ru: "Безглютеновый хлеб (+₺25)", de: "Glutenfreies Brot (+₺25)" }[lang],
            price: 25,
            order: 2,
          },
        ],
      },
    ];
  }

  return [];
}

// ====================================================
// 5. KATEGORİ VE ÜRÜN LOKALİZASYONU
// ====================================================
export function localizeCategory(category: CategoryItem, lang: Language): CategoryItem {
  const catTrans = CATEGORY_TRANSLATIONS[category.name];
  const localizedName = catTrans ? (catTrans[lang] || catTrans.tr) : category.name;

  return {
    ...category,
    name: localizedName,
    nameEn: localizedName,
    products: (category.products || []).map((p) => localizeProduct(p, lang)),
  };
}

export function localizeProduct(product: ProductItem, lang: Language): ProductItem {
  const pTrans = PRODUCT_TRANSLATIONS[product.name]?.[lang];

  const localizedName = pTrans?.name || product.nameEn || product.name;
  const localizedDesc = pTrans?.description || product.descriptionEn || product.description;
  const localizedAllergens = pTrans?.allergens || product.allergens;
  const localizedIngredients = pTrans?.ingredients || product.ingredients;

  const extraGroups =
    product.extraGroups && product.extraGroups.length > 0
      ? product.extraGroups
      : getLocalizedExtraGroups(product.name, product.categoryId, lang);

  return {
    ...product,
    name: localizedName,
    nameEn: localizedName,
    description: localizedDesc,
    descriptionEn: localizedDesc,
    allergens: localizedAllergens,
    ingredients: localizedIngredients,
    extraGroups,
  };
}

// ====================================================
// 6. ROZET (BADGE) ÇEVİRİSİ
// ====================================================
export function getBadgeLabel(badge: string | null | undefined, lang: Language): string | null {
  if (!badge) return null;
  const map: Record<string, Record<Language, string>> = {
    chef: { tr: "Şefin Seçimi", en: "Chef's Choice", ar: "اختيار الشيف", ru: "Выбор шефа", de: "Chef-Tipp" },
    popular: { tr: "Popüler", en: "Popular", ar: "الأكثر طلباً", ru: "Популярное", de: "Beliebt" },
    deal: { tr: "Günün Fırsatı", en: "Special Offer", ar: "عرض مميز", ru: "Спецпредложение", de: "Tagesangebot" },
    new: { tr: "Yeni", en: "New", ar: "جديد", ru: "Новинка", de: "Neu" },
  };
  return map[badge]?.[lang] || map[badge]?.tr || badge;
}

// ====================================================
// 7. KAMPANYA & FIRSAT KARTLARI ÇEVİRİSİ (5 DİL)
// ====================================================
interface CampaignLangItem {
  title: string;
  subtitle: string;
  badgeText: string;
}

export const CAMPAIGN_TRANSLATIONS: Record<string, Record<Language, CampaignLangItem>> = {
  "Latte + San Sebastian Menüsü": {
    tr: {
      title: "Latte + San Sebastian Menüsü",
      subtitle: "Kadifemsi sıcak latte ile akışkan Belçika çikolatalı cheesecake",
      badgeText: "GÜNÜN FIRSATI",
    },
    en: {
      title: "Latte + San Sebastian Combo",
      subtitle: "Velvety hot latte paired with molten Belgian chocolate Basque cheesecake",
      badgeText: "DEAL OF THE DAY",
    },
    ar: {
      title: "عرض لاتيه + سان سيباستيان",
      subtitle: "لاتيه ساخن مخملي مع تشيز كيك الباسك وشوكولاتة بلجيكية ذائبة",
      badgeText: "عرض اليوم",
    },
    ru: {
      title: "Комбо Латте + Сан Себастьян",
      subtitle: "Бархатистый горячий латте и баскский чизкейк с бельгийским шоколадом",
      badgeText: "ПРЕДЛОЖЕНИЕ ДНЯ",
    },
    de: {
      title: "Latte + San Sebastian Menü",
      subtitle: "Samtiger heißer Latte mit cremigem Käsekuchen und belgischer Schokolade",
      badgeText: "ANGEBOT DES TAGES",
    },
  },
  "Kruvasan & Filtre Kahve İkilisi": {
    tr: {
      title: "Kruvasan & Filtre Kahve İkilisi",
      subtitle: "Güne çıtır Fransız tereyağlı kruvasan ve taze demlenmiş kahveyle başlayın",
      badgeText: "KAHVALTI FIRSATI",
    },
    en: {
      title: "Croissant & Drip Coffee Duo",
      subtitle: "Start your morning with a flaky butter croissant and freshly brewed coffee",
      badgeText: "BREAKFAST DEAL",
    },
    ar: {
      title: "ثنائي كرواسون وقهوة مقطرة",
      subtitle: "ابدأ صباحك بكرواسون فرنسي بالزبدة مع قهوة طازجة",
      badgeText: "عرض الإفطار",
    },
    ru: {
      title: "Круассан и Фильтр-кофе",
      subtitle: "Начните день с хрустящего круассана на сливочном масле и свежего кофе",
      badgeText: "ЗАВТРАК ДНЯ",
    },
    de: {
      title: "Croissant & Filterkaffee Duo",
      subtitle: "Starten Sie den Tag mit einem knusprigen Butter-Croissant und frischem Kaffee",
      badgeText: "FRÜHSTÜCKS-DEAL",
    },
  },
  "2. Soğuk İçecekte %30 İndirim": {
    tr: {
      title: "2. Soğuk İçecekte %30 İndirim",
      subtitle: "Arkadaşınızla birlikte ferahlayın, 2. Iced Latte veya Cold Brew anında indirimli",
      badgeText: "ÇİFTE KEYİF",
    },
    en: {
      title: "30% Off on 2nd Iced Drink",
      subtitle: "Cool down with friends: 2nd Iced Latte or Cold Brew is 30% off",
      badgeText: "DOUBLE JOY",
    },
    ar: {
      title: "خصم 30% على المشروب البارد الثاني",
      subtitle: "انتعش مع أصدقائك: احصل على خصم 30% على اللاتيه المثلج أو الكولد برو الثاني",
      badgeText: "متعة مضاعفة",
    },
    ru: {
      title: "Скидка 30% на 2-й холодный напиток",
      subtitle: "Освежитесь с друзьями: второй айс латте или колд брю со скидкой 30%",
      badgeText: "ДВОЙНОЕ УДОВОЛЬСТВИЕ",
    },
    de: {
      title: "30% Rabatt auf das 2. Kaltgetränk",
      subtitle: "Erfrischen mit Freunden: 30% Rabatt auf den 2. Iced Latte oder Cold Brew",
      badgeText: "DOPPELTER GENUSS",
    },
  },
};

export function localizeCampaign(campaign: CampaignItem | null | undefined, lang: Language): CampaignItem | null {
  if (!campaign) return null;
  const cTrans = CAMPAIGN_TRANSLATIONS[campaign.title]?.[lang];
  if (!cTrans) return campaign;

  return {
    ...campaign,
    title: cTrans.title,
    subtitle: cTrans.subtitle,
    badgeText: cTrans.badgeText,
  };
}

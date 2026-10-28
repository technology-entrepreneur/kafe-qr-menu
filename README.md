# ☕ Satış & Dönüşüm (CRO) Odaklı Dijital QR Menü ve Yönetim Paneli

İşletmenin cirosunu ve ortalama sepet büyüklüğünü (AOV) artırmak için özel olarak tasarlanmış, **"Çapraz Satış (Cross-Selling)"**, **"Günün Fırsatları / Kampanya Bannerları"**, **"Ekstra & Opsiyon Seçimi"** ve **"Zustand Masa Tepsisi"** özelliklerine sahip yeni nesil kafe menü sistemi.

---

## 🚀 Yeni Satış & Dönüşüm (CRO) Özellikleri

### 📱 1. Günün Fırsatları & Kampanya Bannerları (En Üst Kısım)
- Menünün en üstünde müşterileri karşılayan, yatay kaydırılabilir (swipeable) görsel kampanya kartları.
- Fırsat rozetleri (Örn: `GÜNÜN FIRSATI`, `KAHVALTI MENÜSÜ`, `%30 İNDİRİM`).
- İndirimli fiyat ve üstü çizili eski fiyat gösterimiyle anında satın alma teşviki.

### ☕ 2. Akıllı Çapraz Satış & Ekstra Seçimi (Bottom Sheet)
- **Ekstra / Varyant Seçimleri:** Süt tercihi (Yulaf Sütü +₺25, Laktozsuz +₺15), Ekstra Şurup (Karamel, Vanilya +₺18), Ekstra Espresso Shot (+₺35). Tekli / Çoklu seçim mantığı ve dinamik toplam fiyat hesaplaması.
- **"Birlikte Harika Gider" (Cross-Selling):** Bir kahve seçildiğinde altında şefin önerdiği tamamlayıcı 2-3 lezzet (Örn: Flat White seçildiğinde altında San Sebastian Cheesecake ve Çıtır Kruvasan önerisi).
- **Zustand Tabanlı Yüzen Masa Tepsisi:** Müşteri ürün ve ekstraları seçtikçe sayfanın altında toplam tutarı gösteren dinamik tepsi çubuğu. Müşteri tek dokunuşla tepsisini açıp masaya gelen servis personeline siparişini hatasız iletebilir.

### 🛡️ 3. Yönetim Paneli (Admin CRO Modülleri)
- **Fırsatlar & Kampanyalar Paneli (`/admin`):** Yeni kampanya oluşturma, indirimli fiyat belirleme, rozet yazısı ekleme ve anlık yayına alma.
- **Çapraz Satış Eşleştirme Modalı:** İstediğiniz herhangi bir ürünün yanına hangi 2-3 ürünün önerileceğini tek tıkla seçebilme.
- **Ekstra / Varyant Grubu Tanımlama:** Ürün bazında zorunlu/isteğe bağlı ekstra grupları ve ek ücretler tanımlama.

### 🛡️ Yönetim Paneli (`/admin`)
- **Güvenli Kimlik Doğrulama:** JWT Cookie tabanlı, Edge Middleware korumalı admin paneli.
- **Ürün Yönetimi (CRUD):** Yeni ürün ekleme, fiyat/içerik güncelleme, resim yükleme ve **"Stokta Var / Tükendi"** anlık toggle butonu.
- **Kategori Yönetimi:** Kategori ekleme, sıralama belirleme, menüde aktif/pasif yapma.
- **QR Kod Üretici:** Menü bağlantısı veya masa numaralarına özel yüksek çözünürlüklü **PNG** (baskı için) ve vektörel **SVG** formatında QR kod indirme ve masa standı şablonu yazdırma.
- **İşletme Ayarları:** Kafe adı, logo, çalışma saatleri, Wi-Fi bilgileri, sosyal medya hesapları ve Google Haritalar linkini tek panelden güncelleme.

---

## 🛠️ Teknoloji Yığını
- **Frontend / Framework:** Next.js 14 (App Router, Server Actions, TypeScript)
- **Stil & UI:** Tailwind CSS, Lucide React (modern ikonlar), Framer Motion (mikro animasyonlar)
- **Veritabanı & ORM:** PostgreSQL / Supabase, Prisma ORM
- **Kimlik Doğrulama:** JOSE (JWT cookie) & BcryptJS ile Edge-uyumlu güvenli oturum yönetimi
- **QR Kod Motoru:** QRCode kütüphanesi (Canvas, SVG ve PNG üretimi)

---

## 📦 Kurulum ve Yerel Çalıştırma

### 1. Depoyu Klonlayın veya Klasöre Girin
```bash
cd "qr basit"
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevre Değişkenlerini Ayarlayın
`.env.example` dosyasını `.env` olarak kopyalayın:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
JWT_SECRET="guclu-rastgele-gizli-anahtar-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Uygulama `http://localhost:3000` adresinde çalışacaktır:
- **QR Menü:** `http://localhost:3000/menu`
- **Masa No ile Menü:** `http://localhost:3000/menu?table=5`
- **Yönetim Paneli:** `http://localhost:3000/admin` (Varsayılan Demo Giriş: `admin@kafe.com` / `admin123`)

---

## 🌐 Supabase & Vercel Dağıtım (Deployment) Rehberi

### Adım 1: Supabase Projesi Oluşturma
1. [supabase.com](https://supabase.com) adresinde oturum açın ve **New Project** oluşturun.
2. **Project Settings -> Database** bölümüne gidin.
3. **Connection string** alanından:
   - **Transaction Pooler (Port 6543)** URI'sini kopyalayıp `DATABASE_URL` olarak kaydedin.
   - **Session / Direct (Port 5432)** URI'sini kopyalayıp `DIRECT_URL` olarak kaydedin.

### Adım 2: Veritabanı Şemasını Yükleme (Prisma Push)
```bash
npx prisma db push
```
Başlangıç menü verilerini ve varsayılan yöneticiyi tohumlamak için:
```bash
npm run db:seed
```

### Adım 3: Vercel Üzerinde Dağıtım
1. Kodunuzu GitHub / GitLab deponuza gönderin (Push).
2. [vercel.com](https://vercel.com) adresinde **Add New Project** seçeneğiyle deponuzu seçin.
3. **Environment Variables** bölümüne şunları ekleyin:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (örn: `https://kafeadi.vercel.app`)
4. **Deploy** butonuna tıklayın.

---

## 📂 Proje Dizin Yapısı
```
├── prisma/
│   ├── schema.prisma         # Prisma Veritabanı Modelleri
│   └── seed.js               # Gerçekçi Kafe Menüsü ve Yönetici Tohumlama
├── src/
│   ├── actions/              # Next.js Server Actions
│   │   ├── auth.ts           # Admin Oturum & Giriş İşlemleri
│   │   ├── categories.ts     # Kategori CRUD Eylemleri
│   │   ├── products.ts       # Ürün CRUD ve Stok Toggle Eylemleri
│   │   └── settings.ts       # İşletme Ayarları Eylemleri
│   ├── app/                  # Next.js App Router
│   │   ├── admin/            # Yönetim Paneli Sayfaları
│   │   │   ├── dashboard/    # Ana Yönetim Ekranı
│   │   │   └── login/        # Güvenli Giriş Ekranı
│   │   ├── api/upload/       # Görsel Yükleme API'si
│   │   ├── menu/             # Müşteri QR Menü Sayfası
│   │   ├── globals.css       # Tailwind & Glassmorphism Stilleri
│   │   └── layout.tsx        # Kök HTML & Mobil Viewport Ayarları
│   ├── components/           # UI Bileşenleri
│   │   ├── admin/            # Panel Bileşenleri (Ürün, Kategori, QR Üretici, Ayarlar)
│   │   └── menu/             # Menü Bileşenleri (Header, Sekmeler, Kartlar, Modallar, Footer)
│   ├── lib/                  # Veri, Auth, Prisma & QR Yardımcıları
│   └── middleware.ts         # Edge Route Protection & Auth Middleware
└── DEPLOYMENT.md             # Detaylı Canlıya Alma Rehberi
```

# 💼 Dijital QR Menü & CRO Satış & Teslimat Kılavuzu
> **Bu belge, sistemi kafe, restoran, lounge ve otellere satışa sunarken veya yeni bir müşteriye teslim ederken kullanacağınız eksiksiz rehberdir.**

---

## 🌟 1. Sistemin Rakiplerinden Üstün Satış Argümanları (Satış Sunumu)

Klasik, hantal PDF gösteren ya da sadece pasif liste sunan QR menülerin aksine, bu sistem bir **Dönüşüm Odaklı Satış Motorudur (CRO - Conversion Rate Optimization)**:

| Özellik | Klasik QR Menüler | Bizim Akıllı QR Sistemimiz |
| :--- | :--- | :--- |
| **Giriş Deneyimi** | Yavaş yüklenen statik PDF veya sıkıcı liste | **Apple / Linear kalitesinde Karşılama Hub'ı (`/`)** |
| **Ortalama Sepet Tutarı (AOV)** | Değişmez, müşteri ne görürse onu alır | **%25-%35 Artış:** Akıllı Çapraz Satış (Cross-Selling) & Ekstralar |
| **Ekstra Seçimi** | Garsona sözlü anlatılır, sipariş karışır | **Dinamik Bottom Sheet:** Süt tercihi (+₺25), Şurup (+₺18), Shot (+₺35) |
| **Masa Tepsisi (Cart Tray)** | Yok, müşteri ürünleri aklında tutar | **Zustand Tabanlı Yüzen Masa Tepsisi:** Masa no ile hatasız sipariş özeti |
| **Google Yorumları** | Müşteri işletmeyi haritada aramakla uğraşmaz | **Tek Dokunuşla Altın Konfetili Google Review:** 5 yıldız patlaması |
| **Wi-Fi Paylaşımı** | Garsona 100 kez şifre sorulur | **Tek tıkla panoya kopyalama ve anında bağlanma** |
| **Yönetim Kolaylığı** | Yazılımcıya bağımlı veya karmaşık panel | **Tek panelden anlık Stok Durumu, Fiyat, Kampanya ve Görsel yönetimi** |
| **QR Kod Baskı Motoru** | Harici sitelerden ücretli oluşturulur | **Dahili Masa QR Üretici (PNG, SVG ve Baskıya Hazır Masa Standı Şablonu)** |

---

## 💰 2. Önerilen Satış & Fiyatlandırma Modelleri

İşletmelere bu sistemi 2 farklı şekilde satabilirsiniz:

### Model A: Tek Seferlik Anahtar Teslim Kurulum + Yıllık Destek (En Popüler)
- **Kurulum & Menü Girişi Ücreti:** ₺15.000 – ₺25.000 (Tek Seferlik)
  - Logo, renk uyumu, menü fotoğrafları ve metinlerinin sisteme girilmesi.
  - Masalara özel QR kodların üretilip pleksi / akrilik standlara hazır hale getirilmesi.
- **Yıllık Hosting & Bakım Ücreti:** ₺3.500 – ₺5.000 / yıl.

### Model B: Aylık Abonelik (SaaS Modeli)
- **Aylık Lisans Ücreti:** ₺1.250 – ₺2.000 / ay (Yıllık taahhütlü).
- **İlk Kurulum Bedeli:** ₺5.000.

---

## 🚀 3. Yeni Müşteriye 15 Dakikada Teslimat Adımları

Yeni bir kafe müşterisiyle anlaştığınızda sistemi sadece 15 dakikada yayına alabilirsiniz:

### Adım 1: Supabase & Vercel Projesi
1. Supabase'de ücretsiz proje açıp `DATABASE_URL` ve `DIRECT_URL` alın.
2. Vercel'e projeyi bağlayıp Environment Variables ekleyin (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`).
3. Veritabanını tek komutla tohumlayın:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

### Adım 2: Admin Paneline Giriş Yapın
- Adres: `https://[musteri-adresi].vercel.app/admin/login`
- Giriş: `admin@kafe.com` / `admin123`

### Adım 3: İşletme Ayarlarını Güncelleyin
1. **İşletme Ayarları** sekmesine gidin.
2. Kafe Adını (Örn: *Boğaz Artisan Coffee*), Wi-Fi adını ve şifresini yazın.
3. Çalışma saatlerini ve telefon numarasını girin.
4. Müşterinin **Google Haritalar Değerlendirme Linkini** ve **Instagram/TikTok** adreslerini yapıştırıp **"Ayarları Kaydet"**e basın.

### Adım 4: Menü ve Kategorileri Düzenleyin
1. **Kategoriler** sekmesinden kafenin menü başlıklarını ekleyin (Sıcak İçecekler, Burgerler, Kahvaltılar vb.).
2. **Ürünler** sekmesinden ürünleri, fiyatları ve lezzetli görselleri ekleyin.
3. Çapraz Satış (Cross-Selling) modalından ana ürünlerin yanına önerilecek 2-3 lezzeti eşleştirin (Örn: Burger yanına Patates ve Milkshake).

### Adım 5: QR Kodları Bastırıp Masalara Dağıtın
1. **QR Kod Üretici** sekmesine gelin.
2. Kafenin masa sayısını seçin (Örn: Masa 1'den Masa 25'e kadar).
3. **"Masa Standı Şablonunu Yazdır"** butonuna basarak doğrudan kuşe kağıda veya masa akrilik standlarına uygun renkli çıktıyı alın.

---

## 📱 4. Müşteriye Verilecek Kullanım Kılavuzu (Tek Sayfalık Özet)

> **Sayın İşletme Yöneticisi,**
> Yeni nesil dijital menünüz yayında! Aşağıdaki bilgilerle menünüzü kolayca yönetebilirsiniz:
> 
> - **Müşterilerinizin Menü Adresi:** `https://menunuz.com` veya masalardaki QR kodlar.
> - **Yönetim Paneli Girişi:** `https://menunuz.com/admin`
> - **Giriş Bilgileriniz:** Size özel iletilen e-posta ve şifre.
> 
> **Günlük İpuçları:**
> 1. **Biten Ürünler:** Bir ürün bittiğinde silmenize gerek yoktur. Ürün listesindeki yeşil toggle butonuna basarak anında **"Tükendi"** yapabilirsiniz. Ürün geldiğinde tekrar açabilirsiniz.
> 2. **Fiyat Değişikliği:** Ürünün yanındaki **Düzenle** butonuna basarak yeni fiyatı yazıp kaydedebilirsiniz. Masalardaki menüde anında güncellenir.
> 3. **Özel Kampanyalar:** Günün menüsü veya indirimleri için **Fırsatlar & Kampanyalar** sekmesinden banner oluşturup anında en üstte yayınlayabilirsiniz.

---

## 🛡️ 5. Sistem Güvenliği ve Dayanıklılık Notları
- **Kesintisiz Çalışma (Zero Downtime Fallback):** Veritabanında bakım veya internet kesintisi olsa bile sistem çökmeyecek şekilde tasarlanmış hazır zengin veri şablonu içerir.
- **Güvenli JWT Oturum:** Admin paneli Edge Middleware seviyesinde şifreli JWT çerezleri ile korunmaktadır.
- **PWA Desteği:** Müşteriler menüyü ana ekranlarına uygulama olarak ekleyebilir.

# 🚀 Canlıya Alma (Production Deployment) Rehberi

Bu rehber, **Dijital QR Menü ve Yönetim Paneli** uygulamanızı **Supabase (PostgreSQL)** ve **Vercel** üzerinde sıfırdan kurup canlıya almanız için adım adım talimatlar içerir.

---

## 1. Supabase Kurulumu (PostgreSQL Veritabanı)

1. [https://supabase.com](https://supabase.com) adresine gidin ve ücretsiz bir hesap açın / giriş yapın.
2. **New Project** butonuna tıklayın:
   - **Name:** `kafe-qr-menu`
   - **Database Password:** Güçlü bir şifre belirleyin ve güvenli bir yere not edin (örnek: `KafeDb2026!Secret`).
   - **Region:** Size / müşterilerinize en yakın bölgeyi seçin (örn: `Frankfurt - eu-central-1`).
3. Proje oluşturulduktan sonra sol menüden **Project Settings** (Dişli çark) -> **Database** sekmesine gelin.
4. **Connection string** alanına inin ve **URI** sekmesini seçin:
   - **Transaction Pooler (Port 6543):**
     ```
     postgresql://postgres.[PROJE_REF]:[ŞİFRE]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
     *(Bu adresi projenizdeki `DATABASE_URL` için kullanacaksınız.)*
   - **Session / Direct (Port 5432):**
     ```
     postgresql://postgres.[PROJE_REF]:[ŞİFRE]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
     ```
     *(Bu adresi projenizdeki `DIRECT_URL` için kullanacaksınız.)*

---

## 2. Şemayı Yükleme ve Başlangıç Verilerini Tohumlama (Seed)

Yerel terminalinizde (proje dizininde):

1. `.env` dosyanıza Supabase bağlantı dizgilerinizi yapıştırın:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJE_REF]:[ŞİFRENİZ]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[PROJE_REF]:[ŞİFRENİZ]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
   JWT_SECRET="guclu-ve-uzun-bir-gizli-anahtar-ornegin-32-karakter"
   ```

2. Prisma şemasını veritabanına aktarın:
   ```bash
   npx prisma db push
   ```

3. Örnek ürünleri, kategorileri ve yönetici kullanıcısını yükleyin:
   ```bash
   npm run db:seed
   ```
   > Tohumlama tamamlandığında varsayılan yönetici hesabı oluşturulacaktır:
   > - **E-posta:** `admin@kafe.com`
   > - **Şifre:** `admin123` *(Panel içerisinden dilediğiniz zaman değiştirebilirsiniz).*

---

## 3. Vercel Üzerinde Dağıtım (Deploy)

1. Projenizi GitHub, GitLab veya Bitbucket deponuza push edin:
   ```bash
   git init
   git add .
   git commit -m "feat: complete digital qr menu & admin dashboard"
   git branch -M main
   git remote add origin <GITHUB_REPO_URL>
   git push -u origin main
   ```

2. [https://vercel.com](https://vercel.com) adresine gidin ve **Add New... -> Project** seçeneğini tıklayın.
3. GitHub deponuzu seçin ve **Import** butonuna basın.
4. **Environment Variables** bölümünü açın ve aşağıdaki 4 değişkeni ekleyin:
   - `DATABASE_URL`: Supabase Transaction Pooler URI
   - `DIRECT_URL`: Supabase Direct Connection URI
   - `JWT_SECRET`: Üretim için güçlü rastgele anahtar
   - `NEXT_PUBLIC_APP_URL`: Vercel tarafından verilecek alan adı (örn: `https://kafe-qr-menu.vercel.app`)
5. **Deploy** butonuna tıklayın. 1-2 dakika içerisinde siteniz yayında olacaktır!

---

## 4. Özel Alan Adı & QR Kod Bastırma

1. Vercel paneli -> **Settings -> Domains** bölümünden kendi alan adınızı (örn: `menu.kafeniz.com`) bağlayabilirsiniz.
2. Siteniz açıldıktan sonra `/admin` paneline girip **"QR Kod Üretici"** sekmesine geçin:
   - İster genel menü için, ister her masaya özel (Masa 1, Masa 2...) yüksek çözünürlüklü **PNG** veya **SVG** QR kodları indirin.
   - Doğrudan **"Masa Standı Şablonunu Yazdır"** butonuyla akrilik masa ayaklıklarına uygun çıktınızı alın!

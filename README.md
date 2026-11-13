# Sahih mi?

Etrafta dolaşan uydurma hadislere karşı, âlimlerin değerlendirdiği ücretsiz hadis doğrulama uygulaması.

- **Kullanıcı tarafı:** Hadis arama (yazım hatalarını tolere eder), konulara göre listeleme, hadis detayı (derece + kaynak + âlim açıklaması), WhatsApp'a görsel/metin paylaşma, "Bunu gördüm, doğru mu?" ile hesapsız soru gönderme ve "Sorularım" takibi.
- **Âlim paneli (`/admin`):** Hadis ekleme/düzenleme, gelen soruları değerlendirme/bağlama/reddetme, âlim ve konu yönetimi.

Stack: React + TypeScript + Vite + Tailwind + Supabase + Capacitor (Android).

---

## Kurulum (adım adım)

### 1. Supabase projesi
1. supabase.com → **New project** (ücretsiz plan yeterli).
2. **SQL Editor** → `supabase/migrations/20261113000000_init.sql` dosyasının tamamını yapıştır → **Run**.
3. **Project Settings → API** ekranından `Project URL` ve `anon public` anahtarını kopyala.
4. **Authentication → Sign In / Providers → Email** ayarında **“Allow new users to sign up”** seçeneğini **kapat** (âlim hesaplarını sen oluşturacaksın).

### 2. Ortam değişkenleri
Proje köküne `.env` oluştur:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Çalıştır
```bash
npm install
npm run dev        # http://localhost:8080
```

### 4. İlk yönetici (sen)
1. Supabase → **Authentication → Users → Add user** ile kendi e-posta + şifreni oluştur (“Auto confirm” işaretli).
2. SQL Editor'de çalıştır:
```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'SENIN@EPOSTAN.com';
```
3. `/admin/giris` adresinden giriş yap.

### 5. Âlim eklemek
1. Supabase → Authentication → **Add user** ile âlime e-posta + şifre oluştur.
2. Panel → **Âlimler → Yeni âlim** → bilgileri gir, “Panele giriş yetkisi” kısmına o e-postayı yaz → Kaydet.

---

## Android (Capacitor)
```bash
npm run build
npx cap add android      # sadece ilk sefer
npx cap sync android
npx cap open android
```
App ID: `com.sahbilisim.sahihmi`

> Not: Admin paneli de uygulamanın içinde ama menüde görünmez. Âlimler web'den kullanacaksa `dist` klasörünü Netlify/Vercel/Cloudflare Pages'e de yükleyebilirsin (SPA yönlendirmesi: tüm yollar `index.html`'e).

---

## Veritabanı özeti
| Tablo | Ne tutar |
|---|---|
| `hadisler` | metin, dolaşan hâli, Arapça, derece (sahih/hasen/zayif/uydurma), kaynaklar (JSON), açıklama, konu, âlim, yayında |
| `alimler` | ad, unvan, biyografi, foto, bağlı giriş hesabı |
| `konular` | ad, slug, ikon, sıra (13 konu hazır gelir) |
| `kullanici_sorulari` | gönderilen metin, nerede görüldü, durum, bağlanan hadis |
| `user_roles` | admin / alim rolleri |

Güvenlik (RLS): Herkes sadece yayındaki hadisleri okur; soruları hesapsız gönderebilir ama başkalarının sorularını göremez. Hadis ekleme/düzenleme yalnızca âlim ve adminlerde; silme ve âlim/konu yönetimi yalnızca adminde.

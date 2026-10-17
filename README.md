# boznivo.com

Boznivo için statik portföy ve uygulama tanıtım sitesi. Build adımı yok, framework yok — Cloudflare Pages dosyaları doğrudan yayınlar.

- Açık / koyu tema (sistem ayarını izler, elle değiştirilebilir)
- Türkçe / İngilizce dil seçeneği (tarayıcı diline göre başlar, seçim hatırlanır)
- Uygulamalar `apps.json`'dan otomatik listelenir

## Yapı

```
index.html          Ana sayfa (hero, uygulamalar, ilkeler, hakkımda, SSS, iletişim)
app.html            Uygulama detay sayfası (/app.html?id=<id>)
privacy.html        Genel gizlilik politikası (uygulama sayfalarının şablonu)
privacy/<id>/       Her uygulamanın kendi gizlilik sayfası (tools/build_privacy.py üretir)
tools/              Yardımcı betikler
apps.json           Uygulama verileri — yeni uygulama burada eklenir
404.html            Bulunamayan sayfa
_headers            Cloudflare Pages güvenlik/önbellek başlıkları
robots.txt, sitemap.xml
assets/
  css/style.css     Tüm tasarım (renkler en üstte :root değişkenlerinde)
  js/i18n.js        İngilizce çeviriler
  js/common.js      Ortak: dil, tema, menü, veri
  js/main.js        Ana sayfa
  js/app.js         Detay sayfası
  images/           logo.svg, og-image.png, apple-touch-icon.png, apps/
```

## Yeni uygulama ekleme

1. İkonu `assets/images/apps/` içine koyun (1024×1024 PNG veya SVG).
2. `apps.json` içindeki `apps` dizisine bir obje ekleyin:

```json
{
  "id": "yeniapp",
  "name": "Yeni App",
  "featured": false,
  "tagline": { "tr": "Tek satırlık slogan.", "en": "One-line tagline." },
  "description": { "tr": "Kısa açıklama.", "en": "Short description." },
  "icon": "assets/images/apps/yeniapp.png",
  "category": { "tr": "Yardımcı Araçlar", "en": "Utilities" },
  "platforms": ["iPhone"],
  "status": "live",
  "accent": "#3b82f6",
  "appStoreUrl": "https://apps.apple.com/app/id1234567890",
  "privacyUrl": "",
  "features": {
    "tr": ["Özellik 1", "Özellik 2", "Özellik 3"],
    "en": ["Feature 1", "Feature 2", "Feature 3"]
  },
  "screenshots": ["assets/images/apps/yeniapp-1.png"]
}
```

- Metin alanları düz metin de olabilir (`"tagline": "Slogan"`); o zaman iki dilde de aynı görünür.
- `status`: `live` (App Store butonu aktif) veya `soon` ("Çok yakında").
- `featured: true` olan uygulama ana sayfadaki telefon maketinde gösterilir (yoksa ilk yayındaki).
- `accent`: kartın ve telefon ekranının rengi.
- `screenshots` isteğe bağlıdır; ilki telefon maketinde, hepsi detay sayfasındaki galeride görünür.
- `privacyUrl` boşsa uygulamanın kendi sayfası `/privacy/<id>/` kullanılır.
- `sitemap.xml` dosyasına `/app.html?id=<id>` adresini de ekleyin.

## Uygulamaya özel gizlilik sayfaları

Her uygulamanın App Store Connect'e girilecek ayrı bir gizlilik adresi vardır:

```
https://boznivo.com/privacy/<id>/          (Türkçe / tarayıcı diline göre)
https://boznivo.com/privacy/<id>/?lang=en  (İngilizce)
```

`apps.json`'a uygulama ekledikten ya da `privacy.html` metnini değiştirdikten sonra sayfaları yeniden üretin:

```bash
python3 tools/build_privacy.py
```

## Metinleri düzenleme

- Türkçe metinler doğrudan HTML dosyalarındadır.
- İngilizce karşılıkları `assets/js/i18n.js` içinde, HTML'deki `data-i18n="..."` anahtarıyla eşleşir.
  Bir metni değiştirirseniz iki dili de güncelleyin.

## Yerelde çalıştırma

`apps.json` `fetch` ile yüklendiği için dosyayı çift tıklayıp açmak yerine bir sunucu kullanın:

```bash
python3 -m http.server 8080
```

## Cloudflare Pages

- Framework preset: **None**
- Build command: *(boş)*
- Build output directory: `/`

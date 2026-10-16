# boznivo.com

Boznivo için statik portföy ve uygulama tanıtım sitesi. Build adımı yok — Cloudflare Pages dosyaları doğrudan yayınlar.

## Yapı

```
index.html          Ana sayfa (Hero, uygulama ikon ızgarası, Hakkımda, İletişim)
app.html            Uygulama detay sayfası (/app.html?id=<id>)
privacy.html        Gizlilik politikası (?app=<id> ile uygulamaya özel)
apps.json           Uygulama verileri — yeni uygulama burada eklenir
404.html            Bulunamayan sayfa
_headers            Cloudflare Pages güvenlik/önbellek başlıkları
robots.txt, sitemap.xml
assets/
  css/style.css
  js/common.js, js/main.js, js/app.js, js/tailwind.config.js
  images/           logo.svg, og-image.png, apple-touch-icon.png, apps/
```

## Yeni uygulama ekleme

1. İkonu `assets/images/apps/` içine koyun (1024×1024 PNG veya SVG).
2. `apps.json` içindeki `apps` dizisine bir obje ekleyin:

```json
{
  "id": "yeniapp",
  "name": "Yeni App",
  "tagline": "Tek satırlık slogan.",
  "description": "Kısa açıklama.",
  "icon": "assets/images/apps/yeniapp.png",
  "category": "Yardımcı Araçlar",
  "platforms": ["iPhone"],
  "status": "live",
  "accent": "#3b82f6",
  "appStoreUrl": "https://apps.apple.com/app/id1234567890",
  "privacyUrl": "",
  "features": ["Özellik 1", "Özellik 2", "Özellik 3"],
  "screenshots": ["assets/images/apps/yeniapp-1.png"]
}
```

- Ana sayfada ikon olarak listelenir; tıklayınca `/app.html?id=<id>` detay sayfası açılır.
- `screenshots` isteğe bağlıdır; doluysa detay sayfasında kaydırılabilir galeri olarak gösterilir.
- `status`: `live` (App Store butonu aktif) veya `soon` ("Çok Yakında").
- `privacyUrl` boşsa otomatik `/privacy.html?app=<id>` kullanılır — App Store Connect'te bu adresi girebilirsiniz.

## Yerelde çalıştırma

`apps.json` `fetch` ile yüklendiği için dosyayı çift tıklayıp açmak yerine bir sunucu kullanın:

```bash
python3 -m http.server 8080
```

## Cloudflare Pages

- Framework preset: **None**
- Build command: *(boş)*
- Build output directory: `/`

Yeni uygulama eklediğinizde `sitemap.xml` dosyasına `/app.html?id=<id>` adresini de ekleyin.
# boznivo
# boznivo

#!/usr/bin/env python3
"""Her uygulama için ayrı gizlilik politikası sayfası üretir.

privacy.html şablonunu alır ve apps.json'daki her uygulama için
privacy/<id>/index.html dosyasını yazar. Sonuç adres:

    https://boznivo.com/privacy/<id>/

App Store Connect'teki "Privacy Policy URL" alanına bu adresi girin.
İngilizce sürüm için sonuna ?lang=en ekleyebilirsiniz.

Kullanım (proje kökünde):
    python3 tools/build_privacy.py

Politika metnini değiştirmek için privacy.html (Türkçe) ve
assets/js/i18n.js içindeki "pp." anahtarlarını (İngilizce) düzenleyin,
sonra bu betiği yeniden çalıştırın.
"""

import html
import json
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://boznivo.com"
MARKER = "<!-- OTOMATİK ÜRETİLDİ: tools/build_privacy.py -->"


def replace_once(text, old, new, label):
    if old not in text:
        sys.exit(f"Şablonda bulunamadı ({label}): {old[:60]}")
    return text.replace(old, new, 1)


def build_page(template, app_id, name):
    esc = html.escape(name, quote=True)
    url = f"{SITE}/privacy/{app_id}/"
    page = template
    page = replace_once(page, '<html lang="tr">', f'<html lang="tr">\n{MARKER}', "html")
    page = replace_once(
        page,
        '<title data-i18n="pp.title">Gizlilik Politikası — Boznivo</title>',
        f"<title>{esc} Gizlilik Politikası — Boznivo</title>",
        "title",
    )
    page = replace_once(page, '<link rel="canonical" href="https://boznivo.com/privacy.html">',
                        f'<link rel="canonical" href="{url}">', "canonical")
    page = replace_once(page, '<meta property="og:url" content="https://boznivo.com/privacy.html">',
                        f'<meta property="og:url" content="{url}">', "og:url")
    page = replace_once(page, '<meta property="og:title" content="Gizlilik Politikası / Privacy Policy — Boznivo">',
                        f'<meta property="og:title" content="{esc} — Gizlilik Politikası / Privacy Policy">', "og:title")
    page = replace_once(page, "<body>", f'<body data-app="{html.escape(app_id, quote=True)}" data-app-name="{esc}">', "body")
    # JavaScript olmadan da uygulama adı görünsün
    page = page.replace('<strong data-field="appName"></strong>', f'<strong data-field="appName">{esc}</strong>')
    return page


def main():
    template = (ROOT / "privacy.html").read_text(encoding="utf-8")
    apps = json.loads((ROOT / "apps.json").read_text(encoding="utf-8")).get("apps", [])
    out_root = ROOT / "privacy"
    out_root.mkdir(exist_ok=True)

    wanted = set()
    for app in apps:
        app_id, name = app.get("id"), app.get("name")
        if not app_id or not name:
            continue
        wanted.add(app_id)
        target = out_root / app_id / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(build_page(template, app_id, name), encoding="utf-8")
        print(f"✓ {SITE}/privacy/{app_id}/")

    # apps.json'dan çıkarılmış uygulamaların eski sayfalarını temizle (yalnızca bu betiğin ürettikleri)
    for folder in out_root.iterdir():
        page = folder / "index.html"
        if folder.is_dir() and folder.name not in wanted and page.exists() and MARKER in page.read_text(encoding="utf-8"):
            shutil.rmtree(folder)
            print(f"✗ kaldırıldı: privacy/{folder.name}/")


if __name__ == "__main__":
    main()

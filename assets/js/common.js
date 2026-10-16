// Boznivo — tüm sayfalarda ortak: veri, dil, ikonlar, tema, navigasyon, animasyonlar (window.Boznivo)
(() => {
  'use strict';

  const APPS_URL = '/apps.json';
  const root = document.documentElement;
  const DICT = window.BOZNIVO_I18N || { en: {}, ui: { tr: {}, en: {} } };

  /* ---------- Dil ---------- */
  // Başlangıç dili <head> içindeki küçük betik tarafından <html lang> olarak ayarlanır.
  let lang = root.lang === 'en' ? 'en' : 'tr';

  // Arayüz metni: t('live'), t('storeAria', { name: 'Focusly' })
  const t = (key, vars) => {
    let s = DICT.ui[lang]?.[key] ?? DICT.ui.tr[key] ?? key;
    if (vars) Object.keys(vars).forEach((k) => (s = s.replaceAll(`{${k}}`, vars[k])));
    return s;
  };
  // apps.json alanı: düz metin veya { "tr": "...", "en": "..." }
  const tx = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.tr ?? v.en ?? '' : v ?? '');
  // Liste alanı: ["..."], [{tr,en}, ...] veya { "tr": [...], "en": [...] }
  const txList = (v) => (Array.isArray(v) ? v.map(tx) : v && typeof v === 'object' ? v[lang] || v.tr || v.en || [] : []);

  // data-i18n="anahtar"            → öğenin içeriği
  // data-i18n-attr="attr:anahtar"  → öznitelik (birden fazlası için ; ile ayırın)
  function applyI18n(scope = document) {
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      if (el.__tr === undefined) el.__tr = el.innerHTML;
      const v = lang === 'en' ? DICT.en[el.dataset.i18n] : undefined;
      el.innerHTML = v ?? el.__tr;
    });
    scope.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.__trAttr ||= {};
      el.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (!(attr in el.__trAttr)) el.__trAttr[attr] = el.getAttribute(attr);
        const v = lang === 'en' ? DICT.en[key] : undefined;
        el.setAttribute(attr, v ?? el.__trAttr[attr]);
      });
    });
  }

  function paintLang() {
    document.querySelectorAll('[data-lang-toggle]').forEach((b) => {
      b.setAttribute('aria-label', t('langSwitch'));
      b.querySelectorAll('[data-l]').forEach((s) => s.classList.toggle('is-active', s.dataset.l === lang));
    });
  }

  function setLang(next) {
    if (next === lang) return;
    lang = next;
    root.lang = next;
    try { localStorage.setItem('lang', next); } catch { /* gizli mod vb. */ }
    applyI18n();
    paintLang();
    paintTheme();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  /* ---------- Yardımcılar ---------- */
  const esc = (str = '') =>
    String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Yalnızca http(s) ve göreli bağlantılara izin ver
  const safeUrl = (url = '') => (/^(https?:\/\/|\/|[\w-]+\.html|assets\/)/i.test(url) ? url : '');

  // Göreli varlık yollarını kök dizine sabitle (alt sayfalarda da çalışsın)
  const asset = (url = '') => {
    const u = safeUrl(url);
    return u && !/^(https?:)?\//i.test(u) ? `/${u}` : u;
  };

  const accentOf = (app) => (/^#[0-9a-f]{3,8}$/i.test(app.accent || '') ? app.accent : '#8b5cf6');
  const detailHref = (app) => `/app.html?id=${encodeURIComponent(app.id)}`;
  const privacyHref = (app) => safeUrl(app.privacyUrl) || `/privacy.html?app=${encodeURIComponent(app.id)}`;

  /* ---------- İkonlar (Lucide tarzı, satır içi) ---------- */
  const svg = (body) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const icons = {
    arrow: svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
    arrowLeft: svg('<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>'),
    check: svg('<path d="M20 6 9 17l-5-5"/>'),
    shield: svg('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'),
    mail: svg('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
    plus: svg('<path d="M12 5v14"/><path d="M5 12h14"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'),
    moon: svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
    apple:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.66zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.7-1.28z"/></svg>',
    signal:
      '<svg viewBox="0 0 54 12" fill="currentColor" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="6" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/><rect x="26" y="0.5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".5"/><rect x="28" y="2.5" width="16" height="7" rx="2"/><rect x="49.5" y="4" width="2" height="4" rx="1" opacity=".5"/></svg>',
  };

  /* ---------- Bileşenler ---------- */
  function storeButton(app) {
    const url = safeUrl(app.appStoreUrl);
    if (app.status === 'live' && url) {
      return `<a href="${esc(url)}" target="_blank" rel="noopener" class="btn-store" aria-label="${esc(t('storeAria', { name: app.name }))}">
        ${icons.apple}<span><small>${t('storeSmall')}</small><strong>App Store</strong></span></a>`;
    }
    return `<span class="btn-store" aria-disabled="true">${icons.apple}<span><small>${t('storeSoon')}</small><strong>App Store</strong></span></span>`;
  }

  const statusBadge = (app, extra = '') =>
    app.status === 'live'
      ? `<span class="status status--live ${extra}">${t('live')}</span>`
      : `<span class="status status--soon ${extra}">${t('soon')}</span>`;

  // Telefon maketinin ekranı: ekran görüntüsü varsa onu, yoksa uygulamanın stilize tanıtımını gösterir
  function phoneScreen(app) {
    const shot = (app.screenshots || [])[0];
    if (shot) {
      return `<div class="phone__screen phone__screen--shot"><img src="${esc(asset(shot))}" alt="${esc(t('shotAlt', { name: app.name }))}"></div><span class="phone__home"></span>`;
    }
    const features = txList(app.features).slice(0, 3)
      .map((f) => `<li>${icons.check}<span>${esc(f)}</span></li>`).join('');
    return `
      <div class="phone__screen">
        <div class="phone__status"><span>9:41</span>${icons.signal}</div>
        <div class="phone__app">
          <img class="phone__icon" src="${esc(asset(app.icon))}" alt="" width="84" height="84">
          <div class="phone__name">${esc(app.name)}</div>
          <div class="phone__tag">${esc(tx(app.tagline))}</div>
        </div>
        <ul class="phone__list">${features}</ul>
        <div class="phone__cta">${icons.apple}${app.status === 'live' ? t('phoneLive') : t('phoneSoon')}</div>
      </div>
      <span class="phone__home"></span>`;
  }

  /* ---------- Veri ---------- */
  let appsPromise;
  function loadApps() {
    appsPromise ||= fetch(APPS_URL, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) =>
        (Array.isArray(data) ? data : data.apps || [])
          .filter((a) => a && a.id && a.name)
          // Yayındaki uygulamalar önce
          .sort((a, b) => (a.status === 'live' ? 0 : 1) - (b.status === 'live' ? 0 : 1))
      );
    return appsPromise;
  }

  /* ---------- Tema ---------- */
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (media.matches ? 'dark' : 'light');

  function paintTheme() {
    const dark = currentTheme() === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach((b) => {
      b.innerHTML = dark ? icons.sun : icons.moon;
      b.setAttribute('aria-label', dark ? t('themeToLight') : t('themeToDark'));
    });
  }

  function initToggles() {
    document.querySelectorAll('[data-theme-toggle]').forEach((b) =>
      b.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch { /* gizli mod vb. */ }
        paintTheme();
      })
    );
    media.addEventListener?.('change', paintTheme);
    document.querySelectorAll('[data-lang-toggle]').forEach((b) =>
      b.addEventListener('click', () => setLang(lang === 'tr' ? 'en' : 'tr'))
    );
  }

  /* ---------- Navigasyon ---------- */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const btn = nav.querySelector('[data-menu-toggle]');
    if (!btn) return;
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('.mobile-menu a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- Belirme animasyonu ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    : null;
  const reveal = (scope = document) =>
    scope.querySelectorAll('.reveal:not(.is-in)').forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));

  /* ---------- Başlat ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
  applyI18n();
  root.classList.remove('i18n-pending');
  paintLang();
  paintTheme();
  initToggles();
  initNav();
  reveal();

  window.Boznivo = {
    get lang() { return lang; },
    t, tx, txList, applyI18n,
    esc, safeUrl, asset, accentOf, detailHref, privacyHref,
    icons, storeButton, statusBadge, phoneScreen, loadApps, reveal,
  };
})();

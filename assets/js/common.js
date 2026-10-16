// Boznivo — sayfalar arasında paylaşılan yardımcılar (window.Boznivo)
(() => {
  'use strict';

  const APPS_URL = '/apps.json';

  const esc = (str = '') =>
    String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Yalnızca http(s) ve göreli bağlantılara izin ver
  const safeUrl = (url = '') => (/^(https?:\/\/|\/|[\w-]+\.html|assets\/)/i.test(url) ? url : '');

  // Göreli varlık yollarını kök dizine sabitle (alt sayfalarda da çalışsın)
  const asset = (url = '') => {
    const u = safeUrl(url);
    return u && !/^(https?:)?\//i.test(u) ? `/${u}` : u;
  };

  const detailHref = (app) => `/app.html?id=${encodeURIComponent(app.id)}`;
  const privacyHref = (app) => safeUrl(app.privacyUrl) || `/privacy.html?app=${encodeURIComponent(app.id)}`;

  const appleIcon =
    '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.66zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.7-1.28z"/></svg>';

  function storeButton(app, extraClass = '') {
    const url = safeUrl(app.appStoreUrl);
    if (app.status === 'live' && url) {
      return `<a href="${esc(url)}" target="_blank" rel="noopener" class="btn-store ${extraClass}">${appleIcon}App Store'dan İndir</a>`;
    }
    return `<span class="btn-store ${extraClass}" aria-disabled="true">${appleIcon}Çok Yakında</span>`;
  }

  function statusBadge(app) {
    return app.status === 'live'
      ? '<span class="badge bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">Yayında</span>'
      : '<span class="badge bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20">Yakında</span>';
  }

  async function loadApps() {
    const res = await fetch(APPS_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const apps = (Array.isArray(data) ? data : data.apps || []).filter((a) => a && a.id && a.name);
    // Yayındaki uygulamalar önce
    return apps.sort((a, b) => (a.status === 'live' ? 0 : 1) - (b.status === 'live' ? 0 : 1));
  }

  window.Boznivo = { esc, safeUrl, asset, detailHref, privacyHref, storeButton, statusBadge, loadApps };
})();

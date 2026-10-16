// Boznivo — uygulama detay sayfası: /app.html?id=<apps.json id>
(() => {
  'use strict';

  const { esc, asset, detailHref, privacyHref, storeButton, statusBadge, loadApps } = window.Boznivo;
  const main = document.getElementById('appDetail');

  const setMeta = (sel, value) => document.querySelector(sel)?.setAttribute('content', value);

  function notFound() {
    document.title = 'Uygulama bulunamadı — Boznivo';
    main.innerHTML = `
      <div class="py-20 text-center">
        <h1 class="font-display text-3xl font-bold text-white">Uygulama bulunamadı</h1>
        <p class="mt-3 text-zinc-400">Aradığınız uygulama kaldırılmış veya bağlantı hatalı olabilir.</p>
        <a href="/#apps" class="btn-primary mt-8">Tüm uygulamalar</a>
      </div>`;
  }

  function render(app, apps) {
    const accent = app.accent || '#8b5cf6';
    document.title = `${app.name} — ${app.tagline || 'Boznivo'}`;
    setMeta('meta[name="description"]', app.description || app.tagline || '');
    setMeta('meta[property="og:title"]', `${app.name} — Boznivo`);
    setMeta('meta[property="og:description"]', app.tagline || '');
    document.getElementById('appGlow').style.background = accent;

    const features = (app.features || [])
      .map((f) => `
        <li class="card flex gap-3 p-4">
          <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style="background:${esc(accent)}">✓</span>
          <span class="text-sm leading-relaxed text-zinc-300">${esc(f)}</span>
        </li>`)
      .join('');

    const shots = (app.screenshots || [])
      .map((src) => `<img src="${esc(asset(src))}" alt="${esc(app.name)} ekran görüntüsü" loading="lazy" class="h-[420px] w-auto shrink-0 snap-start rounded-3xl border border-white/10">`)
      .join('');

    const others = apps.filter((a) => a.id !== app.id)
      .map((a) => `
        <a href="${esc(detailHref(a))}" class="app-tile w-24 shrink-0" style="--accent:${esc(a.accent || '#8b5cf6')}">
          <img src="${esc(asset(a.icon))}" alt="" width="96" height="96" loading="lazy" class="tile-icon">
          <span class="mt-3 block truncate text-sm font-medium text-white">${esc(a.name)}</span>
        </a>`)
      .join('');

    main.innerHTML = `
      <section class="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8" style="--accent:${esc(accent)}">
        <img src="${esc(asset(app.icon))}" alt="${esc(app.name)} simgesi" width="128" height="128" class="tile-icon h-28 w-28 sm:h-32 sm:w-32">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="font-display text-4xl font-extrabold text-white sm:text-5xl">${esc(app.name)}</h1>
            ${statusBadge(app)}
          </div>
          <p class="mt-2 text-lg text-zinc-300">${esc(app.tagline)}</p>
          <p class="mt-1 text-sm text-zinc-500">${esc([app.category, (app.platforms || []).join(', ')].filter(Boolean).join(' · '))}</p>
          <div class="mt-6 flex flex-wrap items-center gap-4">
            ${storeButton(app, 'text-base px-5 py-3')}
            <a href="${esc(privacyHref(app))}" class="text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline">Gizlilik Politikası</a>
          </div>
        </div>
      </section>

      ${app.description ? `
      <section class="mt-14 max-w-3xl">
        <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Hakkında</h2>
        <p class="mt-3 text-lg leading-relaxed text-zinc-300">${esc(app.description)}</p>
      </section>` : ''}

      ${shots ? `
      <section class="mt-14">
        <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Ekran Görüntüleri</h2>
        <div class="-mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">${shots}</div>
      </section>` : ''}

      ${features ? `
      <section class="mt-14">
        <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Öne Çıkan Özellikler</h2>
        <ul class="mt-4 grid gap-3 sm:grid-cols-2">${features}</ul>
      </section>` : ''}

      ${others ? `
      <section class="mt-20 border-t border-white/5 pt-10">
        <h2 class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Diğer Uygulamalar</h2>
        <div class="mt-6 flex gap-6 overflow-x-auto pb-2">${others}</div>
      </section>` : ''}`;
  }

  document.getElementById('year').textContent = new Date().getFullYear();

  (async () => {
    const id = new URLSearchParams(location.search).get('id');
    try {
      const apps = await loadApps();
      const app = apps.find((a) => a.id === id);
      app ? render(app, apps) : notFound();
    } catch (err) {
      console.error('apps.json yüklenemedi:', err);
      notFound();
    }
  })();
})();

// Boznivo — ana sayfa: uygulama ikon ızgarasını apps.json'dan çizer ve küçük UI etkileşimlerini yönetir.
(() => {
  'use strict';

  const { esc, asset, detailHref, loadApps } = window.Boznivo;
  const $ = (sel, root = document) => root.querySelector(sel);

  function tileHTML(app, i) {
    return `
      <a href="${esc(detailHref(app))}" class="app-tile reveal group" style="--accent:${esc(app.accent || '#8b5cf6')};transition-delay:${i * 60}ms" aria-label="${esc(app.name)} — detaylar">
        <span class="relative block">
          <img src="${esc(asset(app.icon))}" alt="${esc(app.name)} simgesi" width="160" height="160" loading="lazy" class="tile-icon">
          ${app.status === 'live' ? '' : '<span class="tile-badge">Yakında</span>'}
        </span>
        <span class="mt-4 block truncate font-display text-base font-semibold text-white">${esc(app.name)}</span>
        <span class="mt-0.5 block truncate text-xs text-zinc-500">${esc(app.category || app.tagline || '')}</span>
      </a>`;
  }

  // Görünür olduğunda öğeleri yumuşakça belirt
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12 })
    : null;
  const observe = (root = document) =>
    root.querySelectorAll('.reveal:not(.in)').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));

  async function renderApps() {
    const grid = $('#appsGrid');
    try {
      const apps = await loadApps();
      $('#statApps').textContent = String(apps.length);
      grid.innerHTML = apps.length
        ? apps.map(tileHTML).join('')
        : '<p class="col-span-full text-center text-zinc-500">Henüz yayınlanmış bir uygulama yok. Yakında burada!</p>';
      observe(grid);
    } catch (err) {
      console.error('apps.json yüklenemedi:', err);
      grid.innerHTML = `<p class="col-span-full rounded-2xl border border-white/10 p-6 text-center text-zinc-400">
        Uygulamalar yüklenemedi. Siteyi yerelde test ediyorsanız dosyayı doğrudan açmak yerine bir sunucu kullanın
        (ör. <code class="text-zinc-200">python3 -m http.server</code>).</p>`;
    }
  }

  function initNav() {
    const nav = $('#nav');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const btn = $('#menuBtn');
    const menu = $('#mobileMenu');
    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('hidden') === false;
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('scrolled', open || window.scrollY > 10);
    });
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) { menu.classList.add('hidden'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  function initCopy() {
    const btn = $('#copyEmail');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.email);
        const old = btn.textContent;
        btn.textContent = 'Kopyalandı ✓';
        setTimeout(() => (btn.textContent = old), 1800);
      } catch {
        window.location.href = `mailto:${btn.dataset.email}`;
      }
    });
  }

  $('#year').textContent = new Date().getFullYear();
  initNav();
  initCopy();
  observe();
  renderApps();
})();

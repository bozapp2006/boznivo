// Boznivo — ana sayfa: öne çıkan uygulama, uygulama ızgarası ve altbilgi listesi apps.json'dan çizilir.
(() => {
  'use strict';

  const B = window.Boznivo;
  const { esc, asset, accentOf, detailHref, icons, statusBadge, phoneScreen, loadApps, reveal, t, tx } = B;
  const $ = (sel) => document.querySelector(sel);

  const tileHTML = (app, i) => `
    <a href="${esc(detailHref(app))}" class="app-tile reveal" style="--accent:${accentOf(app)};--d:${i * 70}ms" aria-label="${esc(app.name)}: ${esc(tx(app.tagline))}">
      ${statusBadge(app)}
      <img class="app-tile__icon" src="${esc(asset(app.icon))}" alt="" width="232" height="232" loading="lazy">
      <span class="app-tile__name">${esc(app.name)}</span>
      <span class="app-tile__meta">${esc(tx(app.category) || tx(app.tagline))}</span>
      <span class="app-tile__go">${t('view')} ${icons.arrow}</span>
    </a>`;

  const nextTileHTML = (i) => `
    <div class="app-tile app-tile--next reveal" style="--d:${i * 70}ms">
      <span class="app-tile__icon">${icons.plus}</span>
      <span class="app-tile__name">${t('next')}</span>
      <span class="app-tile__meta">${t('nextSub')}</span>
    </div>`;

  // Öne çıkan: "featured": true olan, yoksa ilk yayındaki uygulama
  const pickFeatured = (apps) => apps.find((a) => a.featured) || apps.find((a) => a.status === 'live') || apps[0];

  function renderHero(apps) {
    const featured = pickFeatured(apps);
    const stage = $('#heroStage');
    const phone = $('#heroPhone');
    if (!featured) { stage.hidden = true; return; }

    stage.style.setProperty('--accent', accentOf(featured));
    phone.style.setProperty('--accent', accentOf(featured));
    phone.innerHTML = phoneScreen(featured);

    // Diğer uygulamaların ikonları telefonun etrafında süzülür
    stage.querySelectorAll('.orbit').forEach((el) => el.remove());
    apps.filter((a) => a !== featured).slice(0, 2).forEach((a, i) => {
      const img = document.createElement('img');
      img.className = `orbit orbit--${i + 1}`;
      img.src = asset(a.icon);
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      stage.appendChild(img);
    });
  }

  async function render() {
    const grid = $('#appsGrid');
    try {
      const apps = await loadApps();
      $('#statApps').textContent = String(apps.length);
      renderHero(apps);

      grid.innerHTML = apps.map(tileHTML).join('') + nextTileHTML(apps.length);
      $('#footerApps').innerHTML = apps
        .map((a) => `<li><a href="${esc(detailHref(a))}">${esc(a.name)}</a></li>`)
        .join('');
      // Dil değişiminde yeniden çizilen kartlar animasyonsuz görünsün
      if (render.done) grid.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
      reveal(grid);
      render.done = true;
    } catch (err) {
      console.error('apps.json yüklenemedi:', err);
      $('#heroStage').hidden = true;
      grid.innerHTML = `<p class="notice">${t('loadError')}</p>`;
    }
  }

  function initCopy() {
    const btn = $('#copyEmail');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.email);
        const old = btn.innerHTML;
        btn.textContent = t('copied');
        setTimeout(() => (btn.innerHTML = old), 1800);
      } catch {
        window.location.href = `mailto:${btn.dataset.email}`;
      }
    });
  }

  initCopy();
  render();
  document.addEventListener('langchange', render);
})();

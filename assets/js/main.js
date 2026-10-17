// Boznivo — ana sayfa: öne çıkan uygulama, uygulama ızgarası ve altbilgi listesi apps.json'dan çizilir.
(() => {
  'use strict';

  const B = window.Boznivo;
  const { esc, asset, accentOf, detailHref, icons, statusBadge, phoneScreen, loadApps, reveal, t, tx } = B;
  const $ = (sel) => document.querySelector(sel);

  // Masaüstünde ikon kartı, telefonda App Store tarzı liste satırı (düzen CSS'te değişir)
  const tileHTML = (app, i) => `
    <a href="${esc(detailHref(app))}" class="app-tile reveal" style="--accent:${accentOf(app)};--d:${i * 70}ms" aria-label="${esc(app.name)}: ${esc(tx(app.tagline))}">
      <img class="app-tile__icon" src="${esc(asset(app.icon))}" alt="" width="232" height="232" loading="lazy">
      <span class="app-tile__body">
        <span class="app-tile__name">${esc(app.name)}</span>
        <span class="app-tile__meta">${esc(tx(app.category) || tx(app.tagline))}</span>
        ${statusBadge(app)}
      </span>
      <span class="app-tile__go">${t('view')} ${icons.arrow}</span>
    </a>`;

  // "Çok yakında" kartı: kategori yerine slogan, rozette beklenen tarih ya da inceleme durumu
  const soonTileHTML = (app, i) => {
    const note = tx(app.eta) || (app.inReview ? t('inReview') : t('soon'));
    return `
    <a href="${esc(detailHref(app))}" class="app-tile app-tile--soon reveal" style="--accent:${accentOf(app)};--d:${i * 70}ms" aria-label="${esc(app.name)}: ${esc(tx(app.tagline))}">
      <img class="app-tile__icon" src="${esc(asset(app.icon))}" alt="" width="232" height="232" loading="lazy">
      <span class="app-tile__body">
        <span class="app-tile__name">${esc(app.name)}</span>
        <span class="app-tile__meta">${esc(tx(app.tagline) || tx(app.category))}</span>
        <span class="status status--soon">${esc(note)}</span>
      </span>
      <span class="app-tile__go">${t('view')} ${icons.arrow}</span>
    </a>`;
  };

  const nextTileHTML = (i) => `
    <div class="app-tile app-tile--next reveal" style="--d:${i * 70}ms">
      <span class="app-tile__icon">${icons.plus}</span>
      <span class="app-tile__body">
        <span class="app-tile__name">${t('next')}</span>
        <span class="app-tile__meta">${t('nextSub')}</span>
      </span>
    </div>`;

  // App Store "Bugün" sekmesi tarzı kart (yalnızca telefonda görünür)
  const todayCardHTML = (app) => `
    <a href="${esc(detailHref(app))}" class="today-card" style="--accent:${accentOf(app)}">
      <span class="today-card__top">
        <span class="today-card__eyebrow">${t('featured')}</span>
        <span class="today-card__title">${esc(app.name)}</span>
        <span class="today-card__tag">${esc(tx(app.tagline))}</span>
      </span>
      <img class="today-card__art" src="${esc(asset(app.icon))}" alt="" width="150" height="150">
      <span class="today-card__bar">
        <img src="${esc(asset(app.icon))}" alt="" width="44" height="44">
        <span class="today-card__info"><strong>${esc(app.name)}</strong><span>${esc(tx(app.category))}</span></span>
        <span class="pill">${t('open')}</span>
      </span>
    </a>`;

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
    $('#todayCard').innerHTML = todayCardHTML(featured);

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
      const live = apps.filter((a) => a.status === 'live');
      const soon = apps.filter((a) => a.status !== 'live');
      $('#statApps').textContent = String(live.length);
      renderHero(live.length ? live : apps);

      // Yayındakiler "Uygulamalarım"da; "Sıradaki" kutusu yalnızca yakında bölümü boşken görünür
      grid.innerHTML = live.map(tileHTML).join('') + (soon.length ? '' : nextTileHTML(live.length));

      const soonSection = $('#soon');
      const soonGrid = $('#soonGrid');
      soonSection.hidden = !soon.length;
      soonGrid.innerHTML = soon.map(soonTileHTML).join('');

      $('#footerApps').innerHTML = apps
        .map((a) => `<li><a href="${esc(detailHref(a))}">${esc(a.name)}</a></li>`)
        .join('');
      // Dil değişiminde yeniden çizilen kartlar animasyonsuz görünsün
      if (render.done) [grid, soonSection].forEach((el) => el.querySelectorAll('.reveal').forEach((r) => r.classList.add('is-in')));
      reveal(grid);
      reveal(soonSection);
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

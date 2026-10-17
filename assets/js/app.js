// Boznivo — uygulama detay sayfası: /app.html?id=<apps.json id>
(() => {
  'use strict';

  const B = window.Boznivo;
  const { esc, asset, accentOf, detailHref, privacyHref, icons, storeButton, statusBadge, phoneScreen, loadApps, reveal, t, tx, txList } = B;
  const mount = document.getElementById('appDetail');
  const id = new URLSearchParams(location.search).get('id');

  const setMeta = (sel, value) => document.querySelector(sel)?.setAttribute('content', value);

  function notFound() {
    document.title = `${t('notFoundTitle')} — Boznivo`;
    mount.innerHTML = `
      <section class="notfound">
        <div>
          <div class="notfound__code text-grad">404</div>
          <h1 class="section-title">${t('notFoundTitle')}</h1>
          <p>${t('notFoundText')}</p>
          <a href="/#apps" class="btn btn--primary">${t('allApps')} ${icons.arrow}</a>
        </div>
      </section>`;
  }

  function render(app, apps) {
    const accent = accentOf(app);
    const tagline = tx(app.tagline);
    const description = tx(app.description);
    const category = tx(app.category);
    const platforms = (app.platforms || []).join(', ');

    document.title = `${app.name} — ${tagline || 'Boznivo'}`;
    setMeta('meta[name="description"]', description || tagline);
    setMeta('meta[property="og:title"]', `${app.name} — Boznivo`);
    setMeta('meta[property="og:description"]', tagline);
    document.body.style.setProperty('--accent', accent);

    const features = txList(app.features)
      .map((f, i) => `<li class="feature reveal" style="--d:${i * 60}ms"><span class="feature__check">${icons.check}</span><p>${esc(f)}</p></li>`)
      .join('');

    const shots = (app.screenshots || [])
      .map((src, i) => `<img src="${esc(asset(src))}" alt="${esc(t('shotAlt', { name: app.name }))} ${i + 1}" loading="lazy">`)
      .join('');

    const others = apps.filter((a) => a.id !== app.id)
      .map((a) => `
        <a href="${esc(detailHref(a))}" class="app-tile" style="--accent:${accentOf(a)}">
          <img class="app-tile__icon" src="${esc(asset(a.icon))}" alt="" width="232" height="232" loading="lazy">
          <span class="app-tile__body">
            <span class="app-tile__name">${esc(a.name)}</span>
            <span class="app-tile__meta">${esc(tx(a.category) || tx(a.tagline))}</span>
            ${statusBadge(a)}
          </span>
          <span class="app-tile__go">${t('view')} ${icons.arrow}</span>
        </a>`)
      .join('');

    // App Store'daki bilgi şeridi gibi: kategori, platform, durum, geliştirici
    const infoCell = (label, value) => (value ? `<div class="info-strip__cell"><span>${label}</span><strong>${value}</strong></div>` : '');
    const infoStrip = [
      infoCell(t('category'), esc(category)),
      infoCell(t('platforms'), esc(platforms)),
      infoCell(t('status'), app.status === 'live' ? t('live') : t('soon')),
      infoCell(t('developer'), 'Boznivo'),
    ].join('');

    mount.innerHTML = `
      <section class="detail-hero" style="--accent:${accent}">
        <div class="container">
          <a href="/#apps" class="back-link">${icons.arrowLeft}${t('allApps')}</a>
          <div class="detail-hero__grid">
            <div>
              <div class="detail-head">
                <img class="detail-hero__icon reveal" src="${esc(asset(app.icon))}" alt="${esc(t('iconAlt', { name: app.name }))}" width="116" height="116">
                <div class="detail-head__text">
                  <h1 class="detail-hero__title reveal" style="--d:60ms">${esc(app.name)}</h1>
                  <p class="detail-hero__tagline reveal" style="--d:120ms">${esc(tagline)}</p>
                </div>
              </div>
              <div class="detail-hero__meta reveal" style="--d:180ms">
                ${statusBadge(app, 'status--inline')}
                ${category ? `<span class="tag">${esc(category)}</span>` : ''}
                ${(app.platforms || []).map((p) => `<span class="tag">${esc(p)}</span>`).join('')}
              </div>
              <div class="detail-hero__actions reveal" style="--d:240ms">
                ${storeButton(app)}
                <a href="${esc(privacyHref(app))}" class="link-arrow">${t('privacyPolicy')} ${icons.arrow}</a>
              </div>
            </div>
            <div class="stage reveal" style="--d:160ms;--accent:${accent}" role="img" aria-label="${esc(app.name)}">
              <div class="stage__glow" aria-hidden="true"></div>
              <div class="phone" style="--accent:${accent}">${phoneScreen(app)}</div>
            </div>
          </div>
        </div>
      </section>

      <div class="container">
        <div class="info-strip reveal">${infoStrip}</div>
      </div>

      <section class="section detail-section">
        <div class="container detail-body">
          <div>
            ${description ? `
              <h2 class="subhead reveal">${t('about')}</h2>
              <p class="detail-desc reveal" style="margin-top:14px">${esc(description)}</p>` : ''}
            ${shots ? `
              <h2 class="subhead reveal" style="margin-top:56px">${t('screenshots')}</h2>
              <div class="shots">${shots}</div>` : ''}
            ${features ? `
              <h2 class="subhead reveal" style="margin-top:56px">${t('features')}</h2>
              <ul class="features-grid">${features}</ul>` : ''}
          </div>

          <aside class="aside-card reveal">
            <div class="label-card">
              <div class="label-card__head">${icons.shield}${t('privacy')}</div>
              <div class="label-card__row" style="display:block">
                <p>${t('privacyNote')}</p>
                <a href="${esc(privacyHref(app))}" class="link-arrow" style="margin-top:10px">${t('privacyPolicy')} ${icons.arrow}</a>
              </div>
            </div>
            <a href="mailto:support@boznivo.com?subject=${encodeURIComponent(app.name)}" class="btn btn--ghost" style="margin-top:14px;width:100%">${icons.mail}${t('support')}</a>
          </aside>
        </div>
      </section>

      ${others ? `
        <section class="section section--tight-top">
          <div class="container">
            <h2 class="subhead">${t('moreApps')}</h2>
            <div class="more-apps" style="margin-top:18px">${others}</div>
          </div>
        </section>` : ''}`;

    if (render.done) mount.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
    reveal(mount);
    render.done = true;
  }

  async function load() {
    try {
      const apps = await loadApps();
      const app = apps.find((a) => a.id === id);
      app ? render(app, apps) : notFound();
    } catch (err) {
      console.error('apps.json yüklenemedi:', err);
      notFound();
    }
  }

  load();
  document.addEventListener('langchange', load);
})();

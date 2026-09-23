(() => {
  'use strict';
  const P = globalThis.ShopperLensParser;
  const U = globalThis.ShopperLensUnits;
  if (!P || !U || document.getElementById('shopper-lens-launcher')) return;
  const demo = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (!demo && (location.hostname !== 'www.amazon.com' || !/^\/s(?:\/|$)/.test(location.pathname))) return;

  const defaults = { organic: 'show', sponsored: 'dim', owned: 'hide' };
  const filterIds = Object.keys(defaults);
  const state = { ...defaults, paused: false, selected: new Set(), records: new Map(), comparing: false };
  const isOrganicUnverified = record => record.kind === 'product' && !record.data.sponsored && !record.data.ownedBrand;
  const $ = (selector, scope) => scope.querySelector(selector);
  const make = (tag, text, attrs = {}) => {
    const e = document.createElement(tag);
    if (text != null) e.textContent = text;
    for (const [key, value] of Object.entries(attrs)) e.setAttribute(key, value);
    return e;
  };
  const shared = `
    :host { color-scheme: light; font: 14px/1.5 system-ui, -apple-system, sans-serif; color: #18332d; }
    * { box-sizing: border-box; } .panel, .bar, :host > button { font-family:system-ui, -apple-system, sans-serif; } [hidden] { display:none !important; }
    button, select { font: inherit; color: inherit; }
    button { cursor:pointer; border:1px solid #b7c8be; border-radius:8px; padding:7px 10px; background:white; }
    button:hover { background:#e9f1e9; } button:disabled { cursor:default; opacity:.5; }
    button:focus-visible, select:focus-visible, input:focus-visible, summary:focus-visible, a:focus-visible { outline:3px solid #2175cf; outline-offset:3px; }
    a { color:#096449; } .muted { color:#53665b; } p { margin:9px 0; }
  `;
  const panelHost = make('div', null, { id: 'shopper-lens-panel', 'data-shopper-lens': 'panel' });
  const panel = panelHost.attachShadow({ mode: 'open' });
  // This template contains only static extension-owned markup. Page strings use textContent.
  panel.innerHTML = `<style>${shared}
    .panel { width:min(410px, calc(100vw - 32px)); max-height:calc(100vh - 100px); overflow:auto; padding:20px; border:1px solid #c8d4c8; border-radius:16px; background:#fafbf7; box-shadow:0 12px 45px #142e2d33; }
    .panel.wide { width:min(980px, calc(100vw - 32px)); }
    header { display:flex; align-items:start; gap:12px; justify-content:space-between; } h2 { font-size:22px; line-height:1.2; margin:0; letter-spacing:-.5px; } .eyebrow { font-size:10px; text-transform:uppercase; letter-spacing:1.6px; margin:0 0 7px; color:#56685f; }
    .lead { color:#53665b; margin-bottom:16px; } .filters { display:grid; gap:10px; margin:15px 0; }
    label.filter { display:flex; align-items:center; justify-content:space-between; gap:16px; } select { border:1px solid #b7c8be; border-radius:7px; padding:6px; background:white; }
    .actions { display:flex; flex-wrap:wrap; gap:8px; margin:14px 0; } .primary { color:white; background:#17634e; border-color:#17634e; } .primary:hover { background:#104c3c; }
    .stats { font-variant-numeric:tabular-nums; padding:10px 12px; border-radius:8px; background:#edf2e9; font-size:12px; }
    #status { min-height:20px; font-size:12px; } details { border-top:1px solid #d7dfd5; padding:12px 0 0; margin:12px 0; font-size:12px; } summary { cursor:pointer; font-weight:600; }
    #comparison { margin-top:16px; } .table-scroll { overflow-x:auto; } table { border-collapse:collapse; width:100%; font-size:12px; } caption { text-align:left; font-size:16px; font-weight:700; margin:0 0 10px; }
    th,td { padding:10px; min-width:145px; max-width:230px; text-align:left; vertical-align:top; border:1px solid #d7dfd5; overflow-wrap:anywhere; } th { background:#edf2e9; } th:first-child { min-width:110px; } td p { margin:0 0 8px; }
    .foot { font-size:11px; margin:12px 0 0; color:#53665b; } #close { border:0; padding:2px 6px; }
    .unit-category { margin:12px 0; padding:10px; background:#edf2e9; border-radius:8px; }
    .unit-category h3 { font-size:13px; margin:0 0 4px; } .unit-category p { margin:4px 0; }
    .unit-group { margin-top:9px; padding-top:8px; border-top:1px solid #c8d4c8; }
    .unit-value { font-size:15px; font-weight:700; } .unit-meta, .unit-context { font-size:11px; }
    .unit-winner { margin-top:6px; overflow-wrap:anywhere; } .unit-winner a { display:block; }
    .unit-category details { margin-top:6px; padding-top:6px; } .unit-category ul { padding-left:18px; }
  </style>
  <section class="panel" aria-label="Shopper Lens controls">
    <header><div><p class="eyebrow">A clearer view</p><h2>Shopper Lens</h2></div><button id="close" aria-label="Minimize Shopper Lens">✕</button></header>
    <p class="lead">See the placement. Make your own comparison.</p>
    <div class="stats" id="stats" aria-live="polite">Looking for supported results…</div>
    <div class="filters">
      <label class="filter" for="organic">Organic / unverified<select id="organic" aria-describedby="organic-help"><option value="show">Show</option><option value="dim">Dim</option><option value="hide">Hide</option></select></label>
      <label class="filter" for="sponsored">Sponsored placements<select id="sponsored"><option value="show">Show</option><option value="dim">Dim</option><option value="hide">Hide</option></select></label>
      <label class="filter" for="owned">Verified Amazon brands<select id="owned"><option value="show">Show</option><option value="dim">Dim</option><option value="hide">Hide</option></select></label>
    </div>
    <p id="organic-help" class="muted" style="font-size:12px">Organic / unverified: no sponsored disclosure or verified Amazon brand detected. This is not proof that a result is organic or independent.</p>
    <p class="muted" style="font-size:12px">Filters affect recognized results only. Dimmed items brighten on hover or keyboard focus.</p>
    <div class="actions"><button class="primary" id="compare">Compare selected (0/4)</button><button id="restore">Restore all</button><button id="pause">Pause on this page</button></div>
    <div id="status" role="status"></div>
    <details id="unit-prices" open><summary>Lowest displayed unit prices</summary>
      <p class="muted">All loaded supported cards, including those hidden by your filters. Each currency and unit is compared separately. Products may differ; lowest unit price does not mean best quality or overall value. Offer conditions still apply.</p>
      <div id="unit-summary-content"></div>
    </details>
    <details><summary>What do the labels mean?</summary>
      <p><strong>Organic / unverified:</strong> standard product cards with neither a detected Sponsored disclosure nor a verified Amazon-brand match. This includes uncertain title-only brand mentions. Missing evidence does not establish an organic placement or independent ownership.</p>
      <p><strong>Sponsored:</strong> the page displays a Sponsored disclosure in this card or ad block. Hiding a block hides its whole placement. A missing label is not proof of an unsponsored result.</p>
      <p><strong>Amazon-owned brand:</strong> a separate displayed brand field exactly matches Amazon Basics (including AmazonBasics) or Amazon Essentials. Amazon identifies these as private brands in its <a href="https://press.aboutamazon.com/uk/2025/3/get-ready-to-shop-with-amazon-spring-deal-days" target="_blank" rel="noopener noreferrer">March 2025 release</a>. Registry reviewed September 2026. This verifies the brand relationship, not seller identity or product authenticity.</p>
      <p><strong>Brand uncertain:</strong> a title mentions a known brand but does not supply a supported separate brand field. These results stay outside the brand filter. Other brands are not checked; no label means unknown, not independent.</p>
      <p><strong>Comparison:</strong> copies the displayed listing price/context, star rating, rating count, and title details. Prices can vary by variant, delivery, tax, coupon, or subscription. Ratings are page claims, not a quality check. Pack sizes and specifications are not normalized or independently tested. No value score or recommendation is calculated.</p>
      <p><strong>Unit-price summaries:</strong> use explicit, readable unit prices from standard cards on this loaded page, including cards hidden by Shopper Lens. Different currencies and units stay separate; no amounts are calculated from titles or converted. Missing, ambiguous, ranged, and unsupported values are skipped. Coupons and subscriptions are not calculated; the displayed offer context accompanies the lowest listings. Ties remain ties. Sponsored Amazon-brand cards can appear in both matching categories.</p>
      <p>English Amazon.com desktop search only. Standard cards are comparable; recognized ad blocks are filterable. Some carousels, iframes, new layouts, and offscreen carousel slides may be missed. Results are never reordered.</p>
    </details>
    <div id="comparison" hidden></div>
    <p class="foot">Local to this tab · no saved browsing data · no affiliate injection<br>On reload: organic / unverified Show · sponsored Dim · verified Amazon brands Hide. Restore all shows every category.</p>
  </section>`;
  for (const id of filterIds) $('#'+id, panel).value = state[id];
  const launcherHost = make('div', null, { id: 'shopper-lens-launcher', 'data-shopper-lens': 'launcher' });
  const launcher = launcherHost.attachShadow({ mode: 'open' });
  launcher.innerHTML = `<style>${shared}button{background:#183c30;color:white;border-color:#183c30;border-radius:24px;padding:10px 16px;box-shadow:0 3px 18px #122b2d33}button:hover{background:#245a47}</style><button aria-expanded="false">◉ Shopper Lens</button>`;
  panelHost.hidden = true;
  // CSS uses display:block on the host, so hidden needs its own explicit control.
  panelHost.style.display = 'none';
  document.body.append(panelHost, launcherHost);
  const showPanel = (show) => {
    panelHost.hidden = !show;
    panelHost.style.display = show ? 'block' : 'none';
    $('button', launcher).setAttribute('aria-expanded', String(show));
    if (!show) $('button', launcher).focus();
  };
  $('button', launcher).addEventListener('click', () => showPanel(panelHost.hidden));
  $('#close', panel).addEventListener('click', () => showPanel(false));
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') showPanel(false); });
  const message = text => { $('#status', panel).textContent = text; };
  let observer, timer;
  const observe = () => observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'aria-label', 'href', 'data-asin'] });
  const transaction = fn => { observer?.disconnect(); try { fn(); } finally { if (observer) observe(); } };
  function annotationTarget(element, kind) {
    // Amazon stretches the inner card to 100% of its grid row. A sibling
    // inserted above that wrapper would push it into the next row and cover
    // that row's controls. Keep our content inside the actual product card.
    if (kind === 'product') return element.querySelector('[data-cy="asin-faceout-container"], .puis-card-container') || element;
    return element.querySelector(':scope > .sg-col-inner') || element;
  }
  function annotate(record) {
    const { element, data, kind } = record;
    // A page-rendered clone may retain our host without its shadow controls.
    for (const child of element.querySelectorAll('[data-shopper-lens="card"]')) child.remove();
    const host = make('div', null, { 'data-shopper-lens': 'card' });
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${shared}
      .bar{display:flex;flex-wrap:wrap;gap:7px;align-items:center;padding:7px 9px;background:#f4f7f0;border:1px solid #d0dccc;border-radius:8px;font-size:11px;line-height:1.4}
      .badge{padding:2px 6px;border-radius:4px;background:#e5eee0}.ad{background:#fae9bf;color:#684800}.unknown{background:#efeee7;color:#66604d}
      label{display:flex;align-items:center;gap:5px;cursor:pointer}input{accent-color:#17634e} details{margin:0}summary{cursor:pointer;color:#53665b}details[open]{flex-basis:100%}p{margin:5px 0}
    </style><div class="bar"></div>`;
    const bar = $('.bar', root);
    if (data.sponsored) bar.append(make('span', kind === 'block' ? 'Sponsored block' : 'Sponsored', { class: 'badge ad' }));
    if (data.ownedBrand) bar.append(make('span', `Amazon-owned brand · ${data.ownedBrand}`, { class: 'badge' }));
    else if (data.ownershipStatus === 'uncertain') bar.append(make('span', 'Brand uncertain · title only', { class: 'badge unknown' }));
    if (kind === 'product') {
      const label = make('label');
      const checkbox = make('input', null, { type: 'checkbox', 'aria-label': 'Compare this product' });
      checkbox.checked = state.selected.has(element);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked && state.selected.size >= 4) {
          checkbox.checked = false; showPanel(true); message('Choose up to four products. Uncheck one to add another.'); return;
        }
        if (checkbox.checked) state.selected.add(element); else state.selected.delete(element);
        message(''); updateSummary(); if (state.comparing) renderComparison();
      });
      label.append(checkbox, document.createTextNode('Compare')); bar.append(label);
    }
    const details = make('details'); details.append(make('summary', 'Label evidence'));
    const lines = [data.sponsored ? `Page disclosure: ${data.sponsorEvidence}` : 'Sponsored disclosure not detected in this card; placement is unverified.'];
    if (kind === 'product') lines.push(data.ownershipEvidence || 'No supported separate brand field matches our two-brand registry. Ownership unverified.');
    for (const line of lines) details.append(make('p', line));
    bar.append(details); annotationTarget(element, kind).prepend(host); record.annotation = host;
  }
  function applyFilters() {
    let removed = 0;
    for (const record of state.records.values()) {
      const { element, data } = record;
      const modes = [isOrganicUnverified(record) ? state.organic : 'show', data.sponsored ? state.sponsored : 'show', data.ownedBrand ? state.owned : 'show'];
      const hidden = !state.paused && modes.includes('hide');
      element.classList.toggle('sl-hidden', hidden);
      element.classList.toggle('sl-dim', !hidden && !state.paused && modes.includes('dim'));
      if (hidden && state.selected.delete(element)) { removed++; const c = record.annotation?.shadowRoot.querySelector('input'); if (c) c.checked = false; }
    }
    if (removed) message(`${removed} hidden selection${removed === 1 ? '' : 's'} removed from comparison.`);
    updateSummary(); if (state.comparing) renderComparison();
  }
  let unitSummarySignature;
  function renderUnitSummary(records) {
    const output = $('#unit-summary-content', panel);
    const categories = U.summarize(records.map(r => ({ kind: r.kind, data: r.data, hiddenByLens: r.element.classList.contains('sl-hidden') })));
    const signature = JSON.stringify([state.paused, categories]);
    if (signature === unitSummarySignature) return;
    unitSummarySignature = signature;
    output.replaceChildren();
    if (state.paused) { output.append(make('p', 'Paused. Resume to read unit prices from the page.')); return; }
    const listing = winner => {
      const row = make('div', null, { class: 'unit-winner' });
      const link = make('a', winner.title || 'Original listing', { href: winner.url, target: '_blank', rel: 'noopener noreferrer' });
      row.append(link);
      if (winner.hiddenByLens) row.append(make('p', 'Hidden by your filters; original listing remains available.', { class: 'unit-meta muted' }));
      row.append(make('p', `Displayed offer: ${winner.context || 'Check conditions in the original listing.'}`, { class: 'unit-context' }));
      return row;
    };
    for (const category of categories) {
      const section = make('section', null, { class: 'unit-category', 'data-unit-category': category.id, 'aria-label': `${category.label} unit prices` });
      section.append(make('h3', category.label));
      section.append(make('p', `${category.priced} of ${category.total} cards with readable unit prices · ${category.missing} unavailable`, { class: 'unit-meta muted' }));
      if (!category.groups.length) section.append(make('p', category.total ? 'No reliable unit price displayed.' : 'No supported product cards in this category.'));
      for (const group of category.groups) {
        const row = make('div', null, { class: 'unit-group' });
        row.append(make('p', `${group.display} · lowest displayed`, { class: 'unit-value' }));
        row.append(make('p', `${group.currency} per ${group.unit} · ${group.eligibleCount} eligible card${group.eligibleCount === 1 ? '' : 's'}${group.eligibleCount === 1 ? ' (only one available)' : ''}`, { class: 'unit-meta muted' }));
        if (group.winners.length === 1) row.append(listing(group.winners[0]));
        else {
          const ties = make('details'); ties.append(make('summary', `${group.winners.length} listings tied for lowest`));
          const list = make('ul');
          for (const winner of group.winners) { const item = make('li'); item.append(listing(winner)); list.append(item); }
          ties.append(list); row.append(ties);
        }
        section.append(row);
      }
      output.append(section);
    }
  }
  function updateSummary() {
    const records = [...state.records.values()];
    const products = records.filter(r => r.kind === 'product');
    const hidden = records.filter(r => r.element.classList.contains('sl-hidden')).length;
    $('#stats', panel).textContent = state.paused ? 'Paused. Original results are restored.' : `${products.length} supported product cards · ${products.filter(isOrganicUnverified).length} organic / unverified · ${records.filter(r => r.data.sponsored).length} sponsored placements · ${products.filter(r => r.data.ownedBrand).length} verified brand matches · ${hidden} hidden`;
    if (!products.length && !state.paused) $('#stats', panel).textContent += ' — No comparable cards found; this layout may be unsupported or still loading.';
    $('#compare', panel).textContent = `Compare selected (${state.selected.size}/4)`;
    $('#compare', panel).disabled = state.selected.size < 2;
    renderUnitSummary(records);
  }
  function renderComparison() {
    const output = $('#comparison', panel); output.replaceChildren(); output.hidden = !state.comparing;
    $('.panel', panel).classList.toggle('wide', state.comparing);
    if (!state.comparing) return;
    output.append(make('p', 'Displayed information only. Check variant, pack size, delivery, tax and conditions in the original listing.', { class: 'muted' }));
    const rows = [...state.selected].map(e => state.records.get(e)).filter(r => r && !r.element.classList.contains('sl-hidden'));
    const close = make('button', 'Close comparison'); close.addEventListener('click', () => { state.comparing = false; renderComparison(); }); output.append(close);
    if (rows.length < 2) { output.append(make('p', 'Select at least two remaining product cards to compare.')); return; }
    const scroll = make('div', null, { class: 'table-scroll', tabindex: '0', role: 'region', 'aria-label': 'Product comparison; scroll horizontally for more columns' });
    const table = make('table'); table.append(make('caption', 'Your comparison'));
    const head = make('thead'), hr = make('tr'); hr.append(make('th', 'Displayed field', { scope: 'col' }));
    rows.forEach((r, i) => hr.append(make('th', `Product ${i + 1}`, { scope: 'col' }))); head.append(hr); table.append(head);
    const body = make('tbody');
    const specs = [
      ['Product', d => d.title], ['Brand field', d => d.brandText],
      ['Listing price / context', d => d.price], ['Rating', d => d.rating], ['Rating count', d => d.ratingCount],
      ['Unit price (displayed)', d => d.unitPrice?.display || `Not reliably displayed${d.unitPriceReason ? ` — ${d.unitPriceReason}` : ''}`],
      ['Title details (unverified)', d => d.details],
      ['Placement', d => d.sponsored ? `Sponsored — ${d.sponsorEvidence}` : 'No disclosure detected; unverified'],
      ['Amazon ownership', d => d.ownedBrand ? `Brand match: ${d.ownedBrand}. ${d.ownershipEvidence}` : d.ownershipEvidence || 'Not verified by this page and registry']
    ];
    for (const [label, get] of specs) {
      const tr = make('tr'); tr.append(make('th', label, { scope: 'row' }));
      for (const { data } of rows) {
        const td = make('td', get(data) || 'Not reliably displayed');
        if (label === 'Product' && data.url) { const p = make('p'); const a = make('a', 'Original listing', { href: data.url, target: '_blank', rel: 'noopener noreferrer' }); p.append(a); td.append(p); }
        tr.append(td);
      } body.append(tr);
    } table.append(body); scroll.append(table); output.append(scroll);
  }
  function productIdentity(element, data, kind) {
    if (kind !== 'product') return kind;
    const asin = (element.getAttribute('data-asin') || '').trim().toUpperCase();
    let destination = '';
    try {
      let url = new URL(data.url);
      // Sponsored links can wrap the product URL. Tracking parameters and the
      // human-readable title slug are not a change of product identity.
      if (url.pathname === '/sspa/click' && url.searchParams.get('url')) {
        url = new URL(url.searchParams.get('url'), url.origin);
      }
      const product = url.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([a-z0-9]{10})(?:\/|$)/i);
      const path = product ? `/dp/${product[1].toUpperCase()}` : url.pathname.split('/ref=')[0].replace(/\/$/, '');
      destination = url.origin + path;
    } catch (_) { /* Unreadable destinations cannot contribute an identity. */ }
    return JSON.stringify([asin, destination]);
  }
  function scan() {
    if (state.paused) return;
    transaction(() => {
      // Unapply our styling before inspecting visibility; never overwrite Amazon styles.
      for (const r of state.records.values()) r.element.classList.remove('sl-hidden', 'sl-dim');
      const next = new Map();
      let replacedSelections = 0;
      const cards = [...document.querySelectorAll('[data-component-type="s-search-result"][data-asin]')];
      const add = (element, data, kind) => {
        let record = state.records.get(element);
        const signature = JSON.stringify(data);
        const identity = productIdentity(element, data, kind);
        if (record && record.identity !== identity && state.selected.delete(element)) replacedSelections++;
        if (record && (record.signature !== signature || record.identity !== identity || record.annotation?.parentElement !== annotationTarget(element, kind))) {
          record.annotation?.remove(); record = null;
        }
        if (!record) { record = { element, data, kind, signature, identity }; annotate(record); }
        next.set(element, record);
      };
      for (const element of cards) {
        if (!element.getAttribute('data-asin') || !P.isDisplayed(element)) continue;
        const data = P.parseCard(element);
        if (data.title && data.url) add(element, data, 'product');
      }
      for (const element of document.querySelectorAll('.s-result-item')) {
        if (element.matches('[data-component-type="s-search-result"]') || element.querySelector('[data-component-type="s-search-result"]') || !P.isDisplayed(element)) continue;
        const sponsorEvidence = P.sponsoredEvidence(element);
        if (sponsorEvidence) add(element, { sponsored: true, sponsorEvidence }, 'block');
      }
      for (const [element, old] of state.records) {
        if (!next.has(element)) { old.annotation?.remove(); element.classList.remove('sl-hidden', 'sl-dim'); state.selected.delete(element); }
      }
      state.records = next; applyFilters();
      if (replacedSelections) message(`${replacedSelections} changed product${replacedSelections === 1 ? '' : 's'} removed from comparison. Select replacements to compare them.`);
    });
  }
  for (const id of filterIds) $('#'+id, panel).addEventListener('change', e => {
    state[id] = e.target.value; message(''); transaction(applyFilters);
  });
  $('#restore', panel).addEventListener('click', () => {
    for (const id of filterIds) { state[id] = 'show'; $('#'+id, panel).value = 'show'; }
    transaction(applyFilters); message('All filtered placements restored.');
  });
  $('#compare', panel).addEventListener('click', () => { state.comparing = true; renderComparison(); });
  $('#pause', panel).addEventListener('click', () => {
    state.paused = !state.paused;
    $('#pause', panel).textContent = state.paused ? 'Resume on this page' : 'Pause on this page';
    for (const id of filterIds) $('#'+id, panel).disabled = state.paused;
    if (state.paused) transaction(() => {
      for (const r of state.records.values()) { r.element.classList.remove('sl-hidden', 'sl-dim'); r.annotation?.remove(); }
      state.records.clear(); state.selected.clear(); state.comparing = false; renderComparison(); updateSummary(); message('Page restored. Resume to add labels again.');
    }); else { message(''); scan(); }
  });
  observer = new MutationObserver(mutations => {
    if (state.paused || !mutations.some(m => !m.target.closest?.('[data-shopper-lens]'))) return;
    clearTimeout(timer); timer = setTimeout(scan, 250);
  });
  observe(); scan();
  window.addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(scan, 250); });
})();

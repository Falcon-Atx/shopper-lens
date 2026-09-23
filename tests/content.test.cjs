'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDOM, until, setSelect, button, checkbox } = require('./helpers.cjs');

async function start(t) {
  const context = createDOM(undefined, { content: true });
  t.after(() => context.dom.window.close());
  await until(() => checkbox(context.document, 'ordinary'), 'Expected annotations on visible standard cards');
  context.panel = context.document.getElementById('shopper-lens-panel')?.shadowRoot;
  assert.ok(context.panel, 'Expected isolated controls');
  return context;
}

test('default category order and Show/Dim/Hide choices preserve result order and source links', async t => {
  const { document, panel, errors } = await start(t);
  assert.deepEqual([...panel.querySelectorAll('.filters select')].map(select => select.id), ['organic', 'sponsored', 'owned']);
  assert.match(panel.querySelector('label[for="organic"]').textContent, /Organic \/ unverified/);
  assert.equal(panel.querySelector('#organic').value, 'show');
  assert.equal(panel.querySelector('#sponsored').value, 'dim');
  assert.equal(panel.querySelector('#owned').value, 'hide');
  assert.equal(document.getElementById('owned').classList.contains('sl-hidden'), true);
  assert.equal(document.getElementById('title-only').classList.contains('sl-dim'), true);
  assert.equal(document.getElementById('widget').classList.contains('sl-dim'), true);
  for (const id of ['third-party', 'range', 'no-price', 'ordinary']) {
    assert.equal(document.getElementById(id).matches('.sl-hidden,.sl-dim'), false);
  }
  assert.deepEqual([...document.querySelector('.s-search-results').children].map(card => card.id), ['title-only', 'owned', 'third-party', 'range', 'no-price', 'ordinary']);
  for (const id of ['title-only', 'owned', 'third-party', 'range', 'no-price', 'ordinary']) {
    assert.ok(checkbox(document, id), `Missing comparison choice for ${id}`);
    assert.equal(document.getElementById(id).querySelectorAll('[data-shopper-lens="card"]').length, 1);
  }
  assert.equal(checkbox(document, 'hidden-card'), undefined);
  assert.equal(Boolean(checkbox(document, 'widget')), false, 'A banner must not become a comparable product');
  assert.equal(document.querySelector('#title-only [data-cy="title-recipe"] a').getAttribute('href'), 'https://www.amazon.com/dp/DEMO000001');
  assert.deepEqual(errors, []);
});

test('dim and hide affect only supported labels, and Restore all reverses the changes', async t => {
  const { window, document, panel } = await start(t);
  setSelect(window, panel, 'sponsored', 'dim');
  await until(() => document.getElementById('title-only').classList.contains('sl-dim'));
  assert.equal(document.getElementById('widget').classList.contains('sl-dim'), true, 'A supported sponsored banner must follow the same control');
  assert.equal(document.getElementById('third-party').classList.contains('sl-dim'), false);
  setSelect(window, panel, 'owned', 'hide');
  await until(() => document.getElementById('owned').classList.contains('sl-hidden'));
  assert.equal(document.getElementById('title-only').classList.contains('sl-hidden'), false, 'Title-only ownership must not be hidden');
  assert.equal(document.getElementById('third-party').classList.contains('sl-hidden'), false);
  assert.equal(document.getElementById('widget').classList.contains('sl-hidden'), false, 'Sponsorship alone cannot activate the brand filter');
  button(panel, /^Restore all$/i).click();
  await until(() => document.querySelectorAll('.sl-dim,.sl-hidden').length === 0);
  assert.equal(panel.querySelector('#organic').value, 'show');
  assert.equal(panel.querySelector('#sponsored').value, 'show');
  assert.equal(panel.querySelector('#owned').value, 'show');
});

test('Organic / unverified affects only unmatched standard cards including uncertain title-only brands', async t => {
  const { window, document, panel } = await start(t);
  button(panel, /^Restore all$/i).click();
  setSelect(window, panel, 'organic', 'dim');
  for (const id of ['third-party', 'range', 'no-price', 'ordinary']) {
    assert.equal(document.getElementById(id).classList.contains('sl-dim'), true, `${id} belongs to the unverified category`);
  }
  for (const id of ['title-only', 'owned', 'widget']) {
    assert.equal(document.getElementById(id).matches('.sl-hidden,.sl-dim'), false, `${id} must stay outside the unverified category while it has verified brand or sponsor evidence`);
  }
  document.querySelector('#title-only .s-sponsored-label-info-icon').remove();
  await until(() => document.getElementById('title-only').classList.contains('sl-dim'));
  assert.match(document.querySelector('#title-only [data-shopper-lens="card"]').shadowRoot.textContent, /Brand uncertain/);
  setSelect(window, panel, 'organic', 'hide');
  for (const id of ['title-only', 'third-party', 'range', 'no-price', 'ordinary']) {
    assert.equal(document.getElementById(id).classList.contains('sl-hidden'), true);
  }
  assert.equal(document.getElementById('owned').classList.contains('sl-hidden'), false);
  assert.equal(document.getElementById('widget').classList.contains('sl-hidden'), false);
  button(panel, /^Restore all$/i).click();
  assert.equal(document.querySelectorAll('.sl-dim,.sl-hidden').length, 0);
  assert.deepEqual([...panel.querySelectorAll('.filters select')].map(select => select.value), ['show', 'show', 'show']);
});

test('hiding unverified products prunes only those selections from an open comparison', async t => {
  const { window, document, panel } = await start(t);
  button(panel, /^Restore all$/i).click();
  for (const id of ['ordinary', 'title-only', 'owned']) checkbox(document, id).click();
  button(panel, /^Compare selected/i).click();
  setSelect(window, panel, 'organic', 'hide');
  await until(() => document.getElementById('ordinary').classList.contains('sl-hidden'));
  assert.equal(checkbox(document, 'ordinary').checked, false);
  assert.equal(checkbox(document, 'title-only').checked, true);
  assert.equal(checkbox(document, 'owned').checked, true);
  const tableText = panel.querySelector('table').textContent;
  assert.doesNotMatch(tableText, /Compact desk lamp/);
  assert.match(tableText, /Amazon Basics USB-C charging cable/);
  assert.match(tableText, /Cotton crewneck T-shirt/);
});

test('sponsored and owned overlap keeps Hide precedence and stays outside the unverified category', async t => {
  const { window, document, panel } = await start(t);
  const card = document.getElementById('owned');
  card.insertAdjacentHTML('beforeend', '<span class="s-sponsored-label-info-icon">Sponsored</span>');
  await until(() => /Sponsored/.test(card.querySelector('[data-shopper-lens="card"]').shadowRoot.querySelector('.badge.ad')?.textContent || ''));
  assert.equal(card.classList.contains('sl-hidden'), true, 'Default owned Hide takes precedence over sponsored Dim');
  assert.equal(card.classList.contains('sl-dim'), false);
  setSelect(window, panel, 'organic', 'hide');
  setSelect(window, panel, 'owned', 'show');
  assert.equal(card.classList.contains('sl-hidden'), false);
  assert.equal(card.classList.contains('sl-dim'), true);
  setSelect(window, panel, 'sponsored', 'show');
  assert.equal(card.matches('.sl-hidden,.sl-dim'), false, 'Organic Hide cannot affect a sponsored verified-brand card');
  setSelect(window, panel, 'owned', 'dim');
  setSelect(window, panel, 'sponsored', 'hide');
  assert.equal(card.classList.contains('sl-hidden'), true);
  assert.equal(card.classList.contains('sl-dim'), false);
});

test('comparison is limited to four displayed products and explains missing values', async t => {
  const { document, panel } = await start(t);
  button(panel, /^Restore all$/i).click();
  for (const id of ['no-price', 'owned', 'third-party', 'ordinary', 'range']) checkbox(document, id).click();
  const selected = ['no-price', 'owned', 'third-party', 'ordinary', 'range'].filter(id => checkbox(document, id).checked);
  assert.equal(selected.length, 4);
  button(panel, /^Compare selected/i).click();
  await until(() => panel.querySelector('table'), 'Expected a visible comparison table');
  const tableText = panel.querySelector('table').textContent;
  assert.match(tableText, /Rechargeable batteries/);
  assert.match(panel.textContent, /not (?:shown|displayed|available)|unknown|missing/i);
  assert.match(panel.textContent, /displayed|page/i);
  assert.doesNotMatch(tableText, /Desk organizer with several sizes/, 'Fifth choice must not leak into comparison');
});

test('hiding a selected product removes it from the comparison selection', async t => {
  const { window, document, panel } = await start(t);
  checkbox(document, 'title-only').click();
  checkbox(document, 'ordinary').click();
  checkbox(document, 'third-party').click();
  setSelect(window, panel, 'sponsored', 'hide');
  await until(() => document.getElementById('title-only').classList.contains('sl-hidden'));
  assert.equal(checkbox(document, 'title-only').checked, false);
  assert.equal(checkbox(document, 'ordinary').checked, true);
  button(panel, /^Compare selected/i).click();
  await until(() => panel.querySelector('table'));
  assert.doesNotMatch(panel.querySelector('table').textContent, /Amazon Basics USB-C charging cable/);
});

test('dynamic results receive labels and current filtering without duplicate controls', async t => {
  const { window, document, panel, errors } = await start(t);
  setSelect(window, panel, 'organic', 'hide');
  setSelect(window, panel, 'sponsored', 'dim');
  const card = document.getElementById('title-only').cloneNode(true);
  card.id = 'dynamic-card';
  card.dataset.asin = 'DEMO000008';
  card.classList.remove('sl-dim', 'sl-hidden');
  card.querySelectorAll('[data-shopper-lens]').forEach(node => node.remove());
  document.querySelector('.s-search-results').append(card);
  await until(() => checkbox(document, 'dynamic-card'));
  assert.equal(card.classList.contains('sl-dim'), true);
  card.querySelector('.s-sponsored-label-info-icon').remove();
  await until(() => card.classList.contains('sl-hidden'), 'Removing sponsorship evidence must apply the unverified category choice');
  assert.equal(card.classList.contains('sl-dim'), false);
  card.insertAdjacentHTML('beforeend', '<span class="s-sponsored-label-info-icon">Sponsored</span>');
  await until(() => card.classList.contains('sl-dim'), 'New sponsorship evidence must apply the sponsored category choice');
  assert.equal(card.classList.contains('sl-hidden'), false);
  assert.equal(card.querySelectorAll('[data-shopper-lens="card"]').length, 1);
  assert.deepEqual(errors, []);
});

test('an open comparison refreshes changed prices and removes cards hidden by the page', async t => {
  const { document, panel } = await start(t);
  button(panel, /^Restore all$/i).click();
  for (const id of ['ordinary', 'owned', 'third-party']) checkbox(document, id).click();
  button(panel, /^Compare selected/i).click();
  await until(() => panel.querySelector('table'));
  assert.match(panel.querySelector('table').textContent, /\$19\.99/);
  document.querySelector('#ordinary .a-price .a-offscreen').textContent = '$21.99';
  document.querySelector('#ordinary .a-price [aria-hidden]').textContent = '$21.99';
  await until(() => /\$21\.99/.test(panel.querySelector('table').textContent), 'Comparison must refresh changed displayed prices');
  document.getElementById('owned').hidden = true;
  await until(() => !panel.querySelector('table').textContent.includes('Cotton crewneck T-shirt'), 'Page-hidden cards must leave comparison');
  assert.equal(checkbox(document, 'owned'), undefined);
});

test('page removal of a card annotation restores exactly one set of controls', async t => {
  const { document } = await start(t);
  const card = document.getElementById('owned');
  card.querySelector('[data-shopper-lens="card"]').remove();
  await until(() => checkbox(document, 'owned'), 'Page redraw removed controls; they must be restored');
  assert.equal(card.querySelectorAll('[data-shopper-lens="card"]').length, 1);
  assert.match(card.querySelector('[data-shopper-lens="card"]').shadowRoot.textContent, /Amazon-owned brand/);
});

test('nested grid annotations stay inside the product container through scans and redraws', async t => {
  for (const targetAttributes of ['data-cy="asin-faceout-container"', 'class="puis-card-container"']) {
    const context = createDOM(`<!doctype html><html lang="en"><body>
      <div id="nested" data-component-type="s-search-result" data-asin="NEST000001">
        <div class="sg-col-inner" style="height:100%"><div ${targetAttributes}>
          <div data-cy="title-recipe"><a href="https://www.amazon.com/dp/NEST000001"><h2>Nested synthetic product</h2></a></div>
          <span class="a-price"><span class="a-offscreen">$9.99</span><span aria-hidden="true">$9.99</span></span>
        </div></div>
      </div>
    </body></html>`, { content: true });
    t.after(() => context.dom.window.close());
    const { document } = context;
    const card = document.getElementById('nested');
    const selector = '[data-cy="asin-faceout-container"], .puis-card-container';
    let target = card.querySelector(selector);
    await until(() => checkbox(document, 'nested'));
    const firstHost = card.querySelector('[data-shopper-lens="card"]');
    assert.equal(firstHost.parentElement, target, `Annotation must be inside ${targetAttributes}`);
    assert.equal(target.firstElementChild, firstHost);
    assert.equal(card.children.length, 1, 'No annotation may precede the height:100% inner wrapper');
    assert.equal(card.firstElementChild.className, 'sg-col-inner');
    checkbox(document, 'nested').click();

    // A new unrelated result forces another full scan of the unchanged card.
    const other = document.createElement('div');
    other.id = 'scan-trigger';
    other.dataset.componentType = 's-search-result';
    other.dataset.asin = 'NEST000002';
    other.innerHTML = '<div data-cy="title-recipe"><a href="https://www.amazon.com/dp/NEST000002"><h2>Second synthetic product</h2></a></div>';
    document.body.append(other);
    await until(() => checkbox(document, 'scan-trigger'));
    assert.equal(card.querySelector('[data-shopper-lens="card"]'), firstHost);
    assert.equal(card.querySelectorAll('[data-shopper-lens="card"]').length, 1);
    assert.equal(checkbox(document, 'nested').checked, true);

    // Amazon can replace the entire faceout while keeping its outer result node.
    const replacement = target.cloneNode(true);
    replacement.querySelectorAll('[data-shopper-lens="card"]').forEach(node => node.remove());
    target.replaceWith(replacement);
    target = replacement;
    await until(() => checkbox(document, 'nested'), 'Redrawn inner product container must regain its controls');
    assert.equal(card.querySelector('[data-shopper-lens="card"]').parentElement, target);
    assert.equal(card.querySelectorAll('[data-shopper-lens="card"]').length, 1);
    assert.equal(card.children.length, 1);
    assert.equal(checkbox(document, 'nested').checked, true, 'A redraw of the same product preserves the shopper’s selection');
  }
});

test('reusing a selected card element for another product cannot carry over the selection', async t => {
  const { document, panel } = await start(t);
  button(panel, /^Restore all$/i).click();
  for (const id of ['ordinary', 'owned', 'third-party']) checkbox(document, id).click();
  button(panel, /^Compare selected/i).click();
  const card = document.getElementById('ordinary');
  card.dataset.asin = 'DEMO000099';
  const link = card.querySelector('[data-cy="title-recipe"] a');
  link.href = 'https://www.amazon.com/dp/DEMO000099';
  link.querySelector('h2').textContent = 'Replacement product never selected by the shopper';
  await until(() => !checkbox(document, 'ordinary')?.checked, 'Selection must not transfer when Amazon reuses a result element');
  assert.doesNotMatch(panel.querySelector('table').textContent, /Replacement product|Compact desk lamp/);
  assert.equal(['ordinary', 'owned', 'third-party'].filter(id => checkbox(document, id)?.checked).length, 2);
});

test('price and tracking query updates for the same ASIN preserve the shopper’s selection', async t => {
  const { document, panel } = await start(t);
  button(panel, /^Restore all$/i).click();
  for (const id of ['ordinary', 'owned']) checkbox(document, id).click();
  button(panel, /^Compare selected/i).click();
  const card = document.getElementById('ordinary');
  card.querySelector('[data-cy="title-recipe"] a').href = 'https://www.amazon.com/dp/DEMO000006?ref=synthetic-layout-update';
  card.querySelector('.a-price .a-offscreen').textContent = '$22.99';
  card.querySelector('.a-price [aria-hidden]').textContent = '$22.99';
  await until(() => /\$22\.99/.test(panel.querySelector('table')?.textContent || ''), 'Same-product price updates should refresh comparison');
  assert.equal(checkbox(document, 'ordinary').checked, true);
  assert.equal(checkbox(document, 'owned').checked, true);
});

test('Pause restores all categories and Resume reapplies the current three choices', async t => {
  const { window, document, panel } = await start(t);
  setSelect(window, panel, 'organic', 'dim');
  setSelect(window, panel, 'sponsored', 'hide');
  setSelect(window, panel, 'owned', 'show');
  await until(() => document.getElementById('title-only').classList.contains('sl-hidden'));
  button(panel, /^Pause on this page$/i).click();
  await until(() => document.querySelectorAll('.sl-hidden,.sl-dim').length === 0);
  assert.equal(document.querySelectorAll('[data-shopper-lens="card"]').length, 0);
  assert.ok(document.getElementById('shopper-lens-launcher'), 'A launcher must remain so the user can resume');
  for (const id of ['organic', 'sponsored', 'owned']) assert.equal(panel.querySelector(`#${id}`).disabled, true);
  assert.deepEqual([...panel.querySelectorAll('.filters select')].map(select => select.value), ['dim', 'hide', 'show']);
  button(panel, /^Resume on this page$/i).click();
  await until(() => checkbox(document, 'ordinary'));
  for (const id of ['organic', 'sponsored', 'owned']) assert.equal(panel.querySelector(`#${id}`).disabled, false);
  assert.equal(document.getElementById('ordinary').classList.contains('sl-dim'), true);
  assert.equal(document.getElementById('title-only').classList.contains('sl-hidden'), true);
  assert.equal(document.getElementById('owned').matches('.sl-hidden,.sl-dim'), false);
});

test('a fresh page reapplies defaults after previous page choices', async t => {
  const first = await start(t);
  button(first.panel, /^Restore all$/i).click();
  setSelect(first.window, first.panel, 'organic', 'hide');
  setSelect(first.window, first.panel, 'owned', 'dim');
  const next = await start(t);
  assert.deepEqual([...next.panel.querySelectorAll('.filters select')].map(select => select.value), ['show', 'dim', 'hide']);
  assert.equal(next.document.getElementById('ordinary').matches('.sl-hidden,.sl-dim'), false);
  assert.equal(next.document.getElementById('title-only').classList.contains('sl-dim'), true);
  assert.equal(next.document.getElementById('owned').classList.contains('sl-hidden'), true);
});

function addDisplayedUnitPrice(document, id, amount) {
  const card = document.getElementById(id);
  const region = card.querySelector('.a-price').parentElement;
  region.dataset.cy = 'price-recipe';
  const unit = document.createElement('span');
  unit.className = 'a-size-base';
  unit.textContent = `($${amount} / count)`;
  region.append(unit);
  return unit;
}

function unitCategory(panel, id) {
  return panel.querySelector(`#unit-summary-content [data-unit-category="${id}"]`);
}

test('unit summaries explain missing data without inventing zero prices or counting ad blocks', async t => {
  const { document, panel } = await start(t);
  assert.equal(panel.querySelector('#unit-prices').open, true);
  assert.match(panel.querySelector('#unit-prices').textContent, /including those hidden by your filters/i);
  assert.match(panel.querySelector('#unit-prices').textContent, /does not mean best quality or overall value/i);
  assert.match(unitCategory(panel, 'organic').textContent, /0 of 4 cards with readable unit prices.*4 unavailable/);
  assert.match(unitCategory(panel, 'sponsored').textContent, /0 of 1 cards with readable unit prices.*1 unavailable/);
  assert.match(unitCategory(panel, 'owned').textContent, /0 of 1 cards with readable unit prices.*1 unavailable/);
  for (const id of ['organic', 'sponsored', 'owned']) {
    assert.match(unitCategory(panel, id).textContent, /No reliable unit price displayed/);
    assert.equal(unitCategory(panel, id).querySelectorAll('.unit-value,a').length, 0);
    assert.equal(panel.querySelector(`#${id}-price`).textContent.trim(), 'Unit price unavailable');
    assert.equal(panel.querySelector(`#${id}-price`).classList.contains('filter-price'), true);
  }
  for (const [id, expected] of [['organic', 'Organic / unverified'], ['sponsored', 'Sponsored placements'], ['owned', 'Verified Amazon brands']]) {
    const select = panel.querySelector(`#${id}`);
    assert.equal(select.labels.length, 1);
    const label = select.labels[0].cloneNode(true);
    label.querySelectorAll('select,[aria-hidden="true"]').forEach(element => element.remove());
    assert.equal(label.textContent.trim(), expected, 'Inline prices must not replace or pollute the category label');
  }
  document.getElementById('owned').remove();
  document.getElementById('title-only').remove();
  await until(() => panel.querySelector('#owned-price').textContent.trim() === 'No supported cards');
  assert.equal(panel.querySelector('#sponsored-price').textContent.trim(), 'No supported cards', 'A remaining ad block does not count as a product with a unit price');
});

test('unit summaries retain tied original listings, offer context and hidden brand winners', async t => {
  const { document, panel } = await start(t);
  addDisplayedUnitPrice(document, 'ordinary', '0.50');
  const thirdPartyUnit = addDisplayedUnitPrice(document, 'third-party', '0.50');
  const condition = document.createElement('span');
  condition.textContent = 'Extra 15% off when you subscribe';
  thirdPartyUnit.parentElement.append(condition);
  addDisplayedUnitPrice(document, 'owned', '0.25');
  addDisplayedUnitPrice(document, 'title-only', '0.75');
  document.getElementById('widget').insertAdjacentHTML('beforeend', '<div data-cy="price-recipe"><span class="a-price"><span class="a-offscreen">$0.01</span></span><span>($0.01 / count)</span></div>');
  await until(() => unitCategory(panel, 'organic').querySelectorAll('.unit-winner').length === 2, 'Equal unit prices should preserve both original listings');
  const organic = unitCategory(panel, 'organic');
  assert.match(organic.querySelector('.unit-value').textContent, /\$0\.50\s*\/\s*count/);
  assert.match(organic.textContent, /2 of 4 cards with readable unit prices.*2 unavailable/);
  assert.match(organic.querySelector('.unit-group summary').textContent, /2 listings tied/);
  assert.deepEqual([...organic.querySelectorAll('.unit-winner a')].map(link => link.href).sort(), [
    'https://www.amazon.com/dp/DEMO000003',
    'https://www.amazon.com/dp/DEMO000006',
  ]);
  assert.match(organic.textContent, /Extra 15% off when you subscribe/);
  const owned = unitCategory(panel, 'owned');
  assert.equal(document.getElementById('owned').classList.contains('sl-hidden'), true);
  assert.match(owned.querySelector('.unit-value').textContent, /\$0\.25\s*\/\s*count/);
  assert.match(owned.textContent, /Hidden by your filters/);
  assert.equal(owned.querySelector('a').href, 'https://www.amazon.com/dp/DEMO000002');
  assert.equal(panel.querySelector('#owned-price').textContent.trim(), '$0.25 / count (USD) · only one available', 'Inline price includes filter-hidden products and the one-candidate limitation');
  const sponsored = unitCategory(panel, 'sponsored');
  assert.match(sponsored.textContent, /1 of 1 cards with readable unit prices/);
  assert.match(sponsored.querySelector('.unit-value').textContent, /\$0\.75\s*\/\s*count/);
  assert.doesNotMatch(sponsored.textContent, /\$0\.01/);
  assert.equal(panel.querySelector('#sponsored-price').textContent.trim(), '$0.75 / count (USD) · only one available');
  for (const [id, symbol, unit] of [['SUMM000001', '€', 'count'], ['SUMM000002', '$', 'item']]) {
    const card = document.getElementById('ordinary').cloneNode(true);
    card.id = id;
    card.dataset.asin = id;
    card.querySelectorAll('[data-shopper-lens]').forEach(element => element.remove());
    card.querySelector('[data-cy="title-recipe"] a').href = `https://www.amazon.com/dp/${id}`;
    card.querySelector('a h2').textContent = `Synthetic ${symbol} per ${unit} example`;
    card.querySelector('[data-cy="price-recipe"]').innerHTML = `<span class="a-price"><span class="a-offscreen">${symbol}19.99</span><span aria-hidden="true">${symbol}19.99</span></span><span class="a-size-base">(${symbol}0.10 / ${unit})</span>`;
    document.querySelector('.s-search-results').append(card);
  }
  await until(() => unitCategory(panel, 'organic').querySelectorAll('.unit-group').length === 3);
  const inline = panel.querySelector('#organic-price').textContent;
  for (const value of ['€0.10 / count (EUR)', '$0.50 / count (USD)', '$0.10 / item (USD)']) {
    assert.ok(inline.includes(value), `Inline summary must retain separate currency/unit minimum: ${value}`);
  }
  assert.equal(unitCategory(panel, 'organic').querySelectorAll('.unit-winner').length, 4, 'Adding separate units must preserve both count-price ties');
});

test('unit summaries react to price edits, retain filtered winners, and clear while paused', async t => {
  const { window, document, panel } = await start(t);
  const ordinaryUnit = addDisplayedUnitPrice(document, 'ordinary', '0.50');
  addDisplayedUnitPrice(document, 'third-party', '0.40');
  await until(() => unitCategory(panel, 'organic').querySelector('.unit-winner a')?.href.endsWith('/DEMO000003'));
  assert.equal(panel.querySelector('#organic-price').textContent.trim(), '$0.40 / count (USD)');
  ordinaryUnit.textContent = '($0.20 / count)';
  await until(() => unitCategory(panel, 'organic').querySelector('.unit-winner a')?.href.endsWith('/DEMO000006'), 'Changing a displayed unit amount must update the lowest listing');
  assert.match(unitCategory(panel, 'organic').querySelector('.unit-value').textContent, /\$0\.20/);
  assert.equal(panel.querySelector('#organic-price').textContent.trim(), '$0.20 / count (USD)');
  setSelect(window, panel, 'organic', 'hide');
  assert.equal(document.getElementById('ordinary').classList.contains('sl-hidden'), true);
  assert.equal(unitCategory(panel, 'organic').querySelector('.unit-winner a').href, 'https://www.amazon.com/dp/DEMO000006');
  assert.match(unitCategory(panel, 'organic').textContent, /2 of 4 cards with readable unit prices/);
  assert.match(unitCategory(panel, 'organic').textContent, /Hidden by your filters/);
  assert.equal(panel.querySelector('#organic-price').textContent.trim(), '$0.20 / count (USD)', 'Hiding the category must not hide its inline minimum');
  button(panel, /^Restore all$/i).click();
  assert.doesNotMatch(unitCategory(panel, 'organic').textContent, /Hidden by your filters/);
  button(panel, /^Pause on this page$/i).click();
  const output = panel.querySelector('#unit-summary-content');
  assert.match(output.textContent, /Paused/);
  assert.equal(output.querySelectorAll('a,.unit-value,[data-unit-category]').length, 0, 'Pause must not leave old price summaries visible');
  for (const id of ['organic', 'sponsored', 'owned']) assert.equal(panel.querySelector(`#${id}-price`).textContent.trim(), 'Paused');
  ordinaryUnit.textContent = '($0.30 / count)';
  button(panel, /^Resume on this page$/i).click();
  await until(() => /\$0\.30/.test(unitCategory(panel, 'organic')?.querySelector('.unit-value')?.textContent || ''), 'Resume must read current prices rather than restore stale summary data');
  assert.equal(unitCategory(panel, 'organic').querySelector('.unit-winner a').href, 'https://www.amazon.com/dp/DEMO000006');
  assert.equal(panel.querySelector('#organic-price').textContent.trim(), '$0.30 / count (USD)');
});

test('unsupported pages are left alone', async t => {
  const { dom, document } = createDOM(undefined, { content: true, url: 'https://www.amazon.com/dp/DEMO000001' });
  t.after(() => dom.window.close());
  await new Promise(resolve => setTimeout(resolve, 150));
  assert.equal(document.querySelector('[data-shopper-lens="card"]'), null);
  assert.equal(document.getElementById('shopper-lens-panel'), null);
});

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

test('default state labels cards without filtering and leaves source links unchanged', async t => {
  const { document, panel, errors } = await start(t);
  assert.equal(panel.querySelector('#sponsored').value, 'show');
  assert.equal(panel.querySelector('#owned').value, 'show');
  assert.equal(document.querySelectorAll('.sl-hidden,.sl-dim').length, 0);
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
  assert.equal(panel.querySelector('#sponsored').value, 'show');
  assert.equal(panel.querySelector('#owned').value, 'show');
});

test('comparison is limited to four displayed products and explains missing values', async t => {
  const { document, panel } = await start(t);
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
  await until(() => !card.classList.contains('sl-dim'), 'Removing displayed sponsorship evidence must remove the dim effect');
  assert.equal(card.querySelectorAll('[data-shopper-lens="card"]').length, 1);
  assert.deepEqual(errors, []);
});

test('an open comparison refreshes changed prices and removes cards hidden by the page', async t => {
  const { document, panel } = await start(t);
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

test('reusing a selected card element for another product cannot carry over the selection', async t => {
  const { document, panel } = await start(t);
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

test('pause restores product visibility and removes card interventions', async t => {
  const { window, document, panel } = await start(t);
  setSelect(window, panel, 'sponsored', 'hide');
  await until(() => document.getElementById('title-only').classList.contains('sl-hidden'));
  button(panel, /^Pause on this page$/i).click();
  await until(() => document.querySelectorAll('.sl-hidden,.sl-dim').length === 0);
  assert.equal(document.querySelectorAll('[data-shopper-lens="card"]').length, 0);
  assert.ok(document.getElementById('shopper-lens-launcher'), 'A launcher must remain so the user can resume');
});

test('unsupported pages are left alone', async t => {
  const { dom, document } = createDOM(undefined, { content: true, url: 'https://www.amazon.com/dp/DEMO000001' });
  t.after(() => dom.window.close());
  await new Promise(resolve => setTimeout(resolve, 150));
  assert.equal(document.querySelector('[data-shopper-lens="card"]'), null);
  assert.equal(document.getElementById('shopper-lens-panel'), null);
});

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDOM } = require('./helpers.cjs');

test('current title layout yields the product title, current price and labelled rating counts', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const item = parser.parseCard(document.getElementById('title-only'));
  assert.match(item.title, /^Amazon Basics USB-C charging cable/);
  assert.match(item.url, /^https:\/\/www\.amazon\.com\/dp\/DEMO000001/);
  assert.equal(item.price, '$12.99', 'The crossed-out list price must not replace the displayed current price');
  assert.match(item.rating, /4\.7/);
  assert.match(item.ratingCount.replace(/,/g, ''), /88433/);
  assert.equal(item.details, '6 feet · USB-C to USB-C · 2 pack');
  assert.equal(item.sponsored, true);
  assert.ok(item.sponsorEvidence, 'A positive sponsorship label must have an explanation');
});

test('a separate recognized brand field verifies ownership without confusing the brand with the title', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const item = parser.parseCard(document.getElementById('owned'));
  assert.match(item.title, /^Cotton crewneck T-shirt/);
  assert.equal(item.brandText, 'Amazon Essentials');
  assert.equal(item.ownedBrand, 'Amazon Essentials');
  assert.equal(item.ownershipStatus, 'verified');
  assert.ok(item.ownershipEvidence);
  assert.equal(item.sponsored, false);
});

test('title-only Amazon Basics remains uncertain and cannot establish ownership', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const item = parser.parseCard(document.getElementById('title-only'));
  assert.equal(item.ownedBrand, null);
  assert.equal(item.ownershipStatus, 'uncertain');
});

test('compatibility titles, Amazon’s Choice and Sold by Amazon do not imply brand ownership or sponsorship', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const item = parser.parseCard(document.getElementById('third-party'));
  assert.equal(item.brandText, 'Cedar Sample');
  assert.equal(item.ownedBrand, null);
  assert.notEqual(item.ownershipStatus, 'verified');
  assert.equal(item.sponsored, false, 'The only Sponsored label in this card is hidden');
});

test('only visible sponsor labels count, including ancestor visibility', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const card = document.getElementById('ordinary');
  for (const markup of [
    '<span hidden>Sponsored</span>',
    '<div style="display:none"><span>Sponsored</span></div>',
    '<div style="visibility:hidden"><span>Sponsored</span></div>',
    '<div aria-hidden="true"><span>Sponsored</span></div>',
    '<span class="a-offscreen">Sponsored</span>',
    '<span class="a-popover-preload">Sponsored</span>',
    '<span data-shopper-lens="card">Sponsored</span>',
  ]) {
    const holder = document.createElement('div');
    holder.innerHTML = markup;
    card.append(holder);
    assert.equal(parser.parseCard(card).sponsored, false, markup);
    holder.remove();
  }
  const label = document.createElement('span');
  label.className = 's-sponsored-label-info-icon';
  label.textContent = 'Sponsored';
  card.prepend(label);
  assert.equal(parser.parseCard(card).sponsored, true);
});

test('struck-out or hidden prices cannot supply a missing current price', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const card = document.getElementById('no-price');
  assert.equal(parser.parseCard(card).price, null);
  card.insertAdjacentHTML('beforeend', '<div style="display:none"><span class="a-price"><span class="a-offscreen">$7.00</span></span></div>');
  assert.equal(parser.parseCard(card).price, null);
});

test('a displayed price range is preserved or omitted, never reduced to a misleading single amount', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const item = parser.parseCard(document.getElementById('range'));
  assert.ok(item.price === null || (/15\.00/.test(item.price) && /25\.00/.test(item.price)), `Misleading range: ${item.price}`);
});

test('competing prices without a range separator remain unknown', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const card = document.getElementById('range');
  const firstPrice = card.querySelector('.a-price');
  firstPrice.nextSibling.textContent = ' Other offer ';
  assert.equal(parser.parseCard(card).price, null);
});

test('unit prices add context without replacing the main displayed amount', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const card = document.getElementById('ordinary');
  card.querySelector('.a-price').parentElement.insertAdjacentHTML('beforeend', '<span class="a-size-base">($2.50 / count)</span>');
  const price = parser.parseCard(card).price;
  assert.match(price, /^\$19\.99/);
  assert.match(price, /\$2\.50 \/ count/);
});

test('observed title-differentiators class supplies displayed specification text', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const card = document.getElementById('ordinary');
  const details = card.querySelector('[data-cy="title-differentiators"]');
  details.removeAttribute('data-cy');
  details.className = 'title-differentiators';
  assert.equal(parser.parseCard(card).details, 'Warm white · USB power · Touch control');
});

test('displayed price conditions retain from, Prime, coupons and subscription qualifications', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const card = document.getElementById('ordinary');
  const priceRegion = card.querySelector('.a-price').parentElement;
  priceRegion.dataset.cy = 'price-recipe';
  priceRegion.insertAdjacentHTML('afterbegin', '<span>From</span> ');
  priceRegion.insertAdjacentHTML('beforeend', '<span>with Prime</span><div>Apply 10% coupon</div><div>Extra 15% off when you subscribe</div>');
  const price = parser.parseCard(card).price;
  assert.match(price, /^From \$19\.99/);
  assert.match(price, /with Prime/);
  assert.match(price, /Apply 10% coupon/);
  assert.match(price, /Extra 15% off when you subscribe/);
  assert.equal(price.match(/\$19\.99/g).length, 1, 'Accessible and visual price copies must not duplicate the amount');
});

test('hidden promotions stay outside price context and strike prices remain identified', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const card = document.getElementById('title-only');
  const priceRegion = card.querySelector('.a-price').parentElement;
  priceRegion.dataset.cy = 'price-recipe';
  priceRegion.insertAdjacentHTML('beforeend', '<div hidden>Apply 90% coupon</div><div style="display:none">Free with subscription</div>');
  const price = parser.parseCard(card).price;
  assert.match(price, /\$12\.99/);
  assert.match(price, /struck-through: \$19\.99/);
  assert.doesNotMatch(price, /90%|Free with subscription/);
});

test('live unit-price text styling does not imply a struck-through price', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const card = document.getElementById('ordinary');
  const priceRegion = card.querySelector('.a-price').parentElement;
  priceRegion.dataset.cy = 'price-recipe';
  priceRegion.insertAdjacentHTML('beforeend', `
    <span>(<span class="a-price a-text-price" data-a-size="b"><span class="a-offscreen">$0.32</span><span aria-hidden="true">$0.32</span></span> / count)</span>
    <div>Extra 15% off when you subscribe</div>
    <div>List: <span class="a-price a-text-price" data-a-size="b" data-a-strike="true"><span class="a-offscreen">$29.99</span><span aria-hidden="true">$29.99</span></span></div>
  `);
  const price = parser.parseCard(card).price;
  assert.match(price, /^\$19\.99/);
  assert.match(price, /\$0\.32\s*\/\s*count/);
  assert.match(price, /Extra 15% off when you subscribe/);
  assert.match(price, /struck-through: \$29\.99/);
  assert.doesNotMatch(price, /struck-through:\s*\$0\.32/, 'The unit amount is normal text, not an old/list price');
});

test('brand aliases match exactly and product-title text cannot masquerade as a sponsor label', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const card = document.getElementById('owned');
  const brand = card.querySelector('.a-size-mini');
  brand.textContent = 'AmazonBasics';
  assert.equal(parser.parseCard(card).ownedBrand, 'Amazon Basics');
  brand.textContent = 'Amazon Basics compatible accessories';
  assert.equal(parser.parseCard(card).ownedBrand, null);
  card.querySelector('a h2').textContent = 'Sponsored';
  assert.equal(parser.parseCard(card).sponsored, false);
});

test('missing rating, count and specifications stay unknown instead of being fabricated', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const item = parser.parseCard(document.getElementById('no-price'));
  assert.equal(item.rating, null);
  assert.equal(item.ratingCount, null);
  assert.equal(item.details, null);
});

test('active-code and non-web links are not exposed as clickable product URLs', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  const card = document.getElementById('ordinary');
  const link = card.querySelector('[data-cy="title-recipe"] a');
  for (const href of ['javascript:alert(1)', 'data:text/html,example', 'mailto:example@example.test']) {
    link.setAttribute('href', href);
    const item = parser.parseCard(card);
    assert.ok(item === null || item.url === null, `Unsafe or unrelated link was retained: ${href}`);
  }
});

test('hidden containers and detached nodes are not displayed', t => {
  const { dom, document, parser } = createDOM();
  t.after(() => dom.window.close());
  assert.equal(parser.isDisplayed(document.getElementById('hidden-card')), false);
  assert.equal(parser.isDisplayed(document.createElement('span')), false);
  assert.equal(parser.isDisplayed(document.getElementById('ordinary')), true);
});

function unitFixture(t) {
  const context = createDOM();
  t.after(() => context.dom.window.close());
  const card = context.document.getElementById('ordinary');
  const region = card.querySelector('.a-price').parentElement;
  region.dataset.cy = 'price-recipe';
  const read = (markup, { currency = '$', before = '', after = '' } = {}) => {
    region.innerHTML = `${before}<span class="a-price"><span class="a-offscreen">${currency}19.99</span><span aria-hidden="true">${currency}19.99</span></span>${markup}${after}`;
    return context.parser.parseCard(card);
  };
  return { ...context, card, region, read };
}

test('an explicit displayed unit price retains its amount, unit and offer conditions without coupon arithmetic', t => {
  const { read } = unitFixture(t);
  const item = read('<span class="a-size-base">($0.32 / count)</span>', {
    after: '<span>with Prime</span><div>Apply 10% coupon</div><div>Extra $2 off when you subscribe</div>'
  });
  assert.ok(item.unitPrice);
  assert.equal(item.unitPrice.amount, 0.32);
  assert.equal(item.unitPrice.currency, 'USD');
  assert.equal(item.unitPrice.unit, 'count');
  assert.equal(item.unitPrice.display, '$0.32 / count');
  assert.equal(item.unitPrice.context, item.price);
  assert.match(item.unitPrice.context, /with Prime.*10% coupon.*Extra \$2 off when you subscribe/);
  assert.equal(item.unitPriceReason, null);
});

test('a visible unit amount in Amazon a-text-price markup is read once without using duplicate accessibility digits', t => {
  const { read } = unitFixture(t);
  const item = read('<span>(<span class="a-price a-text-price" style="text-decoration:none"><span class="a-offscreen">$0.50</span><span aria-hidden="true">$0.50</span></span> / Count)</span>');
  assert.equal(item.unitPrice?.amount, 0.5);
  assert.equal(item.unitPrice?.unit, 'count');
  assert.equal(item.unitPrice.display.match(/\$0\.50/g).length, 1);
});

test('unit aliases normalize only the same measure and keep count, item, unit and fluid ounces distinct', t => {
  const { read } = unitFixture(t);
  for (const [displayed, canonical] of [
    ['count', 'count'], ['items', 'item'], ['units', 'unit'],
    ['feet', 'ft'], ['foot', 'ft'], ['ft', 'ft'], ['ounces', 'oz'], ['oz', 'oz'],
    ['fluid ounce', 'fl oz'], ['fluid oz', 'fl oz'], ['fl. oz.', 'fl oz'],
    ['pound', 'lb'], ['lbs', 'lb'], ['grams', 'g'], ['kilogram', 'kg'],
    ['millilitres', 'ml'], ['ml', 'ml'], ['liters', 'l'], ['litre', 'l'], ['l', 'l']
  ]) {
    const item = read(`<span>($1.25 per ${displayed})</span>`);
    assert.equal(item.unitPrice?.unit, canonical, `${displayed}: ${item.unitPriceReason}`);
    assert.equal(item.unitPrice.amount, 1.25);
  }
});

test('unit-price currencies remain distinct and ambiguous or prefixed dollar currencies are not guessed', t => {
  const { read } = unitFixture(t);
  for (const [symbol, currency] of [['$', 'USD'], ['€', 'EUR'], ['£', 'GBP']]) {
    const item = read(`<span>(${symbol}1,234.50 / count)</span>`, { currency: symbol });
    assert.equal(item.unitPrice?.currency, currency);
    assert.equal(item.unitPrice?.amount, 1234.5);
  }
  for (const markup of ['(CA$0.50 / count)', '(CAD $0.50 / count)', '(¥0.50 / count)', '(€0.50 / count)']) {
    const item = read(`<span>${markup}</span>`);
    assert.equal(item.unitPrice, null, markup);
    assert.ok(item.unitPriceReason);
  }
});

test('missing unit information stays unavailable even when titles contain quantities or price-like text', t => {
  const { read, card } = unitFixture(t);
  card.querySelector('a h2').textContent = 'Pack of 20 — claimed $0.50 / count';
  const item = read('');
  assert.equal(item.unitPrice, null);
  assert.match(item.unitPriceReason, /No supported displayed unit price/);
});

test('hidden, secondary and struck-through unit prices cannot produce a comparable value', t => {
  const { read } = unitFixture(t);
  for (const markup of [
    '<span hidden>($0.10 / count)</span>',
    '<span style="display:none">($0.10 / count)</span>',
    '<span aria-hidden="true">($0.10 / count)</span>',
    '<div data-cy="secondary-offer-recipe">($0.10 / count)</div>',
    '<s>($0.10 / count)</s>',
    '<span style="text-decoration:line-through">($0.10 / count)</span>',
    '<span>(<span class="a-price a-text-price" data-a-strike="true"><span class="a-offscreen">$0.10</span><span aria-hidden="true">$0.10</span></span> / count)</span>',
    '<s>$0.10</s> /count'
  ]) {
    const item = read(markup);
    assert.equal(item.unitPrice, null, markup);
    assert.ok(item.unitPriceReason);
  }
  const valid = read('<span>($0.50 / count)</span><s>($0.10 / count)</s><span hidden>($0.01 / count)</span>');
  assert.equal(valid.unitPrice?.amount, 0.5, 'An excluded old/hidden unit price must not compete with the current one');
});

test('multiple displayed unit prices remain ambiguous even when their units, currencies or amounts match', t => {
  const { read } = unitFixture(t);
  for (const markup of [
    '<span>($0.20 / count) ($0.30 / count)</span>',
    '<span>($0.20 / count) ($0.20 / count)</span>',
    '<span>($0.20 / count) ($0.10 / oz)</span>',
    '<span>($0.20 / count) (£0.10 / count)</span>'
  ]) {
    const item = read(markup);
    assert.equal(item.unitPrice, null);
    assert.match(item.unitPriceReason, /Multiple/);
  }
});

test('starting prices and ranges never contribute a misleading single unit-price endpoint', t => {
  const { read } = unitFixture(t);
  for (const before of ['From ', 'Starting at ', 'As low as ']) {
    const item = read('<span>($0.32 / count)</span>', { before });
    assert.equal(item.unitPrice, null, before);
    assert.match(item.unitPriceReason, /Starting or ranged/);
  }
  for (const markup of ['($0.20–$0.30 / count)', '($0.20 to 0.30 / count)', '($0.20 / count – 0.30 / count)', '(0.20 – $0.30 / count)']) {
    const item = read(`<span>${markup}</span>`);
    assert.equal(item.unitPrice, null, markup);
    assert.match(item.unitPriceReason, /Starting or ranged/);
  }
});

test('unsupported denominator quantities and measures never join a normalized unit group', t => {
  const { read } = unitFixture(t);
  for (const denominator of ['100g', '100 g', '2 count', 'gallon', 'count pack', 'constructor', 'toString']) {
    const item = read(`<span>($0.20 / ${denominator})</span>`);
    assert.equal(item.unitPrice, null, denominator);
    assert.ok(item.unitPriceReason);
  }
});

test('malformed, localized, zero or signed unit-price numbers remain unavailable', t => {
  const { read } = unitFixture(t);
  for (const amount of ['0', '0.00', '-0.20', '+0.20', '0,20', '1.234,56', '12,34.56', '1..20', '00.20', '.20', '0.12345']) {
    const item = read(`<span>($${amount} / count)</span>`);
    assert.equal(item.unitPrice, null, amount);
    assert.ok(item.unitPriceReason);
  }
  assert.equal(read('<span>($0.0125 / count)</span>').unitPrice?.amount, 0.0125);
});

test('signs before currency and per-unit savings cannot become the lowest purchase price', t => {
  const { read } = unitFixture(t);
  for (const expression of [
    '-$0.20 / count', '−$0.20 / count', '+ $0.20 / count',
    'Save $0.20 / count', 'Save up to $0.20 / count', 'Savings: $0.20 / count',
    'Coupon of $0.20 / count', '$0.20 / count off', '$0.20 / count savings'
  ]) {
    const item = read(`<span>(${expression})</span>`);
    assert.equal(item.unitPrice, null, expression);
    assert.ok(item.unitPriceReason);
  }
  const valid = read('<span>($0.50 / count)</span><span>Save 10% with coupon</span>');
  assert.equal(valid.unitPrice?.amount, 0.5, 'A later coupon does not change an actual displayed unit price');
  assert.match(valid.unitPrice.context, /Save 10% with coupon/);
});

test('compound denominators cannot be partially read as a supported single unit', t => {
  const { read } = unitFixture(t);
  for (const denominator of ['oz / count', 'count-pack', 'count - pack', 'oz/count', 'count per pack', 'count + pack', 'count * pack', 'count×pack', 'count · pack', 'count & pack']) {
    const item = read(`<span>($0.20 / ${denominator})</span>`);
    assert.equal(item.unitPrice, null, denominator);
    assert.match(item.unitPriceReason, /denominator/);
  }
});

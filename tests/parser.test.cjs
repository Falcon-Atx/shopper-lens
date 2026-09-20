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

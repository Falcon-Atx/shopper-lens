'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { summarize } = require('../extension/unit-summary.js');

function product(title, amount, options = {}) {
  return {
    kind: 'product',
    hiddenByLens: options.hiddenByLens || false,
    data: {
      title,
      url: options.url || `https://www.amazon.com/dp/${encodeURIComponent(title)}?ref=original`,
      sponsored: options.sponsored || false,
      ownedBrand: options.ownedBrand || null,
      unitPrice: amount == null ? null : {
        amount,
        currency: options.currency || 'USD',
        unit: options.unit || 'count',
        display: options.display || `$${amount} / ${options.unit || 'count'}`,
        context: options.context || 'Displayed listing price; check offer conditions',
      },
      unitPriceReason: amount == null ? 'Unit price not displayed' : null,
    },
  };
}

function category(summary, id) {
  return summary.find(item => item.id === id);
}

test('categories use evidence, retain sponsored-owned overlap, and ignore placement blocks', () => {
  const summary = summarize([
    product('Ordinary', 0.8),
    product('Amazon Basics title-only uncertainty', 0.4),
    product('No displayed unit price', null),
    product('Sponsored', 0.3, { sponsored: true }),
    product('Verified', 0.2, { ownedBrand: 'Amazon Essentials', hiddenByLens: true }),
    product('Both', 0.1, { sponsored: true, ownedBrand: 'Amazon Basics' }),
    { ...product('Placement banner', 0.01, { sponsored: true }), kind: 'block' },
  ]);
  assert.deepEqual(summary.map(item => item.id), ['organic', 'sponsored', 'owned']);
  const organic = category(summary, 'organic');
  assert.equal(organic.label, 'Organic / unverified');
  assert.deepEqual([organic.total, organic.priced, organic.missing], [3, 2, 1]);
  assert.equal(organic.groups[0].winners[0].title, 'Amazon Basics title-only uncertainty');
  for (const id of ['sponsored', 'owned']) {
    const item = category(summary, id);
    assert.deepEqual([item.total, item.priced, item.missing], [2, 2, 0]);
    assert.equal(item.groups[0].winners[0].title, 'Both');
  }
});

test('numeric minima remain separated by currency and unit with deterministic group ordering', () => {
  const records = [
    product('USD per item', 0.01, { unit: 'item' }),
    product('USD higher count', 0.5),
    product('GBP per count', 0.02, { currency: 'GBP', display: '£0.02 / count' }),
    product('USD lower count', 0.4),
    product('EUR per count', 0.03, { currency: 'EUR', display: '€0.03 / count' }),
  ];
  const original = JSON.stringify(records);
  records.forEach(record => { Object.freeze(record.data.unitPrice); Object.freeze(record.data); Object.freeze(record); });
  Object.freeze(records);
  const groups = category(summarize(records), 'organic').groups;
  assert.deepEqual(groups.map(group => `${group.currency}/${group.unit}`), ['EUR/count', 'GBP/count', 'USD/count', 'USD/item']);
  const count = groups.find(group => group.currency === 'USD' && group.unit === 'count');
  assert.equal(count.amount, 0.4);
  assert.equal(count.eligibleCount, 2);
  assert.equal(count.winners[0].title, 'USD lower count');
  assert.equal(groups.find(group => group.unit === 'item').amount, 0.01, 'Count and item are not converted or collapsed');
  assert.equal(JSON.stringify(records), original, 'Summaries must not reorder or mutate input product data');
});

test('all exact numeric ties retain original links, displayed conditions and hidden state', () => {
  const first = product('First tie', 0.1, { display: '$0.10 / count', context: '$9.99 — subscription required', hiddenByLens: true });
  const second = product('Second tie', 0.1, { display: '$0.10 / count', context: '$10.00 — with Prime' });
  const group = category(summarize([first, product('Higher', 0.11), second]), 'organic').groups[0];
  assert.equal(group.amount, 0.1);
  assert.equal(group.display, '$0.10 / count');
  assert.equal(group.eligibleCount, 3);
  assert.deepEqual(group.winners.map(winner => winner.title), ['First tie', 'Second tie']);
  assert.deepEqual(group.winners.map(winner => winner.url), [first.data.url, second.data.url]);
  assert.deepEqual(group.winners.map(winner => winner.context), [first.data.unitPrice.context, second.data.unitPrice.context]);
  assert.deepEqual(group.winners.map(winner => winner.hiddenByLens), [true, false]);
});

test('missing, invalid, nonfinite and nonpositive amounts cannot become a cheapest result', () => {
  const records = [null, undefined, 0, -1, NaN, Infinity, -Infinity, '0.01', true].map((amount, index) => {
    const record = product(`Invalid ${index}`, 1);
    record.data.unitPrice.amount = amount;
    return record;
  });
  records.push(product('Missing', null), product('Valid', 0.7));
  const result = category(summarize(records), 'organic');
  assert.equal(result.total, 11);
  assert.equal(result.priced, 1);
  assert.equal(result.missing, 10);
  assert.equal(result.groups.length, 1);
  assert.equal(result.groups[0].amount, 0.7);
  assert.equal(result.groups[0].winners[0].title, 'Valid');
});

test('hidden products are included by default and can be excluded explicitly', () => {
  const records = [product('Hidden low', 0.1, { hiddenByLens: true }), product('Visible high', 0.8)];
  const all = category(summarize(records), 'organic');
  assert.equal(all.total, 2);
  assert.equal(all.groups[0].winners[0].title, 'Hidden low');
  const visible = category(summarize(records, { includeHidden: false }), 'organic');
  assert.equal(visible.total, 1);
  assert.equal(visible.groups[0].winners[0].title, 'Visible high');
});

test('empty and entirely missing categories stay explicitly empty without a fabricated zero price', () => {
  const empty = summarize([]);
  assert.equal(empty.length, 3);
  for (const item of empty) {
    assert.deepEqual([item.total, item.priced, item.missing], [0, 0, 0]);
    assert.deepEqual(item.groups, []);
  }
  const missing = category(summarize([product('Unknown', null)]), 'organic');
  assert.deepEqual([missing.total, missing.priced, missing.missing], [1, 0, 1]);
  assert.deepEqual(missing.groups, []);
});

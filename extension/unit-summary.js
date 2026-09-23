(function (root, factory) {
  'use strict';
  const units = factory();
  root.ShopperLensUnits = units;
  if (typeof module === 'object' && module.exports) module.exports = units;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // These are listing-price minima, not recommendations or product-equivalence claims.
  function summarize(records, { includeHidden = true } = {}) {
    const categories = [
      { id: 'organic', label: 'Organic / unverified', matches: d => !d.sponsored && !d.ownedBrand },
      { id: 'sponsored', label: 'Sponsored placements', matches: d => !!d.sponsored },
      { id: 'owned', label: 'Verified Amazon brands', matches: d => !!d.ownedBrand }
    ];
    const products = records.filter(r => r.kind === 'product' && r.data && (includeHidden || !r.hiddenByLens));
    return categories.map(category => {
      const cards = products.filter(r => category.matches(r.data));
      const groups = new Map();
      let priced = 0;
      for (const record of cards) {
        const { data } = record;
        const price = data.unitPrice;
        if (!price || typeof price.amount !== 'number' || !Number.isFinite(price.amount) || price.amount <= 0 ||
          typeof price.currency !== 'string' || !price.currency.trim() || typeof price.unit !== 'string' || !price.unit.trim() ||
          typeof price.display !== 'string' || !price.display.trim()) continue;
        priced++;
        const key = JSON.stringify([price.currency, price.unit]);
        const winner = { title: data.title, url: data.url, context: price.context, hiddenByLens: !!record.hiddenByLens };
        let group = groups.get(key);
        if (!group) {
          group = { currency: price.currency, unit: price.unit, amount: price.amount, display: price.display, eligibleCount: 0, winners: [] };
          groups.set(key, group);
        }
        group.eligibleCount++;
        if (price.amount < group.amount) {
          group.amount = price.amount; group.display = price.display; group.winners = [winner];
        } else if (price.amount === group.amount) group.winners.push(winner);
      }
      return { id: category.id, label: category.label, total: cards.length, priced, missing: cards.length - priced,
        groups: [...groups.values()].sort((a, b) => a.currency.localeCompare(b.currency) || a.unit.localeCompare(b.unit)) };
    });
  }
  return Object.freeze({ summarize });
});

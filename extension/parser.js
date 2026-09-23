(function (root, factory) {
  'use strict';
  const parser = factory();
  root.ShopperLensParser = parser;
  if (typeof module === 'object' && module.exports) module.exports = parser;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Deliberately small, documented registry. A title or seller is not a brand field.
  const brandRegistry = Object.freeze([
    Object.freeze({ name: 'Amazon Basics', aliases: Object.freeze(['Amazon Basics', 'AmazonBasics']) }),
    Object.freeze({ name: 'Amazon Essentials', aliases: Object.freeze(['Amazon Essentials']) })
  ]);

  function normalize(value) {
    return String(value == null ? '' : value).normalize('NFKC').replace(/\s+/g, ' ').trim();
  }

  function elementOf(node) { return node && (node.nodeType === 1 ? node : node.parentElement); }

  // Off-viewport elements still count: this checks rendering, not intersection.
  // Accessibility-only strings are read separately, only through visible controls.
  function isDisplayed(node) {
    const element = elementOf(node);
    if (!element || !element.isConnected) return false;
    const view = element.ownerDocument.defaultView;
    for (let current = element; current; current = current.parentElement) {
      if (current.matches('[data-shopper-lens], [hidden], [aria-hidden="true"], .a-offscreen, .a-popover-preload, .aok-hidden, script, style, template, noscript')) return false;
      if (view) {
        const style = view.getComputedStyle(current);
        if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.contentVisibility === 'hidden' || style.opacity === '0') return false;
      }
    }
    const rects = Array.from(element.getClientRects());
    if (rects.some(rect => rect.width > 0 && rect.height > 0)) return true;
    // display:contents and inline wrappers can have no box of their own.
    return Array.from(element.children).some(child => Array.from(child.getClientRects()).some(rect => rect.width > 0 && rect.height > 0));
  }

  function displayedText(element) {
    if (!element || !isDisplayed(element)) return '';
    const texts = [];
    const walker = element.ownerDocument.createTreeWalker(element, 4);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (isDisplayed(node)) texts.push(node.textContent);
    }
    return normalize(texts.join(' '));
  }

  function isTitleContent(element) {
    return !!element.closest('h2') || !!(element.closest('[data-cy="title-recipe"] a')?.querySelector('h2'));
  }

  function sponsoredEvidence(block) {
    if (!block || !isDisplayed(block)) return null;
    const walker = block.ownerDocument.createTreeWalker(block, 4);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (/^Sponsored$/i.test(normalize(node.textContent)) && isDisplayed(node) && !isTitleContent(node.parentElement)) {
        return 'Visible “Sponsored” label.';
      }
    }
    const labels = [...(block.matches('[aria-label]') ? [block] : []), ...block.querySelectorAll('[aria-label]')];
    for (const control of labels) {
      if (!isDisplayed(control) || isTitleContent(control)) continue;
      if (!control.matches('a, button, [role="button"], [role="link"]')) continue;
      const label = normalize(control.getAttribute('aria-label'));
      if (/^(?:Sponsored(?: (?:ad|advertisement|product|listing|placement))?|Learn more about (?:this )?sponsored (?:ad|advertisement|product|listing|placement)|View sponsored (?:information|details))\.?$/i.test(label)) {
        return `Accessible “${label}” label on a visible control.`;
      }
    }
    return null;
  }

  function findTitle(card) {
    const selectors = [
      '[data-cy="title-recipe"] a h2', '[data-cy="title-recipe"] h2 a',
      'h2 a', 'a h2'
    ];
    for (const selector of selectors) {
      for (const element of card.querySelectorAll(selector)) {
        const title = displayedText(element);
        if (title) return { title, anchor: element.matches('a') ? element : element.closest('a') };
      }
    }
    return { title: null, anchor: null };
  }

  function safeURL(anchor) {
    if (!anchor || !normalize(anchor.getAttribute('href'))) return null;
    try {
      const url = new URL(anchor.getAttribute('href'), anchor.ownerDocument.baseURI);
      return /^https?:$/.test(url.protocol) ? url.href : null;
    } catch (_) { return null; }
  }

  function findBrand(card, title) {
    const candidates = card.querySelectorAll(
      '[data-cy="brand-name"], [data-cy="brand"], [data-cy="byline-recipe"], ' +
      '[data-component-type="s-brand-name"], .s-brand-name, #bylineInfo, ' +
      '.a-row > h2.a-size-mini.s-line-clamp-1'
    );
    let brandText = null;
    for (const candidate of candidates) {
      if (candidate.closest('a') && candidate.matches('h2')) continue;
      const text = displayedText(candidate);
      if (!text) continue;
      if (!brandText) brandText = text;
      const brand = text.replace(/^Brand:\s*/i, '').replace(/^Visit the (.+) Store$/i, '$1');
      const entry = brandRegistry.find(item => item.aliases.some(alias => alias.toLowerCase() === brand.toLowerCase()));
      if (entry) {
        return { brandText: text, ownedBrand: entry.name, ownershipStatus: 'verified', ownershipEvidence: `Visible brand field: “${text}”.` };
      }
    }
    const mention = brandRegistry.find(item => item.aliases.some(alias => {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(title || '');
    }));
    return {
      brandText, ownedBrand: null, ownershipStatus: mention ? 'uncertain' : 'unrecognized',
      ownershipEvidence: mention
        ? `Title mentions “${mention.name}”; a recognized visible brand field does not confirm that brand.`
        : (brandText ? `Visible brand field: “${brandText}”; this brand is not in the small verified registry.` : 'No recognized visible brand field is available.')
    };
  }

  function priceAmount(element) {
    // Amazon renders the price twice: an accessibility string and visual digits.
    // Read its accessibility equivalent once, after checking the price is visible.
    const accessible = element.querySelector('.a-offscreen');
    if (accessible) {
      const text = normalize(accessible.textContent);
      if (/\d/.test(text) && /[$€£¥₹]|\b(?:USD|EUR|GBP|CAD|AUD)\b/.test(text)) return text;
    }
    const symbol = normalize(element.querySelector('.a-price-symbol')?.textContent);
    const whole = normalize(element.querySelector('.a-price-whole')?.textContent).replace(/[.,]$/, '');
    const fraction = normalize(element.querySelector('.a-price-fraction')?.textContent);
    const decimal = normalize(element.querySelector('.a-price-decimal')?.textContent) || '.';
    if (symbol && /^\d[\d,.]*$/.test(whole) && (!fraction || /^\d{2}$/.test(fraction))) {
      return `${symbol}${whole}${fraction ? decimal + fraction : ''}`;
    }
    return null;
  }

  function rangeSeparator(first, second) {
    try {
      const range = first.ownerDocument.createRange();
      range.setStartAfter(first);
      range.setEndBefore(second);
      const separator = normalize(range.cloneContents().textContent);
      return /^(?:-|–|—|to)$/i.test(separator) ? separator : null;
    } catch (_) { return null; }
  }

  function priceContextText(node, includeListPrices = false) {
    if (node.nodeType === 3) return isDisplayed(node) ? node.textContent : '';
    if (node.nodeType !== 1 || !isDisplayed(node)) return '';
    if (node.matches('.a-price')) {
      const amount = priceAmount(node);
      // Amazon also uses a-text-price for ordinary unit prices. That class
      // alone does not establish a struck-through/list price.
      const struck = node.matches('[data-a-strike="true"]') || node.closest('s, del, strike') ||
        node.ownerDocument.defaultView?.getComputedStyle(node).textDecorationLine.includes('line-through');
      if (struck) {
        return includeListPrices && amount ? `(struck-through: ${amount})` : '';
      }
      return amount || '';
    }
    if (!includeListPrices && node.matches('.a-text-price, s, del, strike')) return '';
    return Array.from(node.childNodes).map(child => priceContextText(child, includeListPrices)).join(' ');
  }

  function findPrice(card) {
    const knownRegion = card.querySelector('[data-cy="price-recipe"]');
    const region = knownRegion || card;
    const candidates = Array.from(region.querySelectorAll('.a-price')).filter(element => {
      if (!isDisplayed(element) || element.matches('.a-text-price, .a-size-base')) return false;
      if (element.closest('.a-text-price, [data-a-strike="true"], s, del, strike, [data-cy="secondary-offer-recipe"]')) return false;
      const style = element.ownerDocument.defaultView?.getComputedStyle(element);
      return !style?.textDecorationLine.includes('line-through');
    });
    const prices = candidates.map(element => ({ element, amount: priceAmount(element) })).filter(item => item.amount);
    if (!prices.length) return null;
    let amount;
    if (prices.length === 1) amount = prices[0].amount;
    else if (prices.length === 2) {
      const separator = rangeSeparator(prices[0].element, prices[1].element);
      if (!separator) return null; // Competing offers must not silently become one offer.
      amount = `${prices[0].amount} ${separator} ${prices[1].amount}`;
    } else return null;

    // Keep the actual offer context, including "from", Prime eligibility,
    // coupons and subscription conditions. A price is not an unconditional
    // checkout total. The known recipe excludes unrelated title/review text.
    // Price elements are replaced with their accessible equivalent exactly once.
    if (knownRegion) {
      const text = normalize(priceContextText(knownRegion, true));
      // An unusually large or unrecognizable region is safer left unreadable
      // than truncated in a way that could drop an important condition.
      if (!text || text.length > 600 || !prices.every(price => text.includes(price.amount))) return null;
      return text;
    }

    // Unit text is useful context, but never substitute it for the main amount.
    const first = prices[0].element;
    const context = first.closest('a') || first.parentElement;
    const nearby = first.closest('.a-row') || context?.parentElement || context;
    if (nearby && !nearby.querySelector('h2')) {
      const text = normalize(priceContextText(nearby, true));
      if (/\b(?:from|starting at|with Prime|coupon|subscrib(?:e|tion)|variants?|options?)\b/i.test(text)) {
        return text.length <= 600 && prices.every(price => text.includes(price.amount)) ? text : null;
      }
    }
    const unitParts = [];
    if (context) {
      for (const node of context.querySelectorAll('.a-size-base, .a-price-unit')) {
        if (node.closest('.a-text-price, s, del, strike') || node.contains(first)) continue;
        const text = normalize(priceContextText(node));
        if (text && /\d/.test(text) && /(?:\/\s*[A-Za-z]|\bper\s+[A-Za-z]|\b(?:count|ounce|oz|pound|lb|unit|ml|liter|litre|gram|kg)\b)/i.test(text)) unitParts.push(text);
      }
    }
    const unit = [...new Set(unitParts)].filter(text => !unitParts.some(other => other !== text && other.includes(text))).join(' ');
    return unit ? `${amount} (${unit.replace(/^\(|\)$/g, '')})` : amount;
  }

  const unitAliases = Object.freeze({
    count: 'count', counts: 'count', item: 'item', items: 'item', unit: 'unit', units: 'unit',
    foot: 'ft', feet: 'ft', ft: 'ft', ounce: 'oz', ounces: 'oz', oz: 'oz',
    'fluid ounce': 'fl oz', 'fluid ounces': 'fl oz', 'fluid oz': 'fl oz', 'fl oz': 'fl oz',
    pound: 'lb', pounds: 'lb', lb: 'lb', lbs: 'lb', gram: 'g', grams: 'g', g: 'g',
    kilogram: 'kg', kilograms: 'kg', kg: 'kg',
    milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', millilitres: 'ml', ml: 'ml',
    liter: 'l', liters: 'l', litre: 'l', litres: 'l', l: 'l'
  });

  function unitPriceText(node) {
    if (node.nodeType === 3) return isDisplayed(node) ? node.textContent : ' \uFFFC ';
    if (node.nodeType !== 1 || !isDisplayed(node)) return ' \uFFFC ';
    const style = node.ownerDocument.defaultView?.getComputedStyle(node);
    if (node.matches('s, del, strike, [data-a-strike="true"], [data-cy="secondary-offer-recipe"]') ||
        /line-through/.test(`${style?.textDecorationLine || ''} ${style?.textDecoration || ''}`)) {
      // A separator prevents text either side of an excluded price from being
      // accidentally joined into a new amount/denominator pair.
      return ' \uFFFC ';
    }
    // a-text-price is also used for valid unit amounts on live Amazon cards.
    if (node.matches('.a-price')) return priceAmount(node) || ' \uFFFC ';
    return Array.from(node.childNodes).map(unitPriceText).join(' ');
  }

  function findUnitPrice(card, price) {
    const unavailable = reason => ({ unitPrice: null, unitPriceReason: reason });
    if (!price) return unavailable('Listing price is not reliably readable.');
    let region = card.querySelector('[data-cy="price-recipe"]');
    if (!region) {
      const main = Array.from(card.querySelectorAll('.a-price')).find(node =>
        isDisplayed(node) && !node.matches('.a-text-price, .a-size-base') &&
        !node.closest('s, del, strike, [data-a-strike="true"], [data-cy="secondary-offer-recipe"]'));
      region = main && (main.closest('a') || main.parentElement);
    }
    if (!region) return unavailable('No supported displayed unit price.');
    const text = normalize(unitPriceText(region));
    if (/\b(?:from|starting\s+(?:at|from)|as\s+low\s+as)\b/i.test(text) ||
        /[$€£¥₹]\s*[\d.,]+\s*(?:[-–—]|\bto\b)\s*[$€£¥₹]?\s*[\d.,]+/i.test(text)) {
      return unavailable('Starting or ranged prices are not comparable.');
    }

    // Match the page's explicit price-per-unit expression, never a quantity
    // inferred from a title or an arithmetic division of the total price.
    const expression = /([$€£¥₹])\s*([+\-]?[\d.,]+)\s*(?:\/|\bper\b)\s*((?:\d+(?:\.\d+)?\s*)?(?:fluid\s+(?:ounces?|oz\.?)|fl\.?\s*oz\.?|[a-z]+\.?))/gi;
    const matches = Array.from(text.matchAll(expression));
    if (!matches.length) return unavailable('No supported displayed unit price.');
    if (matches.length !== 1) return unavailable('Multiple displayed unit prices; no single value.');
    const match = matches[0];
    const prefix = text.slice(0, match.index);
    const rawAmount = match[2];
    const rawUnit = normalize(match[3]).toLowerCase().replace(/\./g, '');
    const unit = Object.hasOwn(unitAliases, rawUnit) ? unitAliases[rawUnit] : null;
    // Keep denominator quantities such as /100g out of /g groups. V1 of this
    // feature accepts one explicitly named unit and performs no conversions.
    if (!unit) return unavailable('The displayed unit or denominator is not supported.');
    const remainder = text.slice(match.index + match[0].length);
    if (/^\s*(?:[-–—]|\bto\b)\s*[$€£¥₹]?\s*[\d.,]+/i.test(remainder) ||
        /[\d.,]+\s*(?:[-–—]|\bto\b)\s*$/.test(prefix)) {
      return unavailable('Starting or ranged prices are not comparable.');
    }
    // A discount per unit is not the purchase price per unit. Keep signs that
    // precede the currency symbol and nearby savings wording out of minima.
    if (/[+\-−–—]\s*$/.test(prefix) ||
        /\b(?:save|savings|discount|rebate|coupon)\b[^$€£¥₹.!?;]{0,60}$/i.test(prefix) ||
        /^\s*[)\]]?\s*(?:off|savings?|discount|rebate|coupon)\b/i.test(remainder)) {
      return unavailable('Signed or savings amounts are not purchase unit prices.');
    }
    if (/^[^\s)\],;:]/.test(remainder) || /^\s*(?:[/\\+\-−–—*×·&^%]|\bper\b)/i.test(remainder) ||
        (/^\s+[a-z]/i.test(remainder) && !/^\s+(?:with|extra|apply|save|coupon|when|prime|list|typical|at|for|after|before)\b/i.test(remainder))) {
      return unavailable('The displayed unit or denominator is not supported.');
    }
    // Deliberately support English decimal-point notation only. Do not treat
    // decimal commas, malformed grouping, signs, or zero as a comparable price.
    if (!/^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)(?:\.\d{1,4})?$/.test(rawAmount)) {
      return unavailable('Unit-price number format is not supported.');
    }
    const amount = Number(rawAmount.replace(/,/g, ''));
    if (!Number.isFinite(amount) || amount <= 0 || amount > Number.MAX_SAFE_INTEGER / 10000) {
      return unavailable('A positive, reliable unit-price amount is required.');
    }
    const currencies = { $: 'USD', '€': 'EUR', '£': 'GBP' };
    const currency = currencies[match[1]];
    const activeSymbols = new Set(text.match(/[$€£¥₹]/g) || []);
    if (!currency || activeSymbols.size !== 1 || /[a-z]$/i.test(prefix) ||
        /\b(?:USD|EUR|GBP|CAD|AUD|NZD|HKD|SGD|JPY|INR)\s+$/i.test(prefix) ||
        /\b(?:CAD|AUD|NZD|HKD|SGD|JPY|INR)\b|\b(?:CA|AU|NZ|HK|SG|US|C|A)\s*\$/i.test(text)) {
      return unavailable('Unit-price currency is unsupported or ambiguous.');
    }
    const display = normalize(match[0]);
    // The comparison keeps the same validated visible offer context. If the
    // price reader could not retain this expression, do not discard conditions.
    if (!price.includes(display)) return unavailable('Unit-price context is not reliably readable.');
    return { unitPrice: { amount, currency, unit, display, context: price }, unitPriceReason: null };
  }

  function findRating(card) {
    for (const control of card.querySelectorAll('[aria-label]')) {
      if (!isDisplayed(control)) continue;
      const match = normalize(control.getAttribute('aria-label')).match(/\b([0-5](?:[.,]\d{1,2})?) out of 5 stars\b/i);
      if (match && Number(match[1].replace(',', '.')) <= 5) return match[0];
    }
    for (const alternative of card.querySelectorAll('.a-icon-alt')) {
      const icon = alternative.closest('.a-icon, i') || alternative.parentElement;
      if (!isDisplayed(icon)) continue;
      const match = normalize(alternative.textContent).match(/^([0-5](?:[.,]\d{1,2})?) out of 5 stars$/i);
      if (match && Number(match[1].replace(',', '.')) <= 5) return match[0];
    }
    return null;
  }

  function findRatingCount(card) {
    for (const control of card.querySelectorAll('[aria-label]')) {
      if (!isDisplayed(control)) continue;
      const match = normalize(control.getAttribute('aria-label')).match(/\b[\d][\d,.]*\s*(?:[KMB])? (?:global )?(?:ratings|reviews)\b/i);
      if (match) return match[0];
    }
    for (const link of card.querySelectorAll('a[href*="customerReviews"], a[href*="product-reviews"]')) {
      const text = displayedText(link);
      if (/^\(?[\d][\d,.]*\s*[KMB]?\)?(?:\s+(?:ratings|reviews))?$/i.test(text)) return text;
    }
    return null;
  }

  function parseCard(card) {
    const title = findTitle(card);
    const sponsorEvidence = sponsoredEvidence(card);
    const price = findPrice(card);
    const details = [...new Set(Array.from(card.querySelectorAll('.title-differentiators, [data-cy="title-differentiators"], [data-cy="title-differentiator"]'))
      .map(displayedText).filter(Boolean))].join(' · ') || null;
    return {
      title: title.title,
      url: safeURL(title.anchor),
      ...findBrand(card, title.title),
      sponsored: !!sponsorEvidence,
      sponsorEvidence,
      price,
      ...findUnitPrice(card, price),
      rating: findRating(card),
      ratingCount: findRatingCount(card),
      details
    };
  }

  return Object.freeze({ parseCard, isDisplayed, sponsoredEvidence, normalize, brandRegistry });
});

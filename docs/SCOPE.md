# Shopper Lens release scope — version 0.1.3

Shopper Lens helps shoppers notice observable sponsored placements and known Amazon brands, control their prominence, and compare a few products using information displayed on the current search page. The shopper can change or reverse every filter. The extension does not recommend a winner or explain Amazon's ranking motives.

## Supported surface

- English desktop search results on HTTPS `www.amazon.com` URLs whose path is `/s` or a supported search-path variant.
- Standard product cards with recognizable titles and product links. Sponsored banners, video placements, and carousels are separate placement blocks when their displayed disclosure can be associated reliably with the block.
- Results already loaded into the page. A result below the fold can still be displayed in the page; "visible" does not mean only the current screenful. The extension does not fetch additional pages or products.
- At most four currently displayed standard product cards in the comparison. Hidden cards are not comparison candidates. Sponsored blocks are not treated as individual comparable products.

Other Amazon regions, languages, mobile layouts, product detail pages, checkout, and account pages are outside the first release. Unsupported layouts may remain unchanged. Detection coverage is not a guarantee that every advertisement or Amazon-owned brand has been identified.

## Labels and uncertainty

| Meaning | Required evidence | What it does not mean |
| --- | --- | --- |
| Organic / unverified | A supported standard product card has neither a detected Sponsored disclosure nor a verified Amazon-brand match. Title-only and unknown ownership are included when sponsorship is not detected. | The item is proven unsponsored, organically ranked, or independent of Amazon. This is a filter grouping based on missing evidence. |
| Sponsored placement detected | A displayed Sponsored disclosure reliably associated with that card or placement block. | The item is poor quality, or sponsorship explains every aspect of its position. |
| Sponsored label not detected | No supported displayed disclosure was found on this item. | The item is verified organic or has no commercial relationship with Amazon. |
| Amazon-owned brand match | A separate displayed brand field exactly matches Amazon Basics, AmazonBasics, or Amazon Essentials after case/whitespace normalization; brand relationship has the references in [SOURCES.md](SOURCES.md). | The item is manufactured, sold, or shipped by Amazon; authenticity or quality is verified. |
| Brand mention / ownership unverified | A known name appears only in a product title, brand data is missing, or the displayed brand is outside the small registry. | The item is Amazon-owned or independent. Such uncertainty must not activate the owned-brand filter. |
| Not shown / unavailable | A comparison field cannot be read reliably from the card. | A zero price, zero rating, zero ratings, or a failing product. |

Labels must expose the reason for a match in plain language. The title alone is not sufficient: a third-party accessory can mention compatibility with Amazon Basics. Neither an Amazon's Choice badge, Prime, "sold by Amazon," nor "exclusive to Amazon" is an ownership match.

## Shopper controls

The panel has three controls, each offering Show, Dim, and Hide, in this order:

| Control | Default | Included results |
| --- | --- | --- |
| Organic / unverified | Show | Standard cards with neither detected sponsorship nor verified Amazon ownership. Includes title-only and unknown ownership when no sponsorship is detected; excludes placement blocks. |
| Sponsored placements | Dim | Recognized sponsored cards and placement blocks. |
| Verified Amazon brands | Hide | Cards matched through a supported separate brand field to the two-brand registry. |

Changing one control does not silently change another. A card can match both sponsorship and verified ownership; Hide takes precedence over Dim in that case. Organic / unverified does not overlap either positive-evidence group, and its name does not establish independence or an unsponsored placement.

Dim and Hide change only the page view. Original listings and links remain intact, and filters never reorder the original products. **Restore all** sets all three controls to Show. **Pause on this page** restores affected placements and removes card interventions while leaving a way to resume. Controls and comparison selections are held only for the current page lifetime: reloading clears selections and restores the Show / Dim / Hide defaults. No history or preferences are saved, and this update adds no permissions or storage.

## Comparisons

Compare up to four currently displayed standard cards side by side using only reliably readable fields:

- Product title and original product link.
- Displayed current price, including currency and any visible qualifying information that the parser supports. Missing prices remain unavailable. A listing price is not a complete checkout total and may depend on variant, membership, shipping, tax, or coupon conditions.
- Displayed average customer rating and displayed rating count. A rounded count stays rounded. A rating count must not be presented as a count of written reviews unless the page specifically establishes that meaning.
- Sponsorship and brand evidence, including uncertainty.

Unit-price summaries show the numeric minimum among explicit, readable page-displayed prices in each category, separately for each currency and unit. They include supported loaded cards hidden by Shopper Lens and retain original links, offer conditions, equal-price ties, and coverage counts. No unit conversion, inferred pack quantity, inferred specifications, quality score, fake-review assessment, price-history claim, or composite "best value" ranking is in scope. Missing, ambiguous, range/from, crossed-out, and unsupported prices cannot win; only-one-candidate cases are identified. Per-count prices are not evidence that the underlying products are equivalent. Titles may contain specifications supplied by the listing; copying the title does not independently verify them. Prices and ratings alone do not establish that two items have equivalent sizes, quantities, variants, specifications, or quality.

## Privacy and permissions

The extension is a Manifest V3 package containing local scripts and styles. Content-script site access is limited to supported Amazon.com search pages. There are no extension API permissions, backend, analytics, remote product calls, persistent storage, history collection, or affiliate link injection. No credentials, personal account details, or verification codes belong in source, fixtures, documentation, or the handoff.

The Amazon page itself still has its ordinary network behavior. Following an original listing or reference link opens that destination normally; the extension's local-processing promise does not change the destination website's behavior.

## Observable definition of done

For 0.1.3, explicit unit-price extraction and per-category minima must be covered by tests and actual installed Chrome checks. Unit summaries must remain available under filters, distinguish units/currencies, preserve offer conditions and ties, and state missing data. Previous-version observations alone do not verify this update.

1. The source package loads unpacked in Chrome without manifest or extension errors and runs on supported live search pages.
2. Real page inspection covers representative electronics/accessory, household, and clothing searches. The record identifies which layouts were actually observed and distinguishes successful Chrome verification from in-app-browser inspection.
3. Sponsored card and placement-block detection uses displayed disclosures. Source-backed brand matches require a separate brand field. Missing evidence remains uncertain.
4. All three controls appear in the documented order with Show / Dim / Hide defaults. Show, Dim, Hide, overlapping sponsorship/ownership, and Restore work on recognized placements. Organic / unverified affects only eligible standard cards. Restore sets all three to Show; reload restores the defaults. Filtering and restoring preserve original product order, listing content, and links.
5. Comparison enforces its four-card limit, handles missing fields honestly, and excludes hidden or removed results. Dynamic page changes do not leave duplicate controls or stale selections.
6. Meaningful fixtures cover supported card/block layouts, misleading brand mentions, unavailable fields, numeric/price ambiguity, and reversible behavior. Relevant failures found in fixtures or live Chrome checks are fixed and rerun.
7. A beginner README explains installation without a build step, daily use, labels, privacy, limitations, troubleshooting, and future updates. Verification results record failures and limits honestly.
8. Files and Git history are reviewed for secrets, personal data, private notes, generated artifacts, and unrelated assets before a Public repository is created and source is pushed to the user's personal GitHub account. The final repository URL is verified.
9. `HANDOFF.md` reflects each meaningful milestone and names the exact next unfinished action until all criteria are met.

These criteria define completion; their presence here does not assert they have already passed. The recorded version 0.1.1 live checks are historical and do not establish version 0.1.3 verification. Consult the [verification record](VERIFICATION.md) and `HANDOFF.md` for checks of the current version.

## Expected limitations

Amazon changes markup and experiments with layouts. Results vary with query, locale, delivery area, login state, and time. Some ad disclosures belong to an entire carousel or banner rather than one product, and some placements may be outside supported DOM structures. Brand names are often embedded only in titles; those cards remain unverified even when a human considers the brand likely. The registry covers two brands, not every Amazon business or brand.

This release prioritizes understandable evidence over exhaustive detection. Broad regional support, larger ownership registries, persistent preferences, external data, monetization, and Chrome Web Store submission require later work.

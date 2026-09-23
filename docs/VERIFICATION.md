# Verification record

Versions 0.1.0–0.1.3. Checks began September 19, 2026. This record distinguishes observed behavior from untested coverage.

## Version 0.1.3 update

Lowest displayed unit-price summaries cover all three categories. The user explicitly chose to keep price summaries available even when Shopper Lens hides products. Minima are scoped to supported loaded standard cards and grouped by currency/unit, with original links, conditions, ties, missing-data counts, and no inferred quantities or conversions. No permissions or data transmission are added.

- `npm test` passed all 54 tests on September 22: 29 parser, 19 integration, and six aggregation tests. `npm run check` passed for all shipped scripts.
- Tests cover separate currency/unit groups, exact ties and links, retained offer conditions, hidden-category minima, missing values, reactive edits, and Pause/Resume. Independent review found and fixed false minima from signed/savings amounts and partially accepted compound denominators; regression tests cover both.
- Targeted pre-publication review covered 25 current files, ten commits, and 60 historical blobs plus commit metadata, with no credentials or private-data findings. This is not a guarantee for arbitrary future changes.

The user reloaded the unpacked extension, and its new content-script summary was verified on live English desktop Amazon.com searches on September 22. The amounts below are historical observations, not current product-price claims.

| Check | Observed result |
| --- | --- |
| Batteries | 60 standard cards, 48 Organic / unverified cards, 18 sponsored placements, no verified brands. Unit-price coverage was 45/48 Organic / unverified cards and 10/12 sponsored standard cards. Six sponsored blocks did not enter the price comparison. Source-card prices supported the displayed minima of $0.21/count and $0.22/count respectively. The sponsored winner retained its extra subscription-discount condition without applying it. |
| Hide every category | All 66 recognized battery cards/blocks were hidden. The same minima, eligibility counts, source links, and offer context remained in the summary with hidden-result notices. |
| Pause / Resume / Restore | Pause removed labels and filters and cleared the price summary. Resume rebuilt the same summary and 66 hidden placements. Restore removed filters; ordered original product identifiers, source URLs, and winner URLs matched the pre-filter snapshot. |
| Cables | 22 standard cards, with 12/16 Organic / unverified and 4/6 sponsored cards supplying unit prices. USD per count and USD per foot stayed separate. Organic minima were $2.00/count and $0.30/feet; sponsored minima were $4.50/count and $0.33/feet. Raw displayed prices agreed. The only sponsored per-foot candidate was explicitly marked as the only available one. Coupon, multi-buy, and struck-through reference amounts remained in context without changing the unit-price minima. |
| Clothing ties | 60 standard cards; 14/47 Organic / unverified and 1/12 sponsored cards supplied unit prices. All three Organic / unverified listings tied at $4.00/count were retained; expanding the tie exposed all three original links and their separate offer conditions. Sponsored showed $20.00/count with the only-candidate qualifier. |
| Missing brand unit price | One separately evidenced Amazon Essentials card was hidden by default. It displayed a $15.10 total and no unit price. The brand category correctly reported 0/1 readable unit prices both while hidden and after Show. Its title said Pack of 6; no unit price was inferred from that title. |
| Comparison | A two-card clothing comparison preserved the $15.10 total with an unavailable unit-price explanation, alongside another card's $20.99 total and explicit $4.20/count. |
| Visual and console inspection | Battery and cable summary panels rendered with readable groups, full conditions, source links, keyboard navigation, and scrolling. Sampled console errors came from Amazon scripts; none in that sample came from Shopper Lens. Some browser-control responses timed out, but direct DOM checks confirmed the actions succeeded. |

An actual priced verified-brand winner did not occur in these sampled live pages; hidden-brand minima are covered by synthetic integration tests. The extension-manager error list remains inaccessible to automation. These checks do not establish other locales, languages, currencies, mobile layouts, or future Amazon layouts. The public-distribution guide is in [PUBLISHING.md](PUBLISHING.md); no Chrome Web Store submission has occurred. Earlier results below remain historical.

Version 0.1.3 implementation and documentation were pushed as `795aaaa485a3c5ab7fcfe7afec4f89de295b36f9`; the remote `main` hash matched and GitHub reported PUBLIC visibility. Final handoff/documentation updates follow on the same branch. The downloadable source ZIP contains only tracked project files, with no authentication files or local page captures.

## Version 0.1.2 update

The requested Organic / unverified control appears before Sponsored placements and Verified Amazon brands. It includes only standard cards with neither supported sponsorship evidence nor a verified brand match. It does not certify organic ranking or independence. Defaults are Show / Dim / Hide respectively; Restore all sets all three to Show, and reloading returns to the defaults. No original products are reordered, and permissions and local-only processing are unchanged.

- `npm run check` passed; all 33 automated tests passed.
- Tests cover category order and defaults, uncertain title-only mentions, exclusion of positive sponsorship/ownership matches, organic-filter selection pruning, overlapping sponsored/owned filters, dynamic category transitions, restoration, Pause/Resume, and fresh-page defaults.
- The user confirmed installed Chrome version 0.1.2. Live cable and clothing checks passed as detailed below. Earlier 0.1.1 observations remain historical.

Installed 0.1.2 was checked on an English desktop Amazon.com `usb c cable` search:

| Check | Observed result |
| --- | --- |
| Control order and defaults | Live DOM showed Organic / unverified, Sponsored placements, and Verified Amazon brands in that order, set to Show / Dim / Hide. The rendered panel showed the first control and its uncertainty explanation. |
| Detection and initial filtering | 22 supported standard cards; 16 Organic / unverified cards; 12 sponsored placements comprising six cards and six blocks; zero verified brand matches. The default view dimmed 12 placements and hid none. |
| Two-product comparison | Selecting one sponsored card and one Organic / unverified card preserved displayed titles, prices, unit prices, a genuinely struck-through reference amount, multi-buy conditions, ratings, rating counts, and unverified title details. |
| Organic / unverified Dim | All 16 eligible cards dimmed, alongside the 12 already-dimmed sponsored placements: 28 dimmed placements total. |
| Organic / unverified Hide | The 16 eligible cards had computed `display:none`; the 12 sponsored placements remained dimmed. The hidden organic selection left comparison while the sponsored selection remained. |
| Pause | Removed all 28 annotations and all filter classes, and disabled all three filter controls. |
| Resume | Restored 28 annotations, 16 hidden cards, and 12 dimmed placements while retaining the chosen Hide / Dim / Hide settings. |
| Restore all | Set all three controls to Show and removed all filter classes. The ordered array of original ASINs and product URLs matched its pre-filter value exactly. |

Installed 0.1.2 was also checked on an English desktop Amazon.com `mens t shirts` search:

| Check | Observed result |
| --- | --- |
| Default filtering | 60 supported cards, 47 Organic / unverified cards, 18 sponsored placements, and one separately evidenced Amazon Essentials brand match. Defaults dimmed 18 placements and hid only that verified match with computed `display:none`. |
| Brand Show | Changing Verified Amazon brands to Show revealed the Amazon Essentials card. |
| Category separation | Organic / unverified Hide then hid 47 cards; the verified brand stayed shown and the 18 sponsored placements stayed dimmed. |
| Restore all | All three controls became Show, all filter classes were removed, and the ordered original identifiers and URLs matched the pre-filter array exactly. |
| Reload | After Restore all, reloading reset the controls to Show / Dim / Hide, with 18 dimmed placements and one hidden verified brand match. |

Automation occasionally timed out waiting for click or reload responses; subsequent DOM checks confirmed the actions had succeeded. These were tool-response timeouts, not observed extension failures. The sampled page-console errors all came from Amazon scripts; none mentioned Shopper Lens. The extension-manager error list is inaccessible to browser automation. No new extension failure was observed in these checks.

The 0.1.2 implementation, 33-test suite, installed Chrome checks, uncertainty wording, documentation, and pre-publication review are complete. Scope remains English desktop Amazon.com with two supported brands; these sampled layouts do not establish universal detection. Source and this record are published on the repository’s `main` branch.


## Automated checks

- `npm run check`: all shipped JavaScript passes Node syntax checks.
- `npm test`: 29/29 parser and integration tests pass for 0.1.1, including nested-grid annotation placement/redraw and unit-price-versus-list-price regressions.
- Tests cover sponsored evidence, title-only false positives, exact brand matching, hidden evidence, missing/list/unit/range/ambiguous prices, price conditions, unsafe URL schemes, selection limits, restoration, pause/resume, and dynamic results.
- Review found and fixed two dynamic bugs: detached annotations now recover without duplicates; recycled product elements no longer inherit a selection. Same-product price/tracking updates preserve selections.
- Tests simulate element geometry in jsdom. They do not prove Chrome installation or live layout coverage.

## Live Amazon inspection before installation

Read-only inspection in the in-app browser succeeded for English Amazon.com searches:

| Query | Observed layout and evidence |
| --- | --- |
| `usb c cable` | List cards, separate title details, sponsored brand banners, feature carousels, and a video placement. Ratings expose accessible labels; rating count labels can be more precise than visually abbreviated counts. |
| `aa batteries` | Product grid with Sponsored labels and title-only Amazon Basics mentions. Some cards say “Click to see price”; these must stay unknown. Subscription conditions can appear in the price region. |
| `mens t shirts` | Clothing cards have a separate small brand heading before the product title. An Amazon Essentials result supplied this exact brand field. |

Page data varies by location, account, date, viewport, and Amazon experiments. These examples establish observed markup, not universal coverage. Direct web fetches failed with 503; browser inspection worked. No signed-in page captures or personal information are included in the repository.

## Browser UI demonstration

The synthetic demonstration was opened in desktop Chrome. The panel and card labels rendered; sponsored Hide removed the card and ad block; owned-brand Hide removed the verified match but retained a third-party compatibility title. Restore returned all six cards. Comparing a priced product with a missing-data product showed the original title/link and explicit “Not reliably displayed” fields.

The demonstration loads the scripts as ordinary page scripts. It is not a substitute for unpacked-extension verification.

## Unpacked extension on live Chrome pages

The user loaded 0.1.0 and supplied an enabled-extension screenshot. The installed content script ran on a live English Amazon.com battery search, identifying 60 supported product cards and 18 sponsored placements. Default Show and sponsored Dim worked; title-only Amazon Basics matches remained uncertain. A live comparison preserved a missing price as unknown, displayed source rating labels, and retained a subscription condition.

Two live failures were found and fixed in local 0.1.1:

- Labels inserted outside Amazon's full-height inner card pushed that card over the next row and intercepted checkbox clicks. Labels now enter the actual inner product card; simple layouts retain a fallback.
- Amazon uses `a-text-price` for both unit prices and reference prices. That class alone incorrectly marked a unit price as struck through. Strike descriptions now require the strike attribute, semantic strike element, or actual text-decoration evidence.

The user subsequently confirmed 0.1.1 in Chrome. The installed extension was rechecked on a live English Amazon.com AA-battery search, with these results:

| Check | Observed result |
| --- | --- |
| Detection and uncertainty | 60 supported product cards, 18 sponsored placements, and zero verified brand matches. Title-only Amazon Basics mentions remained uncertain. |
| Grid and checkbox interaction | An annotation was nested inside its product card. A formerly blocked checkbox accepted a click, and hit-testing reached its own label. The inner card stayed within its outer bounds; visual inspection showed no row overlap. |
| Four-product comparison | Missing price stayed unknown. Displayed examples retained `$9.99 ($0.50/count)` and `$15.29 ($0.32/count)` with their subscription conditions. A `$15.02` Energizer listing correctly identified its `$15.98` struck-through list amount. These are observations of that page, not current product-price claims. |
| Sponsored controls | Dim affected 18 placements. Hide affected 18 with computed `display:none`; two selected sponsored products left the comparison, leaving two products with uncertain ownership. |
| Restore | The ordered array of original product identifiers and URLs matched the pre-filter array exactly. |
| Pause and Resume | Pause removed all 66 annotations and all filter classes. Resume restored 66 annotations with no active filters. The automation connection timed out transiently during Resume; a subsequent DOM check confirmed it had succeeded. |

Installed 0.1.1 also passed these live checks:

| Query | Observed result |
| --- | --- |
| `mens t shirts` | 60 supported cards, 18 sponsored placements, and one verified Amazon Essentials match. The match used the separate displayed brand heading. Its checkbox was clickable and the grid had no observed overlap. Comparison with a PUMA card kept brand and product title separate, copied displayed price/unit price and ratings, and left absent details unknown. Brand Dim and Hide affected only the Amazon Essentials card; hiding pruned its selection. Restore matched the original ordered identifiers and links exactly. |
| `usb c cable` | 22 supported list cards, 12 sponsored placements, and zero verified brand matches. Labels and comparison controls rendered within the list cards. Two-product comparison retained visible unit prices and multi-buy conditions, ratings/counts, and separate title details marked unverified. Sponsored Hide removed six cards and six placement blocks, all with computed `display:none`, and pruned the selected sponsored card. Restore matched the original ordered identifiers and links exactly. |

The sampled page-console errors came from Amazon scripts; no Shopper Lens error was observed in that sample. The extension-manager error list was not directly inspected because browser automation blocks that internal page. The user confirmed the installed version, and actual content-script execution and interactions were verified above.

No additional permissions were introduced by 0.1.1. Live checks used the existing desktop Chrome profile and viewport. They do not establish universal regional, language, theme, mobile, iframe, carousel, or future-layout coverage. The floating panel can cover results; minimize it to select a covered card. Automated fixtures cover dynamic replacement and the four-card cap; those cases were not forced into the live Amazon page.

## Publication review

Reviewed the 22-file staging inventory (approximately 121 KB), source, synthetic fixtures, documentation and dependency lock. No credentials, private keys, personal filesystem paths, private account files, page captures, or unrelated large assets were found. All dependency download URLs point to the npm registry. Extension code contains no networking, storage or history API use. The manifest declares no API permissions or extra host permissions. This is a review plus targeted pattern scanning, not a guarantee that any future change is safe.

Git was initialized for this project with no pre-existing history. The initial commit `ae9ba35` contains only the reviewed files; all 22 historical blobs were scanned again without findings. Source and documentation were pushed to [Falcon-Atx/shopper-lens](https://github.com/Falcon-Atx/shopper-lens). GitHub reported `PUBLIC` visibility and `main` as the default branch. `git ls-remote` matched the local publication commit `29d01ba7d082119d0b788c16551eff58bbe7a36c`. Later verification-only documentation commits remain on that branch.

An independent follow-up review covered the 0.1.1 diff, all 22 tracked files, and all three existing commits (27 historical file versions), with no secrets, private-file, or material code-regression findings. No dependencies or permissions changed.

The 0.1.1 fixes (`41edc4e`) and subsequent handoff update (`e322f90`) were pushed to the same public repository. The remote `main` hash matched `e322f905b2aa0cfebcbbb18810a9a4b64bb60f9e`. Final verification documentation is maintained on that same branch.

The first-release implementation, unpacked installation, and representative battery, clothing, and cable checks are complete. Public source hosting and these checks do not establish coverage of every Amazon layout. No Chrome Web Store submission was performed.

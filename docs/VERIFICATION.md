# Verification record

Versions 0.1.0–0.1.2. Checks began September 19, 2026. This record distinguishes observed behavior from untested coverage.

## Version 0.1.2 update

The requested Organic / unverified control appears before Sponsored placements and Verified Amazon brands. It includes only standard cards with neither supported sponsorship evidence nor a verified brand match. It does not certify organic ranking or independence. Defaults are Show / Dim / Hide respectively; Restore all sets all three to Show, and reloading returns to the defaults. No original products are reordered, and permissions and local-only processing are unchanged.

- `npm run check` passed; all 33 automated tests passed.
- Tests cover category order and defaults, uncertain title-only mentions, exclusion of positive sponsorship/ownership matches, organic-filter selection pruning, overlapping sponsored/owned filters, dynamic category transitions, restoration, Pause/Resume, and fresh-page defaults.
- Installed Chrome 0.1.2 verification is pending the requested user reload. The earlier 0.1.1 live observations below remain historical. Publication of this update is pending the requested GitHub authentication confirmation.


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

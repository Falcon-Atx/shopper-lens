# Verification record

Versions 0.1.0–0.1.1. Checks began September 19, 2026. This record distinguishes observations from remaining work.

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

Reload and live re-verification of 0.1.1 remain pending. The automation tool blocks the extension-manager URL, so the user must click Reload there. No additional permissions are introduced.

## Publication review

Reviewed the 22-file staging inventory (approximately 121 KB), source, synthetic fixtures, documentation and dependency lock. No credentials, private keys, personal filesystem paths, private account files, page captures, or unrelated large assets were found. All dependency download URLs point to the npm registry. Extension code contains no networking, storage or history API use. The manifest declares no API permissions or extra host permissions. This is a review plus targeted pattern scanning, not a guarantee that any future change is safe.

Git was initialized for this project with no pre-existing history. The initial commit `ae9ba35` contains only the reviewed files; all 22 historical blobs were scanned again without findings. Source and documentation were pushed to [Falcon-Atx/shopper-lens](https://github.com/Falcon-Atx/shopper-lens). GitHub reported `PUBLIC` visibility and `main` as the default branch. `git ls-remote` matched the local publication commit `29d01ba7d082119d0b788c16551eff58bbe7a36c`. Later verification-only documentation commits remain on that branch.

An independent follow-up review covered the 0.1.1 diff, all 22 tracked files, and all three existing commits (27 historical file versions), with no secrets, private-file, or material code-regression findings. No dependencies or permissions changed.

The unpacked-extension checks above are still unfinished. Public source hosting is not a claim that Chrome installation or all live behaviors have been verified.

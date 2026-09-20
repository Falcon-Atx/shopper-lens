# Verification record

Version 0.1.0. Checks began September 19, 2026. This record distinguishes observations from remaining work.

## Automated checks

- `npm run check`: all shipped JavaScript passes Node syntax checks.
- `npm test`: 27/27 parser and integration tests pass.
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

Pending. The automation tool blocks opening `chrome://extensions`; the user has been given exact steps to load the reviewed `extension/` folder. After loading, verify representative live searches, filters, comparison values, labels, restoration, and any extension errors.

## Publication review

Reviewed the 22-file staging inventory (approximately 121 KB), source, synthetic fixtures, documentation and dependency lock. No credentials, private keys, personal filesystem paths, private account files, page captures, or unrelated large assets were found. All dependency download URLs point to the npm registry. Extension code contains no networking, storage or history API use. The manifest declares no API permissions or extra host permissions. This is a review plus targeted pattern scanning, not a guarantee that any future change is safe.

Git was initialized for this project with no pre-existing history. The initial commit `ae9ba35` contains only the reviewed files; all 22 historical blobs were scanned again without findings. The Public repository https://github.com/Falcon-Atx/shopper-lens has been created. Source push and remote-commit verification are next.

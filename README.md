# Shopper Lens

Shopper Lens is a small Chrome extension for English desktop Amazon.com searches. It highlights recognizable sponsored placements and verified Amazon-brand matches, offers optional Show / Dim / Hide controls, and compares information displayed on up to four product cards.

Everything runs locally in the browser. There is no account to create, browsing-history collection, analytics, backend, or affiliate link injection. This is an independent project, unaffiliated with Amazon.

Version **0.1.1** is an early release. See [HANDOFF.md](HANDOFF.md) for completed checks and remaining work. A public GitHub repository makes the source available; this extension has **not** been submitted to the Chrome Web Store.

Source repository: [Falcon-Atx/shopper-lens](https://github.com/Falcon-Atx/shopper-lens).

## Install in Chrome — no coding or build required

1. On this repository's GitHub page, click **Code → Download ZIP**. Unzip the downloaded file. [GitHub's download guide](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives) illustrates these controls.
2. Move the extracted project folder somewhere you will keep it, such as Documents. Chrome needs the installed folder to stay in place.
3. Open Chrome. Type `chrome://extensions` in its address bar and press Enter.
4. Turn on **Developer mode** at the top right, then click **Load unpacked**.
5. Inside the extracted project, select the **`extension` folder**, which contains `manifest.json`. Select the folder, not the ZIP or the project folder above it.
6. Open or refresh an [Amazon.com search](https://www.amazon.com/s?k=aa+batteries). Look for **Shopper Lens** at the bottom right.

You do not need Node.js, npm, Git, or a GitHub account to install the downloaded extension. Chrome documents the same [unpacked installation process](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world).

## Use it

Click **Shopper Lens** on the search page to open the controls. The Chrome toolbar popup is an informational guide; the controls are on the Amazon page.

- **Show** is the default for both categories. **Dim** reduces prominence; hovering or focusing a dimmed item brightens it. **Hide** removes recognized placements from your view. Sponsored blocks can contain several products, so hiding one hides the whole block.
- **Verified Amazon brands** affects only cards with supported separate brand evidence. Title-only brand mentions stay visible under this filter.
- Check **Compare** on two to four standard product cards, then click **Compare selected**. Minimize the panel with **×** if it covers a card you want to select. The table copies displayed prices and conditions, ratings, rating counts, title details, and label evidence. **Original listing** opens the original product link.
- **Restore all** shows everything filtered by Shopper Lens. **Pause on this page** also removes its card labels and comparison controls. Resume reapplies your chosen filters.
- Reloading the page resets filters and selections. Hidden, removed, or replaced products leave the comparison. Nothing is reordered.

## What the labels mean

| Label or field | Meaning |
| --- | --- |
| Sponsored / Sponsored block | A recognizable Sponsored disclosure appears in that card or placement. **Label evidence** explains the match. |
| Amazon-owned brand | A separate displayed brand field matches **Amazon Basics** (including **AmazonBasics**) or **Amazon Essentials**, whose private-brand relationship is documented in [SOURCES.md](docs/SOURCES.md). This does not authenticate the item or identify its seller. |
| Brand uncertain · title only | A title mentions a known name without confirming it in a supported separate brand field. This may describe a compatible accessory. |
| No disclosure / no verified brand match | Evidence is absent or unsupported. It does **not** establish that a result is unsponsored or independent of Amazon. |
| Not reliably displayed | The page does not supply a field the extension can read confidently. It is not treated as zero. |

Prices may depend on variants, pack sizes, subscriptions, coupons, shipping, or tax. Ratings are displayed customer-rating claims, not an independent quality measure. Specifications copied from titles are unverified. The extension does not calculate a best-value score or know why Amazon ranked a product.

## Limits and troubleshooting

The first release supports English desktop searches at `https://www.amazon.com/s?...` and `/s/...`. Other Amazon regions, languages, mobile layouts, product pages, and checkout are outside its scope. The brand registry covers only two brands. Some banners, carousels, iframes, offscreen carousel slides, and new layouts may be missed. Results vary by location, account state, and time. See [SCOPE.md](docs/SCOPE.md).

| Problem | Try this |
| --- | --- |
| No Shopper Lens button | Check the address and English desktop layout. In `chrome://extensions`, confirm Shopper Lens is enabled, then refresh the Amazon page. |
| Chrome cannot find `manifest.json` | Unzip the download and choose its `extension` subfolder. |
| Chrome reports an extension error | Confirm all files are present. Use the error details in `chrome://extensions`; reload after correcting or replacing the files. |
| No comparable cards or a missed label | The page may still be loading or use an unsupported layout. Refresh once. Missing detection is not evidence about ownership or sponsorship. |
| A filter causes an unwanted change | Choose **Restore all** or **Pause on this page**. You can also disable or remove the extension at `chrome://extensions`, then refresh the page. |
| Changes do not appear after an update | Reload Shopper Lens at `chrome://extensions`, then refresh the Amazon tab. Both steps are needed. |

## Make future updates

For a small edit, sign in to your own GitHub repository, open the file, and click the pencil icon. Make the change, review the preview or difference, choose **Commit changes**, and write a short description. A commit is a saved version in the repository's history. Follow [GitHub's editing guide](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files) if a branch or pull request is required.

Your installed copy does not update automatically. Download and unzip the latest ZIP, copy its updated `extension` contents into the folder you originally installed, then reload the extension and refresh Amazon. If you move the installed folder, remove the old extension entry and use **Load unpacked** with the new folder.

For code changes, run the checks below and inspect the behavior in Chrome before sharing the update. Public commits expose their contents and history; review changed files and keep credentials and private data out.

If you later use Git, run the clone command once; subsequent updates happen inside that cloned folder:

```sh
git clone https://github.com/Falcon-Atx/shopper-lens.git
cd shopper-lens
git pull --ff-only
```

After editing and testing, review and publish only the intended files:

```sh
git diff
git add PATH-TO-CHANGED-FILE
git commit -m "Describe the change"
git push
```

A ZIP download has no Git history; use a clone for these commands. GitHub authentication happens through your Git client, not through files in this project.

## Development and verification

Install the LTS version of [Node.js](https://nodejs.org/en/download), which includes npm. Open a terminal in the project folder containing `package.json`, then run:

```sh
npm ci
npm test
npm run check
npm run demo
```

The demo opens at `http://127.0.0.1:8765` and uses clearly marked fictional results. Press **Ctrl+C** in the terminal to stop it. The installed extension has no localhost access; the demo page loads the same scripts directly for development.

Tests cover parser evidence, missing/ambiguous fields, reversible controls, comparison limits, and dynamic updates. They simulate layout and do not prove live Chrome behavior. See [test notes](tests/README.md) and [HANDOFF.md](HANDOFF.md) for verification status.

The installable files are in `extension/`; automated tests and fixtures are in `tests/`; the demo server is in `scripts/`. [Privacy details](docs/PRIVACY.md), [sources](docs/SOURCES.md), and [release criteria](docs/SCOPE.md) explain the intended boundaries. No license has been selected for this repository yet.

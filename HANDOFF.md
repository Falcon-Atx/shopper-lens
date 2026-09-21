# Objective and definition of done

Build Shopper Lens, a local Manifest V3 extension for English desktop Amazon.com search. Done means: observable sponsored labels and source-backed Amazon brand matches; optional reversible dim/hide; honest comparison of displayed fields; meaningful fixture tests; unpacked Chrome verification on representative live pages; beginner README; reviewed source and history pushed to a Public personal GitHub repository.

# Current state
- Read the user-supplied constitution first. The separate prompt repeats the user's request.
- Research milestone: current Chrome extension and GitHub documentation reviewed; ownership registry will cover Amazon Basics/AmazonBasics and Amazon Essentials only.
- Inspected live USB-C cable search in the in-app browser. It includes list cards, sponsored carousels, brand banners, and video blocks.
- Implemented Manifest V3 package in `extension/`: conservative parser, reversible per-category filters, evidence labels, four-product comparison, and pause/resume. No build is needed to install.
- `docs/SOURCES.md` and `docs/SCOPE.md` record primary sources and observable release criteria.
- Synthetic fixtures, Node/jsdom tests, and a localhost demonstration are in `tests/` and `scripts/`.
- Beginner README, privacy, sources, scope, and verification record are present. Initial source committed as `ae9ba35`; the 22-file inventory and all initial history blobs were reviewed with no secrets/private-file findings.
- Public source repository: https://github.com/Falcon-Atx/shopper-lens. Source pushed to `main`; remote hash matched local `29d01ba`, and GitHub reported `PUBLIC`. Subsequent documentation updates are committed on the same branch.
- User loaded version 0.1.0 unpacked in Chrome. Actual content-script injection succeeded on live battery search: 60 supported product cards, 18 sponsored placements, title-only Amazon Basics matches kept uncertain.
- Live testing found grid overlap blocking next-row Compare controls and a unit-price mislabel. Local 0.1.1 fixes insert labels inside the inner product card and require actual strike evidence before labelling a reference price. These fixes are committed as `41edc4e`. They still need Chrome to load the updated files and a live recheck.

# Decisions and assumptions
- Product name: Shopper Lens. Initial scope: HTTPS www.amazon.com English desktop /s searches; no API permissions, backend, analytics, saved browsing data, or injected affiliate links.
- Controls default to Show and reset on page reload. Compare at most four currently displayed standard cards. No quality/value ranking.
- Brand ownership is a curated fact; matching an individual card requires an explicit separate brand field. Title-only matches remain uncertain and are never hidden by ownership control.
- Video is problem context based on supplied timestamped notes. Direct retrieval failed; ranking motive allegations will not become product claims.

# Verification
- Live page inspection succeeded in the in-app browser for USB-C cables, AA batteries, and men's T-shirts. Batteries showed title-only Amazon Basics mentions; clothing showed a separate Amazon Essentials brand field. Programmatic web fetches returned 503.
- Syntax checks and 29 fixture/integration tests pass for 0.1.1, including regressions for the two live failures. Tests simulate geometry and cannot establish actual browser layout on their own.
- Parser now handles the observed title-detail class and preserves visible qualifying price context. Review fixed detached labels and recycled-card selections. Synthetic browser UI checks passed; see `docs/VERIFICATION.md`.
- Independent review of the 0.1.1 changes, all 22 tracked files, and all three existing commits found no secrets/private files or material code regressions. `git diff --check` passed. Pre-publication file/history review and targeted scans found no secrets/private files. Dependency downloads use npm; installable code has no network/storage/history API calls. Public hosting is verified. Unpacked Chrome verification remains required.

# Blockers
- Chrome browser automation is connected; extension is installed. The user reports the manager still shows 0.1.0; the project manifest is verified as 0.1.1. It may be an older installed folder or a reload that has not applied. Its URL policy blocks the extension manager, so the user must reload or load this project’s `extension/` folder manually.
- GitHub CLI authentication is complete; the reviewed 0.1.1 fixes can be pushed when network permission is available. Task-local authentication stays outside this repository and will be cleared after final publication. No credentials or verification codes are stored in this project.

# Exact next action
- Resolve the loaded-folder mismatch: have the user reload Shopper Lens or load this project’s `extension/` folder and confirm 0.1.1. Then refresh battery search and verify corrected checkbox hit targets and unit-price text. Complete clothing/cable filter/comparison checks and push the final reviewed changes.

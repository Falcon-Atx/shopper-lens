# Objective and definition of done

Build Shopper Lens, a local Manifest V3 extension for English desktop Amazon.com search. Done means: observable sponsored labels and source-backed Amazon brand matches; optional reversible dim/hide; honest comparison of displayed fields; meaningful fixture tests; unpacked Chrome verification on representative live pages; beginner README; reviewed source and history pushed to a Public personal GitHub repository.

# Current state
- Read the user-supplied constitution first. The separate prompt repeats the user's request.
- Research milestone: current Chrome extension and GitHub documentation reviewed; ownership registry will cover Amazon Basics/AmazonBasics and Amazon Essentials only.
- Inspected live USB-C cable search in the in-app browser. It includes list cards, sponsored carousels, brand banners, and video blocks.
- Implemented Manifest V3 package in `extension/`: conservative parser, reversible per-category filters, evidence labels, four-product comparison, and pause/resume. No build is needed to install.
- `docs/SOURCES.md` and `docs/SCOPE.md` record primary sources and observable release criteria.
- Synthetic fixtures, Node/jsdom tests, and a localhost demonstration are in `tests/` and `scripts/`.
- Beginner README, privacy, sources, scope, and verification record are present. Git initialized on `main`; the 22-file initial source inventory was reviewed before the first commit. No public hosting yet.

# Decisions and assumptions
- Product name: Shopper Lens. Initial scope: HTTPS www.amazon.com English desktop /s searches; no API permissions, backend, analytics, saved browsing data, or injected affiliate links.
- Controls default to Show and reset on page reload. Compare at most four currently displayed standard cards. No quality/value ranking.
- Brand ownership is a curated fact; matching an individual card requires an explicit separate brand field. Title-only matches remain uncertain and are never hidden by ownership control.
- Video is problem context based on supplied timestamped notes. Direct retrieval failed; ranking motive allegations will not become product claims.

# Verification
- Live page inspection succeeded in the in-app browser for USB-C cables, AA batteries, and men's T-shirts. Batteries showed title-only Amazon Basics mentions; clothing showed a separate Amazon Essentials brand field. Programmatic web fetches returned 503.
- Syntax checks and 27 fixture/integration tests pass. Tests simulate geometry and cannot establish actual browser layout or unpacked installation.
- Parser now handles the observed title-detail class and preserves visible qualifying price context. Review fixed detached labels and recycled-card selections. Synthetic browser UI checks passed; see `docs/VERIFICATION.md`.
- Pre-publication file review and targeted scans found no secrets/private files. Dependency downloads use npm; installable code has no network/storage/history API calls. History will be rechecked after committing. Unpacked Chrome verification and public publication remain required.

# Blockers
- Chrome browser automation is connected. Its URL policy blocks extension-manager access. User has been asked to load the reviewed `extension/` folder manually; subsequent live-page verification can be automated.
- User signed into personal GitHub in Chrome. The official GitHub CLI browser authorization is awaiting the user's approval; an earlier request expired. No credentials or verification codes are stored in this project.

# Exact next action
- Verify the unpacked extension on live Amazon search pages after user confirms loading, while completing source/history review and GitHub publication setup.

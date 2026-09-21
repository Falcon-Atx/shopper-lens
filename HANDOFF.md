# Objective and definition of done

Build Shopper Lens, a local Manifest V3 extension for English desktop Amazon.com search. Done means evidence-based sponsored and Amazon-brand labels; optional reversible Dim/Hide; honest comparison; fixture and unpacked Chrome verification; beginner documentation; reviewed source and history in a Public personal GitHub repository.

# Current state
- Version 0.1.1 is implemented in `extension/`, with no build needed to install. The user confirmed this version loaded unpacked in Chrome.
- Live battery, clothing, and cable checks passed. Live failures in grid-control placement and unit-price descriptions were fixed in `41edc4e` and rechecked in Chrome.
- Public repository: https://github.com/Falcon-Atx/shopper-lens. GitHub reported `PUBLIC`; 0.1.1 source was pushed, and remote `main` matched `e322f90` at that milestone.
- README covers first-time installation, use, uncertainty, privacy, troubleshooting, and future updates. `docs/SCOPE.md`, `docs/SOURCES.md`, and `docs/VERIFICATION.md` hold release criteria, primary references, and the detailed verification record.
- Final verification documentation is prepared; its final push and remote-hash check are the remaining publication step.

# Decisions and assumptions
- Read the supplied constitution first. The video is problem context based on the supplied timestamped notes; direct retrieval failed. Ranking-motive allegations are not extension claims.
- English desktop HTTPS `www.amazon.com` search only. No API permissions, backend, analytics, saved browsing data, or affiliate injection. Chrome Web Store submission is outside scope.
- Both filters default to Show and reset on page reload. Compare at most four remaining standard cards. No ranking, quality score, or automatic recommendation.
- Registry covers Amazon Basics/AmazonBasics and Amazon Essentials. Ownership matching requires a separate visible brand field; title-only mentions remain uncertain and outside the brand filter.

# Verification
- `npm run check` and all 29 parser/integration tests passed for the final shipped code. Fixtures cover conservative evidence, price ambiguity, reversible controls, selection limits, and dynamic replacement/redraw; their geometry is simulated.
- Installed Chrome battery page: 60 cards, 18 sponsored placements, zero verified brand matches. Next-row checkbox hit target fixed; unit prices and subscription conditions correct; missing price stayed unknown. Sponsored Dim/Hide, comparison pruning, Restore, and Pause/Resume passed.
- Installed Chrome clothing page: 60 cards, 18 sponsored placements, one separately evidenced Amazon Essentials match. Brand Dim/Hide affected only that match; comparison preserved title/brand separation and displayed fields.
- Installed Chrome cable page: 22 cards and 12 sponsored placements. Comparison preserved displayed prices, conditions, ratings, and unverified title details. Sponsored Hide removed six cards and six blocks. Restore preserved ordered product identifiers and original links on all three pages.
- Visual inspection found no remaining overlap in the sampled grid/list layouts. Console sampling showed Amazon-origin errors, with no Shopper Lens error observed. The extension-manager error list was inaccessible to automation. These checks do not establish other region/language/mobile/theme or future-layout coverage.
- Tracked source, lockfile, fixtures, documentation, and Git history were reviewed for secrets/private files before publication, with no findings. No private page captures or account credentials are included. Final documentation receives the same review before its push.

# Blockers
- None in implementation or live verification. Final network publication is pending. Task-local CLI authentication is outside the repository and will be cleared after the final push.

# Exact next action
- Review and commit the final documentation, push it, verify remote `main` matches local HEAD, rebuild the clean source archive, and clear task-local authentication. Then mark the first release complete.

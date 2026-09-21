# Objective and definition of done

Maintain Shopper Lens, a local Manifest V3 extension for English desktop Amazon.com search. The completed first release provides evidence-based labels, reversible filters, comparison, tests, live Chrome verification, documentation, and public source. The current requested update adds an Organic / unverified category above sponsored and verified-brand controls, with Show / Dim / Hide defaults respectively. Done for this update means correct category boundaries, reversal and comparison pruning, tests, updated documentation, live reload verification, and published source.

# Current state
- Update in progress: 0.1.2 adds the requested first category and defaults in `extension/content.js`, with popup/manifest versions updated. Syntax checks and all 33 tests pass; category/defaults documentation is updated. User reload to 0.1.2 and GitHub password confirmation have been requested; live checks and publication remain. No new permissions or data storage.
- Version 0.1.1 is implemented in `extension/`, with no build needed to install. The user confirmed this version loaded unpacked in Chrome.
- Live battery, clothing, and cable checks passed. Live failures in grid-control placement and unit-price descriptions were fixed in `41edc4e` and rechecked in Chrome.
- Public repository: https://github.com/Falcon-Atx/shopper-lens. GitHub reported `PUBLIC`; 0.1.1 source was pushed, and remote `main` matched `e322f90` at that milestone.
- README covers first-time installation, use, uncertainty, privacy, troubleshooting, and future updates. `docs/SCOPE.md`, `docs/SOURCES.md`, and `docs/VERIFICATION.md` hold release criteria, primary references, and the detailed verification record.
- First-release completion criteria are met. Final verification documentation was pushed in `cf9709a`; remote `main` matched local HEAD, and GitHub again reported `PUBLIC`. This completion handoff follows on the same branch.

# Decisions and assumptions
- Read the supplied constitution first. The video is problem context based on the supplied timestamped notes; direct retrieval failed. Ranking-motive allegations are not extension claims.
- English desktop HTTPS `www.amazon.com` search only. No API permissions, backend, analytics, saved browsing data, or affiliate injection. Chrome Web Store submission is outside scope.
- User requested new defaults: Organic / unverified Show, sponsored Dim, and verified Amazon brands Hide. The first category includes standard cards with neither supported sponsorship nor verified ownership, including uncertain title-only brand mentions. It is not proof of organic placement or independent ownership. Restore all sets all three controls to Show; reload returns to the requested defaults. Original product order is unchanged. Compare at most four remaining standard cards. No ranking, quality score, or automatic recommendation.
- Registry covers Amazon Basics/AmazonBasics and Amazon Essentials. Ownership matching requires a separate visible brand field; title-only mentions remain uncertain and outside the brand filter.

# Verification
- For 0.1.2, syntax checks and all 33 tests pass. Independent source/diff review found no material bugs, misleading certainty, or added permissions/storage/network use. Earlier 0.1.1 passed all 29 parser/integration tests. Fixtures cover conservative evidence, price ambiguity, reversible controls, selection limits, and dynamic replacement/redraw; their geometry is simulated.
- Installed Chrome battery page: 60 cards, 18 sponsored placements, zero verified brand matches. Next-row checkbox hit target fixed; unit prices and subscription conditions correct; missing price stayed unknown. Sponsored Dim/Hide, comparison pruning, Restore, and Pause/Resume passed.
- Installed Chrome clothing page: 60 cards, 18 sponsored placements, one separately evidenced Amazon Essentials match. Brand Dim/Hide affected only that match; comparison preserved title/brand separation and displayed fields.
- Installed Chrome cable page: 22 cards and 12 sponsored placements. Comparison preserved displayed prices, conditions, ratings, and unverified title details. Sponsored Hide removed six cards and six blocks. Restore preserved ordered product identifiers and original links on all three pages.
- Visual inspection found no remaining overlap in the sampled grid/list layouts. Console sampling showed Amazon-origin errors, with no Shopper Lens error observed. The extension-manager error list was inaccessible to automation. These checks do not establish other region/language/mobile/theme or future-layout coverage.
- Tracked source, lockfile, fixtures, documentation, and Git history were reviewed for secrets/private files before publication, with no findings. No private page captures or account credentials are included. The final documentation review and targeted scan of all 22 tracked files and 41 historical blobs found no secrets/private-file matches.

# Blockers
- User reload to 0.1.2 is requested; the browser tool blocks the extension-manager URL. GitHub’s existing-access renewal is at password confirmation; the user must enter credentials personally as requested. Both steps are pending. No implementation blocker; temporary credentials remain outside this repository.

# Exact next action
- After the requested reload, refresh Amazon and verify the three controls, Show/Dim/Hide defaults, organic filter, restoration, and comparison pruning. After GitHub confirmation, review/push changes and finalize this record.

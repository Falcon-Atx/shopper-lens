# Objective and definition of done

Maintain Shopper Lens, a local Manifest V3 extension for English desktop Amazon.com search. The completed first release provides evidence-based labels, reversible filters, comparison, tests, live Chrome verification, documentation, and public source. The current requested update adds an Organic / unverified category above sponsored and verified-brand controls, with Show / Dim / Hide defaults respectively. Done for this update means correct category boundaries, reversal and comparison pruning, tests, updated documentation, live reload verification, and published source.

# Current state
- Version 0.1.2 is implemented and loaded unpacked in Chrome. The new first category and requested Show / Dim / Hide defaults are in `extension/content.js`; manifest, popup, package metadata, README, scope, and privacy text agree.
- Source update is committed as `a50a527`. Syntax checks and all 33 automated tests pass. Independent source review found no material issues or new permissions/storage/network use.
- Live 0.1.2 cable and clothing checks passed, including category separation, default hiding, comparison pruning, Pause/Resume, Restore, and reload defaults. `docs/VERIFICATION.md` records concrete observations and limits.
- The earlier 0.1.1 release was publicly published and verified on battery, clothing, and cable layouts; its observations remain historical.
- Public repository: https://github.com/Falcon-Atx/shopper-lens. Final 0.1.2 documentation and publication are being completed. GitHub CLI authentication succeeded after refreshing an expired device code.

# Decisions and assumptions
- Read the supplied constitution first. The video is problem context based on the supplied timestamped notes; direct retrieval failed. Ranking-motive allegations are not extension claims.
- English desktop HTTPS `www.amazon.com` search only. No API permissions, backend, analytics, saved browsing data, or affiliate injection. Chrome Web Store submission is outside scope.
- User requested new defaults: Organic / unverified Show, sponsored Dim, and verified Amazon brands Hide. The first category includes standard cards with neither supported sponsorship nor verified ownership, including uncertain title-only brand mentions. It is not proof of organic placement or independent ownership. Restore all sets all three controls to Show; reload returns to the requested defaults. Original product order is unchanged. Compare at most four remaining standard cards. No ranking, quality score, or automatic recommendation.
- Registry covers Amazon Basics/AmazonBasics and Amazon Essentials. Ownership matching requires a separate visible brand field; title-only mentions remain uncertain and outside the brand filter.

# Verification
- 0.1.2 cable search: 22 standard cards, 16 organic/unverified cards, 12 sponsored placements, zero verified brands. New Dim/Hide affected only matching cards and pruned the hidden selection. Pause/Resume retained all three choices; Restore preserved original ordered identifiers/URLs.
- 0.1.2 clothing search: 60 cards, 47 organic/unverified, 18 sponsored placements, one verified Amazon Essentials match. Defaults dimmed 18 and hid that match. Brand Show revealed it; Organic Hide affected 47 other cards. Restore preserved order/links; reload reapplied Show/Dim/Hide.
- Remaining battery/clothing/cable observations below refer to 0.1.1.
- For 0.1.2, syntax checks and all 33 tests pass. Independent source/diff review found no material bugs, misleading certainty, or added permissions/storage/network use. Earlier 0.1.1 passed all 29 parser/integration tests. Fixtures cover conservative evidence, price ambiguity, reversible controls, selection limits, and dynamic replacement/redraw; their geometry is simulated.
- Installed Chrome battery page: 60 cards, 18 sponsored placements, zero verified brand matches. Next-row checkbox hit target fixed; unit prices and subscription conditions correct; missing price stayed unknown. Sponsored Dim/Hide, comparison pruning, Restore, and Pause/Resume passed.
- Installed Chrome clothing page: 60 cards, 18 sponsored placements, one separately evidenced Amazon Essentials match. Brand Dim/Hide affected only that match; comparison preserved title/brand separation and displayed fields.
- Installed Chrome cable page: 22 cards and 12 sponsored placements. Comparison preserved displayed prices, conditions, ratings, and unverified title details. Sponsored Hide removed six cards and six blocks. Restore preserved ordered product identifiers and original links on all three pages.
- Visual inspection found no remaining overlap in the sampled grid/list layouts. Console sampling showed Amazon-origin errors, with no Shopper Lens error observed. The extension-manager error list was inaccessible to automation. These checks do not establish other region/language/mobile/theme or future-layout coverage.
- Tracked source, lockfile, fixtures, documentation, and Git history were reviewed for secrets/private files before publication, with no findings. No private page captures or account credentials are included. The final documentation review and targeted scan of all 22 tracked files and 56 historical blobs found no secrets/private-file matches.

# Blockers
- None in implementation or verification. GitHub authentication is complete; final publication is the remaining action. Temporary credentials stay outside the repository and are cleared after publication.

# Exact next action
- Review and commit the final 0.1.2 documentation, push the source and records, verify public remote HEAD, refresh the clean source archive, clear temporary credentials, and record release completion.

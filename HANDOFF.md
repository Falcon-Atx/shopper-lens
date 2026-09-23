# Objective and definition of done

Maintain Shopper Lens, a local Manifest V3 extension for English desktop Amazon.com search, with evidence-based labels, reversible filters, comparisons, honest uncertainty, meaningful tests, installed Chrome verification, beginner documentation, and public GitHub source.

The latest request places each category’s lowest displayed unit prices beside its Show / Dim / Hide selector. Done means separate currency/unit minima, continued visibility under filtering, correct missing/paused states, readable layout, verification, documentation, and public publication.

# Current state
- Version 0.1.4 implementation and verification are complete; publication is next. Compact prices sit beside selectors in `extension/content.js`; the detailed section retains original links, ties, offer conditions, and coverage counts. Select accessible names stay unchanged and prices are associated descriptions.
- All 54 tests and syntax checks pass. Installed Chrome clothing and cable checks passed after the user confirmed 0.1.4. No parser, aggregation, permissions, dependencies, storage, or network behavior changed in this update.
- Version 0.1.3 is already public at https://github.com/Falcon-Atx/shopper-lens, including implementation commit `795aaaa485a3c5ab7fcfe7afec4f89de295b36f9` and final documentation commit `f48868a`. Its tracked-source ZIP is alongside the project as `shopper-lens-v0.1.3.zip`.
- `docs/PUBLISHING.md` explains public GitHub installation and future Chrome Web Store preparation. No store submission, payment, agreement, or upload occurred. Store icons and promotional assets are still absent.

# Decisions and assumptions
- The supplied constitution governs the work. Video timestamp notes inform the problem; ranking-motive allegations are not product claims.
- English desktop HTTPS `www.amazon.com` search only. No backend, analytics, persistent browsing data, history collection, or affiliate injection.
- User requested defaults: Organic / unverified Show, Sponsored Dim, Verified Amazon brands Hide. Restore all sets every category to Show; reloading reapplies defaults. Original products and links are not reordered or modified.
- Organic / unverified means neither a supported sponsorship disclosure nor verified Amazon ownership was detected. It is not proof of organic ranking or independence.
- The registry contains Amazon Basics/AmazonBasics and Amazon Essentials. Separate displayed brand evidence is required; title-only mentions remain uncertain.
- Unit summaries include all loaded supported standard cards, including Lens-hidden cards. They use explicit displayed unit prices, separated by currency/unit, with no inferred pack quantities, conversions, or coupon arithmetic. Missing information stays unknown. Lowest displayed is not a quality recommendation. Compare at most four remaining visible cards.

# Verification
- 0.1.4: `npm test` passed 54/54 and `npm run check` passed September 23. Integration assertions cover inline currency/unit separation, hidden winners, changed prices, missing/no-card states, accessible labels, and Pause/Resume.
- Installed 0.1.4 clothing: compact prices matched detailed summaries, remained unchanged with all 66 recognized placements hidden, cleared to Paused, and returned on Resume. A brand card without a unit price remained unavailable.
- Installed 0.1.4 cables: per-count and per-foot minima appeared on separate lines next to each selector. Empty brand category stayed explicit. Screenshot/geometry checks showed no selector overlap or row overflow at the tested desktop viewport.
- Installed 0.1.3 battery/cable/clothing checks verified source minima, ties, offer conditions, hidden-result retention, comparison, and restoration of original order/URLs. Parser regressions reject signed savings and compound denominators. Priced hidden-brand winners were fixture-covered because sampled live brand cards lacked unit prices.
- `docs/VERIFICATION.md` records historical counts, prices, failures, fixes, and limitations. Other regions, languages, viewport sizes, mobile, and future layouts are unverified. Browser automation cannot inspect the extension-manager error list.
- Before 0.1.3 publication, targeted review covered 25 files, ten commits, and 60 historical blobs plus metadata with no credential/private-data findings. The 0.1.4 diff contains only public source, tests, docs, and version metadata; no new private files.

# Blockers
- None. Chrome reload and GitHub CLI access are working. Chrome Web Store submission is outside the current scope; user handles any future credentials, payments, and agreements personally.

# Exact next action
- Commit and push reviewed 0.1.4 changes, verify remote visibility/hash, create the tracked-source ZIP, record publication, and clear temporary CLI credentials. On a later session inspect actual state before proceeding with the next user-requested change.

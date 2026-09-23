# What these checks establish

Run `npm ci`, then `npm test` from the project folder. The tests use Node's built-in test runner and jsdom. They do not contact Amazon, fetch product information, or require an account.

The fixture in `fixtures/search.html` uses synthetic data and simplified shapes of observed desktop Amazon search markup: product headings inside links, separate clothing brand headings, visible sponsor labels, accessible rating and price labels, list prices, and result widgets. It includes deliberate uncertainty and missing information. It is not a saved customer page and its product data is fictional.

Parser checks cover evidence boundaries, false ownership signals, hidden sponsor labels, current/list/unit/ambiguous prices, rating counts, unsafe link schemes and missing fields. Unit-price cases exercise explicit displayed amounts, currency and unit aliases, offer conditions, hidden/old prices, missing or competing values, ranges, malformed numbers, signed savings amounts and unsupported denominators. The parser never computes a unit price from title quantities or applies coupon arithmetic.

Pure unit-summary checks cover category membership and overlaps, numeric minima within each currency/unit group, ties, invalid amounts, missing data and hidden products. Content checks cover the three filter categories and their defaults, restoration, comparison limits, selection pruning, dynamic results, pause and unsupported pages. Summary integration checks retain original links and offer conditions, include filter-hidden winners, update after price changes, and clear stale data while paused.

jsdom has no layout engine. The test helper supplies nonzero element rectangles, while retaining real CSS and hidden-attribute checks. Passing these tests does **not** prove that Chrome loads the extension, that controls look correct, or that a current Amazon layout is supported. Those require the manual browser checks documented in the project's verification record.

Run `npm run demo` and open <http://127.0.0.1:8765> for the synthetic browser demonstration. The server binds only to the local computer and serves an explicit list of fixture/extension assets. Press Ctrl+C in its terminal to stop it. The demo runs the content scripts as page scripts; it is not proof of unpacked extension loading.

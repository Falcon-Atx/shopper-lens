# Sources and evidence boundaries

Reviewed on September 19, 2026. External pages can change. These sources support the limited statements below; they do not establish the quality of any product or the reason Amazon ranked it in a particular position.

## Problem statement

[Arun Maini, *The Shady Truth about Amazon Basics*](https://www.youtube.com/watch?v=l2p3fZyV254) motivated this project. The project brief supplied timestamped notes describing prominent Amazon-branded products, sponsored placements, and the creator's comparisons. Direct video retrieval during development failed; the development team used the supplied notes and does not claim independent transcript verification.

The notes identify product examples at 0:00–1:20 and 3:39–5:40, a discussion that Amazon Basics products are not inherently bad at 5:40–6:41, and the creator's theories about fees, incentives, and prominence at 7:37–9:02 and 11:15–13:30. Treat those theories as the creator's interpretation. Examples are time- and location-dependent. Shopper Lens does not implement claims about private ranking algorithms, unfairness, manufacturing, or the objectively best purchase.

## Brand registry

| Recognized brand | Evidence | What the evidence supports |
| --- | --- | --- |
| Amazon Basics; historical spelling AmazonBasics | [Amazon UK press release, March 18, 2025](https://press.aboutamazon.com/uk/2025/3/get-ready-to-shop-with-amazon-spring-deal-days); [AmazonBasics launch, September 19, 2009](https://press.aboutamazon.com/2009/9/amazon-com-introduces-amazonbasics) | Amazon explicitly identifies Amazon Basics among its private brands. The launch announcement identifies AmazonBasics as a private-label collection. |
| Amazon Essentials | [Amazon UK press release, March 18, 2025](https://press.aboutamazon.com/uk/2025/3/get-ready-to-shop-with-amazon-spring-deal-days) | Amazon explicitly identifies Amazon Essentials among its private brands. |

This is a deliberately incomplete registry. A source-backed brand relationship and a match on a particular search card are different pieces of evidence. The extension must find a separate, displayed brand field matching a registry name before applying the owned-brand filter. A mention anywhere in a title does not satisfy that rule.

The label describes the brand relationship, not who manufactured or currently sells the particular item. It does not authenticate merchandise. Prime, Amazon's Choice, shipping or selling by Amazon, and exclusivity do not establish brand ownership. Missing or unfamiliar brand evidence remains unverified; it does not establish independence from Amazon.

## Browser implementation

| Official reference | How it informs this release |
| --- | --- |
| [Chrome manifest reference](https://developer.chrome.com/docs/extensions/reference/manifest) | Manifest V3 extension structure. |
| [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts) | Static content scripts can read and change the matching page's DOM. The default isolated execution world avoids sharing JavaScript variables with page scripts. |
| [Manifest content script fields](https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts) | Narrow URL matching, local script and style files, top-frame scope, and document-idle loading. |
| [Chrome permission guidance](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions) | Site access is declared through content-script matches. This release needs no additional API permissions or broad host permissions. Site access still permits reading and changing supported search pages. |
| [Chrome unpacked-extension tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world) | Developer mode and Load unpacked installation. After content-script changes, reload the extension and refresh the Amazon page. |

The release uses local page processing and no backend, external product API, saved preferences, analytics, or affiliate link injection. The extension does not need Chrome's history, tabs, storage, scripting, or network interception permissions. See [the release scope](SCOPE.md) for observable completion criteria and limitations.

## Public source hosting

| Official reference | Applicable action |
| --- | --- |
| [Create a personal GitHub account](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github) | Account owner completes signup, credentials, email verification, and required terms. A verified email is necessary for repository creation. |
| [Create a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository) | Publish under the personal account with Public visibility. When uploading an existing local repository, avoid initializing conflicting remote starter files. |
| [GitHub secret scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning) | A supplementary safeguard. It does not replace reviewing files and Git history before publication. |

Publishing source on GitHub does not submit or publish an extension in the Chrome Web Store. Store submission is outside this release.

## Live evidence

The first successful observation was an English desktop USB-C cable search on Amazon.com in the in-app browser. It showed standard product cards, sponsored carousels, brand banners, and video blocks. This establishes that multiple placement layouts need separate handling; it is not evidence that the finished extension works in Chrome.

Representative live-page observations and the final unpacked Chrome checks must be recorded separately in the verification record. Fixtures are synthetic, reproducible cases; they are not a substitute for that live verification. Avoid publishing raw signed-in page captures, addresses, account information, or browsing records.

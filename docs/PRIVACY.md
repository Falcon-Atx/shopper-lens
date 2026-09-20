# Shopper Lens privacy and site access

Applies to version 0.1.0. Shopper Lens processes supported search-page information locally in the browser. It has no backend, analytics, account system, external product API, advertising service, or affiliate link injection.

## Information used

On supported pages, the content script reads the page structure needed to identify product cards and placement blocks, including displayed titles, product links, brand fields, sponsorship disclosures, prices and conditions, ratings, rating counts, and title details. It also reads visibility information and observes page changes so labels and comparison data can update.

Selected products and filter choices exist only in memory for that page. They are not written to browser storage or synchronized between devices. Reloading or closing the page clears them. The extension does not collect browsing history, save search terms, read account credentials, or record purchases.

## Permissions and page scope

[manifest.json](../extension/manifest.json) declares static content scripts for these URL patterns:

```text
https://www.amazon.com/s?*
https://www.amazon.com/s/*
```

That site access allows the extension to read and change matching search pages. Chrome may describe this as reading and changing site data. It is necessary for the labels, filters, and comparison controls.

The manifest requests no additional extension API permissions: no history, tabs, storage, cookies, scripting, web request, or broad host permissions. Scripts run in the top frame in Chrome's default isolated execution world. The installed extension does not request access to other websites, Amazon account or checkout paths, local files, or localhost. English desktop Amazon.com is the supported layout; URL access by itself does not guarantee that every layout or language is understood.

## Network behavior and links

Shopper Lens does not send page data to a server or load remote code, images, fonts, or product data. Its normal operation uses packaged files and the current page's DOM.

Amazon continues to make its own requests and apply its own policies. Clicking an original listing or an ownership-source link visits that website normally. The extension does not add affiliate identifiers or modify existing product links; existing URL parameters supplied by Amazon remain in those original links.

## Control and removal

Filters start at Show. Restore all reverses Shopper Lens filtering. Pause on this page removes its interventions from product cards while keeping a way to resume. To stop it entirely, disable or remove Shopper Lens at `chrome://extensions` and refresh any open Amazon pages. There is no extension-created persistent browsing data to delete.

## Development is separate

The optional demonstration server binds to `127.0.0.1`, serves synthetic fixture and extension files, and is not part of the installed browser extension. Its page loads the scripts directly; the manifest does not grant localhost access. Development dependency installation through npm contacts package services. Those developer actions are separate from ordinary extension use.

The repository and its commits are public when published. Do not add signed-in page dumps, addresses, browsing records, credentials, verification codes, or private notes to bug reports or source files. A useful report can describe the layout and unexpected behavior without personal information.

This document describes this version's implementation. Review future source and manifest changes before granting additional access. The product's detection and comparison limits are documented in [SCOPE.md](SCOPE.md).

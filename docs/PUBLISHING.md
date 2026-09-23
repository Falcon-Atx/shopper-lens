# Make Shopper Lens available to other people

The source is already public at [Falcon-Atx/shopper-lens](https://github.com/Falcon-Atx/shopper-lens). You can share that link now. People can download the ZIP and follow the [README installation steps](../README.md) to load it unpacked in Chrome.

A Chrome Web Store listing adds a normal store installation page. **No Chrome Web Store submission has been performed.** This document explains a possible next step; asking how to publish does not start an upload, payment, or submission.

Official requirements below were checked again on September 22, 2026. Recheck the linked instructions when preparing the actual submission.

## What still needs preparation

The inspected `extension/` folder contains the runnable scripts, styles, popup, and manifest. The manifest has no `icons` declaration, and the folder has no icon image. Store screenshots and promotional artwork are also absent. These assets need creating before submission. Account registration and store listing setup have not been verified as complete.

Use a finished, tested release for the store package. Version 0.1.3 passed 54 automated tests and installed Chrome checks on battery, cable, and clothing searches; the [verification record](VERIFICATION.md) describes the limits. Keep the description, privacy text, screenshots, and uploaded version consistent. Creating the missing assets and completing store requirements remain separate work.

## Publish through the Chrome Web Store

1. **Register a developer account.** Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) with the Google account you want to own the extension. Registration requires a one-time fee and agreement to Google's developer terms and policies. Check the amount shown in the dashboard before paying. You personally enter credentials, handle payment, accept the terms, and complete account verification. [Official registration steps](https://developer.chrome.com/docs/webstore/register).

2. **Complete account setup.** Choose the publisher name and verify the contact email. Enable Google's **2-Step Verification**, which is required to publish and update extensions. [Account setup](https://developer.chrome.com/docs/webstore/set-up-account), [2-Step Verification requirement](https://developer.chrome.com/docs/webstore/program-policies/two-step-verification).

3. **Prepare the images.** Supply the required assets below. Screenshots should show the actual extension, including its uncertainty explanations, without exposing personal account details. [Chrome's image requirements](https://developer.chrome.com/docs/webstore/images).

   | Asset | Required format or size |
   | --- | --- |
   | Extension icon | **128 × 128 PNG**, included in the extension package. For square artwork, Chrome recommends 96 × 96 artwork with transparent padding. |
   | Small promotional image | **440 × 280** pixels. |
   | Screenshot | At least one; **1280 × 800** preferred, or **640 × 400**. Up to five. Square corners, without added padding. |

   Add the icon files under `extension/` and declare them in the manifest's `icons` object. Chrome also recommends a 48 × 48 icon for its extension manager; 16 × 16 and 32 × 32 variants can serve smaller displays. [Manifest icon guidance](https://developer.chrome.com/docs/extensions/reference/manifest/icons).

4. **Make an extension-only ZIP.** Run the project checks and inspect the release unpacked in Chrome. Then ZIP the **contents of `extension/`**, with `manifest.json` directly at the ZIP root. Do not upload GitHub's Download ZIP archive: it includes a parent project folder and development files. Exclude tests, `node_modules`, Git history, private files, and unrelated assets. Chrome requires this root-manifest structure. [Package preparation](https://developer.chrome.com/docs/webstore/prepare).

   ```text
   shopper-lens-store.zip
   ├── manifest.json
   ├── parser.js
   ├── unit-summary.js
   ├── content.js
   ├── content.css
   ├── popup.html
   ├── popup.js
   ├── popup.css
   └── icons/          ← the icon files you add and declare
   ```

5. **Create the listing.** In the dashboard, choose **Add new item**, upload that ZIP, and complete the Store listing fields. Describe the supported English Amazon.com searches, reversible filters, comparison limits, and local processing. Choose an appropriate category and English language; add the images. Use the public GitHub repository as the homepage and its Issues page for support if enabled. Do not imply affiliation with Amazon or promise that every advertisement or Amazon-owned product is detected. [Listing instructions](https://developer.chrome.com/docs/webstore/cws-dashboard-listing).

6. **Complete Privacy practices accurately.** The single purpose can be: “Help shoppers assess and compare information displayed on Amazon.com search pages using explained labels and reversible viewing controls.” Explain the narrow site access: the content script reads supported search cards and adds those controls. There are no additional extension API permissions. Declare no remote code only while all executable code remains packaged locally. [Privacy form guidance](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

   Disclose the local handling of page content and product links, with no transmission to a backend or persistent browsing records. Do not answer that the extension handles no data merely because it works locally: Chrome explicitly requires disclosure of local processing. [User-data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).

   Use the public [Shopper Lens privacy document](https://github.com/Falcon-Atx/shopper-lens/blob/main/docs/PRIVACY.md) as the privacy-policy URL. Check that it opens while signed out and describes the exact release being uploaded. Complete the dashboard's data-use declarations to match that implementation.

7. **Choose public distribution.** In Distribution, select **Public**, then choose the countries where the listing will be available. A U.S.-focused listing is a reasonable starting point for English Amazon.com support; geographic availability does not add support for other Amazon domains. Public makes the approved listing discoverable; Unlisted relies on sharing its store URL. [Distribution settings](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution).

8. **Review and submit when ready.** Provide reviewer instructions using ordinary Amazon.com searches, with no extension account required. Check all fields, then select **Submit for Review**. You can choose automatic publication after approval or defer publication. Review duration varies, and approval is not guaranteed. Once published, share the store listing URL alongside the GitHub source link. [Submission and review steps](https://developer.chrome.com/docs/webstore/publish).

For later store updates, increase the manifest version, test the changes, rebuild the extension-only ZIP, and upload it to the same store item. A GitHub push alone does not update the Chrome Web Store package. [Preparing version updates](https://developer.chrome.com/docs/webstore/prepare).

# Update the existing Awraq PDF Microsoft Store app

This package is for an update to the existing Awraq PDF listing. Do not reserve a new Store name and do not create a second product. Existing customers should receive this as an update to the same app.

## Part 1 — Put the v2 web app online

1. Open the GitHub repository that currently hosts Awraq PDF.
2. Create a backup branch before changing anything, for example backup-before-awraq-v2.
3. Replace the old web-app files with the contents of this Awraq AI Pro folder.
4. Keep any existing GitHub Pages or custom-domain configuration that already makes your published app available through HTTPS.
5. Publish the repository and wait for the live site to update.
6. Open the live HTTPS URL on Windows and confirm all of these:
   - the page opens normally;
   - the language button changes between Arabic and English;
   - a real Arabic PDF opens;
   - proof search shows page-linked evidence;
   - Merge, Extract Pages, Watermark, Page Numbers, and Optimize download an output file;
   - no browser developer-console error appears.

The live HTTPS URL must be stable. The installed Store app loads this address, so do not change the domain or path without planning a migration.

## Part 2 — Build a new Store package in PWABuilder

1. Sign in to Microsoft Partner Center and open the existing Awraq PDF product, not New product.
2. Find the product identity values for the existing app. In Partner Center these are typically available from the app’s Product identity area.
3. Keep those exact identity values for the new package. They must match the existing Store app, otherwise Windows treats it as a separate product.
4. Open PWABuilder and enter the live Awraq v2 HTTPS URL.
5. Resolve any Report Card issues that prevent packaging. Confirm that the manifest, icons, and service worker are found.
6. Choose the Microsoft Store package option.
7. Enter the existing app’s identity values and raise the package version above the currently published version. For example, if the current package is 1.3.0.0, build 2.0.0.0 or a higher version.
8. Download the generated MSIX or MSIX upload package.
9. Test-install the package on a Windows test computer before submitting it. Confirm the installed app opens Awraq v2 and keeps the existing Store identity.

## Part 3 — Submit the update in Partner Center

1. Return to the existing Awraq PDF product in Partner Center.
2. On the app Overview page, choose Start update in Product release.
3. In Packages, upload the new MSIX or MSIX upload package.
4. Check that Partner Center recognizes the package as an update to Awraq PDF and that the version is newer.
5. In Store listing, paste the relevant English and Arabic text from release/WHATS_NEW.md into What’s new in this version.
6. Refresh at least four screenshots with real screens from this v2 app. Do not use imagined marketing screens.
7. Keep the app’s privacy policy URL current. The included PRIVACY.md gives the release wording but must be hosted on your public website or repository as an accessible HTTPS page.
8. Review Pricing and availability, Properties, Age ratings, Store listing, and Submission options.
9. Select Submit for certification.

After certification, the Store replaces the old version. Existing users normally receive the update through the Microsoft Store.

## Critical checks before submitting

- Do not change the existing package identity.
- Do not create another Microsoft Store listing.
- Increment the package version.
- Ensure the PWA start URL uses HTTPS.
- Make sure the app’s privacy statement matches actual behavior.
- If the current published product is an EXE or MSI rather than an MSIX PWA, do not upload this PWA package until the package type is confirmed in Partner Center.

## Recommended first-release scope

Ship v2.0.0 as the fully local, no-account edition. Observe Store reviews and technical issues first. Add optional generative AI only in a later release after choosing a provider, a clear consent design, a privacy-policy update, and a sustainable subscription or credit model.


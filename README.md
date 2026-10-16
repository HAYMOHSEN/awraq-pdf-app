# Awraq AI Pro v2.0

Awraq AI Pro is a polished, local-first Arabic and English PDF workspace designed as an upgrade for the existing Awraq PDF Microsoft Store app.

## What is included

- Verified local proof search: a result always links to the PDF page that contains its supporting text.
- Proof Inspector: PDF page preview, extracted page text, and privacy signals in one place.
- Privacy scan: flags possible email addresses, phone numbers, card-like numbers, identity-like numbers, and passport-like values for human review.
- Action Packs: create local Study, Office, Research, and Privacy outputs.
- PDF Toolkit: merge, extract page ranges, add a watermark, add page numbers, and safely optimize a PDF.
- Arabic and English interface with RTL support.
- Local-first design: the browser processes selected PDFs; this release does not upload PDF contents to an AI service.
- Offline app shell: PDF libraries and the interface are included in the package and cached after installation.

## Run locally

Open this folder in a terminal and run:

python3 -m http.server 4173

Then visit http://localhost:4173 in a desktop browser. Do not open index.html directly from the file system: service-worker and module features require HTTP or HTTPS.

## Publish the web app

1. Upload the contents of this folder to the existing Awraq PDF web-app repository.
2. Keep the existing repository configuration that controls its public HTTPS URL, such as a CNAME file or GitHub Pages configuration.
3. Publish the updated repository and verify the live site before packaging it for the Store.
4. Follow release/STORE_UPDATE_STEPS.md to issue a Microsoft Store update under the existing Awraq PDF listing.

## Important product truth

This version deliberately does not pretend that a cloud chatbot is local AI. Its proof search, document text extraction, privacy checks, and output packs are local and evidence-linked. A later paid AI edition can add optional cloud generation only after its privacy notice, consent flow, usage limits, and operating cost are defined.

## Version

2.0.0


// Awraq PDF — service worker: precaches the whole app so it runs offline.
const VERSION = 'awraq-1.0.0';
const CDN_CACHE = 'awraq-cdn';
const PRECACHE = [
  "./",
  "./icons/icon-1024.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./index.html",
  "./js/app.js",
  "./js/arabic.js",
  "./js/docs.js",
  "./js/i18n.js",
  "./js/pdfjs.js",
  "./js/pro.js",
  "./js/tools-arabic.js",
  "./js/tools-pdf.js",
  "./js/ui.js",
  "./js/util.js",
  "./lib/jszip.min.js",
  "./lib/pdf-lib.min.js",
  "./lib/pdfjs/cmaps/78-EUC-H.bcmap",
  "./lib/pdfjs/cmaps/78-EUC-V.bcmap",
  "./lib/pdfjs/cmaps/78-H.bcmap",
  "./lib/pdfjs/cmaps/78-RKSJ-H.bcmap",
  "./lib/pdfjs/cmaps/78-RKSJ-V.bcmap",
  "./lib/pdfjs/cmaps/78-V.bcmap",
  "./lib/pdfjs/cmaps/78ms-RKSJ-H.bcmap",
  "./lib/pdfjs/cmaps/78ms-RKSJ-V.bcmap",
  "./lib/pdfjs/cmaps/83pv-RKSJ-H.bcmap",
  "./lib/pdfjs/cmaps/90ms-RKSJ-H.bcmap",
  "./lib/pdfjs/cmaps/90ms-RKSJ-V.bcmap",
  "./lib/pdfjs/cmaps/90msp-RKSJ-H.bcmap",
  "./lib/pdfjs/cmaps/90msp-RKSJ-V.bcmap",
  "./lib/pdfjs/cmaps/90pv-RKSJ-H.bcmap",
  "./lib/pdfjs/cmaps/90pv-RKSJ-V.bcmap",
  "./lib/pdfjs/cmaps/Add-H.bcmap",
  "./lib/pdfjs/cmaps/Add-RKSJ-H.bcmap",
  "./lib/pdfjs/cmaps/Add-RKSJ-V.bcmap",
  "./lib/pdfjs/cmaps/Add-V.bcmap",
  "./lib/pdfjs/cmaps/Adobe-CNS1-0.bcmap",
  "./lib/pdfjs/cmaps/Adobe-CNS1-1.bcmap",
  "./lib/pdfjs/cmaps/Adobe-CNS1-2.bcmap",
  "./lib/pdfjs/cmaps/Adobe-CNS1-3.bcmap",
  "./lib/pdfjs/cmaps/Adobe-CNS1-4.bcmap",
  "./lib/pdfjs/cmaps/Adobe-CNS1-5.bcmap",
  "./lib/pdfjs/cmaps/Adobe-CNS1-6.bcmap",
  "./lib/pdfjs/cmaps/Adobe-CNS1-UCS2.bcmap",
  "./lib/pdfjs/cmaps/Adobe-GB1-0.bcmap",
  "./lib/pdfjs/cmaps/Adobe-GB1-1.bcmap",
  "./lib/pdfjs/cmaps/Adobe-GB1-2.bcmap",
  "./lib/pdfjs/cmaps/Adobe-GB1-3.bcmap",
  "./lib/pdfjs/cmaps/Adobe-GB1-4.bcmap",
  "./lib/pdfjs/cmaps/Adobe-GB1-5.bcmap",
  "./lib/pdfjs/cmaps/Adobe-GB1-UCS2.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Japan1-0.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Japan1-1.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Japan1-2.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Japan1-3.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Japan1-4.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Japan1-5.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Japan1-6.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Japan1-UCS2.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Korea1-0.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Korea1-1.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Korea1-2.bcmap",
  "./lib/pdfjs/cmaps/Adobe-Korea1-UCS2.bcmap",
  "./lib/pdfjs/cmaps/B5-H.bcmap",
  "./lib/pdfjs/cmaps/B5-V.bcmap",
  "./lib/pdfjs/cmaps/B5pc-H.bcmap",
  "./lib/pdfjs/cmaps/B5pc-V.bcmap",
  "./lib/pdfjs/cmaps/CNS-EUC-H.bcmap",
  "./lib/pdfjs/cmaps/CNS-EUC-V.bcmap",
  "./lib/pdfjs/cmaps/CNS1-H.bcmap",
  "./lib/pdfjs/cmaps/CNS1-V.bcmap",
  "./lib/pdfjs/cmaps/CNS2-H.bcmap",
  "./lib/pdfjs/cmaps/CNS2-V.bcmap",
  "./lib/pdfjs/cmaps/ETHK-B5-H.bcmap",
  "./lib/pdfjs/cmaps/ETHK-B5-V.bcmap",
  "./lib/pdfjs/cmaps/ETen-B5-H.bcmap",
  "./lib/pdfjs/cmaps/ETen-B5-V.bcmap",
  "./lib/pdfjs/cmaps/ETenms-B5-H.bcmap",
  "./lib/pdfjs/cmaps/ETenms-B5-V.bcmap",
  "./lib/pdfjs/cmaps/EUC-H.bcmap",
  "./lib/pdfjs/cmaps/EUC-V.bcmap",
  "./lib/pdfjs/cmaps/Ext-H.bcmap",
  "./lib/pdfjs/cmaps/Ext-RKSJ-H.bcmap",
  "./lib/pdfjs/cmaps/Ext-RKSJ-V.bcmap",
  "./lib/pdfjs/cmaps/Ext-V.bcmap",
  "./lib/pdfjs/cmaps/GB-EUC-H.bcmap",
  "./lib/pdfjs/cmaps/GB-EUC-V.bcmap",
  "./lib/pdfjs/cmaps/GB-H.bcmap",
  "./lib/pdfjs/cmaps/GB-V.bcmap",
  "./lib/pdfjs/cmaps/GBK-EUC-H.bcmap",
  "./lib/pdfjs/cmaps/GBK-EUC-V.bcmap",
  "./lib/pdfjs/cmaps/GBK2K-H.bcmap",
  "./lib/pdfjs/cmaps/GBK2K-V.bcmap",
  "./lib/pdfjs/cmaps/GBKp-EUC-H.bcmap",
  "./lib/pdfjs/cmaps/GBKp-EUC-V.bcmap",
  "./lib/pdfjs/cmaps/GBT-EUC-H.bcmap",
  "./lib/pdfjs/cmaps/GBT-EUC-V.bcmap",
  "./lib/pdfjs/cmaps/GBT-H.bcmap",
  "./lib/pdfjs/cmaps/GBT-V.bcmap",
  "./lib/pdfjs/cmaps/GBTpc-EUC-H.bcmap",
  "./lib/pdfjs/cmaps/GBTpc-EUC-V.bcmap",
  "./lib/pdfjs/cmaps/GBpc-EUC-H.bcmap",
  "./lib/pdfjs/cmaps/GBpc-EUC-V.bcmap",
  "./lib/pdfjs/cmaps/H.bcmap",
  "./lib/pdfjs/cmaps/HKdla-B5-H.bcmap",
  "./lib/pdfjs/cmaps/HKdla-B5-V.bcmap",
  "./lib/pdfjs/cmaps/HKdlb-B5-H.bcmap",
  "./lib/pdfjs/cmaps/HKdlb-B5-V.bcmap",
  "./lib/pdfjs/cmaps/HKgccs-B5-H.bcmap",
  "./lib/pdfjs/cmaps/HKgccs-B5-V.bcmap",
  "./lib/pdfjs/cmaps/HKm314-B5-H.bcmap",
  "./lib/pdfjs/cmaps/HKm314-B5-V.bcmap",
  "./lib/pdfjs/cmaps/HKm471-B5-H.bcmap",
  "./lib/pdfjs/cmaps/HKm471-B5-V.bcmap",
  "./lib/pdfjs/cmaps/HKscs-B5-H.bcmap",
  "./lib/pdfjs/cmaps/HKscs-B5-V.bcmap",
  "./lib/pdfjs/cmaps/Hankaku.bcmap",
  "./lib/pdfjs/cmaps/Hiragana.bcmap",
  "./lib/pdfjs/cmaps/KSC-EUC-H.bcmap",
  "./lib/pdfjs/cmaps/KSC-EUC-V.bcmap",
  "./lib/pdfjs/cmaps/KSC-H.bcmap",
  "./lib/pdfjs/cmaps/KSC-Johab-H.bcmap",
  "./lib/pdfjs/cmaps/KSC-Johab-V.bcmap",
  "./lib/pdfjs/cmaps/KSC-V.bcmap",
  "./lib/pdfjs/cmaps/KSCms-UHC-H.bcmap",
  "./lib/pdfjs/cmaps/KSCms-UHC-HW-H.bcmap",
  "./lib/pdfjs/cmaps/KSCms-UHC-HW-V.bcmap",
  "./lib/pdfjs/cmaps/KSCms-UHC-V.bcmap",
  "./lib/pdfjs/cmaps/KSCpc-EUC-H.bcmap",
  "./lib/pdfjs/cmaps/KSCpc-EUC-V.bcmap",
  "./lib/pdfjs/cmaps/Katakana.bcmap",
  "./lib/pdfjs/cmaps/LICENSE",
  "./lib/pdfjs/cmaps/NWP-H.bcmap",
  "./lib/pdfjs/cmaps/NWP-V.bcmap",
  "./lib/pdfjs/cmaps/RKSJ-H.bcmap",
  "./lib/pdfjs/cmaps/RKSJ-V.bcmap",
  "./lib/pdfjs/cmaps/Roman.bcmap",
  "./lib/pdfjs/cmaps/UniCNS-UCS2-H.bcmap",
  "./lib/pdfjs/cmaps/UniCNS-UCS2-V.bcmap",
  "./lib/pdfjs/cmaps/UniCNS-UTF16-H.bcmap",
  "./lib/pdfjs/cmaps/UniCNS-UTF16-V.bcmap",
  "./lib/pdfjs/cmaps/UniCNS-UTF32-H.bcmap",
  "./lib/pdfjs/cmaps/UniCNS-UTF32-V.bcmap",
  "./lib/pdfjs/cmaps/UniCNS-UTF8-H.bcmap",
  "./lib/pdfjs/cmaps/UniCNS-UTF8-V.bcmap",
  "./lib/pdfjs/cmaps/UniGB-UCS2-H.bcmap",
  "./lib/pdfjs/cmaps/UniGB-UCS2-V.bcmap",
  "./lib/pdfjs/cmaps/UniGB-UTF16-H.bcmap",
  "./lib/pdfjs/cmaps/UniGB-UTF16-V.bcmap",
  "./lib/pdfjs/cmaps/UniGB-UTF32-H.bcmap",
  "./lib/pdfjs/cmaps/UniGB-UTF32-V.bcmap",
  "./lib/pdfjs/cmaps/UniGB-UTF8-H.bcmap",
  "./lib/pdfjs/cmaps/UniGB-UTF8-V.bcmap",
  "./lib/pdfjs/cmaps/UniJIS-UCS2-H.bcmap",
  "./lib/pdfjs/cmaps/UniJIS-UCS2-HW-H.bcmap",
  "./lib/pdfjs/cmaps/UniJIS-UCS2-HW-V.bcmap",
  "./lib/pdfjs/cmaps/UniJIS-UCS2-V.bcmap",
  "./lib/pdfjs/cmaps/UniJIS-UTF16-H.bcmap",
  "./lib/pdfjs/cmaps/UniJIS-UTF16-V.bcmap",
  "./lib/pdfjs/cmaps/UniJIS-UTF32-H.bcmap",
  "./lib/pdfjs/cmaps/UniJIS-UTF32-V.bcmap",
  "./lib/pdfjs/cmaps/UniJIS-UTF8-H.bcmap",
  "./lib/pdfjs/cmaps/UniJIS-UTF8-V.bcmap",
  "./lib/pdfjs/cmaps/UniJIS2004-UTF16-H.bcmap",
  "./lib/pdfjs/cmaps/UniJIS2004-UTF16-V.bcmap",
  "./lib/pdfjs/cmaps/UniJIS2004-UTF32-H.bcmap",
  "./lib/pdfjs/cmaps/UniJIS2004-UTF32-V.bcmap",
  "./lib/pdfjs/cmaps/UniJIS2004-UTF8-H.bcmap",
  "./lib/pdfjs/cmaps/UniJIS2004-UTF8-V.bcmap",
  "./lib/pdfjs/cmaps/UniJISPro-UCS2-HW-V.bcmap",
  "./lib/pdfjs/cmaps/UniJISPro-UCS2-V.bcmap",
  "./lib/pdfjs/cmaps/UniJISPro-UTF8-V.bcmap",
  "./lib/pdfjs/cmaps/UniJISX0213-UTF32-H.bcmap",
  "./lib/pdfjs/cmaps/UniJISX0213-UTF32-V.bcmap",
  "./lib/pdfjs/cmaps/UniJISX02132004-UTF32-H.bcmap",
  "./lib/pdfjs/cmaps/UniJISX02132004-UTF32-V.bcmap",
  "./lib/pdfjs/cmaps/UniKS-UCS2-H.bcmap",
  "./lib/pdfjs/cmaps/UniKS-UCS2-V.bcmap",
  "./lib/pdfjs/cmaps/UniKS-UTF16-H.bcmap",
  "./lib/pdfjs/cmaps/UniKS-UTF16-V.bcmap",
  "./lib/pdfjs/cmaps/UniKS-UTF32-H.bcmap",
  "./lib/pdfjs/cmaps/UniKS-UTF32-V.bcmap",
  "./lib/pdfjs/cmaps/UniKS-UTF8-H.bcmap",
  "./lib/pdfjs/cmaps/UniKS-UTF8-V.bcmap",
  "./lib/pdfjs/cmaps/V.bcmap",
  "./lib/pdfjs/cmaps/WP-Symbol.bcmap",
  "./lib/pdfjs/iccs/CGATS001Compat-v2-micro.icc",
  "./lib/pdfjs/iccs/LICENSE",
  "./lib/pdfjs/pdf.min.mjs",
  "./lib/pdfjs/pdf.worker.min.mjs",
  "./lib/pdfjs/standard_fonts/FoxitDingbats.pfb",
  "./lib/pdfjs/standard_fonts/FoxitFixed.pfb",
  "./lib/pdfjs/standard_fonts/FoxitFixedBold.pfb",
  "./lib/pdfjs/standard_fonts/FoxitFixedBoldItalic.pfb",
  "./lib/pdfjs/standard_fonts/FoxitFixedItalic.pfb",
  "./lib/pdfjs/standard_fonts/FoxitSerif.pfb",
  "./lib/pdfjs/standard_fonts/FoxitSerifBold.pfb",
  "./lib/pdfjs/standard_fonts/FoxitSerifBoldItalic.pfb",
  "./lib/pdfjs/standard_fonts/FoxitSerifItalic.pfb",
  "./lib/pdfjs/standard_fonts/FoxitSymbol.pfb",
  "./lib/pdfjs/standard_fonts/LICENSE_FOXIT",
  "./lib/pdfjs/standard_fonts/LICENSE_LIBERATION",
  "./lib/pdfjs/standard_fonts/LiberationSans-Bold.ttf",
  "./lib/pdfjs/standard_fonts/LiberationSans-BoldItalic.ttf",
  "./lib/pdfjs/standard_fonts/LiberationSans-Italic.ttf",
  "./lib/pdfjs/standard_fonts/LiberationSans-Regular.ttf",
  "./lib/pdfjs/wasm/LICENSE_JBIG2",
  "./lib/pdfjs/wasm/LICENSE_OPENJPEG",
  "./lib/pdfjs/wasm/LICENSE_PDFJS_JBIG2",
  "./lib/pdfjs/wasm/LICENSE_PDFJS_OPENJPEG",
  "./lib/pdfjs/wasm/LICENSE_PDFJS_QCMS",
  "./lib/pdfjs/wasm/LICENSE_QCMS",
  "./lib/pdfjs/wasm/jbig2.wasm",
  "./lib/pdfjs/wasm/openjpeg.wasm",
  "./lib/pdfjs/wasm/openjpeg_nowasm_fallback.js",
  "./lib/pdfjs/wasm/qcms_bg.wasm",
  "./licenses/THIRD-PARTY-NOTICES.txt",
  "./licenses/jszip-LICENSE.txt",
  "./licenses/pdf-lib-LICENSE.txt",
  "./licenses/pdfjs-LICENSE.txt",
  "./manifest.webmanifest",
  "./privacy.html",
  "./styles.css"
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // Add in small batches so one slow file does not fail the whole install.
    for (let i = 0; i < PRECACHE.length; i += 20) {
      await Promise.all(PRECACHE.slice(i, i + 20).map((u) => cache.add(u).catch(() => {})));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('awraq-') && k !== VERSION && k !== CDN_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      try {
        const resp = await fetch(req);
        if (resp && resp.ok) cache.put(req, resp.clone());
        return resp;
      } catch (e) {
        if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
        return Response.error();
      }
    })());
  } else if (url.hostname === 'cdn.jsdelivr.net') {
    // OCR engine and language data: cache after first download.
    event.respondWith((async () => {
      const cache = await caches.open(CDN_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      const resp = await fetch(req);
      if (resp && (resp.ok || resp.type === 'opaque')) cache.put(req, resp.clone());
      return resp;
    })());
  }
});

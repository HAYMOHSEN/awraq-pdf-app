// Awraq PDF — pdf.js wrapper (rendering + text extraction backend)
import * as pdfjsLib from '../lib/pdfjs/pdf.min.mjs';

const BASE = new URL('../lib/pdfjs/', import.meta.url).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = BASE + 'pdf.worker.min.mjs';

export { pdfjsLib };

/** Open a PDF with pdf.js. A copy of the bytes is passed (pdf.js detaches its buffer). */
export async function openPdf(bytes, password) {
  const task = pdfjsLib.getDocument({
    data: bytes.slice(),
    password,
    cMapUrl: BASE + 'cmaps/',
    cMapPacked: true,
    standardFontDataUrl: BASE + 'standard_fonts/',
    wasmUrl: BASE + 'wasm/',
    iccUrl: BASE + 'iccs/',
    isEvalSupported: false,
    enableXfa: false,
  });
  return task.promise;
}

export function isPasswordError(e) {
  return e && (e.name === 'PasswordException' || /password/i.test(e.message || ''));
}

/** Render one page into a new canvas. `scale` is relative to 72 dpi. */
export async function renderPage(page, { scale = 1, rotation, background = '#ffffff', maxPixels = 40e6 } = {}) {
  const rot = rotation === undefined ? page.rotate : rotation;
  let viewport = page.getViewport({ scale, rotation: rot });
  const px = viewport.width * viewport.height;
  if (px > maxPixels) {
    const f = Math.sqrt(maxPixels / px);
    viewport = page.getViewport({ scale: scale * f, rotation: rot });
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, canvas, viewport }).promise;
  return canvas;
}

/* ---------- Lazy thumbnails ---------- */

const queue = [];
let active = 0;
const MAX_ACTIVE = 2;

function pump() {
  while (active < MAX_ACTIVE && queue.length) {
    const job = queue.shift();
    active++;
    job().finally(() => { active--; pump(); });
  }
}

const thumbCache = new WeakMap(); // pdfDoc -> Map("index:width" -> canvas)

/**
 * Fill `holder` with a thumbnail of page `pageIndex` once it scrolls into view.
 * Rendered thumbnails are cached per document, so re-renders are instant.
 */
export function lazyThumb(holder, pdfDoc, pageIndex, width = 150) {
  let cache = thumbCache.get(pdfDoc);
  if (!cache) { cache = new Map(); thumbCache.set(pdfDoc, cache); }
  const key = `${pageIndex}:${width}`;
  const place = (canvas) => {
    holder.replaceChildren(canvas);
    holder.classList.add('is-ready');
  };
  if (cache.has(key)) { place(cache.get(key)); return () => {}; }
  let cancelled = false;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    queue.push(async () => {
      if (cancelled || !holder.isConnected) return;
      try {
        if (!cache.has(key)) {
          const page = await pdfDoc.getPage(pageIndex + 1);
          const base = page.getViewport({ scale: 1 });
          const scale = (width * Math.min(2, window.devicePixelRatio || 1)) / base.width;
          const canvas = await renderPage(page, { scale });
          canvas.className = 'thumb-canvas';
          canvas.setAttribute('aria-hidden', 'true');
          cache.set(key, canvas);
        }
        if (cancelled || !holder.isConnected) return;
        place(cache.get(key));
      } catch (_) {
        holder.classList.add('is-failed');
      }
    });
    pump();
  }, { rootMargin: '300px' });
  io.observe(holder);
  return () => { cancelled = true; io.disconnect(); };
}

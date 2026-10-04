// Awraq PDF — shared helpers
import { t, count } from './i18n.js';

export const FREE_PRO_PAGES = 3;

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Tiny element builder: h('button', {class:'x', onclick}, 'text', child) */
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function baseName(fileName) {
  return String(fileName || 'document').replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]+/g, '_') || 'document';
}

export async function readBytes(file) {
  return new Uint8Array(await file.arrayBuffer());
}

export function isPdfBytes(bytes) {
  // %PDF may appear within the first 1 KB
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, Math.min(1024, bytes.length)));
  return head.includes('%PDF');
}

export function isPdfFile(file) {
  return /\.pdf$/i.test(file.name) || file.type === 'application/pdf';
}

export function isImageFile(file) {
  return /^image\/(jpeg|png|webp|gif|bmp)$/i.test(file.type) || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Let the UI breathe during long loops. */
export const yieldToUI = () => new Promise((r) => setTimeout(r, 0));

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
export function toWesternDigits(s) {
  return String(s).replace(/[٠-٩۰-۹]/g, (d) => {
    const i = ARABIC_DIGITS.indexOf(d);
    return String(i >= 0 ? i : PERSIAN_DIGITS.indexOf(d));
  });
}
export function toArabicDigits(s) {
  return String(s).replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]);
}

/**
 * Parse "1-3, 5, 7-9" (also Arabic digits and the Arabic comma) into
 * groups of 0-based page indices. Returns null when invalid.
 */
export function parseRanges(text, pageCount) {
  const clean = toWesternDigits(text).replace(/[،؛;]/g, ',').replace(/[–—−]/g, '-').trim();
  if (!clean) return null;
  const groups = [];
  for (const part of clean.split(',')) {
    const p = part.trim();
    if (!p) continue;
    const m = p.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if (!m) return null;
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    if (a < 1 || b < 1 || a > pageCount || b > pageCount) return null;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const g = [];
    for (let i = lo; i <= hi; i++) g.push(i - 1);
    groups.push(g);
  }
  return groups.length ? groups : null;
}

const loadedScripts = new Map();
export function loadScript(src) {
  if (loadedScripts.has(src)) return loadedScripts.get(src);
  const p = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = () => { loadedScripts.delete(src); reject(new Error('network')); };
    document.head.append(s);
  });
  loadedScripts.set(src, p);
  return p;
}

/* ---------- Saving files ---------- */

const MIME_DESC = {
  'application/pdf': ['PDF', '.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['Word', '.docx'],
  'text/plain': ['Text', '.txt'],
  'image/png': ['PNG', '.png'],
  'image/jpeg': ['JPEG', '.jpg'],
  'application/zip': ['ZIP', '.zip'],
};

/** Save one file. Uses the native Save dialog where available. */
export async function saveBlob(blob, suggestedName) {
  if (typeof window.showSaveFilePicker === 'function') {
    const desc = MIME_DESC[blob.type];
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: desc ? [{ description: desc[0], accept: { [blob.type]: [desc[1]] } }] : undefined,
      });
      const w = await handle.createWritable();
      await w.write(blob);
      await w.close();
      return { saved: true, name: handle.name };
    } catch (e) {
      if (e && e.name === 'AbortError') return { saved: false };
      // Any other failure: fall back to a normal download.
    }
  }
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: suggestedName });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return { saved: true, name: suggestedName };
}

/** Save several files: into a chosen folder, or as one ZIP. */
export async function saveMany(files, zipName, kind = 'file') {
  if (files.length === 1) {
    const r = await saveBlob(files[0].blob, files[0].name);
    return r.saved ? { saved: true, message: t('res.saved', { name: r.name }) } : { saved: false };
  }
  if (typeof window.showDirectoryPicker === 'function') {
    try {
      const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
      for (const f of files) {
        const fh = await dir.getFileHandle(f.name, { create: true });
        const w = await fh.createWritable();
        await w.write(f.blob);
        await w.close();
      }
      return { saved: true, message: t('res.savedFolder', { count: count(kind, files.length) }) };
    } catch (e) {
      if (e && e.name === 'AbortError') return { saved: false };
    }
  }
  const zip = new window.JSZip();
  for (const f of files) zip.file(f.name, f.blob);
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  const r = await saveBlob(blob, zipName);
  return r.saved
    ? { saved: true, message: t('res.zip', { name: r.name, count: count(kind, files.length) }) }
    : { saved: false };
}

export function hasArabic(s) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(s);
}

// Awraq PDF — loading documents and delivering results
import { t, count, formatBytes, sep } from './i18n.js';
import { h, readBytes, isPdfBytes, saveMany } from './util.js';
import { openPdf, isPasswordError, lazyThumb } from './pdfjs.js';
import { icon } from './ui.js';

export class UserError extends Error {}

export function userMessage(e) {
  if (e instanceof UserError) return e.message;
  console.error(e);
  return t('err.generic', { msg: (e && e.message) || String(e) });
}

let nextId = 1;

/** Read a PDF file and open it with pdf.js (for thumbnails and text). */
export async function loadPdf(file) {
  const bytes = await readBytes(file);
  if (!isPdfBytes(bytes)) throw new UserError(t('err.notPdf', { name: file.name }));
  let pdf;
  try {
    pdf = await openPdf(bytes);
  } catch (e) {
    if (isPasswordError(e)) throw new UserError(t('err.encrypted', { name: file.name }));
    throw new UserError(t('err.read', { name: file.name }));
  }
  return { id: nextId++, name: file.name, size: file.size, bytes, pdf, pageCount: pdf.numPages, file };
}

/** Open the same bytes with pdf-lib for editing. */
export async function loadForEdit(entry) {
  const { PDFDocument } = window.PDFLib || {};
  if (!PDFDocument) throw new UserError(t('err.libs'));
  try {
    return await PDFDocument.load(entry.bytes, { updateMetadata: false });
  } catch (e) {
    if (/encrypt/i.test((e && e.message) || '')) throw new UserError(t('err.encrypted', { name: entry.name }));
    throw new UserError(t('err.read', { name: entry.name }));
  }
}

export function disposeEntry(entry) {
  try { entry && entry.pdf && entry.pdf.destroy(); } catch (_) { /* ignore */ }
}

/** Header row for single-file tools. */
export function fileHeader(entry, onClear) {
  const thumb = h('div', { class: 'mini-thumb' });
  lazyThumb(thumb, entry.pdf, 0, 46);
  return h('div', { class: 'file-head sheet-flat' },
    thumb,
    h('div', { class: 'file-meta' },
      h('p', { class: 'file-name' }, h('bdi', null, entry.name)),
      h('p', { class: 'muted' }, `${count('page', entry.pageCount)}${sep()}${formatBytes(entry.size)}`)),
    h('button', { type: 'button', class: 'btn btn-quiet', onclick: onClear }, icon('x'), t('btn.another')));
}

/**
 * Save results. Opens the Save dialog straight away when the work was quick
 * (the click still counts as a user gesture); otherwise shows a Save button.
 */
export async function deliver(st, ctx, { files, zipName, kind = 'file', detail, startedAt }) {
  st.output = { files, zipName, kind, detail };
  if (performance.now() - startedAt < 3500) {
    const r = await saveMany(files, zipName, kind);
    st.result = r.saved ? { message: r.message, detail } : { message: t('res.cancelled'), detail, pending: true };
  } else {
    st.result = { message: files.length > 1 ? t('res.readyMany') : t('res.ready'), detail, pending: true };
  }
  ctx.refresh();
}

/** Save the last output again (from a fresh click). */
export async function saveAgain(st, ctx) {
  if (!st.output) return;
  const { files, zipName, kind, detail } = st.output;
  const r = await saveMany(files, zipName, kind);
  if (r.saved) st.result = { message: r.message, detail };
  ctx.refresh();
}

export function pdfBlob(bytes) {
  return new Blob([bytes], { type: 'application/pdf' });
}

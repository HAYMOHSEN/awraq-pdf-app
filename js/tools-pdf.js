// Awraq PDF — free tools
import { t, count, formatBytes, sep, getLang } from './i18n.js';
import { h, baseName, readBytes, isImageFile, isPdfFile, parseRanges, toArabicDigits, hasArabic, yieldToUI } from './util.js';
import { lazyThumb, renderPage } from './pdfjs.js';
import {
  ICONS, icon, toolHeader, dropzone, notice, actionBar, resultCard, segmented, selectField,
  textField, numberField, rangeField, checkField, optionsPanel, sortable, moveItem,
} from './ui.js';
import { userMessage, loadPdf, loadForEdit, disposeEntry, fileHeader, deliver, saveAgain, pdfBlob } from './docs.js';

const lib = () => window.PDFLib;
const PDF_ACCEPT = '.pdf,application/pdf';
const IMG_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.bmp,image/jpeg,image/png,image/webp,image/gif,image/bmp';

/* ---------- shared pieces ---------- */

function iconButton(name, label, onClick, disabled) {
  return h('button', {
    type: 'button', class: 'icon-btn', 'aria-label': label, title: label,
    onclick: onClick, disabled: disabled || undefined, html: ICONS[name],
  });
}

function commonNotices(root, st) {
  if (st.error) root.append(notice(st.error, 'error'));
  if (st.loading) root.append(notice(t('status.reading', { name: st.loading })));
}

function appendResult(root, st, ctx) {
  if (!st.result) return;
  root.append(resultCard({
    message: st.result.message,
    detail: st.result.detail,
    pending: !!st.result.pending,
    onSave: st.output ? () => saveAgain(st, ctx) : null,
    onStartOver: () => ctx.reset(),
  }));
}

function singleDrop(st, ctx, tool) {
  return dropzone({ accept: PDF_ACCEPT, multiple: false, title: t('drop.pdfOne'), onFiles: (f) => tool.addFiles(st, f, ctx) });
}

async function loadSingle(st, files, ctx, onLoaded) {
  const file = files.find(isPdfFile) || files[0];
  st.error = null; st.result = null; st.output = null;
  st.loading = file.name;
  ctx.refresh();
  try {
    const entry = await loadPdf(file);
    disposeEntry(st.file);
    st.file = entry;
    if (onLoaded) onLoaded(entry);
  } catch (e) {
    st.error = userMessage(e);
  }
  st.loading = null;
  ctx.refresh();
}

function fail(st, ctx, e) {
  st.error = userMessage(e);
  ctx.refresh();
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Visible page box of a pdf-lib page, accounting for /Rotate and the crop box. */
function visualBox(page) {
  const crop = page.getCropBox();
  const rot = (((page.getRotation().angle || 0) % 360) + 360) % 360;
  const W = crop.width;
  const H = crop.height;
  const quarter = rot === 90 || rot === 270;
  const toPdf = (u, v) => {
    switch (rot) {
      case 90: return { x: crop.x + W - v, y: crop.y + u };
      case 180: return { x: crop.x + W - u, y: crop.y + H - v };
      case 270: return { x: crop.x + v, y: crop.y + H - u };
      default: return { x: crop.x + u, y: crop.y + v };
    }
  };
  return { vw: quarter ? H : W, vh: quarter ? W : H, rot, toPdf };
}

/** Render text with the system font (handles Arabic shaping) into a PNG. */
async function textPng(text, { px, color, weight = 600 }) {
  const family = getComputedStyle(document.body).fontFamily;
  const c = document.createElement('canvas');
  let g = c.getContext('2d');
  g.font = `${weight} ${px}px ${family}`;
  const width = Math.ceil(g.measureText(text).width + px * 0.5);
  const height = Math.ceil(px * 1.55);
  c.width = Math.max(2, width);
  c.height = Math.max(2, height);
  g = c.getContext('2d');
  g.font = `${weight} ${px}px ${family}`;
  g.direction = hasArabic(text) ? 'rtl' : 'ltr';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = color;
  g.fillText(text, c.width / 2, c.height / 2 + px * 0.04);
  const blob = await canvasToBlob(c, 'image/png');
  return { bytes: new Uint8Array(await blob.arrayBuffer()), w: c.width, h: c.height };
}

function fileRow(entry, i, n, { onUp, onDown, onRemove }) {
  const thumb = h('div', { class: 'mini-thumb' });
  lazyThumb(thumb, entry.pdf, 0, 46);
  return h('li', { class: 'file-row', draggable: 'true', dataset: { index: String(i) } },
    h('span', { class: 'drag-handle', html: ICONS.drag, 'aria-hidden': 'true' }),
    thumb,
    h('div', { class: 'file-meta' },
      h('p', { class: 'file-name' }, h('bdi', null, entry.name)),
      h('p', { class: 'muted' }, `${count('page', entry.pageCount)}${sep()}${formatBytes(entry.size)}`)),
    h('div', { class: 'row-actions' },
      iconButton('up', t('btn.moveUp'), onUp, i === 0),
      iconButton('down', t('btn.moveDown'), onDown, i === n - 1),
      iconButton('x', t('btn.remove'), onRemove)));
}

function selectGrid(entry, selected, onToggle) {
  const grid = h('div', { class: 'page-grid', role: 'group', 'aria-label': t('split.mode.select') });
  for (let i = 0; i < entry.pageCount; i++) {
    const holder = h('div', { class: 'thumb' });
    const on = selected.has(i);
    const cell = h('button', {
      type: 'button', class: `page-cell selectable${on ? ' is-selected' : ''}`, 'aria-pressed': String(on),
      'aria-label': t('status.page', { i: i + 1, n: entry.pageCount }),
    },
    h('span', { class: 'page-sheet' }, holder, h('span', { class: 'check-badge', html: ICONS.check })),
    h('span', { class: 'page-label' }, String(i + 1)));
    cell.addEventListener('click', () => onToggle(i, cell));
    lazyThumb(holder, entry.pdf, i, 132);
    grid.append(cell);
  }
  return grid;
}

/* =========================================================
   Merge
   ========================================================= */
export const merge = {
  id: 'merge', group: 'arrange', accept: 'pdf', multiple: true,
  init: () => ({ files: [], error: null, result: null, output: null, loading: null }),
  async addFiles(st, files, ctx) {
    st.error = null; st.result = null; st.output = null;
    for (const f of files) {
      st.loading = f.name;
      ctx.refresh();
      try { st.files.push(await loadPdf(f)); } catch (e) { st.error = userMessage(e); }
    }
    st.loading = null;
    ctx.refresh();
  },
  render(root, st, ctx) {
    root.append(toolHeader('merge'));
    commonNotices(root, st);
    const add = (f) => this.addFiles(st, f, ctx);
    if (!st.files.length) {
      root.append(dropzone({ accept: PDF_ACCEPT, title: t('drop.pdf'), onFiles: add }));
      return;
    }
    const changed = () => { st.result = null; st.output = null; ctx.refresh(); };
    const total = st.files.reduce((a, f) => a + f.pageCount, 0);
    root.append(h('div', { class: 'list-head' },
      h('p', { class: 'list-summary' }, t('merge.summary', { files: count('file', st.files.length), pages: count('page', total) })),
      h('p', { class: 'muted' }, t('merge.hint'))));
    const list = h('ol', { class: 'file-list' });
    st.files.forEach((f, i) => list.append(fileRow(f, i, st.files.length, {
      onUp: () => { st.files = moveItem(st.files, i, i - 1); changed(); },
      onDown: () => { st.files = moveItem(st.files, i, i + 1); changed(); },
      onRemove: () => { disposeEntry(f); st.files.splice(i, 1); changed(); },
    })));
    sortable(list, '.file-row', (from, to) => { st.files = moveItem(st.files, from, to); changed(); });
    root.append(list);
    root.append(dropzone({ accept: PDF_ACCEPT, title: t('drop.more'), chooseLabel: t('drop.more'), compact: true, onFiles: add }));
    const bar = actionBar({ label: t('act.merge'), onClick: () => runMerge(st, ctx, bar) });
    if (st.files.length < 2) { bar.setDisabled(true); bar.setInfo(t('merge.needTwo')); }
    root.append(bar.el);
    appendResult(root, st, ctx);
  },
};

async function runMerge(st, ctx, bar) {
  const startedAt = performance.now();
  st.error = null; st.result = null;
  try {
    const { PDFDocument } = lib();
    const out = await PDFDocument.create();
    for (let i = 0; i < st.files.length; i++) {
      bar.busy(t('status.reading', { name: st.files[i].name }), (i + 0.5) / (st.files.length + 1));
      const src = await loadForEdit(st.files[i]);
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => out.addPage(p));
      await yieldToUI();
    }
    bar.busy(t('status.saving'), 0.95);
    const bytes = await out.save({ useObjectStreams: true });
    await deliver(st, ctx, {
      files: [{ name: `${baseName(st.files[0].name)}-merged.pdf`, blob: pdfBlob(bytes) }],
      startedAt, detail: `${count('page', out.getPageCount())}${sep()}${formatBytes(bytes.length)}`,
    });
  } catch (e) { fail(st, ctx, e); }
}

/* =========================================================
   Split
   ========================================================= */
export const split = {
  id: 'split', group: 'arrange', accept: 'pdf', multiple: false,
  init: () => ({ file: null, mode: 'select', selected: new Set(), ranges: '', error: null, result: null, output: null, loading: null }),
  addFiles(st, files, ctx) { return loadSingle(st, files, ctx, () => { st.selected = new Set(); st.ranges = ''; }); },
  render(root, st, ctx) {
    root.append(toolHeader('split'));
    commonNotices(root, st);
    if (!st.file) { root.append(singleDrop(st, ctx, this)); return; }
    root.append(fileHeader(st.file, () => ctx.reset()));
    root.append(optionsPanel(segmented({
      label: t('split.mode'), value: st.mode,
      options: [
        { value: 'select', label: t('split.mode.select') },
        { value: 'ranges', label: t('split.mode.ranges') },
        { value: 'each', label: t('split.mode.each') },
      ],
      onChange: (v) => { st.mode = v; st.result = null; st.output = null; ctx.refresh(); },
    })));
    const bar = actionBar({ label: t('act.split'), onClick: () => runSplit(st, ctx, bar) });
    if (st.mode === 'select') {
      const info = () => t('split.selected', { count: count('page', st.selected.size) });
      root.append(h('div', { class: 'list-head' },
        h('p', { class: 'muted' }, t('split.select.help')),
        h('div', { class: 'list-tools' },
          h('button', { type: 'button', class: 'btn btn-quiet btn-sm', onclick: () => { for (let i = 0; i < st.file.pageCount; i++) st.selected.add(i); ctx.refresh(); } }, t('btn.selectAll')),
          h('button', { type: 'button', class: 'btn btn-quiet btn-sm', onclick: () => { st.selected.clear(); ctx.refresh(); } }, t('btn.selectNone')))));
      root.append(selectGrid(st.file, st.selected, (i, cell) => {
        if (st.selected.has(i)) st.selected.delete(i); else st.selected.add(i);
        const on = st.selected.has(i);
        cell.classList.toggle('is-selected', on);
        cell.setAttribute('aria-pressed', String(on));
        bar.setInfo(info());
        bar.setDisabled(!st.selected.size);
      }));
      bar.setInfo(info());
      bar.setDisabled(!st.selected.size);
    } else if (st.mode === 'ranges') {
      root.append(optionsPanel(
        textField({ label: t('split.ranges'), value: st.ranges, placeholder: t('split.ranges.ph'), dir: 'ltr', onInput: (v) => { st.ranges = v; } }),
        h('p', { class: 'muted field-help' }, t('split.ranges.help'))));
    } else {
      bar.setInfo(t('split.eachInfo', { count: count('file', st.file.pageCount) }));
    }
    root.append(bar.el);
    appendResult(root, st, ctx);
  },
};

function splitName(base, mode, group, pad) {
  const first = group[0] + 1;
  const last = group[group.length - 1] + 1;
  if (mode === 'each') return `${base}-${String(first).padStart(pad, '0')}.pdf`;
  if (mode === 'select') return group.length <= 4 ? `${base}-p${group.map((i) => i + 1).join('_')}.pdf` : `${base}-extract.pdf`;
  return first === last ? `${base}-${first}.pdf` : `${base}-${first}-${last}.pdf`;
}

async function runSplit(st, ctx, bar) {
  const startedAt = performance.now();
  st.error = null; st.result = null;
  const n = st.file.pageCount;
  const base = baseName(st.file.name);
  let groups;
  if (st.mode === 'select') {
    if (!st.selected.size) { st.error = t('split.needPages'); ctx.refresh(); return; }
    groups = [[...st.selected].sort((a, b) => a - b)];
  } else if (st.mode === 'each') {
    groups = Array.from({ length: n }, (_, i) => [i]);
  } else {
    groups = parseRanges(st.ranges, n);
    if (!groups) { st.error = t('split.badRanges', { pages: count('page', n) }); ctx.refresh(); return; }
  }
  try {
    const { PDFDocument } = lib();
    const src = await loadForEdit(st.file);
    const files = [];
    const pad = String(n).length;
    for (let g = 0; g < groups.length; g++) {
      bar.busy(t('status.working'), (g + 1) / (groups.length + 1));
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, groups[g]);
      pages.forEach((p) => out.addPage(p));
      const bytes = await out.save({ useObjectStreams: true });
      files.push({ name: splitName(base, st.mode, groups[g], pad), blob: pdfBlob(bytes) });
      if (g % 5 === 4) await yieldToUI();
    }
    await deliver(st, ctx, { files, zipName: `${base}-split.zip`, kind: 'file', startedAt, detail: count('file', files.length) });
  } catch (e) { fail(st, ctx, e); }
}

/* =========================================================
   Organize
   ========================================================= */
export const organize = {
  id: 'organize', group: 'arrange', accept: 'pdf', multiple: false,
  init: () => ({ file: null, pages: [], error: null, result: null, output: null, loading: null }),
  addFiles(st, files, ctx) {
    return loadSingle(st, files, ctx, (entry) => {
      st.pages = Array.from({ length: entry.pageCount }, (_, i) => ({ src: i, rot: 0, del: false }));
    });
  },
  render(root, st, ctx) {
    root.append(toolHeader('organize'));
    commonNotices(root, st);
    if (!st.file) { root.append(singleDrop(st, ctx, this)); return; }
    root.append(fileHeader(st.file, () => ctx.reset()));
    const changed = () => { st.result = null; st.output = null; ctx.refresh(); };
    const kept = st.pages.filter((p) => !p.del).length;
    root.append(h('div', { class: 'list-head' },
      h('p', { class: 'muted' }, t('org.help')),
      h('div', { class: 'list-tools' },
        h('button', { type: 'button', class: 'btn btn-quiet btn-sm', onclick: () => { st.pages.forEach((p) => { p.rot = (p.rot + 90) % 360; }); changed(); } }, icon('rotR'), t('btn.rotateAll')))));
    const grid = h('div', { class: 'page-grid organize-grid' });
    st.pages.forEach((p, i) => {
      const holder = h('div', { class: 'thumb' });
      const tools = p.del
        ? [iconButton('undo', t('btn.restore'), () => { p.del = false; changed(); })]
        : [
          iconButton('rotL', t('btn.rotateLeft'), () => { p.rot = (p.rot + 270) % 360; changed(); }),
          iconButton('rotR', t('btn.rotateRight'), () => { p.rot = (p.rot + 90) % 360; changed(); }),
          iconButton('trash', t('btn.delete'), () => { p.del = true; changed(); }),
        ];
      const cell = h('div', { class: `page-cell org-cell${p.del ? ' is-deleted' : ''}`, draggable: 'true', dataset: { index: String(i), rot: String(p.rot) } },
        h('span', { class: 'page-sheet' }, holder),
        h('span', { class: 'page-label' }, String(p.src + 1)),
        h('div', { class: 'page-tools' }, ...tools));
      lazyThumb(holder, st.file.pdf, p.src, 132);
      grid.append(cell);
    });
    sortable(grid, '.org-cell', (from, to) => { st.pages = moveItem(st.pages, from, to); changed(); });
    root.append(grid);
    const bar = actionBar({ label: t('act.organize'), onClick: () => runOrganize(st, ctx, bar) });
    bar.setInfo(t('org.kept', { kept: count('page', kept), total: st.pages.length }));
    if (!kept) bar.setDisabled(true);
    root.append(bar.el);
    appendResult(root, st, ctx);
  },
};

async function runOrganize(st, ctx, bar) {
  const startedAt = performance.now();
  const keep = st.pages.filter((p) => !p.del);
  if (!keep.length) { st.error = t('org.allDeleted'); ctx.refresh(); return; }
  st.error = null; st.result = null;
  try {
    const { PDFDocument, degrees } = lib();
    bar.busy(t('status.working'), 0.3);
    const src = await loadForEdit(st.file);
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, keep.map((p) => p.src));
    pages.forEach((pg, i) => {
      const baseRot = pg.getRotation().angle || 0;
      if (keep[i].rot) pg.setRotation(degrees((baseRot + keep[i].rot) % 360));
      out.addPage(pg);
    });
    bar.busy(t('status.saving'), 0.9);
    const bytes = await out.save({ useObjectStreams: true });
    await deliver(st, ctx, {
      files: [{ name: `${baseName(st.file.name)}-organized.pdf`, blob: pdfBlob(bytes) }],
      startedAt, detail: t('org.kept', { kept: count('page', keep.length), total: st.pages.length }),
    });
  } catch (e) { fail(st, ctx, e); }
}

/* =========================================================
   Compress
   ========================================================= */
export const compress = {
  id: 'compress', group: 'optimize', accept: 'pdf', multiple: false,
  init: () => ({ file: null, level: 'rec', error: null, result: null, output: null, loading: null }),
  addFiles(st, files, ctx) { return loadSingle(st, files, ctx); },
  render(root, st, ctx) {
    root.append(toolHeader('compress'));
    commonNotices(root, st);
    if (!st.file) { root.append(singleDrop(st, ctx, this)); return; }
    root.append(fileHeader(st.file, () => ctx.reset()));
    root.append(optionsPanel(segmented({
      label: t('cmp.level'), value: st.level,
      options: [
        { value: 'light', label: t('cmp.light'), desc: t('cmp.light.d') },
        { value: 'rec', label: t('cmp.rec'), desc: t('cmp.rec.d') },
        { value: 'strong', label: t('cmp.strong'), desc: t('cmp.strong.d') },
      ],
      onChange: (v) => { st.level = v; st.result = null; st.output = null; },
    })));
    const bar = actionBar({ label: t('act.compress'), onClick: () => runCompress(st, ctx, bar) });
    root.append(bar.el);
    appendResult(root, st, ctx);
  },
};

const COMPRESS = { light: null, rec: { max: 1700, q: 0.72 }, strong: { max: 1150, q: 0.5 } };

async function runCompress(st, ctx, bar) {
  const startedAt = performance.now();
  st.error = null; st.result = null; st.output = null;
  try {
    const L = lib();
    bar.busy(t('status.working'), 0.08);
    const doc = await loadForEdit(st.file);
    const settings = COMPRESS[st.level];
    if (settings) {
      const pdfCtx = doc.context;
      const images = pdfCtx.enumerateIndirectObjects().filter(([, obj]) =>
        obj instanceof L.PDFRawStream && obj.dict.get(L.PDFName.of('Subtype')) === L.PDFName.of('Image'));
      for (let i = 0; i < images.length; i++) {
        bar.busy(t('status.working'), 0.1 + 0.8 * (i / images.length));
        const [ref, stream] = images[i];
        try {
          const replacement = await recompressImage(stream, settings, pdfCtx, L);
          if (replacement) pdfCtx.assign(ref, replacement);
        } catch (_) { /* leave this image as it is */ }
        if (i % 3 === 2) await yieldToUI();
      }
    }
    bar.busy(t('status.saving'), 0.95);
    const bytes = await doc.save({ useObjectStreams: true });
    const before = st.file.size;
    const after = bytes.length;
    if (after >= before * 0.98) {
      st.result = { message: t('res.noGain') };
      ctx.refresh();
      return;
    }
    const pct = Math.round((1 - after / before) * 100);
    await deliver(st, ctx, {
      files: [{ name: `${baseName(st.file.name)}-compressed.pdf`, blob: pdfBlob(bytes) }],
      startedAt, detail: t('res.size', { before: formatBytes(before), after: formatBytes(after), pct }),
    });
  } catch (e) { fail(st, ctx, e); }
}

function colorSpaceOk(cs, pdfCtx, L) {
  const N = (n) => L.PDFName.of(n);
  const v = pdfCtx.lookup(cs);
  if (!v) return true; // missing: JPEG data decides
  if (v === N('DeviceRGB') || v === N('DeviceGray') || v === N('CalRGB') || v === N('CalGray')) return true;
  if (v instanceof L.PDFArray && v.size() >= 2) {
    const kind = pdfCtx.lookup(v.get(0));
    if (kind === N('CalRGB') || kind === N('CalGray')) return true;
    if (kind === N('ICCBased')) {
      const icc = pdfCtx.lookup(v.get(1));
      const n = icc && icc.dict ? pdfCtx.lookup(icc.dict.get(N('N'))) : null;
      const comps = n && n.asNumber ? n.asNumber() : 0;
      return comps === 1 || comps === 3;
    }
  }
  return false;
}

async function recompressImage(stream, { max, q }, pdfCtx, L) {
  const N = (n) => L.PDFName.of(n);
  const d = stream.dict;
  const filter = pdfCtx.lookup(d.get(N('Filter')));
  const filters = filter instanceof L.PDFArray ? filter.asArray().map((f) => pdfCtx.lookup(f)) : [filter];
  if (!filters.length || filters[filters.length - 1] !== N('DCTDecode')) return null;
  if (d.get(N('Decode')) || d.get(N('ImageMask')) || d.get(N('Mask'))) return null;
  const bpc = pdfCtx.lookup(d.get(N('BitsPerComponent')));
  if (bpc && bpc.asNumber && bpc.asNumber() !== 8) return null;
  if (!colorSpaceOk(d.get(N('ColorSpace')), pdfCtx, L)) return null;
  const original = stream.contents;
  if (!original || original.length < 30 * 1024) return null;

  // Some producers wrap the JPEG in ASCII85/Flate; unwrap those first.
  let jpegBytes = original;
  const pre = filters.slice(0, -1);
  if (pre.length) {
    const textFilters = ['ASCII85Decode', 'ASCIIHexDecode', 'FlateDecode', 'LZWDecode', 'RunLengthDecode'].map(N);
    if (!pre.every((f) => textFilters.includes(f))) return null;
    const tmp = pdfCtx.obj({ Filter: pre.length === 1 ? pre[0] : pre });
    const parms = d.get(N('DecodeParms'));
    if (parms) tmp.set(N('DecodeParms'), parms);
    jpegBytes = L.decodePDFRawStream(L.PDFRawStream.of(tmp, original)).decode();
  }

  const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
  let bmp;
  try { bmp = await createImageBitmap(blob, { imageOrientation: 'none' }); } catch (_) { bmp = await createImageBitmap(blob); }
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const hgt = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = hgt;
  const g = canvas.getContext('2d', { alpha: false });
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, w, hgt);
  g.imageSmoothingQuality = 'high';
  g.drawImage(bmp, 0, 0, w, hgt);
  if (bmp.close) bmp.close();
  const outBlob = await canvasToBlob(canvas, 'image/jpeg', q);
  canvas.width = 0;
  const bytes = new Uint8Array(await outBlob.arrayBuffer());
  if (bytes.length >= original.length * 0.9) return null;

  const dict = d.clone(pdfCtx);
  dict.set(N('Width'), L.PDFNumber.of(w));
  dict.set(N('Height'), L.PDFNumber.of(hgt));
  dict.set(N('ColorSpace'), N('DeviceRGB'));
  dict.set(N('BitsPerComponent'), L.PDFNumber.of(8));
  dict.set(N('Filter'), N('DCTDecode'));
  dict.delete(N('DecodeParms'));
  dict.set(N('Length'), L.PDFNumber.of(bytes.length));
  return L.PDFRawStream.of(dict, bytes);
}

/* =========================================================
   Images to PDF
   ========================================================= */
export const img2pdf = {
  id: 'img2pdf', group: 'convert', accept: 'image', multiple: true,
  init: () => ({ images: [], pageSize: 'a4', orient: 'auto', margin: 'small', error: null, result: null, output: null }),
  addFiles(st, files, ctx) {
    st.error = null; st.result = null; st.output = null;
    for (const f of files) {
      if (!isImageFile(f)) { st.error = t('err.notImage', { name: f.name }); continue; }
      st.images.push({ id: `${Date.now()}-${Math.random()}`, name: f.name, size: f.size, file: f, url: URL.createObjectURL(f) });
    }
    ctx.refresh();
  },
  dispose(st) { st.images.forEach((im) => URL.revokeObjectURL(im.url)); },
  render(root, st, ctx) {
    root.append(toolHeader('img2pdf'));
    commonNotices(root, st);
    const add = (f) => this.addFiles(st, f, ctx);
    if (!st.images.length) {
      root.append(dropzone({ accept: IMG_ACCEPT, title: t('drop.images'), onFiles: add }));
      return;
    }
    const changed = () => { st.result = null; st.output = null; ctx.refresh(); };
    root.append(h('div', { class: 'list-head' },
      h('p', { class: 'list-summary' }, count('image', st.images.length)),
      h('p', { class: 'muted' }, t('merge.hint'))));
    const grid = h('div', { class: 'page-grid image-grid' });
    st.images.forEach((im, i) => {
      grid.append(h('div', { class: 'page-cell img-cell', draggable: 'true', dataset: { index: String(i) } },
        h('span', { class: 'page-sheet' }, h('img', { src: im.url, alt: '', draggable: 'false', loading: 'lazy' })),
        h('span', { class: 'page-label' }, h('bdi', null, im.name)),
        h('div', { class: 'page-tools' },
          iconButton('up', t('btn.moveUp'), () => { st.images = moveItem(st.images, i, i - 1); changed(); }, i === 0),
          iconButton('down', t('btn.moveDown'), () => { st.images = moveItem(st.images, i, i + 1); changed(); }, i === st.images.length - 1),
          iconButton('x', t('btn.remove'), () => { URL.revokeObjectURL(im.url); st.images.splice(i, 1); changed(); }))));
    });
    sortable(grid, '.img-cell', (from, to) => { st.images = moveItem(st.images, from, to); changed(); });
    root.append(grid);
    root.append(dropzone({ accept: IMG_ACCEPT, title: t('drop.more'), chooseLabel: t('drop.more'), compact: true, onFiles: add }));
    root.append(optionsPanel(
      selectField({ label: t('i2p.pageSize'), value: st.pageSize, options: [
        { value: 'a4', label: 'A4' }, { value: 'letter', label: 'Letter' }, { value: 'fit', label: t('i2p.fit') }],
      onChange: (v) => { st.pageSize = v; changed(); } }),
      st.pageSize !== 'fit' ? selectField({ label: t('i2p.orient'), value: st.orient, options: [
        { value: 'auto', label: t('i2p.auto') }, { value: 'portrait', label: t('i2p.portrait') }, { value: 'landscape', label: t('i2p.landscape') }],
      onChange: (v) => { st.orient = v; st.result = null; } }) : null,
      selectField({ label: t('i2p.margin'), value: st.margin, options: [
        { value: 'none', label: t('i2p.none') }, { value: 'small', label: t('i2p.small') }, { value: 'large', label: t('i2p.large') }],
      onChange: (v) => { st.margin = v; st.result = null; } })));
    const bar = actionBar({ label: t('act.img2pdf'), onClick: () => runImg2pdf(st, ctx, bar) });
    root.append(bar.el);
    appendResult(root, st, ctx);
  },
};

function jpegOrientation(b) {
  let off = 2;
  while (off + 9 < b.length) {
    if (b[off] !== 0xFF) return 1;
    const marker = b[off + 1];
    const len = (b[off + 2] << 8) | b[off + 3];
    if (marker === 0xE1 && b[off + 4] === 0x45 && b[off + 5] === 0x78 && b[off + 6] === 0x69 && b[off + 7] === 0x66) {
      const tiff = off + 10;
      const little = b[tiff] === 0x49;
      const u16 = (p) => (little ? b[p] | (b[p + 1] << 8) : (b[p] << 8) | b[p + 1]);
      const u32 = (p) => (little
        ? (b[p] | (b[p + 1] << 8) | (b[p + 2] << 16) | (b[p + 3] << 24)) >>> 0
        : ((b[p] << 24) | (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]) >>> 0);
      const ifd = tiff + u32(tiff + 4);
      if (ifd + 2 > b.length) return 1;
      const entries = u16(ifd);
      for (let i = 0; i < entries; i++) {
        const e = ifd + 2 + i * 12;
        if (e + 10 > b.length) break;
        if (u16(e) === 0x0112) return u16(e + 8) || 1;
      }
      return 1;
    }
    if (marker === 0xDA || len < 2) return 1;
    off += 2 + len;
  }
  return 1;
}

async function prepareImage(file) {
  const bytes = await readBytes(file);
  const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
  if (isJpeg && jpegOrientation(bytes) <= 1) return { bytes, kind: 'jpg' };
  if (isPng) return { bytes, kind: 'png' };
  // Phone photos with an EXIF rotation, WEBP, GIF, BMP: redraw upright.
  const bmp = await createImageBitmap(new Blob([bytes], { type: file.type || (isJpeg ? 'image/jpeg' : '') }));
  const c = document.createElement('canvas');
  c.width = bmp.width;
  c.height = bmp.height;
  const g = c.getContext('2d');
  if (isJpeg) { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); }
  g.drawImage(bmp, 0, 0);
  if (bmp.close) bmp.close();
  const type = isJpeg ? 'image/jpeg' : 'image/png';
  const blob = await canvasToBlob(c, type, 0.92);
  c.width = 0;
  return { bytes: new Uint8Array(await blob.arrayBuffer()), kind: isJpeg ? 'jpg' : 'png' };
}

const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792] };
const MARGINS = { none: 0, small: 18, large: 42 };

async function runImg2pdf(st, ctx, bar) {
  const startedAt = performance.now();
  st.error = null; st.result = null;
  try {
    const { PDFDocument } = lib();
    const out = await PDFDocument.create();
    const n = st.images.length;
    const m = MARGINS[st.margin];
    for (let i = 0; i < n; i++) {
      bar.busy(t('status.image', { i: i + 1, n }), (i + 0.5) / (n + 1));
      let prepared;
      try { prepared = await prepareImage(st.images[i].file); } catch (_) { throw new Error(t('err.notImage', { name: st.images[i].name })); }
      const img = prepared.kind === 'png' ? await out.embedPng(prepared.bytes) : await out.embedJpg(prepared.bytes);
      const iw = img.width;
      const ih = img.height;
      let pw;
      let ph;
      let dw;
      let dh;
      if (st.pageSize === 'fit') {
        const s = 842 / Math.max(iw, ih);
        dw = iw * s; dh = ih * s;
        pw = dw + 2 * m; ph = dh + 2 * m;
      } else {
        [pw, ph] = PAGE_SIZES[st.pageSize];
        const landscape = st.orient === 'landscape' || (st.orient === 'auto' && iw > ih);
        if (landscape) [pw, ph] = [ph, pw];
        const s = Math.min((pw - 2 * m) / iw, (ph - 2 * m) / ih);
        dw = iw * s; dh = ih * s;
      }
      const page = out.addPage([pw, ph]);
      page.drawImage(img, { x: (pw - dw) / 2, y: (ph - dh) / 2, width: dw, height: dh });
      await yieldToUI();
    }
    bar.busy(t('status.saving'), 0.95);
    const bytes = await out.save({ useObjectStreams: true });
    const name = n === 1 ? `${baseName(st.images[0].name)}.pdf` : `${baseName(st.images[0].name)}-and-${n - 1}-more.pdf`;
    await deliver(st, ctx, { files: [{ name, blob: pdfBlob(bytes) }], startedAt, detail: `${count('page', n)}${sep()}${formatBytes(bytes.length)}` });
  } catch (e) { fail(st, ctx, e); }
}

/* =========================================================
   PDF to images
   ========================================================= */
export const pdf2img = {
  id: 'pdf2img', group: 'convert', accept: 'pdf', multiple: false,
  init: () => ({ file: null, format: 'jpg', dpi: 150, pages: 'all', range: '', error: null, result: null, output: null, loading: null }),
  addFiles(st, files, ctx) { return loadSingle(st, files, ctx); },
  render(root, st, ctx) {
    root.append(toolHeader('pdf2img'));
    commonNotices(root, st);
    if (!st.file) { root.append(singleDrop(st, ctx, this)); return; }
    root.append(fileHeader(st.file, () => ctx.reset()));
    root.append(optionsPanel(
      segmented({ label: t('p2i.format'), value: st.format, options: [{ value: 'jpg', label: 'JPG' }, { value: 'png', label: 'PNG' }], onChange: (v) => { st.format = v; st.result = null; } }),
      selectField({ label: t('p2i.res'), value: String(st.dpi), options: [
        { value: '96', label: t('p2i.screen') }, { value: '150', label: t('p2i.print') }, { value: '300', label: t('p2i.high') }],
      onChange: (v) => { st.dpi = Number(v); st.result = null; } }),
      selectField({ label: t('p2i.pages'), value: st.pages, options: [{ value: 'all', label: t('p2i.all') }, { value: 'range', label: t('p2i.range') }],
        onChange: (v) => { st.pages = v; st.result = null; ctx.refresh(); } }),
      st.pages === 'range' ? textField({ label: t('split.ranges'), value: st.range, placeholder: t('split.ranges.ph'), dir: 'ltr', onInput: (v) => { st.range = v; } }) : null));
    const bar = actionBar({ label: t('act.pdf2img'), onClick: () => runPdf2img(st, ctx, bar) });
    root.append(bar.el);
    appendResult(root, st, ctx);
  },
};

async function runPdf2img(st, ctx, bar) {
  const startedAt = performance.now();
  st.error = null; st.result = null;
  const n = st.file.pageCount;
  let indices;
  if (st.pages === 'range') {
    const groups = parseRanges(st.range, n);
    if (!groups) { st.error = t('split.badRanges', { pages: count('page', n) }); ctx.refresh(); return; }
    indices = [...new Set(groups.flat())];
  } else {
    indices = Array.from({ length: n }, (_, i) => i);
  }
  try {
    const base = baseName(st.file.name);
    const pad = String(n).length;
    const mime = st.format === 'png' ? 'image/png' : 'image/jpeg';
    const files = [];
    for (let k = 0; k < indices.length; k++) {
      const i = indices[k];
      bar.busy(t('status.page', { i: k + 1, n: indices.length }), (k + 0.5) / (indices.length + 1));
      const page = await st.file.pdf.getPage(i + 1);
      const canvas = await renderPage(page, { scale: st.dpi / 72 });
      const blob = await canvasToBlob(canvas, mime, 0.9);
      canvas.width = 0;
      files.push({ name: `${base}-${String(i + 1).padStart(pad, '0')}.${st.format}`, blob });
      page.cleanup();
    }
    await deliver(st, ctx, { files, zipName: `${base}-images.zip`, kind: 'image', startedAt, detail: count('image', files.length) });
  } catch (e) { fail(st, ctx, e); }
}

/* =========================================================
   Page numbers
   ========================================================= */
const PN_SIZES = { small: 9, medium: 11, large: 14 };

function pnLabel(st, n, total) {
  const dig = (v) => (st.digits === 'arabic' ? toArabicDigits(v) : String(v));
  switch (st.format) {
    case 'slash': return `${dig(n)} / ${dig(total)}`;
    case 'pageEn': return `Page ${dig(n)} of ${dig(total)}`;
    case 'pageAr': return `صفحة ${dig(n)} من ${dig(total)}`;
    default: return dig(n);
  }
}

export const pagenum = {
  id: 'pagenum', group: 'stamp', accept: 'pdf', multiple: false,
  init: () => ({ file: null, position: 'bc', format: 'n', digits: getLang() === 'ar' ? 'arabic' : 'western', start: 1, skipFirst: false, size: 'medium', error: null, result: null, output: null, loading: null }),
  addFiles(st, files, ctx) { return loadSingle(st, files, ctx); },
  render(root, st, ctx) {
    root.append(toolHeader('pagenum'));
    commonNotices(root, st);
    if (!st.file) { root.append(singleDrop(st, ctx, this)); return; }
    root.append(fileHeader(st.file, () => ctx.reset()));
    const total = st.file.pageCount - (st.skipFirst ? 1 : 0) + st.start - 1;
    const sample = pnLabel(st, st.start, Math.max(st.start, total));
    const holder = h('div', { class: 'thumb' });
    lazyThumb(holder, st.file.pdf, st.skipFirst && st.file.pageCount > 1 ? 1 : 0, 220);
    const preview = h('div', { class: 'preview' },
      h('div', { class: 'preview-sheet' }, holder,
        h('span', { class: `pn-mark pos-${st.position} size-${st.size}`, dir: 'auto' }, sample)),
      h('p', { class: 'muted preview-cap' }, t('w.preview')));
    const upd = () => { st.result = null; st.output = null; ctx.refresh(); };
    const formatOpts = [
      { value: 'n', label: pnLabel({ ...st, format: 'n' }, 1, 12) },
      { value: 'slash', label: pnLabel({ ...st, format: 'slash' }, 1, 12) },
      { value: 'pageEn', label: pnLabel({ ...st, format: 'pageEn' }, 1, 12) },
      { value: 'pageAr', label: pnLabel({ ...st, format: 'pageAr' }, 1, 12) },
    ];
    const opts = optionsPanel(
      selectField({ label: t('pn.position'), value: st.position, options: ['bc', 'br', 'bl', 'tc', 'tr', 'tl'].map((v) => ({ value: v, label: t(`pn.${v}`) })), onChange: (v) => { st.position = v; upd(); } }),
      selectField({ label: t('pn.format'), value: st.format, options: formatOpts, onChange: (v) => { st.format = v; upd(); } }),
      segmented({ label: t('pn.digits'), value: st.digits, options: [{ value: 'western', label: '1 2 3' }, { value: 'arabic', label: '١ ٢ ٣' }], onChange: (v) => { st.digits = v; upd(); } }),
      selectField({ label: t('pn.size'), value: st.size, options: ['small', 'medium', 'large'].map((v) => ({ value: v, label: t(`sz.${v}`) })), onChange: (v) => { st.size = v; upd(); } }),
      numberField({ label: t('pn.start'), value: st.start, min: 0, max: 99999, onInput: (v) => { if (Number.isFinite(v) && v >= 0) { st.start = Math.floor(v); st.result = null; } } }),
      checkField({ label: t('pn.skipFirst'), checked: st.skipFirst, onChange: (v) => { st.skipFirst = v; upd(); } }));
    root.append(h('div', { class: 'split-view' }, opts, preview));
    const bar = actionBar({ label: t('act.pagenum'), onClick: () => runPagenum(st, ctx, bar) });
    root.append(bar.el);
    appendResult(root, st, ctx);
  },
};

async function runPagenum(st, ctx, bar) {
  const startedAt = performance.now();
  st.error = null; st.result = null;
  try {
    const { degrees } = lib();
    const doc = await loadForEdit(st.file);
    const pages = doc.getPages();
    const first = st.skipFirst ? 1 : 0;
    const total = pages.length - first + st.start - 1;
    const pt = PN_SIZES[st.size];
    const scale = 4;
    const margin = 28;
    const color = '#1f2937';
    for (let i = first; i < pages.length; i++) {
      if ((i - first) % 4 === 0) bar.busy(t('status.page', { i: i + 1, n: pages.length }), (i + 1) / (pages.length + 1));
      const label = pnLabel(st, st.start + (i - first), total);
      const png = await textPng(label, { px: pt * scale, color, weight: 500 });
      const img = await doc.embedPng(png.bytes);
      const w = png.w / scale;
      const hgt = png.h / scale;
      const page = pages[i];
      const box = visualBox(page);
      const pos = st.position;
      const u = pos.endsWith('c') ? (box.vw - w) / 2 : pos.endsWith('r') ? box.vw - margin - w : margin;
      const v = pos.startsWith('b') ? margin - hgt * 0.25 : box.vh - margin - hgt * 0.75;
      const p = box.toPdf(u, v);
      page.drawImage(img, { x: p.x, y: p.y, width: w, height: hgt, rotate: degrees(box.rot) });
      if (i % 10 === 9) await yieldToUI();
    }
    bar.busy(t('status.saving'), 0.95);
    const bytes = await doc.save({ useObjectStreams: true });
    await deliver(st, ctx, { files: [{ name: `${baseName(st.file.name)}-numbered.pdf`, blob: pdfBlob(bytes) }], startedAt, detail: formatBytes(bytes.length) });
  } catch (e) { fail(st, ctx, e); }
}

/* =========================================================
   Watermark
   ========================================================= */
const WM_COLORS = { gray: '#6b7280', red: '#c62828', blue: '#2846c4' };
const WM_SIZES = { small: 0.38, medium: 0.58, large: 0.78 };

export const watermark = {
  id: 'watermark', group: 'stamp', accept: 'pdf', multiple: false,
  init: () => ({ file: null, text: '', layout: 'diagonal', color: 'gray', opacity: 0.22, size: 'medium', error: null, result: null, output: null, loading: null }),
  addFiles(st, files, ctx) { return loadSingle(st, files, ctx, () => { if (!st.text) st.text = t('wm.default'); }); },
  render(root, st, ctx) {
    root.append(toolHeader('watermark'));
    commonNotices(root, st);
    if (!st.file) { root.append(singleDrop(st, ctx, this)); return; }
    root.append(fileHeader(st.file, () => ctx.reset()));
    const holder = h('div', { class: 'thumb' });
    lazyThumb(holder, st.file.pdf, 0, 220);
    const mark = h('span', { class: `wm-mark layout-${st.layout} size-${st.size}`, dir: 'auto' }, st.text);
    mark.style.color = WM_COLORS[st.color];
    mark.style.opacity = String(st.opacity);
    const preview = h('div', { class: 'preview' },
      h('div', { class: 'preview-sheet' }, holder, h('span', { class: 'wm-layer' }, mark)),
      h('p', { class: 'muted preview-cap' }, t('w.preview')));
    const upd = () => { st.result = null; st.output = null; ctx.refresh(); };
    const opts = optionsPanel(
      textField({ label: t('wm.text'), value: st.text, onInput: (v) => { st.text = v; mark.textContent = v; st.result = null; } }),
      segmented({ label: t('wm.layout'), value: st.layout, options: [{ value: 'diagonal', label: t('wm.diagonal') }, { value: 'horizontal', label: t('wm.horizontal') }], onChange: (v) => { st.layout = v; upd(); } }),
      segmented({ label: t('wm.color'), value: st.color, options: [{ value: 'gray', label: t('wm.gray') }, { value: 'red', label: t('wm.red') }, { value: 'blue', label: t('wm.blue') }], onChange: (v) => { st.color = v; upd(); } }),
      selectField({ label: t('pn.size'), value: st.size, options: ['small', 'medium', 'large'].map((v) => ({ value: v, label: t(`sz.${v}`) })), onChange: (v) => { st.size = v; upd(); } }),
      rangeField({ label: t('wm.opacity'), value: st.opacity, min: 0.08, max: 0.6, step: 0.02, format: (v) => `${Math.round(v * 100)}%`, onInput: (v) => { st.opacity = v; mark.style.opacity = String(v); st.result = null; } }));
    root.append(h('div', { class: 'split-view' }, opts, preview));
    const bar = actionBar({ label: t('act.watermark'), onClick: () => runWatermark(st, ctx, bar) });
    root.append(bar.el);
    appendResult(root, st, ctx);
  },
};

async function runWatermark(st, ctx, bar) {
  const startedAt = performance.now();
  const text = (st.text || '').trim();
  if (!text) { st.error = t('wm.needText'); ctx.refresh(); return; }
  st.error = null; st.result = null;
  try {
    const { degrees } = lib();
    const doc = await loadForEdit(st.file);
    bar.busy(t('status.working'), 0.1);
    const png = await textPng(text, { px: 220, color: WM_COLORS[st.color], weight: 700 });
    const img = await doc.embedPng(png.bytes);
    const pages = doc.getPages();
    pages.forEach((page, i) => {
      const box = visualBox(page);
      const diagonal = st.layout === 'diagonal';
      const alpha = diagonal ? (Math.atan2(box.vh, box.vw) * 180) / Math.PI : 0;
      const span = diagonal ? Math.hypot(box.vw, box.vh) : box.vw;
      const w = span * WM_SIZES[st.size];
      const hgt = w * (png.h / png.w);
      const a = (alpha * Math.PI) / 180;
      const cu = box.vw / 2 - ((w / 2) * Math.cos(a) - (hgt / 2) * Math.sin(a));
      const cv = box.vh / 2 - ((w / 2) * Math.sin(a) + (hgt / 2) * Math.cos(a));
      const p = box.toPdf(cu, cv);
      page.drawImage(img, { x: p.x, y: p.y, width: w, height: hgt, rotate: degrees(box.rot + alpha), opacity: st.opacity });
      if (i % 20 === 0) bar.busy(t('status.page', { i: i + 1, n: pages.length }), (i + 1) / (pages.length + 1));
    });
    bar.busy(t('status.saving'), 0.95);
    const bytes = await doc.save({ useObjectStreams: true });
    await deliver(st, ctx, { files: [{ name: `${baseName(st.file.name)}-watermarked.pdf`, blob: pdfBlob(bytes) }], startedAt, detail: formatBytes(bytes.length) });
  } catch (e) { fail(st, ctx, e); }
}

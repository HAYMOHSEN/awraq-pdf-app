// Awraq PDF — Pro tools: PDF → Word (Arabic-aware) and OCR
import { t, count, formatBytes, sep } from './i18n.js';
import { h, baseName, isImageFile, isPdfFile, loadScript, hasArabic, FREE_PRO_PAGES } from './util.js';
import { renderPage, lazyThumb } from './pdfjs.js';
import { ICONS, icon, toolHeader, dropzone, notice, actionBar, resultCard, selectField, checkField, optionsPanel, toast } from './ui.js';
import { userMessage, loadPdf, disposeEntry, fileHeader, deliver, saveAgain } from './docs.js';
import { extractPages, buildDocx, buildText, paragraphsFromPlainText } from './arabic.js';

const ARABIC_FONTS = ['Arial', 'Sakkal Majalla', 'Traditional Arabic', 'Simplified Arabic', 'Tahoma', 'Segoe UI'];
const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';

function trialNotice(ctx, total) {
  if (ctx.isPro() || total <= FREE_PRO_PAGES) return null;
  return notice(
    t('pro.trial', { count: count('page', FREE_PRO_PAGES), total: count('page', total) }),
    'pro',
    h('button', { type: 'button', class: 'btn btn-saffron btn-sm', onclick: () => ctx.openPro() }, t('pro.get')));
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

function fontField(st) {
  return selectField({
    label: t('w.font'), value: st.font,
    options: ARABIC_FONTS.map((f) => ({ value: f, label: f })),
    onChange: (v) => { st.font = v; st.result = null; st.output = null; },
  });
}

/* =========================================================
   PDF → Word
   ========================================================= */
export const pdf2word = {
  id: 'pdf2word', group: 'arabic', accept: 'pdf', multiple: false, pro: true,
  init: () => ({ file: null, flipWords: false, flipLetters: false, keepLines: false, font: 'Arial', preview: null, previewBusy: false, error: null, result: null, output: null, loading: null }),
  async addFiles(st, files, ctx) {
    const file = files.find(isPdfFile) || files[0];
    st.error = null; st.result = null; st.output = null; st.preview = null;
    st.loading = file.name;
    ctx.refresh();
    try {
      const entry = await loadPdf(file);
      disposeEntry(st.file);
      st.file = entry;
    } catch (e) { st.error = userMessage(e); }
    st.loading = null;
    if (st.file) await refreshPreview(st, ctx); else ctx.refresh();
  },
  render(root, st, ctx) {
    root.append(toolHeader('pdf2word', { pro: true }));
    if (st.error) root.append(notice(st.error, 'error'));
    if (st.loading) root.append(notice(t('status.reading', { name: st.loading })));
    if (!st.file) {
      root.append(dropzone({ accept: '.pdf,application/pdf', multiple: false, title: t('drop.pdfOne'), onFiles: (f) => this.addFiles(st, f, ctx) }));
      return;
    }
    const tn = trialNotice(ctx, st.file.pageCount);
    if (tn) root.append(tn);
    root.append(fileHeader(st.file, () => ctx.reset()));

    const opt = (key) => (v) => { st[key] = v; st.result = null; st.output = null; refreshPreview(st, ctx); };
    const opts = optionsPanel(
      checkField({ label: t('w.flipWords'), checked: st.flipWords, onChange: opt('flipWords') }),
      checkField({ label: t('w.flipLetters'), checked: st.flipLetters, onChange: opt('flipLetters') }),
      checkField({ label: t('w.keepLines'), checked: st.keepLines, onChange: opt('keepLines') }),
      fontField(st));

    const pv = h('div', { class: 'text-preview', tabindex: '0', 'aria-label': t('w.preview'), 'aria-busy': String(st.previewBusy) });
    let anyText = false;
    if (st.preview) {
      st.preview.forEach((pg, k) => {
        if (k > 0) pv.append(h('hr', { class: 'page-rule' }));
        if (pg.hasText) anyText = true;
        pg.paragraphs.forEach((p) => {
          const tag = p.kind === 'h1' ? 'h3' : p.kind === 'h2' ? 'h4' : 'p';
          pv.append(h(tag, { dir: p.dir }, p.text));
        });
      });
    }
    const previewNote = st.preview
      ? t('w.previewNote', { count: count('page', st.preview.length) })
      : t('status.working');
    root.append(h('div', { class: 'split-view split-wide' },
      opts,
      h('section', { class: 'preview-text' },
        h('div', { class: 'preview-head' }, h('h2', { class: 'field-label' }, t('w.preview')), h('p', { class: 'muted' }, previewNote)),
        pv)));

    if (st.preview && !anyText) {
      root.append(notice(t('w.allScanned'), 'warn',
        h('button', { type: 'button', class: 'btn btn-quiet btn-sm', onclick: () => ctx.goTool('ocr', [st.file.file]) }, icon('ocr'), t('w.openOcr'))));
    }
    const txtBtn = h('button', { type: 'button', class: 'btn btn-quiet btn-lg', onclick: () => runPdf2word(st, ctx, bar, 'txt') }, t('act.pdf2txt'));
    const bar = actionBar({ label: t('act.pdf2word'), onClick: () => runPdf2word(st, ctx, bar, 'docx'), secondary: [txtBtn] });
    root.append(bar.el);
    appendResult(root, st, ctx);
  },
};

async function refreshPreview(st, ctx) {
  if (!st.file) return;
  st.previewBusy = true;
  ctx.refresh();
  try {
    const n = Math.min(2, st.file.pageCount);
    st.preview = await extractPages(st.file.pdf, Array.from({ length: n }, (_, i) => i), {
      flipWords: st.flipWords, flipLetters: st.flipLetters, keepLines: st.keepLines,
    });
  } catch (e) {
    st.error = userMessage(e);
  }
  st.previewBusy = false;
  ctx.refresh();
}

async function runPdf2word(st, ctx, bar, format) {
  const startedAt = performance.now();
  st.error = null; st.result = null;
  try {
    const n = st.file.pageCount;
    const limit = ctx.isPro() ? n : Math.min(n, FREE_PRO_PAGES);
    const indices = Array.from({ length: limit }, (_, i) => i);
    const pages = await extractPages(st.file.pdf, indices, {
      flipWords: st.flipWords, flipLetters: st.flipLetters, keepLines: st.keepLines,
    }, (i, total) => bar.busy(t('status.page', { i, n: total }), i / (total + 1)));
    const empty = pages.filter((p) => !p.hasText).length;
    if (empty === pages.length) { st.error = t('w.allScanned'); ctx.refresh(); return; }
    bar.busy(t('status.saving'), 0.95);
    const base = baseName(st.file.name);
    const blob = format === 'txt'
      ? buildText(pages, { keepLines: st.keepLines })
      : await buildDocx(pages, { arabicFont: st.font, title: base });
    const details = [count('page', limit)];
    if (empty) details.push(t('w.noText', { count: count('page', empty) }));
    await deliver(st, ctx, {
      files: [{ name: `${base}.${format === 'txt' ? 'txt' : 'docx'}`, blob }],
      startedAt, detail: details.join(sep()),
    });
  } catch (e) {
    st.error = userMessage(e);
    ctx.refresh();
  }
}

/* =========================================================
   OCR
   ========================================================= */
export const ocr = {
  id: 'ocr', group: 'arabic', accept: 'any', multiple: true, pro: true,
  init: () => ({ pdf: null, images: [], lang: 'ara+eng', text: '', keepLines: false, font: 'Arial', error: null, result: null, output: null, loading: null }),
  async addFiles(st, files, ctx) {
    st.error = null; st.result = null; st.output = null;
    const pdfFile = files.find(isPdfFile);
    if (pdfFile) {
      st.loading = pdfFile.name;
      ctx.refresh();
      try {
        const entry = await loadPdf(pdfFile);
        disposeEntry(st.pdf);
        this.clearImages(st);
        st.pdf = entry;
        st.text = '';
      } catch (e) { st.error = userMessage(e); }
      st.loading = null;
    } else {
      for (const f of files) {
        if (!isImageFile(f)) { st.error = t('err.notImage', { name: f.name }); continue; }
        if (st.pdf) { disposeEntry(st.pdf); st.pdf = null; }
        st.images.push({ name: f.name, file: f, url: URL.createObjectURL(f) });
      }
      st.text = '';
    }
    ctx.refresh();
  },
  clearImages(st) { st.images.forEach((im) => URL.revokeObjectURL(im.url)); st.images = []; },
  dispose(st) { this.clearImages(st); disposeEntry(st.pdf); },
  render(root, st, ctx) {
    root.append(toolHeader('ocr', { pro: true }));
    if (st.error) root.append(notice(st.error, 'error'));
    if (st.loading) root.append(notice(t('status.reading', { name: st.loading })));
    const add = (f) => this.addFiles(st, f, ctx);
    if (!st.pdf && !st.images.length) {
      root.append(dropzone({ accept: '.pdf,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.bmp,image/*', title: t('drop.any'), onFiles: add }));
      root.append(h('p', { class: 'muted fine-print' }, t('ocr.firstRun')));
      return;
    }
    const total = st.pdf ? st.pdf.pageCount : st.images.length;
    const tn = trialNotice(ctx, total);
    if (tn) root.append(tn);
    if (st.pdf) {
      root.append(fileHeader(st.pdf, () => ctx.reset()));
    } else {
      const strip = h('div', { class: 'image-strip' });
      st.images.forEach((im) => strip.append(h('img', { src: im.url, alt: '', title: im.name })));
      root.append(h('div', { class: 'file-head sheet-flat' },
        strip,
        h('div', { class: 'file-meta' }, h('p', { class: 'file-name' }, count('image', st.images.length))),
        h('button', { type: 'button', class: 'btn btn-quiet', onclick: () => ctx.reset() }, icon('x'), t('btn.another'))));
    }
    root.append(optionsPanel(
      selectField({ label: t('ocr.lang'), value: st.lang, options: [
        { value: 'ara+eng', label: t('ocr.araeng') }, { value: 'ara', label: t('ocr.ara') }, { value: 'eng', label: t('ocr.eng') }],
      onChange: (v) => { st.lang = v; } }),
      h('p', { class: 'muted field-help' }, t('ocr.firstRun'))));
    const bar = actionBar({ label: t('act.ocr'), onClick: () => runOcr(st, ctx, bar) });
    root.append(bar.el);

    if (st.text) {
      const r = (st.text.match(/[\u0600-\u06FF]/g) || []).length;
      const l = (st.text.match(/[A-Za-z]/g) || []).length;
      const area = h('textarea', { class: 'ocr-text', dir: r > l ? 'rtl' : 'ltr', spellcheck: 'false', 'aria-label': t('ocr.result') });
      area.value = st.text;
      area.addEventListener('input', () => { st.text = area.value; st.result = null; st.output = null; });
      const copyBtn = h('button', { type: 'button', class: 'btn btn-quiet', onclick: async () => {
        try { await navigator.clipboard.writeText(st.text); toast(t('w.copied')); } catch (_) { area.select(); document.execCommand('copy'); toast(t('w.copied')); }
      } }, icon('copy'), t('btn.copy'));
      const wordBtn = h('button', { type: 'button', class: 'btn btn-primary', onclick: () => saveOcr(st, ctx, 'docx') }, t('act.ocrWord'));
      const txtBtn = h('button', { type: 'button', class: 'btn btn-quiet', onclick: () => saveOcr(st, ctx, 'txt') }, t('act.ocrTxt'));
      root.append(h('section', { class: 'ocr-result' },
        h('div', { class: 'preview-head' }, h('h2', { class: 'field-label' }, t('ocr.result')), h('p', { class: 'muted' }, t('ocr.editHint'))),
        area,
        h('div', { class: 'ocr-actions' },
          h('div', { class: 'ocr-export-opts' },
            checkField({ label: t('w.keepLines'), checked: st.keepLines, onChange: (v) => { st.keepLines = v; st.result = null; } }),
            fontField(st)),
          h('div', { class: 'action-buttons' }, copyBtn, txtBtn, wordBtn))));
    }
    appendResult(root, st, ctx);
  },
};

async function imageToCanvas(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 3500 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  const g = c.getContext('2d', { alpha: false });
  g.fillStyle = '#fff';
  g.fillRect(0, 0, c.width, c.height);
  g.drawImage(bmp, 0, 0, c.width, c.height);
  if (bmp.close) bmp.close();
  return c;
}

function cleanOcrText(s) {
  return String(s || '')
    .replace(/\r/g, '')
    .split('\n').map((ln) => ln.replace(/[ \t]+/g, ' ').trim()).join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function runOcr(st, ctx, bar) {
  st.error = null; st.result = null; st.output = null;
  const pro = ctx.isPro();
  let sources;
  if (st.pdf) {
    const n = st.pdf.pageCount;
    const lim = pro ? n : Math.min(n, FREE_PRO_PAGES);
    sources = Array.from({ length: lim }, (_, i) => async () => {
      const page = await st.pdf.pdf.getPage(i + 1);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(300 / 72, 3300 / Math.max(base.width, base.height));
      const c = await renderPage(page, { scale });
      page.cleanup();
      return c;
    });
  } else {
    const lim = pro ? st.images.length : Math.min(st.images.length, FREE_PRO_PAGES);
    sources = st.images.slice(0, lim).map((im) => () => imageToCanvas(im.file));
  }
  let current = 0;
  const total = sources.length;
  bar.busy(t('ocr.loading'), 0.02);
  let worker;
  try {
    await loadScript(TESSERACT_URL);
    if (!window.Tesseract) throw new Error('network');
    worker = await window.Tesseract.createWorker(st.lang, 1, {
      logger: (m) => {
        if (m && m.status === 'recognizing text' && typeof m.progress === 'number') {
          bar.busy(t('ocr.progress', { i: current + 1, n: total }), (current + m.progress) / total);
        }
      },
    });
    await worker.setParameters({ preserve_interword_spaces: '1' });
  } catch (e) {
    st.error = (!navigator.onLine || (e && /network|fetch|load/i.test(e.message || ''))) ? t('ocr.offline') : userMessage(e);
    ctx.refresh();
    return;
  }
  try {
    const parts = [];
    for (let i = 0; i < total; i++) {
      current = i;
      bar.busy(t('ocr.progress', { i: i + 1, n: total }), i / total);
      const canvas = await sources[i]();
      const { data } = await worker.recognize(canvas);
      canvas.width = 0;
      parts.push(cleanOcrText(data && data.text));
    }
    st.text = parts.map((p, i) => (i > 0 ? `--- ${i + 1} ---\n${p}` : p)).join('\n\n');
  } catch (e) {
    st.error = userMessage(e);
  } finally {
    try { await worker.terminate(); } catch (_) { /* ignore */ }
  }
  ctx.refresh();
}

async function saveOcr(st, ctx, format) {
  const startedAt = performance.now();
  const base = baseName(st.pdf ? st.pdf.name : (st.images[0] && st.images[0].name) || 'ocr');
  const pages = paragraphsFromPlainText(st.text, { keepLines: st.keepLines });
  const blob = format === 'txt'
    ? new Blob(['\uFEFF' + st.text.replace(/^\s*[-—–]{2,}\s*[\d٠-٩]+\s*[-—–]{2,}\s*$/gm, '').replace(/\n{3,}/g, '\n\n') + '\n'], { type: 'text/plain' })
    : await buildDocx(pages, { arabicFont: st.font, title: base });
  await deliver(st, ctx, {
    files: [{ name: `${base}-ocr.${format === 'txt' ? 'txt' : 'docx'}`, blob }],
    startedAt, detail: formatBytes(blob.size),
  });
}

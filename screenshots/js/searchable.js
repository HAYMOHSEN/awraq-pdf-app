// Awraq PDF — searchable PDF: the original pages, untouched, plus an invisible
// text layer built from the OCR word boxes. Text is drawn with a glyphless font
// (render mode 3), so nothing changes visually while search, select and copy work.
import { loadForEdit, pdfBlob } from './docs.js';
import { visualBox, prepareImage } from './tools-pdf.js';

const GLYPHLESS_TTF_B64 = 'AAEAAAAKAIAAAwAgT1MvMkT/RUAAAAEoAAAAYGNtYXAADABzAAABkAAAADRnbHlmAAAAAAAAAcwAAAABaGVhZCzmsXIAAACsAAAANmhoZWED6QH2AAAA5AAAACRobXR4AfQAAAAAAYgAAAAGbG9jYQAAAAAAAAHEAAAABm1heHAAAwACAAABCAAAACBuYW1lGZ8ZNAAAAdAAAABycG9zdJ5/ds8AAAJEAAAALQABAAAAAQAARbeKtV8PPPUAAwPoAAAAAOboOEkAAAAA5ug4SQAAAAAAAAAAAAAAAwACAAAAAAAAAAEAAAPoAAAAAAH0AAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAEAAAACAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAwH0AZAABQAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAPz8/PwAAACAAIAPoAAAAAAPoAAAAAAAAAAAAAAAAAAAAAAAgAAAB9AAAAAAAAAAAAAIAAAADAAAAFAADAAEAAAAUAAQAIAAAAAQABAABAAAAIP//AAAAIP///+EAAQAAAAAAAAAAAAAAAAAAAAAAAAAEADYAAQAAAAAAAQANAAAAAQAAAAAAAgAHAA0AAwABBAkAAQAaABQAAwABBAkAAgAOAC5HbHlwaExlc3NGb250UmVndWxhcgBHAGwAeQBwAGgATABlAHMAcwBGAG8AbgB0AFIAZQBnAHUAbABhAHIAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAECBmdseXBoMQAAAA==';

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const RTL_CHAR = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC]/;
const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('ar', { granularity: 'grapheme' }) : null;
const graphemes = (s) => (seg ? Array.from(seg.segment(s), (g) => g.segment) : Array.from(s));

/**
 * PDF viewers assume text is painted in visual (left-to-right) order and run
 * the bidi algorithm when extracting it, so Arabic must be stored reversed —
 * exactly as every real Arabic PDF stores it. Digits and Latin stay as they are.
 */
export function toVisual(word) {
  if (!RTL_CHAR.test(word)) return word;
  const runs = [];
  for (const g of graphemes(word)) {
    const rtl = RTL_CHAR.test(g);
    const last = runs[runs.length - 1];
    if (last && last.rtl === rtl) last.parts.push(g); else runs.push({ rtl, parts: [g] });
  }
  return runs.reverse().map((r) => (r.rtl ? r.parts.reverse().join('') : r.parts.join(''))).join('');
}

function utf16Hex(str) {
  let hex = '';
  for (let i = 0; i < str.length; i++) hex += str.charCodeAt(i).toString(16).padStart(4, '0');
  return hex;
}

const TO_UNICODE = [
  '/CIDInit /ProcSet findresource begin', '12 dict begin', 'begincmap',
  '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def',
  '/CMapName /Adobe-Identity-UCS def', '/CMapType 2 def',
  '1 begincodespacerange', '<0000> <FFFF>', 'endcodespacerange',
  '1 beginbfrange', '<0000> <FFFF> <0000>', 'endbfrange',
  'endcmap', 'CMapName currentdict /CMap defineresource pop', 'end', 'end',
].join('\n');

/** Register the glyphless Type0 font once per document; returns its ref. */
export function installGlyphlessFont(doc) {
  const L = window.PDFLib;
  const ctx = doc.context;
  const ttf = b64ToBytes(GLYPHLESS_TTF_B64);
  const fontFileRef = ctx.register(ctx.flateStream(ttf, { Length1: ttf.length }));
  const descriptorRef = ctx.register(ctx.obj({
    Type: 'FontDescriptor', FontName: 'GlyphLessFont', Flags: 4, FontBBox: [0, 0, 500, 1000],
    ItalicAngle: 0, Ascent: 1000, Descent: 0, CapHeight: 1000, StemV: 80, FontFile2: fontFileRef,
  }));
  const cidToGid = new Uint8Array(65536 * 2);
  for (let i = 1; i < cidToGid.length; i += 2) cidToGid[i] = 1;
  const cidToGidRef = ctx.register(ctx.flateStream(cidToGid));
  const cidFontRef = ctx.register(ctx.obj({
    Type: 'Font', Subtype: 'CIDFontType2', BaseFont: 'GlyphLessFont',
    CIDSystemInfo: { Registry: L.PDFString.of('Adobe'), Ordering: L.PDFString.of('Identity'), Supplement: 0 },
    FontDescriptor: descriptorRef, DW: 500, CIDToGIDMap: cidToGidRef,
  }));
  const toUnicodeRef = ctx.register(ctx.flateStream(TO_UNICODE));
  return ctx.register(ctx.obj({
    Type: 'Font', Subtype: 'Type0', BaseFont: 'GlyphLessFont', Encoding: 'Identity-H',
    DescendantFonts: [cidFontRef], ToUnicode: toUnicodeRef,
  }));
}

/**
 * Draw the OCR words invisibly on a page.
 * lines: [{ y0, y1, words: [{ text, x0, y0, x1, y1, baseline }] }] in OCR-canvas pixels.
 * k: points per canvas pixel; map(x, y): canvas pixel (top-left origin) → PDF point; rot: page /Rotate.
 */
export function addTextLayer(page, fontRef, lines, { k, map }, rot = 0) {
  const L = window.PDFLib;
  const fontName = page.node.newFontDictionary('GlyphLess', fontRef);
  const rad = (rot * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const ops = [L.pushGraphicsState(), L.beginText(), L.setTextRenderingMode(L.TextRenderingMode.Invisible)];
  let count = 0;
  for (const line of lines) {
    const words = (line.words || []).filter((w) => w.text && w.text.trim());
    if (!words.length) continue;
    const size = Math.max(2, (line.y1 - line.y0) * k);
    ops.push(L.setFontAndSize(fontName, size));
    words.forEach((w, i) => {
      const clean = w.text.trim();
      const text = toVisual(clean) + (i < words.length - 1 ? ' ' : '');
      const widthPt = Math.max(0.5, (w.x1 - w.x0) * k);
      const tz = (100 * widthPt) / (clean.length * 0.5 * size);
      const baseline = Number.isFinite(w.baseline) ? w.baseline : (Number.isFinite(line.baseline) ? line.baseline : w.y1 - (w.y1 - w.y0) * 0.15);
      const p = map(w.x0, baseline);
      ops.push(L.setCharacterSqueeze(tz), L.setTextMatrix(c, s, -s, c, p.x, p.y), L.showText(L.PDFHexString.of(utf16Hex(text))));
      count++;
    });
  }
  ops.push(L.endText(), L.popGraphicsState());
  if (count) page.pushOperators(...ops);
  return count;
}

/** Turn tesseract.js output into plain line/word boxes. */
export function linesFromOcr(data) {
  const lines = [];
  const push = (ln) => {
    if (!ln || !ln.bbox || !Array.isArray(ln.words)) return;
    const base = ln.baseline && ln.baseline.has_baseline !== false && Number.isFinite(ln.baseline.y0)
      ? (ln.baseline.y0 + (Number.isFinite(ln.baseline.y1) ? ln.baseline.y1 : ln.baseline.y0)) / 2 : null;
    lines.push({
      y0: ln.bbox.y0, y1: ln.bbox.y1, baseline: base,
      words: ln.words.filter((w) => w && w.bbox).map((w) => ({
        text: w.text || '', x0: w.bbox.x0, x1: w.bbox.x1, y0: w.bbox.y0, y1: w.bbox.y1,
        baseline: w.baseline && Number.isFinite(w.baseline.y0) ? w.baseline.y0 : null,
      })),
    });
  };
  if (data && Array.isArray(data.lines) && data.lines.length) data.lines.forEach(push);
  else if (data && Array.isArray(data.blocks)) {
    data.blocks.forEach((b) => (b.paragraphs || []).forEach((p) => (p.lines || []).forEach(push)));
  }
  return lines;
}

/**
 * Build the searchable PDF.
 * pdfEntry: the source PDF entry (pages are copied as they are), or null for images.
 * ocrPages: [{ index, canvasW, canvasH, lines, file }] — one per recognized page.
 */
export async function buildSearchablePdf({ pdfEntry, ocrPages }) {
  const L = window.PDFLib;
  const out = await L.PDFDocument.create();
  const fontRef = installGlyphlessFont(out);
  if (pdfEntry) {
    const src = await loadForEdit(pdfEntry);
    const pages = await out.copyPages(src, ocrPages.map((p) => p.index));
    pages.forEach((page, i) => {
      out.addPage(page);
      const box = visualBox(page);
      const k = box.vw / ocrPages[i].canvasW;
      addTextLayer(page, fontRef, ocrPages[i].lines, { k, map: (x, y) => box.toPdf(x * k, box.vh - y * k) }, box.rot);
    });
  } else {
    for (const op of ocrPages) {
      const prepared = await prepareImage(op.file);
      const img = prepared.kind === 'png' ? await out.embedPng(prepared.bytes) : await out.embedJpg(prepared.bytes);
      const sc = 842 / Math.max(img.width, img.height);
      const W = img.width * sc;
      const H = img.height * sc;
      const page = out.addPage([W, H]);
      page.drawImage(img, { x: 0, y: 0, width: W, height: H });
      const k = W / op.canvasW;
      addTextLayer(page, fontRef, op.lines, { k, map: (x, y) => ({ x: x * k, y: H - y * k }) }, 0);
    }
  }
  return pdfBlob(await out.save({ useObjectStreams: true }));
}

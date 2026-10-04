// Awraq PDF — Arabic-aware text reconstruction and Word (.docx) writer.
//
// PDFs store positioned glyph runs, not text in reading order. pdf.js returns
// each run in logical order; this module rebuilds lines and paragraphs:
//   1. group runs into lines by baseline,
//   2. decide each line's direction from its strong characters,
//   3. order runs right-to-left for Arabic lines (left-to-right for others),
//      keeping embedded English/number sequences in their own order,
//   4. infer spaces from the gaps between runs, then join wrapped lines.

const R_LETTER = /[\u0590-\u05FF\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC]/;
const R_LETTER_G = new RegExp(R_LETTER.source, 'g');
const L_LETTER = /[A-Za-z\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF]/;
const L_LETTER_G = new RegExp(L_LETTER.source, 'g');
const ANY_DIGIT = /[0-9\u0660-\u0669\u06F0-\u06F9]/;

function countMatches(s, re) { const m = s.match(re); return m ? m.length : 0; }

/** R = has Arabic/Hebrew letters, L = Latin letters or digits only, N = neutral. */
export function classify(str) {
  if (R_LETTER.test(str)) return 'R';
  if (L_LETTER.test(str) || ANY_DIGIT.test(str)) return 'L';
  return 'N';
}

/** Presentation forms → base letters; strip characters XML and Word reject. */
export function cleanText(s) {
  return String(s)
    .replace(/[\uFB50-\uFDFF\uFE70-\uFEFE]+/g, (m) => m.normalize('NFKC'))
    .replace(/[\uFEFF\u200B]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\uFFFE\uFFFF]/g, '')
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '$1');
}

function isGarbled(s) {
  if (!s) return false;
  const bad = countMatches(s, /[\uE000-\uF8FF\uFFFD]/g);
  return bad / s.length > 0.2;
}

const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('ar', { granularity: 'grapheme' }) : null;
function reverseGraphemes(s) {
  const parts = segmenter ? Array.from(segmenter.segment(s), (x) => x.segment) : Array.from(s);
  return parts.reverse().join('');
}

/** Reverse every maximal run of `cls` items (neutrals allowed inside a run). */
export function reverseRuns(arr, cls) {
  const out = arr.slice();
  let i = 0;
  while (i < out.length) {
    if (out[i].cls !== cls) { i++; continue; }
    let j = i;
    let lastStrong = i;
    while (j + 1 < out.length && (out[j + 1].cls === cls || out[j + 1].cls === 'N')) {
      j++;
      if (out[j].cls === cls) lastStrong = j;
    }
    if (lastStrong > i) {
      const seg = out.slice(i, lastStrong + 1).reverse();
      out.splice(i, seg.length, ...seg);
    }
    i = lastStrong + 1;
  }
  return out;
}

const MIRROR = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '«': '»', '»': '«', '<': '>', '>': '<' };
/** Brackets reported as painted glyphs in a right-to-left line are mirrored back. */
export function mirrorBrackets(str) {
  return str.replace(/[()[\]{}«»<>]/g, (c) => MIRROR[c] || c);
}

const MARK_ONLY = /^[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF\u0300-\u036F\s]+$/;
const EDGE_PUNCT = /^[.,;:!?()[\]{}«»"'“”‘’\-—–،؛؟]+|[.,;:!?()[\]{}«»"'“”‘’\-—–،؛؟]+$/g;

/**
 * pdf.js hands back Latin/number runs as painted. In an Arabic line, number
 * groups and punctuation are painted right-to-left, so "06 429 4444." arrives
 * as ".4444 429 06". Latin words keep their order. This undoes that.
 */
export function unvisualizeWeak(str) {
  const raw = str.split(/(\s+)/).filter(Boolean);
  const seq = [];
  for (const part of raw) {
    if (/^\s+$/.test(part)) { seq.push({ text: part, kind: 'S' }); continue; }
    const core = part.replace(EDGE_PUNCT, '');
    if (!core) { seq.push({ text: part, kind: 'N' }); continue; }
    const i = part.indexOf(core);
    const lead = part.slice(0, i);
    const trail = part.slice(i + core.length);
    if (lead) seq.push({ text: lead, kind: 'N' });
    seq.push({ text: core, kind: L_LETTER.test(core) ? 'L' : 'E' });
    if (trail) seq.push({ text: trail, kind: 'N' });
  }
  const merged = [];
  for (let i = 0; i < seq.length; i++) {
    const e = seq[i];
    const last = merged[merged.length - 1];
    if (e.kind === 'L' && last && last.kind === 'L') { last.text += e.text; continue; }
    if (e.kind === 'S' && last && last.kind === 'L' && seq[i + 1] && seq[i + 1].kind === 'L') { last.text += e.text; continue; }
    merged.push({ ...e });
  }
  return merged.reverse().map((e) => (e.kind === 'N' ? mirrorBrackets(e.text) : e.text)).join('');
}

function attachMarks(items) {
  const marks = items.filter((it) => MARK_ONLY.test(it.str));
  if (!marks.length) return items;
  const bases = items.filter((it) => !MARK_ONLY.test(it.str));
  if (!bases.length) return items;
  for (const m of marks) {
    const mx = m.x + m.w / 2;
    let best = bases.find((b) => mx >= b.x - 0.5 && mx <= b.x + b.w + 0.5);
    if (!best) {
      let d = Infinity;
      for (const b of bases) { const dd = Math.abs(b.x + b.w / 2 - mx); if (dd < d) { d = dd; best = b; } }
    }
    best.str += m.str.trim();
  }
  return bases;
}

/** Order one line's runs (direction already decided) and join them into text. */
export function orderLine(rawItems, dir, { flipWords = false, flipLetters = false } = {}) {
  const items = attachMarks(rawItems);
  const vis = items.slice().sort((p, q) => p.x - q.x);
  vis.forEach((it, i) => { it.vi = i; });
  const gapEm = [];
  for (let i = 0; i < vis.length - 1; i++) {
    const g = vis[i + 1].x - (vis[i].x + vis[i].w);
    gapEm[i] = g / Math.max(1, Math.min(vis[i].size, vis[i + 1].size));
  }

  let logical;
  if (dir === 'rtl') {
    logical = flipWords ? vis.slice() : reverseRuns(vis.slice().reverse(), 'L');
  } else {
    logical = reverseRuns(vis.slice(), 'R');
  }

  let text = '';
  for (let i = 0; i < logical.length; i++) {
    const it = logical[i];
    let str = it.str;
    if (dir === 'rtl' && it.cls === 'L') str = unvisualizeWeak(str);
    if (dir === 'rtl' && it.cls === 'N') str = mirrorBrackets(str);
    if (flipLetters && it.cls === 'R') str = reverseGraphemes(str);
    if (i > 0) {
      const prev = logical[i - 1];
      const a = Math.min(prev.vi, it.vi);
      const b = Math.max(prev.vi, it.vi);
      let sep = ' ';
      if (b - a === 1) {
        const g = gapEm[a];
        if (g > 2.5) sep = '\t';
        else if (g < 0.12) sep = '';
      }
      if (sep === ' ' && (/\s$/.test(text) || /^\s/.test(str))) sep = '';
      text += sep;
    }
    text += str;
  }
  return text.replace(/ {2,}/g, ' ').trim();
}

function strongCounts(items) {
  let r = 0;
  let l = 0;
  for (const it of items) {
    r += countMatches(it.str, R_LETTER_G);
    l += countMatches(it.str, L_LETTER_G);
  }
  return { r, l };
}

/** pdf.js text items → ordered lines (top to bottom). */
export function itemsToLines(items, opts = {}) {
  const els = [];
  for (const it of items) {
    if (!it || typeof it.str !== 'string') continue;
    const str = cleanText(it.str);
    if (!str.trim()) continue;
    const [a, b, c, d, e, f] = it.transform;
    const size = Math.hypot(c, d) || Math.hypot(a, b) || it.height || 10;
    const w = it.width > 0 ? it.width : str.length * size * 0.5;
    els.push({ str: str.replace(/\s+/g, ' '), x: e, y: f, w, size, cls: classify(str) });
  }
  els.sort((p, q) => (q.y - p.y) || (p.x - q.x));
  const groups = [];
  for (const el of els) {
    let line = null;
    for (let k = groups.length - 1; k >= Math.max(0, groups.length - 3); k--) {
      const G = groups[k];
      const tol = Math.max(1.5, 0.45 * Math.min(G.size, el.size));
      if (Math.abs(G.y - el.y) <= tol) { line = G; break; }
    }
    if (!line) { line = { y: el.y, size: el.size, items: [] }; groups.push(line); }
    line.items.push(el);
    if (el.size > line.size) line.size = el.size;
  }
  groups.sort((p, q) => q.y - p.y);
  if (!groups.length) return [];

  for (const g of groups) {
    g.xMin = Math.min(...g.items.map((it) => it.x));
    g.xMax = Math.max(...g.items.map((it) => it.x + it.w));
    Object.assign(g, strongCounts(g.items));
  }
  const left = Math.min(...groups.map((g) => g.xMin));
  const right = Math.max(...groups.map((g) => g.xMax));
  const width = Math.max(1, right - left);
  const tol = Math.max(4, width * 0.03);
  const pageR = groups.reduce((n, g) => n + g.r, 0);
  const pageL = groups.reduce((n, g) => n + g.l, 0);
  const pageDir = pageR >= pageL ? 'rtl' : 'ltr';

  const decide = (g) => {
    const majority = () => {
      if (g.r === 0 && g.l === 0) return pageDir;
      if (g.r === 0) return 'ltr';
      if (g.l === 0) return 'rtl';
      const ratio = g.r / (g.r + g.l);
      return ratio > 0.6 ? 'rtl' : ratio < 0.4 ? 'ltr' : pageDir;
    };
    const fullWidth = (g.xMax - g.xMin) >= width * 0.9;
    if (fullWidth) return majority();
    const rightAligned = (right - g.xMax) <= tol;
    const leftAligned = (g.xMin - left) <= tol;
    if (rightAligned && !leftAligned) return g.r === 0 && g.l > 0 && pageDir === 'ltr' ? 'ltr' : 'rtl';
    if (leftAligned && !rightAligned) return g.l === 0 && g.r > 0 && pageDir === 'rtl' ? 'rtl' : 'ltr';
    return majority();
  };

  return groups
    .map((g) => {
      const dir = decide(g);
      return { text: orderLine(g.items, dir, opts), dir, y: g.y, size: g.size, xMin: g.xMin, xMax: g.xMax };
    })
    .filter((ln) => ln.text);
}

/** Join wrapped lines into paragraphs; detect headings by size. */
export function linesToParagraphs(lines, { keepLines = false } = {}) {
  if (!lines.length) return [];
  const sizes = lines.map((ln) => ln.size).sort((p, q) => p - q);
  const body = sizes[Math.floor(sizes.length / 2)];
  const left = Math.min(...lines.map((ln) => ln.xMin));
  const right = Math.max(...lines.map((ln) => ln.xMax));
  const width = Math.max(1, right - left);
  const paras = [];
  let cur = null;
  for (const ln of lines) {
    const kind = ln.size >= body * 1.45 ? 'h1' : ln.size >= body * 1.18 ? 'h2' : 'p';
    if (cur && !keepLines && cur.kind === kind && cur.dir === ln.dir) {
      const prev = cur.last;
      const gap = prev.y - ln.y;
      const close = gap > 0 && gap <= Math.max(prev.size, ln.size) * 2.2;
      const wraps = (prev.xMax - prev.xMin) >= width * 0.8;
      const sameSize = Math.abs(prev.size - ln.size) < 0.6;
      if (close && sameSize && (kind === 'p' ? wraps : true)) {
        cur.text += (cur.text.endsWith('-') && ln.dir === 'ltr') ? '' : ' ';
        cur.text += ln.text;
        cur.last = ln;
        continue;
      }
    }
    cur = { text: ln.text, dir: ln.dir, kind, last: ln };
    paras.push(cur);
  }
  return paras.map((p) => ({ text: p.text, dir: p.dir, kind: p.kind }));
}

/**
 * Extract paragraphs from the given pages of a pdf.js document.
 * Returns [{ index, paragraphs, hasText, garbled }].
 */
export async function extractPages(pdfDoc, pageIndices, opts = {}, onProgress) {
  const out = [];
  for (let k = 0; k < pageIndices.length; k++) {
    const idx = pageIndices[k];
    if (onProgress) onProgress(k + 1, pageIndices.length);
    const page = await pdfDoc.getPage(idx + 1);
    const tc = await page.getTextContent();
    const lines = itemsToLines(tc.items, opts);
    const paragraphs = linesToParagraphs(lines, opts);
    const all = paragraphs.map((p) => p.text).join(' ');
    out.push({ index: idx, paragraphs, hasText: all.trim().length > 0, garbled: isGarbled(all) });
    page.cleanup();
  }
  return out;
}

/** Plain text (one paragraph per line; blank line between paragraphs). */
export function buildText(pages, { keepLines = false } = {}) {
  const sep = keepLines ? '\n' : '\n\n';
  const body = pages.map((pg) => pg.paragraphs.map((p) => p.text).join(sep)).filter(Boolean).join('\n\n');
  return new Blob(['\uFEFF' + body + '\n'], { type: 'text/plain' });
}

/** Text typed or edited by the user (OCR) → pages of paragraphs. */
export function paragraphsFromPlainText(text, { keepLines = false } = {}) {
  const pages = [];
  let current = [];
  const flush = () => { pages.push({ paragraphs: current }); current = []; };
  const blocks = text.replace(/\r/g, '').split('\n');
  let buffer = [];
  const push = () => {
    if (!buffer.length) return;
    const lines = buffer.map((s) => s.trim()).filter(Boolean);
    buffer = [];
    if (!lines.length) return;
    const chunks = keepLines ? lines : [lines.join(' ')];
    for (const c of chunks) {
      const r = countMatches(c, R_LETTER_G);
      const l = countMatches(c, L_LETTER_G);
      current.push({ text: c, dir: r > l ? 'rtl' : 'ltr', kind: 'p' });
    }
  };
  for (const line of blocks) {
    if (/^\s*[-—–]{2,}\s*[\d٠-٩]+\s*[-—–]{2,}\s*$/.test(line)) { push(); flush(); continue; }
    if (!line.trim()) { push(); continue; }
    buffer.push(line);
  }
  push();
  if (current.length || !pages.length) flush();
  return pages.filter((p) => p.paragraphs.length);
}

/* ---------- DOCX writer ---------- */

function xml(s) {
  return cleanText(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Split a paragraph into runs of one direction; neutrals join the run before them. */
export function splitRuns(text) {
  const runs = [];
  let cur = null;
  let pending = '';
  for (const ch of text) {
    const isR = R_LETTER.test(ch);
    const isL = !isR && L_LETTER.test(ch);
    if (!isR && !isL) {
      if (cur) cur.text += ch; else pending += ch;
      continue;
    }
    if (!cur) { cur = { rtl: isR, text: pending + ch }; pending = ''; runs.push(cur); continue; }
    if (cur.rtl === isR) { cur.text += ch; continue; }
    cur = { rtl: isR, text: ch };
    runs.push(cur);
  }
  if (!cur && pending) runs.push({ rtl: false, text: pending });
  return runs;
}

function runXml(run) {
  const props = run.rtl ? '<w:rPr><w:rtl/></w:rPr>' : '';
  const pieces = run.text.split('\t');
  return pieces.map((piece, i) => {
    const tab = i > 0 ? `<w:r>${props}<w:tab/></w:r>` : '';
    return tab + (piece ? `<w:r>${props}<w:t xml:space="preserve">${xml(piece)}</w:t></w:r>` : '');
  }).join('');
}

function paragraphXml(p) {
  const style = p.kind === 'h1' ? '<w:pStyle w:val="Heading1"/>' : p.kind === 'h2' ? '<w:pStyle w:val="Heading2"/>' : '';
  const bidi = p.dir === 'rtl' ? '<w:bidi/>' : '';
  const pPr = style || bidi ? `<w:pPr>${style}${bidi}</w:pPr>` : '';
  return `<w:p>${pPr}${splitRuns(p.text).map(runXml).join('')}</w:p>`;
}

/**
 * Build a .docx Blob from pages of paragraphs.
 * options: { arabicFont, title, pageBreaks }
 */
export async function buildDocx(pages, { arabicFont = 'Arial', title = 'Document', pageBreaks = true } = {}) {
  const JSZip = window.JSZip;
  const font = xml(arabicFont);
  let rtl = 0;
  let total = 0;
  const bodyParts = [];
  pages.forEach((pg, i) => {
    if (i > 0 && pageBreaks) bodyParts.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    for (const p of pg.paragraphs) {
      total++;
      if (p.dir === 'rtl') rtl++;
      bodyParts.push(paragraphXml(p));
    }
  });
  if (!bodyParts.length) bodyParts.push('<w:p/>');
  const sectBidi = rtl > total / 2 ? '<w:bidi/>' : '';
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const decl = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

  const zip = new JSZip();
  zip.file('[Content_Types].xml', decl +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
    '</Types>');
  zip.file('_rels/.rels', decl +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
    '</Relationships>');
  zip.file('word/_rels/document.xml.rels', decl +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '</Relationships>');
  zip.file('word/styles.xml', decl +
    `<w:styles xmlns:w="${W}">` +
    '<w:docDefaults><w:rPrDefault><w:rPr>' +
    `<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="${font}"/>` +
    '<w:sz w:val="24"/><w:szCs w:val="28"/><w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="ar-SA"/>' +
    '</w:rPr></w:rPrDefault>' +
    '<w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault>' +
    '</w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>' +
    '<w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr>' +
    '<w:rPr><w:b/><w:bCs/><w:sz w:val="36"/><w:szCs w:val="40"/></w:rPr></w:style>' +
    '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>' +
    '<w:pPr><w:keepNext/><w:spacing w:before="200" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr>' +
    '<w:rPr><w:b/><w:bCs/><w:sz w:val="30"/><w:szCs w:val="34"/></w:rPr></w:style>' +
    '</w:styles>');
  zip.file('word/document.xml', decl +
    `<w:document xmlns:w="${W}"><w:body>` + bodyParts.join('') +
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' +
    '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>' +
    sectBidi + '</w:sectPr></w:body></w:document>');
  zip.file('docProps/core.xml', decl +
    '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
    'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ' +
    'xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
    `<dc:title>${xml(title)}</dc:title><dc:creator>Awraq PDF</dc:creator>` +
    `<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>` +
    `<dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>` +
    '</cp:coreProperties>');
  zip.file('docProps/app.xml', decl +
    '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Awraq PDF</Application></Properties>');

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
  });
}

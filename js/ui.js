// Awraq PDF — shared interface pieces
import { t } from './i18n.js';
import { h } from './util.js';

const S = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;

export const ICONS = {
  merge: S('<rect x="3.5" y="3" width="6.5" height="7.5" rx="1"/><rect x="14" y="3" width="6.5" height="7.5" rx="1"/><path d="M6.8 10.5 12 14l5.2-3.5"/><rect x="8.5" y="14" width="7" height="7" rx="1"/>'),
  split: S('<path d="M7 3h7l4 4v4M18 15v5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-5M6 11V4a1 1 0 0 1 1-1"/><path d="M3 13h2.5M8 13h2.5M13.5 13H16M18.5 13H21"/>'),
  organize: S('<rect x="4" y="3.5" width="7" height="8" rx="1"/><rect x="13" y="3.5" width="7" height="8" rx="1"/><rect x="4" y="13.5" width="7" height="7" rx="1"/><path d="M16.5 14v6M13.5 17h6"/>'),
  compress: S('<path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M12 6v4.2M10 8.3l2 2 2-2M12 18v-4.2M10 15.7l2-2 2 2"/>'),
  img2pdf: S('<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 16.5 5-5 4 4 2.5-2.5 5.5 5"/><circle cx="16" cy="9.5" r="1.4"/>'),
  pdf2img: S('<path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/><path d="m8.5 17 2.5-2.7 2 2 1.5-1.5 1.5 2.2"/><circle cx="10" cy="10.5" r="1.1"/>'),
  pagenum: S('<path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9 7h6M9 10h6"/><path d="M11 15.5h2v3"/>'),
  watermark: S('<path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="m8.5 16.5 7-9" stroke-dasharray="2 2.2"/>'),
  pdf2word: S('<path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/><path d="M10 11h5M12 14h3M9 17h6"/>'),
  ocr: S('<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 10h8M10 14h6"/>'),
  home: S('<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>'),
  info: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.6v.2"/>'),
  lock: S('<rect x="5" y="10.5" width="14" height="9.5" rx="1.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
  check: S('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  up: S('<path d="m6.5 14.5 5.5-5.5 5.5 5.5"/>'),
  down: S('<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>'),
  rotL: S('<path d="M5 9a7.5 7.5 0 1 1 1.6 8.2"/><path d="M5 4v5h5"/>'),
  rotR: S('<path d="M19 9a7.5 7.5 0 1 0-1.6 8.2"/><path d="M19 4v5h-5"/>'),
  trash: S('<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5"/>'),
  undo: S('<path d="M8 8H14a5 5 0 0 1 0 10h-3"/><path d="M10.5 5 7.5 8l3 3"/>'),
  plus: S('<path d="M12 5v14M5 12h14"/>'),
  x: S('<path d="m6.5 6.5 11 11M17.5 6.5l-11 11"/>'),
  copy: S('<rect x="8" y="8" width="11.5" height="11.5" rx="1.5"/><path d="M5.5 15.5h-.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9.5a1 1 0 0 1 1 1v.5"/>'),
  drag: S('<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke-width="2.6"/>'),
};

export const NUQTA = '<svg viewBox="0 0 10 10" aria-hidden="true" class="nuqta"><path d="M5 0.6 9.4 5 5 9.4 0.6 5z"/></svg>';

export const BRAND_MARK = `<svg viewBox="0 0 64 64" aria-hidden="true" class="brand-mark">
<rect width="64" height="64" rx="15" fill="#2846C4"/>
<path d="M19 9.5h18.5L48 20v33.5a2.5 2.5 0 0 1-2.5 2.5h-26.5a2.5 2.5 0 0 1-2.5-2.5v-41.5a2.5 2.5 0 0 1 2.5-2.5z" fill="#fff"/>
<path d="M37.5 9.5v8a2.5 2.5 0 0 0 2.5 2.5h8z" fill="#BFCBF3"/>
<rect x="25" y="29" width="17" height="3.6" rx="1.8" fill="#16213D"/>
<rect x="31" y="36.5" width="11" height="3.6" rx="1.8" fill="#16213D"/>
<rect x="22" y="44" width="20" height="3.6" rx="1.8" fill="#16213D"/>
<path d="M36.5 18.2 40.3 22l-3.8 3.8-3.8-3.8z" fill="#E3A92B"/>
</svg>`;

export function icon(name, cls = 'ic') {
  return h('span', { class: cls, html: ICONS[name] || '' });
}

/* ---------- Toast ---------- */
let toastTimer = null;
export function toast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3200);
}

/* ---------- Tool header ---------- */
export function toolHeader(id, { pro = false } = {}) {
  return h('header', { class: 'tool-head' },
    h('div', { class: 'tool-head-icon', html: ICONS[id] }),
    h('div', { class: 'tool-head-text' },
      h('h1', { id: 'tool-title' }, t(`tool.${id}`), pro ? h('span', { class: 'pro-chip', html: `${NUQTA}<span>Pro</span>` }) : null),
      h('p', { class: 'lead' }, t(`tool.${id}.desc`))));
}

/* ---------- Drop zone (a sheet of paper) ---------- */
export function dropzone({ accept, multiple = true, title, chooseLabel, onFiles, compact = false }) {
  const input = h('input', { type: 'file', accept, multiple: multiple || undefined, class: 'visually-hidden', tabindex: '-1', 'aria-hidden': 'true' });
  input.addEventListener('change', () => {
    const files = Array.from(input.files || []);
    input.value = '';
    if (files.length) onFiles(files);
  });
  const button = h('button', { type: 'button', class: 'btn btn-quiet', onclick: () => input.click() },
    icon('plus'), chooseLabel || (multiple ? t('drop.choose') : t('drop.chooseOne')));
  const lines = h('div', { class: 'sheet-lines', 'aria-hidden': 'true' },
    h('i'), h('i'), h('i'), h('i'));
  const zone = h('section', { class: `sheet dropzone${compact ? ' is-compact' : ''}`, 'aria-label': title },
    h('span', { class: 'sheet-fold', 'aria-hidden': 'true' }),
    compact ? null : lines,
    h('div', { class: 'dropzone-body' },
      h('p', { class: 'dropzone-title' }, title),
      h('div', { class: 'dropzone-actions' }, compact ? null : h('span', { class: 'muted' }, t('drop.or')), button),
      compact ? null : h('p', { class: 'dropzone-note' }, icon('lock', 'ic ic-sm'), t('drop.local'))),
    input);
  let depth = 0;
  zone.addEventListener('dragenter', (e) => { e.preventDefault(); depth++; zone.classList.add('is-over'); });
  zone.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
  zone.addEventListener('dragleave', () => { depth = Math.max(0, depth - 1); if (!depth) zone.classList.remove('is-over'); });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    depth = 0;
    zone.classList.remove('is-over');
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  });
  zone.openPicker = () => input.click();
  return zone;
}

/* ---------- Notices ---------- */
export function notice(text, kind = 'info', action) {
  return h('div', { class: `notice notice-${kind}`, role: kind === 'error' ? 'alert' : 'status' },
    h('p', null, text), action || null);
}

/* ---------- Action bar with progress ---------- */
export function actionBar({ label, onClick, secondary = [] }) {
  const progressFill = h('span', { class: 'progress-fill' });
  const status = h('p', { class: 'action-status', 'aria-live': 'polite' });
  const progress = h('div', { class: 'progress', hidden: true }, progressFill);
  const button = h('button', { type: 'button', class: 'btn btn-primary btn-lg', onclick: onClick }, label);
  const el = h('div', { class: 'action-bar' },
    h('div', { class: 'action-info' }, status, progress),
    h('div', { class: 'action-buttons' }, ...secondary, button));
  return {
    el,
    button,
    setInfo(text) { status.textContent = text || ''; },
    setDisabled(v) { button.disabled = !!v; },
    busy(text, fraction) {
      button.disabled = true;
      el.classList.add('is-busy');
      status.textContent = text || t('status.working');
      progress.hidden = false;
      progressFill.style.inlineSize = `${Math.round(Math.max(0.03, Math.min(1, fraction ?? 0.05)) * 100)}%`;
    },
    idle(text) {
      button.disabled = false;
      el.classList.remove('is-busy');
      progress.hidden = true;
      status.textContent = text || '';
    },
  };
}

/* ---------- Result card ---------- */
export function resultCard({ message, detail, pending = false, onSave, onStartOver, extra }) {
  return h('section', { class: `result${pending ? ' is-pending' : ''}`, role: 'status' },
    h('div', { class: 'result-icon', html: ICONS.check }),
    h('div', { class: 'result-text' },
      h('p', { class: 'result-title' }, message),
      detail ? h('p', { class: 'muted' }, detail) : null),
    h('div', { class: 'result-actions' },
      extra || null,
      onStartOver ? h('button', { type: 'button', class: 'btn btn-quiet', onclick: onStartOver }, t('btn.startOver')) : null,
      onSave ? h('button', { type: 'button', class: `btn ${pending ? 'btn-primary' : 'btn-quiet'}`, onclick: onSave }, pending ? t('btn.save') : t('btn.saveAgain')) : null));
}

/* ---------- Form controls ---------- */
let uid = 0;
export function segmented({ label, options, value, onChange, name }) {
  const groupName = name || `seg-${++uid}`;
  const wrap = h('fieldset', { class: 'field segmented' }, h('legend', { class: 'field-label' }, label));
  const row = h('div', { class: 'seg-row' });
  for (const o of options) {
    const id = `${groupName}-${o.value}`;
    const inputEl = h('input', { type: 'radio', name: groupName, id, value: o.value, checked: o.value === value || undefined });
    inputEl.addEventListener('change', () => { if (inputEl.checked) onChange(o.value); });
    row.append(h('label', { class: 'seg', for: id }, inputEl,
      h('span', { class: 'seg-text' }, h('span', { class: 'seg-title' }, o.label), o.desc ? h('span', { class: 'seg-desc' }, o.desc) : null)));
  }
  wrap.append(row);
  return wrap;
}

export function selectField({ label, options, value, onChange }) {
  const id = `sel-${++uid}`;
  const sel = h('select', { id, class: 'select' });
  for (const o of options) sel.append(h('option', { value: o.value, selected: o.value === value || undefined }, o.label));
  sel.addEventListener('change', () => onChange(sel.value));
  return h('div', { class: 'field' }, h('label', { class: 'field-label', for: id }, label), sel);
}

export function textField({ label, value, placeholder, onInput, dir }) {
  const id = `txt-${++uid}`;
  const inp = h('input', { id, class: 'input', type: 'text', value: value || '', placeholder: placeholder || '', dir: dir || 'auto' });
  inp.addEventListener('input', () => onInput(inp.value));
  return h('div', { class: 'field' }, h('label', { class: 'field-label', for: id }, label), inp);
}

export function numberField({ label, value, min, max, onInput }) {
  const id = `num-${++uid}`;
  const inp = h('input', { id, class: 'input input-num', type: 'number', value: String(value), min, max, inputmode: 'numeric' });
  inp.addEventListener('input', () => onInput(Number(inp.value)));
  return h('div', { class: 'field' }, h('label', { class: 'field-label', for: id }, label), inp);
}

export function rangeField({ label, value, min, max, step, format, onInput }) {
  const id = `rng-${++uid}`;
  const out = h('output', { for: id, class: 'range-value' }, format(value));
  const inp = h('input', { id, class: 'range', type: 'range', value: String(value), min, max, step });
  inp.addEventListener('input', () => { out.textContent = format(Number(inp.value)); onInput(Number(inp.value)); });
  return h('div', { class: 'field' }, h('label', { class: 'field-label', for: id }, label, ' ', out), inp);
}

export function checkField({ label, checked, onChange }) {
  const id = `chk-${++uid}`;
  const inp = h('input', { id, type: 'checkbox', class: 'check', checked: checked || undefined });
  inp.addEventListener('change', () => onChange(inp.checked));
  return h('div', { class: 'field field-check' }, inp, h('label', { for: id }, label));
}

export function optionsPanel(...fields) {
  return h('section', { class: 'options' }, ...fields);
}

/* ---------- Drag-to-reorder for lists and grids ---------- */
export function sortable(container, itemSelector, onMove) {
  let from = null;
  container.addEventListener('dragstart', (e) => {
    const item = e.target.closest(itemSelector);
    if (!item) return;
    from = Number(item.dataset.index);
    item.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(from));
  });
  container.addEventListener('dragend', (e) => {
    const item = e.target.closest(itemSelector);
    if (item) item.classList.remove('is-dragging');
    container.querySelectorAll('.is-drop-target').forEach((n) => n.classList.remove('is-drop-target'));
    from = null;
  });
  container.addEventListener('dragover', (e) => {
    if (from === null) return;
    const item = e.target.closest(itemSelector);
    if (!item) return;
    e.preventDefault();
    container.querySelectorAll('.is-drop-target').forEach((n) => n !== item && n.classList.remove('is-drop-target'));
    item.classList.add('is-drop-target');
  });
  container.addEventListener('drop', (e) => {
    if (from === null) return;
    const item = e.target.closest(itemSelector);
    if (!item) return;
    e.preventDefault();
    e.stopPropagation();
    const to = Number(item.dataset.index);
    if (to !== from) onMove(from, to);
    from = null;
  });
}

export function moveItem(arr, from, to) {
  const copy = arr.slice();
  const [it] = copy.splice(from, 1);
  copy.splice(to, 0, it);
  return copy;
}

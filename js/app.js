// Awraq PDF — application shell
import { t, initLang, getLang, setLang } from './i18n.js';
import { h, isPdfFile, isImageFile } from './util.js';
import { ICONS, NUQTA, BRAND_MARK, icon, dropzone, toast } from './ui.js';
import { initPro, isPro, onProChange, buyPro, refreshPurchases, storeAvailable, proPrice, storeUrl } from './pro.js';
import { merge, split, organize, compress, img2pdf, pdf2img, pagenum, watermark } from './tools-pdf.js';
import { pdf2word, ocr } from './tools-arabic.js';

export const APP_VERSION = '1.0.0';
const RFOOF_STORE_ID = '9NKH02WXWH03';
const SUPPORT_EMAIL = 'haymohsen@gmail.com';

const TOOLS = [merge, split, organize, compress, img2pdf, pdf2img, pagenum, watermark, pdf2word, ocr];
const BY_ID = Object.fromEntries(TOOLS.map((tool) => [tool.id, tool]));
const GROUPS = ['arrange', 'optimize', 'convert', 'stamp', 'arabic'];

const states = {};
let currentId = null;
let homeFiles = null;

const $ = (sel) => document.querySelector(sel);

/* ---------- tool context ---------- */
function ctxFor(id) {
  const tool = BY_ID[id];
  return {
    refresh: () => { if (currentId === id) renderMain(); },
    reset: () => {
      if (tool.dispose) tool.dispose(states[id]);
      states[id] = tool.init();
      renderMain();
    },
    goTool: (next, files) => navigate(next, files),
    isPro: () => isPro(),
    openPro: () => openProDialog(),
  };
}

function filesFor(id, files) {
  const tool = BY_ID[id];
  if (tool.accept === 'image') return files.filter(isImageFile);
  if (tool.accept === 'pdf') return files.filter(isPdfFile);
  return files;
}

export async function navigate(id, files) {
  currentId = id || null;
  homeFiles = null;
  if (currentId && !states[currentId]) states[currentId] = BY_ID[currentId].init();
  renderNav();
  renderMain({ focusTitle: true });
  $('#main').scrollTop = 0;
  if (currentId && files && files.length) {
    const usable = filesFor(currentId, files);
    if (usable.length) await BY_ID[currentId].addFiles(states[currentId], usable, ctxFor(currentId));
  }
}

/* ---------- top bar ---------- */
function renderTopbar() {
  const bar = $('#topbar');
  bar.replaceChildren(
    h('button', { type: 'button', class: 'brand', onclick: () => navigate(null), 'aria-label': t('nav.home') },
      h('span', { class: 'brand-icon', html: BRAND_MARK }),
      h('span', { class: 'brand-name' }, t('app.name'))),
    h('div', { class: 'topbar-actions' },
      h('button', {
        type: 'button', class: 'top-btn', lang: getLang() === 'ar' ? 'en' : 'ar', 'aria-label': t('lang.toggle.aria'),
        onclick: () => { setLang(getLang() === 'ar' ? 'en' : 'ar'); renderAll(); },
      }, t('lang.toggle')),
      h('button', { type: 'button', class: 'top-btn icon-only', 'aria-label': t('nav.about'), title: t('nav.about'), onclick: openAboutDialog, html: ICONS.info }),
      h('button', { type: 'button', class: `top-btn pro-btn${isPro() ? ' is-pro' : ''}`, onclick: openProDialog, html: `${NUQTA}<span>${isPro() ? t('pro.active') : t('pro.get')}</span>` })));
}

/* ---------- sidebar ---------- */
function renderNav() {
  const nav = $('#sidebar');
  const list = h('div', { class: 'nav-scroll' });
  list.append(h('button', { type: 'button', class: `nav-item nav-home${currentId === null ? ' is-active' : ''}`, 'aria-current': currentId === null ? 'page' : undefined, onclick: () => navigate(null) },
    icon('home'), h('span', null, t('nav.home'))));
  for (const g of GROUPS) {
    const sec = h('div', { class: 'nav-group' }, h('p', { class: 'nav-group-title' }, t(`group.${g}`)));
    for (const tool of TOOLS.filter((x) => x.group === g)) {
      const active = currentId === tool.id;
      sec.append(h('button', {
        type: 'button', class: `nav-item${active ? ' is-active' : ''}`, 'aria-current': active ? 'page' : undefined,
        onclick: () => navigate(tool.id),
      }, icon(tool.id), h('span', null, t(`tool.${tool.id}`)), tool.pro && !isPro() ? h('span', { class: 'nav-pro', html: NUQTA, title: 'Pro' }) : null));
    }
    list.append(sec);
  }
  nav.replaceChildren(list,
    h('div', { class: 'privacy-badge' },
      icon('lock'),
      h('div', null, h('p', { class: 'privacy-title' }, t('privacy.badge')), h('p', { class: 'privacy-detail' }, t('privacy.detail')))));
}

/* ---------- main area ---------- */
function focusKey(el) {
  if (!el || !$('#main').contains(el)) return null;
  const idx = el.closest('[data-index]');
  return `${idx ? idx.dataset.index : ''}|${el.getAttribute('aria-label') || el.textContent.trim().slice(0, 40)}`;
}

function renderMain({ focusTitle = false } = {}) {
  const main = $('#main');
  const key = focusTitle ? null : focusKey(document.activeElement);
  const inner = h('div', { class: 'main-inner' });
  if (currentId) BY_ID[currentId].render(inner, states[currentId], ctxFor(currentId));
  else renderHome(inner);
  main.replaceChildren(inner);
  if (focusTitle) {
    const title = main.querySelector('h1');
    if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
  } else if (key) {
    const match = Array.from(main.querySelectorAll('button, input, select, textarea')).find((el) => focusKey(el) === key);
    if (match) match.focus({ preventScroll: true });
  }
}

function suggestionsFor(files) {
  const pdfs = files.filter(isPdfFile);
  const imgs = files.filter(isImageFile);
  if (pdfs.length > 1) return ['merge', 'compress', 'split', 'organize', 'pdf2word', 'pagenum', 'watermark', 'pdf2img'];
  if (pdfs.length === 1) return ['pdf2word', 'compress', 'split', 'organize', 'pagenum', 'watermark', 'pdf2img', 'ocr', 'merge'];
  if (imgs.length) return ['img2pdf', 'ocr'];
  return [];
}

function renderHome(root) {
  root.append(h('header', { class: 'home-head' },
    h('h1', null, t('home.title')),
    h('p', { class: 'lead' }, t('app.tagline'))));

  if (homeFiles && homeFiles.length) {
    const ids = suggestionsFor(homeFiles);
    const title = homeFiles.length === 1 ? t('home.dropped', { name: homeFiles[0].name }) : t('home.droppedMany', { count: homeFiles.length });
    root.append(h('section', { class: 'sheet chooser' },
      h('span', { class: 'sheet-fold', 'aria-hidden': 'true' }),
      h('p', { class: 'chooser-title' }, title),
      ids.length
        ? h('div', { class: 'chooser-grid' }, ...ids.map((id) => h('button', { type: 'button', class: 'chooser-item', onclick: () => navigate(id, homeFiles) },
          icon(id), h('span', null, t(`tool.${id}`)), BY_ID[id].pro && !isPro() ? h('span', { class: 'nav-pro', html: NUQTA }) : null)))
        : h('p', { class: 'muted' }, t('err.notPdf', { name: homeFiles[0].name })),
      h('button', { type: 'button', class: 'btn btn-quiet btn-sm chooser-cancel', onclick: () => { homeFiles = null; renderMain(); } }, icon('x'), t('btn.close'))));
  } else {
    root.append(dropzone({
      accept: '.pdf,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.bmp,image/*',
      title: t('home.drop'),
      onFiles: (files) => { homeFiles = files; renderMain(); },
    }));
  }

  const index = h('div', { class: 'tool-index' });
  for (const g of GROUPS) {
    const items = TOOLS.filter((x) => x.group === g);
    index.append(h('section', { class: `index-group group-${g}` },
      h('h2', { class: 'index-title' }, t(`group.${g}`), g === 'arabic' ? h('span', { class: 'pro-chip', html: `${NUQTA}<span>Pro</span>` }) : null),
      h('ul', { class: 'index-list' }, ...items.map((tool) => h('li', null,
        h('button', { type: 'button', class: 'index-item', onclick: () => navigate(tool.id) },
          h('span', { class: 'index-icon', html: ICONS[tool.id] }),
          h('span', { class: 'index-text' },
            h('span', { class: 'index-name' }, t(`tool.${tool.id}`)),
            h('span', { class: 'index-desc' }, t(`tool.${tool.id}.desc`)))))))));
  }
  root.append(index);
}

/* ---------- dialogs ---------- */
function dialogShell(id, ...content) {
  const dlg = document.getElementById(id);
  const close = h('button', { type: 'button', class: 'icon-btn dlg-close', 'aria-label': t('btn.close'), onclick: () => dlg.close(), html: ICONS.x });
  dlg.replaceChildren(h('div', { class: 'dlg-body' }, close, ...content));
  if (!dlg.open) dlg.showModal();
  return dlg;
}

function openProDialog() {
  const features = h('ul', { class: 'pro-features' },
    ...['pro.f1', 'pro.f2', 'pro.f3', 'pro.f4'].map((k) => h('li', null, h('span', { class: 'ic', html: ICONS.check }), t(k))));
  let action;
  if (isPro()) {
    action = h('p', { class: 'pro-owned' }, t('pro.owned'));
  } else if (storeAvailable()) {
    const price = proPrice();
    action = h('div', { class: 'pro-actions' },
      h('button', {
        type: 'button', class: 'btn btn-saffron btn-lg', onclick: async () => {
          const r = await buyPro();
          toast(r === 'owned' ? t('pro.thanks') : t('pro.notCompleted'));
          openProDialog();
          renderAll();
        },
      }, price ? t('pro.buy', { price }) : t('pro.buyNoPrice')),
      h('button', {
        type: 'button', class: 'btn btn-quiet', onclick: async () => {
          const owned = await refreshPurchases();
          toast(owned ? t('pro.restored') : t('pro.notFound'));
          openProDialog();
          renderAll();
        },
      }, t('pro.restore')));
  } else {
    const url = storeUrl();
    action = h('div', { class: 'pro-actions' },
      h('p', { class: 'muted' }, t('pro.storeOnly')),
      url ? h('a', { class: 'btn btn-saffron', href: url }, t('pro.openStore')) : null);
  }
  dialogShell('dlg-pro',
    h('div', { class: 'pro-head' }, h('span', { class: 'pro-mark', html: NUQTA }), h('h2', null, t('pro.title'))),
    h('p', { class: 'lead' }, t('pro.lead')),
    features,
    action);
}

function openAboutDialog() {
  dialogShell('dlg-about',
    h('div', { class: 'about-head' }, h('span', { class: 'brand-icon brand-icon-lg', html: BRAND_MARK }),
      h('div', null, h('h2', null, t('about.title')), h('p', { class: 'muted' }, t('about.version', { v: APP_VERSION })))),
    h('h3', null, t('about.privacyTitle')),
    h('p', null, t('about.privacy')),
    h('p', null, h('a', { href: 'privacy.html', target: '_blank', rel: 'noopener' }, t('about.privacyLink'))),
    h('h3', null, t('about.support')),
    h('p', null, h('a', { href: `mailto:${SUPPORT_EMAIL}` }, SUPPORT_EMAIL)),
    h('h3', null, t('about.alsoBy')),
    h('p', null, h('a', { href: `ms-windows-store://pdp/?productid=${RFOOF_STORE_ID}` }, t('about.rfoof'))),
    h('div', { class: 'muted about-foot' },
      h('span', null, t('about.dev')),
      h('a', { href: 'licenses/THIRD-PARTY-NOTICES.txt', target: '_blank', rel: 'noopener' }, t('about.licenses'))));
}

/* ---------- whole-window drag and drop ---------- */
function setupWindowDrop() {
  window.addEventListener('dragover', (e) => { if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) e.preventDefault(); });
  window.addEventListener('drop', (e) => {
    if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (!currentId) { homeFiles = files; renderMain(); return; }
    const usable = filesFor(currentId, files);
    if (usable.length) BY_ID[currentId].addFiles(states[currentId], BY_ID[currentId].multiple ? usable : usable.slice(0, 1), ctxFor(currentId));
  });
}

/* ---------- files opened from Windows ("Open with") ---------- */
function setupLaunchQueue() {
  if (!('launchQueue' in window)) return;
  window.launchQueue.setConsumer(async (params) => {
    if (!params.files || !params.files.length) return;
    const files = await Promise.all(params.files.map((fh) => fh.getFile()));
    currentId = null;
    homeFiles = files;
    renderNav();
    renderMain();
  });
}

function renderAll() {
  document.title = t('app.name');
  renderTopbar();
  renderNav();
  renderMain();
}

function boot() {
  initLang();
  renderAll();
  setupWindowDrop();
  setupLaunchQueue();
  onProChange(() => { renderTopbar(); renderNav(); renderMain(); });
  initPro();
  if (!window.PDFLib || !window.JSZip) toast(t('err.libs'));
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline install not available */ });
  }
}

boot();

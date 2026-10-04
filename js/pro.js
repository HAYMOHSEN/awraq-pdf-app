// Awraq PDF — Pro unlock through Microsoft Store billing (Digital Goods API)
// Partner Center: create a Durable add-on whose Product ID equals PRO_SKU.

export const PRO_SKU = 'awraq_pro';
// Fill in after reserving the app name in Partner Center (e.g. '9NXXXXXXXXXX').
export const STORE_PRODUCT_ID = '9NXSK845KC49';

const BILLING = 'https://store.microsoft.com/billing';
const CACHE_KEY = 'awraq.pro.v1';

let service = null;
let owned = false;
let price = null;
const listeners = new Set();

function readCache() {
  try { return localStorage.getItem(CACHE_KEY) === '1'; } catch (_) { return false; }
}
function writeCache(v) {
  try { v ? localStorage.setItem(CACHE_KEY, '1') : localStorage.removeItem(CACHE_KEY); } catch (_) { /* ignore */ }
}
function notify() { listeners.forEach((fn) => fn(owned)); }

export function isPro() { return owned; }
export function proPrice() { return price; }
export function storeAvailable() { return !!service; }
export function onProChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function storeUrl() {
  return STORE_PRODUCT_ID ? `ms-windows-store://pdp/?productid=${STORE_PRODUCT_ID}` : '';
}

/** Local testing only: http://localhost/?pro=1 unlocks Pro for the session. */
function devOverride() {
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  return local && new URLSearchParams(location.search).get('pro') === '1';
}

export async function initPro() {
  owned = readCache() || devOverride();
  notify();
  if (!('getDigitalGoodsService' in window)) return;
  try {
    service = await window.getDigitalGoodsService(BILLING);
  } catch (_) {
    service = null; // Not installed from the Store (e.g. running in a browser).
    return;
  }
  await refreshPurchases();
  try {
    const details = await service.getDetails([PRO_SKU]);
    const item = details.find((d) => d.itemId === PRO_SKU);
    if (item && item.price) {
      price = new Intl.NumberFormat(document.documentElement.lang || 'en', {
        style: 'currency', currency: item.price.currency,
      }).format(Number(item.price.value));
    }
  } catch (_) { /* price stays unknown; the button shows without it */ }
  notify();
}

export async function refreshPurchases() {
  if (!service) return owned;
  try {
    const purchases = await service.listPurchases();
    const has = purchases.some((p) => p.itemId === PRO_SKU);
    owned = has || devOverride();
    writeCache(has);
  } catch (_) {
    // Offline: keep the cached entitlement.
  }
  notify();
  return owned;
}

/** Returns 'owned' | 'cancelled' | 'unavailable'. */
export async function buyPro() {
  if (!service) return 'unavailable';
  const method = [{ supportedMethods: BILLING, data: { sku: PRO_SKU } }];
  let request;
  try {
    request = new PaymentRequest(method);
  } catch (_) {
    // Some engines still require a details object.
    request = new PaymentRequest(method, { total: { label: 'Awraq Pro', amount: { currency: 'USD', value: '0' } } });
  }
  try {
    const response = await request.show();
    await response.complete('success');
  } catch (_) {
    await refreshPurchases();
    return owned ? 'owned' : 'cancelled';
  }
  // The purchase list can lag behind a fresh purchase, so trust the response.
  owned = true;
  writeCache(true);
  notify();
  return 'owned';
}

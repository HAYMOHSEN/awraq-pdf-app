import * as pdfjsLib from "./vendor/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdf.worker.mjs";

const { PDFDocument, degrees } = window.PDFLib;
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

const state = {
  language: localStorage.getItem("awraq-language") || "en",
  theme: localStorage.getItem("awraq-theme") || "light",
  file: null,
  bytes: null,
  pdf: null,
  pageTexts: [],
  signals: [],
  currentPage: 1,
  scale: 1.28,
  historyKey: "awraq-ai-pro-history-v2"
};

const English = {};
$$("[data-i18n]").forEach((el) => { English[el.dataset.i18n] = el.textContent.trim(); });
$$("[data-i18n-placeholder]").forEach((el) => { English[el.dataset.i18nPlaceholder] = el.placeholder; });

const Arabic = {
  brandSubtitle: "مساحة عمل PDF إلى إجراءات",
  navWorkspace: "مساحة العمل", navInspector: "فحص الدليل", navPacks: "حزم الإجراءات", navToolkit: "أدوات PDF", navHistory: "السجل الخاص",
  localOnly: "محلي افتراضيًا", localOnlyDetail: "ملف PDF لا يغادر جهازك.", eyebrow: "ذكاء موثوق للمستندات",
  workspaceTitle: "ملفات PDF جاهزة للعمل.", onDevice: "معالجة على جهازك", heroPill: "كل نتيجة لها دليل صفحة",
  heroTitle: "افهم وتحقق ونفّذ الإجراء على كل ملف PDF.", heroBody: "افتح مستندًا عربيًا أو إنجليزيًا، وابحث عن دليل موثّق، واكتشف البيانات الحساسة، وحوّله إلى عمل مفيد—دون رفعه.",
  openPdf: "فتح ملف PDF", explorePacks: "استكشاف حزم الإجراءات", trustLine: "لا حساب سحابي. لا رفع للمستندات. لا ادعاءات ذكاء اصطناعي مخفية.",
  startHere: "ابدأ هنا", uploadTitle: "أضف مستندًا", dropTitle: "أفلت ملف PDF هنا", dropDetail: "أو اختر ملفًا من جهازك", browseFiles: "استعراض الملفات",
  uploadFootnote: "تتم معالجة الملفات داخل المتصفح ولا يتم رفعها.", currentDocument: "المستند الحالي", noDocument: "لا يوجد مستند مفتوح", readyStatus: "جاهز",
  documentPlaceholder: "افتح PDF لعرض الصفحات والبحث الموثق وفحوص الخصوصية وحزم الإجراءات.", pages: "الصفحات", words: "الكلمات", privacySignals: "إشارات الخصوصية",
  proofEngine: "محرك الدليل المحلي", askVerified: "اطلب دليلًا موثّقًا", citationsRequired: "يتطلب إسنادًا للصفحات", proofPlaceholder: "ابحث في المستند وتحقق من الصفحات الدقيقة…", verify: "تحقق",
  proofEmpty: "ستظهر النتائج هنا مع الصفحات التي تثبتها.", inspectorEyebrow: "مراجعة من المصدر", inspectorTitle: "فحص الدليل",
  inspectorBody: "شاهد صفحة المستند ونصها المستخرج والدليل الذي يدعم كل نتيجة.", openDocument: "فتح مستند", pageIndicatorEmpty: "الصفحة — من —",
  canvasEmpty: "ستظهر معاينة المستند هنا.", pageText: "نص الصفحة", pageTextEmpty: "اختر مستندًا لفحص النص المستخرج.", privacyCheck: "فحص الخصوصية", privacyEmpty: "لم يتم فحص مستند بعد.", scan: "فحص",
  packsEyebrow: "مسارات عمل جاهزة", packsTitle: "حوّل PDF إلى عمل مفيد.", packsBody: "تعمل كل حزمة من المستند المفتوح وتنتج مخرجات محلية قابلة للمراجعة.", noUpload: "لا يحتاج رفعًا",
  studyPack: "حزمة الدراسة", studyPackBody: "أنشئ نقاط مراجعة وأسئلة مبنية على الدليل من المحاضرات.", studyPackOne: "أسئلة مرتبطة بالصفحات", studyPackTwo: "جاهزة بالعربية والإنجليزية", createStudyPack: "إنشاء حزمة الدراسة",
  officePack: "حزمة المكتب", officePackBody: "استخرج التواريخ وبيانات الاتصال وإشارات المستند في CSV قابل للمراجعة.", officePackOne: "تواريخ واتصالات حسب الصفحة", officePackTwo: "جاهز لـ Excel", createOfficePack: "إنشاء حزمة المكتب",
  researchPack: "حزمة البحث", researchPackBody: "صدّر مقاطع الدليل مع أرقام الصفحات للملاحظات والكتابة.", researchPackOne: "اقتباس وتتبّع للصفحة", researchPackTwo: "تصدير Markdown", createResearchPack: "إنشاء حزمة البحث",
  privacyPack: "حزمة الخصوصية", privacyPackBody: "اعثر على بيانات حساسة محتملة قبل مشاركة المستند.", privacyPackOne: "أنماط البريد والهاتف والهوية والبطاقات", privacyPackTwo: "تقرير دليل للمراجعة", runPrivacyPack: "تشغيل حزمة الخصوصية",
  toolkitEyebrow: "أدوات PDF على الجهاز", toolkitTitle: "الأدوات التي يتوقعها المستخدم—من دون إرسال الملفات.", toolkitBody: "استخدم أساسيات أوراق الأصلية مع مساحة العمل الموثقة الجديدة.",
  mergeTitle: "دمج ملفات PDF", mergeBody: "ادمج عدة ملفات بالترتيب الذي تختاره.", mergeButton: "دمج الملفات المختارة", extractTitle: "استخراج أو تقسيم الصفحات", extractBody: "أنشئ PDF جديدًا من نطاق صفحات.", pageRange: "نطاق الصفحات", extractButton: "استخراج الصفحات",
  watermarkTitle: "إضافة علامة مائية", watermarkBody: "أضف مسودة أو مالكًا أو علامة سرية واضحة.", watermarkText: "نص العلامة المائية", watermarkButton: "إضافة علامة مائية",
  pageNumbersTitle: "إضافة أرقام الصفحات", pageNumbersBody: "ضع أرقامًا واضحة على كل صفحة.", pageNumberPrefix: "بادئة (اختياري)", pageNumbersButton: "إضافة أرقام الصفحات",
  optimizeTitle: "تحسين ملف PDF", optimizeBody: "أعد حفظ الملف بأمان باستخدام كائنات PDF مضغوطة.", optimizeHint: "تعتمد النتيجة على الملف الأصلي؛ لا يتم خفض جودة الصور.", optimizeButton: "تحسين ملف PDF الحالي",
  proofBeforeShare: "تحقق قبل المشاركة", proofBeforeShareBody: "شغّل فحص الخصوصية وصدّر تقريرًا للمراجعة أولًا.", runPrivacyCheck: "تشغيل فحص الخصوصية",
  historyEyebrow: "على جهازك فقط", historyTitle: "سجل النشاط الخاص", historyBody: "يحفظ أوراق أسماء الإجراءات والملفات على جهازك فقط—وليس نسخًا من ملفات PDF.", clearHistory: "مسح السجل",
  pageLabel: "الصفحة", defaultWatermark: "سري", documentRequired: "افتح ملف PDF أولًا.", operationFailed: "تعذر معالجة هذا الملف. قد يكون مشفّرًا أو تالفًا.",
  processing: "جارٍ المعالجة", scanned: "تم الفحص", noEvidence: "لم يُعثر على دليل يدعم هذه الصياغة.", verifiedMatches: "تطابقات موثّقة", localSearch: "بحث دليل محلي", pageCitations: "إسنادات للصفحات",
  privacyNoSignals: "لم يتم العثور على أنماط شائعة للبريد أو الهاتف أو البطاقة أو الهوية. هذه أداة مساعدة للمراجعة وليست ضمانًا قانونيًا.", noExtractableText: "يحتوي هذا PDF على نص قليل أو غير قابل للتحديد.",
  actionReady: "المخرج المحلي جاهز للتنزيل.", studyOutputTitle: "حزمة الدراسة جاهزة", officeOutputTitle: "حزمة المكتب جاهزة", researchOutputTitle: "حزمة البحث جاهزة", privacyOutputTitle: "حزمة الخصوصية جاهزة"
};

const Extra = {
  pageLabel: "Page", defaultWatermark: "CONFIDENTIAL", documentRequired: "Open a PDF first.", operationFailed: "This file could not be processed. It may be encrypted or malformed.",
  processing: "Processing", scanned: "Scanned", noEvidence: "No supporting evidence was found for that wording.", verifiedMatches: "Verified matches", localSearch: "Local proof search", pageCitations: "page citations",
  privacyNoSignals: "No common email, phone, card, or ID patterns were found. This is a review aid, not a legal guarantee.", noExtractableText: "This PDF has little or no selectable text. Try a text-based PDF or add OCR in the next release.",
  actionReady: "Local output is ready to download.", noSelection: "Choose at least two PDF files to merge.", mergeDone: "Merged PDF is ready.", pagesExtracted: "New PDF created from selected pages.",
  watermarkAdded: "Watermark added to a new PDF.", numbersAdded: "Page numbers added to a new PDF.", optimized: "Optimization complete.", sameSize: "The document was safely re-saved; its size did not decrease.",
  downloading: "Preparing your local download…", historyEmpty: "Actions you take will appear here. PDF contents are never stored in this history.", clearHistoryDone: "Private history cleared.", historyOpen: "Opened", selectedDocument: "Selected document", onThisDevice: "on this device"
};

const ExtraArabic = {
  noSelection: "اختر ملفي PDF على الأقل للدمج.", mergeDone: "ملف PDF المدمج جاهز.", pagesExtracted: "تم إنشاء PDF جديد من الصفحات المختارة.",
  watermarkAdded: "تمت إضافة العلامة المائية إلى PDF جديد.", numbersAdded: "تمت إضافة أرقام الصفحات إلى PDF جديد.", optimized: "اكتمل التحسين.", sameSize: "أُعيد حفظ المستند بأمان، ولم ينخفض حجمه.",
  downloading: "يجري تجهيز التنزيل المحلي…", historyEmpty: "ستظهر الإجراءات التي تنفذها هنا. لا يتم حفظ محتوى PDF في هذا السجل.", clearHistoryDone: "تم مسح السجل الخاص.", historyOpen: "فُتح", selectedDocument: "المستند المختار", onThisDevice: "على هذا الجهاز"
};

const ViewTitles = {
  en: { workspace: "Your PDFs, ready for action.", inspector: "Proof Inspector", packs: "Action Packs", toolkit: "PDF Toolkit", history: "Private activity history" },
  ar: { workspace: "ملفات PDF جاهزة للعمل.", inspector: "فحص الدليل", packs: "حزم الإجراءات", toolkit: "أدوات PDF", history: "سجل النشاط الخاص" }
};

function t(key) {
  if (state.language === "ar") return Arabic[key] || ExtraArabic[key] || Extra[key] || English[key] || key;
  return Extra[key] || English[key] || key;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^\x24{}()|[\]\\]/g, "\\$&");
}

function normalize(value) {
  return String(value || "").toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\u064B-\u065F\u0670]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
}

function number(value) { return new Intl.NumberFormat(state.language === "ar" ? "ar" : "en").format(value); }
function words(value) { return (String(value || "").match(/[\p{L}\p{N}]+/gu) || []).length; }
function safeStem(value) { return String(value || "document").replace(/\.pdf$/i, "").replace(/[^\p{L}\p{N}_-]+/gu, "_").replace(/^_+|_+$/g, "") || "document"; }
function mask(value) { const text = String(value || ""); return text.length < 6 ? "••••" : text.slice(0, 2) + "••••" + text.slice(-2); }

function toast(message, error) {
  const el = $("#toast");
  el.textContent = message;
  el.className = "toast" + (error ? " error" : "") + " show";
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 3600);
}

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem("awraq-theme", theme);
  document.documentElement.dataset.theme = theme;
  $("#theme-toggle").textContent = theme === "dark" ? "☼" : "◐";
}

function setLanguage(language) {
  state.language = language;
  localStorage.setItem("awraq-language", language);
  document.documentElement.lang = language === "ar" ? "ar" : "en";
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  $("#language-toggle").textContent = language === "ar" ? "English" : "العربية";
  $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  if (!$("#watermark-text").value || $("#watermark-text").value === "CONFIDENTIAL" || $("#watermark-text").value === "سري") $("#watermark-text").value = t("defaultWatermark");
  const current = $(".view.active");
  $("#view-title").textContent = ViewTitles[language][current ? current.id : "workspace"];
  updatePageText();
  renderSignals();
  renderHistory();
}

function switchView(id) {
  $$(".view").forEach((el) => el.classList.toggle("active", el.id === id));
  $$(".nav-item").forEach((el) => el.classList.toggle("active", el.dataset.viewTarget === id));
  $("#view-title").textContent = ViewTitles[state.language][id];
  if (id === "history") renderHistory();
  if (id === "inspector" && state.pdf) renderPage(state.currentPage);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function history() {
  try { return JSON.parse(localStorage.getItem(state.historyKey) || "[]"); } catch { return []; }
}

function addHistory(action, detail) {
  const rows = history();
  rows.unshift({ action: action, detail: detail, time: new Date().toISOString() });
  localStorage.setItem(state.historyKey, JSON.stringify(rows.slice(0, 30)));
  renderHistory();
}

function renderHistory() {
  const container = $("#history-list");
  const rows = history();
  if (!rows.length) {
    container.innerHTML = '<div class="history-empty"><span>◷</span><p>' + escapeHtml(t("historyEmpty")) + "</p></div>";
    return;
  }
  container.innerHTML = rows.map((row) => {
    const date = new Intl.DateTimeFormat(state.language === "ar" ? "ar" : "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.time));
    return '<div class="history-row"><span class="history-icon">✓</span><div><strong>' + escapeHtml(row.action) + '</strong><span>' + escapeHtml(row.detail) + '</span></div><time datetime="' + row.time + '">' + escapeHtml(date) + "</time></div>";
  }).join("");
}

function refreshCard() {
  if (!state.pdf || !state.file) return;
  $("#document-name").textContent = state.file.name;
  $("#document-placeholder").classList.add("hidden");
  $("#document-meta").classList.remove("hidden");
  $("#page-count").textContent = number(state.pdf.numPages);
  $("#word-count").textContent = number(words(state.pageTexts.join(" ")));
  $("#signal-count").textContent = number(state.signals.length);
  $("#document-status").textContent = t("scanned");
}

function patterns() {
  return [
    { type: state.language === "ar" ? "بريد إلكتروني" : "Email", kind: "email", exp: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
    { type: state.language === "ar" ? "هاتف" : "Phone", kind: "phone", exp: /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}/g },
    { type: state.language === "ar" ? "بطاقة محتملة" : "Possible card", kind: "card", exp: /\b(?:\d[ -]*?){13,19}\b/g },
    { type: state.language === "ar" ? "رقم هوية محتمل" : "Possible ID", kind: "id", exp: /\b\d{8,12}\b/g },
    { type: state.language === "ar" ? "جواز محتمل" : "Possible passport", kind: "passport", exp: /\b[A-Z]{1,2}\d{6,9}\b/g }
  ];
}

function scanSignals() {
  const rows = [];
  state.pageTexts.forEach((text, index) => {
    patterns().forEach((pattern) => {
      const exp = new RegExp(pattern.exp.source, pattern.exp.flags);
      let hit;
      while ((hit = exp.exec(text)) && rows.length < 80) {
        const value = hit[0].trim();
        const digits = value.replace(/\D/g, "");
        if (pattern.kind === "phone" && (digits.length < 7 || digits.length > 15)) continue;
        if (pattern.kind === "card" && (digits.length < 13 || digits.length > 19)) continue;
        if (pattern.kind === "id" && /^0+$/.test(digits)) continue;
        rows.push({ type: pattern.type, value: value, page: index + 1 });
      }
    });
  });
  const seen = new Set();
  return rows.filter((item) => {
    const key = item.type + "|" + item.value + "|" + item.page;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderSignals() {
  const container = $("#sensitive-results");
  if (!state.file) { container.innerHTML = "<p>" + escapeHtml(t("privacyEmpty")) + "</p>"; return; }
  if (!state.signals.length) { container.innerHTML = "<p>" + escapeHtml(t("privacyNoSignals")) + "</p>"; return; }
  container.innerHTML = state.signals.slice(0, 12).map((item) => {
    return '<button class="signal-row jump-page" data-page="' + item.page + '" type="button"><span class="signal-dot"></span><span><strong>' + escapeHtml(item.type) + " · " + escapeHtml(t("pageLabel")) + " " + number(item.page) + "</strong><span>" + escapeHtml(mask(item.value)) + "</span></span></button>";
  }).join("");
}

async function loadPdf(file) {
  if (!file || !(file.type === "application/pdf" || /\.pdf$/i.test(file.name))) { toast(t("operationFailed"), true); return; }
  try {
    $("#document-status").textContent = t("processing");
    $("#document-name").textContent = file.name;
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(bytes.slice(0)) }).promise;
    state.file = file;
    state.bytes = bytes;
    state.pdf = pdf;
    state.currentPage = 1;
    state.scale = 1.28;
    state.pageTexts = new Array(pdf.numPages);
    for (let i = 1; i <= pdf.numPages; i += 1) {
      $("#document-status").textContent = t("processing") + " " + i + "/" + pdf.numPages;
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      state.pageTexts[i - 1] = content.items.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();
    }
    state.signals = scanSignals();
    refreshCard();
    renderSignals();
    await renderPage(1);
    addHistory(t("historyOpen") + ": " + file.name, t("selectedDocument"));
    toast(words(state.pageTexts.join(" ")) < 8 ? t("noExtractableText") : file.name + " · " + number(pdf.numPages) + " " + t("pages").toLocaleLowerCase());
  } catch (error) {
    console.error(error);
    $("#document-status").textContent = t("readyStatus");
    toast(t("operationFailed"), true);
  }
}

async function renderPage(pageNumber) {
  if (!state.pdf) return;
  state.currentPage = Math.max(1, Math.min(Number(pageNumber), state.pdf.numPages));
  const page = await state.pdf.getPage(state.currentPage);
  const viewport = page.getViewport({ scale: state.scale });
  const canvas = $("#pdf-canvas");
  const context = canvas.getContext("2d", { alpha: false });
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(viewport.width * ratio);
  canvas.height = Math.floor(viewport.height * ratio);
  canvas.style.width = Math.floor(viewport.width) + "px";
  canvas.style.height = Math.floor(viewport.height) + "px";
  $("#canvas-empty").classList.add("hidden");
  await page.render({ canvasContext: context, transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : null, viewport: viewport }).promise;
  $("#page-indicator").textContent = t("pageLabel") + " " + number(state.currentPage) + (state.language === "ar" ? " من " : " of ") + number(state.pdf.numPages);
  updatePageText();
}

function updatePageText() {
  if (!state.pdf) {
    $("#page-text").textContent = t("pageTextEmpty");
    $("#page-text-label").textContent = "—";
    return;
  }
  $("#page-text").textContent = state.pageTexts[state.currentPage - 1] || t("noExtractableText");
  $("#page-text-label").textContent = t("pageLabel") + " " + number(state.currentPage);
}

function tokens(query) {
  const stop = new Set(["the", "and", "for", "with", "from", "that", "this", "what", "where", "when", "which", "about", "into", "على", "من", "في", "الى", "إلى", "عن", "ما", "هذا", "هذه", "التي", "الذي", "هل", "مع", "كل"]);
  return Array.from(new Set((normalize(query).match(/[\p{L}\p{N}]{2,}/gu) || []).filter((word) => !stop.has(word)))).slice(0, 8);
}

function snippet(text, query) {
  const normal = normalize(text);
  const places = query.map((item) => normal.indexOf(item)).filter((item) => item >= 0);
  const start = Math.max(0, (places[0] || 0) - 110);
  const end = Math.min(text.length, start + 320);
  let output = (start ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  output = escapeHtml(output);
  query.forEach((item) => { output = output.replace(new RegExp("(" + escapeRegExp(item) + ")", "giu"), "<mark>$1</mark>"); });
  return output;
}

function proofSearch(query) {
  if (!state.pdf) { toast(t("documentRequired"), true); return; }
  const clean = String(query || "").trim();
  const terms = tokens(clean);
  if (!clean || !terms.length) return;
  const whole = normalize(clean);
  const rows = state.pageTexts.map((text, index) => {
    const normal = normalize(text);
    let score = normal.includes(whole) ? 12 : 0;
    terms.forEach((term) => { score += (normal.match(new RegExp(escapeRegExp(term), "gu")) || []).length; });
    return { page: index + 1, text: text, score: score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  const container = $("#proof-results");
  if (!rows.length) {
    container.innerHTML = '<div class="proof-empty"><span class="proof-empty-icon">!</span><p>' + escapeHtml(t("noEvidence")) + "</p></div>";
    return;
  }
  container.innerHTML = rows.map((row, index) => {
    const label = index === 0 ? t("verifiedMatches") : t("pageLabel") + " " + number(row.page);
    return '<article class="evidence-result"><div class="evidence-result-head"><strong>' + escapeHtml(label) + '</strong><span class="soft-status">✓ ' + escapeHtml(t("localSearch")) + '</span></div><p>' + snippet(row.text, terms) + '</p><button class="citation-button open-proof-page" data-page="' + row.page + '" type="button">' + escapeHtml(t("pageLabel")) + " " + number(row.page) + " · " + escapeHtml(t("pageCitations")) + "</button></article>";
  }).join("");
  addHistory(t("localSearch") + ": " + clean.slice(0, 44), state.file.name);
}

function candidates(limit) {
  const all = [];
  state.pageTexts.forEach((text, index) => {
    text.split(/(?<=[.!?؟])\s+|\n+/u).forEach((sentence) => {
      const clean = sentence.trim().replace(/\s+/g, " ");
      if (clean.length >= 48 && clean.length <= 280 && words(clean) >= 8) all.push({ text: clean, page: index + 1 });
    });
  });
  const unique = new Set();
  return all.filter((item) => {
    const id = normalize(item.text).slice(0, 90);
    if (unique.has(id)) return false;
    unique.add(id);
    return true;
  }).slice(0, limit || 8);
}

function dateSignals() {
  const pattern = /\b(?:\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4})\b|(?:\d{1,2}\s+(?:يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)\s+\d{4})/giu;
  const dates = [];
  state.pageTexts.forEach((text, index) => {
    const exp = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = exp.exec(text))) dates.push({ type: state.language === "ar" ? "تاريخ" : "Date", value: match[0], page: index + 1 });
  });
  return dates;
}

function csv(value) { return '"' + String(value).replace(/"/g, '""') + '"'; }

async function canvasText(pdf, text, size, color) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const fontSize = size || 72;
  context.font = "800 " + fontSize + "px Arial, Tahoma, sans-serif";
  const measured = Math.ceil(context.measureText(text).width);
  canvas.width = Math.max(80, measured + 52);
  canvas.height = Math.ceil(fontSize * 1.48);
  context.font = "800 " + fontSize + "px Arial, Tahoma, sans-serif";
  context.fillStyle = color || "#245e85";
  context.textBaseline = "middle";
  const arabic = /[\u0600-\u06FF]/.test(text);
  context.direction = arabic ? "rtl" : "ltr";
  context.textAlign = arabic ? "right" : "left";
  context.fillText(text, arabic ? canvas.width - 26 : 26, canvas.height / 2);
  return { image: await pdf.embedPng(canvas.toDataURL("image/png")), ratio: canvas.width / canvas.height };
}

function download(blob, filename) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 700);
}

function textDownload(content, filename, mime) {
  download(new Blob([content], { type: mime || "text/plain;charset=utf-8" }), filename);
}

function outputPack(title, content, filename, mime) {
  const output = $("#pack-output");
  output.classList.remove("hidden");
  output.innerHTML = '<div class="section-heading"><div><p class="eyebrow">' + escapeHtml(t("onThisDevice").toUpperCase()) + '</p><h3>' + escapeHtml(title) + '</h3></div><button class="button primary download-pack-output" type="button">' + escapeHtml(t("actionReady")) + '</button></div><p>' + escapeHtml(t("actionReady")) + '</p><pre>' + escapeHtml(content) + "</pre>";
  $(".download-pack-output", output).addEventListener("click", () => textDownload(content, filename, mime));
  switchView("packs");
}

function actionPack(kind) {
  if (!state.pdf || !state.file) { toast(t("documentRequired"), true); return; }
  const stem = safeStem(state.file.name);
  let title = "";
  let content = "";
  let filename = "";
  let mime = "text/plain;charset=utf-8";
  if (kind === "study") {
    title = t("studyOutputTitle");
    const lines = ["# " + t("studyPack") + " — " + state.file.name, ""];
    candidates(8).forEach((item, index) => {
      lines.push("## " + (index + 1) + ". " + t("pageLabel") + " " + item.page);
      lines.push("Evidence: " + item.text);
      lines.push(state.language === "ar" ? "سؤال مراجعة: اشرح الفكرة في هذا المقطع واذكر كيف يدعمها النص." : "Revision prompt: Explain the idea in this passage and state how the text supports it.");
      lines.push("");
    });
    content = lines.length > 2 ? lines.join("\n") : t("noExtractableText");
    filename = stem + "_study_pack.md";
  } else if (kind === "office") {
    title = t("officeOutputTitle");
    const rows = dateSignals().concat(state.signals).slice(0, 100);
    content = [[state.language === "ar" ? "الفئة" : "Category", state.language === "ar" ? "القيمة للمراجعة" : "Value for review", state.language === "ar" ? "الصفحة" : "Page"].map(csv).join(",")].concat(rows.map((row) => [row.type, row.value, row.page].map(csv).join(","))).join("\n");
    filename = stem + "_office_review.csv";
    mime = "text/csv;charset=utf-8";
  } else if (kind === "research") {
    title = t("researchOutputTitle");
    const lines = ["# " + t("researchPack") + " — " + state.file.name, ""];
    candidates(10).forEach((item) => { lines.push("> " + item.text, "", "— " + state.file.name + ", " + t("pageLabel") + " " + item.page + ".", ""); });
    content = lines.length > 2 ? lines.join("\n") : t("noExtractableText");
    filename = stem + "_research_evidence.md";
  } else {
    title = t("privacyOutputTitle");
    const lines = ["# " + t("privacyPack") + " — " + state.file.name, "", state.language === "ar" ? "هذه النتيجة للمراجعة قبل المشاركة، وليست تأكيدًا قانونيًا بأن المستند خالٍ من البيانات الحساسة." : "This output is a review aid before sharing. It is not a legal confirmation that the document contains no sensitive data.", ""];
    if (state.signals.length) state.signals.forEach((item) => lines.push("- " + item.type + ": " + mask(item.value) + " — " + t("pageLabel") + " " + item.page));
    else lines.push(t("privacyNoSignals"));
    content = lines.join("\n");
    filename = stem + "_privacy_review.md";
  }
  outputPack(title, content, filename, mime);
  addHistory(title, state.file.name);
  toast(t("actionReady"));
}

function ensurePdf() {
  if (state.file && state.bytes) return true;
  toast(t("documentRequired"), true);
  return false;
}

function parseRange(value, max) {
  const output = new Set();
  const parts = String(value || "").split(",").map((part) => part.trim()).filter(Boolean);
  if (!parts.length) throw new Error("Invalid range");
  parts.forEach((part) => {
    const found = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!found) throw new Error("Invalid range");
    const start = Number(found[1]);
    const end = Number(found[2] || found[1]);
    if (start < 1 || end < start || end > max) throw new Error("Invalid range");
    for (let page = start; page <= end; page += 1) output.add(page);
  });
  return Array.from(output).sort((a, b) => a - b);
}

async function mergePdfs() {
  const files = Array.from($("#merge-files").files);
  if (files.length < 2) { toast(t("noSelection"), true); return; }
  try {
    toast(t("downloading"));
    const target = await PDFDocument.create();
    for (const file of files) {
      const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      const pages = await target.copyPages(source, source.getPageIndices());
      pages.forEach((page) => target.addPage(page));
    }
    const bytes = await target.save({ useObjectStreams: true });
    download(new Blob([bytes], { type: "application/pdf" }), "Awraq_merged_" + new Date().toISOString().slice(0, 10) + ".pdf");
    addHistory(t("mergeTitle"), files.length + " PDF files");
    toast(t("mergeDone"));
  } catch (error) { console.error(error); toast(t("operationFailed"), true); }
}

async function extractPages() {
  if (!ensurePdf()) return;
  try {
    const pages = parseRange($("#page-range").value, state.pdf.numPages);
    const source = await PDFDocument.load(state.bytes.slice(0), { ignoreEncryption: true });
    const target = await PDFDocument.create();
    const copied = await target.copyPages(source, pages.map((page) => page - 1));
    copied.forEach((page) => target.addPage(page));
    const bytes = await target.save({ useObjectStreams: true });
    download(new Blob([bytes], { type: "application/pdf" }), safeStem(state.file.name) + "_pages_" + pages.join("-") + ".pdf");
    addHistory(t("extractTitle"), state.file.name + " · " + $("#page-range").value);
    toast(t("pagesExtracted"));
  } catch (error) { console.error(error); toast(t("operationFailed"), true); }
}

async function addWatermark() {
  if (!ensurePdf()) return;
  try {
    const watermark = $("#watermark-text").value.trim() || t("defaultWatermark");
    const pdf = await PDFDocument.load(state.bytes.slice(0), { ignoreEncryption: true });
    const mark = await canvasText(pdf, watermark, 96, "#245e85");
    pdf.getPages().forEach((page) => {
      const width = Math.min(page.getWidth() * 0.72, mark.ratio * page.getHeight() * 0.12);
      page.drawImage(mark.image, { x: page.getWidth() * 0.14, y: page.getHeight() * 0.46, width: width, height: width / mark.ratio, opacity: 0.17, rotate: degrees(34) });
    });
    const bytes = await pdf.save({ useObjectStreams: true });
    download(new Blob([bytes], { type: "application/pdf" }), safeStem(state.file.name) + "_watermarked.pdf");
    addHistory(t("watermarkTitle"), state.file.name);
    toast(t("watermarkAdded"));
  } catch (error) { console.error(error); toast(t("operationFailed"), true); }
}

async function addPageNumbers() {
  if (!ensurePdf()) return;
  try {
    const prefix = $("#page-number-prefix").value.trim();
    const pdf = await PDFDocument.load(state.bytes.slice(0), { ignoreEncryption: true });
    const pages = pdf.getPages();
    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      const label = (prefix ? prefix + " " : "") + (index + 1);
      const mark = await canvasText(pdf, label, 34, "#334f67");
      const height = 12;
      const width = mark.ratio * height;
      page.drawImage(mark.image, { x: (page.getWidth() - width) / 2, y: 17, width: width, height: height, opacity: 0.82 });
    }
    const bytes = await pdf.save({ useObjectStreams: true });
    download(new Blob([bytes], { type: "application/pdf" }), safeStem(state.file.name) + "_numbered.pdf");
    addHistory(t("pageNumbersTitle"), state.file.name);
    toast(t("numbersAdded"));
  } catch (error) { console.error(error); toast(t("operationFailed"), true); }
}

async function optimizePdf() {
  if (!ensurePdf()) return;
  try {
    toast(t("downloading"));
    const pdf = await PDFDocument.load(state.bytes.slice(0), { ignoreEncryption: true });
    const compact = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
    const bytes = compact.length < state.bytes.byteLength ? compact : new Uint8Array(state.bytes);
    download(new Blob([bytes], { type: "application/pdf" }), safeStem(state.file.name) + "_optimized.pdf");
    addHistory(t("optimizeTitle"), state.file.name);
    const saved = Math.max(0, Math.round((1 - bytes.length / state.bytes.byteLength) * 100));
    toast(saved ? t("optimized") + " " + saved + "%" : t("sameSize"));
  } catch (error) { console.error(error); toast(t("operationFailed"), true); }
}

function goToPage(page) {
  switchView("inspector");
  requestAnimationFrame(() => renderPage(page));
}

function bindEvents() {
  $$(".nav-item, [data-view-target]").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.viewTarget)));
  $("#language-toggle").addEventListener("click", () => setLanguage(state.language === "en" ? "ar" : "en"));
  $("#theme-toggle").addEventListener("click", () => setTheme(state.theme === "light" ? "dark" : "light"));
  const input = $("#primary-file-input");
  const open = () => input.click();
  $("#open-pdf-button").addEventListener("click", (event) => { event.stopPropagation(); open(); });
  $("#hero-open-button").addEventListener("click", open);
  $("#drop-zone").addEventListener("click", open);
  $("#drop-zone").addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
  input.addEventListener("change", () => { if (input.files[0]) loadPdf(input.files[0]); });
  ["dragenter", "dragover"].forEach((name) => $("#drop-zone").addEventListener(name, (event) => { event.preventDefault(); $("#drop-zone").classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((name) => $("#drop-zone").addEventListener(name, (event) => { event.preventDefault(); $("#drop-zone").classList.remove("dragging"); }));
  $("#drop-zone").addEventListener("drop", (event) => { if (event.dataTransfer.files[0]) loadPdf(event.dataTransfer.files[0]); });
  $("#proof-form").addEventListener("submit", (event) => { event.preventDefault(); proofSearch($("#proof-query").value); });
  $("#proof-results").addEventListener("click", (event) => { const button = event.target.closest(".open-proof-page"); if (button) goToPage(button.dataset.page); });
  $("#inspect-current-button").addEventListener("click", () => state.pdf ? switchView("inspector") : open());
  $("#previous-page").addEventListener("click", () => state.pdf && renderPage(state.currentPage - 1));
  $("#next-page").addEventListener("click", () => state.pdf && renderPage(state.currentPage + 1));
  $("#zoom-in").addEventListener("click", () => { if (state.pdf) { state.scale = Math.min(2.4, state.scale + 0.16); renderPage(state.currentPage); } });
  $("#zoom-out").addEventListener("click", () => { if (state.pdf) { state.scale = Math.max(0.72, state.scale - 0.16); renderPage(state.currentPage); } });
  $("#run-privacy-check").addEventListener("click", () => {
    if (!state.pdf) return toast(t("documentRequired"), true);
    state.signals = scanSignals();
    refreshCard();
    renderSignals();
    addHistory(t("privacyCheck"), state.file.name);
    toast(state.language === "ar" ? "اكتمل فحص الخصوصية" : "Privacy scan complete");
  });
  $("#sensitive-results").addEventListener("click", (event) => { const row = event.target.closest(".jump-page"); if (row) goToPage(row.dataset.page); });
  $$(".run-pack").forEach((button) => button.addEventListener("click", () => actionPack(button.dataset.pack)));
  $("#merge-button").addEventListener("click", mergePdfs);
  $("#extract-button").addEventListener("click", extractPages);
  $("#watermark-button").addEventListener("click", addWatermark);
  $("#page-numbers-button").addEventListener("click", addPageNumbers);
  $("#optimize-button").addEventListener("click", optimizePdf);
  $("#clear-history").addEventListener("click", () => {
    localStorage.removeItem(state.historyKey);
    renderHistory();
    toast(t("clearHistoryDone"));
  });
}

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch((error) => console.warn(error)));
setTheme(state.theme);
bindEvents();
setLanguage(state.language);
renderHistory();

// Awraq PDF — interface strings (English / Arabic)
const STR = {
  en: {
    'app.name': 'Awraq PDF',
    'app.tagline': 'PDF tools that understand Arabic. Your files never leave this PC.',
    'privacy.badge': 'Files stay on this PC',
    'privacy.detail': 'Nothing is uploaded. Core tools work offline.',
    'lang.toggle': 'العربية',
    'lang.toggle.aria': 'Switch the interface to Arabic',
    'nav.home': 'All tools',
    'nav.about': 'About',
    'pro.get': 'Get Pro',
    'pro.active': 'Pro',

    'group.arrange': 'Arrange',
    'group.optimize': 'Optimize',
    'group.convert': 'Convert',
    'group.stamp': 'Add to pages',
    'group.arabic': 'Arabic text',

    'tool.merge': 'Merge PDF',
    'tool.merge.desc': 'Combine several PDFs into one file, in the order you choose.',
    'tool.split': 'Split PDF',
    'tool.split.desc': 'Extract pages, or cut one PDF into several files.',
    'tool.organize': 'Organize pages',
    'tool.organize.desc': 'Reorder, rotate or delete pages, then save.',
    'tool.compress': 'Compress PDF',
    'tool.compress.desc': 'Shrink a PDF so it fits email and upload limits.',
    'tool.img2pdf': 'Images to PDF',
    'tool.img2pdf.desc': 'Turn photos and scans into a single PDF.',
    'tool.pdf2img': 'PDF to images',
    'tool.pdf2img.desc': 'Save every page as a JPG or PNG image.',
    'tool.pagenum': 'Page numbers',
    'tool.pagenum.desc': 'Number pages with 1 2 3 or ١ ٢ ٣.',
    'tool.watermark': 'Watermark',
    'tool.watermark.desc': 'Stamp text such as “Confidential” or «سري» across pages.',
    'tool.pdf2word': 'PDF to Word',
    'tool.pdf2word.desc': 'Get an editable Word file with Arabic text in the right order.',
    'tool.ocr': 'OCR for scans',
    'tool.ocr.desc': 'Pull editable Arabic and English text out of scans and photos, or make the scan searchable.',

    'home.title': 'What would you like to do?',
    'home.drop': 'Drop a PDF or images to begin',
    'home.dropHint': 'Awraq suggests the right tool for your file.',
    'home.dropped': 'What should Awraq do with {name}?',
    'home.droppedMany': 'What should Awraq do with these {count}?',

    'drop.pdf': 'Drop PDF files here',
    'drop.pdfOne': 'Drop a PDF file here',
    'drop.images': 'Drop images here',
    'drop.any': 'Drop a PDF or images here',
    'drop.or': 'or',
    'drop.choose': 'Choose files',
    'drop.chooseOne': 'Choose a file',
    'drop.local': 'Processed on this PC — nothing is uploaded.',
    'drop.more': 'Add more files',

    'btn.clear': 'Clear',
    'btn.remove': 'Remove',
    'btn.moveUp': 'Move earlier',
    'btn.moveDown': 'Move later',
    'btn.rotateLeft': 'Rotate left',
    'btn.rotateRight': 'Rotate right',
    'btn.delete': 'Delete page',
    'btn.restore': 'Restore page',
    'btn.saveAgain': 'Save again',
    'btn.startOver': 'Start over',
    'btn.close': 'Close',
    'btn.copy': 'Copy text',
    'btn.selectAll': 'Select all',
    'btn.selectNone': 'Clear selection',
    'btn.rotateAll': 'Rotate all',
    'btn.another': 'Choose another file',
    'btn.save': 'Save',

    'act.merge': 'Merge PDFs',
    'act.split': 'Split PDF',
    'act.organize': 'Save PDF',
    'act.compress': 'Compress PDF',
    'act.img2pdf': 'Create PDF',
    'act.pdf2img': 'Save images',
    'act.pagenum': 'Add page numbers',
    'act.watermark': 'Add watermark',
    'act.pdf2word': 'Convert to Word',
    'act.pdf2txt': 'Save as text',
    'act.ocr': 'Recognize text',
    'act.ocrWord': 'Save as Word',
    'act.ocrTxt': 'Save as text',
    'act.ocrPdf': 'Save as searchable PDF',

    'status.working': 'Working…',
    'status.reading': 'Reading {name}…',
    'status.page': 'Page {i} of {n}',
    'status.image': 'Image {i} of {n}',
    'status.saving': 'Saving…',

    'res.saved': 'Saved {name}',
    'res.ready': 'Your file is ready to save.',
    'res.readyMany': 'Your files are ready to save.',
    'res.savedMany': 'Saved {count}',
    'res.savedFolder': 'Saved {count} in the folder you chose',
    'res.zip': 'Saved {name} with {count} inside',
    'res.cancelled': 'Saving was cancelled. Your result is still ready.',
    'res.size': '{before} → {after}, {pct}% smaller',
    'res.noGain': 'This PDF is already compact, so Awraq kept the original size.',

    'err.encrypted': '{name} is password-protected. Remove the password, then try again.',
    'err.notPdf': '{name} isn’t a PDF file.',
    'err.notImage': '{name} isn’t a supported image (use JPG, PNG, WEBP, GIF or BMP).',
    'err.read': 'Couldn’t read {name}. The file may be damaged.',
    'err.generic': 'That didn’t work: {msg}',
    'err.libs': 'Part of Awraq didn’t load. Restart the app and try again.',

    'merge.needTwo': 'Add at least two PDFs to merge.',
    'merge.summary': '{files}, {pages} in total',
    'merge.hint': 'Drag files to change their order.',

    'split.mode': 'How to split',
    'split.mode.select': 'Pick pages',
    'split.mode.each': 'Every page as its own file',
    'split.mode.ranges': 'By page ranges',
    'split.ranges': 'Page ranges',
    'split.ranges.ph': 'e.g. 1-3, 4-8, 9',
    'split.ranges.help': 'Each range becomes its own PDF.',
    'split.select.help': 'Click pages to select them. They are saved together as one PDF.',
    'split.selected': '{count} selected',
    'split.needPages': 'Select at least one page.',
    'split.badRanges': 'Check the ranges — this PDF has {pages}.',
    'split.eachInfo': 'Creates {count}, one for each page.',

    'org.help': 'Drag pages to reorder. Use the buttons on each page to rotate or delete it.',
    'org.kept': '{kept} of {total} kept',
    'org.allDeleted': 'Keep at least one page.',

    'cmp.level': 'Compression',
    'cmp.light': 'Light',
    'cmp.light.d': 'Cleans up the file; images untouched.',
    'cmp.rec': 'Recommended',
    'cmp.rec.d': 'Smaller images that still look sharp on screen.',
    'cmp.strong': 'Strong',
    'cmp.strong.d': 'Smallest file. Best for scans you only need to read.',

    'i2p.pageSize': 'Page size',
    'i2p.fit': 'Same as image',
    'i2p.orient': 'Orientation',
    'i2p.auto': 'Automatic',
    'i2p.portrait': 'Portrait',
    'i2p.landscape': 'Landscape',
    'i2p.margin': 'Margin',
    'i2p.none': 'None',
    'i2p.small': 'Small',
    'i2p.large': 'Large',
    'i2p.summary': '{images}',

    'p2i.format': 'Format',
    'p2i.res': 'Resolution',
    'p2i.screen': 'Screen (96 dpi)',
    'p2i.print': 'Print (150 dpi)',
    'p2i.high': 'High (300 dpi)',
    'p2i.pages': 'Pages',
    'p2i.all': 'All pages',
    'p2i.range': 'Only these pages',

    'pn.position': 'Position',
    'pn.bc': 'Bottom centre',
    'pn.br': 'Bottom right',
    'pn.bl': 'Bottom left',
    'pn.tc': 'Top centre',
    'pn.tr': 'Top right',
    'pn.tl': 'Top left',
    'pn.format': 'Format',
    'pn.digits': 'Digits',
    'pn.start': 'First number',
    'pn.skipFirst': 'Leave the first page (cover) unnumbered',
    'pn.size': 'Size',
    'sz.small': 'Small',
    'sz.medium': 'Medium',
    'sz.large': 'Large',

    'wm.text': 'Text',
    'wm.default': 'CONFIDENTIAL',
    'wm.layout': 'Layout',
    'wm.diagonal': 'Diagonal',
    'wm.horizontal': 'Horizontal',
    'wm.color': 'Colour',
    'wm.gray': 'Grey',
    'wm.red': 'Red',
    'wm.blue': 'Blue',
    'wm.opacity': 'Opacity',
    'wm.needText': 'Type the watermark text first.',

    'w.preview': 'Preview',
    'w.previewNote': 'Showing the first {count}. The Word file contains every converted page.',
    'w.flipWords': 'Arabic words in the wrong order? Flip them',
    'w.flipLetters': 'Arabic letters backwards? Flip them',
    'w.keepLines': 'Keep the original line breaks',
    'w.font': 'Arabic font in Word',
    'w.noText': '{count} have no text layer — they look scanned. Use OCR for scanned pages.',
    'w.allScanned': 'This PDF has no text to convert — it looks scanned. Open it in OCR instead.',
    'w.openOcr': 'Open in OCR',
    'w.copied': 'Text copied',

    'ocr.lang': 'Languages in the document',
    'ocr.araeng': 'Arabic + English',
    'ocr.ara': 'Arabic only',
    'ocr.eng': 'English only',
    'ocr.firstRun': 'The first run downloads the OCR engine and language data (a few MB) once. Your files are still processed on this PC.',
    'ocr.loading': 'Loading the OCR engine…',
    'ocr.progress': 'Reading text on page {i} of {n}…',
    'ocr.result': 'Recognized text',
    'ocr.editHint': 'Check the text and fix anything before saving.',
    'ocr.offline': 'OCR needs the internet the first time, to download its language data. Connect and try again.',
    'ocr.pdfHint': 'Searchable PDF keeps the original pages exactly as they are and adds an invisible text layer you can search, select and copy. Edits made in the box above go into the Word and text files only.',

    'pro.trial': 'Free preview: the first {count}. Get Pro to process all {total}.',
    'pro.title': 'Awraq Pro',
    'pro.lead': 'One payment, yours to keep. No subscription.',
    'pro.f1': 'PDF to Word with Arabic in the right reading order',
    'pro.f2': 'OCR for scanned Arabic and English documents',
    'pro.f3': 'No page limits on either tool',
    'pro.f4': 'Future Pro updates included',
    'pro.buy': 'Get Pro for {price}',
    'pro.buyNoPrice': 'Get Pro',
    'pro.restore': 'Restore purchase',
    'pro.owned': 'Pro is active on this PC. Thank you for supporting Awraq.',
    'pro.storeOnly': 'Pro is sold through the Microsoft Store version of Awraq PDF.',
    'pro.openStore': 'Open in Microsoft Store',
    'pro.notCompleted': 'The purchase wasn’t completed.',
    'pro.restored': 'Pro restored.',
    'pro.notFound': 'No Pro purchase was found for this Microsoft account.',
    'pro.thanks': 'Pro unlocked. Thank you!',

    'about.title': 'About Awraq PDF',
    'about.version': 'Version {v}',
    'about.privacyTitle': 'Privacy',
    'about.privacy': 'Awraq processes your files inside the app on this PC. It doesn’t upload, store or share them, and it has no account or tracking.',
    'about.privacyLink': 'Read the privacy policy',
    'about.dev': 'Developed by Prof. Dr. Hani Muhsen',
    'about.support': 'Support',
    'about.alsoBy': 'Also by the developer',
    'about.rfoof': 'Rfoof — keep your documents organized in coloured folders',
    'about.licenses': 'Open-source licences',

    'unit.kb': 'KB',
    'unit.mb': 'MB',
  },

  ar: {
    'app.name': 'أوراق PDF',
    'app.tagline': 'أدوات PDF تفهم العربية. ملفاتك لا تغادر هذا الجهاز.',
    'privacy.badge': 'ملفاتك تبقى على جهازك',
    'privacy.detail': 'لا يُرفع أي شيء، والأدوات الأساسية تعمل دون إنترنت.',
    'lang.toggle': 'English',
    'lang.toggle.aria': 'تحويل الواجهة إلى الإنجليزية',
    'nav.home': 'كل الأدوات',
    'nav.about': 'حول التطبيق',
    'pro.get': 'احصل على Pro',
    'pro.active': 'Pro',

    'group.arrange': 'الترتيب',
    'group.optimize': 'التحسين',
    'group.convert': 'التحويل',
    'group.stamp': 'إضافة إلى الصفحات',
    'group.arabic': 'النص العربي',

    'tool.merge': 'دمج ملفات PDF',
    'tool.merge.desc': 'اجمع عدة ملفات PDF في ملف واحد بالترتيب الذي تختاره.',
    'tool.split': 'تقسيم PDF',
    'tool.split.desc': 'استخرج صفحات محددة، أو قسّم الملف إلى عدة ملفات.',
    'tool.organize': 'تنظيم الصفحات',
    'tool.organize.desc': 'أعد ترتيب الصفحات أو دوّرها أو احذفها، ثم احفظ الملف.',
    'tool.compress': 'ضغط PDF',
    'tool.compress.desc': 'قلّل حجم الملف ليناسب البريد الإلكتروني ومواقع الرفع.',
    'tool.img2pdf': 'صور إلى PDF',
    'tool.img2pdf.desc': 'حوّل الصور والمستندات الممسوحة إلى ملف PDF واحد.',
    'tool.pdf2img': 'PDF إلى صور',
    'tool.pdf2img.desc': 'احفظ كل صفحة كصورة JPG أو PNG.',
    'tool.pagenum': 'ترقيم الصفحات',
    'tool.pagenum.desc': 'رقّم الصفحات بـ ١ ٢ ٣ أو 1 2 3.',
    'tool.watermark': 'علامة مائية',
    'tool.watermark.desc': 'اطبع نصًا مثل «سري» أو «مسودة» على الصفحات.',
    'tool.pdf2word': 'PDF إلى Word',
    'tool.pdf2word.desc': 'احصل على ملف Word قابل للتعديل مع ترتيب صحيح للنص العربي.',
    'tool.ocr': 'التعرّف على النص (OCR)',
    'tool.ocr.desc': 'استخرج نصًا عربيًا وإنجليزيًا قابلًا للتعديل من الصور والملفات الممسوحة، أو اجعل المسح قابلًا للبحث.',

    'home.title': 'ماذا تريد أن تفعل؟',
    'home.drop': 'أفلت ملف PDF أو صورًا للبدء',
    'home.dropHint': 'سيقترح «أوراق» الأداة المناسبة لملفك.',
    'home.dropped': 'ماذا تريد أن تفعل بالملف {name}؟',
    'home.droppedMany': 'ماذا تريد أن تفعل بهذه الملفات ({count})؟',

    'drop.pdf': 'أفلت ملفات PDF هنا',
    'drop.pdfOne': 'أفلت ملف PDF هنا',
    'drop.images': 'أفلت الصور هنا',
    'drop.any': 'أفلت ملف PDF أو صورًا هنا',
    'drop.or': 'أو',
    'drop.choose': 'اختر الملفات',
    'drop.chooseOne': 'اختر ملفًا',
    'drop.local': 'تتم المعالجة على هذا الجهاز — لا يُرفع أي شيء.',
    'drop.more': 'إضافة ملفات',

    'btn.clear': 'مسح',
    'btn.remove': 'إزالة',
    'btn.moveUp': 'تقديم',
    'btn.moveDown': 'تأخير',
    'btn.rotateLeft': 'تدوير لليسار',
    'btn.rotateRight': 'تدوير لليمين',
    'btn.delete': 'حذف الصفحة',
    'btn.restore': 'استعادة الصفحة',
    'btn.saveAgain': 'حفظ مرة أخرى',
    'btn.startOver': 'البدء من جديد',
    'btn.close': 'إغلاق',
    'btn.copy': 'نسخ النص',
    'btn.selectAll': 'تحديد الكل',
    'btn.selectNone': 'إلغاء التحديد',
    'btn.rotateAll': 'تدوير الكل',
    'btn.another': 'اختيار ملف آخر',
    'btn.save': 'حفظ',

    'act.merge': 'دمج الملفات',
    'act.split': 'تقسيم الملف',
    'act.organize': 'حفظ الملف',
    'act.compress': 'ضغط الملف',
    'act.img2pdf': 'إنشاء PDF',
    'act.pdf2img': 'حفظ الصور',
    'act.pagenum': 'إضافة الأرقام',
    'act.watermark': 'إضافة العلامة المائية',
    'act.pdf2word': 'تحويل إلى Word',
    'act.pdf2txt': 'حفظ كنص',
    'act.ocr': 'استخراج النص',
    'act.ocrWord': 'حفظ كملف Word',
    'act.ocrTxt': 'حفظ كنص',
    'act.ocrPdf': 'حفظ كـ PDF قابل للبحث',

    'status.working': 'جارٍ العمل…',
    'status.reading': 'جارٍ قراءة {name}…',
    'status.page': 'الصفحة {i} من {n}',
    'status.image': 'الصورة {i} من {n}',
    'status.saving': 'جارٍ الحفظ…',

    'res.saved': 'تم حفظ {name}',
    'res.ready': 'ملفك جاهز للحفظ.',
    'res.readyMany': 'ملفاتك جاهزة للحفظ.',
    'res.savedMany': 'تم حفظ {count}',
    'res.savedFolder': 'تم حفظ {count} في المجلد الذي اخترته',
    'res.zip': 'تم حفظ {name} ويحتوي على {count}',
    'res.cancelled': 'أُلغي الحفظ، والنتيجة ما زالت جاهزة.',
    'res.size': 'من {before} إلى {after} — أصغر بنسبة {pct}%',
    'res.noGain': 'هذا الملف مضغوط بالفعل، لذلك أبقى «أوراق» على حجمه الأصلي.',

    'err.encrypted': 'الملف {name} محمي بكلمة مرور. أزل كلمة المرور ثم حاول مجددًا.',
    'err.notPdf': 'الملف {name} ليس ملف PDF.',
    'err.notImage': 'الملف {name} ليس صورة مدعومة (استخدم JPG أو PNG أو WEBP أو GIF أو BMP).',
    'err.read': 'تعذّرت قراءة الملف {name}، فقد يكون تالفًا.',
    'err.generic': 'لم تنجح العملية: {msg}',
    'err.libs': 'لم يكتمل تحميل جزء من التطبيق. أعد تشغيله وحاول مجددًا.',

    'merge.needTwo': 'أضف ملفين على الأقل للدمج.',
    'merge.summary': '{files}، و{pages} إجمالًا',
    'merge.hint': 'اسحب الملفات لتغيير ترتيبها.',

    'split.mode': 'طريقة التقسيم',
    'split.mode.select': 'اختيار صفحات',
    'split.mode.each': 'كل صفحة في ملف مستقل',
    'split.mode.ranges': 'حسب نطاقات الصفحات',
    'split.ranges': 'نطاقات الصفحات',
    'split.ranges.ph': 'مثال: 1-3، 4-8، 9',
    'split.ranges.help': 'كل نطاق يصبح ملف PDF مستقلًا.',
    'split.select.help': 'انقر على الصفحات لتحديدها، وستُحفظ معًا في ملف PDF واحد.',
    'split.selected': 'تم تحديد {count}',
    'split.needPages': 'حدّد صفحة واحدة على الأقل.',
    'split.badRanges': 'راجع النطاقات — هذا الملف يحتوي على {pages}.',
    'split.eachInfo': 'سيُنشئ {count}، ملفًا لكل صفحة.',

    'org.help': 'اسحب الصفحات لإعادة ترتيبها، واستخدم الأزرار على كل صفحة لتدويرها أو حذفها.',
    'org.kept': 'تم الإبقاء على {kept} من {total}',
    'org.allDeleted': 'أبقِ صفحة واحدة على الأقل.',

    'cmp.level': 'مستوى الضغط',
    'cmp.light': 'خفيف',
    'cmp.light.d': 'ينظّف الملف دون المساس بالصور.',
    'cmp.rec': 'موصى به',
    'cmp.rec.d': 'صور أصغر تبقى واضحة على الشاشة.',
    'cmp.strong': 'قوي',
    'cmp.strong.d': 'أصغر حجم ممكن، مناسب للمستندات الممسوحة المخصصة للقراءة.',

    'i2p.pageSize': 'حجم الصفحة',
    'i2p.fit': 'بحجم الصورة',
    'i2p.orient': 'الاتجاه',
    'i2p.auto': 'تلقائي',
    'i2p.portrait': 'عمودي',
    'i2p.landscape': 'أفقي',
    'i2p.margin': 'الهامش',
    'i2p.none': 'بدون',
    'i2p.small': 'صغير',
    'i2p.large': 'كبير',
    'i2p.summary': '{images}',

    'p2i.format': 'الصيغة',
    'p2i.res': 'الدقة',
    'p2i.screen': 'شاشة (96 نقطة/بوصة)',
    'p2i.print': 'طباعة (150 نقطة/بوصة)',
    'p2i.high': 'عالية (300 نقطة/بوصة)',
    'p2i.pages': 'الصفحات',
    'p2i.all': 'كل الصفحات',
    'p2i.range': 'صفحات محددة فقط',

    'pn.position': 'الموضع',
    'pn.bc': 'أسفل الوسط',
    'pn.br': 'أسفل اليمين',
    'pn.bl': 'أسفل اليسار',
    'pn.tc': 'أعلى الوسط',
    'pn.tr': 'أعلى اليمين',
    'pn.tl': 'أعلى اليسار',
    'pn.format': 'الشكل',
    'pn.digits': 'الأرقام',
    'pn.start': 'الرقم الأول',
    'pn.skipFirst': 'عدم ترقيم الصفحة الأولى (الغلاف)',
    'pn.size': 'الحجم',
    'sz.small': 'صغير',
    'sz.medium': 'متوسط',
    'sz.large': 'كبير',

    'wm.text': 'النص',
    'wm.default': 'سري',
    'wm.layout': 'التخطيط',
    'wm.diagonal': 'مائل',
    'wm.horizontal': 'أفقي',
    'wm.color': 'اللون',
    'wm.gray': 'رمادي',
    'wm.red': 'أحمر',
    'wm.blue': 'أزرق',
    'wm.opacity': 'الشفافية',
    'wm.needText': 'اكتب نص العلامة المائية أولًا.',

    'w.preview': 'معاينة',
    'w.previewNote': 'تعرض المعاينة أول {count}، وملف Word يحتوي على كل الصفحات المحوّلة.',
    'w.flipWords': 'الكلمات العربية بترتيب خاطئ؟ اقلب ترتيبها',
    'w.flipLetters': 'الحروف العربية معكوسة؟ اقلبها',
    'w.keepLines': 'الإبقاء على فواصل الأسطر الأصلية',
    'w.font': 'الخط العربي في Word',
    'w.noText': '{count} بلا طبقة نص — يبدو أنها ممسوحة ضوئيًا. استخدم أداة OCR لها.',
    'w.allScanned': 'لا يحتوي هذا الملف على نص قابل للتحويل — يبدو ممسوحًا ضوئيًا. افتحه في أداة OCR.',
    'w.openOcr': 'فتح في أداة OCR',
    'w.copied': 'تم نسخ النص',

    'ocr.lang': 'لغات المستند',
    'ocr.araeng': 'العربية + الإنجليزية',
    'ocr.ara': 'العربية فقط',
    'ocr.eng': 'الإنجليزية فقط',
    'ocr.firstRun': 'في أول استخدام يُنزَّل محرك التعرّف وبيانات اللغة (بضعة ميغابايتات) مرة واحدة، وتبقى ملفاتك تُعالَج على هذا الجهاز.',
    'ocr.loading': 'جارٍ تحميل محرك التعرّف…',
    'ocr.progress': 'جارٍ قراءة النص في الصفحة {i} من {n}…',
    'ocr.result': 'النص المستخرج',
    'ocr.editHint': 'راجع النص وصحّح ما يلزم قبل الحفظ.',
    'ocr.offline': 'يحتاج OCR إلى الإنترنت في المرة الأولى لتنزيل بيانات اللغة. اتصل بالإنترنت ثم حاول مجددًا.',
    'ocr.pdfHint': 'يحتفظ ملف PDF القابل للبحث بالصفحات الأصلية كما هي تمامًا ويضيف طبقة نص غير مرئية يمكنك البحث فيها وتحديدها ونسخها. أما التعديلات في المربع أعلاه فتُطبّق على ملفي Word والنص فقط.',

    'pro.trial': 'معاينة مجانية: أول {count}. احصل على Pro لمعالجة الكل ({total}).',
    'pro.title': 'أوراق Pro',
    'pro.lead': 'دفعة واحدة وتملكه دائمًا، دون اشتراك.',
    'pro.f1': 'تحويل PDF إلى Word مع ترتيب قراءة صحيح للعربية',
    'pro.f2': 'التعرّف على النص في المستندات العربية والإنجليزية الممسوحة',
    'pro.f3': 'دون حدود لعدد الصفحات في الأداتين',
    'pro.f4': 'تشمل تحديثات Pro القادمة',
    'pro.buy': 'احصل على Pro مقابل {price}',
    'pro.buyNoPrice': 'احصل على Pro',
    'pro.restore': 'استعادة الشراء',
    'pro.owned': 'Pro مفعّل على هذا الجهاز. شكرًا لدعمك «أوراق».',
    'pro.storeOnly': 'يُباع Pro من خلال نسخة «أوراق PDF» في Microsoft Store.',
    'pro.openStore': 'فتح في Microsoft Store',
    'pro.notCompleted': 'لم تكتمل عملية الشراء.',
    'pro.restored': 'تمت استعادة Pro.',
    'pro.notFound': 'لم يُعثر على شراء لـ Pro في حساب Microsoft هذا.',
    'pro.thanks': 'تم تفعيل Pro. شكرًا لك!',

    'about.title': 'حول «أوراق PDF»',
    'about.version': 'الإصدار {v}',
    'about.privacyTitle': 'الخصوصية',
    'about.privacy': 'يعالج «أوراق» ملفاتك داخل التطبيق على هذا الجهاز، ولا يرفعها أو يخزنها أو يشاركها، ولا يتطلب حسابًا ولا يتتبعك.',
    'about.privacyLink': 'اقرأ سياسة الخصوصية',
    'about.dev': 'تطوير: أ.د. هاني محسن',
    'about.support': 'الدعم',
    'about.alsoBy': 'من المطوّر أيضًا',
    'about.rfoof': 'رفوف — نظّم مستنداتك في مجلدات ملوّنة',
    'about.licenses': 'تراخيص المصادر المفتوحة',

    'unit.kb': 'كيلوبايت',
    'unit.mb': 'ميغابايت',
  },
};

const AR_FORMS = {
  page: ['صفحة واحدة', 'صفحتان', 'صفحات', 'صفحة'],
  file: ['ملف واحد', 'ملفان', 'ملفات', 'ملفًا'],
  image: ['صورة واحدة', 'صورتان', 'صور', 'صورة'],
};
const EN_FORMS = {
  page: ['page', 'pages'],
  file: ['file', 'files'],
  image: ['image', 'images'],
};

let current = 'en';

export function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('awraq.lang'); } catch (_) { /* storage blocked */ }
  if (saved === 'ar' || saved === 'en') current = saved;
  else current = (navigator.language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
  applyDocumentLang();
  return current;
}

export function getLang() { return current; }

export function setLang(lang) {
  current = lang === 'ar' ? 'ar' : 'en';
  try { localStorage.setItem('awraq.lang', current); } catch (_) { /* ignore */ }
  applyDocumentLang();
}

function applyDocumentLang() {
  document.documentElement.lang = current;
  document.documentElement.dir = current === 'ar' ? 'rtl' : 'ltr';
}

const FSI = '\u2068';
const PDI = '\u2069';

/** Translate a key; {vars} are substituted. File names are bidi-isolated. */
export function t(key, vars) {
  let s = (STR[current] && STR[current][key]) ?? STR.en[key] ?? key;
  if (vars) {
    s = s.replace(/\{(\w+)\}/g, (m, k) => {
      if (!(k in vars)) return m;
      const v = vars[k];
      return k === 'name' ? FSI + String(v) + PDI : String(v);
    });
  }
  return s;
}

/** "3 pages" / "٣ صفحات"-style counted noun, with correct Arabic plural forms. */
export function count(kind, n) {
  if (current === 'ar') {
    const f = AR_FORMS[kind];
    if (n === 1) return f[0];
    if (n === 2) return f[1];
    const m = n % 100;
    if (m >= 3 && m <= 10) return `${n} ${f[2]}`;
    return `${n} ${f[3]}`;
  }
  const f = EN_FORMS[kind];
  return `${n} ${n === 1 ? f[0] : f[1]}`;
}

/** List separator: "، " in Arabic, ", " in English. */
export function sep() { return current === 'ar' ? '، ' : ', '; }

export function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} ${t('unit.kb')}`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 100 ? Math.round(mb) : mb.toFixed(1)} ${t('unit.mb')}`;
}

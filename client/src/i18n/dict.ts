export type Lang = 'en' | 'fr' | 'ar';
export const LANGS: Array<{ id: Lang; name: string; native: string; dir: 'ltr' | 'rtl' }> = [
  { id: 'en', name: 'English', native: 'English', dir: 'ltr' },
  { id: 'fr', name: 'French',  native: 'Français', dir: 'ltr' },
  { id: 'ar', name: 'Arabic',  native: 'العربية', dir: 'rtl' },
];

type Dict = Record<string, Record<Lang, string>>;

export const DICT: Dict = {
  'app.tagline':      {
    en: 'an appointed time',
    fr: 'un temps fixé',
    // Quran 4:103 — the verse the entire concept of "fixed prayer times"
    // (i.e. the brand name itself) is drawn from. The «...» quotes are the
    // Arabic-typographic guillemet pair used for Quranic citations.
    ar: '«إنّ الصلاةَ كانتْ على المؤمنينَ كتاباً موقوتاً»',
  },
  'app.tagline.attribution': {
    en: 'Quran · An-Nisa 4:103',
    fr: 'Coran · An-Nisa 4:103',
    ar: 'النساء ٤:١٠٣',
  },

  'prayer.fajr':      { en: 'Fajr',     fr: 'Fajr',     ar: 'الفجر' },
  'prayer.sunrise':   { en: 'Sunrise',  fr: 'Lever',    ar: 'الشروق' },
  'prayer.dhuhr':     { en: 'Dhuhr',    fr: 'Dhouhr',   ar: 'الظهر' },
  'prayer.asr':       { en: 'Asr',      fr: 'Asr',      ar: 'العصر' },
  'prayer.maghrib':   { en: 'Maghrib',  fr: 'Maghrib',  ar: 'المغرب' },
  'prayer.isha':      { en: 'Isha',     fr: 'Isha',     ar: 'العشاء' },
  'prayer.jumuah':    { en: 'Jumu’ah',  fr: 'Joumou’a', ar: 'الجمعة' },

  'ui.next':          { en: 'Next prayer', fr: 'Prochaine prière', ar: 'الصلاة القادمة' },
  'ui.next.short':    { en: 'Next',        fr: 'Suivante',         ar: 'التالية' },
  'ui.passed':        { en: 'Passed',      fr: 'Passée',           ar: 'مرت' },
  'ui.in':            { en: 'in',          fr: 'dans',             ar: 'خلال' },
  'ui.at':            { en: 'at',          fr: 'à',                ar: 'في' },
  'ui.play':          { en: 'Play',        fr: 'Lire',             ar: 'تشغيل' },
  'ui.stop':          { en: 'Stop',        fr: 'Arrêter',          ar: 'إيقاف' },
  'ui.location':      { en: 'Location',    fr: 'Localisation',     ar: 'الموقع' },
  'ui.location.click_change': { en: 'Click to change', fr: 'Cliquez pour changer', ar: 'انقر للتغيير' },
  'ui.set_location':  { en: 'Set location',fr: 'Définir la localisation', ar: 'تحديد الموقع' },
  'ui.search_city':   { en: 'Search any city in the world…', fr: 'Rechercher une ville…', ar: 'ابحث عن مدينة…' },
  'ui.use_gps':       { en: 'Use my current location (GPS)', fr: 'Utiliser ma position actuelle (GPS)', ar: 'استخدم موقعي الحالي (GPS)' },
  'ui.saved_locations':{en: 'Saved locations', fr: 'Localisations enregistrées', ar: 'المواقع المحفوظة' },
  'ui.current':       { en: 'current',    fr: 'actuelle',         ar: 'الحالي' },
  'ui.quran':         { en: 'Quran',      fr: 'Coran',            ar: 'القرآن' },
  'ui.converter':     { en: 'Converter',  fr: 'Convertisseur',    ar: 'محوّل' },
  'ui.monthly':       { en: 'Monthly',    fr: 'Mensuel',          ar: 'شهري' },
  'ui.help':          { en: 'Help',       fr: 'Aide',             ar: 'مساعدة' },

  'support.title':         { en: 'Support', fr: 'Soutenir', ar: 'الدعم' },
  'support.desc': {
    en: 'Help fund Miqāt’s development, or get in touch about Zakat & Sadaqa.',
    fr: 'Aidez à financer le développement de Miqāt, ou contactez-nous au sujet de la Zakat et de la Sadaqa.',
    ar: 'ساعد في تمويل تطوير مِيقات، أو تواصل بشأن الزكاة والصدقة.',
  },
  'support.donate.title': {
    en: 'Support the developer',
    fr: 'Soutenir le développeur',
    ar: 'ادعم المطوّر',
  },
  'support.donate.desc': {
    en: 'Optional one-time tip via PayPal — pick any amount. Helps keep Miqāt updated and ad-free.',
    fr: 'Pourboire ponctuel via PayPal — choisissez le montant. Aide à garder Miqāt à jour et sans publicité.',
    ar: 'إكرامية اختيارية لمرة واحدة عبر PayPal — اختر المبلغ. تساعد في تحديث مِيقات وإبقائه بلا إعلانات.',
  },
  'support.donate.cta': {
    en: 'Open PayPal',
    fr: 'Ouvrir PayPal',
    ar: 'فتح PayPal',
  },
  'support.zakat.title': {
    en: 'Zakat & Sadaqa inquiries',
    fr: 'Demandes Zakat & Sadaqa',
    ar: 'استفسارات الزكاة والصدقة',
  },
  'support.zakat.desc': {
    en: 'For questions about Zakat or Sadaqa — calculation, recipients, local channels — please reach out by email.',
    fr: 'Pour toute question sur la Zakat ou la Sadaqa — calcul, bénéficiaires, canaux locaux — contactez-nous par e-mail.',
    ar: 'لأي سؤال حول الزكاة أو الصدقة — الحساب، المستحقّون، القنوات المحلية — راسلنا عبر البريد الإلكتروني.',
  },
  'support.zakat.email_cta': {
    en: 'Send email',
    fr: 'Envoyer un e-mail',
    ar: 'إرسال بريد',
  },
  'support.copy_email': {
    en: 'Copy email address',
    fr: 'Copier l’adresse e-mail',
    ar: 'نسخ البريد الإلكتروني',
  },
  'support.email_copied': {
    en: 'Email copied to clipboard',
    fr: 'E-mail copié dans le presse-papier',
    ar: 'تم نسخ البريد إلى الحافظة',
  },
  'support.email_copy_failed': {
    en: 'Couldn’t copy the email — please copy it manually.',
    fr: 'Impossible de copier l’e-mail — veuillez le copier manuellement.',
    ar: 'تعذر نسخ البريد — يرجى نسخه يدويًا.',
  },
  'support.open_failed': {
    en: 'Couldn’t open the link.',
    fr: 'Impossible d’ouvrir le lien.',
    ar: 'تعذر فتح الرابط.',
  },
  'ui.today':         { en: 'Today',      fr: 'Aujourd’hui',      ar: 'اليوم' },
  'ui.settings':      { en: 'Settings',   fr: 'Paramètres',       ar: 'الإعدادات' },
  'ui.notifications': { en: 'Notifications', fr: 'Notifications', ar: 'الإشعارات' },
  'ui.notifications.muted': { en: 'Notifications (muted)', fr: 'Notifications (muet)', ar: 'الإشعارات (مكتومة)' },
  'ui.compact.enter': { en: 'Compact mode', fr: 'Mode compact', ar: 'الوضع المضغوط' },
  'ui.compact.exit':  { en: 'Exit compact mode', fr: 'Quitter le mode compact', ar: 'إنهاء الوضع المضغوط' },
  'ui.widget.toggle': { en: 'Floating widget', fr: 'Widget flottant', ar: 'الأداة العائمة' },
  'ui.theme.switch':  { en: 'Switch theme', fr: 'Changer de thème', ar: 'تبديل السمة' },

  'source.verified':         { en: 'Verified', fr: 'Vérifié', ar: 'مؤكَّد' },
  'source.verified.detail':  {
    en: 'Times computed locally and cross-checked with the Aladhan reference service.',
    fr: 'Horaires calculés localement et vérifiés avec le service de référence Aladhan.',
    ar: 'يتم حساب الأوقات محليًا والتحقق منها مع خدمة Aladhan المرجعية.',
  },
  'source.offline':          { en: 'Local', fr: 'Local', ar: 'محلي' },
  'source.offline.detail':   {
    en: 'Times computed locally — verifying with the Aladhan reference service…',
    fr: 'Horaires calculés localement — vérification avec le service de référence Aladhan en cours…',
    ar: 'يتم حساب الأوقات محليًا — جارٍ التحقق مع خدمة Aladhan المرجعية…',
  },
  'source.cached':           { en: 'Served from local cache.', fr: 'Servi depuis le cache local.', ar: 'مقدَّم من ذاكرة التخزين المؤقت المحلية.' },
  'source.fresh':            { en: 'Fresh fetch.', fr: 'Données fraîchement récupérées.', ar: 'بيانات حديثة.' },


  'qibla.title':      { en: 'Qibla',      fr: 'Qibla',            ar: 'القبلة' },
  'qibla.arrow':      { en: 'Arrow',      fr: 'Boussole',         ar: 'بوصلة' },
  'qibla.map':        { en: 'Map',        fr: 'Carte',            ar: 'خريطة' },
  'qibla.to_makkah':  { en: 'to Makkah',  fr: 'vers La Mecque',   ar: 'إلى مكة' },
  'qibla.bearing':    { en: 'Bearing',    fr: 'Azimut',           ar: 'الاتجاه' },
  'qibla.cardinal.n': { en: 'N',          fr: 'N',                ar: 'ش' },
  'qibla.cardinal.e': { en: 'E',          fr: 'E',                ar: 'ق' },
  'qibla.cardinal.s': { en: 'S',          fr: 'S',                ar: 'ج' },
  'qibla.cardinal.w': { en: 'W',          fr: 'O',                ar: 'غ' },

  'athan.title':      { en: 'Athan player', fr: 'Lecteur Athan',  ar: 'مشغل الأذان' },
  'athan.dua_after':  { en: 'Dua after Athan', fr: 'Doua après Athan', ar: 'دعاء بعد الأذان' },
  'athan.stream_error': { en: 'Live stream unavailable', fr: 'Flux en direct indisponible', ar: 'البث المباشر غير متاح' },
  'athan.stream_error.hint': {
    en: 'The station may be offline. Check your connection, then try another station.',
    fr: 'La station est peut-être hors ligne. Vérifiez la connexion et essayez une autre station.',
    ar: 'قد تكون المحطة غير متصلة. تحقّق من الإنترنت ثم جرّب محطة أخرى.',
  },
  'athan.file_error':   { en: 'Athan file missing', fr: 'Fichier Athan manquant', ar: 'ملف الأذان مفقود' },
  'athan.file_error.hint': {
    en: 'No audio at client/public/audio/ for this reciter. Run "npm run fetch:audio" or drop the MP3 in place.',
    fr: 'Aucun audio dans client/public/audio/ pour ce récitateur. Lancez « npm run fetch:audio » ou déposez le MP3.',
    ar: 'لا يوجد ملف صوتي في client/public/audio/ لهذا المُقرِئ. شغّل "npm run fetch:audio" أو ضع الملف يدويًا.',
  },

  'radio.title':      { en: 'Live radio',     fr: 'Radio en direct',  ar: 'الراديو المباشر' },
  'radio.live':       { en: 'Live',           fr: 'Direct',           ar: 'مباشر' },
  'radio.open_external': { en: 'Open in browser', fr: 'Ouvrir dans le navigateur', ar: 'افتح في المتصفّح' },
  'radio.note': {
    en: 'Live radio is for passive listening. At prayer time, the local Athan reciter is played instead — streams have no defined end and can\'t be chained with Dua.',
    fr: 'La radio en direct est pour l’écoute passive. À l’heure de la prière, le récitateur local est joué à la place — les flux n’ont pas de fin définie.',
    ar: 'راديو مباشر للاستماع في الخلفية؛ يتم الانتقال إلى المقرئ المحلي تلقائياً عند حلول وقت الصلاة. علماً بأن البث المباشر مستمر دون نهاية محددة.',
  },
  'radio.note.external': {
    en: 'This station plays in your system browser because its stream is protected (HLS + WAF). Miqāt keeps running in the background.',
    fr: 'Cette station s’ouvre dans votre navigateur car son flux est protégé (HLS + WAF). Miqāt continue de fonctionner en arrière-plan.',
    ar: 'هذه المحطة تفتح في متصفّحك لأن بثّها محميّ (HLS + جدار حماية). يستمر ميقات في العمل في الخلفية.',
  },

  'settings.desc': {
    en: 'Adjust calculation method, madhab, theme, motif, and system options.',
    fr: 'Ajustez la méthode de calcul, le madhab, le thème, le motif et les options système.',
    ar: 'اضبط طريقة الحساب، المذهب، السمة، الزخرفة، وخيارات النظام.',
  },
  'loc.desc': {
    en: 'Pick a city or use GPS to compute accurate prayer times. Saved locations stay on this device.',
    fr: 'Choisissez une ville ou utilisez le GPS pour calculer des horaires précis. Les localisations restent sur l’appareil.',
    ar: 'اختر مدينة أو استخدم GPS لحساب أوقات صلاة دقيقة. المواقع المحفوظة تبقى على هذا الجهاز.',
  },
  'converter.desc': {
    en: 'Convert any Gregorian date to its Hijri equivalent.',
    fr: 'Convertissez n’importe quelle date grégorienne en sa correspondance hégirienne.',
    ar: 'حوّل أي تاريخ ميلادي إلى ما يقابله بالهجري.',
  },
  'calendar.desc': {
    en: 'Browse a full month of prayer times for your current location.',
    fr: 'Parcourez un mois complet d’horaires de prière pour votre emplacement actuel.',
    ar: 'تصفّح شهرًا كاملاً من أوقات الصلاة لموقعك الحالي.',
  },
  'settings.calc_method': { en: 'Calculation method', fr: 'Méthode de calcul', ar: 'طريقة الحساب' },
  'settings.madhab':      { en: 'Juristic method (madhab)', fr: 'Madhab (école)', ar: 'المذهب' },
  'settings.time_format': { en: 'Time format', fr: 'Format d’heure', ar: 'تنسيق الوقت' },
  'settings.theme':       { en: 'Theme',       fr: 'Thème',        ar: 'السمة' },
  'settings.motif':       { en: 'Motif',       fr: 'Motif',        ar: 'الزخرفة' },
  'settings.language':    { en: 'Language',    fr: 'Langue',       ar: 'اللغة' },
  'settings.auto_launch': { en: 'Launch at login', fr: 'Démarrer à l’ouverture', ar: 'التشغيل عند تسجيل الدخول' },

  'calendar.title':   { en: 'Monthly Calendar', fr: 'Calendrier mensuel', ar: 'التقويم الشهري' },
  'calendar.date':    { en: 'Date', fr: 'Date', ar: 'التاريخ' },
  'calendar.pick_location': { en: 'Pick a location first.', fr: 'Choisissez d’abord une localisation.', ar: 'اختر موقعًا أولاً.' },
  'calendar.loading': { en: 'Loading month…', fr: 'Chargement du mois…', ar: 'جاري التحميل…' },
  'calendar.pdf':         { en: 'Export PDF', fr: 'Exporter PDF', ar: 'تصدير PDF' },
  'calendar.pdf.tooltip': {
    en: 'Download this month as a Miqāt-branded PDF — selectable text, ready to print or share.',
    fr: 'Téléchargez le mois en PDF Miqāt — texte sélectionnable, prêt à imprimer ou partager.',
    ar: 'حمّل هذا الشهر كـ PDF بتصميم ميقات — نص قابل للنسخ، جاهز للطباعة أو المشاركة.',
  },
  'calendar.pdf.success': {
    en: 'PDF saved.',
    fr: 'PDF enregistré.',
    ar: 'تم حفظ PDF.',
  },
  'calendar.pdf.failed': {
    en: 'PDF export failed — see the developer console.',
    fr: 'L’export PDF a échoué — voir la console développeur.',
    ar: 'فشل تصدير PDF — راجع وحدة المطوّر.',
  },

  'notif.title':      { en: 'Prayer notifications', fr: 'Notifications de prière', ar: 'إشعارات الصلاة' },
  'notif.desc':       { en: 'Choose which prayers alert you, and how far in advance.', fr: 'Choisissez les prières qui vous alertent et avec quel délai.', ar: 'اختر الصلوات التي تنبهك ومدة الإشعار المسبق.' },
  'notif.grant':      { en: 'Grant permission to receive alerts', fr: 'Autorisez les notifications pour recevoir des alertes', ar: 'امنح الإذن لتلقي التنبيهات' },
  'notif.status':     { en: 'Current status:', fr: 'État actuel :', ar: 'الحالة الحالية:' },
  'notif.allow':      { en: 'Allow', fr: 'Autoriser', ar: 'السماح' },
  'notif.master':     { en: 'Enable notifications', fr: 'Activer les notifications', ar: 'تمكين الإشعارات' },
  'notif.master.desc':{ en: 'Master switch for all prayer alerts.', fr: 'Interrupteur général pour toutes les alertes.', ar: 'المفتاح الرئيسي لجميع التنبيهات.' },
  'notif.per_prayer': { en: 'Per prayer', fr: 'Par prière', ar: 'لكل صلاة' },
  'notif.sound':       { en: 'Sound', fr: 'Son', ar: 'الصوت' },
  'notif.use_default': { en: 'Use default', fr: 'Par défaut', ar: 'الافتراضي' },
  'notif.pre_title':  { en: 'Remind me in advance', fr: 'Me prévenir à l’avance', ar: 'ذكّرني قبل الوقت' },
  'notif.pre_desc':   { en: 'Fire an earlier reminder before each enabled prayer.', fr: 'Envoie un rappel avant chaque prière activée.', ar: 'أرسل تذكيرًا قبل كل صلاة مفعّلة.' },
  'notif.at_prayer':  { en: 'At prayer time', fr: 'À l’heure de la prière', ar: 'عند وقت الصلاة' },
  'notif.min_before': { en: 'minutes before', fr: 'minutes avant', ar: 'دقائق قبل' },
  'notif.test':       { en: 'Test the Athan', fr: 'Tester l’Athan', ar: 'اختبار الأذان' },
  'notif.test.desc': {
    en: 'Fires the same notification + audio your prayer-time schedule would. Bypasses the master + per-prayer toggles; respects reciter + Dua-after.',
    fr: 'Déclenche la même notification + audio qu’à l’heure de la prière. Ignore les interrupteurs principal + par prière ; respecte le récitateur + Doua.',
    ar: 'يُطلق نفس الإشعار والصوت الذي يحدث عند وقت الصلاة. يتجاوز المفاتيح الرئيسية ويحترم المُقرئ ودعاء بعد الأذان.',
  },
  'notif.test.fire':  { en: 'Fire test', fr: 'Déclencher', ar: 'تشغيل الاختبار' },

  'settings.calc.section': { en: 'Calculation', fr: 'Calcul', ar: 'الحساب' },
  'settings.appearance':   { en: 'Appearance', fr: 'Apparence', ar: 'المظهر' },
  'settings.athan_custom':         { en: 'Athan customization', fr: 'Personnalisation de l’Athan', ar: 'تخصيص الأذان' },
  'settings.athan_custom.hint': {
    en: 'Pick the global reciter, then optionally override it for each prayer.',
    fr: 'Choisissez le récitateur global, puis remplacez-le pour chaque prière si besoin.',
    ar: 'اختر المُقرئ الرئيسي، ثم استبدله لكل صلاة عند الحاجة.',
  },
  'settings.athan_custom.global':       { en: 'Global reciter', fr: 'Récitateur global', ar: 'المُقرئ الرئيسي' },
  'settings.athan_custom.per_prayer':   { en: 'Per-prayer overrides', fr: 'Remplacements par prière', ar: 'تخصيصات لكل صلاة' },
  'settings.athan_custom.use_default':  { en: 'Use default', fr: 'Par défaut', ar: 'الافتراضي' },

  /* Custom reciters — user-uploaded MP3/M4A/OGG/WAV files */
  'custom.title':       { en: 'Custom reciters', fr: 'Récitateurs personnalisés', ar: 'قرّاء مخصّصون' },
  'custom.subtitle': {
    en: 'Upload your own Athan recordings. They appear in the reciter pickers above with a ★ prefix.',
    fr: 'Téléversez vos propres enregistrements d’Athan. Ils apparaîtront dans les sélecteurs ci-dessus avec un préfixe ★.',
    ar: 'ارفع تسجيلات الأذان الخاصة بك. ستظهر في قوائم القرّاء أعلاه ببادئة ★.',
  },
  'custom.add':           { en: 'Add custom Athan', fr: 'Ajouter un Athan', ar: 'إضافة أذان مخصّص' },
  'custom.empty':         { en: 'No custom reciters yet.', fr: 'Aucun récitateur personnalisé.', ar: 'لا توجد تسجيلات مخصّصة بعد.' },
  'custom.loading':       { en: 'Loading…', fr: 'Chargement…', ar: 'جاري التحميل…' },
  'custom.row.label':     { en: 'Custom · uploaded', fr: 'Personnalisé · téléversé', ar: 'مخصّص · مرفوع' },
  'custom.delete':        { en: 'Delete', fr: 'Supprimer', ar: 'حذف' },
  'custom.confirm_delete': {
    en: 'Delete "{{name}}"? This cannot be undone.',
    fr: 'Supprimer « {{name}} » ? Action irréversible.',
    ar: 'حذف "{{name}}"؟ لا يمكن التراجع.',
  },
  'custom.deleted':       { en: 'Reciter deleted.', fr: 'Récitateur supprimé.', ar: 'تم حذف القارئ.' },
  'custom.uploaded':      { en: 'Uploaded "{{name}}".', fr: '« {{name}} » téléversé.', ar: 'تم رفع "{{name}}".' },
  'custom.preview':       { en: 'Previewing "{{name}}"', fr: 'Aperçu de « {{name}} »', ar: 'معاينة "{{name}}"' },
  'custom.error.too_large': {
    en: 'File too large — max size is {{max}}.',
    fr: 'Fichier trop volumineux — maximum {{max}}.',
    ar: 'الملف كبير جدًا — الحد الأقصى {{max}}.',
  },
  'custom.error.bad_format': {
    en: 'Unsupported audio format. Use MP3, M4A, OGG, or WAV.',
    fr: 'Format audio non supporté. Utilisez MP3, M4A, OGG ou WAV.',
    ar: 'صيغة صوتية غير مدعومة. استخدم MP3 أو M4A أو OGG أو WAV.',
  },
  'custom.name_dialog.title': { en: 'Name your reciter', fr: 'Nommer le récitateur', ar: 'سمِّ القارئ' },
  'custom.name_dialog.body': {
    en: 'Pick a label that helps you recognise this recording (e.g. "Local mosque imam").',
    fr: 'Choisissez un libellé pour reconnaître cet enregistrement (ex. « Imam de mon mosquée »).',
    ar: 'اختر تسمية تميّز هذا التسجيل (مثل "إمام مسجد الحي").',
  },
  'custom.name_dialog.cancel': { en: 'Cancel', fr: 'Annuler', ar: 'إلغاء' },
  'custom.name_dialog.upload': { en: 'Upload', fr: 'Téléverser', ar: 'رفع' },

  'settings.home_design':  { en: 'Home design (experiments)', fr: 'Design d’accueil (expériences)', ar: 'تصميم الصفحة الرئيسية (تجارب)' },
  'settings.home_design.hint': {
    en: 'Toggle on/off and watch the home update live — pick what feels right.',
    fr: 'Activez/désactivez et regardez la page d’accueil se mettre à jour en direct.',
    ar: 'فعّل/عطّل وراقب الصفحة الرئيسية تتحدّث مباشرة.',
  },
  'settings.home_design.tip_layout': {
    en: 'Tip: switch to "Split + Sun Arc" in the bottom-right layout picker to try variant C.',
    fr: 'Astuce : passez à « Split + Sun Arc » dans le sélecteur en bas à droite pour essayer la variante C.',
    ar: 'تلميح: بدّل إلى "Split + Sun Arc" من منتقي التخطيط أسفل اليمين لتجربة الخيار C.',
  },
  'settings.passed_dim':   { en: 'Variant A · Fade all passed prayers', fr: 'Variante A · Estomper toutes les prières passées', ar: 'الخيار A · إخفاء كل الصلوات الماضية' },
  'settings.passed_dim.desc': {
    en: 'Off: only the most-recently-passed prayer fades. On: every passed prayer fades — gives a clearer "morning done · now · evening to come" read.',
    fr: 'Désactivé : seule la dernière prière passée s’estompe. Activé : toutes les prières passées s’estompent.',
    ar: 'إيقاف: تخفت آخر صلاة فقط. تشغيل: تخفت كل الصلوات الماضية — يعطي قراءة أوضح للصباح والآن والمساء.',
  },
  'settings.hero_ambient': { en: 'Variant B · Time-aware ambient hero', fr: 'Variante B · Bannière ambiante selon l’heure', ar: 'الخيار B · لافتة محيطة حسب الوقت' },
  'settings.hero_ambient.desc': {
    en: 'The next-prayer banner shifts gradient + sundial mark through the day: predawn → morning → midday → dusk → night.',
    fr: 'La bannière de prochaine prière change de dégradé et de cadran solaire au fil du jour.',
    ar: 'تتغيّر لافتة الصلاة القادمة بتدرّج لوني وعلامة المزولة عبر اليوم.',
  },

  'phase.night':       { en: 'Night',     fr: 'Nuit',       ar: 'الليل' },
  'phase.predawn':     { en: 'Predawn',   fr: 'Aube',       ar: 'قبل الفجر' },
  'phase.morning':     { en: 'Morning',   fr: 'Matin',      ar: 'الصباح' },
  'phase.midday':      { en: 'Midday',    fr: 'Mi-journée', ar: 'الظهيرة' },
  'phase.afternoon':   { en: 'Afternoon', fr: 'Après-midi', ar: 'بعد الظهر' },
  'phase.dusk':        { en: 'Dusk',      fr: 'Crépuscule', ar: 'الغسق' },
  'phase.evening':     { en: 'Evening',   fr: 'Soir',       ar: 'المساء' },

  'settings.alerts':       { en: 'Alerts', fr: 'Alertes', ar: 'التنبيهات' },
  'settings.system':       { en: 'System', fr: 'Système', ar: 'النظام' },
  'settings.alerts.hint':  { en: 'Prayer notifications are managed from the bell icon in the top bar.', fr: 'Les notifications sont gérées via l’icône cloche dans la barre supérieure.', ar: 'يتم إدارة الإشعارات من أيقونة الجرس في الشريط العلوي.' },
  'settings.auto_launch.desc': { en: 'Start Miqāt automatically when you sign in.', fr: 'Démarrer Miqāt au démarrage de votre session.', ar: 'بدء ميقات تلقائيًا عند تسجيل الدخول.' },
  'settings.tf.24h':       { en: '24-hour', fr: '24 heures', ar: '24 ساعة' },
  'settings.tf.12h':       { en: '12-hour', fr: '12 heures', ar: '12 ساعة' },
  'settings.theme.miqat':  { en: 'Miqāt (default)', fr: 'Miqāt (par défaut)', ar: 'ميقات (افتراضي)' },
  'settings.theme.light':  { en: 'Light', fr: 'Clair', ar: 'فاتح' },
  'settings.theme.dark':   { en: 'Dark', fr: 'Sombre', ar: 'داكن' },
  'settings.theme.paper':  { en: 'Paper', fr: 'Papier', ar: 'ورقي' },
  'settings.motif.star':   { en: '8-pointed star', fr: 'Étoile à 8 branches', ar: 'نجمة ثمانية' },
  'settings.motif.dots':   { en: 'Dots', fr: 'Points', ar: 'نقاط' },
  'settings.motif.none':   { en: 'None', fr: 'Aucun', ar: 'بدون' },

  'settings.custom_angles':        { en: 'Custom twilight angles', fr: 'Angles crépusculaires personnalisés', ar: 'زوايا الشفق المخصصة' },
  'settings.custom_fajr_angle':    { en: 'Fajr angle',  fr: 'Angle du Fajr',  ar: 'زاوية الفجر' },
  'settings.custom_isha_angle':    { en: 'Isha angle',  fr: 'Angle du Isha',  ar: 'زاوية العشاء' },
  'settings.custom_isha_interval': { en: 'Isha interval (0 = use angle)', fr: 'Intervalle Isha (0 = angle)', ar: 'فاصل العشاء (0 = زاوية)' },
  'settings.custom_angles.hint':   {
    en: 'Used only when the method is "Custom". Typical Fajr/Isha range is 12–20°. Set the Isha interval > 0 to use fixed minutes after Maghrib (overrides the angle).',
    fr: 'Utilisé uniquement avec la méthode « Personnalisée ». Plage typique : 12–20°. Un intervalle Isha > 0 fixe un nombre de minutes après le Maghrib (remplace l’angle).',
    ar: 'يُستخدم فقط عند اختيار طريقة "مخصصة". النطاق المعتاد 12–20°. إذا كان الفاصل > 0 يُستخدم عدد الدقائق بعد المغرب بدلًا من الزاوية.',
  },

  /* Help dialog — feature documentation */
  'help.title':    { en: 'Help & documentation', fr: 'Aide et documentation', ar: 'المساعدة والتوثيق' },
  'help.intro': {
    en: 'Quick reference for every Miqāt feature. New here? Take the guided tour below.',
    fr: 'Référence rapide pour chaque fonctionnalité de Miqāt. Nouveau ? Lancez la visite guidée ci-dessous.',
    ar: 'مرجع سريع لكل ميزة في ميقات. أنت جديد هنا؟ ابدأ الجولة التعريفية أدناه.',
  },
  'help.contact':  { en: 'Contact us:', fr: 'Contactez-nous :', ar: 'تواصل معنا:' },
  'help.docs':     { en: 'Online docs', fr: 'Documentation', ar: 'التوثيق على الإنترنت' },

  'help.tour.cta.title':  { en: 'Take the guided tour', fr: 'Visite guidée', ar: 'الجولة التعريفية' },
  'help.tour.cta.body': {
    en: 'A 9-step walkthrough of the main features. Takes about a minute.',
    fr: 'Une visite en 9 étapes des fonctionnalités principales. Environ une minute.',
    ar: 'جولة من 9 خطوات للميزات الرئيسية. تستغرق حوالي دقيقة.',
  },
  'help.tour.cta.button': { en: 'Start tour', fr: 'Commencer', ar: 'ابدأ' },
  'help.feedback.button': { en: 'Submit feedback', fr: 'Envoyer un retour', ar: 'إرسال ملاحظات' },

  /* Feedback dialog — bug report / feature request / general feedback */
  'feedback.title':   { en: 'Send feedback', fr: 'Envoyer un retour', ar: 'إرسال ملاحظات' },
  'feedback.intro': {
    en: 'Spotted a bug, missing a feature, or just want to say hi? Your message will open in your default mail client (and also be copied to the clipboard as a backup).',
    fr: 'Vous avez trouvé un bug, une fonctionnalité manquante, ou simplement envie de dire bonjour ? Votre message s’ouvrira dans votre client mail par défaut (et sera aussi copié dans le presse-papiers comme sauvegarde).',
    ar: 'وجدت خطأ، أو ميزة ناقصة، أو تريد فقط التحية؟ ستُفتح رسالتك في برنامج البريد الافتراضي (وستُنسخ أيضاً إلى الحافظة كنسخة احتياطية).',
  },
  'feedback.type':              { en: 'Type', fr: 'Type', ar: 'النوع' },
  'feedback.type.bug':          { en: 'Bug report', fr: 'Rapport de bug', ar: 'تقرير خطأ' },
  'feedback.type.feature':      { en: 'Feature request', fr: 'Suggestion de fonctionnalité', ar: 'اقتراح ميزة' },
  'feedback.type.feedback':     { en: 'General feedback', fr: 'Retour général', ar: 'ملاحظات عامة' },
  'feedback.subject':           { en: 'Subject', fr: 'Sujet', ar: 'الموضوع' },
  'feedback.subject.placeholder': { en: 'Short summary', fr: 'Résumé court', ar: 'ملخص قصير' },
  'feedback.message':           { en: 'Message', fr: 'Message', ar: 'الرسالة' },
  'feedback.message.placeholder': {
    en: 'What happened? What did you expect? Steps to reproduce help a lot.',
    fr: 'Que s’est-il passé ? Qu’attendiez-vous ? Les étapes pour reproduire aident beaucoup.',
    ar: 'ماذا حدث؟ ماذا توقعت؟ خطوات إعادة الإنتاج تساعد كثيراً.',
  },
  'feedback.email':             { en: 'Reply email', fr: 'Email de réponse', ar: 'بريد للرد' },
  'feedback.email.optional':    { en: 'optional', fr: 'optionnel', ar: 'اختياري' },
  'feedback.privacy': {
    en: 'No data leaves your device until you press Send. We attach the app version, OS, and browser engine to help us reproduce — that\'s it. No tracking.',
    fr: 'Aucune donnée ne quitte votre appareil jusqu’à ce que vous appuyiez sur Envoyer. Nous joignons la version, l’OS et le moteur du navigateur pour aider à reproduire — c’est tout. Aucun tracking.',
    ar: 'لا تغادر أي بيانات جهازك حتى تضغط على إرسال. نرفق إصدار التطبيق ونظام التشغيل ومحرك المتصفح لمساعدتنا في إعادة الإنتاج — هذا فقط. لا تتبع.',
  },
  'feedback.copy_only':         { en: 'Copy to clipboard', fr: 'Copier', ar: 'نسخ' },
  'feedback.submit':            { en: 'Open in mail', fr: 'Ouvrir dans le mail', ar: 'فتح في البريد' },

  'feedback.success.opened':    { en: 'Opened in your mail client. Hit Send to deliver.', fr: 'Ouvert dans votre client mail. Cliquez sur Envoyer pour livrer.', ar: 'افتُح في برنامج البريد. اضغط إرسال للتسليم.' },
  'feedback.success.no_mailto': { en: 'No mail client found. Your message is on the clipboard — paste it into webmail or a chat to contact@miqaaat.com.', fr: 'Aucun client mail trouvé. Votre message est dans le presse-papiers — collez-le dans un webmail ou chat à contact@miqaaat.com.', ar: 'لم يُعثر على برنامج بريد. رسالتك في الحافظة — الصقها في بريد ويب أو دردشة إلى contact@miqaaat.com.' },
  'feedback.success.copied':    { en: 'Copied to clipboard.', fr: 'Copié dans le presse-papiers.', ar: 'تم النسخ إلى الحافظة.' },
  'feedback.error.empty_message': { en: 'Please write a message.', fr: 'Veuillez écrire un message.', ar: 'يرجى كتابة رسالة.' },
  'feedback.error.send_failed': { en: 'Could not open mail client.', fr: 'Impossible d’ouvrir le client mail.', ar: 'تعذر فتح برنامج البريد.' },
  'feedback.error.copy_failed': { en: 'Clipboard access denied.', fr: 'Accès au presse-papiers refusé.', ar: 'تم رفض الوصول إلى الحافظة.' },

  'help.location.title': { en: 'Set your location', fr: 'Définir votre position', ar: 'تعيين موقعك' },
  'help.location.body': {
    en: 'Click the location pin in the top bar. Use GPS, search by city, or pick a saved location. All prayer times are computed from your coordinates and timezone.',
    fr: "Cliquez sur l'épingle de localisation en haut. Utilisez le GPS, recherchez par ville ou choisissez un emplacement enregistré. Tous les horaires de prière sont calculés à partir de vos coordonnées et fuseau horaire.",
    ar: 'انقر على دبوس الموقع في الشريط العلوي. استخدم GPS، أو ابحث عن المدينة، أو اختر موقعاً محفوظاً. تُحسب جميع أوقات الصلاة من إحداثياتك ومنطقتك الزمنية.',
  },
  'help.athan.title': { en: 'Athan playback', fr: 'Lecture de l’adhan', ar: 'تشغيل الأذان' },
  'help.athan.body': {
    en: 'Pick a reciter (Makkah, Madina, Al-Aqsa, Egypt, Moroccan, or upload your own MP3) from the Athan player on the left. The chosen athan plays automatically at every prayer time in a small popup window — even if you minimize the app to the tray.',
    fr: 'Choisissez un récitateur (Makkah, Médine, Al-Aqsa, Égypte, marocain, ou téléchargez votre propre MP3) depuis le lecteur d’adhan à gauche. L’adhan choisi joue automatiquement à chaque prière dans une petite fenêtre — même si vous réduisez l’app dans la zone de notification.',
    ar: 'اختر القارئ (مكة، المدينة، الأقصى، مصر، المغرب، أو ارفع ملف MP3 خاصاً بك) من مشغل الأذان على اليسار. يعمل الأذان المختار تلقائياً في كل وقت صلاة في نافذة صغيرة — حتى إذا قمت بتصغير التطبيق.',
  },
  'help.calc.title': { en: 'Calculation method', fr: 'Méthode de calcul', ar: 'طريقة الحساب' },
  'help.calc.body': {
    en: 'In Settings → Calculation, choose the method (Muslim World League, Egyptian, Umm al-Qura, etc.) and madhab (Shafi/Hanafi). The custom method lets you enter your own Fajr/Isha angles for non-standard schedules.',
    fr: 'Dans Paramètres → Calcul, choisissez la méthode (Ligue Mondiale Musulmane, Égyptienne, Umm al-Qura, etc.) et le madhhab (Shafi/Hanafi). La méthode personnalisée permet d’entrer vos propres angles Fajr/Isha.',
    ar: 'في الإعدادات → الحساب، اختر الطريقة (رابطة العالم الإسلامي، المصرية، أم القرى، إلخ) والمذهب (شافعي/حنفي). تتيح الطريقة المخصصة إدخال زاوياك الخاصة بالفجر/العشاء.',
  },
  'help.notif.title': { en: 'Notifications', fr: 'Notifications', ar: 'الإشعارات' },
  'help.notif.body': {
    en: 'Toggle desktop notifications and per-prayer toggles in the bell icon (top bar). Pre-alerts (5/10/15 min before) are configurable. The athan popup is independent of OS notifications — it always opens at prayer time when notifications are enabled.',
    fr: 'Activez les notifications de bureau et les toggles par prière via l’icône cloche (barre du haut). Les pré-alertes (5/10/15 min avant) sont configurables. La fenêtre d’adhan est indépendante des notifications système — elle s’ouvre toujours à l’heure quand les notifications sont activées.',
    ar: 'فعّل إشعارات سطح المكتب والمفاتيح لكل صلاة من أيقونة الجرس (الشريط العلوي). يمكن ضبط التنبيهات المسبقة (5/10/15 دقيقة قبل). نافذة الأذان مستقلة عن إشعارات النظام — تفتح دائماً في وقت الصلاة.',
  },
  'help.adjust.title': { en: 'Time adjustments', fr: 'Ajustements horaires', ar: 'تعديلات الوقت' },
  'help.adjust.body': {
    en: 'Settings → Time adjustments lets you shift each prayer ±60 min to match your local mosque. The "Global shift" preset (±2h in 30-min steps) handles OS timezone mismatches like Morocco’s permanent UTC+1 with stale Windows tzdata.',
    fr: 'Paramètres → Ajustements horaires permet de décaler chaque prière de ±60 min pour votre mosquée. Le préréglage "Décalage global" (±2h par pas de 30 min) gère les décalages de fuseau OS comme l’UTC+1 permanent du Maroc.',
    ar: 'الإعدادات → تعديلات الوقت تتيح تحريك كل صلاة ±60 دقيقة لمطابقة مسجدك. الإعداد "التحويل الشامل" (±2س بخطوات 30 دقيقة) يعالج تباينات المنطقة الزمنية في النظام مثل UTC+1 الدائم في المغرب.',
  },
  'help.qibla.title': { en: 'Qibla direction', fr: 'Direction de la qibla', ar: 'اتجاه القبلة' },
  'help.qibla.body': {
    en: 'Bottom of the screen shows the bearing in degrees from your location to Makkah, plus the distance. Toggle between an arrow (works offline) and a map (requires internet).',
    fr: 'Le bas de l’écran affiche le relèvement en degrés de votre position vers la Mecque, ainsi que la distance. Basculez entre une flèche (hors ligne) et une carte (internet requis).',
    ar: 'يعرض أسفل الشاشة الاتجاه بالدرجات من موقعك إلى مكة، مع المسافة. بدّل بين السهم (يعمل دون إنترنت) والخريطة (يتطلب إنترنت).',
  },
  'help.monthly.title': { en: 'Monthly calendar', fr: 'Calendrier mensuel', ar: 'التقويم الشهري' },
  'help.monthly.body': {
    en: 'Bottom bar → Monthly opens the full month view of all prayer times. Export to PDF for printing or sharing with your community.',
    fr: 'Barre du bas → Mensuel ouvre la vue complète du mois de tous les horaires. Exportez en PDF pour imprimer ou partager.',
    ar: 'الشريط السفلي → الشهري يفتح عرض الشهر الكامل لجميع أوقات الصلاة. صدّر إلى PDF للطباعة أو المشاركة مع مجتمعك.',
  },
  'help.jumuah.title': { en: 'Friday (Jumu\'ah) features', fr: 'Fonctionnalités du vendredi', ar: 'ميزات الجمعة' },
  'help.jumuah.body': {
    en: 'Every Friday, the app surfaces: Surah Al-Kahf reminder, Salawat counter (tap to track your daily 100), the "hour of acceptance" banner before Maghrib, and a khutbah-time notice while the imam is on the minbar. Toggle each in Settings → Jumu\'ah.',
    fr: 'Chaque vendredi, l’app affiche : rappel de la sourate Al-Kahf, compteur de Salawat (touchez pour suivre vos 100 quotidiens), bannière "heure d’acceptation" avant Maghrib, et un avis pendant la khutbah. Activez chacun dans Paramètres → Jumu\'ah.',
    ar: 'كل جمعة، يعرض التطبيق: تذكير سورة الكهف، عدّاد الصلوات (اضغط لتتبع المئة اليومية)، شعار "ساعة الإجابة" قبل المغرب، وإشعار خلال الخطبة. فعّل كل منها في الإعدادات → الجمعة.',
  },
  'help.theme.title': { en: 'Themes & layouts', fr: 'Thèmes et mises en page', ar: 'السمات والتخطيطات' },
  'help.theme.body': {
    en: 'Top bar → theme toggle cycles Light/Dark/Paper/Miqāt. Bottom-right → layout switcher picks one of 5 home layouts (Split, Hero, Sun-arc, Focus, Compact). Language picker (EN/FR/AR) is next to it.',
    fr: 'Barre du haut → bouton thème alterne Clair/Sombre/Papier/Miqāt. En bas à droite → sélecteur de disposition choisit l’une des 5 dispositions (Split, Hero, Sun-arc, Focus, Compact). Sélecteur de langue (EN/FR/AR) à côté.',
    ar: 'الشريط العلوي → زر السمة يتنقل بين الفاتح/الداكن/الورقي/ميقات. أسفل اليمين → محول التخطيط يختار من 5 تخطيطات (Split، Hero، Sun-arc، Focus، Compact). محدد اللغة (EN/FR/AR) بجواره.',
  },
  'help.privacy.title': { en: 'Privacy & data', fr: 'Confidentialité et données', ar: 'الخصوصية والبيانات' },
  'help.privacy.body': {
    en: 'Everything stays on your device. Settings, saved locations, and uploaded athans live in %APPDATA%/Miqāt (Windows) — never sent anywhere. Outbound requests: Aladhan (prayer-time refresh), OpenStreetMap Nominatim (city search), ipapi.co (IP-geolocation fallback for the GPS button), OSM tiles (Qibla map). All over HTTPS. The diagnostic snapshot includes your coordinates and timezone — share it carefully when reporting bugs.',
    fr: 'Tout reste sur votre appareil. Paramètres, lieux enregistrés et adhans téléchargés sont dans %APPDATA%/Miqāt (Windows) — jamais envoyés ailleurs. Requêtes sortantes : Aladhan, OpenStreetMap Nominatim, ipapi.co, tuiles OSM. Tout en HTTPS. L’instantané de diagnostic contient vos coordonnées et fuseau — partagez-le avec précaution.',
    ar: 'كل شيء يبقى على جهازك. الإعدادات والمواقع المحفوظة والأذان المرفوع في %APPDATA%/Miqāt (ويندوز) — لا تُرسل لأي مكان. الطلبات الخارجية: Aladhan، OpenStreetMap، ipapi.co، خرائط OSM. كلها عبر HTTPS. تحتوي لقطة التشخيص على إحداثياتك ومنطقتك الزمنية — شاركها بحذر.',
  },

  'help.diagnostics.title': { en: 'Diagnostics', fr: 'Diagnostics', ar: 'التشخيص' },
  'help.diagnostics.body': {
    en: 'If something looks wrong (times off, no audio), Settings → Diagnostics has buttons to open the log folder, copy a snapshot of current state, or download it as JSON. Send these with bug reports.',
    fr: 'Si quelque chose ne va pas (horaires faux, pas d’audio), Paramètres → Diagnostics propose des boutons pour ouvrir le dossier de logs, copier un instantané de l’état actuel, ou le télécharger en JSON. Envoyez-les avec les rapports de bug.',
    ar: 'إذا بدا شيء خاطئ (أوقات غير صحيحة، لا صوت)، الإعدادات → التشخيص يحتوي على أزرار لفتح مجلد السجلات، نسخ لقطة من الحالة الحالية، أو تنزيلها كـ JSON. أرسلها مع تقارير الأخطاء.',
  },

  /* Product tour (driver.js) — first-launch walkthrough */
  'tour.next':     { en: 'Next', fr: 'Suivant', ar: 'التالي' },
  'tour.prev':     { en: 'Back', fr: 'Précédent', ar: 'السابق' },
  'tour.done':     { en: 'Done', fr: 'Terminé', ar: 'تم' },
  'tour.progress': { en: '{{current}} of {{total}}', fr: '{{current}} sur {{total}}', ar: '{{current}} من {{total}}' },

  'tour.welcome.title': { en: 'Welcome to Miqāt', fr: 'Bienvenue sur Miqāt', ar: 'مرحباً بك في ميقات' },
  'tour.welcome.body': {
    en: 'A quick tour of the main features — about a minute. You can dismiss anytime with the X.',
    fr: 'Une brève visite des fonctionnalités principales — environ une minute. Vous pouvez fermer à tout moment avec le X.',
    ar: 'جولة سريعة بالميزات الرئيسية — حوالي دقيقة. يمكنك الإغلاق في أي وقت عبر X.',
  },
  'tour.next_prayer.title': { en: 'Next prayer & countdown', fr: 'Prochaine prière', ar: 'الصلاة التالية' },
  'tour.next_prayer.body': {
    en: 'Live countdown to the next prayer with a phase-aware sun. The card hue shifts gently across the day.',
    fr: 'Compte à rebours en direct vers la prochaine prière avec un soleil dynamique. La teinte change au fil de la journée.',
    ar: 'عد تنازلي مباشر للصلاة التالية مع شمس متغيرة. تتغير ألوان البطاقة بمرور اليوم.',
  },
  'tour.prayer_grid.title': { en: 'All five prayers', fr: 'Les cinq prières', ar: 'الصلوات الخمس' },
  'tour.prayer_grid.body': {
    en: 'Today’s schedule at a glance. The "next" prayer is highlighted; passed prayers dim. Friday relabels Dhuhr to Jumu\'ah.',
    fr: 'L’horaire du jour en un coup d’œil. La prochaine est en surbrillance ; les passées sont atténuées. Le vendredi, Dhuhr devient Jumu\'ah.',
    ar: 'جدول اليوم في لمحة. الصلاة التالية مميزة؛ الصلوات الفائتة باهتة. يوم الجمعة، تظهر الجمعة بدل الظهر.',
  },
  'tour.athan_player.title': { en: 'Athan player', fr: 'Lecteur d’adhan', ar: 'مشغل الأذان' },
  'tour.athan_player.body': {
    en: 'Pick from 5 built-in reciters or upload your own MP3. The chosen athan auto-plays in a popup window at every prayer.',
    fr: 'Choisissez parmi 5 récitateurs intégrés ou téléchargez votre MP3. L’adhan choisi se lance dans une fenêtre à chaque prière.',
    ar: 'اختر من 5 قراء مدمجين أو ارفع ملف MP3 خاصاً بك. يتم تشغيل الأذان المختار تلقائياً في نافذة عند كل صلاة.',
  },
  'tour.location.title': { en: 'Your location', fr: 'Votre position', ar: 'موقعك' },
  'tour.location.body': {
    en: 'Click here to set or change your location. GPS, city search, or a saved place — all work offline once set.',
    fr: 'Cliquez ici pour définir ou changer votre position. GPS, recherche de ville, ou lieu enregistré — tout fonctionne hors ligne une fois défini.',
    ar: 'انقر هنا لتعيين موقعك أو تغييره. GPS، أو البحث عن مدينة، أو موقع محفوظ — كلها تعمل دون إنترنت بعد التعيين.',
  },
  'tour.qibla.title': { en: 'Qibla direction', fr: 'Direction de la qibla', ar: 'اتجاه القبلة' },
  'tour.qibla.body': {
    en: 'Bearing to Makkah from your location. Switch between arrow and map view.',
    fr: 'Direction vers la Mecque depuis votre position. Basculez entre flèche et carte.',
    ar: 'الاتجاه إلى مكة من موقعك. بدّل بين السهم والخريطة.',
  },
  'tour.monthly.title': { en: 'Monthly calendar', fr: 'Calendrier mensuel', ar: 'التقويم الشهري' },
  'tour.monthly.body': {
    en: 'Open the full month view and export to PDF for printing.',
    fr: 'Ouvrez la vue mensuelle complète et exportez en PDF.',
    ar: 'افتح عرض الشهر الكامل وصدّر إلى PDF.',
  },
  'tour.settings.title': { en: 'Settings', fr: 'Paramètres', ar: 'الإعدادات' },
  'tour.settings.body': {
    en: 'Calculation method, theme, layout, time adjustments, custom reciters — everything is here.',
    fr: 'Méthode de calcul, thème, disposition, ajustements, récitateurs personnalisés — tout est ici.',
    ar: 'طريقة الحساب، السمة، التخطيط، التعديلات، القراء المخصصون — كل شيء هنا.',
  },
  'tour.done.title': { en: "You're all set!", fr: 'Vous êtes prêt !', ar: 'أنت جاهز!' },
  'tour.done.body': {
    en: 'Open Help anytime from the bottom bar to replay this tour or read the full feature reference.',
    fr: 'Ouvrez Aide depuis la barre du bas à tout moment pour rejouer cette visite ou lire la référence complète.',
    ar: 'افتح المساعدة من الشريط السفلي في أي وقت لإعادة تشغيل الجولة أو قراءة المرجع الكامل.',
  },

  /* Athan popup — auto-launching always-on-top window at prayer time */
  'athanpopup.playing_label': { en: 'Now playing', fr: 'En cours', ar: 'قيد التشغيل' },
  'athanpopup.dua_label':     { en: "Du'ā after", fr: 'Du`ā après', ar: 'دعاء بعد الأذان' },
  'athanpopup.elapsed_label': { en: 'Since athan', fr: 'Depuis l’adhan', ar: 'منذ الأذان' },
  'athanpopup.since':         { en: 'since', fr: 'depuis', ar: 'منذ' },

  /* Time adjustments — per-prayer minute offsets, ±60 max */
  'settings.offsets.title':    { en: 'Time adjustments', fr: 'Ajustements horaires', ar: 'تعديلات الوقت' },
  'settings.offsets.subtitle': {
    en: 'Shift each prayer ±60 minutes to match your local mosque or community schedule.',
    fr: 'Décalez chaque prière de ±60 minutes pour correspondre à votre mosquée ou communauté locale.',
    ar: 'حرّك كل صلاة ±60 دقيقة لمطابقة جدول مسجدك أو مجتمعك المحلي.',
  },
  'settings.offsets.unit':     { en: 'min', fr: 'min', ar: 'د' },
  'settings.offsets.reset':    { en: 'Reset all', fr: 'Tout réinitialiser', ar: 'إعادة الكل' },
  'settings.offsets.hint': {
    en: 'Positive = later, negative = earlier. Notifications + the daily schedule both honour these offsets.',
    fr: 'Positif = plus tard, négatif = plus tôt. Les notifications et le programme quotidien respectent ces décalages.',
    ar: 'موجب = أحدث، سالب = أبكر. تحترم الإشعارات والجدول اليومي هذه التعديلات.',
  },
  'settings.offsets.per_prayer': {
    en: 'Per prayer',
    fr: 'Par prière',
    ar: 'لكل صلاة',
  },

  /* Global shift — DST/summer-time / OS-tz correction */
  'settings.offsets.global.title': {
    en: 'Global shift (DST / summer time)',
    fr: 'Décalage global (DST / heure d’été)',
    ar: 'إزاحة شاملة (التوقيت الصيفي)',
  },
  'settings.offsets.global.subtitle': {
    en: 'Applied on top of every per-prayer offset. Use when your OS reports the wrong time (e.g. Morocco permanent UTC+1 with stale Windows tzdata).',
    fr: 'Ajouté à chaque décalage par prière. À utiliser quand votre OS rapporte l’heure incorrecte (ex. UTC+1 permanent au Maroc avec tzdata obsolète).',
    ar: 'يُضاف فوق كل تعديل لكل صلاة. استخدمه عندما يُبلِّغ نظامك بوقت خاطئ (مثل المغرب +1 الدائم مع بيانات منطقة زمنية قديمة).',
  },
  'settings.offsets.global.auto':     { en: 'No shift', fr: 'Aucun décalage', ar: 'بدون إزاحة' },
  'settings.offsets.global.minus_2h': { en: '−2 hours',  fr: '−2 heures', ar: '−ساعتان' },
  'settings.offsets.global.minus_1h': { en: '−1 hour',   fr: '−1 heure',  ar: '−ساعة' },
  'settings.offsets.global.minus_30': { en: '−30 min',   fr: '−30 min',   ar: '−٣٠ د' },
  'settings.offsets.global.plus_30':  { en: '+30 min',   fr: '+30 min',   ar: '+٣٠ د' },
  'settings.offsets.global.plus_1h':  { en: '+1 hour',   fr: '+1 heure',  ar: '+ساعة' },
  'settings.offsets.global.plus_2h':  { en: '+2 hours',  fr: '+2 heures', ar: '+ساعتان' },

  'converter.title':  { en: 'Gregorian ↔ Hijri Converter', fr: 'Convertisseur Grégorien ↔ Hégire', ar: 'محوّل الميلادي ↔ الهجري' },
  'converter.gregorian': { en: 'Gregorian date', fr: 'Date grégorienne', ar: 'التاريخ الميلادي' },
  'converter.hijri':  { en: 'Hijri', fr: 'Hégire', ar: 'الهجري' },
  'converter.computing': { en: 'Computing…', fr: 'Calcul…', ar: 'جاري الحساب…' },

  'onboard.welcome':  { en: 'Welcome', fr: 'Bienvenue', ar: 'مرحبًا' },
  'onboard.tagline':  { en: 'A serene, modern Athan app. Prayer times, Qibla, Hijri calendar — works offline, synced worldwide.', fr: 'Une application Athan moderne et sereine. Prière, Qibla, calendrier hégirien — hors ligne.', ar: 'تطبيق أذان عصري وهادئ. أوقات الصلاة والقبلة والتقويم الهجري — يعمل دون اتصال.' },
  'onboard.start':    { en: 'Get started', fr: 'Commencer', ar: 'ابدأ' },
  'onboard.where':    { en: 'Where are you?', fr: 'Où êtes-vous ?', ar: 'أين أنت؟' },
  'onboard.where.desc': { en: 'We need your location to compute accurate prayer times. Your data never leaves the device.', fr: 'Nous avons besoin de votre position pour des horaires précis. Les données restent sur l’appareil.', ar: 'نحتاج موقعك لحساب أوقات دقيقة. بياناتك لا تغادر الجهاز.' },
  'onboard.use_gps':  { en: 'Use my current location', fr: 'Utiliser ma position actuelle', ar: 'استخدم موقعي الحالي' },
  'onboard.later':    { en: "I'll search later", fr: 'Je chercherai plus tard', ar: 'سأبحث لاحقًا' },
  'onboard.ready':    { en: "You're all set", fr: 'Tout est prêt', ar: 'كل شيء جاهز' },
  'onboard.ready.desc': { en: 'Adjust calculation method, madhab, theme, and more in Settings anytime.', fr: 'Ajustez la méthode, le madhab, le thème, etc. dans les Paramètres.', ar: 'عدّل طريقة الحساب والمذهب والسمة من الإعدادات.' },
  'onboard.open':     { en: 'Open the app', fr: 'Ouvrir l’application', ar: 'افتح التطبيق' },

  'loc.no_location':  { en: 'No location set. Use the button in the top bar to pick one.', fr: 'Aucune localisation. Utilisez le bouton en haut pour en choisir une.', ar: 'لم يتم تعيين موقع. استخدم الزر في الأعلى.' },
  'loc.choose':       { en: 'Choose a location to see prayer times.', fr: 'Choisissez une localisation pour voir les horaires.', ar: 'اختر موقعًا لعرض أوقات الصلاة.' },
  'loc.computing':    { en: 'Computing prayer times…', fr: 'Calcul des horaires…', ar: 'جاري حساب أوقات الصلاة…' },
  'loc.gps.current':  { en: 'Current location', fr: 'Position actuelle', ar: 'الموقع الحالي' },

  /* Layout names — used by the bottom-right layout switcher. Names kept short
     so the trigger doesn't truncate on typical viewport widths. */
  'layout.split.name':     { en: 'Split (hybrid)',     fr: 'Mosaïque',            ar: 'مقسّم' },
  'layout.split.desc':     { en: 'Left rail · grid · right rail', fr: 'Rail gauche · grille · rail droit', ar: 'يسار · شبكة · يمين' },
  'layout.splitarc.name':  { en: 'Split + Sun Arc',    fr: 'Mosaïque + arc solaire', ar: 'مقسّم + قوس الشمس' },
  'layout.splitarc.desc':  { en: 'Sidebars + horizon-arc strip', fr: 'Sidebars + ruban arc d’horizon', ar: 'الأشرطة الجانبية + شريط القوس' },
  'layout.classic.name':   { en: 'Classic Dashboard',  fr: 'Tableau classique',   ar: 'لوحة كلاسيكية' },
  'layout.classic.desc':   { en: 'Prayer list centre, sidebars', fr: 'Liste centrale + sidebars', ar: 'قائمة وسطى مع أشرطة جانبية' },
  'layout.hero.name':      { en: 'Hero First',         fr: 'Hero d’abord',        ar: 'الواجهة أولًا' },
  'layout.hero.desc':      { en: 'Giant next-prayer hero', fr: 'Grand bandeau prochaine prière', ar: 'لافتة كبيرة للصلاة القادمة' },
  'layout.sunarc.name':    { en: 'Sun Arc Timeline',   fr: 'Chronologie solaire', ar: 'الخط الزمني الشمسي' },
  'layout.sunarc.desc':    { en: 'Sunrise→sunset arc', fr: 'Arc lever→coucher',   ar: 'قوس الشروق إلى الغروب' },
  'layout.focus.name':     { en: 'Focus Mode',         fr: 'Mode focus',          ar: 'وضع التركيز' },
  'layout.focus.desc':     { en: 'Minimal · next prayer only', fr: 'Minimal · prochaine prière uniquement', ar: 'مبسّط · الصلاة القادمة فقط' },

  /* ---------------------------------------------------------------------- */
  /* Jumu'ah Mubarak — Friday-only surface */

  'jumuah.ribbon.greeting': { en: 'Jumu’ah Mubarak', fr: 'Joumou’a Moubarak', ar: 'جمعة مباركة' },
  'jumuah.ribbon.tagline':  { en: 'the best day on which the sun has risen', fr: 'le meilleur jour sur lequel le soleil se soit levé', ar: 'خير يوم طلعت عليه الشمس' },

  'jumuah.hero.eyebrow':    { en: 'Today is Jumu’ah', fr: 'Aujourd’hui c’est Joumou’a', ar: 'اليوم هو الجمعة' },
  'jumuah.hero.greeting':   { en: 'Jumu’ah Mubarak', fr: 'Joumou’a Moubarak', ar: 'جمعة مباركة' },
  'jumuah.hero.in':         { en: 'Jumu’ah in', fr: 'Joumou’a dans', ar: 'الجمعة بعد' },
  'jumuah.hero.at':         { en: 'at', fr: 'à', ar: 'في' },
  'jumuah.hero.khutbah.title': { en: 'The imam is on the minbar', fr: 'L’imam est sur le minbar', ar: 'الإمام على المنبر' },
  'jumuah.hero.khutbah.body':  {
    en: 'The angels close their books — listen attentively to the khutbah.',
    fr: 'Les anges referment leurs registres — écoutez attentivement la khoutba.',
    ar: 'الملائكة تطوي صحفها — أنصت للخطبة.',
  },
  'jumuah.hero.done': {
    en: 'Jumu’ah has passed. The barakah of the day continues — keep adhkar and salawat.',
    fr: 'Joumou’a est passée. La barakah du jour continue — poursuivez les invocations et la salawat.',
    ar: 'انتهت الجمعة. تستمر بركة اليوم — أكثر من الأذكار والصلاة على النبي.',
  },

  'jumuah.meter.title':         { en: 'Ajr ladder', fr: 'Échelle d’ajr', ar: 'سُلَّم الأجر' },
  'jumuah.meter.state.pending': { en: 'Before sunrise', fr: 'Avant le lever du soleil', ar: 'قبل الشروق' },
  'jumuah.meter.state.active':  { en: 'Window open', fr: 'Fenêtre ouverte', ar: 'النافذة مفتوحة' },
  'jumuah.meter.state.khutbah': { en: 'Khutbah · books closed', fr: 'Khoutba · registres fermés', ar: 'الخطبة · طُويت الصحف' },
  'jumuah.meter.state.done':    { en: 'Day complete', fr: 'Journée complète', ar: 'انتهى اليوم' },
  'jumuah.meter.hadith': {
    en: '“Whoever bathes on Friday and goes early in the first hour, it is as if he sacrificed a camel; in the second, a cow; the third, a ram; the fourth, a hen; the fifth, an egg. When the imam comes out, the angels are present to listen.” — Bukhari · Muslim',
    fr: '« Quiconque fait les grandes ablutions le vendredi puis se rend tôt à la mosquée dans la première heure, c’est comme s’il avait sacrifié un chameau ; dans la deuxième, une vache ; la troisième, un bélier ; la quatrième, une poule ; la cinquième, un œuf. Lorsque l’imam paraît, les anges écoutent. » — Boukhari · Mouslim',
    ar: '«من اغتسل يوم الجمعة وراح في الساعة الأولى فكأنما قرّب بدنة، وفي الثانية كأنما قرّب بقرة، وفي الثالثة كأنما قرّب كبشًا، وفي الرابعة كأنما قرّب دجاجة، وفي الخامسة كأنما قرّب بيضة، فإذا خرج الإمام حضرت الملائكة يستمعون». — البخاري · مسلم',
  },

  'jumuah.ordinal.1': { en: '1st', fr: '1ʳᵉ', ar: 'الأولى' },
  'jumuah.ordinal.2': { en: '2nd', fr: '2ᵉ',  ar: 'الثانية' },
  'jumuah.ordinal.3': { en: '3rd', fr: '3ᵉ',  ar: 'الثالثة' },
  'jumuah.ordinal.4': { en: '4th', fr: '4ᵉ',  ar: 'الرابعة' },
  'jumuah.ordinal.5': { en: '5th', fr: '5ᵉ',  ar: 'الخامسة' },

  'jumuah.ajr.camel': { en: 'Camel', fr: 'Chameau', ar: 'بَدَنَة' },
  'jumuah.ajr.cow':   { en: 'Cow',   fr: 'Vache',   ar: 'بقرة' },
  'jumuah.ajr.ram':   { en: 'Ram',   fr: 'Bélier',  ar: 'كبش' },
  'jumuah.ajr.hen':   { en: 'Hen',   fr: 'Poule',   ar: 'دجاجة' },
  'jumuah.ajr.egg':   { en: 'Egg',   fr: 'Œuf',     ar: 'بيضة' },

  'jumuah.adhkar.title': { en: 'Friday adhkar', fr: 'Adhkar du vendredi', ar: 'أذكار يوم الجمعة' },

  'jumuah.acceptance.title': { en: 'Hour of acceptance', fr: 'Heure de l’exaucement', ar: 'ساعة الإجابة' },
  'jumuah.acceptance.body':  {
    en: 'A du’a in this last hour before Maghrib on Friday is a moment Allah accepts.',
    fr: 'Une invocation dans cette dernière heure avant le Maghrib le vendredi est un moment exaucé par Allah.',
    ar: 'الدعاء في هذه الساعة الأخيرة قبل المغرب يوم الجمعة لحظة يستجيب الله فيها.',
  },

  'jumuah.kahf.title':    { en: 'Surah Al-Kahf', fr: 'Sourate Al-Kahf', ar: 'سورة الكهف' },
  'jumuah.kahf.subtitle': { en: '110 verses · sunnah on Friday', fr: '110 versets · sunna du vendredi', ar: '١١٠ آية · سنّة يوم الجمعة' },
  'jumuah.kahf.hadith': {
    en: '“Whoever recites Surah Al-Kahf on Friday, light shines for him between the two Fridays.” — al-Hakim',
    fr: '« Quiconque récite la sourate Al-Kahf le vendredi, une lumière brille pour lui entre les deux vendredis. » — al-Hakim',
    ar: '«مَن قرأ سورة الكهف يوم الجمعة أضاء له من النور ما بين الجمعتين». — الحاكم',
  },
  'jumuah.kahf.cta': { en: 'Open Al-Kahf', fr: 'Ouvrir Al-Kahf', ar: 'فتح سورة الكهف' },

  'jumuah.salawat.title':    { en: 'Salawat counter', fr: 'Compteur de Salawat', ar: 'عدّاد الصلاة على النبي' },
  'jumuah.salawat.subtitle': { en: 'Tap to send peace upon the Prophet ﷺ', fr: 'Touchez pour envoyer la paix sur le Prophète ﷺ', ar: 'انقر لإرسال الصلاة على النبي ﷺ' },
  'jumuah.salawat.hadith': {
    en: '“Whoever sends one salawat upon me, Allah sends ten upon him.” — Muslim',
    fr: '« Quiconque envoie une salawat sur moi, Allah lui en envoie dix. » — Mouslim',
    ar: '«من صلى علي صلاة صلى الله عليه بها عشرًا». — مسلم',
  },
  'jumuah.salawat.tap':  { en: 'Tap to count', fr: 'Touchez pour compter', ar: 'انقر للعدّ' },
  'jumuah.salawat.unit': { en: 'today', fr: 'aujourd’hui', ar: 'اليوم' },
  'jumuah.salawat.reset': { en: 'Reset today’s count', fr: 'Réinitialiser le compteur du jour', ar: 'إعادة تصفير عدّ اليوم' },
  'jumuah.salawat.daily_reset': { en: 'Resets at midnight (local time).', fr: 'Réinitialisation à minuit (heure locale).', ar: 'يُعاد التصفير عند منتصف الليل (التوقيت المحلي).' },

  /* Settings — Jumu'ah */

  'settings.jumuah':       { en: 'Jumu’ah Mubarak', fr: 'Joumou’a Moubarak', ar: 'جمعة مباركة' },
  'settings.jumuah.hint':  {
    en: 'Special Friday surface: ajr ladder, Surah Al-Kahf reminder, Salawat counter, hour-of-acceptance banner.',
    fr: 'Surface spéciale du vendredi : échelle d’ajr, rappel sourate Al-Kahf, compteur de Salawat, bannière de l’heure d’exaucement.',
    ar: 'صفحة خاصة بيوم الجمعة: سُلَّم الأجر، تذكير سورة الكهف، عدّاد الصلاة على النبي، شريط ساعة الإجابة.',
  },
  'settings.jumuah.master':       { en: 'Enable Friday enhancements', fr: 'Activer les améliorations du vendredi', ar: 'تفعيل ميزات يوم الجمعة' },
  'settings.jumuah.master.desc':  { en: 'Master switch — turns the Friday hero, ribbon, adhkar, and Dhuhr→Jumu’ah relabel on or off.', fr: 'Interrupteur principal — active la bannière, le ruban, les adhkar et le renommage Dhouhr→Joumou’a.', ar: 'المفتاح الرئيسي — يُفعِّل لافتة الجمعة، الشريط، الأذكار، وتسمية الظهر بالجمعة.' },
  'settings.jumuah.kahf_alert':       { en: 'Thursday-eve Al-Kahf reminder', fr: 'Rappel Al-Kahf le jeudi soir', ar: 'تذكير سورة الكهف ليلة الجمعة' },
  'settings.jumuah.kahf_alert.desc':  { en: 'Notification at 19:00 every Thursday — read Al-Kahf before Friday Maghrib.', fr: 'Notification à 19h00 chaque jeudi — lisez Al-Kahf avant le Maghrib de vendredi.', ar: 'إشعار الساعة ٧ مساءً كل خميس — اقرأ سورة الكهف قبل مغرب الجمعة.' },
  'settings.jumuah.pre_alert':        { en: '1 hour before Jumu’ah', fr: '1 heure avant Joumou’a', ar: 'قبل الجمعة بساعة' },
  'settings.jumuah.pre_alert.desc':   { en: 'Friday: notification when the first ajr-hour begins — leave for the mosque to earn the camel.', fr: 'Vendredi : notification au début de la première heure d’ajr — partez pour la mosquée pour gagner le chameau.', ar: 'الجمعة: إشعار عند بداية أول ساعة من ساعات الأجر — توجّه للمسجد لتنال أجر البَدَنَة.' },
  'settings.jumuah.acceptance_alert':      { en: 'Hour of acceptance', fr: 'Heure de l’exaucement', ar: 'ساعة الإجابة' },
  'settings.jumuah.acceptance_alert.desc': { en: 'Friday: notification 1 hour before Maghrib — du’a in this hour is accepted.', fr: 'Vendredi : notification 1 heure avant le Maghrib — l’invocation à cette heure est exaucée.', ar: 'الجمعة: إشعار قبل المغرب بساعة — الدعاء في هذه الساعة مُستجاب.' },
  'settings.jumuah.preview':       { en: 'Preview Friday surface', fr: 'Aperçu de la surface du vendredi', ar: 'معاينة صفحة الجمعة' },
  'settings.jumuah.preview.badge': { en: 'Testing', fr: 'Test', ar: 'اختبار' },
  'settings.jumuah.preview.desc':  {
    en: 'Force the Jumu’ah hero, ribbon, adhkar, and Dhuhr→Jumu’ah relabel to show today, even if it’s not Friday. For QA — turn off when done.',
    fr: 'Force l’affichage de la bannière Joumou’a, du ruban, des adhkar et du renommage Dhouhr→Joumou’a aujourd’hui, même si ce n’est pas vendredi. Pour les tests — désactivez après usage.',
    ar: 'يفرض ظهور لافتة الجمعة، الشريط، الأذكار، وتسمية الظهر بالجمعة اليوم حتى لو لم يكن يوم جمعة. للاختبار — أوقفه بعد الانتهاء.',
  },

  'clock.mismatch.title': {
    en: 'Clock mismatch detected',
    fr: 'Décalage d’horloge détecté',
    ar: 'تم اكتشاف اختلاف في الساعة',
  },
  'clock.mismatch.body.tz': {
    en: 'Your system timezone differs from your saved location:',
    fr: 'Le fuseau horaire de votre système diffère de votre localisation enregistrée :',
    ar: 'المنطقة الزمنية لجهازك تختلف عن موقعك المحفوظ:',
  },
  'clock.mismatch.body.offset': {
    en: 'Your system reports a different offset than the named timezone:',
    fr: 'Votre système rapporte un décalage différent de celui du fuseau horaire nommé :',
    ar: 'يُبلِغ جهازك بفارق مختلف عمّا يفترضه اسم المنطقة الزمنية:',
  },
  'clock.mismatch.body.expected': {
    en: 'should be',
    fr: 'devrait être',
    ar: 'يجب أن يكون',
  },
  'clock.mismatch.action': {
    en: 'Pick the location matching where you are, or change your laptop’s timezone — otherwise prayer notifications may fire at the wrong wall-clock time.',
    fr: 'Choisissez la localisation correspondant à votre position, ou modifiez le fuseau horaire de votre ordinateur — sinon les notifications de prière risquent de se déclencher au mauvais moment.',
    ar: 'اختر الموقع المطابق لمكانك، أو غيّر المنطقة الزمنية للجهاز — وإلا قد تنطلق إشعارات الصلاة في وقت غير صحيح.',
  },
  'clock.mismatch.action.tzdata': {
    en: 'Update your operating system to refresh its timezone database — the prayer times in the app are correct, but your tray clock will look wrong.',
    fr: 'Mettez à jour votre système d’exploitation pour rafraîchir sa base de données de fuseaux horaires — les horaires de prière dans l’application sont corrects, mais l’horloge système peut sembler erronée.',
    ar: 'حدّث نظام التشغيل لتحديث قاعدة بيانات المناطق الزمنية — أوقات الصلاة في التطبيق صحيحة، لكن ساعة النظام قد تبدو خاطئة.',
  },
  'clock.mismatch.dismiss': { en: 'Dismiss', fr: 'Ignorer', ar: 'تجاهل' },

  'nowplaying.label':    { en: 'Now playing', fr: 'En lecture', ar: 'يُشغَّل الآن' },
  'nowplaying.dua_next': { en: 'Dua next', fr: 'Doua après', ar: 'الدعاء بعده' },

  'update.available':   { en: 'Update available', fr: 'Mise à jour disponible', ar: 'تحديث متوفر' },
  'update.downloading': { en: 'Downloading update', fr: 'Téléchargement en cours', ar: 'جارٍ تنزيل التحديث' },
  'update.ready':       { en: 'Update ready — restart to install', fr: 'Mise à jour prête — redémarrez pour installer', ar: 'التحديث جاهز — أعد التشغيل للتثبيت' },
  'update.install':     { en: 'Restart & install', fr: 'Redémarrer et installer', ar: 'إعادة التشغيل والتثبيت' },
  'update.download':    { en: 'Download from GitHub', fr: 'Télécharger depuis GitHub', ar: 'تنزيل من GitHub' },
};

export function translate(key: string, lang: Lang): string {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en ?? key;
}

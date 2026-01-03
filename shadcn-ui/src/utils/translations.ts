import { Language } from '../types';

type TranslationKey = 
  | 'scanQR'
  | 'scanInstructions'
  | 'simulateScan'
  | 'scanning'
  | 'demo'
  | 'restaurantInfo'
  | 'viewMenu'
  | 'selectTable'
  | 'waiting'
  | 'orderDrinks'
  | 'tableReady'
  | 'proceedToTable'
  | 'menu'
  | 'food'
  | 'drinks'
  | 'addToOrder'
  | 'placeOrder'
  | 'item'
  | 'items'
  | 'dining'
  | 'continueOrdering'
  | 'requestBill'
  | 'billPaymentTitle'
  | 'billPaymentSubtitle'
  | 'billSummary'
  | 'subtotal'
  | 'tax'
  | 'tip'
  | 'total'
  | 'howToPay'
  | 'paymentMethod'
  | 'card'
  | 'cash'
  | 'via'
  | 'splitMethod'
  | 'payFull'
  | 'splitEvenly'
  | 'splitByItems'
  | 'totalTip'
  | 'noTip'
  | 'tipAllocationLabel'
  | 'serviceTipLabel'
  | 'cookTip'
  | 'tipAllocationService'
  | 'tipAllocationKitchen'
  | 'tipAllocationBalanced'
  | 'tipAllocationHint'
  | 'serviceCouldBeBetter'
  | 'foodCouldBeBetter'
  | 'noTipReasonLabel'
  | 'noTipPlaceholder'
  | 'splitEvenQuestion'
  | 'eachPersonPays'
  | 'selectItemsInstruction'
  | 'itemsAvailableLabel'
  | 'selectedTotal'
  | 'beforeTaxTip'
  | 'estimatedPayment'
  | 'amountToPayNow'
  | 'confirmAndPay'
  | 'processingPayment'
  | 'selectItemsWarning'
  | 'splitMethodLabelFull'
  | 'splitMethodLabelEven'
  | 'splitMethodLabelItems'
  | 'back'
  | 'chooseSeatCta';

const translations: Record<TranslationKey, Record<Language, string>> = {
  scanQR: {
    en: 'Scan QR Code',
    es: 'Escanear Código QR',
    fr: 'Scanner le code QR',
    de: 'QR-Code scannen',
    ja: 'QRコードをスキャン',
    ar: 'مسح رمز الاستجابة السريعة',
    zh: '扫描二维码'
  },
  scanInstructions: {
    en: 'Point your camera at the QR code to get started',
    es: 'Apunta tu cámara al código QR para comenzar',
    fr: 'Pointez votre caméra vers le code QR pour commencer',
    de: 'Richten Sie Ihre Kamera auf den QR-Code, um zu beginnen',
    ja: 'カメラをQRコードに向けて開始してください',
    ar: 'وجه الكاميرا نحو رمز الاستجابة السريعة للبدء',
    zh: '将相机对准二维码开始'
  },
  simulateScan: {
    en: 'Simulate QR Scan',
    es: 'Simular Escaneo QR',
    fr: 'Simuler le scan QR',
    de: 'QR-Scan simulieren',
    ja: 'QRスキャンをシミュレート',
    ar: 'محاكاة مسح QR',
    zh: '模拟二维码扫描'
  },
  scanning: {
    en: 'Scanning...',
    es: 'Escaneando...',
    fr: 'Numérisation...',
    de: 'Scannen...',
    ja: 'スキャン中...',
    ar: 'جارٍ المسح...',
    zh: '扫描中...'
  },
  demo: {
    en: 'Demo Mode',
    es: 'Modo Demo',
    fr: 'Mode Démo',
    de: 'Demo-Modus',
    ja: 'デモモード',
    ar: 'وضع العرض التوضيحي',
    zh: '演示模式'
  },
  restaurantInfo: {
    en: 'Restaurant Info',
    es: 'Información del Restaurante',
    fr: 'Informations sur le restaurant',
    de: 'Restaurant-Info',
    ja: 'レストラン情報',
    ar: 'معلومات المطعم',
    zh: '餐厅信息'
  },
  viewMenu: {
    en: 'View Menu',
    es: 'Ver Menú',
    fr: 'Voir le menu',
    de: 'Menü ansehen',
    ja: 'メニューを見る',
    ar: 'عرض القائمة',
    zh: '查看菜单'
  },
  selectTable: {
    en: 'Select Table',
    es: 'Seleccionar Mesa',
    fr: 'Sélectionner une table',
    de: 'Tisch auswählen',
    ja: 'テーブルを選択',
    ar: 'اختر الطاولة',
    zh: '选择桌子'
  },
  waiting: {
    en: 'Waiting',
    es: 'Esperando',
    fr: 'En attente',
    de: 'Warten',
    ja: '待機中',
    ar: 'في الانتظار',
    zh: '等待中'
  },
  orderDrinks: {
    en: 'Order Drinks',
    es: 'Ordenar Bebidas',
    fr: 'Commander des boissons',
    de: 'Getränke bestellen',
    ja: '飲み物を注文',
    ar: 'اطلب المشروبات',
    zh: '点饮料'
  },
  tableReady: {
    en: 'Table Ready',
    es: 'Mesa Lista',
    fr: 'Table prête',
    de: 'Tisch bereit',
    ja: 'テーブル準備完了',
    ar: 'الطاولة جاهزة',
    zh: '桌子准备好了'
  },
  proceedToTable: {
    en: 'Proceed to Table',
    es: 'Ir a la Mesa',
    fr: 'Aller à la table',
    de: 'Zum Tisch gehen',
    ja: 'テーブルへ進む',
    ar: 'انتقل إلى الطاولة',
    zh: '前往桌子'
  },
  menu: {
    en: 'Menu',
    es: 'Menú',
    fr: 'Menu',
    de: 'Menü',
    ja: 'メニュー',
    ar: 'القائمة',
    zh: '菜单'
  },
  food: {
    en: 'Food',
    es: 'Comida',
    fr: 'Nourriture',
    de: 'Essen',
    ja: '食べ物',
    ar: 'طعام',
    zh: '食物'
  },
  drinks: {
    en: 'Drinks',
    es: 'Bebidas',
    fr: 'Boissons',
    de: 'Getränke',
    ja: '飲み物',
    ar: 'مشروبات',
    zh: '饮料'
  },
  addToOrder: {
    en: 'Add',
    es: 'Agregar',
    fr: 'Ajouter',
    de: 'Hinzufügen',
    ja: '追加',
    ar: 'إضافة',
    zh: '添加'
  },
  placeOrder: {
    en: 'Place Order',
    es: 'Realizar Pedido',
    fr: 'Passer commande',
    de: 'Bestellung aufgeben',
    ja: '注文する',
    ar: 'تقديم الطلب',
    zh: '下单'
  },
  item: {
    en: 'item',
    es: 'artículo',
    fr: 'article',
    de: 'Artikel',
    ja: 'アイテム',
    ar: 'عنصر',
    zh: '项'
  },
  items: {
    en: 'items',
    es: 'artículos',
    fr: 'articles',
    de: 'Artikel',
    ja: 'アイテム',
    ar: 'عناصر',
    zh: '项'
  },
  dining: {
    en: 'Dining',
    es: 'Comiendo',
    fr: 'Dîner',
    de: 'Essen',
    ja: '食事中',
    ar: 'تناول الطعام',
    zh: '用餐'
  },
  continueOrdering: {
    en: 'Continue Ordering',
    es: 'Continuar Ordenando',
    fr: 'Continuer à commander',
    de: 'Weiter bestellen',
    ja: '注文を続ける',
    ar: 'متابعة الطلب',
    zh: '继续点餐'
  },
  requestBill: {
    en: 'Request Bill',
    es: 'Solicitar Cuenta',
    fr: 'Demander l\'addition',
    de: 'Rechnung anfordern',
    ja: '会計を依頼',
    ar: 'طلب الفاتورة',
    zh: '请求账单'
  },
  billPaymentTitle: {
    en: 'Bill Payment',
    es: 'Pago de Cuenta',
    fr: 'Paiement de la facture',
    de: 'Rechnungszahlung',
    ja: '会計',
    ar: 'دفع الفاتورة',
    zh: '账单支付'
  },
  billPaymentSubtitle: {
    en: 'Review and pay your bill',
    es: 'Revisa y paga tu cuenta',
    fr: 'Vérifiez et payez votre facture',
    de: 'Überprüfen und bezahlen Sie Ihre Rechnung',
    ja: '会計を確認して支払う',
    ar: 'راجع وادفع فاتورتك',
    zh: '查看并支付账单'
  },
  billSummary: {
    en: 'Bill Summary',
    es: 'Resumen de Cuenta',
    fr: 'Résumé de la facture',
    de: 'Rechnungsübersicht',
    ja: '会計概要',
    ar: 'ملخص الفاتورة',
    zh: '账单摘要'
  },
  subtotal: {
    en: 'Subtotal',
    es: 'Subtotal',
    fr: 'Sous-total',
    de: 'Zwischensumme',
    ja: '小計',
    ar: 'المجموع الفرعي',
    zh: '小计'
  },
  tax: {
    en: 'Tax',
    es: 'Impuesto',
    fr: 'Taxe',
    de: 'Steuer',
    ja: '税',
    ar: 'ضريبة',
    zh: '税'
  },
  tip: {
    en: 'Tip',
    es: 'Propina',
    fr: 'Pourboire',
    de: 'Trinkgeld',
    ja: 'チップ',
    ar: 'إكرامية',
    zh: '小费'
  },
  total: {
    en: 'Total',
    es: 'Total',
    fr: 'Total',
    de: 'Gesamt',
    ja: '合計',
    ar: 'المجموع',
    zh: '总计'
  },
  howToPay: {
    en: 'How to Pay',
    es: 'Cómo Pagar',
    fr: 'Comment payer',
    de: 'Wie bezahlen',
    ja: '支払い方法',
    ar: 'كيفية الدفع',
    zh: '如何支付'
  },
  paymentMethod: {
    en: 'Payment Method',
    es: 'Método de Pago',
    fr: 'Méthode de paiement',
    de: 'Zahlungsmethode',
    ja: '支払い方法',
    ar: 'طريقة الدفع',
    zh: '支付方式'
  },
  card: {
    en: 'Card',
    es: 'Tarjeta',
    fr: 'Carte',
    de: 'Karte',
    ja: 'カード',
    ar: 'بطاقة',
    zh: '卡'
  },
  cash: {
    en: 'Cash',
    es: 'Efectivo',
    fr: 'Espèces',
    de: 'Bargeld',
    ja: '現金',
    ar: 'نقدي',
    zh: '现金'
  },
  via: {
    en: 'via',
    es: 'vía',
    fr: 'via',
    de: 'über',
    ja: '経由',
    ar: 'عبر',
    zh: '通过'
  },
  splitMethod: {
    en: 'Split Method',
    es: 'Método de División',
    fr: 'Méthode de partage',
    de: 'Aufteilungsmethode',
    ja: '分割方法',
    ar: 'طريقة التقسيم',
    zh: '分摊方式'
  },
  payFull: {
    en: 'Pay Full',
    es: 'Pagar Todo',
    fr: 'Payer le total',
    de: 'Voll bezahlen',
    ja: '全額支払い',
    ar: 'دفع كامل',
    zh: '全额支付'
  },
  splitEvenly: {
    en: 'Split Evenly',
    es: 'Dividir Equitativamente',
    fr: 'Partager équitablement',
    de: 'Gleichmäßig aufteilen',
    ja: '均等に分割',
    ar: 'تقسيم بالتساوي',
    zh: '平均分摊'
  },
  splitByItems: {
    en: 'By Items',
    es: 'Por Artículos',
    fr: 'Par articles',
    de: 'Nach Artikeln',
    ja: 'アイテム別',
    ar: 'حسب العناصر',
    zh: '按项目'
  },
  totalTip: {
    en: 'Tip',
    es: 'Propina',
    fr: 'Pourboire',
    de: 'Trinkgeld',
    ja: 'チップ',
    ar: 'إكرامية',
    zh: '小费'
  },
  noTip: {
    en: 'No Tip',
    es: 'Sin Propina',
    fr: 'Pas de pourboire',
    de: 'Kein Trinkgeld',
    ja: 'チップなし',
    ar: 'بدون إكرامية',
    zh: '无小费'
  },
  tipAllocationLabel: {
    en: 'Tip Allocation',
    es: 'Asignación de Propina',
    fr: 'Répartition du pourboire',
    de: 'Trinkgeldverteilung',
    ja: 'チップ配分',
    ar: 'توزيع الإكرامية',
    zh: '小费分配'
  },
  serviceTipLabel: {
    en: 'Service',
    es: 'Servicio',
    fr: 'Service',
    de: 'Service',
    ja: 'サービス',
    ar: 'خدمة',
    zh: '服务'
  },
  cookTip: {
    en: 'Kitchen',
    es: 'Cocina',
    fr: 'Cuisine',
    de: 'Küche',
    ja: 'キッチン',
    ar: 'مطبخ',
    zh: '厨房'
  },
  tipAllocationService: {
    en: 'More tip goes to service staff',
    es: 'Más propina va al personal de servicio',
    fr: 'Plus de pourboire va au personnel de service',
    de: 'Mehr Trinkgeld geht an das Servicepersonal',
    ja: 'サービススタッフにより多くのチップ',
    ar: 'المزيد من الإكرامية تذهب لموظفي الخدمة',
    zh: '更多小费给服务人员'
  },
  tipAllocationKitchen: {
    en: 'More tip goes to kitchen staff',
    es: 'Más propina va al personal de cocina',
    fr: 'Plus de pourboire va au personnel de cuisine',
    de: 'Mehr Trinkgeld geht an das Küchenpersonal',
    ja: 'キッチンスタッフにより多くのチップ',
    ar: 'المزيد من الإكرامية تذهب لموظفي المطبخ',
    zh: '更多小费给厨房人员'
  },
  tipAllocationBalanced: {
    en: 'Balanced tip distribution',
    es: 'Distribución equilibrada de propina',
    fr: 'Distribution équilibrée du pourboire',
    de: 'Ausgewogene Trinkgeldverteilung',
    ja: 'バランスの取れたチップ配分',
    ar: 'توزيع متوازن للإكرامية',
    zh: '平衡的小费分配'
  },
  tipAllocationHint: {
    en: 'Adjust the slider to allocate tip between service and kitchen staff',
    es: 'Ajusta el control deslizante para asignar la propina entre el personal de servicio y cocina',
    fr: 'Ajustez le curseur pour répartir le pourboire entre le personnel de service et de cuisine',
    de: 'Passen Sie den Schieberegler an, um das Trinkgeld zwischen Service- und Küchenpersonal aufzuteilen',
    ja: 'スライダーを調整して、サービススタッフとキッチンスタッフの間でチップを配分します',
    ar: 'اضبط المنزلق لتوزيع الإكرامية بين موظفي الخدمة والمطبخ',
    zh: '调整滑块以在服务人员和厨房人员之间分配小费'
  },
  serviceCouldBeBetter: {
    en: 'Service could be better',
    es: 'El servicio podría ser mejor',
    fr: 'Le service pourrait être meilleur',
    de: 'Der Service könnte besser sein',
    ja: 'サービスが改善できる',
    ar: 'يمكن أن تكون الخدمة أفضل',
    zh: '服务可以更好'
  },
  foodCouldBeBetter: {
    en: 'Food could be better',
    es: 'La comida podría ser mejor',
    fr: 'La nourriture pourrait être meilleure',
    de: 'Das Essen könnte besser sein',
    ja: '食事が改善できる',
    ar: 'يمكن أن يكون الطعام أفضل',
    zh: '食物可以更好'
  },
  noTipReasonLabel: {
    en: 'Please tell us why (required for low/no tip)',
    es: 'Por favor dinos por qué (requerido para propina baja/sin propina)',
    fr: 'Veuillez nous dire pourquoi (requis pour un pourboire faible/nul)',
    de: 'Bitte sagen Sie uns warum (erforderlich für niedriges/kein Trinkgeld)',
    ja: '理由を教えてください（低額/チップなしの場合は必須）',
    ar: 'يرجى إخبارنا لماذا (مطلوب لإكرامية منخفضة/بدون إكرامية)',
    zh: '请告诉我们原因（低/无小费时必填）'
  },
  noTipPlaceholder: {
    en: 'Your feedback helps us improve...',
    es: 'Tus comentarios nos ayudan a mejorar...',
    fr: 'Vos commentaires nous aident à nous améliorer...',
    de: 'Ihr Feedback hilft uns, uns zu verbessern...',
    ja: 'あなたのフィードバックは私たちの改善に役立ちます...',
    ar: 'ملاحظاتك تساعدنا على التحسين...',
    zh: '您的反馈帮助我们改进...'
  },
  splitEvenQuestion: {
    en: 'How many people?',
    es: '¿Cuántas personas?',
    fr: 'Combien de personnes?',
    de: 'Wie viele Personen?',
    ja: '何人ですか？',
    ar: 'كم عدد الأشخاص؟',
    zh: '多少人？'
  },
  eachPersonPays: {
    en: 'Each person pays',
    es: 'Cada persona paga',
    fr: 'Chaque personne paie',
    de: 'Jede Person zahlt',
    ja: '一人当たり',
    ar: 'كل شخص يدفع',
    zh: '每人支付'
  },
  selectItemsInstruction: {
    en: 'Select the items you want to pay for',
    es: 'Selecciona los artículos que quieres pagar',
    fr: 'Sélectionnez les articles que vous souhaitez payer',
    de: 'Wählen Sie die Artikel aus, die Sie bezahlen möchten',
    ja: '支払いたいアイテムを選択してください',
    ar: 'حدد العناصر التي تريد دفعها',
    zh: '选择您要支付的项目'
  },
  itemsAvailableLabel: {
    en: 'Available',
    es: 'Disponible',
    fr: 'Disponible',
    de: 'Verfügbar',
    ja: '利用可能',
    ar: 'متاح',
    zh: '可用'
  },
  selectedTotal: {
    en: 'Selected Total',
    es: 'Total Seleccionado',
    fr: 'Total sélectionné',
    de: 'Ausgewählte Summe',
    ja: '選択合計',
    ar: 'المجموع المحدد',
    zh: '选择总计'
  },
  beforeTaxTip: {
    en: 'before tax & tip',
    es: 'antes de impuestos y propina',
    fr: 'avant taxes et pourboire',
    de: 'vor Steuern und Trinkgeld',
    ja: '税金とチップ前',
    ar: 'قبل الضريبة والإكرامية',
    zh: '税前和小费前'
  },
  estimatedPayment: {
    en: 'Estimated Payment',
    es: 'Pago Estimado',
    fr: 'Paiement estimé',
    de: 'Geschätzte Zahlung',
    ja: '推定支払額',
    ar: 'الدفع المقدر',
    zh: '预计支付'
  },
  amountToPayNow: {
    en: 'Amount to Pay Now',
    es: 'Monto a Pagar Ahora',
    fr: 'Montant à payer maintenant',
    de: 'Jetzt zu zahlender Betrag',
    ja: '今すぐ支払う金額',
    ar: 'المبلغ المطلوب دفعه الآن',
    zh: '现在支付金额'
  },
  confirmAndPay: {
    en: 'Confirm & Pay',
    es: 'Confirmar y Pagar',
    fr: 'Confirmer et payer',
    de: 'Bestätigen und bezahlen',
    ja: '確認して支払う',
    ar: 'تأكيد والدفع',
    zh: '确认并支付'
  },
  processingPayment: {
    en: 'Processing payment: {method} - {amount}',
    es: 'Procesando pago: {method} - {amount}',
    fr: 'Traitement du paiement: {method} - {amount}',
    de: 'Zahlung wird verarbeitet: {method} - {amount}',
    ja: '支払い処理中: {method} - {amount}',
    ar: 'معالجة الدفع: {method} - {amount}',
    zh: '处理付款: {method} - {amount}'
  },
  selectItemsWarning: {
    en: 'Please select at least one item',
    es: 'Por favor selecciona al menos un artículo',
    fr: 'Veuillez sélectionner au moins un article',
    de: 'Bitte wählen Sie mindestens einen Artikel aus',
    ja: '少なくとも1つのアイテムを選択してください',
    ar: 'يرجى تحديد عنصر واحد على الأقل',
    zh: '请至少选择一项'
  },
  splitMethodLabelFull: {
    en: 'Full Bill',
    es: 'Cuenta Completa',
    fr: 'Facture complète',
    de: 'Vollständige Rechnung',
    ja: '全額',
    ar: 'الفاتورة الكاملة',
    zh: '全额账单'
  },
  splitMethodLabelEven: {
    en: 'Split Evenly',
    es: 'Dividir Equitativamente',
    fr: 'Partager équitablement',
    de: 'Gleichmäßig aufteilen',
    ja: '均等に分割',
    ar: 'تقسيم بالتساوي',
    zh: '平均分摊'
  },
  splitMethodLabelItems: {
    en: 'By Items',
    es: 'Por Artículos',
    fr: 'Par articles',
    de: 'Nach Artikeln',
    ja: 'アイテム別',
    ar: 'حسب العناصر',
    zh: '按项目'
  },
  back: {
    en: 'Back',
    es: 'Volver',
    fr: 'Retour',
    de: 'Zurück',
    ja: '戻る',
    ar: 'رجوع',
    zh: '返回'
  },
  chooseSeatCta: {
    en: 'Choose Your Seat',
    es: 'Elige tu Asiento',
    fr: 'Choisissez votre siège',
    de: 'Wählen Sie Ihren Sitzplatz',
    ja: '席を選ぶ',
    ar: 'اختر مقعدك',
    zh: '选择座位'
  }
};

export function t(key: TranslationKey, language: Language): string {
  return translations[key]?.[language] || translations[key]?.en || key;
}

export function localizeText(
  text: Record<Language, string> | string,
  language: Language
): string {
  if (typeof text === 'string') return text;
  return text[language] || text.en || '';
}

export function localizeCategory(category: string, language: Language): string {
  const categoryTranslations: Record<string, Record<Language, string>> = {
    appetizers: {
      en: 'Appetizers',
      es: 'Aperitivos',
      fr: 'Entrées',
      de: 'Vorspeisen',
      ja: '前菜',
      ar: 'مقبلات',
      zh: '开胃菜'
    },
    'main course': {
      en: 'Main Course',
      es: 'Plato Principal',
      fr: 'Plat principal',
      de: 'Hauptgericht',
      ja: 'メインコース',
      ar: 'الطبق الرئيسي',
      zh: '主菜'
    },
    desserts: {
      en: 'Desserts',
      es: 'Postres',
      fr: 'Desserts',
      de: 'Desserts',
      ja: 'デザート',
      ar: 'حلويات',
      zh: '甜点'
    },
    cocktails: {
      en: 'Cocktails',
      es: 'Cócteles',
      fr: 'Cocktails',
      de: 'Cocktails',
      ja: 'カクテル',
      ar: 'كوكتيلات',
      zh: '鸡尾酒'
    },
    beer: {
      en: 'Beer',
      es: 'Cerveza',
      fr: 'Bière',
      de: 'Bier',
      ja: 'ビール',
      ar: 'بيرة',
      zh: '啤酒'
    },
    'non-alcoholic': {
      en: 'Non-Alcoholic',
      es: 'Sin Alcohol',
      fr: 'Sans alcool',
      de: 'Alkoholfrei',
      ja: 'ノンアルコール',
      ar: 'غير كحولي',
      zh: '无酒精'
    }
  };

  const normalized = category.toLowerCase();
  return categoryTranslations[normalized]?.[language] || category;
}
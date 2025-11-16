import { Language } from '../types/restaurant';

const translations = {
  // QR Scanner
  scanQR: {
    en: 'Scan QR Code',
    es: 'Escanear código QR',
    fr: 'Scanner le code QR',
    de: 'QR-Code scannen',
    ja: 'QRコードをスキャン',
    ar: 'مسح رمز الاستجابة السريعة',
    zh: '扫描二维码'
  },
  scanInstructions: {
    en: 'Point your camera at the QR code on your table',
    es: 'Apunta tu cámara al código QR de tu mesa',
    fr: 'Pointez votre appareil photo sur le code QR de votre table',
    de: 'Richten Sie Ihre Kamera auf den QR-Code auf Ihrem Tisch',
    ja: 'テーブルのQRコードにカメラを向けてください',
    ar: 'وجه الكاميرا إلى رمز الاستجابة السريعة على طاولتك',
    zh: '将相机对准桌上的二维码'
  },
  simulateScan: {
    en: 'For demo, select a restaurant',
    es: 'Para la demo, selecciona un restaurante',
    fr: 'Pour la démo, sélectionnez un restaurant',
    de: 'Für die Demo wählen Sie ein Restaurant',
    ja: 'デモ用にレストランを選択してください',
    ar: 'للعرض التوضيحي، اختر مطعماً',
    zh: '演示用，请选择餐厅'
  },

  // Restaurant Info
  welcomeTo: {
    en: 'Welcome to',
    es: 'Bienvenido a',
    fr: 'Bienvenue chez',
    de: 'Willkommen bei',
    ja: 'ようこそ',
    ar: 'مرحباً بك في',
    zh: '欢迎来到'
  },
  continue: {
    en: 'Continue',
    es: 'Continuar',
    fr: 'Continuer',
    de: 'Weiter',
    ja: '続行',
    ar: 'متابعة',
    zh: '继续'
  },

  // Table Selection
  selectTable: {
    en: 'Select Your Table',
    es: 'Selecciona tu mesa',
    fr: 'Sélectionnez votre table',
    de: 'Wählen Sie Ihren Tisch',
    ja: 'テーブルを選択',
    ar: 'اختر طاولتك',
    zh: '选择您的桌子'
  },
  seats: {
    en: 'seats',
    es: 'asientos',
    fr: 'places',
    de: 'Plätze',
    ja: '席',
    ar: 'مقاعد',
    zh: '座位'
  },
  available: {
    en: 'Available',
    es: 'Disponible',
    fr: 'Disponible',
    de: 'Verfügbar',
    ja: '利用可能',
    ar: 'متاح',
    zh: '可用'
  },
  reserved: {
    en: 'Reserved',
    es: 'Reservado',
    fr: 'Réservé',
    de: 'Reserviert',
    ja: '予約済み',
    ar: 'محجوز',
    zh: '已预订'
  },
  occupied: {
    en: 'Occupied',
    es: 'Ocupado',
    fr: 'Occupé',
    de: 'Besetzt',
    ja: '使用中',
    ar: 'مشغول',
    zh: '已占用'
  },
  patio: {
    en: 'Patio',
    es: 'Patio',
    fr: 'Terrasse',
    de: 'Terrasse',
    ja: 'パティオ',
    ar: 'الفناء',
    zh: '露台'
  },
  window: {
    en: 'Window',
    es: 'Ventana',
    fr: 'Fenêtre',
    de: 'Fenster',
    ja: '窓側',
    ar: 'النافذة',
    zh: '窗边'
  },
  balcony: {
    en: 'Balcony',
    es: 'Balcón',
    fr: 'Balcon',
    de: 'Balkon',
    ja: 'バルコニー',
    ar: 'الشرفة',
    zh: '阳台'
  },
  middle: {
    en: 'Center',
    es: 'Centro',
    fr: 'Centre',
    de: 'Mitte',
    ja: '中央',
    ar: 'الوسط',
    zh: '中央'
  },
  confirmTable: {
    en: 'Confirm Table',
    es: 'Confirmar mesa',
    fr: 'Confirmer la table',
    de: 'Tisch bestätigen',
    ja: 'テーブル確認',
    ar: 'تأكيد الطاولة',
    zh: '确认桌子'
  },
  nextAvailable: {
    en: 'Next Available',
    es: 'Siguiente disponible',
    fr: 'Suivant disponible',
    de: 'Nächster verfügbar',
    ja: '次の空席',
    ar: 'التالي المتاح',
    zh: '下一个可用'
  },

  // Menu
  food: {
    en: 'Food',
    es: 'Comida',
    fr: 'Nourriture',
    de: 'Essen',
    ja: '料理',
    ar: 'الطعام',
    zh: '食物'
  },
  drinks: {
    en: 'Drinks',
    es: 'Bebidas',
    fr: 'Boissons',
    de: 'Getränke',
    ja: '飲み物',
    ar: 'المشروبات',
    zh: '饮品'
  },
  addToOrder: {
    en: 'Add to Order',
    es: 'Añadir al pedido',
    fr: 'Ajouter à la commande',
    de: 'Zur Bestellung hinzufügen',
    ja: '注文に追加',
    ar: 'أضف إلى الطلب',
    zh: '添加到订单'
  },
  placeOrder: {
    en: 'Place Order',
    es: 'Realizar pedido',
    fr: 'Passer commande',
    de: 'Bestellung aufgeben',
    ja: '注文する',
    ar: 'تقديم الطلب',
    zh: '下订单'
  },
  item: {
    en: 'item',
    es: 'artículo',
    fr: 'article',
    de: 'Artikel',
    ja: 'アイテム',
    ar: 'عنصر',
    zh: '项目'
  },
  items: {
    en: 'items',
    es: 'artículos',
    fr: 'articles',
    de: 'Artikel',
    ja: 'アイテム',
    ar: 'عناصر',
    zh: '项目'
  },

  // Waiting & Dining
  estimatedWait: {
    en: 'Estimated wait time',
    es: 'Tiempo estimado de espera',
    fr: 'Temps d\'attente estimé',
    de: 'Geschätzte Wartezeit',
    ja: '推定待ち時間',
    ar: 'وقت الانتظار المقدر',
    zh: '预计等待时间'
  },
  minutes: {
    en: 'minutes',
    es: 'minutos',
    fr: 'minutes',
    de: 'Minuten',
    ja: '分',
    ar: 'دقائق',
    zh: '分钟'
  },
  orderDrinks: {
    en: 'Order Drinks While You Wait',
    es: 'Pide bebidas mientras esperas',
    fr: 'Commandez des boissons en attendant',
    de: 'Getränke bestellen während Sie warten',
    ja: '待っている間にドリンクを注文',
    ar: 'اطلب المشروبات أثناء الانتظار',
    zh: '等待时可点饮品'
  },
  tableReady: {
    en: 'Your table is ready!',
    es: '¡Tu mesa está lista!',
    fr: 'Votre table est prête !',
    de: 'Ihr Tisch ist bereit!',
    ja: 'テーブルの準備ができました！',
    ar: 'طاولتك جاهزة!',
    zh: '您的桌子准备好了！'
  },
  proceedToTable: {
    en: 'Proceed to Table',
    es: 'Ir a la mesa',
    fr: 'Aller à la table',
    de: 'Zum Tisch gehen',
    ja: 'テーブルへ進む',
    ar: 'انتقل إلى الطاولة',
    zh: '前往桌子'
  },
  yourOrder: {
    en: 'Your Order',
    es: 'Tu pedido',
    fr: 'Votre commande',
    de: 'Ihre Bestellung',
    ja: 'ご注文',
    ar: 'طلبك',
    zh: '您的订单'
  },
  continueOrdering: {
    en: 'Continue Ordering',
    es: 'Continuar pidiendo',
    fr: 'Continuer à commander',
    de: 'Weiter bestellen',
    ja: '注文を続ける',
    ar: 'متابعة الطلب',
    zh: '继续点餐'
  },
  requestBill: {
    en: 'Request Bill',
    es: 'Pedir cuenta',
    fr: 'Demander l\'addition',
    de: 'Rechnung anfordern',
    ja: '会計をお願いします',
    ar: 'طلب الفاتورة',
    zh: '请求账单'
  },

  // Payment
  bill: {
    en: 'Bill',
    es: 'Cuenta',
    fr: 'Addition',
    de: 'Rechnung',
    ja: '会計',
    ar: 'الفاتورة',
    zh: '账单'
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
    es: 'Impuestos',
    fr: 'Taxe',
    de: 'Steuer',
    ja: '税金',
    ar: 'الضريبة',
    zh: '税费'
  },
  tip: {
    en: 'Tip',
    es: 'Propina',
    fr: 'Pourboire',
    de: 'Trinkgeld',
    ja: 'チップ',
    ar: 'البقشيش',
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
  paid: {
    en: 'Paid',
    es: 'Pagado',
    fr: 'Payé',
    de: 'Bezahlt',
    ja: '支払済み',
    ar: 'مدفوع',
    zh: '已付款'
  },
  remaining: {
    en: 'Remaining',
    es: 'Restante',
    fr: 'Restant',
    de: 'Verbleibend',
    ja: '残り',
    ar: 'المتبقي',
    zh: '剩余'
  },
  splitBill: {
    en: 'Split Bill',
    es: 'Dividir cuenta',
    fr: 'Diviser l\'addition',
    de: 'Rechnung teilen',
    ja: '割り勘',
    ar: 'تقسيم الفاتورة',
    zh: '分账'
  },
  payFull: {
    en: 'Pay Full Amount',
    es: 'Pagar cantidad completa',
    fr: 'Payer le montant total',
    de: 'Vollbetrag zahlen',
    ja: '全額支払い',
    ar: 'دفع المبلغ كاملاً',
    zh: '支付全额'
  },
  splitEvenly: {
    en: 'Split Evenly',
    es: 'Dividir equitativamente',
    fr: 'Diviser équitablement',
    de: 'Gleichmäßig teilen',
    ja: '均等に分割',
    ar: 'تقسيم بالتساوي',
    zh: '平均分摊'
  },
  splitByItems: {
    en: 'Split by Items',
    es: 'Dividir por artículos',
    fr: 'Diviser par articles',
    de: 'Nach Artikeln teilen',
    ja: 'アイテム別に分割',
    ar: 'تقسيم حسب العناصر',
    zh: '按项目分摊'
  },
  selectYourItems: {
    en: 'Select Your Items',
    es: 'Selecciona tus artículos',
    fr: 'Sélectionnez vos articles',
    de: 'Wählen Sie Ihre Artikel',
    ja: 'アイテムを選択',
    ar: 'اختر عناصرك',
    zh: '选择您的项目'
  },
  yourAmount: {
    en: 'Your Amount',
    es: 'Tu cantidad',
    fr: 'Votre montant',
    de: 'Ihr Betrag',
    ja: 'あなたの金額',
    ar: 'مبلغك',
    zh: '您的金额'
  },
  payNow: {
    en: 'Pay Now',
    es: 'Pagar ahora',
    fr: 'Payer maintenant',
    de: 'Jetzt bezahlen',
    ja: '今すぐ支払う',
    ar: 'ادفع الآن',
    zh: '立即支付'
  },
  payAtTerminal: {
    en: 'Pay at the terminal or with your server',
    es: 'Paga en el terminal o con tu mesero',
    fr: 'Payez au terminal ou avec votre serveur',
    de: 'Am Terminal oder bei Ihrem Server bezahlen',
    ja: '端末またはサーバーでお支払いください',
    ar: 'ادفع في المحطة أو مع الخادم',
    zh: '在终端或与服务员付款'
  },
  paymentComplete: {
    en: 'Payment Complete',
    es: 'Pago completado',
    fr: 'Paiement terminé',
    de: 'Zahlung abgeschlossen',
    ja: '支払い完了',
    ar: 'تم الدفع',
    zh: '付款完成'
  },
  thankYou: {
    en: 'Thank you for dining with us!',
    es: '¡Gracias por cenar con nosotros!',
    fr: 'Merci d\'avoir dîné avec nous !',
    de: 'Vielen Dank, dass Sie bei uns gegessen haben!',
    ja: 'お食事をありがとうございました！',
    ar: 'شكراً لك على تناول الطعام معنا!',
    zh: '感谢您与我们用餐！'
  },

  // Common
  back: {
    en: 'Back',
    es: 'Atrás',
    fr: 'Retour',
    de: 'Zurück',
    ja: '戻る',
    ar: 'رجوع',
    zh: '返回'
  },
  next: {
    en: 'Next',
    es: 'Siguiente',
    fr: 'Suivant',
    de: 'Weiter',
    ja: '次へ',
    ar: 'التالي',
    zh: '下一步'
  },
  loading: {
    en: 'Loading...',
    es: 'Cargando...',
    fr: 'Chargement...',
    de: 'Laden...',
    ja: '読み込み中...',
    ar: 'جاري التحميل...',
    zh: '加载中...'
  },
  error: {
    en: 'Error',
    es: 'Error',
    fr: 'Erreur',
    de: 'Fehler',
    ja: 'エラー',
    ar: 'خطأ',
    zh: '错误'
  }
};

export function t(key: keyof typeof translations, language: Language): string {
  return translations[key]?.[language] || translations[key]?.en || key;
}
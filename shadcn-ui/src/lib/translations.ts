export interface Translation {
  // Language Selector
  selectLanguage: string;
  welcome: string;
  chooseLanguage: string;
  
  // Navigation
  back: string;
  next: string;
  continue: string;
  cancel: string;
  confirm: string;
  
  // Restaurant List
  nearbyRestaurants: string;
  searchRestaurants: string;
  viewMenu: string;
  makeReservation: string;
  waitTime: string;
  minutes: string;
  openNow: string;
  closed: string;
  rating: string;
  
  // Restaurant Details
  about: string;
  menu: string;
  reservations: string;
  contact: string;
  hours: string;
  phone: string;
  address: string;
  
  // Reservations
  selectTable: string;
  selectDate: string;
  selectTime: string;
  partySize: string;
  people: string;
  person: string;
  availableTables: string;
  tableFor: string;
  reserveTable: string;
  confirmReservation: string;
  reservationConfirmed: string;
  
  // Menu
  appetizers: string;
  mainCourses: string;
  desserts: string;
  beverages: string;
  addToOrder: string;
  viewOrder: string;
  orderTotal: string;
  placeOrder: string;
  
  // Bar/Waitlist
  joinWaitlist: string;
  estimatedWait: string;
  orderDrinks: string;
  barMenu: string;
  yourPosition: string;
  inLine: string;
  
  // Payment
  payBill: string;
  splitBill: string;
  addTip: string;
  total: string;
  subtotal: string;
  tip: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
  close: string;
  open: string;
  
  // Days of week
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  
  // Time periods
  am: string;
  pm: string;
}

export const translations: Record<string, Translation> = {
  en: {
    selectLanguage: "Select Language",
    welcome: "Welcome to DineIn",
    chooseLanguage: "Choose your preferred language",
    
    back: "Back",
    next: "Next",
    continue: "Continue",
    cancel: "Cancel",
    confirm: "Confirm",
    
    nearbyRestaurants: "Nearby Restaurants",
    searchRestaurants: "Search restaurants...",
    viewMenu: "View Menu",
    makeReservation: "Make Reservation",
    waitTime: "Wait Time",
    minutes: "min",
    openNow: "Open Now",
    closed: "Closed",
    rating: "Rating",
    
    about: "About",
    menu: "Menu",
    reservations: "Reservations",
    contact: "Contact",
    hours: "Hours",
    phone: "Phone",
    address: "Address",
    
    selectTable: "Select Table",
    selectDate: "Select Date",
    selectTime: "Select Time",
    partySize: "Party Size",
    people: "people",
    person: "person",
    availableTables: "Available Tables",
    tableFor: "Table for",
    reserveTable: "Reserve Table",
    confirmReservation: "Confirm Reservation",
    reservationConfirmed: "Reservation Confirmed!",
    
    appetizers: "Appetizers",
    mainCourses: "Main Courses",
    desserts: "Desserts",
    beverages: "Beverages",
    addToOrder: "Add to Order",
    viewOrder: "View Order",
    orderTotal: "Order Total",
    placeOrder: "Place Order",
    
    joinWaitlist: "Join Waitlist",
    estimatedWait: "Estimated Wait",
    orderDrinks: "Order Drinks",
    barMenu: "Bar Menu",
    yourPosition: "Your Position",
    inLine: "in line",
    
    payBill: "Pay Bill",
    splitBill: "Split Bill",
    addTip: "Add Tip",
    total: "Total",
    subtotal: "Subtotal",
    tip: "Tip",
    
    loading: "Loading...",
    error: "Error",
    success: "Success",
    close: "Close",
    open: "Open",
    
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    
    am: "AM",
    pm: "PM"
  },
  es: {
    selectLanguage: "Seleccionar Idioma",
    welcome: "Bienvenido a DineIn",
    chooseLanguage: "Elige tu idioma preferido",
    
    back: "Atrás",
    next: "Siguiente",
    continue: "Continuar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    
    nearbyRestaurants: "Restaurantes Cercanos",
    searchRestaurants: "Buscar restaurantes...",
    viewMenu: "Ver Menú",
    makeReservation: "Hacer Reserva",
    waitTime: "Tiempo de Espera",
    minutes: "min",
    openNow: "Abierto Ahora",
    closed: "Cerrado",
    rating: "Calificación",
    
    about: "Acerca de",
    menu: "Menú",
    reservations: "Reservas",
    contact: "Contacto",
    hours: "Horarios",
    phone: "Teléfono",
    address: "Dirección",
    
    selectTable: "Seleccionar Mesa",
    selectDate: "Seleccionar Fecha",
    selectTime: "Seleccionar Hora",
    partySize: "Tamaño del Grupo",
    people: "personas",
    person: "persona",
    availableTables: "Mesas Disponibles",
    tableFor: "Mesa para",
    reserveTable: "Reservar Mesa",
    confirmReservation: "Confirmar Reserva",
    reservationConfirmed: "¡Reserva Confirmada!",
    
    appetizers: "Aperitivos",
    mainCourses: "Platos Principales",
    desserts: "Postres",
    beverages: "Bebidas",
    addToOrder: "Agregar al Pedido",
    viewOrder: "Ver Pedido",
    orderTotal: "Total del Pedido",
    placeOrder: "Realizar Pedido",
    
    joinWaitlist: "Unirse a Lista de Espera",
    estimatedWait: "Espera Estimada",
    orderDrinks: "Pedir Bebidas",
    barMenu: "Menú del Bar",
    yourPosition: "Tu Posición",
    inLine: "en la fila",
    
    payBill: "Pagar Cuenta",
    splitBill: "Dividir Cuenta",
    addTip: "Agregar Propina",
    total: "Total",
    subtotal: "Subtotal",
    tip: "Propina",
    
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    close: "Cerrar",
    open: "Abierto",
    
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
    
    am: "AM",
    pm: "PM"
  },
  fr: {
    selectLanguage: "Sélectionner la Langue",
    welcome: "Bienvenue à DineIn",
    chooseLanguage: "Choisissez votre langue préférée",
    
    back: "Retour",
    next: "Suivant",
    continue: "Continuer",
    cancel: "Annuler",
    confirm: "Confirmer",
    
    nearbyRestaurants: "Restaurants à Proximité",
    searchRestaurants: "Rechercher des restaurants...",
    viewMenu: "Voir le Menu",
    makeReservation: "Faire une Réservation",
    waitTime: "Temps d'Attente",
    minutes: "min",
    openNow: "Ouvert Maintenant",
    closed: "Fermé",
    rating: "Note",
    
    about: "À Propos",
    menu: "Menu",
    reservations: "Réservations",
    contact: "Contact",
    hours: "Heures",
    phone: "Téléphone",
    address: "Adresse",
    
    selectTable: "Sélectionner une Table",
    selectDate: "Sélectionner la Date",
    selectTime: "Sélectionner l'Heure",
    partySize: "Taille du Groupe",
    people: "personnes",
    person: "personne",
    availableTables: "Tables Disponibles",
    tableFor: "Table pour",
    reserveTable: "Réserver une Table",
    confirmReservation: "Confirmer la Réservation",
    reservationConfirmed: "Réservation Confirmée!",
    
    appetizers: "Entrées",
    mainCourses: "Plats Principaux",
    desserts: "Desserts",
    beverages: "Boissons",
    addToOrder: "Ajouter à la Commande",
    viewOrder: "Voir la Commande",
    orderTotal: "Total de la Commande",
    placeOrder: "Passer Commande",
    
    joinWaitlist: "Rejoindre la Liste d'Attente",
    estimatedWait: "Attente Estimée",
    orderDrinks: "Commander des Boissons",
    barMenu: "Menu du Bar",
    yourPosition: "Votre Position",
    inLine: "dans la file",
    
    payBill: "Payer l'Addition",
    splitBill: "Partager l'Addition",
    addTip: "Ajouter un Pourboire",
    total: "Total",
    subtotal: "Sous-total",
    tip: "Pourboire",
    
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    close: "Fermer",
    open: "Ouvert",
    
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
    
    am: "AM",
    pm: "PM"
  },
  de: {
    selectLanguage: "Sprache Auswählen",
    welcome: "Willkommen bei DineIn",
    chooseLanguage: "Wählen Sie Ihre bevorzugte Sprache",
    
    back: "Zurück",
    next: "Weiter",
    continue: "Fortfahren",
    cancel: "Abbrechen",
    confirm: "Bestätigen",
    
    nearbyRestaurants: "Restaurants in der Nähe",
    searchRestaurants: "Restaurants suchen...",
    viewMenu: "Menü Ansehen",
    makeReservation: "Reservierung Machen",
    waitTime: "Wartezeit",
    minutes: "min",
    openNow: "Jetzt Geöffnet",
    closed: "Geschlossen",
    rating: "Bewertung",
    
    about: "Über",
    menu: "Menü",
    reservations: "Reservierungen",
    contact: "Kontakt",
    hours: "Öffnungszeiten",
    phone: "Telefon",
    address: "Adresse",
    
    selectTable: "Tisch Auswählen",
    selectDate: "Datum Auswählen",
    selectTime: "Zeit Auswählen",
    partySize: "Gruppengröße",
    people: "Personen",
    person: "Person",
    availableTables: "Verfügbare Tische",
    tableFor: "Tisch für",
    reserveTable: "Tisch Reservieren",
    confirmReservation: "Reservierung Bestätigen",
    reservationConfirmed: "Reservierung Bestätigt!",
    
    appetizers: "Vorspeisen",
    mainCourses: "Hauptgerichte",
    desserts: "Desserts",
    beverages: "Getränke",
    addToOrder: "Zur Bestellung Hinzufügen",
    viewOrder: "Bestellung Ansehen",
    orderTotal: "Bestellsumme",
    placeOrder: "Bestellung Aufgeben",
    
    joinWaitlist: "Warteliste Beitreten",
    estimatedWait: "Geschätzte Wartezeit",
    orderDrinks: "Getränke Bestellen",
    barMenu: "Bar-Menü",
    yourPosition: "Ihre Position",
    inLine: "in der Warteschlange",
    
    payBill: "Rechnung Bezahlen",
    splitBill: "Rechnung Teilen",
    addTip: "Trinkgeld Hinzufügen",
    total: "Gesamt",
    subtotal: "Zwischensumme",
    tip: "Trinkgeld",
    
    loading: "Laden...",
    error: "Fehler",
    success: "Erfolg",
    close: "Schließen",
    open: "Geöffnet",
    
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    sunday: "Sonntag",
    
    am: "AM",
    pm: "PM"
  },
  it: {
    selectLanguage: "Seleziona Lingua",
    welcome: "Benvenuto a DineIn",
    chooseLanguage: "Scegli la tua lingua preferita",
    
    back: "Indietro",
    next: "Avanti",
    continue: "Continua",
    cancel: "Annulla",
    confirm: "Conferma",
    
    nearbyRestaurants: "Ristoranti Vicini",
    searchRestaurants: "Cerca ristoranti...",
    viewMenu: "Vedi Menu",
    makeReservation: "Fai Prenotazione",
    waitTime: "Tempo di Attesa",
    minutes: "min",
    openNow: "Aperto Ora",
    closed: "Chiuso",
    rating: "Valutazione",
    
    about: "Chi Siamo",
    menu: "Menu",
    reservations: "Prenotazioni",
    contact: "Contatto",
    hours: "Orari",
    phone: "Telefono",
    address: "Indirizzo",
    
    selectTable: "Seleziona Tavolo",
    selectDate: "Seleziona Data",
    selectTime: "Seleziona Ora",
    partySize: "Dimensione Gruppo",
    people: "persone",
    person: "persona",
    availableTables: "Tavoli Disponibili",
    tableFor: "Tavolo per",
    reserveTable: "Prenota Tavolo",
    confirmReservation: "Conferma Prenotazione",
    reservationConfirmed: "Prenotazione Confermata!",
    
    appetizers: "Antipasti",
    mainCourses: "Piatti Principali",
    desserts: "Dolci",
    beverages: "Bevande",
    addToOrder: "Aggiungi all'Ordine",
    viewOrder: "Vedi Ordine",
    orderTotal: "Totale Ordine",
    placeOrder: "Effettua Ordine",
    
    joinWaitlist: "Unisciti alla Lista d'Attesa",
    estimatedWait: "Attesa Stimata",
    orderDrinks: "Ordina Bevande",
    barMenu: "Menu Bar",
    yourPosition: "La Tua Posizione",
    inLine: "in fila",
    
    payBill: "Paga Conto",
    splitBill: "Dividi Conto",
    addTip: "Aggiungi Mancia",
    total: "Totale",
    subtotal: "Subtotale",
    tip: "Mancia",
    
    loading: "Caricamento...",
    error: "Errore",
    success: "Successo",
    close: "Chiudi",
    open: "Aperto",
    
    monday: "Lunedì",
    tuesday: "Martedì",
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    sunday: "Domenica",
    
    am: "AM",
    pm: "PM"
  },
  pt: {
    selectLanguage: "Selecionar Idioma",
    welcome: "Bem-vindo ao DineIn",
    chooseLanguage: "Escolha seu idioma preferido",
    
    back: "Voltar",
    next: "Próximo",
    continue: "Continuar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    
    nearbyRestaurants: "Restaurantes Próximos",
    searchRestaurants: "Buscar restaurantes...",
    viewMenu: "Ver Cardápio",
    makeReservation: "Fazer Reserva",
    waitTime: "Tempo de Espera",
    minutes: "min",
    openNow: "Aberto Agora",
    closed: "Fechado",
    rating: "Avaliação",
    
    about: "Sobre",
    menu: "Cardápio",
    reservations: "Reservas",
    contact: "Contato",
    hours: "Horários",
    phone: "Telefone",
    address: "Endereço",
    
    selectTable: "Selecionar Mesa",
    selectDate: "Selecionar Data",
    selectTime: "Selecionar Hora",
    partySize: "Tamanho do Grupo",
    people: "pessoas",
    person: "pessoa",
    availableTables: "Mesas Disponíveis",
    tableFor: "Mesa para",
    reserveTable: "Reservar Mesa",
    confirmReservation: "Confirmar Reserva",
    reservationConfirmed: "Reserva Confirmada!",
    
    appetizers: "Aperitivos",
    mainCourses: "Pratos Principais",
    desserts: "Sobremesas",
    beverages: "Bebidas",
    addToOrder: "Adicionar ao Pedido",
    viewOrder: "Ver Pedido",
    orderTotal: "Total do Pedido",
    placeOrder: "Fazer Pedido",
    
    joinWaitlist: "Entrar na Lista de Espera",
    estimatedWait: "Espera Estimada",
    orderDrinks: "Pedir Bebidas",
    barMenu: "Cardápio do Bar",
    yourPosition: "Sua Posição",
    inLine: "na fila",
    
    payBill: "Pagar Conta",
    splitBill: "Dividir Conta",
    addTip: "Adicionar Gorjeta",
    total: "Total",
    subtotal: "Subtotal",
    tip: "Gorjeta",
    
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    close: "Fechar",
    open: "Aberto",
    
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
    
    am: "AM",
    pm: "PM"
  },
  zh: {
    selectLanguage: "选择语言",
    welcome: "欢迎使用DineIn",
    chooseLanguage: "选择您的首选语言",
    
    back: "返回",
    next: "下一步",
    continue: "继续",
    cancel: "取消",
    confirm: "确认",
    
    nearbyRestaurants: "附近餐厅",
    searchRestaurants: "搜索餐厅...",
    viewMenu: "查看菜单",
    makeReservation: "预订",
    waitTime: "等待时间",
    minutes: "分钟",
    openNow: "现在营业",
    closed: "已关闭",
    rating: "评分",
    
    about: "关于",
    menu: "菜单",
    reservations: "预订",
    contact: "联系方式",
    hours: "营业时间",
    phone: "电话",
    address: "地址",
    
    selectTable: "选择桌子",
    selectDate: "选择日期",
    selectTime: "选择时间",
    partySize: "用餐人数",
    people: "人",
    person: "人",
    availableTables: "可用桌子",
    tableFor: "桌子容纳",
    reserveTable: "预订桌子",
    confirmReservation: "确认预订",
    reservationConfirmed: "预订已确认！",
    
    appetizers: "开胃菜",
    mainCourses: "主菜",
    desserts: "甜点",
    beverages: "饮料",
    addToOrder: "添加到订单",
    viewOrder: "查看订单",
    orderTotal: "订单总计",
    placeOrder: "下订单",
    
    joinWaitlist: "加入等待列表",
    estimatedWait: "预计等待",
    orderDrinks: "点饮料",
    barMenu: "酒吧菜单",
    yourPosition: "您的位置",
    inLine: "在队列中",
    
    payBill: "付账",
    splitBill: "分账",
    addTip: "添加小费",
    total: "总计",
    subtotal: "小计",
    tip: "小费",
    
    loading: "加载中...",
    error: "错误",
    success: "成功",
    close: "关闭",
    open: "营业",
    
    monday: "星期一",
    tuesday: "星期二",
    wednesday: "星期三",
    thursday: "星期四",
    friday: "星期五",
    saturday: "星期六",
    sunday: "星期日",
    
    am: "上午",
    pm: "下午"
  },
  ja: {
    selectLanguage: "言語を選択",
    welcome: "DineInへようこそ",
    chooseLanguage: "お好みの言語を選択してください",
    
    back: "戻る",
    next: "次へ",
    continue: "続行",
    cancel: "キャンセル",
    confirm: "確認",
    
    nearbyRestaurants: "近くのレストラン",
    searchRestaurants: "レストランを検索...",
    viewMenu: "メニューを見る",
    makeReservation: "予約する",
    waitTime: "待ち時間",
    minutes: "分",
    openNow: "営業中",
    closed: "閉店",
    rating: "評価",
    
    about: "について",
    menu: "メニュー",
    reservations: "予約",
    contact: "連絡先",
    hours: "営業時間",
    phone: "電話",
    address: "住所",
    
    selectTable: "テーブルを選択",
    selectDate: "日付を選択",
    selectTime: "時間を選択",
    partySize: "人数",
    people: "人",
    person: "人",
    availableTables: "利用可能なテーブル",
    tableFor: "テーブル",
    reserveTable: "テーブルを予約",
    confirmReservation: "予約を確認",
    reservationConfirmed: "予約が確認されました！",
    
    appetizers: "前菜",
    mainCourses: "メインコース",
    desserts: "デザート",
    beverages: "飲み物",
    addToOrder: "注文に追加",
    viewOrder: "注文を見る",
    orderTotal: "注文合計",
    placeOrder: "注文する",
    
    joinWaitlist: "ウェイトリストに参加",
    estimatedWait: "推定待ち時間",
    orderDrinks: "ドリンクを注文",
    barMenu: "バーメニュー",
    yourPosition: "あなたの位置",
    inLine: "列に並んでいます",
    
    payBill: "支払い",
    splitBill: "割り勘",
    addTip: "チップを追加",
    total: "合計",
    subtotal: "小計",
    tip: "チップ",
    
    loading: "読み込み中...",
    error: "エラー",
    success: "成功",
    close: "閉じる",
    open: "営業中",
    
    monday: "月曜日",
    tuesday: "火曜日",
    wednesday: "水曜日",
    thursday: "木曜日",
    friday: "金曜日",
    saturday: "土曜日",
    sunday: "日曜日",
    
    am: "午前",
    pm: "午後"
  }
};

export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }
];

export const useTranslation = (language: string) => {
  return translations[language] || translations.en;
};
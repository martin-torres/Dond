import { Restaurant, Language } from '../types/restaurant';

const createMultiLangText = (en: string, es: string, fr: string, de: string, ja: string, ar: string, zh: string): Record<Language, string> => ({
  en, es, fr, de, ja, ar, zh
});

export const mockRestaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Rupestre Bar Culinario',
    address: 'C. de Morelos 867, Barrio Antiguo, Centro, 64000 Monterrey, N.L., México',
    hours: {
      open: '1:00 PM',
      close: '12:00 AM',
    },
    waitTime: 20,
    distance: 35,
    promos: [
      {
        id: 'promo-1',
        title: createMultiLangText(
          'Mezcal & Craft Cocktails',
          'Mezcal y Cócteles Artesanales',
          'Mezcal et Cocktails Artisanaux',
          'Mezcal & Craft-Cocktails',
          'メスカル＆クラフトカクテル',
          'ميزكال وكوكتيلات حرفية',
          '梅斯卡尔和精酿鸡尾酒'
        ),
        description: createMultiLangText(
          '2x1 on all mezcal and signature cocktails from 6-9 PM',
          '2x1 en todos los mezcales y cócteles especiales de 6-9 PM',
          '2 pour 1 sur tous les mezcals et cocktails signature de 18h à 21h',
          '2 für 1 auf alle Mezcal und Signature-Cocktails von 18-21 Uhr',
          '午後6時から9時まで全てのメスカルとシグネチャーカクテルが2倍1',
          'عرض 2 في 1 على جميع الميزكال والكوكتيلات المميزة من 6-9 مساءً',
          '下午6-9点所有梅斯卡尔和招牌鸡尾酒买一送一'
        ),
        discount: 50,
        imageUrl: '/images/photo1763264312.jpg',
      },
      {
        id: 'promo-2',
        title: createMultiLangText(
          'Dessert Selection',
          'Selección de Postres',
          'Sélection de Desserts',
          'Dessert-Auswahl',
          'デザートセレクション',
          'مجموعة الحلويات',
          '甜品精选'
        ),
        description: createMultiLangText(
          'Limited premium desserts - order early! Mustachón de Pistacho and more',
          'Postres premium limitados - ¡ordena temprano! Mustachón de Pistacho y más',
          'Desserts premium limités - commandez tôt! Mustachón de Pistacho et plus',
          'Limitierte Premium-Desserts - früh bestellen! Mustachón de Pistacho und mehr',
          '限定プレミアムデザート - 早めにご注文を！ピスタチオムスタチョンなど',
          'حلويات ممتازة محدودة - اطلب مبكراً! موستاتشون الفستق والمزيد',
          '限量优质甜品 - 请提早订购！开心果慕斯等'
        ),
        discount: 0,
        imageUrl: '/images/photo1763264313.jpg',
      },
    ],
    tables: [
      { id: 'table-1', number: 1, seats: 2, location: 'window', available: true, x: 10, y: 10 },
      { id: 'table-2', number: 2, seats: 4, location: 'window', available: false, x: 10, y: 40 },
      { id: 'table-3', number: 3, seats: 2, location: 'patio', available: true, reserved: true, x: 70, y: 10 },
      { id: 'table-4', number: 4, seats: 4, location: 'patio', available: true, x: 70, y: 40 },
      { id: 'table-5', number: 5, seats: 6, location: 'middle', available: true, reserved: true, x: 40, y: 10 },
      { id: 'table-6', number: 6, seats: 4, location: 'middle', available: true, x: 40, y: 40 },
      { id: 'table-7', number: 7, seats: 2, location: 'middle', available: false, x: 40, y: 70 },
      { id: 'table-8', number: 8, seats: 8, location: 'middle', available: true, x: 70, y: 70 },
    ],
    menu: {
      drinks: [
        {
          id: 'drink-1',
          name: createMultiLangText(
            'Mezcal Negroni',
            'Negroni de Mezcal',
            'Negroni au Mezcal',
            'Mezcal Negroni',
            'メスカルネグローニ',
            'نيغروني ميزكال',
            '梅斯卡尔内格罗尼'
          ),
          description: createMultiLangText(
            'Artisanal mezcal, Campari, sweet vermouth, orange twist',
            'Mezcal artesanal, Campari, vermut dulce, twist de naranja',
            'Mezcal artisanal, Campari, vermouth doux, zeste d\'orange',
            'Handwerklicher Mezcal, Campari, süßer Wermut, Orangenzeste',
            '職人メスカル、カンパリ、スイートベルモット、オレンジツイスト',
            'ميزكال حرفي، كامباري، فيرموث حلو، قشر برتقال',
            '手工梅斯卡尔、金巴利、甜苦艾酒、橙皮'
          ),
          price: 175,
          category: 'Cocktails',
          image: '/assets/mezcal-negroni.jpg',
        },
        {
          id: 'drink-2',
          name: createMultiLangText(
            'Paloma Rupestre',
            'Paloma Rupestre',
            'Paloma Rupestre',
            'Paloma Rupestre',
            'パロマルペストレ',
            'بالوما روبستر',
            '岩画鸽子鸡尾酒'
          ),
          description: createMultiLangText(
            'Reposado tequila, fresh grapefruit, lime, Topo Chico, chili salt rim',
            'Tequila reposado, toronja fresca, limón, Topo Chico, borde de sal de chile',
            'Tequila reposado, pamplemousse frais, citron vert, Topo Chico, rebord sel pimenté',
            'Reposado-Tequila, frische Grapefruit, Limette, Topo Chico, Chili-Salzrand',
            'レポサドテキーラ、新鮮グレープフルーツ、ライム、トポチコ、チリソルト',
            'تيكيلا ريبوسادو، جريب فروت طازج، ليمون، توبو تشيكو، حافة ملح الفلفل',
            '陈年龙舌兰、新鲜西柚、青柠、托波奇科、辣椒盐边'
          ),
          price: 165,
          category: 'Cocktails',
          image: '/assets/paloma-rupestre.jpg',
        },
        {
          id: 'drink-3',
          name: createMultiLangText(
            'Michelada Preparada',
            'Michelada Preparada',
            'Michelada Préparée',
            'Michelada Preparada',
            'ミチェラーダプレパラーダ',
            'ميتشيلادا بريبارادا',
            '墨西哥啤酒鸡尾酒'
          ),
          description: createMultiLangText(
            'Mexican lager, lime, hot sauce, Worcestershire, Clamato, Tajín rim',
            'Cerveza mexicana, limón, salsa picante, Worcestershire, Clamato, borde de Tajín',
            'Lager mexicaine, citron vert, sauce piquante, Worcestershire, Clamato, rebord Tajín',
            'Mexikanisches Lager, Limette, scharfe Sauce, Worcestershire, Clamato, Tajín-Rand',
            'メキシコラガー、ライム、ホットソース、ウスターソース、クラマト、タヒンリム',
            'بيرة مكسيكية، ليمون، صلصة حارة، ورشستر، كلاماتو، حافة تاجين',
            '墨西哥啤酒、青柠、辣酱、伍斯特沙司、番茄汁、辣椒粉边'
          ),
          price: 85,
          category: 'Beer',
          image: '/assets/michelada.jpg',
        },
        {
          id: 'drink-4',
          name: createMultiLangText(
            'Craft Beer Flight',
            'Degustación de Cervezas Artesanales',
            'Dégustation de Bières Artisanales',
            'Craft-Bier-Verkostung',
            'クラフトビールフライト',
            'تشكيلة البيرة الحرفية',
            '精酿啤酒品鉴'
          ),
          description: createMultiLangText(
            'Selection of 4 local Mexican craft beers',
            'Selección de 4 cervezas artesanales mexicanas locales',
            'Sélection de 4 bières artisanales mexicaines locales',
            'Auswahl von 4 lokalen mexikanischen Craft-Bieren',
            '地元メキシコクラフトビール4種',
            'مجموعة مختارة من 4 أنواع بيرة مكسيكية حرفية محلية',
            '精选4款当地墨西哥精酿啤酒'
          ),
          price: 90,
          category: 'Beer',
          image: '/assets/beer-flight.jpg',
        },
        {
          id: 'drink-5',
          name: createMultiLangText(
            'Horchata de Coco',
            'Horchata de Coco',
            'Horchata à la Noix de Coco',
            'Kokos-Horchata',
            'ココナッツオルチャータ',
            'هورتشاتا جوز الهند',
            '椰子杏仁奶'
          ),
          description: createMultiLangText(
            'House-made rice milk, coconut, cinnamon, vanilla',
            'Leche de arroz casera, coco, canela, vainilla',
            'Lait de riz maison, noix de coco, cannelle, vanille',
            'Hausgemachte Reismilch, Kokosnuss, Zimt, Vanille',
            '自家製ライスミルク、ココナッツ、シナモン、バニラ',
            'حليب الأرز المنزلي، جوز الهند، قرفة، فانيليا',
            '自制大米奶、椰子、肉桂、香草'
          ),
          price: 55,
          category: 'Non-Alcoholic',
          image: '/assets/horchata-coco.jpg',
        },
      ],
      food: [
        {
          id: 'dessert-1',
          name: createMultiLangText(
            'Mustachón de Pistacho',
            'Mustachón de Pistacho',
            'Mustachón au Pistache',
            'Pistazie Mustachón',
            'ピスタチオムスタチョン',
            'موستاتشون الفستق',
            '开心果慕斯塔雄'
          ),
          description: createMultiLangText(
            'Traditional Mexican meringue cake with pistachio cream, candied pistachios, gold leaf',
            'Pastel de merengue tradicional mexicano con crema de pistacho, pistachos confitados, hoja de oro',
            'Gâteau de meringue mexicain traditionnel avec crème de pistache, pistaches confites, feuille d\'or',
            'Traditioneller mexikanischer Baiser-Kuchen mit Pistaziencreme, kandierten Pistazien, Blattgold',
            '伝統的なメキシコのメレンゲケーキ、ピスタチオクリーム、キャンディピスタチオ、金箔',
            'كعكة المرنغ المكسيكية التقليدية مع كريمة الفستق والفستق المسكر وورقة الذهب',
            '传统墨西哥蛋白酥皮蛋糕配开心果奶油、糖渍开心果、金箔'
          ),
          price: 185,
          category: 'Desserts',
          image: '/assets/mustachon-pistacho.jpg',
        },
        {
          id: 'dessert-2',
          name: createMultiLangText(
            'Tres Leches Rupestre',
            'Tres Leches Rupestre',
            'Tres Leches Rupestre',
            'Tres Leches Rupestre',
            'トレスレチェス ルペストレ',
            'تريس ليتشيس روبستر',
            '鲁佩斯特三奶蛋糕'
          ),
          description: createMultiLangText(
            'Elevated three-milk cake with vanilla bean, cinnamon dust, caramelized milk foam',
            'Pastel de tres leches elevado con vainilla en grano, polvo de canela, espuma de leche caramelizada',
            'Gâteau aux trois laits élevé avec vanille en gousse, poudre de cannelle, mousse de lait caramélisé',
            'Gehobener Drei-Milch-Kuchen mit Vanilleschote, Zimtpulver, karamellisierter Milchschaum',
            'バニラビーン、シナモンダスト、キャラメルミルクフォーム入り高級トレスレチェス',
            'كعكة الحليب الثلاثي المرتقية مع حبة الفانيليا ومسحوق القرفة ورغوة الحليب المكرمل',
            '升级版三奶蛋糕配香草豆、肉桂粉、焦糖牛奶泡沫'
          ),
          price: 165,
          category: 'Desserts',
          image: '/assets/tres-leches.jpg',
        },
        {
          id: 'food-1',
          name: createMultiLangText(
            'Tuna Tostada Tower',
            'Torre de Tostadas de Atún',
            'Tour de Tostadas au Thon',
            'Thunfisch-Tostada-Turm',
            'マグロトスターダタワー',
            'برج توستادا التونة',
            '金枪鱼脆饼塔'
          ),
          description: createMultiLangText(
            'Sushi-grade tuna, avocado, chipotle aioli, crispy tostadas, microgreens',
            'Atún grado sushi, aguacate, aioli de chipotle, tostadas crujientes, microgreens',
            'Thon qualité sushi, avocat, aïoli chipotle, tostadas croustillantes, micro-pousses',
            'Sushi-Thunfisch, Avocado, Chipotle-Aioli, knusprige Tostadas, Microgreens',
            '寿司グレードマグロ、アボカド、チポトレアイオリ、クリスピートスターダ、マイクログリーン',
            'تونة بجودة السوشي، أفوكادو، أيولي تشيبوتلي، توستادا مقرمشة، خضروات صغيرة',
            '寿司级金枪鱼、牛油果、烟熏辣椒蛋黄酱、脆饼、微型蔬菜'
          ),
          price: 240,
          category: 'Appetizers',
          image: '/assets/tuna-tostada.jpg',
        },
        {
          id: 'food-2',
          name: createMultiLangText(
            'Arrachera Tacos',
            'Tacos de Arrachera',
            'Tacos d\'Arrachera',
            'Arrachera-Tacos',
            'アラチェラタコス',
            'تاكو أراتشيرا',
            '牛腹肉塔可'
          ),
          description: createMultiLangText(
            'Grilled skirt steak, caramelized onions, cilantro, salsa verde, corn tortillas',
            'Arrachera a la parrilla, cebollas caramelizadas, cilantro, salsa verde, tortillas de maíz',
            'Bavette grillée, oignons caramélisés, coriandre, salsa verde, tortillas de maïs',
            'Gegrilltes Flanksteak, karamellisierte Zwiebeln, Koriander, Salsa Verde, Maistortillas',
            'グリルスカートステーキ、キャラメリゼ玉ねぎ、パクチー、サルサベルデ、コーントルティーヤ',
            'لحم الخاصرة المشوي، بصل مكرمل، كزبرة، صلصة فيردي، تورتيلا ذرة',
            '烤牛腹排、焦糖洋葱、香菜、青酱、玉米饼'
          ),
          price: 235,
          category: 'Main Course',
          image: '/assets/arrachera-tacos.jpg',
        },
        {
          id: 'food-3',
          name: createMultiLangText(
            'Octopus a la Plancha',
            'Pulpo a la Plancha',
            'Poulpe à la Plancha',
            'Oktopus a la Plancha',
            'タコのプランチャ焼き',
            'أخطبوط على الصاج',
            '铁板章鱼'
          ),
          description: createMultiLangText(
            'Grilled octopus, papas bravas, romesco sauce, lemon, olive oil',
            'Pulpo a la parrilla, papas bravas, salsa romesco, limón, aceite de oliva',
            'Poulpe grillé, papas bravas, sauce romesco, citron, huile d\'olive',
            'Gegrillter Oktopus, Papas Bravas, Romesco-Sauce, Zitrone, Olivenöl',
            'グリルタコ、パパスブラバス、ロメスコソース、レモン、オリーブオイル',
            'أخطبوط مشوي، بطاطس برافاس، صلصة روميسكو، ليمون، زيت زيتون',
            '烤章鱼、辣土豆、罗梅斯科酱、柠檬、橄榄油'
          ),
          price: 250,
          category: 'Main Course',
          image: '/assets/octopus-plancha.jpg',
        },
        {
          id: 'food-4',
          name: createMultiLangText(
            'Ceviche Mixto',
            'Ceviche Mixto',
            'Ceviche Mixte',
            'Gemischte Ceviche',
            'ミックスセビーチェ',
            'سيفيتشي مختلط',
            '混合酸橘汁腌鱼'
          ),
          description: createMultiLangText(
            'Fresh fish, shrimp, octopus, lime, jalapeño, cilantro, red onion, tostadas',
            'Pescado fresco, camarón, pulpo, limón, jalapeño, cilantro, cebolla morada, tostadas',
            'Poisson frais, crevettes, poulpe, citron vert, jalapeño, coriandre, oignon rouge, tostadas',
            'Frischer Fisch, Garnelen, Oktopus, Limette, Jalapeño, Koriander, rote Zwiebel, Tostadas',
            '新鮮魚、エビ、タコ、ライム、ハラペーニョ、パクチー、赤玉ねぎ、トスターダ',
            'سمك طازج، جمبري، أخطبوط، ليمون، هالبينو، كزبرة، بصل أحمر، توستادا',
            '新鲜鱼、虾、章鱼、青柠、墨西哥辣椒、香菜、红洋葱、脆饼'
          ),
          price: 245,
          category: 'Appetizers',
          image: '/assets/ceviche-mixto.jpg',
        },
        {
          id: 'food-5',
          name: createMultiLangText(
            'Chiles en Nogada',
            'Chiles en Nogada',
            'Chiles en Nogada',
            'Chiles en Nogada',
            'チレス・エン・ノガーダ',
            'تشيليز إن نوجادا',
            '核桃酱辣椒'
          ),
          description: createMultiLangText(
            'Poblano pepper, picadillo, walnut cream sauce, pomegranate, parsley',
            'Chile poblano, picadillo, salsa de nuez, granada, perejil',
            'Piment poblano, picadillo, sauce crémeuse aux noix, grenade, persil',
            'Poblano-Paprika, Picadillo, Walnuss-Sahnesauce, Granatapfel, Petersilie',
            'ポブラノペッパー、ピカディージョ、くるみクリームソース、ザクロ、パセリ',
            'فلفل بوبلانو، بيكاديو، صلصة كريمة الجوز، رمان، بقدونس',
            '波布拉诺辣椒、碎肉馅、核桃奶油酱、石榴、欧芹'
          ),
          price: 230,
          category: 'Main Course',
          image: '/assets/chiles-nogada.jpg',
        },
        {
          id: 'food-6',
          name: createMultiLangText(
            'Queso Fundido',
            'Queso Fundido',
            'Fromage Fondu',
            'Geschmolzener Käse',
            'ケソフンディード',
            'كيسو فونديدو',
            '融化奶酪'
          ),
          description: createMultiLangText(
            'Melted Oaxaca cheese, chorizo, rajas, flour tortillas',
            'Queso Oaxaca derretido, chorizo, rajas, tortillas de harina',
            'Fromage Oaxaca fondu, chorizo, rajas, tortillas de farine',
            'Geschmolzener Oaxaca-Käse, Chorizo, Rajas, Weizentortillas',
            '溶けたオアハカチーズ、チョリソー、ラハス、小麦トルティーヤ',
            'جبن أواكساكا مذاب، تشوريزو، راجاس، تورتيلا دقيق',
            '融化瓦哈卡奶酪、西班牙香肠、辣椒条、面粉饼'
          ),
          price: 180,
          category: 'Appetizers',
          image: '/assets/queso-fundido.jpg',
        },
      ],
    },
  },
  {
    id: 'rest-2',
    name: 'Tokyo Fusion',
    address: '456 Sakura Street, East District',
    hours: {
      open: '12:00 PM',
      close: '10:00 PM',
    },
    waitTime: 25,
    distance: 120,
    promos: [
      {
        id: 'promo-3',
        title: createMultiLangText(
          'Sushi Night',
          'Noche de Sushi',
          'Soirée Sushi',
          'Sushi Nacht',
          '寿司の夜',
          'ليلة السوشي',
          '寿司之夜'
        ),
        description: createMultiLangText(
          'All sushi rolls 30% off after 7 PM',
          'Todos los rollos de sushi con 30% de descuento después de las 7 PM',
          'Tous les rouleaux de sushi à -30% après 19h',
          'Alle Sushi-Rollen 30% Rabatt nach 19 Uhr',
          '午後7時以降、全ての寿司ロールが30%オフ',
          'جميع لفائف السوشي خصم 30٪ بعد 7 مساءً',
          '晚上7点后所有寿司卷3折'
        ),
        discount: 30,
      },
    ],
    tables: [
      { id: 'table-t1', number: 1, seats: 2, location: 'window', available: true, x: 15, y: 15 },
      { id: 'table-t2', number: 2, seats: 4, location: 'middle', available: true, x: 45, y: 45 },
      { id: 'table-t3', number: 3, seats: 6, location: 'patio', available: false, x: 75, y: 15 },
    ],
    menu: {
      drinks: [
        {
          id: 'drink-t1',
          name: createMultiLangText('Sake', 'Sake', 'Saké', 'Sake', '日本酒', 'ساكي', '清酒'),
          description: createMultiLangText(
            'Premium Japanese rice wine',
            'Vino de arroz japonés premium',
            'Vin de riz japonais premium',
            'Premium japanischer Reiswein',
            'プレミアム日本酒',
            'نبيذ أرز ياباني ممتاز',
            '优质日本米酒'
          ),
          price: 15,
          category: 'Alcoholic',
          image: '/images/photo1763264311.jpg',
        },
      ],
      food: [
        {
          id: 'food-t1',
          name: createMultiLangText(
            'Dragon Roll',
            'Rollo Dragón',
            'Rouleau Dragon',
            'Drachen-Rolle',
            'ドラゴンロール',
            'لفة التنين',
            '龙卷'
          ),
          description: createMultiLangText(
            'Eel, cucumber, avocado, tobiko',
            'Anguila, pepino, aguacate, tobiko',
            'Anguille, concombre, avocat, tobiko',
            'Aal, Gurke, Avocado, Tobiko',
            'うなぎ、きゅうり、アボカド、とびこ',
            'ثعبان البحر، خيار، أفوكادو، توبيكو',
            '鳗鱼、黄瓜、牛油果、飞鱼籽'
          ),
          price: 18,
          category: 'Sushi',
          image: '/images/photo1763264311.jpg',
        },
      ],
    },
  },
];
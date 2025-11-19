import { Restaurant, Language } from '../types';

const createMultiLangText = (en: string, es: string, fr: string, de: string, ja: string, ar: string, zh: string): Record<Language, string> => ({
  en, es, fr, de, ja, ar, zh
});

export const mockRestaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Rupestre Bar Culinario',
    address: 'Calle Morelos 920, Barrio Antiguo, Monterrey, N.L.',
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
        imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      },
      {
        id: 'promo-2',
        title: createMultiLangText(
          'Taco Tuesday',
          'Martes de Tacos',
          'Mardi Tacos',
          'Taco Dienstag',
          'タコチューズデー',
          'ثلاثاء التاكو',
          '塔可星期二'
        ),
        description: createMultiLangText(
          'All tacos $3 each, unlimited toppings bar included',
          'Todos los tacos a $3 cada uno, barra de ingredientes ilimitada incluida',
          'Tous les tacos à 3$ chacun, bar à garnitures illimitées inclus',
          'Alle Tacos für 3$ pro Stück, unbegrenzte Toppings-Bar inklusive',
          '全てのタコス3ドル、トッピングバー無制限',
          'جميع التاكو بسعر 3 دولار للقطعة، بار توبينجز غير محدود',
          '所有塔可每个3美元，无限配料吧'
        ),
        discount: 0,
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      },
      {
        id: 'promo-3',
        title: createMultiLangText(
          'Late Night Bites',
          'Bocadillos Nocturnos',
          'Bouchées de Fin de Soirée',
          'Spätnacht-Häppchen',
          '深夜スナック',
          'وجبات خفيفة في وقت متأخر',
          '深夜小吃'
        ),
        description: createMultiLangText(
          'Special late night menu after 10 PM with craft beer pairings',
          'Menú especial nocturno después de las 10 PM con maridaje de cerveza artesanal',
          'Menu spécial fin de soirée après 22h avec accords bières artisanales',
          'Spezielle Late-Night-Karte nach 22 Uhr mit Craft-Beer-Paarungen',
          '午後10時以降の深夜メニュー、クラフトビールペアリング付き',
          'قائمة خاصة في وقت متأخر بعد 10 مساءً مع تزاوج البيرة الحرفية',
          '晚上10点后的特别深夜菜单，配精酿啤酒'
        ),
        discount: 0,
        imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
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
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
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
          image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
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
            'メキシコラガー、ライム、ホット���ース、ウスターソース、クラマト、タヒンリム',
            'بيرة مكسيكية، ليمون، صلصة حارة، ورشستر، كلاماتو، حافة تاجين',
            '墨西哥啤酒、青柠、辣酱、伍斯特沙司、番茄汁、辣椒粉边'
          ),
          price: 85,
          category: 'Beer',
          image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
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
          image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
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
          image: 'https://images.unsplash.com/photo-1622484211298-e2b39099f4f7?w=400',
        },
      ],
      food: [
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
          image: 'https://images.unsplash.com/photo-1626108962941-61b46dd705a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dW5hJTIwdG9zdGFkYSUyMGNyaXNweXxlbnwxfHx8fDE3NjMyNTExNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
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
          image: 'https://images.unsplash.com/photo-1707604341704-74abdc25e52a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwdGFjb3MlMjBzdGVha3xlbnwxfHx8fDE3NjMyNTExNDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
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
          image: 'https://images.unsplash.com/photo-1559070135-f259b369bf87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwb2N0b3B1cyUyMHBsYXRlfGVufDF8fHx8MTc2MzI1MTE0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
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
          image: 'https://images.unsplash.com/photo-1737897646422-dfe65ec20530?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXZpY2hlJTIwZnJlc2glMjBmaXNofGVufDF8fHx8MTc2MzI1MTE0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
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
          image: 'https://images.unsplash.com/photo-1603136999275-4d08f8b4f891?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZXMlMjBub2dhZGElMjBwb2JsYW5vfGVufDF8fHx8MTc2MzI1MTE0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        },
        {
          id: 'food-6',
          name: createMultiLangText(
            'Churros con Chocolate',
            'Churros con Chocolate',
            'Churros au Chocolat',
            'Churros mit Schokolade',
            'チュロス・コン・チョコラーテ',
            'تشوروس بالشوكولاتة',
            '吉事果配巧克力'
          ),
          description: createMultiLangText(
            'Crispy churros, Mexican chocolate dipping sauce, cinnamon sugar',
            'Churros crujientes, salsa de chocolate mexicano, azúcar con canela',
            'Churros croustillants, sauce au chocolat mexicain, sucre à la cannelle',
            'Knusprige Churros, mexikanische Schokoladensauce, Zimtzucker',
            'カリカリチュロス、メキシカンチョコレートディップソース、シナモンシュガー',
            'تشوروس مقرمش، صلصة شوكولاتة مكسيكية، سكر القرفة',
            '酥脆吉事果、墨西哥巧克力蘸酱、肉桂糖'
          ),
          price: 185,
          category: 'Desserts',
          image: 'https://images.unsplash.com/photo-1575234337239-4c6492d7df1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVycm9zJTIwY2hvY29sYXRlJTIwc2F1Y2V8ZW58MXx8fHwxNzYzMjUxMTQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        },
        {
          id: 'food-7',
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
          image: 'https://images.unsplash.com/photo-1723473620176-8d26dc6314cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWVzbyUyMGZ1bmRpZG8lMjBtZWx0ZWQlMjBjaGVlc2V8ZW58MXx8fHwxNzYzMjUxMTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
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
          image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400',
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
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
        },
      ],
    },
  },
];
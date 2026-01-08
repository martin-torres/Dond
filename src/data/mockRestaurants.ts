import { Restaurant, Language } from '../types';

// Helper to keep multilingual text tidy
const createMultiLangText = (
  en: string,
  es: string,
  fr?: string,
  de?: string,
  ja?: string,
  ar?: string,
  zh?: string
): Record<Language, string> => ({
  en,
  es: es || en,
  fr: fr || en,
  de: de || en,
  ja: ja || en,
  ar: ar || en,
  zh: zh || en,
});

export const mockRestaurants: Restaurant[] = [
  // 1) RUPRESTRE – Barrio Antiguo
  {
    id: 'rest-rupestre',
    name: 'Rupestre Bar Culinario',
    address: 'Morelos 867, Barrio Antiguo, Monterrey, N.L.',
    hours: {
      open: '5:00 PM',
      close: '2:00 AM',
    },
    waitTime: 20,      // minutes (you can change this)
    distance: 250,     // meters from user (demo only)
    promos: [
      {
        id: 'rup-promo-mariachi',
        title: createMultiLangText(
          'Mariachi Live • 7–8 PM',
          'Mariachi en vivo • 7–8 PM'
        ),
        description: createMultiLangText(
          'Arrive early for an intimate mariachi set tableside with complimentary welcome tequila.',
          'Llega temprano para disfrutar un set íntimo de mariachi en tu mesa con tequila de cortesía.',
          'Arrivez tôt pour un set de mariachi intimiste servi à table avec une tequila de bienvenue offerte.',
          'Kommen Sie früh für ein intimes Mariachi-Set direkt am Tisch mit einem kostenlosen Begrüßungstequila.',
          '早めにご来店いただくと、テーブル脇で楽しむ親密なマリアッチ演奏とウェルカムテキーラを無料でご用意します。',
          'احضر مبكرًا لتستمتع بوصلة مارياشي حميمة بجانب طاولتك مع تقديم تكيلا ترحيبية مجانًا.',
          '提早到店可在桌邊欣賞親密的馬里亞奇表演，並獲贈迎賓龍舌蘭一杯。'
        ),
        discount: 0,
        imageUrl:
          'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'rup-promo-2',
        title: createMultiLangText(
          'Craft Cocktails & Live Music • 8–10 PM',
          'Cocteles de Autor y Música en Vivo • 8–10 PM'
        ),
        description: createMultiLangText(
          'Signature mezcal cocktails, vinyl-only DJ set, and house drinks with special pricing after 8 PM.',
          'Cocteles de autor con mezcal, DJ set en vinilo y tragos de la casa con precio especial después de las 8 PM.',
          'Cocktails signature au mezcal, DJ set exclusivement vinyle et boissons de la maison à tarif spécial après 20 h.',
          'Signature-Mezcal-Cocktails, ein reines Vinyl-DJ-Set und Hausdrinks mit Spezialpreisen nach 20 Uhr.',
          'シグネチャーのメスカルカクテルに加え、アナログレコード限定のDJセットと、20時以降は特別価格のハウスドリンクをご提供します。',
          'كوكتيلات ميزكال مميزة، عرض DJ حصري على الأسطوانات الفينيل، ومشروبات البيت بأسعار خاصة بعد الساعة الثامنة مساءً.',
          '招牌梅斯卡爾調酒、黑膠限定DJ表演，以及晚上8點後的特價自家飲品。'
        ),
        discount: 0,
        imageUrl:
          'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800',
      },
      {
        id: 'rup-promo-chef',
        title: createMultiLangText(
          'Chef’s Fire-Grilled Wagyu',
          'Wagyu a la Parrilla del Chef'
        ),
        description: createMultiLangText(
          'Limited plates of A5 wagyu over ember-roasted vegetables, carved tableside while supplies last.',
          'Platos limitados de wagyu A5 con vegetales al rescoldo servidos directamente en tu mesa hasta agotar existencia.',
          'Assiettes limitées de wagyu A5 sur légumes rôtis aux braises, découpé à table jusqu’à épuisement.',
          'Limitierte Teller mit A5-Wagyu auf gluthgeröstetem Gemüse, am Tisch tranchiert solange der Vorrat reicht.',
          '炭火で焼き上げた野菜にA5和牛を添え、提供の際にテーブルでカットしてお出しします。数量限定です。',
          'أطباق محدودة من لحم واجيو A5 فوق خضروات مشوية على الجمر، تُقطع عند الطاولة طالما أن الكمية متوفرة.',
          '限量A5和牛搭配炭火烤蔬菜，於桌邊現場切片，售完為止。'
        ),
        discount: 0,
        imageUrl:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      },
    ],
    tables: [
      { id: 'rup-table-1', number: 1, seats: 2, location: 'patio', available: true, x: 6, y: 8 },
      { id: 'rup-table-2', number: 2, seats: 4, location: 'patio', available: false, x: 20, y: 8 },
      { id: 'rup-table-3', number: 3, seats: 4, location: 'patio', available: true, reserved: true, x: 10, y: 18 },
      { id: 'rup-table-4', number: 4, seats: 4, location: 'patio', available: true, x: 24, y: 18 },
      { id: 'rup-table-5', number: 5, seats: 2, location: 'window', available: true, x: 48, y: 10 },
      { id: 'rup-table-6', number: 6, seats: 4, location: 'window', available: true, reserved: true, x: 62, y: 12 },
      { id: 'rup-table-7', number: 7, seats: 4, location: 'window', available: false, x: 76, y: 14 },
      { id: 'rup-table-8', number: 8, seats: 6, location: 'middle', available: true, x: 34, y: 32 },
      { id: 'rup-table-9', number: 9, seats: 6, location: 'middle', available: true, reserved: true, x: 50, y: 36 },
      { id: 'rup-table-10', number: 10, seats: 6, location: 'middle', available: false, x: 66, y: 40 },
      { id: 'rup-table-11', number: 11, seats: 4, location: 'balcony', available: true, x: 70, y: 4 },
      { id: 'rup-table-12', number: 12, seats: 2, location: 'balcony', available: false, x: 84, y: 6 },
      { id: 'rup-table-13', number: 13, seats: 4, location: 'secondFloor', available: true, x: 28, y: 52 },
      { id: 'rup-table-14', number: 14, seats: 4, location: 'secondFloor', available: true, reserved: true, x: 46, y: 56 },
      { id: 'rup-table-15', number: 15, seats: 6, location: 'secondFloor', available: true, x: 64, y: 60 },
    ],
    menu: {
      drinks: [
        {
          id: 'rup-drink-1',
          name: createMultiLangText('Huichol Mezcalito', 'Huichol Mezcalito'),
          description: createMultiLangText(
            'Mezcal, citrus, dried chile, light foam.',
            'Mezcal, cítricos, chile seco y espuma ligera.',
            'Mezcal, agrumes, piment sec et écume légère.',
            'Mezcal, Zitrusfrüchte, getrocknete Chilischote und leichte Schaumkrone.',
            'メスカルに柑橘と乾燥チリを合わせ、軽やかなフォームをのせました。',
            'ميزكال مع نكهات الحمضيات وفلفل مجفف ورغوة خفيفة.',
            '梅斯卡爾搭配柑橘、乾辣椒與輕盈泡沫。'
          ),
          price: 220,
          category: 'Cocktails',
          image:
            'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        },
        {
          id: 'rup-drink-2',
          name: createMultiLangText('Rupestre Gin Tonic', 'Rupestre Gin Tonic'),
          description: createMultiLangText(
            'Artisanal gin, tonic water, citrus, and botanicals.',
            'Gin artesanal, agua tónica, cítricos y botanicals.',
            'Gin artisanal, tonique, agrumes et botaniques parfumées.',
            'Handwerklicher Gin, Tonic, Zitrusnoten und Botanicals.',
            'クラフトジンにトニックと柑橘、ボタニカルの香りを合わせました。',
            'جن حرفي مع ماء تونك ولمسات من الحمضيات والأعشاب العطرية.',
            '手工琴酒、湯力水、柑橘與草本香氣。'
          ),
          price: 210,
          category: 'Cocktails',
          image:
            'https://images.unsplash.com/photo-1545680016-33fd4d6c4b8e?w=800',
        },
        {
          id: 'rup-drink-3',
          name: createMultiLangText('Draft Beer', 'Draft Beer'),
          description: createMultiLangText(
            'Rotating local draft, crisp and cold.',
            'Linea rotativa local, siempre fría.',
            'Pression locale tournante, fraîche et bien pétillante.',
            'Wechselndes Fassbier aus der Region, kühl und spritzig.',
            '地元の樽生を日替わりで。キレのある冷たい一杯。',
            'صنبور محلي متغير، بارد ومنعش.',
            '輪替本地生啤，冰鎮爽口。'
          ),
          price: 140,
          category: 'Drinks',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        },
        {
          id: 'rup-drink-4',
          name: createMultiLangText('Soda Drinks', 'Soda Drinks'),
          description: createMultiLangText(
            'Classic sodas and sparkling mixers.',
            'Refrescos clásicos y mezcladores con burbujas.',
            'Sodas classiques et mélangeurs pétillants.',
            'Klassische Limonaden und spritzige Mixer.',
            '定番ソーダやスパークリングの割材。',
            'مشروبات غازية كلاسيكية ومكسرات فوارة.',
            '經典汽水與氣泡調和飲料。'
          ),
          price: 80,
          category: 'Drinks',
          image: 'https://images.unsplash.com/photo-1509057199576-632a47484ece?w=800',
        },
        {
          id: 'rup-drink-5',
          name: createMultiLangText('Turmeric Peppermint Squirty', 'Turmeric Peppermint Squirty'),
          description: createMultiLangText(
            'Turmeric, peppermint, citrus spritz over ice.',
            'Cúrcuma, menta y cítricos en spritz con hielo.',
            'Curcuma, menthe poivrée et agrumes en spritz sur glace.',
            'Kurkuma, Pfefferminze und Zitrus als spritziger Drink auf Eis.',
            'ターメリックとペパーミントに柑橘を合わせたスプリッツをアイスで。',
            'كركم ونعناع مع رذاذ حمضيات فوق الثلج.',
            '薑黃、薄荷與柑橘調成的冰鎮氣泡飲。'
          ),
          price: 165,
          category: 'Signature',
          image: 'https://images.unsplash.com/photo-1514361892635-6e122620e4d1?w=800',
        },
      ],
      food: [
        {
          id: 'rup-food-1',
          name: createMultiLangText('Short Rib Tacos', 'Tacos de Short Rib'),
          description: createMultiLangText(
            'Braised short rib, corn tortillas, house salsa.',
            'Short rib braseado, tortillas de maíz y salsa de la casa.',
            'Short rib braisé avec tortillas de maïs et salsa maison.',
            'Geschmorte Short Ribs mit Maistortillas und hausgemachter Salsa.',
            '柔らかく煮込んだショートリブを、コーントルティーヤと自家製サルサで。',
            'أضلاع قصيرة مطهية ببطء مع تورتيلا الذرة وسالسا منزلية.',
            '慢燉牛小排配玉米餅與自家沙司。'
          ),
          price: 260,
          category: 'Tacos',
          image:
            'https://images.unsplash.com/photo-1601924582971-df6c39c7c6a3?w=800',
        },
        {
          id: 'rup-food-2',
          name: createMultiLangText('Ribeye Burger', 'Hamburguesa de Ribeye'),
          description: createMultiLangText(
            'Ground ribeye, cheese, caramelized onion, fries.',
            'Carne de ribeye molido, queso, cebolla caramelizada y papas fritas.',
            'Ribeye haché, fromage, oignons caramélisés et frites croustillantes.',
            'Ribeye-Hack, Käse, karamellisierte Zwiebeln und knusprige Pommes.',
            '挽きたてのリブアイにチーズとキャラメルオニオン、フライドポテトを添えました。',
            'ريب آي مفروم مع الجبن وبصل مكرمل وبطاطا مقلية.',
            '絞碎肋眼牛排搭配乳酪、焦糖化洋蔥與薯條。'
          ),
          price: 280,
          category: 'Burger',
          image:
            'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
        },
        {
          id: 'rup-food-3',
          name: createMultiLangText(
            'Tacos de Arrachera',
            'Tacos de Arrachera',
            'Tacos de Arrachera',
            'Tacos de Arrachera',
            'Tacos de Arrachera',
            'Tacos de Arrachera',
            'Tacos de Arrachera'
          ),
          description: createMultiLangText(
            'Charred skirt steak, salsa verde, lime, handmade tortillas.',
            'Arrachera a la parrilla, salsa verde, limón y tortillas hechas a mano.',
            "Bavette grillée, salsa verde, citron vert, tortillas maison.",
            'Gegrilltes Skirt-Steak, Salsa Verde, Limette und handgemachte Tortillas.',
            '炙ったスカートステーキにサルサ・ヴェルデ、ライム、自家製トルティーヤ。',
            'لحم سكيرت مشوي مع صلصة خضراء وليمون وتورتيلا منزلية.',
            '炙烤腹肉牛排配青莎莎、萊姆與手工玉米餅。'
          ),
          price: 245,
          category: 'Mains',
          image: 'https://images.unsplash.com/photo-1608039829572-78524f77fc5c?w=800',
        },
        {
          id: 'rup-food-4',
          name: createMultiLangText(
            'Parrillada',
            'Parrillada',
            'Parrillada',
            'Parrillada',
            'Parrillada',
            'Parrillada',
            'Parrillada'
          ),
          description: createMultiLangText(
            'Mixed grill with chorizo, steak, and roasted veggies.',
            'Parrillada con chorizo, corte de res y vegetales rostizados.',
            'Assortiment grillé avec chorizo, steak et légumes rôtis.',
            'Gemischte Grillplatte mit Chorizo, Steak und geröstetem Gemüse.',
            'チョリソー、ステーキ、ロースト野菜のミックスグリル。',
            'مشاوي مشكلة مع تشوريزو وستيك وخضار مشوية.',
            '香腸、牛排與烤蔬菜的綜合炭烤拼盤。'
          ),
          price: 480,
          category: 'Mains',
          image: 'https://images.unsplash.com/photo-1559057348-7a33b0700f83?w=800',
        },
        {
          id: 'rup-food-5',
          name: createMultiLangText(
            'Molcajete de Sirloin y Ribeye',
            'Molcajete de Sirloin y Ribeye',
            'Molcajete de Sirloin y Ribeye',
            'Molcajete de Sirloin y Ribeye',
            'Molcajete de Sirloin y Ribeye',
            'Molcajete de Sirloin y Ribeye',
            'Molcajete de Sirloin y Ribeye'
          ),
          description: createMultiLangText(
            'Seared sirloin and ribeye in bubbling molcajete with grilled cheese.',
            'Sirloin y ribeye sellados en molcajete burbujeante con queso asado.',
            'Faux-filet et ribeye saisis dans un molcajete bouillonnant avec fromage grillé.',
            'Angebratener Sirloin und Ribeye im blubbernden Molcajete mit Grillkäse.',
            'アツアツのモルカへーテにサーロインとリブアイ、炙りチーズを合わせて。',
            'سيرلوين وريب آي محمر في مولكاجيت يغلي مع جبن مشوي.',
            '鐵壺石臼中盛上煎烤沙朗與肋眼，加上炙燒起司。'
          ),
          price: 520,
          category: 'Mains',
          image: 'https://images.unsplash.com/photo-1604908554164-025f5b0f8c5e?w=800',
        },
        {
          id: 'rup-food-6',
          name: createMultiLangText(
            'Calabacita Rellena',
            'Calabacita Rellena',
            'Calabacita Rellena',
            'Calabacita Rellena',
            'Calabacita Rellena',
            'Calabacita Rellena',
            'Calabacita Rellena'
          ),
          description: createMultiLangText(
            'Stuffed squash with melted cheese and herbs.',
            'Calabacita rellena con queso gratinado y hierbas.',
            'Courge farcie au fromage fondant et herbes.',
            'Gefüllter Kürbis mit geschmolzenem Käse und Kräutern.',
            'とろけるチーズとハーブを詰めたズッキーニ。',
            'قرع محشو بجبن ذائب وأعشاب.',
            '填入融化起司與香草的櫛瓜。'
          ),
          price: 195,
          category: 'Appetizers',
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
        },
        {
          id: 'rup-food-7',
          name: createMultiLangText(
            'Chilitos Cremosos',
            'Chilitos Cremosos',
            'Chilitos Cremosos',
            'Chilitos Cremosos',
            'Chilitos Cremosos',
            'Chilitos Cremosos',
            'Chilitos Cremosos'
          ),
          description: createMultiLangText(
            'Peppers in creamy sauce with bacon and crushed piquín.',
            'Chilitos en salsa cremosa con tocino y piquín quebrado.',
            'Piments en sauce crémeuse avec bacon et piquín concassé.',
            'Paprika in cremiger Sauce mit Speck und zerstoßenem Piquín.',
            'ベーコンと砕いたピキン唐辛子入りクリームソースのチリ。',
            'فلفل في صلصة كريمية مع لحم مقدد وبيكين مجروش.',
            '奶油醬辣椒配培根與碎皮奎因辣椒。'
          ),
          price: 185,
          category: 'Appetizers',
          image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        },
        {
          id: 'rup-food-8',
          name: createMultiLangText(
            'Pay de Calabaza y Pistache',
            'Pay de Calabaza y Pistache',
            'Pay de Calabaza y Pistache',
            'Pay de Calabaza y Pistache',
            'Pay de Calabaza y Pistache',
            'Pay de Calabaza y Pistache',
            'Pay de Calabaza y Pistache'
          ),
          description: createMultiLangText(
            'Pumpkin pie with pistachio crunch and whipped crema.',
            'Pay de calabaza con pistache crujiente y crema batida.',
            'Tarte à la citrouille avec croustillant de pistache et crème fouettée.',
            'Kürbiskuchen mit Pistazien-Crunch und geschlagener Creme.',
            'ピスタチオの食感を添えたパンプキンパイ、ホイップクリーム添え。',
            'فطيرة قرع مع قرمشة فستق وكريمة مخفوقة.',
            '南瓜派配開心果脆與鮮奶油。'
          ),
          price: 165,
          category: 'Desserts',
          image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800',
        },
        {
          id: 'rup-food-9',
          name: createMultiLangText(
            'Mini Hotcakes con Frutos Rojos',
            'Mini Hotcakes con Frutos Rojos',
            'Mini Hotcakes con Frutos Rojos',
            'Mini Hotcakes con Frutos Rojos',
            'Mini Hotcakes con Frutos Rojos',
            'Mini Hotcakes con Frutos Rojos',
            'Mini Hotcakes con Frutos Rojos'
          ),
          description: createMultiLangText(
            'Caramelized berries over fluffy mini pancakes.',
            'Frutos rojos caramelizados sobre mini hotcakes esponjosos.',
            'Baies caramélisées sur de moelleux mini pancakes.',
            'Karamellisierte Beeren auf fluffigen Mini-Pfannkuchen.',
            'キャラメリゼしたベリーをのせたふわふわミニパンケーキ。',
            'توت مكرمل فوق ميني بانكيك هش.',
            '焦糖漿莓果鋪在鬆軟迷你鬆餅上。'
          ),
          price: 155,
          category: 'Desserts',
          image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&sat=-20',
        },
        {
          id: 'rup-food-10',
          name: createMultiLangText(
            'Nieve del Dis',
            'Nieve del Dis',
            'Nieve del Dis',
            'Nieve del Dis',
            'Nieve del Dis',
            'Nieve del Dis',
            'Nieve del Dis'
          ),
          description: createMultiLangText(
            'Chef’s rotating ice cream scoop served tableside.',
            'Nieve del día servida en mesa, sabor rotativo.',
            'Boule de glace du jour servie à table par le chef.',
            'Täglich wechselnde Eiskugel, am Tisch serviert.',
            'シェフおまかせのアイスクリームをテーブルで提供。',
            'كرة آيس كريم تتغير يوميًا يقدّمها الشيف على الطاولة.',
            '主廚每日變換口味的冰淇淋，桌邊服務。'
          ),
          price: 120,
          category: 'Desserts',
          image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&sat=-60',
        },
      ],
    },
  },

  // 2) MAUI – concepto isleño en Barrio Antiguo
  {
    id: 'rest-one-maui',
    name: 'Maui',
    address: 'José María Morelos 1045, Barrio Antiguo, Monterrey, N.L.',
    hours: {
      open: '5:00 PM',
      close: '10:00 PM',
    },
    waitTime: 10,   // minutes
    distance: 120,  // meters (demo)
    promos: [
      {
        id: 'maui-promo-1',
        title: createMultiLangText(
          'Nalus 2x1 Tuesday',
          'Nalus 2x1 los martes'
        ),
        description: createMultiLangText(
          'Chase the sunset with two-for-one signature Nalus every Tuesday from 6–8 PM.',
          'Despide el atardecer con dos por uno en los Nalus de la casa todos los martes de 6 a 8 PM.',
          'Poursuis le coucher du soleil avec deux pour un sur les Nalus signature chaque mardi de 18h à 20h.',
          'Feiere den Sonnenuntergang mit 2-für-1 auf unsere Signature Nalus jeden Dienstag von 18–20 Uhr.',
          '毎週火曜の18〜20時は看板ナールが2杯目無料、夕日を眺めながらどうぞ。',
          'لاحق غروب الشمس مع عرض ٢ مقابل ١ على مشروبات نالو المميزة كل ثلاثاء من 6 إلى 8 مساءً.',
          '每週二晚間 6–8 點，招牌 Nalu 飲品買二付一，陪你追夕陽。'
        ),
        discount: 0,
        imageUrl:
          'https://image.pollinations.ai/prompt/Icy%20blue%20mocktail%20served%20in%20a%20chilled%20highball,%20tropical%20lighting',
        menuItemId: 'maui-drink-1',
        menuCategory: 'drinks',
      },
      {
        id: 'maui-promo-2',
        title: createMultiLangText(
          'Nachos Patacón Special',
          'Especial Nachos Patacón'
        ),
        description: createMultiLangText(
          'Share a tray of our Nachos Patacón with molten queso, carne, pico and crema for MXN 250 all night.',
          'Comparte nuestros Nachos Patacón con queso fundido, carne, pico y crema por MXN 250 toda la noche.',
          'Partagez un plateau de Nachos Patacón avec fromage fondu, carne, pico et crema pour 250 MXN toute la soirée.',
          'Teile ein Blech Nachos Patacón mit geschmolzenem Käse, Fleisch, Pico und Crema – den ganzen Abend für 250 MXN.',
          'とろけるチーズ、ビーフ、ピコ・デ・ガヨ、クリームを載せたナチョス・パタコンを、夜通し250ペソでシェア。',
          'شارك صينية ناشوز باتاكون بالجبن المذاب واللحم والبيكو والكريما مقابل 250 بيزو طوال الليل.',
          '整盤帕塔孔玉米片鋪滿起司、牛肉、pico 與酸奶油，整晚只要 250 披索，一起分享。'
        ),
        discount: 0,
        imageUrl:
          'https://image.pollinations.ai/prompt/Loaded%20patacon%20nachos%20with%20melted%20cheese%20and%20pico%20de%20gallo',
        menuItemId: 'maui-food-nachos',
        menuCategory: 'food',
      },
    ],
    tables: [
      { id: 'maui-table-21', number: 21, seats: 2, location: 'patio', available: true, x: 8, y: 8 },
      { id: 'maui-table-22', number: 22, seats: 4, location: 'patio', available: true, x: 24, y: 8 },
      { id: 'maui-table-23', number: 23, seats: 4, location: 'patio', available: false, x: 12, y: 22 },
      { id: 'maui-table-24', number: 24, seats: 2, location: 'patio', available: true, reserved: true, x: 40, y: 8 },
      { id: 'maui-table-25', number: 25, seats: 2, location: 'patio', available: true, x: 30, y: 24 },
      { id: 'maui-table-26', number: 26, seats: 4, location: 'window', available: true, x: 50, y: 12 },
      { id: 'maui-table-27', number: 27, seats: 4, location: 'window', available: true, reserved: true, x: 68, y: 16 },
      { id: 'maui-table-28', number: 28, seats: 4, location: 'window', available: false, x: 82, y: 20 },
      { id: 'maui-table-29', number: 29, seats: 6, location: 'middle', available: true, x: 36, y: 32 },
      { id: 'maui-table-30', number: 30, seats: 6, location: 'middle', available: true, reserved: true, x: 58, y: 44 },
      { id: 'maui-table-31', number: 31, seats: 6, location: 'middle', available: true, x: 72, y: 48 },
      { id: 'maui-table-32', number: 32, seats: 2, location: 'balcony', available: true, x: 74, y: 6 },
      { id: 'maui-table-33', number: 33, seats: 2, location: 'balcony', available: false, x: 88, y: 10 },
      { id: 'maui-table-34', number: 34, seats: 4, location: 'secondFloor', available: true, x: 26, y: 52 },
      { id: 'maui-table-35', number: 35, seats: 4, location: 'secondFloor', available: true, reserved: true, x: 44, y: 58 },
      { id: 'maui-table-36', number: 36, seats: 6, location: 'secondFloor', available: false, x: 62, y: 60 },
    ],
    menu: {
      drinks: [
        {
          id: 'maui-drink-1',
          name: createMultiLangText('Nalu Wailele', 'Nalu Wailele'),
          description: createMultiLangText(
            'Sprite Zero slush with blue Hawaii coconut-vanilla foam.',
            'Granizado de Sprite Zero con espuma blue Hawaii de coco y vainilla.',
            'Granité de Sprite Zero coiffé d’une mousse coco-vanille façon Blue Hawaii.',
            'Sprite-Zero-Slush mit Blue-Hawaii-Kokos-Vanille-Schaum.',
            'スプライトゼロのフローズンに、ブルーハワイ風のココナッツバニラフォームを重ねました。',
            'سلاش سبرايت زيرو مع رغوة بلو هاواي بنكهة جوز الهند والفانيلا.',
            '雪碧Zero沙冰搭配藍色夏威夷椰香香草泡沫。'
          ),
          price: 80,
          category: 'Signature Slush',
          image:
            'https://image.pollinations.ai/prompt/Icy%20blue%20mocktail%20served%20in%20a%20chilled%20highball,%20tropical%20lighting',
        },
        {
          id: 'maui-drink-2',
          name: createMultiLangText('Nalu Hawaiian Rusa', 'Nalu Hawaiian Rusa'),
          description: createMultiLangText(
            'Squirt Zero slush splashed with orange, pineapple, and chamoy.',
            'Granizado de Squirt Zero con toques de naranja, piña y chamoy.',
            'Granité de Squirt Zero relevé d’orange, d’ananas et d’un trait de chamoy.',
            'Squirt-Zero-Slush mit Spritzern von Orange, Ananas und Chamoy.',
            'スクワートゼロのスラッシュにオレンジ、パイナップル、チャモイをアクセント。',
            'سلاش سكويرت زيرو مع لمسات من البرتقال والأناناس والشموي.',
            'Squirt Zero沙冰加入橙汁、鳳梨與恰摩伊醬點綴。'
          ),
          price: 80,
          category: 'Signature Slush',
          image:
            'https://image.pollinations.ai/prompt/Refreshing%20pink%20slushie%20mocktail%20with%20tamarind%20rim,%20studio%20food%20photo',
        },
        {
          id: 'maui-drink-3',
          name: createMultiLangText('Nalu Coco Cola', 'Nalu Coco Cola'),
          description: createMultiLangText(
            'Coca Light blended on ice with coconut cream.',
            'Coca Light congelada con un toque de crema de coco.',
            'Coca Light frappée sur glace avec crème de noix de coco.',
            'Coca Light mit Eis und Kokoscreme aufgeschlagen.',
            'コカライトを氷とブレンドし、ココナッツクリームを合わせた一杯。',
            'كوكا لايت مخفوقة مع الثلج وكريمة جوز الهند.',
            '健怡可樂碎冰混合椰奶泡沫。'
          ),
          price: 80,
          category: 'Signature Slush',
          image:
            'https://image.pollinations.ai/prompt/Frosty%20cola%20slush%20with%20coconut%20foam,%20moody%20bar%20lighting',
        },
        {
          id: 'maui-drink-4',
          name: createMultiLangText('Refresco Manzanita Sol', 'Refresco Manzanita Sol'),
          description: createMultiLangText(
            'Classic chilled Manzanita Sol to pair with your hot dog.',
            'Refresco Manzanita Sol bien frío para acompañar tu hot dog.',
            'Un Manzanita Sol bien frais pour accompagner votre hot-dog.',
            'Klassischer gekühlter Manzanita Sol als Begleiter zu deinem Hotdog.',
            'ホットドッグにぴったりの、よく冷えたマンザニータ・ソル。',
            'مشروب مانزانييتا سول كلاسيكي مبرد ليرافق الهوت دوغ الخاص بك.',
            '冰鎮 Manzanita Sol 蘋果汽水，與熱狗是絕配。'
          ),
          price: 20,
          category: 'Refrescos',
          image:
            'https://image.pollinations.ai/prompt/Studio%20shot%20of%20a%20glass%20bottle%20of%20apple%20soda%20with%20condensation',
        },
      ],
      food: [
        {
          id: 'maui-food-empanadas',
          name: createMultiLangText('Empanadas', 'Empanadas'),
          description: createMultiLangText(
            'Four assorted empanadas—pollo, deshebrada, and queso—served with garlicky salsa.',
            '4 empanadas con guisos surtidos de pollo, deshebrada y queso, acompañadas de salsa de ajo.',
            'Quatre empanadas assorties (poulet, effiloché, fromage) servies avec salsa à l’ail.',
            'Vier gemischte Empanadas – Hähnchen, geschmorte Rinderfaser und Käse – mit Knoblauch-Salsa.',
            '鶏肉、ほぐし牛肉、チーズの4種エンパナーダを、ガーリックサルサとともに。',
            'أربع إمبانادا متنوعة (دجاج، لحم مبشور، جبن) تُقدم مع صلصة بالثوم.',
            '四顆綜合餡餅（雞肉、手撕牛肉、起司）搭配蒜味莎莎醬。'
          ),
          price: 230,
          category: 'Antojitos',
          image:
            'https://image.pollinations.ai/prompt/Golden%20Latin%20empanadas%20with%20garlic%20sauce%20on%20a%20wooden%20board',
        },
        {
          id: 'maui-food-arepas',
          name: createMultiLangText('Arepas', 'Arepas'),
          description: createMultiLangText(
            'Four freshly griddled crunchy corn arepas filled with shredded beef, chicken, and melty cheese.',
            '4 arepas de maíz crujiente hechas al momento con guiso de deshebrada, pollo y queso.',
            'Quatre arepas de maïs croustillantes garnies de bœuf effiloché, de poulet et de fromage fondant.',
            'Vier knusprige Mais-Arepas vom Grill, gefüllt mit Rinderfasern, Hähnchen und schmelzendem Käse.',
            '焼きたてで香ばしいコーンアレパ4枚に、ほぐし牛肉・チキン・とろけるチーズを詰めました。',
            'أربع أريبا من الذرة المقرمشة محشوة بلحم بقر مبشور ودجاج وجبن ذائب.',
            '現烤香脆玉米阿雷巴餅，填滿手撕牛肉、雞肉與融化起司。'
          ),
          price: 230,
          category: 'Antojitos',
          image:
            'https://image.pollinations.ai/prompt/Crunchy%20Venezuelan%20arepas%20stuffed%20with%20shredded%20meats%20and%20cheese',
        },
        {
          id: 'maui-food-nachos',
          name: createMultiLangText('Nachos Patacón', 'Nachos Patacón'),
          description: createMultiLangText(
            'Crispy patacón base loaded with molten queso, beef, pico de gallo, and crema ácida.',
            'Crujientes patacones como base, cubiertos de queso fundido, carne, pico de gallo y crema ácida.',
            'Base croustillante de patacón garnie de queso fondant, bœuf, pico de gallo et crème acidulée.',
            'Knusprige Patacón-Basis mit geschmolzenem Käse, Rindfleisch, Pico de Gallo und Sauerrahm.',
            'カリッと揚げたパタコンに、とろけるチーズ、ビーフ、ピコ・デ・ガヨ、サワークリームをたっぷり。',
            'طبقة مقرمشة من الباتاقون مغطاة بجبن مذاب ولحم بقر وبيكو دي جالو وكريمة حامضة.',
            '酥脆大蕉片鋪滿融化起司、牛肉、墨西哥番茄莎莎與酸奶油。'
          ),
          price: 250,
          category: 'Para compartir',
          image:
            'https://image.pollinations.ai/prompt/Loaded%20patacon%20nachos%20with%20melted%20cheese%20and%20pico%20de%20gallo',
        },
        {
          id: 'maui-food-gobernador',
          name: createMultiLangText('Tacos Gobernador', 'Tacos Gobernador'),
          description: createMultiLangText(
            'Sautéed shrimp with peppers tucked into tortillas with a manchego cheese crust.',
            'Camarones frescos salteados con pimientos dentro de tortillas con costra de queso manchego.',
            'Crevettes sautées aux poivrons glissées dans des tortillas à croûte de fromage manchego.',
            'Gebratene Garnelen mit Paprika in Tortillas mit Manchego-Käsekruste.',
            'ソテーした海老とピーマンを、マンチェゴチーズの香ばしいコーントルティーヤに包みました。',
            'روبيان سوتيه مع فلفل داخل تورتيلا بقشرة جبن مانشيغو.',
            '炒蝦與甜椒包入帶有曼徹格乳酪脆皮的玉米餅。'
          ),
          price: 195,
          category: 'Tacos',
          image:
            'https://image.pollinations.ai/prompt/Gourmet%20shrimp%20gobernador%20tacos%20with%20manchego%20cheese%20crust',
        },
      ],
    },
  },
];

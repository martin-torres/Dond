import { Restaurant } from '../types/restaurant';

export const mockRestaurants: Restaurant[] = [
  {
    id: 'rupestre-bar',
    name: 'Rupestre Bar Culinario',
    description: {
      en: 'Contemporary Mexican cuisine with innovative techniques and traditional flavors in the heart of Mexico City.',
      es: 'Cocina mexicana contemporánea con técnicas innovadoras y sabores tradicionales en el corazón de la Ciudad de México.',
      fr: 'Cuisine mexicaine contemporaine avec des techniques innovantes et des saveurs traditionnelles au cœur de Mexico.',
      de: 'Zeitgenössische mexikanische Küche mit innovativen Techniken und traditionellen Aromen im Herzen von Mexiko-Stadt.',
      ja: 'メキシコシティの中心部で革新的な技術と伝統的な味を融合した現代メキシコ料理。',
      ar: 'المطبخ المكسيكي المعاصر بتقنيات مبتكرة ونكهات تقليدية في قلب مكسيكو سيتي.',
      zh: '位于墨西哥城中心，融合创新技术和传统风味的现代墨西哥美食。'
    },
    address: 'Av. Presidente Masaryk 513, Polanco, Miguel Hidalgo, 11560 Ciudad de México, CDMX',
    phone: '+52 55 5280 1671',
    image: '/api/placeholder/400/300',
    waitTime: 25,
    tables: [
      { id: 't1', number: 1, seats: 2, location: 'window', available: true, reserved: false, x: 15, y: 20 },
      { id: 't2', number: 2, seats: 4, location: 'window', available: true, reserved: true, x: 35, y: 15 },
      { id: 't3', number: 3, seats: 6, location: 'middle', available: false, reserved: false, x: 50, y: 30 },
      { id: 't4', number: 4, seats: 2, location: 'patio', available: true, reserved: false, x: 75, y: 25 },
      { id: 't5', number: 5, seats: 4, location: 'patio', available: true, reserved: false, x: 80, y: 50 },
      { id: 't6', number: 6, seats: 8, location: 'balcony', available: true, reserved: false, x: 25, y: 70 },
      { id: 't7', number: 7, seats: 2, location: 'balcony', available: false, reserved: false, x: 65, y: 75 },
      { id: 't8', number: 8, seats: 4, location: 'middle', available: true, reserved: true, x: 45, y: 55 }
    ],
    menu: {
      food: [
        {
          id: 'f1',
          name: {
            en: 'Tuna Tostada Rupestre',
            es: 'Tostada de Atún Rupestre',
            fr: 'Tostada de Thon Rupestre',
            de: 'Thunfisch-Tostada Rupestre',
            ja: 'ルペストレ マグロトスターダ',
            ar: 'توستادا التونة روبيستري',
            zh: '鲁佩斯特金枪鱼脆饼'
          },
          description: {
            en: 'Fresh tuna sashimi on crispy corn tostada with avocado mousse, chipotle mayo, and microgreens',
            es: 'Sashimi de atún fresco sobre tostada de maíz crujiente con mousse de aguacate, mayo chipotle y microverdes',
            fr: 'Sashimi de thon frais sur tostada de maïs croustillante avec mousse d\'avocat, mayo chipotle et micropousses',
            de: 'Frisches Thunfisch-Sashimi auf knuspriger Mais-Tostada mit Avocado-Mousse, Chipotle-Mayo und Microgreens',
            ja: '新鮮なマグロの刺身をクリスピーなコーントスターダに、アボカドムース、チポトレマヨ、マイクログリーンと共に',
            ar: 'ساشيمي التونة الطازجة على توستادا الذرة المقرمشة مع موس الأفوكادو والمايونيز الحار والخضروات الصغيرة',
            zh: '新鲜金枪鱼刺身配脆玉米饼，牛油果慕斯，墨西哥辣椒蛋黄酱和微型蔬菜'
          },
          price: 285,
          category: 'food',
          image: '/api/placeholder/300/200',
          available: true
        },
        {
          id: 'f2',
          name: {
            en: 'Duck Carnitas',
            es: 'Carnitas de Pato',
            fr: 'Carnitas de Canard',
            de: 'Enten-Carnitas',
            ja: 'ダック カルニータス',
            ar: 'كارنيتاس البط',
            zh: '鸭肉卡尼塔斯'
          },
          description: {
            en: 'Slow-cooked duck leg confit with mole negro, corn tortillas, and seasonal vegetables',
            es: 'Pierna de pato confitada cocida lentamente con mole negro, tortillas de maíz y verduras de temporada',
            fr: 'Cuisse de canard confite cuite lentement avec mole negro, tortillas de maïs et légumes de saison',
            de: 'Langsam gegarte Entenkeule confit mit Mole Negro, Maistortillas und saisonalem Gemüse',
            ja: 'ゆっくりと調理されたダック脚のコンフィ、モーレ・ネグロ、コーントルティーヤ、季節野菜',
            ar: 'ساق البط المطبوخة ببطء مع صلصة المولي السوداء وتورتيلا الذرة والخضروات الموسمية',
            zh: '慢炖鸭腿配黑色摩尔酱，玉米饼和时令蔬菜'
          },
          price: 485,
          category: 'food',
          image: '/api/placeholder/300/200',
          available: true
        },
        {
          id: 'f3',
          name: {
            en: 'Ribeye Steak Rupestre',
            es: 'Ribeye Rupestre',
            fr: 'Ribeye Rupestre',
            de: 'Ribeye-Steak Rupestre',
            ja: 'リブアイステーキ ルペストレ',
            ar: 'ستيك الريب آي روبيستري',
            zh: '鲁佩斯特肋眼牛排'
          },
          description: {
            en: 'Grilled ribeye with chimichurri, roasted vegetables, and potato gratin',
            es: 'Ribeye a la parrilla con chimichurri, verduras asadas y gratín de papa',
            fr: 'Ribeye grillé avec chimichurri, légumes rôtis et gratin de pommes de terre',
            de: 'Gegrilltes Ribeye mit Chimichurri, geröstetem Gemüse und Kartoffelgratin',
            ja: 'グリルしたリブアイにチミチュリ、ローストベジタブル、ポテトグラタン',
            ar: 'ستيك الريب آي المشوي مع صلصة الشيميشوري والخضروات المحمصة وجراتان البطاطس',
            zh: '烤肋眼牛排配阿根廷青酱，烤蔬菜和土豆焗烤'
          },
          price: 650,
          category: 'food',
          image: '/api/placeholder/300/200',
          available: true
        },
        {
          id: 'f4',
          name: {
            en: 'Sea Bass Veracruzana',
            es: 'Robalo a la Veracruzana',
            fr: 'Bar de Mer à la Veracruzana',
            de: 'Seebarsch Veracruzana',
            ja: 'シーバス ベラクルサーナ',
            ar: 'باس البحر فيراكروزانا',
            zh: '韦拉克鲁斯风味鲈鱼'
          },
          description: {
            en: 'Pan-seared sea bass with tomato, olives, capers, and jalapeños',
            es: 'Robalo sellado en sartén con tomate, aceitunas, alcaparras y jalapeños',
            fr: 'Bar de mer poêlé avec tomates, olives, câpres et jalapeños',
            de: 'Gebratener Seebarsch mit Tomaten, Oliven, Kapern und Jalapeños',
            ja: 'パンシアードシーバスにトマト、オリーブ、ケッパー、ハラペーニョ',
            ar: 'باس البحر المقلي مع الطماطم والزيتون والكبار والهالبينو',
            zh: '煎鲈鱼配番茄，橄榄，刺山柑和墨西哥辣椒'
          },
          price: 420,
          category: 'food',
          image: '/api/placeholder/300/200',
          available: true
        }
      ],
      drinks: [
        {
          id: 'd1',
          name: {
            en: 'Mezcal Old Fashioned',
            es: 'Old Fashioned de Mezcal',
            fr: 'Old Fashioned au Mezcal',
            de: 'Mezcal Old Fashioned',
            ja: 'メスカル オールドファッションド',
            ar: 'أولد فاشند الميسكال',
            zh: '梅斯卡尔古典鸡尾酒'
          },
          description: {
            en: 'Premium mezcal with agave nectar, orange bitters, and smoked salt rim',
            es: 'Mezcal premium con néctar de agave, amargos de naranja y borde de sal ahumada',
            fr: 'Mezcal premium avec nectar d\'agave, amers d\'orange et bord de sel fumé',
            de: 'Premium-Mezcal mit Agavennektar, Orangenbitter und geräuchertem Salzrand',
            ja: 'プレミアムメスカルにアガベネクター、オレンジビターズ、スモークソルトリム',
            ar: 'ميسكال ممتاز مع رحيق الأغاف والمر البرتقالي وحافة الملح المدخن',
            zh: '优质梅斯卡尔配龙舌兰花蜜，橙味苦精和烟熏盐边'
          },
          price: 185,
          category: 'drinks',
          image: '/api/placeholder/300/200',
          available: true
        },
        {
          id: 'd2',
          name: {
            en: 'Rupestre Margarita',
            es: 'Margarita Rupestre',
            fr: 'Margarita Rupestre',
            de: 'Rupestre Margarita',
            ja: 'ルペストレ マルガリータ',
            ar: 'مارغاريتا روبيستري',
            zh: '鲁佩斯特玛格丽塔'
          },
          description: {
            en: 'House special margarita with premium tequila, lime, and tajín rim',
            es: 'Margarita especial de la casa con tequila premium, lima y borde de tajín',
            fr: 'Margarita spéciale maison avec tequila premium, citron vert et bord de tajín',
            de: 'Hausspecial Margarita mit Premium-Tequila, Limette und Tajín-Rand',
            ja: 'ハウススペシャルマルガリータ、プレミアムテキーラ、ライム、タヒンリム',
            ar: 'مارغاريتا خاصة بالمنزل مع التكيلا الممتازة والليمون وحافة التاهين',
            zh: '招牌玛格丽塔配优质龙舌兰，青柠和塔津调料边'
          },
          price: 165,
          category: 'drinks',
          image: '/api/placeholder/300/200',
          available: true
        },
        {
          id: 'd3',
          name: {
            en: 'Craft Beer Selection',
            es: 'Selección de Cerveza Artesanal',
            fr: 'Sélection de Bière Artisanale',
            de: 'Craft-Bier-Auswahl',
            ja: 'クラフトビールセレクション',
            ar: 'مجموعة البيرة الحرفية',
            zh: '精酿啤酒精选'
          },
          description: {
            en: 'Rotating selection of Mexican craft beers',
            es: 'Selección rotativa de cervezas artesanales mexicanas',
            fr: 'Sélection tournante de bières artisanales mexicaines',
            de: 'Wechselnde Auswahl mexikanischer Craft-Biere',
            ja: 'メキシコのクラフトビールの回転セレクション',
            ar: 'مجموعة متناوبة من البيرة الحرفية المكسيكية',
            zh: '轮换的墨西哥精酿啤酒选择'
          },
          price: 85,
          category: 'drinks',
          image: '/api/placeholder/300/200',
          available: true
        },
        {
          id: 'd4',
          name: {
            en: 'Horchata Cocktail',
            es: 'Cóctel de Horchata',
            fr: 'Cocktail Horchata',
            de: 'Horchata-Cocktail',
            ja: 'オルチャータカクテル',
            ar: 'كوكتيل الهورشاتا',
            zh: '奥尔查塔鸡尾酒'
          },
          description: {
            en: 'Traditional horchata with rum, cinnamon, and vanilla',
            es: 'Horchata tradicional con ron, canela y vainilla',
            fr: 'Horchata traditionnelle avec rhum, cannelle et vanille',
            de: 'Traditionelle Horchata mit Rum, Zimt und Vanille',
            ja: '伝統的なオルチャータにラム、シナモン、バニラ',
            ar: 'هورشاتا تقليدية مع الروم والقرفة والفانيليا',
            zh: '传统奥尔查塔配朗姆酒，肉桂和香草'
          },
          price: 145,
          category: 'drinks',
          image: '/api/placeholder/300/200',
          available: true
        }
      ]
    }
  },
  {
    id: 'bella-vista',
    name: 'Bella Vista Trattoria',
    description: {
      en: 'Authentic Italian cuisine with fresh ingredients and traditional recipes in a cozy atmosphere.',
      es: 'Auténtica cocina italiana con ingredientes frescos y recetas tradicionales en un ambiente acogedor.',
      fr: 'Cuisine italienne authentique avec des ingrédients frais et des recettes traditionnelles dans une atmosphère chaleureuse.',
      de: 'Authentische italienische Küche mit frischen Zutaten und traditionellen Rezepten in gemütlicher Atmosphäre.',
      ja: '居心地の良い雰囲気で新鮮な食材と伝統的なレシピを使った本格的なイタリア料理。',
      ar: 'المطبخ الإيطالي الأصيل مع المكونات الطازجة والوصفات التقليدية في جو مريح.',
      zh: '在舒适的氛围中享用新鲜食材和传统食谱制作的正宗意大利美食。'
    },
    address: '456 Harbor Drive, Waterfront District',
    phone: '+1 (555) 987-6543',
    image: '/api/placeholder/400/300',
    waitTime: 15,
    tables: [
      { id: 'bt1', number: 11, seats: 2, location: 'window', available: true, reserved: false, x: 20, y: 25 },
      { id: 'bt2', number: 12, seats: 4, location: 'middle', available: true, reserved: false, x: 45, y: 35 },
      { id: 'bt3', number: 13, seats: 6, location: 'patio', available: false, reserved: false, x: 70, y: 40 },
      { id: 'bt4', number: 14, seats: 2, location: 'balcony', available: true, reserved: true, x: 30, y: 65 }
    ],
    menu: {
      food: [
        {
          id: 'bf1',
          name: {
            en: 'Osso Buco Milanese',
            es: 'Osso Buco Milanés',
            fr: 'Osso Buco Milanaise',
            de: 'Osso Buco Mailänder Art',
            ja: 'オッソブーコ ミラネーゼ',
            ar: 'أوسو بوكو ميلانيز',
            zh: '米兰式牛骨髓'
          },
          description: {
            en: 'Braised veal shanks with saffron risotto and gremolata',
            es: 'Jarrete de ternera braseado con risotto de azafrán y gremolata',
            fr: 'Jarret de veau braisé avec risotto au safran et gremolata',
            de: 'Geschmorte Kalbshaxe mit Safran-Risotto und Gremolata',
            ja: '仔牛のすね肉の煮込み、サフランリゾット、グレモラータ添え',
            ar: 'ساق العجل المطبوخة مع ريزوتو الزعفران والغريمولاتا',
            zh: '炖小牛腿配藏红花烩饭和香草蒜蓉'
          },
          price: 38,
          category: 'food',
          image: '/api/placeholder/300/200',
          available: true
        }
      ],
      drinks: [
        {
          id: 'bd1',
          name: {
            en: 'Chianti Classico',
            es: 'Chianti Clásico',
            fr: 'Chianti Classique',
            de: 'Chianti Classico',
            ja: 'キャンティ クラシコ',
            ar: 'كيانتي كلاسيكو',
            zh: '经典基安蒂'
          },
          description: {
            en: 'Premium Italian red wine from Tuscany',
            es: 'Vino tinto italiano premium de la Toscana',
            fr: 'Vin rouge italien premium de Toscane',
            de: 'Premium italienischer Rotwein aus der Toskana',
            ja: 'トスカーナ産プレミアムイタリア赤ワイン',
            ar: 'نبيذ أحمر إيطالي ممتاز من توسكانا',
            zh: '来自托斯卡纳的优质意大利红酒'
          },
          price: 15,
          category: 'drinks',
          image: '/api/placeholder/300/200',
          available: true
        }
      ]
    }
  }
];
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Load Supabase credentials from .env
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Maui restaurant data from sql-seed-maui-restaurant.sql
const MAUI_RESTAURANT_ID = '3b79d61d-7cf9-44f7-b35f-28759b2c311d';

const mauiMenuItems = [
  // Drinks
  {
    restaurant_id: MAUI_RESTAURANT_ID,
    kind: 'drink',
    category: 'Signature Slush',
    station: 'bar',
    station_label: null,
    name: { en: 'Nalu Wailele', es: 'Nalu Wailele', fr: 'Nalu Wailele', de: 'Nalu Wailele', ja: 'Nalu Wailele', ar: 'Nalu Wailele', zh: 'Nalu Wailele' },
    description: {
      en: 'Sprite Zero slush with blue Hawaii coconut-vanilla foam.',
      es: 'Granizado de Sprite Zero con espuma blue Hawaii de coco y vainilla.',
      fr: 'Granité de Sprite Zero coiffé d\'une mousse coco-vanille façon Blue Hawaii.',
      de: 'Sprite-Zero-Slush mit Blue-Hawaii-Kokos-Vanille-Schaum.',
      ja: 'スプライトゼロのフローズンに、ブルーハワイ風のココナッツバニラフォームを重ねました。',
      ar: 'سلاش سبرايت زيرو مع رغوة بلو هاواي بنكهة جوز الهند والفانيلا.',
      zh: '雪碧Zero沙冰搭配藍色夏威夷椰香香草泡沫。'
    },
    price: 80,
    image_url: 'https://image.pollinations.ai/prompt/Icy%20blue%20mocktail%20served%20in%20a%20chilled%20highball,%20tropical%20lighting',
    sort_order: 1,
    is_active: true
  },
  {
    restaurant_id: MAUI_RESTAURANT_ID,
    kind: 'drink',
    category: 'Signature Slush',
    station: 'bar',
    station_label: null,
    name: { en: 'Nalu Hawaiian Rusa', es: 'Nalu Hawaiian Rusa', fr: 'Nalu Hawaiian Rusa', de: 'Nalu Hawaiian Rusa', ja: 'Nalu Hawaiian Rusa', ar: 'Nalu Hawaiian Rusa', zh: 'Nalu Hawaiian Rusa' },
    description: {
      en: 'Squirt Zero slush splashed with orange, pineapple, and chamoy.',
      es: 'Granizado de Squirt Zero con toques de naranja, piña y chamoy.',
      fr: 'Granité de Squirt Zero relevé d\'orange, d\'ananas et d\'un trait de chamoy.',
      de: 'Squirt-Zero-Slush mit Spritzern von Orange, Ananas und Chamoy.',
      ja: 'スクワートゼロのスラッシュにオレンジ、パイナップル、チャモイをアクセント。',
      ar: 'سلاش سكويرت زيرو مع لمسات من البرتقال والأناناس والشموي.',
      zh: 'Squirt Zero沙冰加入橙汁、鳳梨與恰摩伊醬點綴。'
    },
    price: 80,
    image_url: 'https://image.pollinations.ai/prompt/Refreshing%20pink%20slushie%20mocktail%20with%20tamarind%20rim,%20studio%20food%20photo',
    sort_order: 2,
    is_active: true
  },
  {
    restaurant_id: MAUI_RESTAURANT_ID,
    kind: 'drink',
    category: 'Signature Slush',
    station: 'bar',
    station_label: null,
    name: { en: 'Nalu Coco Cola', es: 'Nalu Coco Cola', fr: 'Nalu Coco Cola', de: 'Nalu Coco Cola', ja: 'Nalu Coco Cola', ar: 'Nalu Coco Cola', zh: 'Nalu Coco Cola' },
    description: {
      en: 'Coca Light blended on ice with coconut cream.',
      es: 'Coca Light congelada con un toque de crema de coco.',
      fr: 'Coca Light frappée sur glace avec crème de noix de coco.',
      de: 'Coca Light mit Eis und Kokoscreme aufgeschlagen.',
      ja: 'コカライトを氷とブレンドし、ココナッツクリームを合わせた一杯。',
      ar: 'كوكا لايت مخفوقة مع الثلج وكريمة جوز الهند.',
      zh: '健怡可樂碎冰混合椰奶泡沫。'
    },
    price: 80,
    image_url: 'https://image.pollinations.ai/prompt/Frosty%20cola%20slush%20with%20coconut%20foam,%20moody%20bar%20lighting',
    sort_order: 3,
    is_active: true
  },
  {
    restaurant_id: MAUI_RESTAURANT_ID,
    kind: 'drink',
    category: 'Refrescos',
    station: 'bar',
    station_label: null,
    name: { en: 'Refresco Manzanita Sol', es: 'Refresco Manzanita Sol', fr: 'Refresco Manzanita Sol', de: 'Refresco Manzanita Sol', ja: 'Refresco Manzanita Sol', ar: 'Refresco Manzanita Sol', zh: 'Refresco Manzanita Sol' },
    description: {
      en: 'Classic chilled Manzanita Sol to pair with your hot dog.',
      es: 'Refresco Manzanita Sol bien frío para acompañar tu hot dog.',
      fr: 'Un Manzanita Sol bien frais pour accompagner votre hot-dog.',
      de: 'Klassischer gekühlter Manzanita Sol als Begleiter zu deinem Hotdog.',
      ja: 'ホットドッグにぴったりの、よく冷えたマンザニータ・ソル。',
      ar: 'مشروب مانزانييتا سول كلاسيكي مبرد ليرافق الهوت دوغ الخاص بك.',
      zh: '冰鎮 Manzanita Sol 蘋果汽水，與熱狗是絕配。'
    },
    price: 20,
    image_url: 'https://image.pollinations.ai/prompt/Studio%20shot%20of%20a%20glass%20bottle%20of%20apple%20soda%20with%20condensation',
    sort_order: 4,
    is_active: true
  },
  // Food Items
  {
    restaurant_id: MAUI_RESTAURANT_ID,
    kind: 'food',
    category: 'Antojitos',
    station: 'kitchen',
    station_label: null,
    name: { en: 'Empanadas', es: 'Empanadas', fr: 'Empanadas', de: 'Empanadas', ja: 'Empanadas', ar: 'Empanadas', zh: 'Empanadas' },
    description: {
      en: 'Four assorted empanadas—pollo, deshebrada, and queso—served with garlicky salsa.',
      es: '4 empanadas con guisos surtidos de pollo, deshebrada y queso, acompañadas de salsa de ajo.',
      fr: 'Quatre empanadas assorties (poulet, effiloché, fromage) servies avec salsa à l\'ail.',
      de: 'Vier gemischte Empanadas – Hähnchen, geschmorte Rinderfaser und Käse – mit Knoblauch-Salsa.',
      ja: '鶏肉、ほぐし牛肉、チーズの4種エンパナーダを、ガーリックサルサとともに。',
      ar: 'أربع إمبانادا متنوعة (دجاج، لحم مبشور، جبن) تُقدم مع صلصة بالثوم.',
      zh: '四顆綜合餡餅（雞肉、手撕牛肉、起司）搭配蒜味莎莎醬。'
    },
    price: 230,
    image_url: 'https://image.pollinations.ai/prompt/Golden%20Latin%20empanadas%20with%20garlic%20sauce%20on%20a%20wooden%20board',
    sort_order: 1,
    is_active: true
  },
  {
    restaurant_id: MAUI_RESTAURANT_ID,
    kind: 'food',
    category: 'Antojitos',
    station: 'kitchen',
    station_label: null,
    name: { en: 'Arepas', es: 'Arepas', fr: 'Arepas', de: 'Arepas', ja: 'Arepas', ar: 'Arepas', zh: 'Arepas' },
    description: {
      en: 'Four freshly griddled crunchy corn arepas filled with shredded beef, chicken, and melty cheese.',
      es: '4 arepas de maíz crujiente hechas al momento con guiso de deshebrada, pollo y queso.',
      fr: 'Quatre arepas de maïs croustillantes garnies de bœuf effiloché, de poulet et de fromage fondant.',
      de: 'Vier knusprige Mais-Arepas vom Grill, gefüllt mit Rinderfasern, Hähnchen und schmelzendem Käse.',
      ja: '焼きたてで香ばしいコーンアレパ4枚に、ほぐし牛肉・チキン・とろけるチーズを詰めました。',
      ar: 'أربع أريبا من الذرة المقرمشة محشوة بلحم بقر مبشور ودجاج وجبن ذائب.',
      zh: '現烤香脆玉米阿雷巴餅，填滿手撕牛肉、雞肉與融化起司。'
    },
    price: 230,
    image_url: 'https://image.pollinations.ai/prompt/Crunchy%20Venezuelan%20arepas%20stuffed%20with%20shredded%20meats%20and%20cheese',
    sort_order: 2,
    is_active: true
  },
  {
    restaurant_id: MAUI_RESTAURANT_ID,
    kind: 'food',
    category: 'Para compartir',
    station: 'kitchen',
    station_label: null,
    name: { en: 'Nachos Patacón', es: 'Nachos Patacón', fr: 'Nachos Patacón', de: 'Nachos Patacón', ja: 'Nachos Patacón', ar: 'Nachos Patacón', zh: 'Nachos Patacón' },
    description: {
      en: 'Crispy patacón base loaded with molten queso, beef, pico de gallo, and crema ácida.',
      es: 'Crujientes patacones como base, cubiertos de queso fundido, carne, pico de gallo y crema ácida.',
      fr: 'Base croustillante de patacón garnie de queso fondant, bœuf, pico de gallo et crème acidulée.',
      de: 'Knusprige Patacón-Basis mit geschmolzenem Käse, Rindfleisch, Pico de Gallo und Sauerrahm.',
      ja: 'カリッと揚げたパタコンに、とろけるチーズ、ビーフ、ピコ・デ・ガヨ、サワークリームをたっぷり。',
      ar: 'طبقة مقرمشة من الباتاقون مغطاة بجبن مذاب ولحم بقر وبيكو دي جالو وكريمة حامضة.',
      zh: '酥脆大蕉片鋪滿融化起司、牛肉、墨西哥番茄莎莎與酸奶油。'
    },
    price: 250,
    image_url: 'https://image.pollinations.ai/prompt/Loaded%20patacon%20nachos%20with%20melted%20cheese%20and%20pico%20de%20gallo',
    sort_order: 3,
    is_active: true
  },
  {
    restaurant_id: MAUI_RESTAURANT_ID,
    kind: 'food',
    category: 'Tacos',
    station: 'kitchen',
    station_label: null,
    name: { en: 'Tacos Gobernador', es: 'Tacos Gobernador', fr: 'Tacos Gobernador', de: 'Tacos Gobernador', ja: 'Tacos Gobernador', ar: 'Tacos Gobernador', zh: 'Tacos Gobernador' },
    description: {
      en: 'Sautéed shrimp with peppers tucked into tortillas with a manchego cheese crust.',
      es: 'Camarones frescos salteados con pimientos dentro de tortillas con costra de queso manchego.',
      fr: 'Crevettes sautées aux poivrons glissées dans des tortillas à croûte de fromage manchego.',
      de: 'Gebratene Garnelen mit Paprika in Tortillas mit Manchego-Käsekruste.',
      ja: 'ソテーした海老とピーマンを、マンチェゴチーズの香ばしいコーントルティーヤに包みました。',
      ar: 'روبيان سوتيه مع فلفل داخل تورتيلا بقشرة جبن مانشيغو.',
      zh: '炒蝦與甜椒包入帶有曼徹格乳酪脆皮的玉米餅。'
    },
    price: 195,
    image_url: 'https://image.pollinations.ai/prompt/Gourmet%20shrimp%20gobernador%20tacos%20with%20manchego%20cheese%20crust',
    sort_order: 4,
    is_active: true
  }
];

async function seedMauiMenu() {
  console.log('🌺 Starting Maui menu seeding...');
  console.log(`🍍 Seeding menu for restaurant ID: ${MAUI_RESTAURANT_ID}`);

  try {
    // Insert menu items
    const { data, error } = await supabase
      .from('restaurant_menu_items')
      .insert(mauiMenuItems)
      .select();

    if (error) {
      console.error('❌ Error seeding Maui menu:', error);
      return;
    }

    console.log(`✅ Successfully seeded ${data.length} menu items for Maui!`);

    // Verify the insertion
    const { data: verificationData, error: verificationError } = await supabase
      .from('restaurant_menu_items')
      .select('*')
      .eq('restaurant_id', MAUI_RESTAURANT_ID)
      .eq('is_active', true);

    if (verificationError) {
      console.error('❌ Error verifying Maui menu:', verificationError);
      return;
    }

    console.log(`🔍 Verification: Found ${verificationData.length} active menu items for Maui`);

    // Show a sample of the seeded items
    console.log('📋 Sample of seeded menu items:');
    verificationData.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name.en} (${item.kind}) - $${item.price}`);
    });

    console.log('🎉 Maui menu seeding complete!');

  } catch (error) {
    console.error('❌ Unexpected error during Maui menu seeding:', error);
  }
}

// Run the seeding function
seedMauiMenu();

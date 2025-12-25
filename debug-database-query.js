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

async function debugDatabase() {
  console.log('🔍 Starting database debug...');
  console.log('📊 Connecting to Supabase at:', supabaseUrl);

  try {
    // 1. Query all restaurants
    console.log('\n🏪 Querying all restaurants...');
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*');

    if (restaurantsError) {
      console.error('❌ Error fetching restaurants:', restaurantsError);
      return;
    }

    if (!restaurants || restaurants.length === 0) {
      console.log('⚠️ No restaurants found in database!');
      return;
    }

    console.log(`📋 Found ${restaurants.length} restaurants:`);
    restaurants.forEach((restaurant, index) => {
      console.log(`\n${index + 1}. Restaurant:`, {
        id: restaurant.id,
        slug: restaurant.slug,
        name: restaurant.name,
        address: restaurant.address
      });
    });

    // 2. For each restaurant, query menu items
    console.log('\n🍽️ Querying menu items for each restaurant...');
    for (const restaurant of restaurants) {
      console.log(`\n📝 Checking menu items for ${restaurant.slug || restaurant.id}:`);

      const { data: menuItems, error: menuError } = await supabase
        .from('restaurant_menu_items')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true);

      if (menuError) {
        console.error(`❌ Error fetching menu for ${restaurant.slug}:`, menuError);
        continue;
      }

      if (!menuItems || menuItems.length === 0) {
        console.log(`⚠️ No active menu items found for ${restaurant.slug}`);
        continue;
      }

      console.log(`🍴 Found ${menuItems.length} menu items for ${restaurant.slug}:`);
      menuItems.slice(0, 3).forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.name?.en || item.name} (${item.kind}) - $${item.price}`);
      });
      if (menuItems.length > 3) {
        console.log(`  ... and ${menuItems.length - 3} more items`);
      }
    }

    // 3. Check for Maui specifically
    console.log('\n🔎 Specifically checking for Maui restaurant...');
    const mauiSlugs = ['rest-one-maui', 'Rest-one-maui', 'maui', 'Maui'];
    const mauiUUID = '3b79d61d-7cf9-44f7-b35f-28759b2c311d';

    for (const slug of mauiSlugs) {
      const { data: mauiRestaurant, error: mauiError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single();

      if (mauiRestaurant) {
        console.log(`✅ Found Maui restaurant with slug "${slug}":`, {
          id: mauiRestaurant.id,
          name: mauiRestaurant.name,
          slug: mauiRestaurant.slug
        });

        // Check menu items for this Maui restaurant
        const { data: mauiMenu, error: mauiMenuError } = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', mauiRestaurant.id)
          .eq('is_active', true);

        if (mauiMenu && mauiMenu.length > 0) {
          console.log(`🍹 Found ${mauiMenu.length} menu items for Maui:`);
          mauiMenu.slice(0, 3).forEach((item, idx) => {
            console.log(`  ${idx + 1}. ${item.name?.en || item.name} (${item.kind})`);
          });
        } else {
          console.log('⚠️ No menu items found for Maui restaurant');
        }
        break;
      }
    }

    // Check by UUID as well
    const { data: mauiByUUID, error: mauiUUIDError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', mauiUUID)
      .single();

    if (mauiByUUID) {
      console.log(`✅ Found Maui restaurant by UUID ${mauiUUID}:`, {
        id: mauiByUUID.id,
        slug: mauiByUUID.slug,
        name: mauiByUUID.name
      });
    } else {
      console.log(`❌ No Maui restaurant found with UUID ${mauiUUID}`);
    }

    console.log('\n🎯 Debug complete!');

  } catch (error) {
    console.error('❌ Unexpected error during debug:', error);
  }
}

// Run the debug function
debugDatabase();

import { supabase } from '../lib/supabaseClient';
import type { Restaurant, Table, MenuItem } from '../types';

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching restaurant by slug:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Transform the data to match the Restaurant type
    return {
      id: data.id, // UUID
      slug: data.slug,
      name: typeof data.name === 'object' && data.name?.en ? data.name.en : String(data.name || ''),
      address: data.address,
      hours: data.hours,
      waitTime: data.wait_time,
      distance: data.distance,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error in getRestaurantBySlug:', error);
    return null;
  }
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching restaurant by id:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Transform the data to match the Restaurant type
    return {
      id: data.id, // UUID
      slug: data.slug,
      name: typeof data.name === 'object' && data.name?.en ? data.name.en : String(data.name || ''),
      address: data.address,
      hours: data.hours,
      waitTime: data.wait_time,
      distance: data.distance,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error in getRestaurantById:', error);
    return null;
  }
}

export async function getAllRestaurants(): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all restaurants:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Transform the data to match the Restaurant type
    return data.map((restaurant) => ({
      id: restaurant.id,
      slug: restaurant.slug,
      name: typeof restaurant.name === 'object' && restaurant.name?.en ? restaurant.name.en : String(restaurant.name || ''),
      address: restaurant.address,
      hours: restaurant.hours,
      waitTime: restaurant.wait_time,
      distance: restaurant.distance,
      createdAt: restaurant.created_at,
      updatedAt: restaurant.updated_at,
    }));
  } catch (error) {
    console.error('Error in getAllRestaurants:', error);
    return [];
  }
}

// Helper function to get restaurant by slug or ID (flexible lookup)
export async function getRestaurant(identifier: string): Promise<Restaurant | null> {
  // First try to get by slug
  let restaurant = await getRestaurantBySlug(identifier);

  // If not found, try by ID (for backward compatibility)
  if (!restaurant) {
    restaurant = await getRestaurantById(identifier);
  }

  return restaurant;
}

// Utility function to resolve any restaurant identifier (slug or UUID) to UUID
export async function resolveRestaurantId(identifier: string): Promise<string | null> {
  const restaurant = await getRestaurant(identifier);
  return restaurant ? restaurant.id : null;
}

// Get all tables for a restaurant
export async function getRestaurantTables(restaurantId: string): Promise<Table[]> {
  try {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number', { ascending: true });

    if (error) {
      console.error('Error fetching restaurant tables:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Transform to match Table type
    return data.map((table) => ({
      id: table.id,
      number: table.table_number,
      seats: table.seats,
      location: table.location,
      available: table.available,
      x: table.x,
      y: table.y,
    }));
  } catch (error) {
    console.error('Error in getRestaurantTables:', error);
    return [];
  }
}

// Get all menu items for a restaurant
export async function getRestaurantMenu(restaurantId: string): Promise<{ food: MenuItem[]; drinks: MenuItem[] }> {
  try {
    const { data, error } = await supabase
      .from('restaurant_menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching restaurant menu:', error);
      return { food: [], drinks: [] };
    }

    if (!data) {
      return { food: [], drinks: [] };
    }

    // Transform and categorize menu items
    const food: MenuItem[] = [];
    const drinks: MenuItem[] = [];

    data.forEach((item) => {
      const menuItem: MenuItem = {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image_url || '',
      };

      if (item.kind === 'food') {
        food.push(menuItem);
      } else if (item.kind === 'drink') {
        drinks.push(menuItem);
      }
    });

    return { food, drinks };
  } catch (error) {
    console.error('Error in getRestaurantMenu:', error);
    return { food: [], drinks: [] };
  }
}

// Get complete restaurant with tables and menu
export async function getCompleteRestaurant(identifier: string): Promise<Restaurant | null> {
  try {
    // Get basic restaurant info
    const restaurant = await getRestaurant(identifier);
    if (!restaurant) {
      return null;
    }

    // Get tables and menu in parallel
    const [tables, menu] = await Promise.all([
      getRestaurantTables(restaurant.id),
      getRestaurantMenu(restaurant.id),
    ]);

    // Return complete restaurant data
    return {
      ...restaurant,
      tables,
      menu,
      // Promos would need to be added separately if stored in database
    };
  } catch (error) {
    console.error('Error in getCompleteRestaurant:', error);
    return null;
  }
}

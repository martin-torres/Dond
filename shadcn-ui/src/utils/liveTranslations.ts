import { Language, MenuItem, Restaurant } from '../types';

const translationCache = new Map<string, string>();
const STORAGE_KEY = 'translationCache';

const loadCache = () => {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string>;
      Object.entries(parsed).forEach(([key, value]) => translationCache.set(key, value));
    }
  } catch {
    // ignore cache errors
  }
};

const persistCache = () => {
  if (typeof window === 'undefined') return;
  try {
    const obj: Record<string, string> = {};
    translationCache.forEach((value, key) => {
      obj[key] = value;
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // ignore cache errors
  }
};

const cacheKey = (text: string, sourceLang: Language, targetLang: Language) =>
  `${sourceLang}::${targetLang}::${text}`;

async function translateText(
  text: string,
  targetLang: Language,
  sourceLang: Language = 'es'
): Promise<string> {
  if (!text) return '';
  if (targetLang === sourceLang) return text;

  const key = cacheKey(text, sourceLang, targetLang);
  if (translationCache.size === 0) {
    loadCache();
  }
  if (translationCache.has(key)) {
    return translationCache.get(key) as string;
  }

  const endpoint = (import.meta as unknown).env.VITE_TRANSLATION_ENDPOINT;
  let translated = text;

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        translated = data?.translatedText || text;
      }
    } catch {
      translated = text;
    }
  }

  translationCache.set(key, translated);
  persistCache();
  return translated;
}

async function translateMenuItem(
  item: MenuItem,
  targetLang: Language,
  sourceLang: Language = 'es'
): Promise<MenuItem> {
  const sourceName = item.name[sourceLang] || item.name.en || '';
  const sourceDescription = item.description[sourceLang] || item.description.en || '';

  const [translatedName, translatedDescription] = await Promise.all([
    item.name[targetLang]
      ? item.name[targetLang]
      : translateText(sourceName, targetLang, sourceLang),
    item.description[targetLang]
      ? item.description[targetLang]
      : translateText(sourceDescription, targetLang, sourceLang),
  ]);

  return {
    ...item,
    name: {
      ...item.name,
      [targetLang]: translatedName,
    },
    description: {
      ...item.description,
      [targetLang]: translatedDescription,
    },
  };
}

async function translateMenu(
  menu: Restaurant['menu'],
  targetLang: Language,
  sourceLang: Language = 'es'
): Promise<Restaurant['menu']> {
  const [food, drinks] = await Promise.all([
    Promise.all((menu?.food || []).map((item) => translateMenuItem(item, targetLang, sourceLang))),
    Promise.all((menu?.drinks || []).map((item) => translateMenuItem(item, targetLang, sourceLang))),
  ]);

  return {
    food,
    drinks,
  };
}

export async function translateRestaurantMenu(
  restaurant: Restaurant,
  targetLang: Language,
  sourceLang: Language = 'es'
): Promise<Restaurant> {
  if (!restaurant || targetLang === sourceLang) return restaurant;

  const translatedMenu = await translateMenu(restaurant.menu, targetLang, sourceLang);
  return {
    ...restaurant,
    menu: translatedMenu,
  };
}

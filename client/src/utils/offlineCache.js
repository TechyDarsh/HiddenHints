/**
 * Offline cache utility using localStorage
 * Caches last scanned products for offline access
 */

const CACHE_KEY = 'spis_product_cache';
const HISTORY_KEY = 'spis_scan_history';
const MAX_CACHE = 50;
const MAX_HISTORY = 100;

// Cache a product
export const cacheProduct = (product) => {
  try {
    const cache = getCachedProducts();
    // Update or add
    const idx = cache.findIndex(p => p.code === product.code);
    if (idx >= 0) {
      cache[idx] = { ...product, _cachedAt: new Date().toISOString() };
    } else {
      cache.unshift({ ...product, _cachedAt: new Date().toISOString() });
    }
    // Keep only last MAX_CACHE
    const trimmed = cache.slice(0, MAX_CACHE);
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Cache write failed:', e);
  }
};

// Get all cached products
export const getCachedProducts = () => {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Get a cached product by code
export const getCachedProduct = (code) => {
  const cache = getCachedProducts();
  return cache.find(p => p.code === code) || null;
};

// Add to scan history
export const addToHistory = (product) => {
  try {
    const history = getScanHistory();
    history.unshift({
      code: product.code,
      name: product.name,
      brand: product.brand,
      category: product.category,
      scannedAt: new Date().toISOString()
    });
    const trimmed = history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('History write failed:', e);
  }
};

// Get scan history
export const getScanHistory = () => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Clear cache
export const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(HISTORY_KEY);
};

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SEED_PRODUCTS, STORAGE_KEY, ADMIN_STORAGE_KEY, SOLD_OUT_STORAGE_KEY, DEFAULT_SALE_END } from '../data/products';
import { fetchLiveStoreData } from '../services/backendSync';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('kahf_kreens_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedIds = new Set(parsed.map(p => p.id));
        const merged = parsed.map(p => {
          const seed = SEED_PRODUCTS.find(s => s.id === p.id);
          if (!seed) return p;
          const useImages = (!p.images || p.images.length === 0 || p.images.length < seed.images.length)
            ? seed.images
            : p.images;
          return {
            ...seed,
            ...p,
            images: useImages,
          };
        });
        return [
          ...merged,
          ...SEED_PRODUCTS.filter(p => !savedIds.has(p.id)),
        ];
      }
    } catch {}
    return SEED_PRODUCTS;
  });

  const [saleEndDate, setSaleEndDate] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_STORAGE_KEY) || localStorage.getItem('kahf_kreens_sale_end') || DEFAULT_SALE_END;
    } catch {}
    return DEFAULT_SALE_END;
  });

  const [showSoldOutWhenZero, setShowSoldOutWhenZero] = useState(() => {
    try {
      const saved = localStorage.getItem(SOLD_OUT_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {}
    return true;
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isBackendSynced, setIsBackendSynced] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Fetch live store data from backend on mount
  const refreshFromBackend = useCallback(async () => {
    try {
      setSyncError(null);
      const liveData = await fetchLiveStoreData();
      if (liveData && Array.isArray(liveData.products) && liveData.products.length > 0) {
        // Merge with seed metadata if any field is missing
        const liveProducts = liveData.products.map(p => {
          const seed = SEED_PRODUCTS.find(s => s.id === p.id);
          if (!seed) return p;
          const images = (p.images && p.images.length > 0) ? p.images : seed.images;
          return {
            ...seed,
            ...p,
            images,
          };
        });

        setProducts(liveProducts);
        if (liveData.saleEndDate) {
          setSaleEndDate(liveData.saleEndDate);
        }
        if (typeof liveData.showSoldOutWhenZero === 'boolean') {
          setShowSoldOutWhenZero(liveData.showSoldOutWhenZero);
        }

        setIsBackendSynced(true);
        setLastSyncedAt(new Date());

        // Cache into localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(liveProducts));
          if (liveData.saleEndDate) localStorage.setItem(ADMIN_STORAGE_KEY, liveData.saleEndDate);
          if (typeof liveData.showSoldOutWhenZero === 'boolean') {
            localStorage.setItem(SOLD_OUT_STORAGE_KEY, JSON.stringify(liveData.showSoldOutWhenZero));
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Backend sync failed, using cached/seed catalog:', err);
      setSyncError(err.message);
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  // Persist products whenever they change locally
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch {}
  }, [products]);

  // Persist sale end date
  useEffect(() => {
    try { localStorage.setItem(ADMIN_STORAGE_KEY, saleEndDate); } catch {}
  }, [saleEndDate]);

  // Persist sold out setting
  useEffect(() => {
    try { localStorage.setItem(SOLD_OUT_STORAGE_KEY, JSON.stringify(showSoldOutWhenZero)); } catch {}
  }, [showSoldOutWhenZero]);

  const updateProduct = (id, changes) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
  };

  const updateProducts = (newProducts) => {
    setProducts(newProducts);
  };

  const resetToDefaults = () => {
    setProducts(SEED_PRODUCTS);
    setSaleEndDate(DEFAULT_SALE_END);
    setShowSoldOutWhenZero(true);
  };

  return (
    <ProductContext.Provider value={{
      products,
      updateProduct,
      updateProducts,
      resetToDefaults,
      saleEndDate,
      setSaleEndDate,
      showSoldOutWhenZero,
      setShowSoldOutWhenZero,
      isAdmin,
      setIsAdmin,
      isBackendSynced,
      lastSyncedAt,
      syncError,
      refreshFromBackend,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used inside ProductProvider');
  return ctx;
};

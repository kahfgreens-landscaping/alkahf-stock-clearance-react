import { createContext, useContext, useState, useEffect } from 'react';
import { SEED_PRODUCTS, STORAGE_KEY, ADMIN_STORAGE_KEY, DEFAULT_SALE_END } from '../data/products';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge any new seed products not yet in storage
        const savedIds = new Set(parsed.map(p => p.id));
        const merged = [
          ...parsed,
          ...SEED_PRODUCTS.filter(p => !savedIds.has(p.id)),
        ];
        return merged;
      }
    } catch {}
    return SEED_PRODUCTS;
  });

  const [saleEndDate, setSaleEndDate] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_STORAGE_KEY) || DEFAULT_SALE_END;
    } catch {}
    return DEFAULT_SALE_END;
  });

  const [isAdmin, setIsAdmin] = useState(false);

  // Persist products whenever they change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch {}
  }, [products]);

  // Persist sale end date
  useEffect(() => {
    try { localStorage.setItem(ADMIN_STORAGE_KEY, saleEndDate); } catch {}
  }, [saleEndDate]);

  const updateProduct = (id, changes) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
  };

  const updateProducts = (newProducts) => {
    setProducts(newProducts);
  };

  const resetToDefaults = () => {
    setProducts(SEED_PRODUCTS);
    setSaleEndDate(DEFAULT_SALE_END);
  };

  return (
    <ProductContext.Provider value={{
      products,
      updateProduct,
      updateProducts,
      resetToDefaults,
      saleEndDate,
      setSaleEndDate,
      isAdmin,
      setIsAdmin,
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

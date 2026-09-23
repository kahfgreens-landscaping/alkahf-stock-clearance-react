import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { useProducts } from '../context/ProductContext';

export default function FilterBar({ activeCategory, onCategoryChange, search, onSearch }) {
  const { products } = useProducts();
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const catCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat && p.visible).length;
    return acc;
  }, {});

  const tabs = [{ key: 'all', label: 'All', count: products.filter(p => p.visible).length }, ...CATEGORIES.map(c => ({ key: c, label: c, count: catCounts[c] }))];

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex gap-3 items-center">

          {/* Search box */}
          <div className="relative flex-shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:bg-white transition-all w-48 sm:w-64"
            />
            {search && (
              <button onClick={() => onSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category scrollable pills — desktop */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => onCategoryChange(t.key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  activeCategory === t.key
                    ? 'bg-green-700 text-white border-green-700 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700'
                }`}
              >
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === t.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile filter button */}
          <button
            className="sm:hidden ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:border-green-300"
            onClick={() => setShowMobileFilter(!showMobileFilter)}
          >
            <SlidersHorizontal size={14} />
            Filter
            {activeCategory !== 'all' && <span className="w-2 h-2 bg-green-600 rounded-full" />}
          </button>

          {/* Result count */}
          <div className="hidden lg:block flex-shrink-0 text-xs text-gray-400 ml-auto whitespace-nowrap">
            {products.filter(p => p.visible && (activeCategory === 'all' || p.category === activeCategory)).length} products
          </div>
        </div>

        {/* Mobile filter dropdown */}
        {showMobileFilter && (
          <div className="sm:hidden pt-3 flex flex-wrap gap-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => { onCategoryChange(t.key); setShowMobileFilter(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeCategory === t.key
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {t.label} <span className={`px-1 rounded-full ${activeCategory === t.key ? 'bg-white/20' : 'bg-gray-100'}`}>{t.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

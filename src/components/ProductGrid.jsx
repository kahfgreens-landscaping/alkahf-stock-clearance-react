import { useMemo } from 'react';
import { PackageSearch } from 'lucide-react';
import ProductCard from './ProductCard';
import { useProducts } from '../context/ProductContext';

export default function ProductGrid({ activeCategory, search }) {
  const { products } = useProducts();

  const filtered = useMemo(() => {
    let list = products.filter(p => p.visible);
    if (activeCategory && activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }
    if (search?.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.desc && p.desc.toLowerCase().includes(q)) ||
        (p.color && p.color.toLowerCase().includes(q)) ||
        (p.size && p.size.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, activeCategory, search]);

  // Group by category when showing all
  const grouped = useMemo(() => {
    if (activeCategory !== 'all' && activeCategory) {
      return [{ category: activeCategory, items: filtered }];
    }
    const map = {};
    filtered.forEach(p => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return Object.entries(map).map(([category, items]) => ({ category, items }));
  }, [filtered, activeCategory]);

  if (!filtered.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PackageSearch size={56} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-500">No products found</h3>
        <p className="text-gray-400 text-sm mt-1">Try a different category or search term</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {grouped.map(({ category, items }) => (
        <section key={category}>
          {/* Category header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-green-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-800">{category}</h2>
            <span className="text-sm text-gray-400 font-medium">({items.length})</span>
            <div className="flex-1 h-px bg-gray-100 ml-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

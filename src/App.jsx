import { useState } from 'react';
import { ProductProvider } from './context/ProductContext';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import FilterBar from './components/FilterBar';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setShowAdminDashboard(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowAdminLogin(false);
    setShowAdminDashboard(true);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearch('');
    // Scroll to products
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <ProductProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onAdminClick={handleAdminClick}
        />
        <HeroBanner />

        <div id="products-section">
          <FilterBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            search={search}
            onSearch={setSearch}
          />
          <ProductGrid activeCategory={activeCategory} search={search} />
        </div>

        <Footer />

        {/* Admin modals */}
        {showAdminLogin && (
          <AdminLogin
            onSuccess={handleLoginSuccess}
            onClose={() => setShowAdminLogin(false)}
          />
        )}
        {showAdminDashboard && isAuthenticated && (
          <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
        )}
      </div>
    </ProductProvider>
  );
}

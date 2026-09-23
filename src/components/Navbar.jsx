import { useState } from 'react';
import { Menu, X, ShoppingBag, Lock, Phone, MessageCircle, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { useProducts } from '../context/ProductContext';

const BASE = import.meta.env.BASE_URL;

export default function Navbar({ activeCategory, onCategoryChange, onAdminClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const { products } = useProducts();
  const totalQty = products.filter(p => p.visible).reduce((s, p) => s + p.qty, 0);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo + Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onCategoryChange('all')}>
            <img src={`${BASE}company_logo.png`} alt="KAHF KREENS" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <div className="font-extrabold text-green-800 text-lg leading-tight tracking-tight">KAHF KREENS</div>
              <div className="text-xs text-green-600 font-medium tracking-wider">PLANTING · GROWING · SAVING</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavBtn active={activeCategory === 'all'} onClick={() => onCategoryChange('all')}>All Products</NavBtn>

            {/* Categories dropdown */}
            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors">
                Categories <ChevronDown size={14} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-48 z-50">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { onCategoryChange(cat); setCatOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-colors ${activeCategory === cat ? 'text-green-700 font-semibold bg-green-50' : 'text-gray-700'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <NavBtn onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}>Contact</NavBtn>
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-2">
            {/* Stock badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <ShoppingBag size={14} className="text-green-600" />
              <span className="text-xs font-semibold text-green-700">{totalQty.toLocaleString()} units</span>
            </div>

            {/* WhatsApp */}
            <a
              href="https://wa.me/971588163730?text=Hello%20KAHF%20KREENS%2C%20I%20am%20interested%20in%20your%20Stock%20Clearance%20products."
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#25d366] text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-[#1ebc57] transition-colors shadow-sm"
            >
              <MessageCircle size={14} />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Admin (subtle) */}
            <button
              onClick={onAdminClick}
              className="p-2 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors"
              title="Admin"
            >
              <Lock size={14} />
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          <MobileBtn onClick={() => { onCategoryChange('all'); setMobileOpen(false); }} active={activeCategory === 'all'}>
            🏠 All Products
          </MobileBtn>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 pt-2">Categories</div>
          {CATEGORIES.map(cat => (
            <MobileBtn key={cat} onClick={() => { onCategoryChange(cat); setMobileOpen(false); }} active={activeCategory === cat}>
              {cat}
            </MobileBtn>
          ))}
          <div className="pt-2 flex gap-2">
            <a href="tel:+971588163730" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700">
              <Phone size={16} /> Call Us
            </a>
            <a href="https://wa.me/971588163730" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25d366] rounded-xl text-sm font-bold text-white">
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavBtn({ children, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-green-700 text-white' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'}`}
    >
      {children}
    </button>
  );
}

function MobileBtn({ children, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-green-700 text-white' : 'text-gray-700 hover:bg-green-50'}`}
    >
      {children}
    </button>
  );
}

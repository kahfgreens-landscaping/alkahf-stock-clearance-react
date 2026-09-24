import { Phone, MessageCircle, Tag, Zap, Award } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { useProducts } from '../context/ProductContext';

const BASE = import.meta.env.BASE_URL;

export default function HeroBanner() {
  const { products, saleEndDate } = useProducts();
  const visible = products.filter(p => p.visible);
  const categories = [...new Set(visible.map(p => p.category))].length;

  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div
        className="bg-gradient-to-br from-green-900 via-green-700 to-emerald-800"
        style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, #14532d 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #065f46 0%, transparent 55%)' }}
      >
        {/* Animated dots pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />

        {/* Floating badge */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8">
          <div className="animate-bounce bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg rotate-12 select-none">
            🔥 HOT DEALS!
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col items-center text-center gap-5">

            {/* Sale badge */}
            <div className="flex items-center gap-2 bg-red-500 text-white text-sm font-black px-5 py-2 rounded-full shadow-lg uppercase tracking-widest">
              <Tag size={16} />
              Trading Closing Down Sale
              <Tag size={16} />
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
                KAHF <span className="text-yellow-400">GREENS</span>
              </h1>
              <p className="mt-2 text-emerald-50 text-lg sm:text-xl font-semibold tracking-wide">
                Premium Landscaping & Garden Products
              </p>
              <p className="mt-1 text-emerald-100/90 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Everything must go! Stock clearance at unbeatable prices. Limited quantities — first come, first served.
              </p>
            </div>

            {/* Discount badges */}
            <div className="flex flex-wrap gap-3 justify-center">
              <DiscountBadge icon={<Zap size={16} />} label="50% – 75% OFF" sub="All Items" color="bg-yellow-400 text-yellow-900" />
              <DiscountBadge icon={<Award size={16} />} label="Premium Quality" sub="At Clearance Prices" color="bg-white/20 text-white border border-white/30" />
              <DiscountBadge icon="🌿" label="While Stocks Last" sub="Limited Quantities" color="bg-emerald-500/40 text-white border border-emerald-400/30" />
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 justify-center">
              <Stat num={visible.length} label="Products" />
              <div className="w-px bg-white/20" />
              <Stat num={categories} label="Categories" />
              <div className="w-px bg-white/20" />
              <Stat num="50–75%" label="Price Reduction" />
              <div className="w-px bg-white/20" />
              <Stat num={visible.reduce((s, p) => s + p.qty, 0).toLocaleString()} label="Units Available" />
            </div>

            {/* Countdown */}
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10 w-full max-w-lg">
              <CountdownTimer endDate={saleEndDate} />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <a
                href="https://wa.me/971588163730?text=Hello%20KAHF%20GREENS%2C%20I%20am%20interested%20in%20the%20stock%20clearance%20products!"
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#1ebc57] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle size={20} /> WhatsApp Order
              </a>
              <a
                href="tel:+971588163730"
                className="flex-1 flex items-center justify-center gap-2 bg-white text-green-900 font-extrabold py-3.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 hover:bg-green-50"
              >
                <Phone size={20} /> +971 58 8163730
              </a>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/30 bg-black/30 px-5 py-3 backdrop-blur-sm">
              <span className="text-xs font-bold text-white drop-shadow">✅ Genuine Products</span>
              <span className="text-white/60">·</span>
              <span className="text-xs font-bold text-white drop-shadow">📦 Bulk Pricing Available</span>
              <span className="text-white/60">·</span>
              <span className="text-xs font-bold text-white drop-shadow">🚚 Dubai Based</span>
              <span className="text-white/60">·</span>
              <span className="text-xs font-bold text-white drop-shadow">⚡ Instant WhatsApp Response</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="bg-gray-50 overflow-hidden -mt-px">
        <svg viewBox="0 0 1440 60" className="w-full text-green-800 fill-current block -translate-y-[99%]" aria-hidden="true">
          <path d="M0,60 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,60 Z" />
        </svg>
      </div>
    </div>
  );
}

function Stat({ num, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-extrabold text-yellow-400">{num}</div>
      <div className="text-emerald-50/80 text-xs uppercase tracking-wider">{label}</div>
    </div>
  );
}

function DiscountBadge({ icon, label, sub, color }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${color} shadow`}>
      <span>{icon}</span>
      <div>
        <div className="font-extrabold leading-tight">{label}</div>
        <div className="text-[10px] opacity-80 font-normal">{sub}</div>
      </div>
    </div>
  );
}

import { Phone, MessageCircle, Leaf, Star } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

export default function Footer() {
  return (
    <footer id="contact-section" className="bg-gradient-to-br from-green-900 to-green-800 text-white mt-16">
      {/* Wave top */}
      <div className="overflow-hidden" style={{ marginBottom: '-1px' }}>
        <svg viewBox="0 0 1440 60" className="w-full fill-gray-50 block" style={{ display: 'block' }}>
          <path d="M0,0 C360,60 1080,0 1440,40 L1440,0 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="bg-white rounded-xl p-3 inline-block mb-4 shadow-lg">
              <img src={`${BASE}company_logo.png`} alt="KAHF KREENS" className="h-12 w-auto" />
            </div>
            <h3 className="text-xl font-extrabold mb-1">KAHF KREENS</h3>
            <p className="text-green-200/70 text-sm leading-relaxed">
              Premium landscaping and garden products at unbeatable clearance prices. While stocks last!
            </p>
            <div className="flex items-center gap-1 mt-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
              <span className="text-green-200/60 text-xs ml-1">Trusted by UAE Gardeners</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-green-200 uppercase text-xs tracking-widest mb-4">Get In Touch</h4>
            <div className="space-y-3">
              <a href="https://wa.me/971588163730?text=Hello%20KAHF%20KREENS!" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#25d366] hover:bg-[#1ebc57] px-4 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-md">
                <MessageCircle size={18} />
                WhatsApp Us Now
              </a>
              <a href="tel:+971588163730"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 rounded-xl font-semibold text-sm transition-all">
                <Phone size={18} />
                +971 58 8163730
              </a>
            </div>
          </div>

          {/* Products summary */}
          <div>
            <h4 className="font-bold text-green-200 uppercase text-xs tracking-widest mb-4">What We Offer</h4>
            <ul className="space-y-2 text-sm text-green-200/70">
              {['Decorative Pots & Planters', 'Hanging Baskets (Coir)', 'Nursery Growing Pots', 'Trays & Propagation', 'Decorative Stones', 'Irrigation Supplies', 'Garden Accessories'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <Leaf size={12} className="text-green-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-green-200/40">
          <span>© 2026 KAHF KREENS. All rights reserved.</span>
          <span className="flex items-center gap-1">
            🌿 Dubai, UAE · All prices in AED · While stocks last
          </span>
        </div>
      </div>
    </footer>
  );
}

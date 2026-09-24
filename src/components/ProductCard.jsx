import { MessageCircle, Package, Palette, Ruler, Weight, AlertCircle, Ban } from 'lucide-react';
import ImageCarousel from './ImageCarousel';
import { useProducts } from '../context/ProductContext';

const fmt = (n) => {
  if (n === undefined || n === null) return '—';
  return n < 1
    ? `${(n * 100).toFixed(0)} fils`
    : n.toLocaleString('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: n % 1 === 0 ? 0 : 2 });
};

const savePct = (was, sale) => {
  if (!was || was <= sale) return null;
  return Math.round(((was - sale) / was) * 100);
};

export default function ProductCard({ product }) {
  const { showSoldOutWhenZero } = useProducts();
  const { name, category, desc, size, color, weight, material, qty, salePrice, wasPrice, images } = product;
  const save = savePct(wasPrice, salePrice);
  const isZeroQty = qty === 0 || Number(qty) === 0;
  const isSoldOut = isZeroQty && showSoldOutWhenZero;
  const outOfStock = isZeroQty;

  const waMsg = encodeURIComponent(
    `Hello KAHF GREENS! 🌿\nI'm interested in:\n*${name}*\nSale Price: AED ${salePrice}\n\nPlease advise on availability and bulk pricing.`
  );

  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border flex flex-col overflow-hidden group hover:-translate-y-0.5 ${
      isSoldOut ? 'border-red-200/80 bg-gray-50/50' : 'border-gray-100'
    }`}>

      {/* Image area */}
      <div className="relative p-3 pb-0">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
          {isSoldOut ? (
            <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              SOLD OUT
            </span>
          ) : outOfStock ? (
            <span className="bg-gray-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
              OUT OF STOCK
            </span>
          ) : (
            save && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                SAVE {save}%
              </span>
            )
          )}
          {qty > 0 && qty <= 20 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
              <AlertCircle size={9} /> Only {qty} left
            </span>
          )}
        </div>

        <div className="relative">
          <ImageCarousel images={images} productName={name} />

          {/* Sold out overlay over image */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center pointer-events-none z-10">
              <div className="bg-red-600/95 text-white font-black text-sm tracking-widest uppercase px-4 py-2 rounded-xl shadow-2xl border-2 border-white rotate-[-6deg] flex items-center gap-2">
                <Ban size={16} />
                SOLD OUT
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 pt-3 gap-2">

        {/* Category chip */}
        <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full self-start">
          {category}
        </span>

        {/* Name */}
        <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{name}</h3>

        {/* Description */}
        {desc && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{desc}</p>}

        {/* Specs chips */}
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {size && <Chip icon={<Ruler size={10} />} text={size} />}
          {color && <Chip icon={<Palette size={10} />} text={color} />}
          {weight && <Chip icon={<Weight size={10} />} text={weight} />}
          {material && <Chip icon={<Package size={10} />} text={material} />}
        </div>

        {/* Stock indicator */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className={`w-2 h-2 rounded-full ${isSoldOut ? 'bg-red-600' : outOfStock ? 'bg-gray-400' : qty <= 20 ? 'bg-orange-500' : 'bg-green-500'}`} />
          <span className={`text-xs ${isSoldOut ? 'text-red-600 font-bold uppercase tracking-wider' : 'text-gray-500'}`}>
            {isSoldOut ? 'Sold Out' : outOfStock ? 'Out of stock' : `${qty.toLocaleString()} in stock`}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pricing */}
        <div className={`rounded-xl p-3 border ${
          isSoldOut
            ? 'bg-gray-100 border-gray-200 opacity-75'
            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'
        }`}>
          <div className="flex items-end gap-2 flex-wrap">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block leading-none mb-0.5">Sale Price</span>
              <span className={`text-2xl font-extrabold ${isSoldOut ? 'text-gray-600' : 'text-green-700'}`}>{fmt(salePrice)}</span>
            </div>
            {wasPrice && (
              <div className="mb-0.5">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block leading-none mb-0.5">Was</span>
                <span className="text-sm text-gray-400 line-through">{fmt(wasPrice)}</span>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={outOfStock ? '#' : `https://wa.me/971588163730?text=${waMsg}`}
          target={outOfStock ? undefined : '_blank'}
          rel={outOfStock ? undefined : 'noopener noreferrer'}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            isSoldOut
              ? 'bg-red-50 text-red-500 border border-red-200 cursor-not-allowed select-none'
              : outOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed select-none'
              : 'bg-[#25d366] hover:bg-[#1ebc57] text-white shadow-sm hover:shadow-md active:scale-95'
          }`}
          onClick={e => { if (outOfStock) e.preventDefault(); }}
        >
          {isSoldOut ? (
            <>
              <Ban size={16} className="text-red-500" />
              <span>Sold Out</span>
            </>
          ) : outOfStock ? (
            <>
              <Ban size={16} className="text-gray-400" />
              <span>Out of Stock</span>
            </>
          ) : (
            <>
              <MessageCircle size={16} />
              <span>Order via WhatsApp</span>
            </>
          )}
        </a>
      </div>
    </div>
  );
}

function Chip({ icon, text }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
      {icon} {text}
    </span>
  );
}

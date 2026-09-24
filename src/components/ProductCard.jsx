import { MessageCircle, Package, Palette, Ruler, Weight, AlertCircle } from 'lucide-react';
import ImageCarousel from './ImageCarousel';

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
  const { name, category, desc, size, color, weight, material, qty, salePrice, wasPrice, images } = product;
  const save = savePct(wasPrice, salePrice);
  const outOfStock = qty === 0;

  const waMsg = encodeURIComponent(
    `Hello KAHF GREENS! 🌿\nI'm interested in:\n*${name}*\nSale Price: AED ${salePrice}\n\nPlease advise on availability and bulk pricing.`
  );

  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group hover:-translate-y-0.5 ${outOfStock ? 'opacity-60' : ''}`}>

      {/* Image area */}
      <div className="relative p-3 pb-0">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          {save && !outOfStock && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
              SAVE {save}%
            </span>
          )}
          {outOfStock && (
            <span className="bg-gray-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
              OUT OF STOCK
            </span>
          )}
          {qty > 0 && qty <= 20 && !outOfStock && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
              <AlertCircle size={9} /> Only {qty} left
            </span>
          )}
        </div>

        <ImageCarousel images={images} productName={name} />
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
          <div className={`w-2 h-2 rounded-full ${outOfStock ? 'bg-gray-400' : qty <= 20 ? 'bg-orange-500' : 'bg-green-500'}`} />
          <span className="text-xs text-gray-500">
            {outOfStock ? 'Out of stock' : `${qty.toLocaleString()} in stock`}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pricing */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
          <div className="flex items-end gap-2 flex-wrap">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-semibold block leading-none mb-0.5">Sale Price</span>
              <span className="text-2xl font-extrabold text-green-700">{fmt(salePrice)}</span>
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
          href={`https://wa.me/971588163730?text=${waMsg}`}
          target="_blank" rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            outOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
              : 'bg-[#25d366] hover:bg-[#1ebc57] text-white shadow-sm hover:shadow-md active:scale-95'
          }`}
        >
          <MessageCircle size={16} />
          {outOfStock ? 'Unavailable' : 'Order via WhatsApp'}
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

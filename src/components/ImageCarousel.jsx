import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;
const PLACEHOLDER = `${BASE}company_logo.png`;

export default function ImageCarousel({ images, productName }) {
  const [idx, setIdx] = useState(0);
  const [imgError, setImgError] = useState({});

  const imgs = images?.length ? images : [];

  if (!imgs.length) {
    return (
      <div className="w-full h-52 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl">
        <div className="text-center p-4">
          <img src={PLACEHOLDER} alt="KAHF GREENS" className="h-12 w-auto mx-auto opacity-40 mb-2" />
          <p className="text-gray-400 text-xs">{productName}</p>
        </div>
      </div>
    );
  }

  const validImgs = imgs.filter((_, i) => !imgError[i]);
  if (!validImgs.length) {
    return (
      <div className="w-full h-52 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl">
        <div className="text-center p-4">
          <img src={PLACEHOLDER} alt="KAHF GREENS" className="h-12 w-auto mx-auto opacity-40 mb-2" />
          <p className="text-gray-400 text-xs">Image unavailable</p>
        </div>
      </div>
    );
  }

  const safeIdx = Math.min(idx, validImgs.length - 1);
  const currentSrc = `${BASE}${validImgs[safeIdx]}`;

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + validImgs.length) % validImgs.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % validImgs.length); };

  return (
    <div className="relative group w-full h-52 bg-gray-50 rounded-xl overflow-hidden">
      <img
        src={currentSrc}
        alt={`${productName} ${safeIdx + 1}`}
        className="w-full h-full object-contain transition-all duration-300"
        onError={() => setImgError(e => ({ ...e, [safeIdx]: true }))}
      />

      {validImgs.length > 1 && (
        <>
          {/* Prev / Next */}
          <button onClick={prev} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft size={16} className="text-gray-700" />
          </button>
          <button onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={16} className="text-gray-700" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {validImgs.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === safeIdx ? 'bg-green-600 w-3' : 'bg-white/60'}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-2 right-2 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
            {safeIdx + 1}/{validImgs.length}
          </div>
        </>
      )}
    </div>
  );
}

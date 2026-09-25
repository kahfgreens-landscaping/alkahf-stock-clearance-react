import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;
const PLACEHOLDER = `${BASE}company_logo.png`;

export default function ImageCarousel({ images, productName }) {
  const [idx, setIdx] = useState(0);
  const [imgError, setImgError] = useState({});
  const [isFullView, setIsFullView] = useState(false);

  const imgs = images?.length ? images : [];

  const validImgs = imgs.filter((_, i) => !imgError[i]);

  // Keyboard navigation for full view modal (Esc to close, Left/Right arrows to flip)
  useEffect(() => {
    if (!isFullView) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFullView(false);
      if (validImgs.length > 1) {
        if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + validImgs.length) % validImgs.length);
        if (e.key === 'ArrowRight') setIdx(i => (i + 1) % validImgs.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullView, validImgs.length]);

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

  const prev = (e) => {
    e.stopPropagation();
    setIdx(i => (i - 1 + validImgs.length) % validImgs.length);
  };

  const next = (e) => {
    e.stopPropagation();
    setIdx(i => (i + 1) % validImgs.length);
  };

  return (
    <>
      {/* ── Product Card Image Preview ───────────────── */}
      <div
        onClick={() => setIsFullView(true)}
        className="relative group w-full h-52 bg-gray-50 rounded-xl overflow-hidden cursor-zoom-in"
        title="Click to view image in full"
      >
        <img
          src={currentSrc}
          alt={`${productName} ${safeIdx + 1}`}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(e => ({ ...e, [safeIdx]: true }))}
        />

        {/* Hover zoom hint */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <ZoomIn size={12} /> View Full
          </span>
        </div>

        {validImgs.length > 1 && (
          <>
            {/* Prev / Next Buttons */}
            <button
              onClick={prev}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Previous photo"
            >
              <ChevronLeft size={16} className="text-gray-700" />
            </button>
            <button
              onClick={next}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Next photo"
            >
              <ChevronRight size={16} className="text-gray-700" />
            </button>

            {/* Navigation Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
              {validImgs.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setIdx(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === safeIdx ? 'bg-green-600 w-3' : 'bg-white/60'}`}
                  title={`Go to photo ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Full Image View Lightbox Modal ──────────── */}
      {isFullView && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setIsFullView(false)}
        >
          {/* Top Bar: Title & Close Button */}
          <div
            className="w-full max-w-6xl flex items-center justify-between z-10 pb-2 border-b border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-white font-bold text-sm sm:text-base truncate pr-4">
              <span>{productName}</span>
              {validImgs.length > 1 && (
                <span className="text-xs text-white/50 font-normal ml-2">
                  ({safeIdx + 1} of {validImgs.length})
                </span>
              )}
            </div>

            <button
              onClick={() => setIsFullView(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-lg border border-white/20"
              title="Close full view (Esc)"
            >
              <X size={18} />
              <span>Close</span>
            </button>
          </div>

          {/* Central Fullscreen Image Area */}
          <div
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center my-2"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={currentSrc}
              alt={`${productName} full view`}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl drop-shadow-2xl"
            />

            {/* Prev / Next controls in full view */}
            {validImgs.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full transition-all shadow-xl hover:scale-110 active:scale-95 border border-white/10"
                  title="Previous photo (Left arrow)"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-3 rounded-full transition-all shadow-xl hover:scale-110 active:scale-95 border border-white/10"
                  title="Next photo (Right arrow)"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Bar: Thumbnails / Guidance */}
          <div
            className="w-full max-w-6xl flex items-center justify-center pt-2"
            onClick={e => e.stopPropagation()}
          >
            {validImgs.length > 1 ? (
              <div className="flex items-center justify-center gap-2 max-w-xl overflow-x-auto py-1">
                {validImgs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 bg-black/40 ${
                      i === safeIdx ? 'border-green-500 scale-105 shadow-md' : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                    title={`View photo ${i + 1}`}
                  >
                    <img src={`${BASE}${img}`} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-white/40 text-xs">Click anywhere or press Esc to close</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

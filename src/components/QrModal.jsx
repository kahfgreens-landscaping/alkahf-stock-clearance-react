import { useState } from 'react';
import { X, Download, Copy, Check, QrCode, ExternalLink } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;
const SITE_URL = 'https://kahfgreens-landscaping.github.io/alkahf-stock-clearance-react/';

export default function QrModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center text-center p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mb-3 shadow-inner">
          <QrCode size={26} />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900">Scan QR Code</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-[260px]">
          Scan with your phone's camera to instantly open the <strong>KAHF GREENS</strong> clearance catalog.
        </p>

        {/* QR Code Container */}
        <div className="my-5 p-4 bg-white rounded-2xl border-2 border-green-700/20 shadow-md relative group">
          <img
            src={`${BASE}qr-code.png`}
            alt="KAHF GREENS Stock Clearance QR Code"
            className="w-56 h-56 object-contain rounded-lg"
          />
          <div className="mt-2 text-[11px] font-bold text-green-800 tracking-wider uppercase">
            KAHF GREENS · DUBAI
          </div>
        </div>

        {/* Link box */}
        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex items-center justify-between gap-2 mb-4 text-left">
          <span className="text-[11px] font-mono text-gray-600 truncate">
            {SITE_URL}
          </span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg shadow-2xs transition-all active:scale-95"
            title="Copy URL"
          >
            {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full">
          <a
            href={`${BASE}qr-code.png`}
            download="KAHF-GREENS-CLEARANCE-QR.png"
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Download size={14} /> Download PNG
          </a>
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-3.5 py-3 rounded-xl transition-all"
            title="Open Link"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

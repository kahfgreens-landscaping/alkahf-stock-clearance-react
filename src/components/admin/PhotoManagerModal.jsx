import { useState, useRef } from 'react';
import { X, Plus, Trash2, ArrowLeft, ArrowRight, Upload, Link as LinkIcon, Image as ImageIcon, Check } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

export default function PhotoManagerModal({ product, onClose, onUpdatePhotos }) {
  const [images, setImages] = useState(product?.images || []);
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef(null);

  if (!product) return null;

  const handleAddUrl = (e) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    const updated = [...images, trimmed];
    setImages(updated);
    setUrlInput('');
    onUpdatePhotos(product.id, updated);
    flashSaved();
  };

  const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Failed to process image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadError('');
    try {
      const validFiles = files.filter(f => f.type.startsWith('image/'));
      if (validFiles.length !== files.length) {
        setUploadError('Only image files (JPG, PNG, WebP) are supported.');
      }
      if (!validFiles.length) return;

      const compressedImgs = await Promise.all(
        validFiles.map(file => compressImage(file))
      );

      const updated = [...images, ...compressedImgs];
      setImages(updated);
      onUpdatePhotos(product.id, updated);
      flashSaved();
    } catch {
      setUploadError('Failed to optimize and upload image.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onUpdatePhotos(product.id, updated);
    flashSaved();
  };

  const handleMove = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const item = updated.splice(fromIndex, 1)[0];
    updated.splice(toIndex, 0, item);
    setImages(updated);
    onUpdatePhotos(product.id, updated);
    flashSaved();
  };

  const flashSaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const getImgSrc = (src) => {
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    return `${BASE}${src}`;
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── Header ──────────────────────────────── */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon size={18} className="text-green-700" />
              <h3 className="text-base font-extrabold text-gray-800">Manage Photos</h3>
              {savedSuccess && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <Check size={12} /> Auto-Saved!
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-medium truncate max-w-md">
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ────────────────────────────────── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Current Gallery */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Current Photos ({images.length})
              </span>
              <span className="text-[11px] text-gray-400">
                First photo is used as main card cover
              </span>
            </div>

            {images.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50">
                <ImageIcon size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-500">No photos added yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Upload a photo below or paste an image URL</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="group relative bg-gray-100 rounded-xl overflow-hidden border border-gray-200 aspect-square flex flex-col justify-between">
                    <img
                      src={getImgSrc(img)}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${BASE}company_logo.png`;
                      }}
                    />

                    {/* Top badging */}
                    <div className="absolute top-1.5 left-1.5 flex gap-1 z-10">
                      {i === 0 ? (
                        <span className="bg-green-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                          COVER
                        </span>
                      ) : (
                        <span className="bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow">
                          #{i + 1}
                        </span>
                      )}
                    </div>

                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20">
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(i, i - 1)}
                          className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-800 shadow"
                          title="Move earlier (Make cover)"
                        >
                          <ArrowLeft size={14} />
                        </button>
                      )}
                      {i < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(i, i + 1)}
                          className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-800 shadow"
                          title="Move later"
                        >
                          <ArrowRight size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(i)}
                        className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow"
                        title="Delete photo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Photos Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Add New Photos
            </h4>

            {uploadError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                {uploadError}
              </div>
            )}

            {/* Option 1: Upload from device */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                className="hidden"
                id="photo-file-upload"
              />
              <label
                htmlFor="photo-file-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-green-200 hover:border-green-400 bg-green-50/30 hover:bg-green-50/60 rounded-xl p-4 cursor-pointer transition-all text-center"
              >
                <Upload size={22} className="text-green-600 mb-1" />
                <span className="text-xs font-bold text-green-800">
                  Click to Upload Photos from Computer
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">
                  Supports multiple JPG, PNG, WebP files
                </span>
              </label>
            </div>

            {/* Option 2: Add by path or URL */}
            <form onSubmit={handleAddUrl} className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="Or enter image path (e.g. images/pot.jpg or https://...)"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={!urlInput.trim()}
                className="flex items-center gap-1 bg-gray-800 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                <Plus size={14} /> Add
              </button>
            </form>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────── */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <span className="text-xs text-gray-400">Photos save automatically to browser storage</span>
          <button
            onClick={onClose}
            className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all hover:shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

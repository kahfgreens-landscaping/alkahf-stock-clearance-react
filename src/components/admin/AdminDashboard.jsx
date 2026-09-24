import { useState, useRef } from 'react';
import {
  X, Save, RotateCcw, Download, ChevronUp, ChevronDown,
  ToggleLeft, ToggleRight, Calendar, Package, Tag,
  CheckCircle2, AlertTriangle, Search, Camera, Ban
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { SEED_PRODUCTS } from '../../data/products';
import PhotoManagerModal from './PhotoManagerModal';

export default function AdminDashboard({ onClose }) {
  const {
    products,
    updateProduct,
    updateProducts,
    resetToDefaults,
    saleEndDate,
    setSaleEndDate,
    showSoldOutWhenZero,
    setShowSoldOutWhenZero
  } = useProducts();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState({}); // { productId_field: value }
  const [localSaleEnd, setLocalSaleEnd] = useState(saleEndDate.slice(0, 16)); // datetime-local format
  const [photoManagerProduct, setPhotoManagerProduct] = useState(null);
  const tableRef = useRef(null);

  // ── Helpers ─────────────────────────────────────
  const startEdit = (id, field, currentVal) => {
    setEditing(prev => ({ ...prev, [`${id}_${field}`]: String(currentVal ?? '') }));
  };

  const commitEdit = (id, field, raw) => {
    const numFields = ['salePrice', 'wasPrice', 'qty'];
    let value = numFields.includes(field) ? parseFloat(raw) || 0 : raw;
    if (field === 'qty') value = Math.max(0, Math.floor(Number(raw) || 0));
    updateProduct(id, { [field]: value });
    setEditing(prev => { const n = { ...prev }; delete n[`${id}_${field}`]; return n; });
  };

  const getEditVal = (id, field, fallback) => {
    const key = `${id}_${field}`;
    return key in editing ? editing[key] : String(fallback ?? '');
  };

  // ── Sorting ──────────────────────────────────────
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-green-600" /> : <ChevronDown size={12} className="text-green-600" />;
  };

  // ── Filter + sort ────────────────────────────────
  const displayed = [...products]
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });

  // ── Save ─────────────────────────────────────────
  const handleSave = () => {
    setSaleEndDate(localSaleEnd + ':00');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Reset ────────────────────────────────────────
  const handleReset = () => {
    if (window.confirm('Reset ALL product data and sale date to factory defaults? This cannot be undone.')) {
      resetToDefaults();
      setLocalSaleEnd(SEED_PRODUCTS ? '2026-10-30T23:59' : localSaleEnd);
    }
  };

  // ── CSV Export ───────────────────────────────────
  const handleExport = () => {
    const headers = ['ID', 'Category', 'Name', 'Sale Price', 'Was Price', 'Qty', 'Size', 'Color', 'Visible'];
    const rows = products.map(p => [p.id, p.category, `"${p.name}"`, p.salePrice, p.wasPrice, p.qty, p.size || '', p.color || '', p.visible ? 'Yes' : 'No']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kahf-greens-products.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Summary stats
  const totalQty = products.reduce((s, p) => s + p.qty, 0);
  const visibleCount = products.filter(p => p.visible).length;
  const avgDiscount = products.reduce((s, p) => s + (p.wasPrice > 0 ? ((p.wasPrice - p.salePrice) / p.wasPrice) * 100 : 0), 0) / products.length;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">

        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
              <Package size={20} className="text-green-600" />
              Admin Control Panel
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Changes save to browser storage and update the storefront instantly</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold animate-pulse">
                <CheckCircle2 size={16} /> Saved!
              </span>
            )}
            <button onClick={handleSave} className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all hover:shadow-lg active:scale-95">
              <Save size={15} /> Save All
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-2 rounded-xl transition-all">
              <Download size={15} /> CSV
            </button>
            <button onClick={handleReset} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-3 py-2 rounded-xl transition-all">
              <RotateCcw size={15} /> Reset
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-all ml-1">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Summary Cards ──────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4 flex-shrink-0 border-b border-gray-50">
          <SumCard label="Total Products" val={products.length} color="text-gray-800" />
          <SumCard label="Visible" val={`${visibleCount} / ${products.length}`} color="text-green-700" />
          <SumCard label="Total Stock" val={totalQty.toLocaleString()} color="text-blue-700" />
          <SumCard label="Avg Discount" val={`${avgDiscount.toFixed(0)}%`} color="text-red-600" />
        </div>

        {/* ── Settings Bar: Sale End Date + Zero Quantity Sold Out Toggle ──────────────── */}
        <div className="px-6 py-3 border-b border-gray-100 bg-amber-50/80 flex-shrink-0 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Sale End Date */}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-amber-600" />
              <span className="text-sm font-bold text-amber-900">⏱ Sale End Date:</span>
              <input
                type="datetime-local"
                value={localSaleEnd}
                onChange={e => setLocalSaleEnd(e.target.value)}
                className="px-2.5 py-1 border border-amber-300 bg-white rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
              />
            </div>

            {/* Zero Quantity Sold Out Option */}
            <div className="flex items-center gap-2 border-l border-amber-200/80 pl-4">
              <Ban size={15} className="text-red-500" />
              <span className="text-xs sm:text-sm font-bold text-gray-800">Display Qty 0 as "SOLD OUT":</span>
              <button
                type="button"
                onClick={() => setShowSoldOutWhenZero(!showSoldOutWhenZero)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
                  showSoldOutWhenZero
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title="When enabled, products with quantity 0 show as SOLD OUT on product card"
              >
                {showSoldOutWhenZero ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                <span>{showSoldOutWhenZero ? 'Enabled (Sold Out)' : 'Disabled'}</span>
              </button>
            </div>
          </div>

          <span className="text-[11px] text-amber-800/80 hidden xl:inline font-medium">
            💡 Making quantity 0 on any item will show "SOLD OUT" badge and ribbon on the product card.
          </span>
        </div>

        {/* ── Search + Instructions ───────────────── */}
        <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 w-56"
            />
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <AlertTriangle size={12} className="text-amber-500" />
            Click any cell to edit. Toggle eye icon to show/hide product on storefront.
          </span>
          <span className="text-xs text-gray-400 ml-auto">{displayed.length} of {products.length} products</span>
        </div>

        {/* ── Table ─────────────────────────────── */}
        <div className="overflow-auto flex-1" ref={tableRef}>
          <table className="w-full text-xs border-collapse min-w-[900px]">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200">
                <Th col="id" label="#" sortKey={sortKey} onClick={toggleSort}><SortIcon col="id" /></Th>
                <Th col="visible" label="👁" sortKey={sortKey} onClick={toggleSort} center />
                <th className="px-3 py-2.5 text-center text-gray-500 font-semibold text-[11px] uppercase tracking-wider">Photos</th>
                <Th col="category" label="Category" sortKey={sortKey} onClick={toggleSort}><SortIcon col="category" /></Th>
                <Th col="name" label="Product Name" sortKey={sortKey} onClick={toggleSort} wide><SortIcon col="name" /></Th>
                <Th col="salePrice" label="Sale Price" sortKey={sortKey} onClick={toggleSort}><SortIcon col="salePrice" /></Th>
                <Th col="wasPrice" label="Was Price" sortKey={sortKey} onClick={toggleSort}><SortIcon col="wasPrice" /></Th>
                <Th col="qty" label="Qty" sortKey={sortKey} onClick={toggleSort}><SortIcon col="qty" /></Th>
                <th className="px-3 py-2.5 text-left text-gray-500 font-semibold text-[11px] uppercase tracking-wider">Size</th>
                <th className="px-3 py-2.5 text-left text-gray-500 font-semibold text-[11px] uppercase tracking-wider">Color</th>
                <th className="px-3 py-2.5 text-center text-gray-500 font-semibold text-[11px] uppercase tracking-wider">Disc%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayed.map((p) => {
                const disc = p.wasPrice > 0 ? Math.round(((p.wasPrice - p.salePrice) / p.wasPrice) * 100) : 0;
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-green-50/30 transition-colors ${!p.visible ? 'opacity-40 bg-gray-50/50' : ''}`}
                  >
                    {/* ID */}
                    <td className="px-3 py-2.5 text-gray-400 font-mono">{p.id}</td>

                    {/* Visible toggle */}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() => updateProduct(p.id, { visible: !p.visible })}
                        className={`transition-colors ${p.visible ? 'text-green-600 hover:text-green-700' : 'text-gray-300 hover:text-gray-500'}`}
                        title={p.visible ? 'Hide from storefront' : 'Show on storefront'}
                      >
                        {p.visible ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>

                    {/* Photos */}
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPhotoManagerProduct(p)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                          p.images?.length > 0
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 shadow-xs'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                        }`}
                        title="Click to manage or upload photos for this product"
                      >
                        <Camera size={13} className={p.images?.length > 0 ? 'text-emerald-600' : 'text-amber-500'} />
                        <span>{p.images?.length || 0}</span>
                        <span className="text-[10px] text-green-700 font-black">+</span>
                      </button>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-2.5 text-green-700 font-semibold whitespace-nowrap">{p.category}</td>

                    {/* Name (editable) */}
                    <td className="px-3 py-2.5 max-w-xs">
                      <EditableCell
                        val={getEditVal(p.id, 'name', p.name)}
                        isEditing={`${p.id}_name` in editing}
                        onFocus={() => startEdit(p.id, 'name', p.name)}
                        onChange={v => setEditing(prev => ({ ...prev, [`${p.id}_name`]: v }))}
                        onBlur={v => commitEdit(p.id, 'name', v)}
                        type="text"
                        className="font-medium text-gray-800"
                      />
                    </td>

                    {/* Sale Price */}
                    <td className="px-3 py-2.5">
                      <EditableCell
                        val={getEditVal(p.id, 'salePrice', p.salePrice)}
                        isEditing={`${p.id}_salePrice` in editing}
                        onFocus={() => startEdit(p.id, 'salePrice', p.salePrice)}
                        onChange={v => setEditing(prev => ({ ...prev, [`${p.id}_salePrice`]: v }))}
                        onBlur={v => commitEdit(p.id, 'salePrice', v)}
                        type="number"
                        className="font-extrabold text-green-700"
                        prefix="AED "
                      />
                    </td>

                    {/* Was Price (directly editable) */}
                    <td className="px-3 py-2.5">
                      <EditableCell
                        val={getEditVal(p.id, 'wasPrice', p.wasPrice)}
                        isEditing={`${p.id}_wasPrice` in editing}
                        onFocus={() => startEdit(p.id, 'wasPrice', p.wasPrice)}
                        onChange={v => setEditing(prev => ({ ...prev, [`${p.id}_wasPrice`]: v }))}
                        onBlur={v => commitEdit(p.id, 'wasPrice', v)}
                        type="number"
                        className="text-gray-400 line-through"
                        prefix="AED "
                      />
                    </td>

                    {/* Qty */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <EditableCell
                          val={getEditVal(p.id, 'qty', p.qty)}
                          isEditing={`${p.id}_qty` in editing}
                          onFocus={() => startEdit(p.id, 'qty', p.qty)}
                          onChange={v => setEditing(prev => ({ ...prev, [`${p.id}_qty`]: v }))}
                          onBlur={v => commitEdit(p.id, 'qty', v)}
                          type="number"
                          className={`font-semibold ${p.qty === 0 ? 'text-red-600 font-black' : p.qty <= 20 ? 'text-orange-500' : 'text-gray-700'}`}
                        />
                        {p.qty === 0 ? (
                          <span className="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            SOLD OUT
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateProduct(p.id, { qty: 0 })}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-400 font-semibold whitespace-nowrap transition-colors"
                            title="Mark as Sold Out (Set Qty to 0)"
                          >
                            Set 0
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-3 py-2.5">
                      <EditableCell
                        val={getEditVal(p.id, 'size', p.size || '')}
                        isEditing={`${p.id}_size` in editing}
                        onFocus={() => startEdit(p.id, 'size', p.size || '')}
                        onChange={v => setEditing(prev => ({ ...prev, [`${p.id}_size`]: v }))}
                        onBlur={v => commitEdit(p.id, 'size', v)}
                        type="text"
                        className="text-gray-600"
                      />
                    </td>

                    {/* Color */}
                    <td className="px-3 py-2.5">
                      <EditableCell
                        val={getEditVal(p.id, 'color', p.color || '')}
                        isEditing={`${p.id}_color` in editing}
                        onFocus={() => startEdit(p.id, 'color', p.color || '')}
                        onChange={v => setEditing(prev => ({ ...prev, [`${p.id}_color`]: v }))}
                        onBlur={v => commitEdit(p.id, 'color', v)}
                        type="text"
                        className="text-gray-600"
                      />
                    </td>

                    {/* Disc % */}
                    <td className="px-3 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${disc >= 50 ? 'bg-red-100 text-red-600' : disc > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                        {disc > 0 ? `-${disc}%` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Footer ──────────────────────────────── */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <span className="text-xs text-gray-400">Data stored in browser localStorage · No backend required</span>
          <button onClick={handleSave} className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all hover:shadow-md active:scale-95">
            <Save size={14} /> Save All Changes
          </button>
        </div>
      </div>

      {/* ── Photo Manager Modal ──────────────────────── */}
      {photoManagerProduct && (
        <PhotoManagerModal
          product={products.find(p => p.id === photoManagerProduct.id) || photoManagerProduct}
          onClose={() => setPhotoManagerProduct(null)}
          onUpdatePhotos={(id, newImages) => {
            updateProduct(id, { images: newImages });
          }}
        />
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────

function Th({ col, label, sortKey, onClick, children, center, wide }) {
  return (
    <th
      onClick={() => onClick(col)}
      className={`px-3 py-2.5 text-gray-500 font-semibold text-[11px] uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none ${center ? 'text-center' : 'text-left'} ${wide ? 'min-w-[200px]' : ''}`}
    >
      <div className={`flex items-center gap-1 ${center ? 'justify-center' : ''}`}>
        {label} {children}
      </div>
    </th>
  );
}

function EditableCell({ val, isEditing, onFocus, onChange, onBlur, type, className, prefix }) {
  if (isEditing) {
    return (
      <input
        autoFocus
        type={type}
        value={val}
        onChange={e => onChange(e.target.value)}
        onBlur={e => onBlur(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') onBlur(val); }}
        className={`w-full px-2 py-1 border border-green-400 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300 font-medium text-xs ${className}`}
        min={type === 'number' ? 0 : undefined}
        step={type === 'number' ? 'any' : undefined}
      />
    );
  }
  return (
    <div
      onClick={onFocus}
      title="Click to edit"
      className={`px-2 py-1 rounded-lg cursor-pointer hover:bg-yellow-50 hover:ring-1 hover:ring-yellow-300 transition-all truncate max-w-[180px] text-xs ${className}`}
    >
      {prefix && val !== '' && <span className="opacity-60">{prefix}</span>}
      {val !== '' ? val : <span className="text-gray-300 italic">—</span>}
    </div>
  );
}

function SumCard({ label, val, color }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-extrabold mt-0.5 ${color}`}>{val}</div>
    </div>
  );
}

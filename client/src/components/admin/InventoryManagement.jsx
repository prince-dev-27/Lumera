import React, { useState } from 'react';
import { updateProduct } from '../../services/api';
import Pagination from './Pagination';

export default function InventoryManagement({
  products = [],
  loading = false,
  error = null,
  onRefresh,
}) {
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockVal, setNewStockVal] = useState('');
  const [savingId, setSavingId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Compute Inventory metrics
  const totalStockQty = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const inStockCount = products.filter((p) => (p.stock ?? 0) > 5).length;
  const lowStockCount = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length;
  const outOfStockCount = products.filter((p) => (p.stock ?? 0) <= 0).length;

  // Filter products by inventory status & search term
  const filteredProducts = products.filter((p) => {
    const qty = p.stock ?? 0;
    const term = searchTerm.trim().toLowerCase();
    const catName = typeof p.category === 'object' ? p.category?.name : p.category || '';

    const matchesSearch =
      !term ||
      p.name?.toLowerCase().includes(term) ||
      catName?.toLowerCase().includes(term);

    let matchesFilter = true;
    if (stockFilter === 'in_stock') matchesFilter = qty > 5;
    else if (stockFilter === 'low_stock') matchesFilter = qty > 0 && qty <= 5;
    else if (stockFilter === 'out_of_stock') matchesFilter = qty <= 0;

    return matchesSearch && matchesFilter;
  });

  // Pagination Math
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditStock = (p) => {
    setEditingStockId(p._id);
    setNewStockVal(p.stock ?? 0);
  };

  const cancelEditStock = () => {
    setEditingStockId(null);
    setNewStockVal('');
  };

  const saveStock = async (productId) => {
    setSavingId(productId);
    try {
      await updateProduct(productId, { stock: Number(newStockVal) });
      setEditingStockId(null);
      onRefresh();
    } catch (err) {
      alert(`Failed to update stock: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Quantity */}
        <div
          onClick={() => {
            setStockFilter('all');
            setCurrentPage(1);
          }}
          className={`bg-white p-5 border rounded-xl shadow-xs cursor-pointer transition ${
            stockFilter === 'all' ? 'border-luxury-gold ring-2 ring-amber-100' : 'border-luxury-border hover:border-stone-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-luxury-gray block mb-1">
            Total Inventory Units
          </span>
          <span className="text-2xl font-serif font-bold text-luxury-charcoal">
            {totalStockQty.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-stone-500 block mt-1">Across {products.length} product(s)</span>
        </div>

        {/* In Stock Count */}
        <div
          onClick={() => {
            setStockFilter('in_stock');
            setCurrentPage(1);
          }}
          className={`bg-white p-5 border rounded-xl shadow-xs cursor-pointer transition ${
            stockFilter === 'in_stock' ? 'border-green-500 ring-2 ring-green-100' : 'border-luxury-border hover:border-stone-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-green-700 block mb-1">
            In Stock Items (&gt; 5)
          </span>
          <span className="text-2xl font-serif font-bold text-green-800">{inStockCount}</span>
          <span className="text-[11px] text-green-600 block mt-1">Healthy stock level</span>
        </div>

        {/* Low Stock Count */}
        <div
          onClick={() => {
            setStockFilter('low_stock');
            setCurrentPage(1);
          }}
          className={`bg-white p-5 border rounded-xl shadow-xs cursor-pointer transition ${
            stockFilter === 'low_stock' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-luxury-border hover:border-stone-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 block mb-1">
            Low Stock Items (1–5)
          </span>
          <span className="text-2xl font-serif font-bold text-amber-800">{lowStockCount}</span>
          <span className="text-[11px] text-amber-600 block mt-1">Requires re-ordering</span>
        </div>

        {/* Out of Stock Count */}
        <div
          onClick={() => {
            setStockFilter('out_of_stock');
            setCurrentPage(1);
          }}
          className={`bg-white p-5 border rounded-xl shadow-xs cursor-pointer transition ${
            stockFilter === 'out_of_stock' ? 'border-red-500 ring-2 ring-red-100' : 'border-luxury-border hover:border-stone-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-700 block mb-1">
            Out of Stock (0)
          </span>
          <span className="text-2xl font-serif font-bold text-red-800">{outOfStockCount}</span>
          <span className="text-[11px] text-red-600 block mt-1">Unavailable for purchase</span>
        </div>
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white border border-luxury-border rounded-xl shadow-xs overflow-hidden">
        {/* Controls & Filter Tabs */}
        <div className="p-4 border-b border-luxury-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `All (${products.length})` },
              { id: 'in_stock', label: `In Stock (${inStockCount})` },
              { id: 'low_stock', label: `Low Stock (${lowStockCount})` },
              { id: 'out_of_stock', label: `Out of Stock (${outOfStockCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStockFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                  stockFilter === tab.id
                    ? 'bg-luxury-gold text-luxury-charcoal shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-full lg:max-w-xs">
            <input
              type="text"
              placeholder="Search product or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-luxury-border pl-9 pr-8 py-1.5 text-xs rounded-lg focus:outline-none focus:border-luxury-gold bg-stone-50 focus:bg-white transition-all"
            />
            <svg
              className="w-4 h-4 text-stone-400 absolute left-3 top-2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1.5 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" />
          </div>
        ) : (
          <div>
            {/* Desktop Table View (md and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-luxury-charcoal border-collapse">
                <thead>
                  <tr className="bg-stone-50 uppercase tracking-widest text-[10px] text-stone-500 border-b border-luxury-border">
                    <th className="py-3.5 px-4 font-bold">Product Name</th>
                    <th className="py-3.5 px-4 font-bold">Category</th>
                    <th className="py-3.5 px-4 font-bold">Price</th>
                    <th className="py-3.5 px-4 font-bold">Stock Status</th>
                    <th className="py-3.5 px-4 font-bold">Stock Quantity</th>
                    <th className="py-3.5 px-4 text-right font-bold">Quick Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {currentProducts.map((p) => {
                    const qty = p.stock ?? 0;
                    const catName = typeof p.category === 'object' ? p.category?.name : '—';
                    const isEditingThis = editingStockId === p._id;

                    let statusBadge = (
                      <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        In Stock
                      </span>
                    );
                    if (qty <= 0) {
                      statusBadge = (
                        <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-red-100 text-red-800 border border-red-200">
                          Out of Stock
                        </span>
                      );
                    } else if (qty <= 5) {
                      statusBadge = (
                        <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Low Stock
                        </span>
                      );
                    }

                    return (
                      <tr key={p._id} className="hover:bg-stone-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-luxury-charcoal max-w-xs truncate">{p.name}</td>
                        <td className="py-3.5 px-4 text-stone-600 font-medium">{catName}</td>
                        <td className="py-3.5 px-4 font-bold text-stone-900">₹{p.price?.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4">{statusBadge}</td>

                        <td className="py-3.5 px-4 font-bold">
                          {isEditingThis ? (
                            <input
                              type="number"
                              min="0"
                              value={newStockVal}
                              onChange={(e) => setNewStockVal(e.target.value)}
                              className="w-24 border border-luxury-gold px-2 py-1 text-xs rounded-md focus:outline-none bg-amber-50 text-luxury-charcoal font-bold"
                              autoFocus
                            />
                          ) : (
                            <button
                              onClick={() => startEditStock(p)}
                              className="hover:underline text-luxury-gold font-bold text-xs flex items-center gap-1"
                              title="Click to edit stock"
                            >
                              <span>{qty} units</span>
                              <span className="text-[10px] text-stone-400">✏️</span>
                            </button>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isEditingThis ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => saveStock(p._id)}
                                disabled={savingId === p._id}
                                className="bg-green-600 text-white px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg hover:bg-green-700 transition"
                              >
                                {savingId === p._id ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                onClick={cancelEditStock}
                                className="border border-stone-300 text-stone-600 px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg hover:bg-stone-100 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditStock(p)}
                              className="border border-luxury-border text-stone-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:border-luxury-gold hover:text-luxury-gold transition"
                            >
                              Adjust Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< md) */}
            <div className="md:hidden divide-y divide-stone-100">
              {currentProducts.map((p) => {
                const qty = p.stock ?? 0;
                const catName = typeof p.category === 'object' ? p.category?.name : '—';
                const isEditingThis = editingStockId === p._id;

                let statusBadge = (
                  <span className="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    In Stock
                  </span>
                );
                if (qty <= 0) {
                  statusBadge = (
                    <span className="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-full bg-red-100 text-red-800 border border-red-200">
                      Out of Stock
                    </span>
                  );
                } else if (qty <= 5) {
                  statusBadge = (
                    <span className="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Low Stock
                    </span>
                  );
                }

                return (
                  <div key={p._id} className="p-4 space-y-3 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-luxury-charcoal leading-snug">{p.name}</h4>
                        <p className="text-xs text-stone-500">{catName} • ₹{p.price?.toLocaleString('en-IN')}</p>
                      </div>
                      {statusBadge}
                    </div>

                    <div className="flex items-center justify-between bg-stone-50 p-3 rounded-lg border border-stone-100">
                      <div className="text-xs">
                        <span className="text-stone-500 block text-[10px] uppercase font-bold">Current Stock</span>
                        {isEditingThis ? (
                          <input
                            type="number"
                            min="0"
                            value={newStockVal}
                            onChange={(e) => setNewStockVal(e.target.value)}
                            className="w-20 border border-luxury-gold px-2 py-1 text-xs rounded bg-white text-stone-900 font-bold mt-1"
                            autoFocus
                          />
                        ) : (
                          <span className="font-bold text-stone-900 text-sm">{qty} units</span>
                        )}
                      </div>

                      <div>
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => saveStock(p._id)}
                              disabled={savingId === p._id}
                              className="bg-green-600 text-white px-3 py-1.5 text-xs font-bold uppercase rounded-lg hover:bg-green-700 transition"
                            >
                              {savingId === p._id ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEditStock}
                              className="border border-stone-300 text-stone-600 px-2.5 py-1.5 text-xs font-bold uppercase rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditStock(p)}
                            className="border border-luxury-border bg-white text-luxury-charcoal px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg hover:border-luxury-gold hover:text-luxury-gold transition shadow-xs"
                          >
                            Update Stock
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && !loading && (
              <div className="py-12 text-center text-xs text-stone-500">
                No items match the selected inventory filter or search.
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
}

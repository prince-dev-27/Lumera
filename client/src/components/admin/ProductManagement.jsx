import React, { useState } from 'react';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImagesApi,
  deleteProductImageApi,
} from '../../services/api';
import Pagination from './Pagination';
import CustomDropdown from '../CustomDropdown';

const EMPTY_PRODUCT = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  stock: '',
  category: '',
  isFeatured: false,
  isActive: true,
  images: [],
  attributes: { material: '', plating: '', stoneType: '', size: '' },
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 sm:px-4 py-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-luxury-border w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl rounded-xl overflow-hidden my-auto">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 border-b border-luxury-border bg-stone-50 shrink-0">
          <h3 className="text-xs sm:text-sm font-serif font-bold text-luxury-charcoal uppercase tracking-wider">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-stone-100 transition text-lg leading-none font-bold"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', required, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-widest text-stone-600 font-bold block">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full border border-luxury-border px-3 py-2 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold bg-white rounded-lg transition"
      />
    </div>
  );
}

export default function ProductManagement({
  products = [],
  categories = [],
  loading = false,
  error = null,
  onRefresh,
}) {
  const [productModal, setProductModal] = useState(null); // null | 'add' | 'edit'
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [urlInput, setUrlInput] = useState('');

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('attr_')) {
      const attrKey = name.replace('attr_', '');
      setProductForm((prev) => ({
        ...prev,
        attributes: { ...prev.attributes, [attrKey]: value },
      }));
    } else {
      setProductForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleImageFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setSaveError(null);

    try {
      const res = await uploadProductImagesApi(files);
      if (res.urls && res.urls.length > 0) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, ...res.urls],
        }));
      }
    } catch (err) {
      setSaveError(`Image upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddManualUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, urlInput.trim()],
    }));
    setUrlInput('');
  };

  const handleRemoveImage = async (index, imageUrl) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      try {
        await deleteProductImageApi(imageUrl);
      } catch (err) {
        console.warn('Could not delete from Cloudinary server:', err.message);
      }
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setUrlInput('');
    setSaveError(null);
    setProductModal('add');
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price ?? '',
      discountPrice: p.discountPrice ?? '',
      stock: p.stock ?? '',
      category: p.category?._id || p.category || '',
      isFeatured: p.isFeatured || false,
      isActive: p.isActive !== false,
      images: Array.isArray(p.images) ? [...p.images] : p.images ? [p.images] : [],
      attributes: {
        material: p.attributes?.material || '',
        plating: p.attributes?.plating || '',
        stoneType: p.attributes?.stoneType || '',
        size: p.attributes?.size || '',
      },
    });
    setUrlInput('');
    setSaveError(null);
    setProductModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const priceNum = Number(productForm.price);
    const discNum = productForm.discountPrice ? Number(productForm.discountPrice) : null;
    if (discNum !== null && discNum >= priceNum) {
      setSaveError('Discount price must be strictly less than original price');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...productForm,
        price: priceNum,
        discountPrice: discNum,
        stock: Number(productForm.stock),
        images: productForm.images,
      };

      if (productModal === 'add') {
        await createProduct(payload);
      } else {
        await updateProduct(editingProduct._id, payload);
      }
      setProductModal(null);
      onRefresh();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnable = async (p) => {
    try {
      await updateProduct(p._id, { isActive: !p.isActive });
      onRefresh();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to delete product "${p.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteProduct(p._id);
      onRefresh();
    } catch (err) {
      alert(`Failed to delete product: ${err.message}`);
    }
  };

  // Filtered List
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term);

    const catId = typeof p.category === 'object' ? p.category?._id : p.category;
    const matchesCategory = selectedCategory === 'all' || catId === selectedCategory;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'disabled' && !p.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
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

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 border border-luxury-border rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal">Product Catalogue</h2>
          <p className="text-xs text-stone-500">Manage jewellery products, pricing, categories, and inventory</p>
        </div>
        <button
          onClick={openAdd}
          className="w-full sm:w-auto bg-luxury-gold text-luxury-charcoal px-5 py-2.5 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-[#bd863e] hover:text-white transition shadow-xs whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white p-4 border border-luxury-border rounded-xl shadow-xs flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-luxury-border pl-9 pr-8 py-2 text-xs rounded-lg focus:outline-none focus:border-luxury-gold bg-stone-50 focus:bg-white transition-all"
            />
            <svg
              className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none"
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
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-48">
            <CustomDropdown
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map((c) => ({ value: c._id, label: c.name }))
              ]}
            />
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-44">
            <CustomDropdown
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active Only' },
                { value: 'disabled', label: 'Disabled Only' },
              ]}
            />
          </div>
        </div>

        <span className="text-xs text-stone-500 font-medium self-end lg:self-center">
          Showing {filteredProducts.length} of {products.length} products
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 bg-white border border-luxury-border rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" />
        </div>
      ) : (
        <div className="bg-white border border-luxury-border rounded-xl shadow-xs overflow-hidden">
          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-luxury-charcoal border-collapse">
              <thead>
                <tr className="bg-stone-50 uppercase tracking-widest text-[10px] text-stone-500 border-b border-luxury-border">
                  <th className="py-3.5 px-4 font-bold">Item</th>
                  <th className="py-3.5 px-4 font-bold">Images</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Price</th>
                  <th className="py-3.5 px-4 font-bold">Stock</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentProducts.map((p) => {
                  const catName = typeof p.category === 'object' ? p.category?.name : '—';
                  const mainImg = p.images && p.images[0] ? p.images[0] : null;
                  const imgCount = p.images?.length || 0;

                  return (
                    <tr key={p._id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          {mainImg ? (
                            <img
                              src={mainImg}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-center text-amber-700 font-bold shrink-0 text-[10px]">
                              JEWEL
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-luxury-charcoal block truncate">{p.name}</span>
                            {p.isFeatured && (
                              <span className="inline-block text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 uppercase rounded mt-0.5">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 bg-stone-100 px-2 py-1 rounded text-[11px] text-stone-600 font-mono">
                          📷 {imgCount} {imgCount === 1 ? 'image' : 'images'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 font-semibold">{catName}</td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900">₹{p.price?.toLocaleString('en-IN')}</span>
                        {p.discountPrice && (
                          <span className="text-emerald-700 block text-[11px] font-semibold">
                            Disc: ₹{p.discountPrice?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider inline-block ${
                            p.stock <= 0
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : p.stock <= 5
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {p.stock <= 0 ? 'Out of stock' : `${p.stock} units`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleEnable(p)}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border transition cursor-pointer ${
                            p.isActive
                              ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-300 hover:bg-zinc-200'
                          }`}
                          title="Click to toggle active/disabled status"
                        >
                          {p.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border border-luxury-border text-luxury-charcoal hover:border-luxury-gold hover:text-luxury-gold rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border border-red-200 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
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
              const catName = typeof p.category === 'object' ? p.category?.name : '—';
              const mainImg = p.images && p.images[0] ? p.images[0] : null;

              return (
                <div key={p._id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start gap-3">
                    {mainImg ? (
                      <img
                        src={mainImg}
                        alt={p.name}
                        className="w-14 h-14 object-cover rounded-lg border border-stone-200 shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-center text-amber-700 font-bold shrink-0 text-xs">
                        JEWEL
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-luxury-charcoal leading-snug truncate">{p.name}</h4>
                        <button
                          onClick={() => handleToggleEnable(p)}
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${
                            p.isActive
                              ? 'bg-green-50 text-green-700 border-green-300'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="font-semibold text-stone-700">{catName}</span>
                        <span>•</span>
                        <span>{p.images?.length || 0} images</span>
                        {p.isFeatured && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 uppercase rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Stock Details */}
                  <div className="flex items-center justify-between text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <div>
                      <span className="font-bold text-stone-900 text-sm">₹{p.price?.toLocaleString('en-IN')}</span>
                      {p.discountPrice && (
                        <span className="text-emerald-700 text-[11px] font-semibold ml-2">
                          (Disc: ₹{p.discountPrice?.toLocaleString('en-IN')})
                        </span>
                      )}
                    </div>

                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                        p.stock <= 0
                          ? 'bg-red-100 text-red-700'
                          : p.stock <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {p.stock <= 0 ? 'Out of stock' : `${p.stock} in stock`}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-luxury-border text-luxury-charcoal hover:border-luxury-gold hover:text-luxury-gold rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-red-200 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="py-12 text-center text-xs text-stone-500">
              No products found matching criteria.
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

      {/* Add / Edit Product Modal */}
      {productModal && (
        <Modal
          title={productModal === 'add' ? 'Add New Product' : 'Edit Product'}
          onClose={() => setProductModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <Field label="Product Name" name="name" value={productForm.name} onChange={handleFormChange} required />

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-stone-600 font-bold block">Description *</label>
              <textarea
                name="description"
                value={productForm.description}
                onChange={handleFormChange}
                required
                rows={3}
                className="w-full border border-luxury-border px-3 py-2 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold bg-white rounded-lg resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Regular Price (₹)" name="price" type="number" value={productForm.price} onChange={handleFormChange} required />
              <Field label="Discount Price (₹)" name="discountPrice" type="number" value={productForm.discountPrice} onChange={handleFormChange} placeholder="Optional" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Stock Quantity" name="stock" type="number" value={productForm.stock} onChange={handleFormChange} required />
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-600 font-bold block">Category *</label>
                <CustomDropdown
                  value={productForm.category}
                  onChange={(val) => setProductForm((prev) => ({ ...prev, category: val }))}
                  placeholder="— Select Category —"
                  options={categories.map((c) => ({ value: c._id, label: c.name }))}
                />
              </div>
            </div>

            {/* Product Images Section (Cloudinary Integration) */}
            <div className="border border-stone-200 rounded-lg p-3 sm:p-4 bg-stone-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-700 font-bold flex items-center gap-1.5">
                  <span className="text-luxury-gold text-sm">☁️</span>
                  Product Images (Cloudinary Hosted)
                </label>
                <span className="text-[10px] text-stone-400">
                  {productForm.images.length} image(s) attached
                </span>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-stone-300 hover:border-luxury-gold p-4 rounded-lg bg-white text-center transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  disabled={uploading}
                  id="cloudinary-file-input"
                  className="hidden"
                />
                <label
                  htmlFor="cloudinary-file-input"
                  className="cursor-pointer flex flex-col items-center gap-1 text-xs text-stone-600 hover:text-luxury-gold font-medium"
                >
                  <svg className="w-7 h-7 text-luxury-gold mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{uploading ? 'Uploading to Cloudinary…' : 'Click to select and upload multiple images'}</span>
                  <span className="text-[9px] text-stone-400">Files will be uploaded directly to Cloudinary (URLs saved to MongoDB)</span>
                </label>
              </div>

              {/* Manual URL Input Fallback */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or paste direct image URL (https://...)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 border border-stone-300 px-3 py-1.5 text-xs rounded-lg bg-white focus:outline-none focus:border-luxury-gold"
                />
                <button
                  type="button"
                  onClick={handleAddManualUrl}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-3 py-1.5 text-xs font-bold uppercase rounded-lg transition shrink-0"
                >
                  + Add URL
                </button>
              </div>

              {/* Upload Spinner Status */}
              {uploading && (
                <div className="flex items-center justify-center gap-2 text-xs text-luxury-gold py-2 font-bold bg-amber-50 rounded-lg border border-amber-200">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-luxury-gold border-t-transparent" />
                  <span>Uploading product images securely to Cloudinary...</span>
                </div>
              )}

              {/* Image Previews with Remove Action */}
              {productForm.images.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] text-stone-500 uppercase font-bold tracking-wider block">
                    Image Previews & Gallery (First image is Primary Cover):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto p-2 bg-stone-100 rounded-lg border border-stone-200">
                    {productForm.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-stone-300 bg-white shadow-xs"
                      >
                        <img
                          src={imgUrl}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.opacity = '0.3'; }}
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-luxury-gold text-luxury-charcoal text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shadow">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx, imgUrl)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 group-hover:opacity-100 hover:bg-red-700 transition shadow cursor-pointer"
                          title="Remove Image"
                          aria-label="Remove Image"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Attributes Section */}
            <div className="border-t border-stone-200 pt-3 space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block">
                Product Attributes
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Material" name="attr_material" value={productForm.attributes.material} onChange={handleFormChange} placeholder="e.g. Brass, Alloy" />
                <Field label="Plating" name="attr_plating" value={productForm.attributes.plating} onChange={handleFormChange} placeholder="e.g. 24K Gold" />
                <Field label="Stone Type" name="attr_stoneType" value={productForm.attributes.stoneType} onChange={handleFormChange} placeholder="e.g. CZ, Kundan" />
                <Field label="Size / Dimensions" name="attr_size" value={productForm.attributes.size} onChange={handleFormChange} placeholder="e.g. Adjustable" />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-6 pt-2 border-t border-stone-100">
              <label className="flex items-center gap-2 text-xs text-luxury-charcoal font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={productForm.isFeatured}
                  onChange={handleFormChange}
                  className="accent-luxury-gold w-4 h-4 rounded"
                />
                Mark as Featured
              </label>
              <label className="flex items-center gap-2 text-xs text-luxury-charcoal font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={productForm.isActive}
                  onChange={handleFormChange}
                  className="accent-luxury-gold w-4 h-4 rounded"
                />
                Active (Enabled)
              </label>
            </div>

            {saveError && (
              <p className="text-red-600 text-xs font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">{saveError}</p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setProductModal(null)}
                className="w-full sm:w-1/2 border border-luxury-border text-luxury-charcoal py-2.5 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full sm:w-1/2 bg-luxury-gold text-luxury-charcoal py-2.5 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-[#bd863e] hover:text-white transition disabled:opacity-50 shadow-xs"
              >
                {saving ? 'Saving…' : productModal === 'add' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { createCategory, updateCategory, deleteCategory } from '../../services/api';
import Pagination from './Pagination';

const EMPTY_CATEGORY = { name: '', description: '', image: '', isActive: true };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 sm:px-4 py-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-luxury-border w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl rounded-xl overflow-hidden my-auto">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 border-b border-luxury-border bg-stone-50 shrink-0">
          <h3 className="text-xs sm:text-sm font-serif font-bold text-luxury-charcoal uppercase tracking-wider">{title}</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-red-500 p-1 rounded-lg hover:bg-stone-100 transition text-lg leading-none font-bold"
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

export default function CategoryManagement({
  categories = [],
  loading = false,
  error = null,
  onRefresh,
}) {
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState(EMPTY_CATEGORY);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openAdd = () => {
    setEditingCat(null);
    setForm(EMPTY_CATEGORY);
    setSaveError(null);
    setModal('add');
  };

  const openEdit = (c) => {
    setEditingCat(c);
    setForm({
      name: c.name || '',
      description: c.description || '',
      image: c.image || '',
      isActive: c.isActive !== false,
    });
    setSaveError(null);
    setModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      if (modal === 'add') {
        await createCategory(form);
      } else {
        await updateCategory(editingCat._id, form);
      }
      setModal(null);
      onRefresh();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnable = async (c) => {
    try {
      await updateCategory(c._id, { isActive: !c.isActive });
      onRefresh();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"? This action cannot be undone.`)) return;
    try {
      await deleteCategory(c._id);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter((c) => {
    const term = searchTerm.trim().toLowerCase();
    return (
      !term ||
      c.name?.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term) ||
      c.slug?.toLowerCase().includes(term)
    );
  });

  // Pagination Math
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 border border-luxury-border rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal">Categories List</h2>
          <p className="text-xs text-stone-500">Manage store categories, image icons, slugs, and visibility</p>
        </div>
        <button
          onClick={openAdd}
          className="w-full sm:w-auto bg-luxury-gold text-luxury-charcoal px-5 py-2.5 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-[#bd863e] hover:text-white transition shadow-xs whitespace-nowrap"
        >
          + Add New Category
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 border border-luxury-border rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Filter categories by name..."
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

        <span className="text-xs text-stone-500 font-medium self-end sm:self-center">
          Showing {filteredCategories.length} of {categories.length} categories
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
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Slug</th>
                  <th className="py-3.5 px-4 font-bold">Description</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentCategories.map((c) => (
                  <tr key={c._id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-center text-amber-700 font-bold shrink-0 text-xs">
                            🏷️
                          </div>
                        )}
                        <span className="font-bold text-luxury-charcoal">{c.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-500 font-medium">{c.slug || '—'}</td>

                    <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate font-medium">
                      {c.description || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleEnable(c)}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border transition cursor-pointer ${
                          c.isActive
                            ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                            : 'bg-zinc-100 text-zinc-500 border-zinc-300 hover:bg-zinc-200'
                        }`}
                        title="Click to toggle enable/disable status"
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border border-luxury-border text-luxury-charcoal hover:border-luxury-gold hover:text-luxury-gold rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border border-red-200 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (< md) */}
          <div className="md:hidden divide-y divide-stone-100">
            {currentCategories.map((c) => (
              <div key={c._id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-center text-amber-700 font-bold shrink-0 text-sm">
                        🏷️
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-luxury-charcoal truncate">{c.name}</h4>
                      <p className="text-[11px] font-mono text-stone-500 truncate">/{c.slug}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleEnable(c)}
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${
                      c.isActive
                        ? 'bg-green-50 text-green-700 border-green-300'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>

                {c.description && (
                  <p className="text-xs text-stone-600 line-clamp-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    {c.description}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-stone-100">
                  <button
                    onClick={() => openEdit(c)}
                    className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-luxury-border text-luxury-charcoal hover:border-luxury-gold hover:text-luxury-gold rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-red-200 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && !loading && (
            <div className="py-12 text-center text-xs text-stone-500">
              No categories found. Click "+ Add New Category" to create one.
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

      {/* Add / Edit Category Modal */}
      {modal && (
        <Modal
          title={modal === 'add' ? 'Add New Category' : 'Edit Category'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <Field label="Category Name" name="name" value={form.name} onChange={handleFormChange} required />

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-stone-600 font-bold block">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={3}
                className="w-full border border-luxury-border px-3 py-2 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold bg-white rounded-lg resize-none"
                placeholder="Brief category summary..."
              />
            </div>

            <div className="space-y-2">
              <Field label="Image URL" name="image" value={form.image} onChange={handleFormChange} placeholder="https://..." />
              {form.image && (
                <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg border border-stone-200">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-md border border-stone-300"
                    onError={(e) => { e.target.style.opacity = '0.3'; }}
                  />
                  <span className="text-[10px] text-stone-500">Category image preview</span>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-xs text-luxury-charcoal font-semibold cursor-pointer pt-1">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleFormChange}
                className="accent-luxury-gold w-4 h-4 rounded"
              />
              Active (Enabled)
            </label>

            {saveError && (
              <p className="text-red-600 text-xs font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">{saveError}</p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-full sm:w-1/2 border border-luxury-border text-luxury-charcoal py-2.5 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-1/2 bg-luxury-gold text-luxury-charcoal py-2.5 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-[#bd863e] hover:text-white transition disabled:opacity-50 shadow-xs"
              >
                {saving ? 'Saving…' : modal === 'add' ? 'Create Category' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import Pagination from './Pagination';

export default function CustomerManagement({
  users = [],
  loading = false,
  error = null,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter users based on search & role filter
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u._id?.toLowerCase().includes(term);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Pagination Math
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 border border-luxury-border rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal">
            Registered Customer Accounts
          </h2>
          <p className="text-xs text-stone-500">
            {users.length} total user account(s) registered in Lumera
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="w-full sm:w-auto text-xs text-luxury-gold border border-luxury-gold px-4 py-2 rounded-lg font-bold uppercase tracking-wider hover:bg-amber-50 transition shrink-0 flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh List
        </button>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white p-4 border border-luxury-border rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow">
          {/* Search Box */}
          <div className="relative flex-grow max-w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-stone-50 border border-luxury-border rounded-lg pl-9 pr-8 py-2 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold focus:bg-white transition-all"
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

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap hidden md:inline">
              Role:
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto bg-stone-50 border border-luxury-border rounded-lg px-3 py-2 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold font-medium"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-stone-500 font-medium self-end sm:self-center">
          Showing {filteredUsers.length} of {users.length} accounts
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 bg-white border border-luxury-border rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" />
        </div>
      ) : (
        <div className="bg-white border border-luxury-border rounded-xl shadow-xs overflow-hidden">
          {/* Desktop / Tablet Table View (md and up) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-luxury-charcoal border-collapse">
              <thead>
                <tr className="bg-stone-50 uppercase tracking-widest text-[10px] text-stone-500 border-b border-luxury-border">
                  <th className="py-3.5 px-4 font-bold">User ID</th>
                  <th className="py-3.5 px-4 font-bold">Full Name</th>
                  <th className="py-3.5 px-4 font-bold">Email Address</th>
                  <th className="py-3.5 px-4 font-bold">Role</th>
                  <th className="py-3.5 px-4 font-bold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500 font-medium">
                      {u._id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center uppercase shrink-0 border border-amber-200">
                          {u.name ? u.name.charAt(0) : 'U'}
                        </div>
                        <span className="font-bold text-luxury-charcoal">{u.name || 'Unnamed User'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 uppercase tracking-wider text-[10px] font-bold rounded-full border ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-blue-100 text-blue-900 border-blue-300'
                        }`}
                      >
                        {u.role || 'customer'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 font-medium">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Card List View (< md) */}
          <div className="md:hidden divide-y divide-stone-100">
            {currentUsers.map((u) => (
              <div key={u._id} className="p-4 space-y-2.5 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-bold text-sm flex items-center justify-center uppercase shrink-0 border border-amber-200">
                      {u.name ? u.name.charAt(0) : 'U'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-luxury-charcoal block truncate">
                        {u.name || 'Unnamed User'}
                      </span>
                      <span className="text-xs text-stone-500 block truncate">
                        {u.email}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 uppercase tracking-wider text-[10px] font-bold rounded-full border shrink-0 ${
                      u.role === 'admin'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-blue-100 text-blue-900 border-blue-300'
                    }`}
                  >
                    {u.role || 'customer'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                  <span className="font-mono text-stone-500 truncate max-w-[180px]">ID: {u._id}</span>
                  <span>
                    Joined:{' '}
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && !loading && (
            <div className="py-12 text-center text-xs text-stone-500">
              No user accounts found matching criteria.
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
  );
}

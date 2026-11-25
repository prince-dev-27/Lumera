import React from 'react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  startIndex = 0,
  endIndex = 0,
}) {
  if (totalPages <= 1 && totalItems <= itemsPerPage) return null;

  const actualStart = totalItems === 0 ? 0 : startIndex + 1;
  const actualEnd = Math.min(endIndex, totalItems);

  // Generate array of page numbers with ellipsis if needed
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-white px-4 py-3 border-t border-luxury-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      {/* Item count status */}
      <div className="text-stone-500 font-medium text-center sm:text-left">
        Showing <span className="font-bold text-luxury-charcoal">{actualStart}</span> to{' '}
        <span className="font-bold text-luxury-charcoal">{actualEnd}</span> of{' '}
        <span className="font-bold text-luxury-charcoal">{totalItems}</span> entries
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 rounded border border-stone-200 text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-white font-semibold transition"
          aria-label="Previous Page"
        >
          ‹ Prev
        </button>

        {getPageNumbers().map((page, idx) => (
          <React.Fragment key={idx}>
            {page === '...' ? (
              <span className="px-2 py-1 text-stone-400 font-mono">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`min-w-[32px] h-[32px] rounded border text-xs font-bold transition flex items-center justify-center ${
                  currentPage === page
                    ? 'bg-luxury-gold text-luxury-charcoal border-luxury-gold shadow-xs'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-100 bg-white'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 rounded border border-stone-200 text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-white font-semibold transition"
          aria-label="Next Page"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

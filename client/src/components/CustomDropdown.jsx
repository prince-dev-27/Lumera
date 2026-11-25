import React, { useState, useRef, useEffect } from 'react';

export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  buttonClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation & Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, options, onChange]);

  // Reset highlighted index when opened
  useEffect(() => {
    if (isOpen) {
      const selectedIdx = options.findIndex((opt) => String(opt.value) === String(value));
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    }
  }, [isOpen, options, value]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
        className={`w-full flex items-center justify-between bg-white border border-[#E4E4E7] px-3.5 py-2 text-xs text-[#1A1A1A] transition focus:outline-none focus:border-[#D4AF37] ${
          disabled ? 'opacity-60 cursor-not-allowed bg-stone-50' : 'cursor-pointer hover:border-[#D4AF37]'
        } ${buttonClassName}`}
      >
        <span className={`truncate ${!selectedOption ? 'text-stone-400' : 'font-medium'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-stone-500 transition-transform duration-300 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-[#D4AF37]' : ''
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 mt-1 bg-[#FDFBF7] border border-[#E4E4E7] shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-stone-400 text-center">No options available</div>
          ) : (
            options.map((opt, index) => {
              const isSelected = String(opt.value) === String(value);
              const isHighlighted = index === highlightedIndex;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full text-left px-4 py-2.5 text-xs transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#D4AF37]/15 text-[#1A1A1A] font-semibold border-l-2 border-[#D4AF37]'
                      : isHighlighted
                      ? 'bg-[#D4AF37]/10 text-[#1A1A1A]'
                      : 'text-stone-700 hover:bg-[#D4AF37]/10 hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 ml-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

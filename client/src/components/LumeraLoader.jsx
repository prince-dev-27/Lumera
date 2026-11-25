import React from 'react';

export default function LumeraLoader({
  fullScreen = true,
  text = 'Preparing your experience',
  size = 'md', // 'sm', 'md', 'lg'
}) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  const logoSizes = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-14',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 select-none">
      <div className="relative flex items-center justify-center">
        {/* Luxury Gold Rotating Spinner Ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-luxury-gold/20 border-t-luxury-gold motion-safe:animate-spin transition-all duration-700`}
          style={{ animationDuration: '1.8s' }}
        />
        {/* Centered Brand Text / Initials */}
        <div className="absolute inset-0 flex items-center justify-center p-1">
          <span className="text-[10px] sm:text-xs font-serif font-bold text-luxury-charcoal tracking-widest text-center">
            I J
          </span>
        </div>
      </div>

      {text && (
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-[0.25em] font-serif text-luxury-charcoal/90 font-medium animate-pulse">
            {text}
          </p>
          <div className="w-12 h-[1px] bg-luxury-gold/50 mx-auto mt-2" />
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center bg-[#FDFBF7]">
      {content}
    </div>
  );
}

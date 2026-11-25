import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-8">
      <div className="space-y-2">
        <span className="text-8xl font-serif text-luxury-gold/30 font-bold block">404</span>
        <h1 className="text-2xl font-serif text-luxury-charcoal">Page Not Found</h1>
        <div className="h-0.5 w-12 bg-luxury-gold mx-auto" />
        <p className="text-xs text-luxury-gray font-light leading-relaxed max-w-sm mx-auto">
          The page you are looking for might have been moved, renamed, or does not exist.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/"
          className="bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold transition"
        >
          Return Home
        </Link>
        <Link
          to="/shop"
          className="border border-luxury-border text-luxury-charcoal hover:border-luxury-gold hover:text-luxury-gold px-8 py-3 text-xs uppercase tracking-widest font-semibold transition"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
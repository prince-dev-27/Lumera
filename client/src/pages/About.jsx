import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs text-luxury-gold uppercase tracking-widest font-bold">Our Heritage</span>
        <h1 className="text-4xl font-serif text-luxury-charcoal">The House of Lumera</h1>
        <div className="h-0.5 w-16 bg-luxury-gold mx-auto mt-2"></div>
      </div>

      <div className="aspect-[16/9] sm:aspect-[21/9] bg-zinc-100 overflow-hidden border border-luxury-border">
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&auto=format&fit=crop&q=80"
          alt="Fine jewelry crafting tools"
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="space-y-6 text-sm text-luxury-charcoal font-light leading-relaxed">
        <p>
          Founded on the principle of affordable luxury, <strong>Lumera</strong> bridges the gap between classic artisanal jewelry making and modern lifestyle designs. We curate exquisite necklaces, rings, and sets plated in micron gold, antiques, and premium rhodium coatings.
        </p>
        <p>
          Our designers collaborate with local master jewelers to reproduce regal Mughal, South Indian temple, and modern cocktail solitaire concepts. Each piece is crafted using nickel-free alloy metals, making them anti-allergic and safe for regular wear.
        </p>
        <p>
          We commit to visual and material excellence, ensuring that our synthetic emeralds, Kempu rubies, and AAA-grade American Diamonds sparkle with unparalleled luxury.
        </p>
      </div>

      <div className="text-center pt-8">
        <Link to="/shop" className="bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition duration-300">
          Explore the Vault
        </Link>
      </div>
    </div>
  );
}

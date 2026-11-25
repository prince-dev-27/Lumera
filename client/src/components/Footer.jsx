import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-luxury-charcoal text-[#FDFBF7] pt-16 pb-8 border-t border-luxury-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-luxury-gold/10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif tracking-widest text-[#FDFBF7]">L U M E R A</h3>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Crafting premium, luxurious imitation jewellery for every occasion. Bringing affordable elegance to your daily life and special milestones.
            </p>
          </div>

          {/* Collections Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-luxury-gold font-semibold">Collections</h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-light">
              <li><Link to="/shop" className="hover:text-luxury-gold transition duration-300">Necklaces</Link></li>
              <li><Link to="/shop" className="hover:text-luxury-gold transition duration-300">Earrings</Link></li>
              <li><Link to="/shop" className="hover:text-luxury-gold transition duration-300">Rings</Link></li>
              <li><Link to="/shop" className="hover:text-luxury-gold transition duration-300">Bangles & Kadas</Link></li>
              <li><Link to="/shop" className="hover:text-luxury-gold transition duration-300">Jewellery Sets</Link></li>
            </ul>
          </div>

          {/* Customer Service Links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-luxury-gold font-semibold">Information</h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-light">
              <li><Link to="/about" className="hover:text-luxury-gold transition duration-300">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-luxury-gold transition duration-300">Contact & Support</Link></li>
              <li><a href="#" className="hover:text-luxury-gold transition duration-300">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition duration-300">Care Guide</a></li>
              <li><a href="#" className="hover:text-luxury-gold transition duration-300">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-luxury-gold font-semibold">Newsletter</h4>
            <p className="text-xs text-zinc-400 font-light">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            {subscribed ? (
              <p className="text-xs text-luxury-gold font-medium">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-transparent border border-zinc-700 px-3 py-2 text-xs text-[#FDFBF7] focus:outline-none focus:border-luxury-gold w-full"
                />
                <button
                  type="submit"
                  className="bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] px-4 py-2 text-xs uppercase tracking-widest font-semibold transition duration-300"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-light">
          <p>© {new Date().getFullYear()} Lumera Imitation Jewellery. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-luxury-gold">Instagram</a>
            <a href="#" className="hover:text-luxury-gold">Facebook</a>
            <a href="#" className="hover:text-luxury-gold">Pinterest</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

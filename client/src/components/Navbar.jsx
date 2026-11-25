import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import NavbarProfileDropdown from './NavbarProfileDropdown';

export default function Navbar() {
  const { cartCount, wishlist, searchQuery, setSearchQuery } = useContext(ShopContext);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchOpen(false);
    setMenuOpen(false);
    navigate('/shop');
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E4E4E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">

          {/* Mobile & Tablet Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-luxury-charcoal focus:outline-none shrink-0 hover:text-luxury-gold transition"
            aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={menuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Brand Name */}
          <div className="flex-1 flex justify-center lg:justify-start min-w-0">
            <Link
              to="/"
              className="flex items-center group py-1 min-w-0"
              aria-label="Lumera Jewellery Homepage"
            >
              <span className="text-sm sm:text-lg lg:text-2xl font-serif tracking-widest text-luxury-charcoal group-hover:text-luxury-gold transition font-normal truncate min-w-0">
                L U M E R A
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-10 shrink-0">
            <Link to="/" className="text-xs uppercase tracking-widest font-medium text-luxury-charcoal/80 hover:text-luxury-gold transition duration-300 whitespace-nowrap">Home</Link>
            <Link to="/shop" className="text-xs uppercase tracking-widest font-medium text-luxury-charcoal/80 hover:text-luxury-gold transition duration-300 whitespace-nowrap">Shop</Link>
            <Link to="/categories" className="text-xs uppercase tracking-widest font-medium text-luxury-charcoal/80 hover:text-luxury-gold transition duration-300 whitespace-nowrap">Collections</Link>
            <Link to="/about" className="text-xs uppercase tracking-widest font-medium text-luxury-charcoal/80 hover:text-luxury-gold transition duration-300 whitespace-nowrap">Our Story</Link>
            <Link to="/contact" className="text-xs uppercase tracking-widest font-medium text-luxury-charcoal/80 hover:text-luxury-gold transition duration-300 whitespace-nowrap">Contact</Link>
          </nav>

          {/* Utility Icons */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">

            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-luxury-charcoal hover:text-luxury-gold transition duration-300"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-luxury-charcoal hover:text-luxury-gold transition duration-300 relative"
              aria-label="Wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-luxury-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {wishlist.length > 9 ? '9+' : wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-luxury-charcoal hover:text-luxury-gold transition duration-300 relative"
              aria-label="Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-luxury-charcoal text-luxury-gold text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-luxury-gold leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Desktop Auth Dropdown / Login */}
            {isAuthenticated ? (
              <div className="hidden lg:block pl-1">
                <NavbarProfileDropdown />
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:inline-block p-2 text-luxury-charcoal hover:text-luxury-gold transition duration-300"
                aria-label="Account Login"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Search Bar */}
      {searchOpen && (
        <div className="bg-[#FDFBF7] border-t border-[#E4E4E7] py-3 transition-all duration-300">
          <div className="max-w-3xl mx-auto px-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search necklaces, rings, earrings..."
                className="w-full bg-white border border-[#E4E4E7] py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:border-luxury-gold transition"
              />
              <button
                type="submit"
                className="absolute right-3 p-1.5 text-luxury-charcoal hover:text-luxury-gold"
                aria-label="Submit search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile & Tablet Drawer Navigation */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 top-0 z-40 bg-black/40"
            style={{ top: searchOpen ? '112px' : '64px' }}
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer */}
          <div
            className="lg:hidden fixed left-0 right-0 z-50 bg-[#FDFBF7] border-t border-[#E4E4E7] overflow-y-auto"
            style={{
              top: searchOpen ? '112px' : '64px',
              maxHeight: 'calc(100dvh - 64px)',
            }}
          >
            <nav className="px-6 py-6 flex flex-col space-y-1">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/categories', label: 'Collections' },
                { to: '/about', label: 'Our Story' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-base uppercase tracking-widest font-medium text-luxury-charcoal hover:text-luxury-gold border-b border-luxury-border/40 transition"
                >
                  {label}
                </Link>
              ))}

              <div className="pt-4 mt-2 border-t border-luxury-border space-y-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 text-base uppercase tracking-widest font-medium text-luxury-charcoal hover:text-luxury-gold border-b border-luxury-border/40 transition"
                    >
                      Profile ({user?.name?.split(' ')[0]})
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 text-base uppercase tracking-widest font-medium text-luxury-charcoal hover:text-luxury-gold border-b border-luxury-border/40 transition"
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block py-3 text-base uppercase tracking-widest font-bold text-amber-700 hover:text-amber-900 border-b border-luxury-border/40 transition"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left py-3 text-base uppercase tracking-widest font-medium text-red-600 hover:text-red-800 transition"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-base uppercase tracking-widest font-medium text-luxury-charcoal hover:text-luxury-gold transition"
                  >
                    Account / Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

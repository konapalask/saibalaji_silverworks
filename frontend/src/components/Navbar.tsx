import React, { useState } from 'react';
import { Link as RouterLink, useNavigate as useNav } from 'react-router-dom';
import { ShoppingBag, Heart, User as UserIcon, Search, Menu, X, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useWholesale } from '../context/WholesaleContext';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount, cartType, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { wholesaleCount } = useWholesale();
  const navigate = useNav();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop/retail?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-[#1A1918] text-[#FAF9F5] text-xs py-2 px-4 border-b border-[#C5A059]/30 tracking-wider">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left font-sans">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>NABL Hallmarked 925 Sterling & 999 Pure Silver Direct from Manufacturers</span>
          </div>
          <div className="flex items-center gap-4 text-[#C5A059]">
            <a href="tel:+919876543210" className="hover:underline">+91 98765 43210</a>
            <span>•</span>
            <RouterLink to="/contact" className="hover:underline">Hyderabad Factory Showroom</RouterLink>
          </div>
        </div>
      </div>

      {/* Primary Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E6E1DA] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#1A1918] hover:text-[#C5A059]"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <RouterLink to="/" className="flex flex-col items-center lg:items-start group">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-widest text-[#1A1918] group-hover:text-[#C5A059] transition-colors">
              SAI BALAJI
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-sans font-semibold -mt-1">
              SILVERWORKS
            </span>
          </RouterLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-widest font-semibold font-sans">
            <RouterLink to="/home" className="text-[#1A1918] hover:text-[#C5A059] transition-colors py-1">
              Home
            </RouterLink>
            <RouterLink to="/about" className="text-[#1A1918] hover:text-[#C5A059] transition-colors py-1">
              About Us
            </RouterLink>
            <RouterLink to="/category/silver-pooja-articles" className="text-[#1A1918] hover:text-[#C5A059] transition-colors py-1">
              Pooja Articles & Categories
            </RouterLink>
            
            {/* Wholesale Highlight Pill */}
            <RouterLink 
              to="/shop/wholesale" 
              className="relative px-3.5 py-1.5 rounded-full border border-[#C5A059] text-[#1A1918] hover:bg-[#C5A059] hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#C5A059] group-hover:text-white" />
              <span>B2B Wholesale</span>
              {wholesaleCount > 0 && (
                <span className="bg-[#1A1918] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wholesaleCount}
                </span>
              )}
            </RouterLink>

            <RouterLink to="/contact" className="text-[#1A1918] hover:text-[#C5A059] transition-colors py-1">
              Contact Us
            </RouterLink>
          </nav>

          {/* User Action Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Search Trigger */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#1A1918] hover:text-[#C5A059] transition-colors"
              title="Search Products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <RouterLink 
              to="/account/wishlist" 
              className="relative p-2 text-[#1A1918] hover:text-[#C5A059] transition-colors hidden sm:block"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#C5A059] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </RouterLink>

            {/* User Account / Admin */}
            {user ? (
              <div className="relative group">
                <RouterLink 
                  to={isAdmin ? "/admin" : "/account"} 
                  className="flex items-center gap-1.5 p-2 text-[#1A1918] hover:text-[#C5A059] transition-colors"
                >
                  <UserIcon className="w-5 h-5 text-[#C5A059]" />
                  <span className="hidden xl:inline text-xs font-semibold uppercase tracking-wider">{user.full_name.split(' ')[0]}</span>
                </RouterLink>
                <div className="absolute right-0 top-full hidden group-hover:block w-48 bg-white border border-[#E6E1DA] shadow-xl rounded-md py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#E6E1DA]">
                    <p className="text-xs font-bold text-[#1A1918]">{user.full_name}</p>
                    <p className="text-[10px] text-gray-500">{user.email}</p>
                  </div>
                  {isAdmin ? (
                    <RouterLink to="/admin" className="block px-4 py-2 text-xs text-[#1A1918] hover:bg-[#FAF9F5]">
                      Admin Dashboard
                    </RouterLink>
                  ) : (
                    <RouterLink to="/account" className="block px-4 py-2 text-xs text-[#1A1918] hover:bg-[#FAF9F5]">
                      My Account & Orders
                    </RouterLink>
                  )}
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <RouterLink 
                to="/account/login" 
                className="p-2 text-[#1A1918] hover:text-[#C5A059] transition-colors"
                title="Login / Register"
              >
                <UserIcon className="w-5 h-5" />
              </RouterLink>
            )}

            {/* Unified Cart Button with Dynamic Mode Pill */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative px-3 py-2 bg-[#1A1918] text-[#FAF9F5] rounded-full hover:bg-[#C5A059] transition-all flex items-center gap-1.5 shadow-md"
              title={`Shopping Cart (${cartType} Mode)`}
            >
              <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline text-gray-200">
                {cartType}
              </span>
              {cartCount > 0 && (
                <span className="bg-[#C5A059] text-[#1A1918] font-bold text-[10px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border border-[#FAF9F5]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-[#FAF9F5] border border-[#C5A059] rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative">
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="font-serif text-2xl text-[#1A1918] mb-4">Search Silver Collections</h3>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Lakshmi idols, 925 silver diyas, silver chains..."
                className="flex-1 bg-white border border-[#E6E1DA] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C5A059]"
                autoFocus
              />
              <button 
                type="submit"
                className="bg-[#1A1918] text-white px-6 py-3 rounded-lg text-xs tracking-widest font-semibold uppercase hover:bg-[#C5A059] transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#FAF9F5] pt-24 px-6 flex flex-col justify-between pb-8">
          <nav className="flex flex-col space-y-6 text-sm uppercase tracking-widest font-semibold">
            <RouterLink 
              to="/home" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="border-b border-[#E6E1DA] pb-3"
            >
              Home
            </RouterLink>
            <RouterLink 
              to="/about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="border-b border-[#E6E1DA] pb-3"
            >
              About Us
            </RouterLink>
            <RouterLink 
              to="/shop/retail" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="border-b border-[#E6E1DA] pb-3"
            >
              Retail Collection
            </RouterLink>
            <RouterLink 
              to="/shop/wholesale" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="border-b border-[#E6E1DA] pb-3 text-[#C5A059] flex items-center justify-between"
            >
              <span>B2B Wholesale Catalogue</span>
              <span className="text-xs bg-[#C5A059] text-white px-2 py-0.5 rounded">Bulk</span>
            </RouterLink>
            <RouterLink 
              to="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="border-b border-[#E6E1DA] pb-3"
            >
              Contact Us
            </RouterLink>
          </nav>

          <div className="space-y-4">
            {user ? (
              <RouterLink 
                to={isAdmin ? "/admin" : "/account"} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center bg-[#1A1918] text-[#FAF9F5] py-3 rounded-lg text-xs uppercase tracking-widest font-semibold block"
              >
                {isAdmin ? 'Admin Dashboard' : 'My Account'}
              </RouterLink>
            ) : (
              <RouterLink 
                to="/account/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center bg-[#1A1918] text-[#FAF9F5] py-3 rounded-lg text-xs uppercase tracking-widest font-semibold block"
              >
                Login / Register
              </RouterLink>
            )}
          </div>
        </div>
      )}
    </>
  );
};

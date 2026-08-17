import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate as useNav, useLocation } from 'react-router-dom';
import { Search, Heart, User as UserIcon, ShoppingBag, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { totalQuantity, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const navigate = useNav();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop/retail?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => {
    if (path === '/' || path === '/home') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Primary Desktop & Mobile Header (88px Optical Baseline Height) */}
      <header
        className={`sticky top-0 z-40 h-[88px] transition-all duration-400 flex items-center ${isScrolled
          ? 'bg-[#090909]/95 backdrop-blur-[18px] border-b border-white/12 shadow-2xl'
          : 'bg-gradient-to-b from-[#090909]/90 to-transparent backdrop-blur-sm'
          }`}
      >
        <div className="max-w-[1450px] mx-auto w-full px-6 lg:px-10 flex items-center justify-between">

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#A8A8A8] hover:text-[#F2F2F0] transition-colors"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* LEFT ZONE: Brand Lockup with White Logo Background */}
          <RouterLink to="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-[#C7C7C7]/40">
              <img
                src="/logo.PNG"
                alt="Sai Balaji Silverworks Logo"
                className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-serif text-xl sm:text-[22px] font-normal tracking-[0.18em] text-[#F2F2F0] group-hover:text-white transition-colors leading-tight">
                SAI BALAJI
              </span>
              <span className="text-[9px] uppercase tracking-[0.35em] text-[#C7C7C7] font-semibold font-sans mt-0.5">
                SILVERWORKS
              </span>
              <span className="text-[8px] uppercase tracking-[0.2em] text-[#A8A8A8] font-sans hidden sm:block">
                EST. 1998 • TENALI
              </span>
            </div>
          </RouterLink>

          {/* CENTER ZONE: Clean Editorial Navigation Links (NO PILL BUTTONS) */}
          <nav className="hidden lg:flex items-center space-x-9 text-[13px] uppercase tracking-[0.12em] font-medium text-[#A8A8A8]">
            <RouterLink
              to="/home"
              className={`transition-colors py-1 relative group ${isActive('/home') ? 'text-[#F2F2F0]' : 'hover:text-[#F2F2F0]'}`}
            >
              HOME
              <span className={`absolute bottom-0 left-0 h-[1px] bg-[#C7C7C7] transition-all duration-300 ${isActive('/home') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </RouterLink>

            <RouterLink
              to="/about"
              className={`transition-colors py-1 relative group ${isActive('/about') ? 'text-[#F2F2F0]' : 'hover:text-[#F2F2F0]'}`}
            >
              OUR STORY
              <span className={`absolute bottom-0 left-0 h-[1px] bg-[#C7C7C7] transition-all duration-300 ${isActive('/about') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </RouterLink>

            <RouterLink
              to="/shop/retail"
              className={`transition-colors py-1 relative group ${isActive('/shop/retail') ? 'text-[#F2F2F0]' : 'hover:text-[#F2F2F0]'}`}
            >
              COLLECTIONS
              <span className={`absolute bottom-0 left-0 h-[1px] bg-[#C7C7C7] transition-all duration-300 ${isActive('/shop/retail') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </RouterLink>

            <a
              href="/home#craftsmanship"
              className="hover:text-[#F2F2F0] transition-colors py-1 relative group"
            >
              CRAFTSMANSHIP
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C7C7C7] transition-all duration-300 group-hover:w-full" />
            </a>

            <RouterLink
              to="/shop/wholesale"
              className={`transition-colors py-1 relative group ${isActive('/shop/wholesale') ? 'text-[#F2F2F0]' : 'hover:text-[#F2F2F0]'}`}
            >
              WHOLESALE
              <span className={`absolute bottom-0 left-0 h-[1px] bg-[#C7C7C7] transition-all duration-300 ${isActive('/shop/wholesale') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </RouterLink>

            <RouterLink
              to="/contact"
              className={`transition-colors py-1 relative group ${isActive('/contact') ? 'text-[#F2F2F0]' : 'hover:text-[#F2F2F0]'}`}
            >
              CONTACT
              <span className={`absolute bottom-0 left-0 h-[1px] bg-[#C7C7C7] transition-all duration-300 ${isActive('/contact') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </RouterLink>
          </nav>

          {/* RIGHT ZONE: Minimal Utility Actions (20px Line Icons) */}
          <div className="flex items-center space-x-6 text-[#A8A8A8]">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 hover:text-[#F2F2F0] transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            <RouterLink
              to="/account/wishlist"
              className="p-1.5 hover:text-[#F2F2F0] transition-colors relative hidden sm:block"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C7C7C7] text-[#090909] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </RouterLink>

            <RouterLink
              to={user ? "/account" : "/account/login"}
              className="p-1.5 hover:text-[#F2F2F0] transition-colors"
              title={user ? user.full_name : "Account Sign In"}
            >
              <UserIcon className="w-5 h-5 stroke-[1.5]" />
            </RouterLink>

            {/* Shopping Bag Button with Subtle Count Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 hover:text-[#F2F2F0] transition-colors relative flex items-center gap-1.5"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {totalQuantity > 0 && (
                <span className="bg-[#C7C7C7] text-[#090909] text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Fullscreen Mobile Luxury Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#090909] text-[#F2F2F0] flex flex-col justify-between p-8 font-serif animate-fade-in">
          <div className="flex justify-between items-center border-b border-white/12 pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-xl shadow-sm border border-[#C7C7C7]/40">
                <img src="/logo.PNG" alt="Sai Balaji" className="h-9 w-auto object-contain" />
              </div>
              <span className="font-serif text-xl tracking-[0.18em] text-[#F2F2F0]">SAI BALAJI</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#A8A8A8] hover:text-white">
              <X className="w-7 h-7" />
            </button>
          </div>

          <nav className="flex flex-col space-y-7 text-2xl font-light tracking-wide text-center">
            <RouterLink to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C7C7C7]">HOME</RouterLink>
            <RouterLink to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C7C7C7]">OUR STORY</RouterLink>
            <RouterLink to="/shop/retail" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C7C7C7]">COLLECTIONS</RouterLink>
            <a href="/home#craftsmanship" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C7C7C7]">CRAFTSMANSHIP</a>
            <RouterLink to="/shop/wholesale" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C7C7C7]">WHOLESALE</RouterLink>
            <RouterLink to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#C7C7C7]">CONTACT</RouterLink>
          </nav>

          <div className="border-t border-white/12 pt-6 text-center space-y-2 font-sans text-xs text-[#A8A8A8]">
            <p className="text-[#C7C7C7] font-semibold">+91 98765 43210 • Tenali Atelier</p>
            <p>NABL Hallmarked Silver Manufacturers</p>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#090909]/95 backdrop-blur-xl flex items-center justify-center p-6">
          <button
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-8 right-8 text-[#A8A8A8] hover:text-white p-2"
          >
            <X className="w-8 h-8" />
          </button>

          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl space-y-4 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#C7C7C7] font-semibold block">
              SEARCH THE HOUSE CATALOGUE
            </span>
            <input
              type="text"
              autoFocus
              placeholder="Search 999 Pure Idols, 925 Tableware, Pooja Articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[#C7C7C7] py-4 text-2xl font-serif text-white placeholder-[#555555] focus:outline-none text-center"
            />
            <p className="text-xs text-[#A8A8A8]">Press Enter to search collections</p>
          </form>
        </div>
      )}
    </>
  );
};

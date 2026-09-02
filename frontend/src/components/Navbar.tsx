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
    if (path === '/shop/wholesale') {
      return location.pathname.startsWith('/shop/wholesale') || location.pathname.includes('wholesale');
    }
    if (path === '/shop/retail') {
      return location.pathname.startsWith('/shop/retail') || (location.pathname.startsWith('/category') && !location.pathname.includes('wholesale'));
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Primary Desktop & Mobile Header (Sticky Light Ivory/White E-Commerce Navbar) */}
      <header
        className={`sticky top-0 z-40 h-[84px] transition-all duration-300 flex items-center ${isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E5E0D8] shadow-xs'
          : 'bg-[#F8F6F1]/90 backdrop-blur-xs border-b border-[#E5E0D8]/60'
          }`}
      >
        <div className="max-w-[1450px] mx-auto w-full px-3 sm:px-8 lg:px-12 flex items-center justify-between">

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 text-[#444444] hover:text-[#202020] transition-colors shrink-0"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* LEFT ZONE: Brand Lockup with White Logo Container */}
          <RouterLink to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="bg-white p-1 rounded-xl shadow-xs border border-[#E5E0D8]">
              <img
                src="/logo.webp"
                alt="Sai Balaji Silverworks Logo"
                className="h-8 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="hidden min-[380px]:flex flex-col justify-center">
              <span className="font-serif text-base sm:text-[22px] font-normal tracking-[0.12em] sm:tracking-[0.16em] text-[#202020] group-hover:text-[#B9A77A] transition-colors leading-tight">
                SAI BALAJI
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#666666] font-semibold font-sans mt-0.5">
                SILVERWORKS
              </span>
            </div>
          </RouterLink>

          {/* CENTER ZONE: Clean Editorial E-Commerce Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-[12px] uppercase tracking-[0.12em] font-medium text-[#555555]">
            <RouterLink
              to="/home"
              className={`transition-colors py-1 relative group ${isActive('/home') ? 'text-[#202020] font-semibold' : 'hover:text-[#202020]'}`}
            >
              HOME
              <span className={`absolute bottom-0 left-0 h-[2px] bg-[#00276B] transition-all duration-300 ${isActive('/home') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </RouterLink>

            <RouterLink
              to="/shop/retail"
              className={`transition-colors py-1 relative group ${isActive('/shop/retail') ? 'text-[#202020] font-semibold' : 'hover:text-[#202020]'}`}
            >
              RETAIL
              <span className={`absolute bottom-0 left-0 h-[2px] bg-[#00276B] transition-all duration-300 ${isActive('/shop/retail') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </RouterLink>

            <RouterLink
              to="/shop/wholesale"
              className={`transition-colors py-1 relative group ${isActive('/shop/wholesale') ? 'text-[#202020] font-semibold' : 'hover:text-[#202020]'}`}
            >
              WHOLESALE
              <span className={`absolute bottom-0 left-0 h-[2px] bg-[#00276B] transition-all duration-300 ${isActive('/shop/wholesale') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </RouterLink>

            <RouterLink
              to="/about"
              className={`transition-colors py-1 relative group ${isActive('/about') ? 'text-[#202020] font-semibold' : 'hover:text-[#202020]'}`}
            >
              ABOUT
              <span className={`absolute bottom-0 left-0 h-[2px] bg-[#00276B] transition-all duration-300 ${isActive('/about') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </RouterLink>

            <RouterLink
              to="/contact"
              className={`transition-colors py-1 relative group ${isActive('/contact') ? 'text-[#202020] font-semibold' : 'hover:text-[#202020]'}`}
            >
              CONTACT
              <span className={`absolute bottom-0 left-0 h-[2px] bg-[#00276B] transition-all duration-300 ${isActive('/contact') ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </RouterLink>
          </nav>

          {/* RIGHT ZONE: Utility Icons (Search, Account, Wishlist, Cart) */}
          <div className="flex items-center gap-1 sm:gap-4 text-[#333333] shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 sm:p-2 hover:text-[#202020] hover:bg-[#F1EFEB] rounded-full transition-all shrink-0"
              title="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
            </button>

            <RouterLink
              to="/account/wishlist"
              className="p-2 hover:text-[#202020] hover:bg-[#F1EFEB] rounded-full transition-all relative hidden sm:block shrink-0"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.75]" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#B9A77A] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </RouterLink>

            <RouterLink
              to={user ? "/account" : "/account/login"}
              className="p-1 sm:p-1.5 hover:text-[#202020] hover:bg-[#F1EFEB] rounded-full transition-all flex items-center justify-center shrink-0"
              title={user ? user.full_name : "Account Sign In"}
            >
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt={user.full_name || 'Account'} 
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-[#B9A77A]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="p-0.5">
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
                </div>
              )}
            </RouterLink>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 sm:p-2 bg-[#202020] hover:bg-[#B9A77A] text-white rounded-full transition-all relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 shadow-xs shrink-0 whitespace-nowrap"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75]" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider">
                CART ({totalQuantity})
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* Fullscreen Mobile Light Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#F8F6F1] text-[#202020] flex flex-col justify-between p-8 font-serif animate-fade-in">
          <div className="flex justify-between items-center border-b border-[#E5E0D8] pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-xl shadow-xs border border-[#E5E0D8]">
                <img src="/logo.webp" alt="Sai Balaji" className="h-9 w-auto object-contain" />
              </div>
              <span className="font-serif text-xl tracking-[0.16em] text-[#202020]">SAI BALAJI</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[#666666] hover:text-[#202020]">
              <X className="w-7 h-7" />
            </button>
          </div>

          <nav className="flex flex-col space-y-6 text-xl font-light tracking-wide text-center">
            <RouterLink to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#B9A77A]">HOME</RouterLink>
            <RouterLink to="/shop/retail" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#B9A77A]">RETAIL</RouterLink>
            <RouterLink to="/shop/wholesale" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#B9A77A]">WHOLESALE</RouterLink>
            <RouterLink to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#B9A77A]">ABOUT</RouterLink>
            <RouterLink to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#B9A77A]">CONTACT</RouterLink>
          </nav>

          <div className="border-t border-[#E5E0D8] pt-6 text-center space-y-1 font-sans text-xs text-[#666666]">
            <p className="text-[#202020] font-semibold">+91 9492664870 • Tenali Atelier</p>
            <p>100% Certified Hallmarked Silver</p>
          </div>
        </div>
      )}

      {/* Light Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#F8F6F1]/98 backdrop-blur-md flex items-center justify-center p-6">
          <button
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-8 right-8 text-[#666666] hover:text-[#202020] p-2"
          >
            <X className="w-8 h-8" />
          </button>

          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl space-y-5 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B9A77A] font-bold block">
              SEARCH SAI BALAJI SILVER STORE
            </span>
            <input
              type="text"
              autoFocus
              placeholder="Search 999 Fine Idols, Pooja Thalis, Silver Lamps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-b-2 border-[#B9A77A] p-4 text-2xl font-serif text-[#202020] placeholder-[#999999] focus:outline-none text-center shadow-xs rounded-t-xl"
            />
            <p className="text-xs text-[#666666]">Press Enter to view results</p>
          </form>
        </div>
      )}
    </>
  );
};

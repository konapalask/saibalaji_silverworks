import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Store, Briefcase, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWholesale } from '../context/WholesaleContext';

export const MobileBottomNav: React.FC = () => {
  const { cartCount } = useCart();
  const { wholesaleCount } = useWholesale();

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#1A1918]/95 backdrop-blur-md text-[#FAF9F5] border-t border-[#C5A059]/40 z-40 py-2.5 px-4">
      <div className="flex items-center justify-around text-center font-sans">
        
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] uppercase font-semibold transition-colors ${
              isActive ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink 
          to="/shop/retail" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] uppercase font-semibold transition-colors ${
              isActive ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          <Store className="w-5 h-5" />
          <span>Shop</span>
        </NavLink>

        <NavLink 
          to="/shop/wholesale" 
          className={({ isActive }) => 
            `relative flex flex-col items-center gap-1 text-[10px] uppercase font-semibold transition-colors ${
              isActive ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          <Briefcase className="w-5 h-5 text-[#C5A059]" />
          <span>Wholesale</span>
          {wholesaleCount > 0 && (
            <span className="absolute -top-1 right-2 bg-[#C5A059] text-[#1A1918] font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              {wholesaleCount}
            </span>
          )}
        </NavLink>

        <NavLink 
          to="/cart" 
          className={({ isActive }) => 
            `relative flex flex-col items-center gap-1 text-[10px] uppercase font-semibold transition-colors ${
              isActive ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Bag</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 right-2 bg-[#C5A059] text-[#1A1918] font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </NavLink>

        <NavLink 
          to="/account" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] uppercase font-semibold transition-colors ${
              isActive ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Account</span>
        </NavLink>

      </div>
    </div>
  );
};

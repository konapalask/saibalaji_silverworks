import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Store, Briefcase, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MobileBottomNav: React.FC = () => {
  const { totalQuantity, cartType, setIsCartOpen } = useCart();

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-[#1A1918]/95 backdrop-blur-md text-[#FAF9F5] border-t border-[#C5A059]/40 z-40 py-2.5 px-4">
      <div className="flex items-center justify-around text-center font-sans">
        
        <NavLink 
          to="/home" 
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
            `flex flex-col items-center gap-1 text-[10px] uppercase font-semibold transition-colors ${
              isActive ? 'text-[#C5A059]' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          <Briefcase className="w-5 h-5 text-[#C5A059]" />
          <span>Wholesale</span>
        </NavLink>

        <button 
          onClick={() => setIsCartOpen(true)} 
          className="relative flex flex-col items-center gap-1 text-[10px] uppercase font-semibold transition-colors text-gray-400 hover:text-white"
        >
          <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
          <span>Bag ({cartType})</span>
          {totalQuantity > 0 && (
            <span className="absolute -top-1.5 right-1 bg-[#C5A059] text-[#1A1918] font-bold text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-[#1A1918]">
              {totalQuantity}
            </span>
          )}
        </button>

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

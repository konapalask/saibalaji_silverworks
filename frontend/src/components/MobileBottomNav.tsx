import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Store, Briefcase, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MobileBottomNav: React.FC = () => {
  const { totalQuantity, cartType, setIsCartOpen } = useCart();

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md text-[#202020] border-t border-[#E5E0D8] z-40 py-2.5 px-4 shadow-lg">
      <div className="flex items-center justify-around text-center font-sans">
        
        <NavLink 
          to="/home" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] uppercase font-semibold transition-colors ${
              isActive ? 'text-[#B9A77A]' : 'text-gray-500 hover:text-[#202020]'
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
              isActive ? 'text-[#B9A77A]' : 'text-gray-500 hover:text-[#202020]'
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
              isActive ? 'text-[#B9A77A]' : 'text-gray-500 hover:text-[#202020]'
            }`
          }
        >
          <Briefcase className="w-5 h-5 text-[#B9A77A]" />
          <span>Wholesale</span>
        </NavLink>

        <button 
          onClick={() => setIsCartOpen(true)} 
          className="relative flex flex-col items-center gap-1 text-[10px] uppercase font-semibold transition-colors text-gray-500 hover:text-[#202020]"
        >
          <ShoppingBag className="w-5 h-5 text-[#B9A77A]" />
          <span>Bag</span>
          {totalQuantity > 0 && (
            <span className="absolute -top-1.5 right-1 bg-[#202020] text-white font-bold text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-white">
              {totalQuantity}
            </span>
          )}
        </button>

        <NavLink 
          to="/account" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-[10px] uppercase font-semibold transition-colors ${
              isActive ? 'text-[#B9A77A]' : 'text-gray-500 hover:text-[#202020]'
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

import React, { createContext, useContext } from 'react';
import { Product, WholesaleCartItem } from '../types';
import { useCart } from './CartContext';

interface WholesaleContextType {
  wholesaleItems: WholesaleCartItem[];
  addToWholesaleCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromWholesaleCart: (productId: number) => void;
  updateWholesaleQuantity: (productId: number, quantity: number) => void;
  clearWholesaleCart: () => void;
  wholesaleCount: number;
}

const WholesaleContext = createContext<WholesaleContextType | undefined>(undefined);

export const WholesaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalQuantity } = useCart();

  // Map unified cart items to WholesaleCartItem interface for backwards compatibility
  const wholesaleItems: any[] = cart.map(item => ({
    product: item.product,
    requested_quantity: item.quantity,
    selected_measurement: item.selected_measurement || item.measurement,
    measurement: item.selected_measurement || item.measurement,
    size: item.selected_measurement || item.measurement,
    weight_g: item.weight_g,
    notes: ''
  }));

  const addToWholesaleCart = (product: Product, quantity?: number) => {
    const qty = quantity && quantity > 0 ? quantity : (product.min_wholesale_qty || 5);
    addToCart(product, qty);
  };

  const removeFromWholesaleCart = (productId: number) => {
    removeFromCart(productId);
  };

  const updateWholesaleQuantity = (productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const clearWholesaleCart = () => {
    clearCart();
  };

  return (
    <WholesaleContext.Provider
      value={{
        wholesaleItems,
        addToWholesaleCart,
        removeFromWholesaleCart,
        updateWholesaleQuantity,
        clearWholesaleCart,
        wholesaleCount: totalQuantity
      }}
    >
      {children}
    </WholesaleContext.Provider>
  );
};

export const useWholesale = () => {
  const context = useContext(WholesaleContext);
  if (!context) throw new Error('useWholesale must be used within WholesaleProvider');
  return context;
};

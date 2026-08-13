import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, WholesaleCartItem } from '../types';

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
  const [wholesaleItems, setWholesaleItems] = useState<WholesaleCartItem[]>(() => {
    const saved = localStorage.getItem('sbs_wholesale_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sbs_wholesale_cart', JSON.stringify(wholesaleItems));
  }, [wholesaleItems]);

  const addToWholesaleCart = (product: Product, quantity?: number, notes?: string) => {
    const qty = quantity || product.min_wholesale_qty || 10;
    setWholesaleItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, requested_quantity: i.requested_quantity + qty, notes: notes || i.notes }
            : i
        );
      }
      return [...prev, { product, requested_quantity: qty, notes }];
    });
  };

  const removeFromWholesaleCart = (productId: number) => {
    setWholesaleItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateWholesaleQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromWholesaleCart(productId);
      return;
    }
    setWholesaleItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, requested_quantity: quantity } : i))
    );
  };

  const clearWholesaleCart = () => setWholesaleItems([]);

  const wholesaleCount = wholesaleItems.reduce((acc, item) => acc + item.requested_quantity, 0);

  return (
    <WholesaleContext.Provider
      value={{
        wholesaleItems,
        addToWholesaleCart,
        removeFromWholesaleCart,
        updateWholesaleQuantity,
        clearWholesaleCart,
        wholesaleCount,
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

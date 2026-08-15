import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem } from '../types';
import { WHOLESALE_MOQ } from '../config/cartConfig';

export type CartType = 'RETAIL' | 'WHOLESALE';

export interface EffectiveCartItem extends CartItem {
  effectivePrice: number;
  hasWholesalePrice: boolean;
  itemSubtotal: number;
}

interface CartContextType {
  cart: CartItem[];
  effectiveCartItems: EffectiveCartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalQuantity: number;
  cartCount: number; // alias for totalQuantity
  cartType: CartType;
  isWholesale: boolean;
  WHOLESALE_MOQ: number;
  itemsToWholesale: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  getItemEffectivePrice: (product: Product, currentCartType?: CartType) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sbs_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sbs_cart', JSON.stringify(cart));
  }, [cart]);

  // 1. Calculate Total Quantity across all items
  const totalQuantity = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // 2. Derive Cart Type dynamically (RETAIL vs WHOLESALE based on totalQuantity >= WHOLESALE_MOQ)
  const cartType: CartType = useMemo(() => {
    return totalQuantity >= WHOLESALE_MOQ ? 'WHOLESALE' : 'RETAIL';
  }, [totalQuantity]);

  const isWholesale = cartType === 'WHOLESALE';
  const itemsToWholesale = Math.max(0, WHOLESALE_MOQ - totalQuantity);

  // 3. Price helper
  const getItemEffectivePrice = (product: Product, currentMode: CartType = cartType): number => {
    if (currentMode === 'WHOLESALE') {
      if (typeof product.wholesale_price === 'number' && product.wholesale_price > 0) {
        return product.wholesale_price;
      }
      // If wholesale price is not explicitly set, return retail_price
      return product.retail_price;
    }
    return product.retail_price;
  };

  // 4. Effective Cart Items with exact price per item
  const effectiveCartItems: EffectiveCartItem[] = useMemo(() => {
    return cart.map((item) => {
      const hasWholesalePrice = typeof item.product.wholesale_price === 'number' && item.product.wholesale_price > 0;
      const effectivePrice = getItemEffectivePrice(item.product, cartType);
      const itemSubtotal = effectivePrice * item.quantity;
      return {
        ...item,
        effectivePrice,
        hasWholesalePrice,
        itemSubtotal
      };
    });
  }, [cart, cartType]);

  // 5. Subtotal calculation
  const subtotal = useMemo(() => {
    return effectiveCartItems.reduce((sum, item) => sum + item.itemSubtotal, 0);
  }, [effectiveCartItems]);

  // Actions
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        effectiveCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalQuantity,
        cartCount: totalQuantity,
        cartType,
        isWholesale,
        WHOLESALE_MOQ,
        itemsToWholesale,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        getItemEffectivePrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

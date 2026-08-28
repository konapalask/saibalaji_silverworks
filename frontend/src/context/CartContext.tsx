import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem } from '../types';
import { WHOLESALE_MOQ } from '../config/cartConfig';
import { useAuth } from './AuthContext';
import { useLiveSilver } from './LiveSilverContext';

export type CartType = 'RETAIL' | 'WHOLESALE';

export interface EffectiveCartItem extends CartItem {
  effectivePrice: number;
  hasWholesalePrice: boolean;
  itemSubtotal: number;
}

interface CartContextType {
  cart: CartItem[];
  effectiveCartItems: EffectiveCartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: any) => void;
  removeFromCart: (productId: number, variantId?: string) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: string) => void;
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
  getItemEffectivePrice: (product: Product, selectedVariant?: any, currentCartType?: CartType) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { calculateDynamicPrice, calculateCurrentPrice } = useLiveSilver();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sbs_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Automatically open cart drawer if user just completed login after clicking book/cart action
  useEffect(() => {
    if (user) {
      const shouldOpenCart = sessionStorage.getItem('sbs_open_cart_after_login');
      if (shouldOpenCart === 'true') {
        sessionStorage.removeItem('sbs_open_cart_after_login');
        setIsCartOpen(true);
      }
    }
  }, [user]);

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
  const getItemEffectivePrice = (product: Product, selectedVariant?: any, currentMode: CartType = cartType): number => {
    const varObj = selectedVariant || (Array.isArray(product.variants) && product.variants.length > 0 ? product.variants[0] : null);
    const weightG = varObj?.weight_g ?? product.weight_g;
    const mc = varObj?.making_charge ?? product.making_charges ?? 0;
    const mcType = varObj?.making_charge_type || product.making_charge_type || 'fixed';
    const purity = product.silver_purity || '925';

    if (typeof weightG === 'number' && weightG > 0) {
      const breakdown = calculateDynamicPrice(weightG, mc, mcType, purity);
      return currentMode === 'WHOLESALE' ? breakdown.wholesalePrice : breakdown.finalPrice;
    }

    if (currentMode === 'WHOLESALE') {
      if (typeof product.wholesale_price === 'number' && product.wholesale_price > 0) {
        return product.wholesale_price;
      }
      return product.retail_price;
    }
    return calculateCurrentPrice(product);
  };

  // 4. Effective Cart Items with exact price per item
  const effectiveCartItems: EffectiveCartItem[] = useMemo(() => {
    return cart.map((item) => {
      const hasWholesalePrice = typeof item.product.wholesale_price === 'number' && item.product.wholesale_price > 0;
      
      const varId = item.variant_id || item.selected_measurement || 'default';
      const matchedVariant = item.selected_variant || item.product.variants?.find(
        v => v.id === varId || v.measurement === item.selected_measurement || v.measurement === varId
      );

      const weightG = item.weight_g ?? matchedVariant?.weight_g ?? item.product.weight_g;
      const mc = item.making_charge ?? matchedVariant?.making_charge ?? item.product.making_charges ?? 0;
      const mcType = matchedVariant?.making_charge_type || item.product.making_charge_type || 'fixed';
      const purity = item.product.silver_purity || '925';

      let effectivePrice = 0;

      if (typeof weightG === 'number' && weightG > 0) {
        const breakdown = calculateDynamicPrice(weightG, mc, mcType, purity);
        effectivePrice = cartType === 'WHOLESALE' ? breakdown.wholesalePrice : breakdown.finalPrice;
      } else {
        effectivePrice = getItemEffectivePrice(item.product, matchedVariant, cartType);
      }

      const itemSubtotal = effectivePrice * item.quantity;
      return {
        ...item,
        selected_variant: matchedVariant,
        weight_g: weightG,
        making_charge: mc,
        effectivePrice,
        hasWholesalePrice,
        itemSubtotal
      };
    });
  }, [cart, cartType, calculateDynamicPrice, calculateCurrentPrice]);

  // 5. Subtotal calculation
  const subtotal = useMemo(() => {
    return effectiveCartItems.reduce((sum, item) => sum + item.itemSubtotal, 0);
  }, [effectiveCartItems]);

  // Actions
  const addToCart = (product: Product, quantity: number = 1, selectedVariant?: any) => {
    setCart((prev) => {
      const varId = selectedVariant?.id || selectedVariant?.measurement || 'default';
      const isMatch = (i: CartItem) => {
        const itemVarId = i.variant_id || i.selected_measurement || 'default';
        return i.product.id === product.id && itemVarId === varId;
      };

      const existing = prev.find(isMatch);
      if (existing) {
        return prev.map((i) =>
          isMatch(i) ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, {
        product,
        quantity,
        variant_id: varId,
        selected_measurement: selectedVariant?.measurement,
        selected_variant: selectedVariant,
        weight_g: selectedVariant?.weight_g ?? product.weight_g,
        making_charge: selectedVariant?.making_charge ?? product.making_charges
      }];
    });
  };

  const removeFromCart = (productId: number, variantId?: string) => {
    setCart((prev) => prev.filter((i) => {
      if (variantId) {
        const itemVarId = i.variant_id || i.selected_measurement || 'default';
        return !(i.product.id === productId && itemVarId === variantId);
      }
      return i.product.id !== productId;
    }));
  };

  const updateQuantity = (productId: number, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => {
        const itemVarId = i.variant_id || i.selected_measurement || 'default';
        if (variantId) {
          return (i.product.id === productId && itemVarId === variantId) ? { ...i, quantity } : i;
        }
        return i.product.id === productId ? { ...i, quantity } : i;
      })
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


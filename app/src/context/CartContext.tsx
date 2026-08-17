import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  gstTax: number;
  shippingFee: number;
  grandTotal: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('cartItems').then(data => {
      if (data) {
        try {
          setCartItems(JSON.parse(data));
        } catch (e) {}
      }
    });
  }, []);

  const saveCart = async (items: CartItem[]) => {
    setCartItems(items);
    await AsyncStorage.setItem('cartItems', JSON.stringify(items));
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existingIndex = cartItems.findIndex(item => item.product.id === product.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...cartItems, { product, quantity }];
    }
    saveCart(updated);
  };

  const removeFromCart = (productId: number) => {
    const updated = cartItems.filter(item => item.product.id !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cartItems.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.retail_price * item.quantity), 0);
  const gstTax = Math.round(subtotal * 0.03); // 3% GST on Silver
  const shippingFee = subtotal > 10000 || subtotal === 0 ? 0 : 350;
  const grandTotal = subtotal + gstTax + shippingFee;
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        gstTax,
        shippingFee,
        grandTotal,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

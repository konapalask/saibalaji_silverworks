import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: number[];
  toggleWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  isLoading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('sbs_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync / Fetch Wishlist from Real-Time API Endpoint when user logs in or mounts
  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        const localSaved = localStorage.getItem('sbs_wishlist');
        const localIds = localSaved ? JSON.parse(localSaved) : [];
        
        try {
          const syncRes = await api.post('/wishlist/sync', { product_ids: localIds });
          if (syncRes.data && Array.isArray(syncRes.data.wishlist_ids)) {
            setWishlistIds(syncRes.data.wishlist_ids);
            localStorage.setItem('sbs_wishlist', JSON.stringify(syncRes.data.wishlist_ids));
          }
        } catch {
          // Fallback if backend endpoint is unavailable or server is restarting
          const saved = localStorage.getItem('sbs_wishlist');
          if (saved) setWishlistIds(JSON.parse(saved));
        }
      } else {
        const saved = localStorage.getItem('sbs_wishlist');
        if (saved) setWishlistIds(JSON.parse(saved));
      }
    } catch {
      // Silent fallback to local storage state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('sbs_wishlist', JSON.stringify(wishlistIds));
    } catch {}
  }, [wishlistIds]);

  const toggleWishlist = async (productId: number) => {
    // 1. Optimistic UI update for immediate response
    setWishlistIds((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('sbs_wishlist', JSON.stringify(next));
      } catch {}
      return next;
    });

    // 2. Real-time backend endpoint sync (Always sync to live wishlists_data.json on disk)
    try {
      const res = await api.post('/wishlist/toggle', { product_id: productId });
      if (res.data && Array.isArray(res.data.wishlist_ids)) {
        setWishlistIds(res.data.wishlist_ids);
        localStorage.setItem('sbs_wishlist', JSON.stringify(res.data.wishlist_ids));
      }
    } catch (err) {
      // Fallback gracefully on local state
    }
  };

  const isInWishlist = (productId: number) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist, isLoading, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

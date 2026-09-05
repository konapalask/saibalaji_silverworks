import React, { useState } from 'react';
import { X, Heart, Shield, ShoppingBag, Briefcase, Check, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWholesale } from '../context/WholesaleContext';
import { useWishlist } from '../context/WishlistContext';
import { useLiveSilver } from '../context/LiveSilverContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const { addToWholesaleCart } = useWholesale();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { calculateCurrentPrice } = useLiveSilver();

  if (!product) return null;

  const isLiked = isInWishlist(product.id);
  const displayPrice = calculateCurrentPrice(product);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAddWholesale = () => {
    addToWholesaleCart(product, Math.max(qty, product.min_wholesale_qty));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#202020]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F8F6F1] border border-[#E5E0D8] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative my-8">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 rounded-full text-[#202020] hover:bg-[#202020] hover:text-white transition-all shadow-xs border border-[#E5E0D8]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image Container — Uncropped Display */}
          <div className="bg-black p-6 flex items-center justify-center border-r border-[#E5E0D8]">
            <div className="w-full aspect-3/2 overflow-hidden bg-black p-2 flex items-center justify-center rounded-2xl border border-gray-800">
              <img 
                src={product.featured_image} 
                alt={product.title}
                className="w-full h-full object-cover rounded-xl drop-shadow-md bg-black"
              />
            </div>
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#202020] text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#B9A77A]" />
                  {product.silver_purity}
                </span>
                <span className="text-[11px] text-[#666666] font-semibold">Weight: {product.weight_g}g</span>
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#202020]">{product.title}</h2>

              <div className="mt-4 flex items-baseline gap-3">
                {product.product_type === 'WHOLESALE' ? (
                  <span className="font-serif text-xl font-bold text-[#C5A059]">
                    B2B Wholesale Quote on Request
                  </span>
                ) : (
                  <span className="font-sans text-3xl font-bold text-[#202020]">
                    ₹{displayPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#555555] leading-relaxed mt-4 line-clamp-3">
                {product.description || 'Exquisite silver creation crafted by master artisans at Sai Balaji Silverworks.'}
              </p>

              <div className="mt-4 pt-4 border-t border-[#E5E0D8] space-y-2 text-xs text-[#666666]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#B9A77A]" />
                  <span>100% Spectrometry Hallmarked</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#202020] hover:bg-[#B9A77A] text-white py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-[#B9A77A]" />
                  <span>{added ? 'Added to Cart!' : 'ADD TO CART'}</span>
                </button>

                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'border-[#E5E0D8] bg-white text-[#202020] hover:text-red-500'
                  }`}
                  title="Add to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

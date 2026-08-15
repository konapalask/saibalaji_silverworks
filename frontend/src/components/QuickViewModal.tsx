import React, { useState } from 'react';
import { X, Heart, Shield, ShoppingBag, Briefcase, Check, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWholesale } from '../context/WholesaleContext';
import { useWishlist } from '../context/WishlistContext';

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

  if (!product) return null;

  const isLiked = isInWishlist(product.id);

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
    <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF9F5] border border-[#C5A059] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative my-8">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full text-gray-600 hover:text-black shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image Arch Container */}
          <div className="bg-[#F4EFEA] p-6 flex items-center justify-center">
            <div className="w-full aspect-4/5 arch-top overflow-hidden border border-[#C5A059]/30 bg-white p-3 shadow-inner">
              <img 
                src={product.featured_image} 
                alt={product.title}
                className="w-full h-full object-cover rounded-t-full"
              />
            </div>
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#1A1918] text-[#FAF9F5] text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#C5A059]" />
                  {product.silver_purity}
                </span>
                <span className="text-[11px] text-gray-500 font-semibold">Weight: {product.weight_g}g</span>
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#1A1918]">{product.title}</h2>
              <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-sans text-3xl font-bold text-[#1A1918]">
                  ₹{product.retail_price.toLocaleString()}
                </span>
                {product.wholesale_price && (
                  <span className="text-xs text-[#C5A059] font-medium">
                    Wholesale Bulk: ₹{product.wholesale_price.toLocaleString()} (Min {product.min_wholesale_qty} Pcs)
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mt-4 line-clamp-3">
                {product.description || 'Exquisite silver creation crafted by master artisans at Sai Balaji Silverworks.'}
              </p>

              <div className="mt-4 pt-4 border-t border-[#E6E1DA] space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#C5A059]" />
                  <span>100% NABL Hallmarked Guarantee</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleAddWholesale}
                  className="flex-1 bg-[#1A1918] hover:bg-[#C5A059] text-white py-3.5 px-4 rounded-2xl text-xs uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Briefcase className="w-4 h-4 text-[#C5A059] group-hover:text-white" />
                  <span>{added ? 'Added to Wholesale Request!' : `ADD TO B2B WHOLESALE REQUEST (${product.min_wholesale_qty || 5}+ PCS)`}</span>
                </button>

                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'border-[#E6E1DA] bg-white text-gray-600 hover:text-red-500'
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

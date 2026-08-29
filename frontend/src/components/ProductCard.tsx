import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Briefcase, Sparkles, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useWholesale } from '../context/WholesaleContext';

import { useLiveSilver } from '../context/LiveSilverContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  isWholesaleOnly?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, isWholesaleOnly }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { addToWholesaleCart } = useWholesale();
  const { calculateCurrentPrice } = useLiveSilver();

  const isLiked = isInWishlist(product.id);
  const displayPrice = calculateCurrentPrice(product.base_price || product.retail_price, product.base_silver_rate);

  // Check current item quantity in cart
  const cartItem = cart.find((i) => i.product.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-[#E5E0D8] hover:border-[#B9A77A] product-card-hover overflow-hidden flex flex-col justify-between h-full">

      {/* Top Product Image Container with 3:2 Aspect Ratio */}
      <Link
        to={`/shop/retail/${product.slug}`}
        className="relative aspect-3/2 w-full bg-[#000000] overflow-hidden p-2 sm:p-3 flex items-center justify-center border-b border-[#F0ECE6] block group/img"
      >
        {/* Product Photography - Clean 3:2 filled studio photography */}
        <img
          src={product.featured_image}
          alt={product.title}
          className="w-full h-full object-cover rounded-xl img-editorial drop-shadow-md group-hover/img:scale-105 transition-transform duration-500 bg-black"
          loading="lazy"
        />

        {/* Out of Stock Overlay Badge */}
        {(product.stock <= 0 || product.in_stock === false) && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
            <span className="bg-red-600 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all z-10 ${isLiked ? 'bg-red-50 text-red-500 shadow-sm border border-red-200' : 'bg-white/90 text-gray-500 hover:text-red-500 hover:bg-white border border-[#E5E0D8]'
            }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </Link>

      {/* Product Details Content */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-[#B9A77A] tracking-widest mb-0.5 sm:mb-1 truncate">
            {product.category?.name || 'Sterling Silver'}
          </div>
          <Link to={`/shop/retail/${product.slug}`} className="block">
            <h3 className="font-serif text-xs sm:text-base font-semibold text-[#202020] group-hover:text-[#B9A77A] transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-[10px] sm:text-[11px] text-[#777777] line-clamp-1 mt-0.5">
            SKU: {product.sku}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="mt-2.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#F0ECE6] space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between gap-1">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[8.5px] sm:text-[9.5px] text-[#777777] uppercase tracking-wider font-medium">
                  {Array.isArray(product.variants) && product.variants.length > 1 ? 'From' : 'Price'}
                </span>
                <span className="text-[7.5px] sm:text-[8.5px] text-[#C5A059] font-bold bg-[#FAF9F5] px-1 py-0.2 rounded border border-[#C5A059]/30">Live</span>
              </div>
              <span className="font-sans font-bold text-sm sm:text-base text-[#202020]">
                ₹{displayPrice.toLocaleString()}
              </span>
            </div>

            {isWholesaleOnly && (
              <div className="text-right">
                <span className="text-[8.5px] sm:text-[9.5px] text-[#B9A77A] uppercase tracking-wider font-bold block">MOQ</span>
                <span className="text-[10px] sm:text-xs font-bold text-[#202020]">{product.min_wholesale_qty || 5} Pcs</span>
              </div>
            )}
          </div>

          {(product.stock <= 0 || product.in_stock === false) ? (
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 py-2 sm:py-2.5 px-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200"
            >
              <span>OUT OF STOCK</span>
            </button>
          ) : (
            <Link
              to={`/shop/retail/${product.slug}`}
              className="w-full bg-[#202020] hover:bg-[#B9A77A] text-white py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs text-center"
            >
              <span>VIEW DETAILS</span>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

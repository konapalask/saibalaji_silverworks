import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Briefcase, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useWholesale } from '../context/WholesaleContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  isWholesaleOnly?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, isWholesaleOnly }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToWholesaleCart } = useWholesale();

  const isLiked = isInWishlist(product.id);

  return (
    <div className="group relative bg-white rounded-2xl border border-[#E5E0D8] hover:border-[#B9A77A] product-card-hover overflow-hidden flex flex-col justify-between h-full">

      {/* Top Product Image Container with Neutral Off-White Studio Backdrop */}
      <div className="relative aspect-4/5 w-full bg-[#FAF8F5] overflow-hidden p-4 flex items-center justify-center border-b border-[#F0ECE6]">

        {/* Product Photography - Uncropped object-contain with soft pedestal drop-shadow */}
        <img
          src={product.featured_image}
          alt={product.title}
          className="w-full h-full object-contain img-editorial drop-shadow-md group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="bg-white/95 text-[#202020] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[#E5E0D8] shadow-2xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#B9A77A]" />
            {product.silver_purity}
          </span>
          {product.weight_g > 0 && (
            <span className="bg-[#F8F6F1]/90 text-[#666666] text-[9.5px] font-semibold tracking-wider px-2 py-0.5 rounded-full border border-[#E5E0D8]/80 w-fit">
              {product.weight_g}g
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${isLiked ? 'bg-red-50 text-red-500 shadow-sm border border-red-200' : 'bg-white/90 text-gray-500 hover:text-red-500 hover:bg-white border border-[#E5E0D8]'
            }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <div className="absolute inset-x-0 bottom-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={() => onQuickView(product)}
              className="w-full bg-white/95 hover:bg-[#202020] text-[#202020] hover:text-white border border-[#E5E0D8] py-2 rounded-xl text-[11px] uppercase tracking-widest font-semibold backdrop-blur-sm transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Eye className="w-3.5 h-3.5 text-[#B9A77A]" />
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Product Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="text-[10px] uppercase font-bold text-[#B9A77A] tracking-widest mb-1">
            {product.category?.name || 'Sterling Silver'}
          </div>
          <Link to={`/shop/retail/${product.slug}`} className="block">
            <h3 className="font-serif text-base font-semibold text-[#202020] group-hover:text-[#B9A77A] transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-[11px] text-[#777777] line-clamp-1 mt-0.5">
            SKU: {product.sku}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="mt-4 pt-3 border-t border-[#F0ECE6] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9.5px] text-[#777777] uppercase tracking-wider block font-medium">Price</span>
              <span className="font-sans font-bold text-base text-[#202020]">
                ₹{product.retail_price.toLocaleString()}
              </span>
            </div>

            {isWholesaleOnly && (
              <div className="text-right">
                <span className="text-[9.5px] text-[#B9A77A] uppercase tracking-wider font-bold block">MOQ</span>
                <span className="text-xs font-bold text-[#202020]">{product.min_wholesale_qty || 5} Pcs</span>
              </div>
            )}
          </div>

          {isWholesaleOnly ? (
            <button
              onClick={() => addToWholesaleCart(product)}
              className="w-full bg-[#202020] hover:bg-[#B9A77A] text-white py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              title={`Add Wholesale MOQ (${product.min_wholesale_qty || 5} Pcs) to Request`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#B9A77A] group-hover:text-white" />
              <span>+ ADD BULK ({product.min_wholesale_qty || 5} PCS)</span>
            </button>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              className="w-full bg-[#202020] hover:bg-[#B9A77A] text-white py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#B9A77A] group-hover:text-white" />
              <span>ADD TO CART</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

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
    <div className="group relative bg-white rounded-2xl border border-[#E6E1DA] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Image Container with Arch Shape styling */}
      <div className="relative aspect-4/5 w-full bg-[#FAF9F5] overflow-hidden">
        
        {/* Arch Shaped Image container inside grid */}
        <div className="w-full h-full arch-top overflow-hidden p-3">
          <img 
            src={product.featured_image} 
            alt={product.title}
            className="w-full h-full object-cover rounded-t-full img-zoom"
            loading="lazy"
          />
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="bg-[#1A1918]/90 text-[#FAF9F5] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm border border-[#C5A059]/40 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            {product.silver_purity}
          </span>
          <span className="bg-[#FAF9F5]/90 text-[#1A1918] text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full border border-[#E6E1DA]">
            {product.weight_g}g
          </span>
        </div>

        {/* Wishlist Floating Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isLiked ? 'bg-red-50 text-red-500 shadow-md' : 'bg-white/80 text-gray-700 hover:text-red-500 hover:bg-white'
          }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Overlay Button */}
        {onQuickView && (
          <div className="absolute inset-x-0 bottom-3 px-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button 
              onClick={() => onQuickView(product)}
              className="w-full bg-[#1A1918]/90 hover:bg-[#C5A059] text-white py-2 rounded-xl text-xs uppercase tracking-widest font-semibold backdrop-blur-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Product Details Content */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="text-[10px] uppercase font-semibold text-[#C5A059] tracking-widest mb-1">
            {product.category?.name || 'Sterling Silver'}
          </div>
          <Link to={`/shop/retail/${product.slug}`} className="block">
            <h3 className="font-serif text-lg font-bold text-[#1A1918] group-hover:text-[#C5A059] transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
            SKU: {product.sku}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="mt-4 pt-3 border-t border-[#E6E1DA] flex items-center justify-between">
          {isWholesaleOnly ? (
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Bulk Wholesale Quote</span>
              <span className="font-sans font-bold text-base text-[#1A1918]">
                ₹{product.wholesale_price ? product.wholesale_price.toLocaleString() : product.retail_price.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">/ unit</span>
              </span>
              <span className="text-[10px] text-[#C5A059] font-medium block">MOQ: {product.min_wholesale_qty} Pcs</span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Retail Price</span>
              <span className="font-sans font-bold text-lg text-[#1A1918]">
                ₹{product.retail_price.toLocaleString()}
              </span>
            </div>
          )}

          {/* Direct Cart Button */}
          {isWholesaleOnly ? (
            <button 
              onClick={() => addToWholesaleCart(product)}
              className="p-2.5 bg-[#C5A059] text-white rounded-xl hover:bg-[#1A1918] transition-colors flex items-center justify-center shadow-sm"
              title="Add to Wholesale Request Cart"
            >
              <Briefcase className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={() => addToCart(product, 1)}
              className="p-2.5 bg-[#1A1918] text-white rounded-xl hover:bg-[#C5A059] transition-colors flex items-center justify-center shadow-sm"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

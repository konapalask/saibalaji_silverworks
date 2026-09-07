import { Product, ProductVariant } from '../types';

/**
 * Check if a specific product variant is out of stock.
 */
export const isVariantOutOfStock = (variant?: ProductVariant | null): boolean => {
  if (!variant) return false;
  return variant.stock !== undefined && variant.stock <= 0;
};

/**
 * Check if a product is completely out of stock across all of its variants (or base stock).
 */
export const isProductFullyOutOfStock = (product: Product): boolean => {
  if (product.in_stock === false) return true;

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const activeVariants = product.variants.filter((v) => v.is_active !== false);
    if (activeVariants.length > 0) {
      return activeVariants.every((v) => v.stock !== undefined && v.stock <= 0);
    }
  }

  return product.stock !== undefined && product.stock <= 0;
};

/**
 * Get the first active and in-stock variant.
 * If all variants are out of stock, returns the first active variant (or fallback).
 */
export const getFirstInStockVariant = (variants: ProductVariant[]): ProductVariant | null => {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const activeVariants = variants.filter((v) => v.is_active !== false);
  if (activeVariants.length === 0) return variants[0] || null;

  const inStock = activeVariants.find((v) => v.stock === undefined || v.stock > 0);
  return inStock || activeVariants[0];
};

/**
 * Check if a specific item (product + selected variant) is out of stock.
 */
export const isCartItemOutOfStock = (product: Product, selectedVariant?: ProductVariant | null): boolean => {
  if (product.in_stock === false) return true;

  if (selectedVariant) {
    return isVariantOutOfStock(selectedVariant);
  }

  return isProductFullyOutOfStock(product);
};

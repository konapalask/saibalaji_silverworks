import { Product } from '../types';

export const getApiBaseUrl = (): string => {
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (envApiUrl && envApiUrl.startsWith('http')) {
    return envApiUrl.replace(/\/api\/v1\/?$/, '');
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/api\/v1\/?$/, '');
  }
  return '';
};

export const getItemImageUrl = (
  item: any,
  productCatalogMap?: Record<number, Partial<Product>>
): string => {
  if (!item) return '';

  // 1. Direct full_image_url check
  if (item.full_image_url) {
    return item.full_image_url;
  }

  // 2. Multi-property Image Check
  const relativeImg =
    item.featured_image ||
    item.image_url ||
    item.image ||
    item.product?.featured_image ||
    item.product?.image_url;

  let fullImageUrl = '';

  if (relativeImg) {
    if (relativeImg.startsWith('http://') || relativeImg.startsWith('https://')) {
      fullImageUrl = relativeImg;
    } else {
      const apiHost = getApiBaseUrl();
      const cleanPath = relativeImg.startsWith('/') ? relativeImg : `/${relativeImg}`;
      fullImageUrl = apiHost ? `${apiHost}${cleanPath}` : cleanPath;
    }
  }

  // 3. Catalog Lookup Fallback (for older orders saved without images)
  if (!fullImageUrl && item.product_id && productCatalogMap && productCatalogMap[item.product_id]) {
    const catalogProduct = productCatalogMap[item.product_id];
    const catalogImg = catalogProduct.featured_image || catalogProduct.image_url || (catalogProduct as any).image;
    if (catalogImg) {
      if (catalogImg.startsWith('http://') || catalogImg.startsWith('https://')) {
        fullImageUrl = catalogImg;
      } else {
        const apiHost = getApiBaseUrl();
        const cleanPath = catalogImg.startsWith('/') ? catalogImg : `/${catalogImg}`;
        fullImageUrl = apiHost ? `${apiHost}${cleanPath}` : cleanPath;
      }
    }
  }

  return fullImageUrl;
};

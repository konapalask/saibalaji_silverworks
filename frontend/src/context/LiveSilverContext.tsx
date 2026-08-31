import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SilverRateStats, Product } from '../types';
import api from '../services/api';

export interface PriceBreakdown {
  weight: number;
  silverRate: number;
  silverValue: number;
  makingCharge: number;
  wholesaleMakingCharge: number;
  makingChargeType: 'fixed' | 'per_gram' | 'percentage';
  finalPrice: number; // Retail Price
  wholesalePrice: number; // Wholesale Price
}

interface LiveSilverContextType {
  silverStats: SilverRateStats;
  calculateCurrentPrice: (target: Product | number, baseSilverRate?: number) => number;
  calculateWholesalePrice: (product: Product) => number;
  calculateDynamicPrice: (weightGrams: number, makingCharge: number, makingChargeType?: 'fixed' | 'per_gram' | 'percentage', purity?: string, wholesaleMakingCharge?: number) => PriceBreakdown;
  refreshSilverRate: () => Promise<void>;
  updateBaselineRate: (newRate: number) => Promise<void>;
}

const defaultStats: SilverRateStats = {
  live_silver_rate: 250.64,
  previous_silver_rate: 250.64,
  rate_difference: 0.0,
  last_updated_at: new Date().toISOString(),
  api_status: 'CONNECTED',
  total_products_linked: 177
};

const LiveSilverContext = createContext<LiveSilverContextType | undefined>(undefined);

export const LiveSilverProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [silverStats, setSilverStats] = useState<SilverRateStats>(defaultStats);

  const fetchSilverRate = async () => {
    try {
      const res = await api.get('/silver-rate');
      if (res.data && typeof res.data.live_silver_rate === 'number') {
        setSilverStats(res.data);
      }
    } catch (err) {
      console.warn('Live silver rate fetch warning, retaining last rate:', err);
      setSilverStats(prev => ({ ...prev, api_status: 'RETRYING' }));
    }
  };

  useEffect(() => {
    fetchSilverRate();

    // Subscribe to SSE stream for zero-page-refresh instant live price updates
    const apiBase = (api.defaults.baseURL || '').replace(/\/api\/v1\/?$/, '');
    const sseUrl = `${apiBase}/api/v1/silver-rate/stream`;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(sseUrl);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && typeof data.live_silver_rate === 'number') {
            setSilverStats(data);
          }
        } catch (e) {
          console.warn('SSE parse error', e);
        }
      };
      eventSource.onerror = () => {
        setSilverStats(prev => ({ ...prev, api_status: 'RETRYING' }));
      };
    } catch (e) {
      console.warn('SSE initialization failed, fallback to polling', e);
    }

    // Polling fallback every 1 second (1000ms real-time sync)
    const interval = setInterval(fetchSilverRate, 1000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  const calculateDynamicPrice = (
    weightGrams: number,
    makingCharge: number,
    makingChargeType: 'fixed' | 'per_gram' | 'percentage' = 'fixed',
    purity: string = '925',
    wholesaleMakingCharge?: number
  ): PriceBreakdown => {
    const weight = parseFloat(String(weightGrams)) || 0;
    const mc = parseFloat(String(makingCharge)) || 0;
    const wmc = wholesaleMakingCharge !== undefined && wholesaleMakingCharge !== null
      ? parseFloat(String(wholesaleMakingCharge))
      : Math.round(mc * 0.75 * 100) / 100; // Default wholesale making charge is 25% lower than retail making charge

    const rate = silverStats.live_silver_rate || 250.64;

    let purityFactor = 1.0;
    const purityStr = String(purity).toLowerCase();
    if (purityStr.includes('925') || purityStr.includes('sterling')) {
      purityFactor = 0.925;
    } else if (purityStr.includes('999') || purityStr.includes('fine')) {
      purityFactor = 1.0;
    }

    const silverValue = Math.round(weight * purityFactor * rate * 100) / 100;
    let calculatedMC = mc;
    let calculatedWMC = wmc;

    if (makingChargeType === 'per_gram') {
      calculatedMC = Math.round(mc * weight * 100) / 100;
      calculatedWMC = Math.round(wmc * weight * 100) / 100;
    } else if (makingChargeType === 'percentage') {
      calculatedMC = Math.round(((silverValue * mc) / 100) * 100) / 100;
      calculatedWMC = Math.round(((silverValue * wmc) / 100) * 100) / 100;
    }

    const finalPrice = Math.max(1, Math.round((silverValue + calculatedMC) * 100) / 100);
    const wholesalePrice = Math.max(1, Math.round((silverValue + calculatedWMC) * 100) / 100);

    return {
      weight,
      silverRate: rate,
      silverValue,
      makingCharge: calculatedMC,
      wholesaleMakingCharge: calculatedWMC,
      makingChargeType,
      finalPrice,
      wholesalePrice
    };
  };

  const calculateCurrentPrice = (
    target: Product | number,
    baseSilverRate?: number
  ): number => {
    if (typeof target === 'object' && target !== null) {
      // Check if product has explicit variants
      if (Array.isArray(target.variants) && target.variants.length > 0) {
        const activeVariants = target.variants.filter(v => v.is_active !== false);
        const sourceVariants = activeVariants.length > 0 ? activeVariants : target.variants;
        const lowestVariant = sourceVariants.reduce((min, v) => {
          const vPrice = calculateDynamicPrice(v.weight_g, v.making_charge, v.making_charge_type || 'fixed', target.silver_purity).finalPrice;
          const minPrice = calculateDynamicPrice(min.weight_g, min.making_charge, min.making_charge_type || 'fixed', target.silver_purity).finalPrice;
          return vPrice < minPrice ? v : min;
        }, sourceVariants[0]);

        return calculateDynamicPrice(lowestVariant.weight_g, lowestVariant.making_charge, lowestVariant.making_charge_type || 'fixed', target.silver_purity).finalPrice;
      }

      if (typeof target.weight_g === 'number' && target.weight_g > 0) {
        return calculateDynamicPrice(target.weight_g, target.making_charges || 0, target.making_charge_type || 'fixed', target.silver_purity).finalPrice;
      }

      const baseP = typeof target.base_price === 'number' ? target.base_price : target.retail_price;
      const baseSR = typeof target.base_silver_rate === 'number' ? target.base_silver_rate : (target.current_silver_rate || 250.64);
      if (!baseP || isNaN(baseP)) return 0;
      const diff = silverStats.live_silver_rate - baseSR;
      return Math.max(1, Math.round((baseP + diff) * 100) / 100);
    }

    const basePrice = target as number;
    if (!basePrice || isNaN(basePrice)) return 0;
    const sr = baseSilverRate !== undefined ? baseSilverRate : 250.64;
    const diff = silverStats.live_silver_rate - sr;
    return Math.max(1, Math.round((basePrice + diff) * 100) / 100);
  };

  const calculateWholesalePrice = (product: Product): number => {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const activeVariants = product.variants.filter(v => v.is_active !== false);
      const sourceVariants = activeVariants.length > 0 ? activeVariants : product.variants;
      const lowestVariant = sourceVariants.reduce((min, v) => {
        const vPrice = calculateDynamicPrice(v.weight_g, v.making_charge, v.making_charge_type || 'fixed', product.silver_purity).wholesalePrice;
        const minPrice = calculateDynamicPrice(min.weight_g, min.making_charge, min.making_charge_type || 'fixed', product.silver_purity).wholesalePrice;
        return vPrice < minPrice ? v : min;
      }, sourceVariants[0]);

      return calculateDynamicPrice(lowestVariant.weight_g, lowestVariant.making_charge, lowestVariant.making_charge_type || 'fixed', product.silver_purity).wholesalePrice;
    }

    if (typeof product.weight_g === 'number' && product.weight_g > 0) {
      return calculateDynamicPrice(product.weight_g, product.making_charges || 0, product.making_charge_type || 'fixed', product.silver_purity).wholesalePrice;
    }

    if (typeof product.wholesale_price === 'number' && product.wholesale_price > 0) {
      return product.wholesale_price;
    }
    return calculateCurrentPrice(product);
  };

  const updateBaselineRate = async (newRate: number) => {
    try {
      const res = await api.post('/admin/silver-rate/baseline', { new_silver_rate: newRate });
      if (res.data && res.data.silver_rate) {
        setSilverStats(res.data.silver_rate);
      }
    } catch (err) {
      console.error('Failed to update silver baseline rate', err);
    }
  };

  return (
    <LiveSilverContext.Provider value={{ silverStats, calculateCurrentPrice, calculateWholesalePrice, calculateDynamicPrice, refreshSilverRate: fetchSilverRate, updateBaselineRate }}>
      {children}
    </LiveSilverContext.Provider>
  );
};

export const useLiveSilver = () => {
  const context = useContext(LiveSilverContext);
  if (!context) {
    throw new Error('useLiveSilver must be used within a LiveSilverProvider');
  }
  return context;
};

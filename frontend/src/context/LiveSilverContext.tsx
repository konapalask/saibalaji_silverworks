import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SilverRateStats, Product } from '../types';
import api from '../services/api';

interface LiveSilverContextType {
  silverStats: SilverRateStats;
  calculateCurrentPrice: (target: Product | number, baseSilverRate?: number) => number;
  calculateWholesalePrice: (product: Product) => number;
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

  const calculateCurrentPrice = (
    target: Product | number,
    baseSilverRate?: number
  ): number => {
    if (typeof target === 'object' && target !== null) {
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
    const baseWP = product.wholesale_price || product.retail_price;
    const baseSR = typeof product.base_silver_rate === 'number' ? product.base_silver_rate : (product.current_silver_rate || 250.64);
    if (!baseWP || isNaN(baseWP)) return 0;
    const diff = silverStats.live_silver_rate - baseSR;
    return Math.max(1, Math.round((baseWP + diff) * 100) / 100);
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
    <LiveSilverContext.Provider value={{ silverStats, calculateCurrentPrice, calculateWholesalePrice, refreshSilverRate: fetchSilverRate, updateBaselineRate }}>
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

import { useState, useEffect } from 'react';
import type { CoinGeckoPriceResponse } from '../types/api';
import { fetchAllPrices } from '../api/prices';
import { getCached, setCache } from '../api/cache';

const CACHE_KEY = 'all-coin-prices';
const CACHE_TTL = 25 * 1000;       // 25s — stale just before next refresh
const REFRESH_INTERVAL = 30 * 1000; // 30s — 3 API calls per cycle (1 Gecko + 2 Yahoo)

interface UseAllCoinPricesResult {
  prices: CoinGeckoPriceResponse | null;
  loading: boolean;
  error: string | null;
}

export function useAllCoinPrices(): UseAllCoinPricesResult {
  const [prices, setPrices] = useState<CoinGeckoPriceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function load() {
      const cached = getCached<CoinGeckoPriceResponse>(CACHE_KEY);
      if (cached) {
        setPrices(cached);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading((prev) => prev || prices === null);
      fetchAllPrices()
        .then((data) => {
          if (cancelled) return;
          setCache(CACHE_KEY, data, CACHE_TTL);
          setPrices(data);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err.message);
          setLoading(false);
        });
    }

    load();
    const interval = setInterval(load, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { prices, loading, error };
}

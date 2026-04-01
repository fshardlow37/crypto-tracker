import { useState, useEffect } from 'react';
import type { ChartDataPoint, TimeRange } from '../types/chart';
import type { CoinId } from '../types/coins';
import { fetchChartData } from '../api/prices';
import { transformPriceData, normalizeToPercent } from '../utils/transforms';
import { getCached, setCache } from '../api/cache';
import { getDaysParam } from '../utils/dateUtils';
import { TIME_RANGES } from '../constants/timeRanges';

interface UseMultiPriceDataResult {
  data: Map<CoinId, ChartDataPoint[]>;
  loading: boolean;
  error: string | null;
}

export function useMultiPriceData(
  activeCoins: CoinId[],
  timeRange: TimeRange,
): UseMultiPriceDataResult {
  const [data, setData] = useState<Map<CoinId, ChartDataPoint[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable key for the active coins set
  const coinsKey = activeCoins.join(',');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const days = getDaysParam(timeRange);
    const ttl = TIME_RANGES[timeRange].cacheTTL;

    Promise.all(
      activeCoins.map(async (coinId) => {
        const cacheKey = `price-${coinId}-${timeRange}`;
        const cached = getCached<ChartDataPoint[]>(cacheKey);
        if (cached) return { coinId, data: cached };

        const raw = await fetchChartData(coinId, days);
        const transformed = transformPriceData(raw);
        setCache(cacheKey, transformed, ttl);
        return { coinId, data: transformed };
      }),
    )
      .then((results) => {
        if (cancelled) return;
        const normalize = activeCoins.length > 1;
        const map = new Map<CoinId, ChartDataPoint[]>();
        for (const { coinId, data } of results) {
          map.set(coinId, normalize ? normalizeToPercent(data) : data);
        }
        setData(map);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coinsKey, timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}

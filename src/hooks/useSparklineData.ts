import { useState, useEffect } from 'react';
import type { ChartDataPoint } from '../types/chart';
import type { CoinId } from '../types/coins';
import { fetchChartData } from '../api/prices';
import { transformPriceData } from '../utils/transforms';
import { getCached, setCache } from '../api/cache';
import { COIN_LIST } from '../constants/coins';
import { TIME_RANGES } from '../constants/timeRanges';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 min

type SparklineMap = Record<CoinId, ChartDataPoint[]>;

export function useSparklineData(): { sparklines: SparklineMap | null; loading: boolean } {
  const [sparklines, setSparklines] = useState<SparklineMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const results = await Promise.allSettled(
        COIN_LIST.map(async (coinId) => {
          const cacheKey = `price-${coinId}-1D`;
          const cached = getCached<ChartDataPoint[]>(cacheKey);
          if (cached) return { coinId, data: cached };

          const raw = await fetchChartData(coinId, '1');
          const transformed = transformPriceData(raw);
          setCache(cacheKey, transformed, TIME_RANGES['1D'].cacheTTL);
          return { coinId, data: transformed };
        })
      );

      if (cancelled) return;

      const map = {} as SparklineMap;
      for (const result of results) {
        if (result.status === 'fulfilled') {
          map[result.value.coinId] = result.value.data;
        }
      }
      setSparklines(map);
      setLoading(false);
    }

    load();

    const interval = setInterval(() => {
      load().catch(() => {});
    }, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { sparklines, loading };
}

import { useState, useEffect } from 'react';
import type { IndicatorDataPoint } from '../types/indicators';
import { IndicatorType } from '../types/indicators';
import { INDICATOR_CONFIGS } from '../constants/indicators';
import { fetchIndicator } from '../api/bgeometrics';
import { transformIndicatorData } from '../utils/transforms';
import { getCached, setCache } from '../api/cache';
import { getStartDate, toISODate } from '../utils/dateUtils';
import type { TimeRange } from '../types/chart';

interface UseIndicatorDataResult {
  data: IndicatorDataPoint[];
  loading: boolean;
  error: string | null;
}

export function useIndicatorData(
  type: IndicatorType,
  timeRange: TimeRange,
  enabled: boolean
): UseIndicatorDataResult {
  const [data, setData] = useState<IndicatorDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const cacheKey = `indicator-${type}-${timeRange}`;
    const cached = getCached<IndicatorDataPoint[]>(cacheKey);

    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const startDate = toISODate(getStartDate(timeRange));
    const endDate = toISODate(new Date());
    const config = INDICATOR_CONFIGS[type];

    // For MVRV Z-Score, try the primary field, fallback to 'mvrv'
    const field = type === IndicatorType.MVRVZScore ? config.field : config.field;

    fetchIndicator(type, startDate, endDate)
      .then((raw) => {
        if (cancelled) return;
        let transformed = transformIndicatorData(raw, field);
        // If mvrvZScore field failed, try mvrv
        if (transformed.length === 0 && type === IndicatorType.MVRVZScore) {
          transformed = transformIndicatorData(raw, 'mvrv');
        }
        setCache(cacheKey, transformed, 60 * 60 * 1000);
        setData(transformed);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [type, timeRange, enabled]);

  return { data, loading, error };
}

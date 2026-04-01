import type { ChartDataPoint } from '../types/chart';
import type { IndicatorDataPoint } from '../types/indicators';
import type { CoinGeckoMarketChart, BGeometricsDataPoint } from '../types/api';

export function transformPriceData(data: CoinGeckoMarketChart): ChartDataPoint[] {
  const seen = new Set<number>();
  return data.prices
    .map(([unixMs, value]) => ({
      time: Math.floor(unixMs / 1000) as number,
      value,
    }))
    .filter((point) => {
      if (seen.has(point.time)) return false;
      seen.add(point.time);
      return true;
    })
    .sort((a, b) => a.time - b.time);
}

export function normalizeToPercent(data: ChartDataPoint[]): ChartDataPoint[] {
  if (data.length === 0) return [];
  const base = data[0].value;
  if (base === 0) return data;
  return data.map((d) => ({
    time: d.time,
    value: ((d.value - base) / base) * 100,
  }));
}

export function transformIndicatorData(
  data: BGeometricsDataPoint[],
  field: string
): IndicatorDataPoint[] {
  const seen = new Set<number>();
  return data
    .map((point) => ({
      time: parseInt(point.unixTs, 10),
      value: parseFloat(point[field]),
    }))
    .filter((point) => {
      if (isNaN(point.value) || isNaN(point.time)) return false;
      if (seen.has(point.time)) return false;
      seen.add(point.time);
      return true;
    })
    .sort((a, b) => a.time - b.time);
}

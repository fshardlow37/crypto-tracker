import type { ChartDataPoint } from '../types/chart';

export function calculateSMA(data: ChartDataPoint[], period: number): ChartDataPoint[] {
  if (data.length < period) return [];
  const result: ChartDataPoint[] = [];
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].value;
    if (i >= period) {
      sum -= data[i - period].value;
    }
    if (i >= period - 1) {
      result.push({ time: data[i].time, value: sum / period });
    }
  }
  return result;
}

export function calculateMayerMultiple(
  priceData: ChartDataPoint[],
  sma200: ChartDataPoint[]
): ChartDataPoint[] {
  const smaMap = new Map(sma200.map((p) => [p.time, p.value]));
  return priceData
    .filter((p) => smaMap.has(p.time))
    .map((p) => ({
      time: p.time,
      value: p.value / smaMap.get(p.time)!,
    }));
}

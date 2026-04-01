export interface ChartDataPoint {
  time: number; // Unix timestamp in seconds
  value: number;
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

export type ScaleMode = 'linear' | 'logarithmic';

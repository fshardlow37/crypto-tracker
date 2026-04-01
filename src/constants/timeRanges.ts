import type { TimeRange } from '../types/chart';

export interface TimeRangeConfig {
  label: string;
  days: number | 'max';
  cacheTTL: number; // milliseconds
}

export const TIME_RANGES: Record<TimeRange, TimeRangeConfig> = {
  '1D': { label: '1D', days: 1, cacheTTL: 5 * 60 * 1000 },
  '1W': { label: '1W', days: 7, cacheTTL: 15 * 60 * 1000 },
  '1M': { label: '1M', days: 30, cacheTTL: 60 * 60 * 1000 },
  '3M': { label: '3M', days: 90, cacheTTL: 60 * 60 * 1000 },
  '1Y': { label: '1Y', days: 365, cacheTTL: 60 * 60 * 1000 },
  ALL: { label: 'ALL', days: 'max', cacheTTL: 60 * 60 * 1000 },
};

export const TIME_RANGE_LIST: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

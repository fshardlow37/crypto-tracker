import type { TimeRange } from '../types/chart';
import { TIME_RANGES } from '../constants/timeRanges';

export function getStartDate(timeRange: TimeRange): Date {
  const config = TIME_RANGES[timeRange];
  if (config.days === 'max') {
    return new Date('2009-01-03'); // Bitcoin genesis
  }
  const d = new Date();
  d.setDate(d.getDate() - config.days);
  return d;
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getDaysParam(timeRange: TimeRange): string {
  const config = TIME_RANGES[timeRange];
  return config.days === 'max' ? 'max' : String(config.days);
}

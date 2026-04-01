import type { BGeometricsDataPoint } from '../types/api';
import { IndicatorType } from '../types/indicators';
import { INDICATOR_CONFIGS } from '../constants/indicators';
import { electronFetch } from './electronFetch';

const BASE_URL = 'https://bitcoin-data.com';

// Serialize all BGeometrics requests so only one is in-flight at a time
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const task = queue.then(fn, fn);
  queue = task.then(() => {}, () => {});
  return task;
}

// Deduplicate identical in-flight requests (React strict mode fires twice)
const inflight = new Map<string, Promise<BGeometricsDataPoint[]>>();

async function fetchWithRetry(url: string, retries = 4): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await electronFetch(url);
    if (res.status !== 429) return res;
    // Longer backoff: 3s, 6s, 9s, 12s
    await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
  }
  return electronFetch(url);
}

async function doFetch(
  type: IndicatorType,
  startDate: string,
  endDate: string
): Promise<BGeometricsDataPoint[]> {
  return enqueue(async () => {
    const config = INDICATOR_CONFIGS[type];
    let url = `${BASE_URL}${config.endpoint}?startday=${startDate}&endday=${endDate}`;

    let res = await fetchWithRetry(url);

    // Fallback for MVRV Z-Score → try /v1/mvrv
    if (!res.ok && type === IndicatorType.MVRVZScore) {
      url = `${BASE_URL}/v1/mvrv?startday=${startDate}&endday=${endDate}`;
      res = await fetchWithRetry(url);
    }

    if (!res.ok) {
      throw new Error(`BGeometrics API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  });
}

export async function fetchIndicator(
  type: IndicatorType,
  startDate: string,
  endDate: string
): Promise<BGeometricsDataPoint[]> {
  const key = `${type}-${startDate}-${endDate}`;
  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = doFetch(type, startDate, endDate).finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

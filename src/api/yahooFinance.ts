import type { CoinGeckoMarketChart } from '../types/api';
import { electronFetch } from './electronFetch';

const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

const inflight = new Map<string, Promise<Response>>();

async function deduplicatedFetch(url: string): Promise<Response> {
  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = doFetch(url).finally(() => inflight.delete(url));
  inflight.set(url, promise);
  return promise;
}

async function doFetch(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await electronFetch(url);
    if (res.status !== 429) return res;
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
  return electronFetch(url);
}

interface YahooChartResult {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
        previousClose: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: (number | null)[];
        }>;
      };
    }>;
  };
}

function daysToYahooParams(days: string): { range: string; interval: string } {
  switch (days) {
    case '1': return { range: '1d', interval: '5m' };
    case '7': return { range: '5d', interval: '15m' };
    case '30': return { range: '1mo', interval: '1d' };
    case '90': return { range: '3mo', interval: '1d' };
    case '365': return { range: '1y', interval: '1d' };
    case 'max': return { range: 'max', interval: '1wk' };
    default: return { range: '3mo', interval: '1d' };
  }
}

export async function fetchYahooChart(
  symbol: string,
  days: string
): Promise<CoinGeckoMarketChart> {
  let { range, interval } = daysToYahooParams(days);
  let url = `${BASE_URL}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  let res = await deduplicatedFetch(url);
  if (!res.ok) {
    throw new Error(`Yahoo Finance API error: ${res.status} ${res.statusText}`);
  }
  let data: YahooChartResult = await res.json();
  let result = data.chart.result[0];

  // Futures (e.g. CL=F) return empty 1d data on weekends — fall back to 5d
  if (range === '1d' && (!result.timestamp || result.timestamp.length === 0)) {
    url = `${BASE_URL}/${encodeURIComponent(symbol)}?range=5d&interval=${interval}`;
    res = await deduplicatedFetch(url);
    if (!res.ok) {
      throw new Error(`Yahoo Finance API error: ${res.status} ${res.statusText}`);
    }
    data = await res.json();
    result = data.chart.result[0];
  }

  const timestamps = result.timestamp ?? [];
  const closes = result.indicators.quote[0].close;

  // Convert to CoinGeckoMarketChart format for compatibility
  const prices: [number, number][] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close != null) {
      prices.push([timestamps[i] * 1000, close]);
    }
  }

  return { prices, market_caps: [], total_volumes: [] };
}

export interface YahooPriceInfo {
  price: number;
  previousClose: number;
  history: { timestamp: number; close: number }[];
}

export async function fetchYahooPriceSummary(symbol: string): Promise<YahooPriceInfo> {
  const url = `${BASE_URL}/${encodeURIComponent(symbol)}?range=1mo&interval=1d`;
  const res = await deduplicatedFetch(url);
  if (!res.ok) {
    throw new Error(`Yahoo Finance API error: ${res.status} ${res.statusText}`);
  }
  const data: YahooChartResult = await res.json();
  const result = data.chart.result[0];
  const timestamps = result.timestamp;
  const closes = result.indicators.quote[0].close;

  const history: { timestamp: number; close: number }[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close != null) {
      history.push({ timestamp: timestamps[i], close });
    }
  }

  return {
    price: result.meta.regularMarketPrice,
    previousClose: result.meta.previousClose,
    history,
  };
}

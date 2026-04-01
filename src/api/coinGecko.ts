import type { CoinGeckoMarketChart, CoinGeckoPriceResponse } from '../types/api';
import type { CoinId } from '../types/coins';
import { electronFetch } from './electronFetch';

const BASE_URL = 'https://api.coingecko.com/api/v3';

function geckoHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;
  if (apiKey) {
    headers['x-cg-demo-api-key'] = apiKey;
  }
  return headers;
}

// Deduplicate in-flight requests to the same URL
const inflight = new Map<string, Promise<Response>>();

async function deduplicatedFetch(url: string, headers: Record<string, string>): Promise<Response> {
  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = fetchWithRetry(url, headers).finally(() => inflight.delete(url));
  inflight.set(url, promise);
  return promise;
}

async function fetchWithRetry(url: string, headers: Record<string, string>, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await electronFetch(url, { headers });
    if (res.status !== 429) return res;
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
  return electronFetch(url, { headers });
}

export async function fetchPriceData(
  coinId: CoinId,
  days: string
): Promise<CoinGeckoMarketChart> {
  const url = `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
  const res = await deduplicatedFetch(url, geckoHeaders());
  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchCryptoPrices(ids: string[]): Promise<CoinGeckoPriceResponse> {
  if (ids.length === 0) return {};
  const url = `${BASE_URL}/coins/markets?vs_currency=usd&ids=${ids.join(',')}&price_change_percentage=24h,7d,30d`;
  const res = await deduplicatedFetch(url, geckoHeaders());
  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }
  const items: Array<{
    id: string;
    current_price: number;
    price_change_percentage_24h_in_currency: number;
    price_change_percentage_7d_in_currency: number;
    price_change_percentage_30d_in_currency: number;
  }> = await res.json();

  const result: CoinGeckoPriceResponse = {};
  for (const item of items) {
    result[item.id] = {
      usd: item.current_price,
      usd_24h_change: item.price_change_percentage_24h_in_currency ?? 0,
      usd_7d_change: item.price_change_percentage_7d_in_currency ?? 0,
      usd_30d_change: item.price_change_percentage_30d_in_currency ?? 0,
    };
  }
  return result;
}

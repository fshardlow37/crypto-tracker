export interface CoinGeckoMarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface BGeometricsDataPoint {
  d: string;
  unixTs: string;
  [key: string]: string;
}

export interface CoinGeckoPriceData {
  usd: number;
  usd_24h_change: number;
  usd_7d_change: number;
  usd_30d_change: number;
}

export type CoinGeckoPriceResponse = Record<string, CoinGeckoPriceData>;

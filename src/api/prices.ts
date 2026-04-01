import type { CoinGeckoMarketChart, CoinGeckoPriceResponse } from '../types/api';
import type { CoinId } from '../types/coins';
import { COINS, COIN_LIST } from '../constants/coins';
import { fetchPriceData as fetchGeckoChart, fetchCryptoPrices } from './coinGecko';
import { fetchYahooChart, fetchYahooPriceSummary } from './yahooFinance';

export async function fetchChartData(
  assetId: CoinId,
  days: string
): Promise<CoinGeckoMarketChart> {
  const config = COINS[assetId];
  if (config.type === 'stock' && config.yahooSymbol) {
    return fetchYahooChart(config.yahooSymbol, days);
  }
  return fetchGeckoChart(assetId, days);
}

export async function fetchAllPrices(): Promise<CoinGeckoPriceResponse> {
  const cryptoIds = COIN_LIST.filter((id) => COINS[id].type === 'crypto');
  const stockIds = COIN_LIST.filter((id) => COINS[id].type === 'stock');

  const [cryptoPrices, ...stockResults] = await Promise.all([
    cryptoIds.length > 0 ? fetchCryptoPrices(cryptoIds) : Promise.resolve({}),
    ...stockIds.map(async (id) => {
      const config = COINS[id];
      if (!config.yahooSymbol) return { id, data: null };
      try {
        const info = await fetchYahooPriceSummary(config.yahooSymbol);
        return { id, data: info };
      } catch {
        return { id, data: null };
      }
    }),
  ]);

  const result: CoinGeckoPriceResponse = { ...cryptoPrices };

  for (const stock of stockResults) {
    if (!stock.data) continue;
    const { price, history } = stock.data;

    // Calculate % changes from history
    const now = history.length > 0 ? history[history.length - 1].close : price;
    const d1 = history.length >= 2 ? history[history.length - 2].close : now;
    const d7 = history.length >= 6 ? history[history.length - 6].close : d1;
    const d30 = history.length >= 1 ? history[0].close : d7;

    result[stock.id] = {
      usd: price,
      usd_24h_change: d1 ? ((now - d1) / d1) * 100 : 0,
      usd_7d_change: d7 ? ((now - d7) / d7) * 100 : 0,
      usd_30d_change: d30 ? ((now - d30) / d30) * 100 : 0,
    };
  }

  return result;
}

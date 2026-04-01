export type CoinId = 'bitcoin' | 'zcash' | 'usoil' | 'sp500' | 'nasdaq100' | 'csi300' | 'nikkei225' | 'euronext100' | 'ftse100';

export interface CoinConfig {
  id: CoinId;
  name: string;
  symbol: string;
  color: string;
  flag: string;
  type: 'crypto' | 'stock';
  geckoId?: string;
  yahooSymbol?: string;
}

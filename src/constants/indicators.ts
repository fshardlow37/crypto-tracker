import type { IndicatorConfig } from '../types/indicators';
import { IndicatorType } from '../types/indicators';

export const INDICATOR_CONFIGS: Record<IndicatorType, IndicatorConfig> = {
  [IndicatorType.MayerMultiple]: {
    type: IndicatorType.MayerMultiple,
    name: 'Mayer Multiple',
    color: '#FF9800',
    endpoint: '/v1/mayer-multiple',
    field: 'mayerMultiple',
    description: 'Price / 200-day MA. Values above 2.4 historically signal overheating.',
  },
  [IndicatorType.PuellMultiple]: {
    type: IndicatorType.PuellMultiple,
    name: 'Puell Multiple',
    color: '#00BCD4',
    endpoint: '/v1/puell-multiple',
    field: 'puellMultiple',
    description: 'Daily coin issuance value / 365-day MA of issuance value.',
  },
  [IndicatorType.NUPL]: {
    type: IndicatorType.NUPL,
    name: 'NUPL',
    color: '#4CAF50',
    endpoint: '/v1/nupl',
    field: 'nupl',
    description: 'Net Unrealized Profit/Loss. Ranges from -1 to 1.',
  },
  [IndicatorType.NVTSignal]: {
    type: IndicatorType.NVTSignal,
    name: 'NVT Signal',
    color: '#AB47BC',
    endpoint: '/v1/nvts',
    field: 'nvts',
    description: 'Network Value to Transactions Signal (smoothed NVT ratio).',
  },
  [IndicatorType.MVRVZScore]: {
    type: IndicatorType.MVRVZScore,
    name: 'MVRV Z-Score',
    color: '#FFD600',
    endpoint: '/v1/mvrv-z-score',
    field: 'mvrvZScore',
    description: 'Market Value to Realized Value Z-Score. High values suggest overvaluation.',
  },
};

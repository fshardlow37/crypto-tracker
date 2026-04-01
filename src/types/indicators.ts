export const IndicatorType = {
  MayerMultiple: 'mayer-multiple',
  PuellMultiple: 'puell-multiple',
  NUPL: 'nupl',
  NVTSignal: 'nvts',
  MVRVZScore: 'mvrv-z-score',
} as const;

export type IndicatorType = (typeof IndicatorType)[keyof typeof IndicatorType];

export interface IndicatorConfig {
  type: IndicatorType;
  name: string;
  color: string;
  endpoint: string;
  field: string;
  description: string;
}

export interface IndicatorDataPoint {
  time: number;
  value: number;
}

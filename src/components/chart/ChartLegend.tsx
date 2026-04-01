import { formatPrice, formatDate, formatIndicatorValue } from '../../utils/formatters';
import type { IndicatorType } from '../../types/indicators';
import type { CoinId } from '../../types/coins';
import { INDICATOR_CONFIGS } from '../../constants/indicators';
import FlagIcon from '../common/FlagIcon';

interface CoinLegendEntry {
  coinId: CoinId;
  symbol: string;
  flag: string;
  color: string;
  value?: number;
}

interface LegendData {
  time?: number;
  coins: CoinLegendEntry[];
  indicators: { type: IndicatorType; value?: number }[];
  isNormalized: boolean;
}

interface ChartLegendProps {
  data: LegendData;
  showTime: boolean;
}

function formatValue(value: number, isNormalized: boolean): string {
  if (isNormalized) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }
  return formatPrice(value);
}

export default function ChartLegend({ data, showTime }: ChartLegendProps) {
  if (!data.time) return null;

  return (
    <div className="chart-legend">
      <div className="legend-date">{formatDate(data.time, showTime)}</div>
      {data.coins.map(({ coinId, symbol, flag, color, value }) => (
        <div key={coinId} className="legend-indicator">
          <span className="legend-flag"><FlagIcon code={flag} size={9} /></span>
          <span className="legend-dot" style={{ backgroundColor: color }} />
          <span className="legend-indicator-name">{symbol}</span>
          <span className="legend-indicator-value">
            {value !== undefined ? formatValue(value, data.isNormalized) : '—'}
          </span>
        </div>
      ))}
      {data.indicators.map(({ type, value }) => {
        const config = INDICATOR_CONFIGS[type];
        return (
          <div key={type} className="legend-indicator">
            <span className="legend-dot" style={{ backgroundColor: config.color }} />
            <span className="legend-indicator-name">{config.name}</span>
            <span className="legend-indicator-value">
              {value !== undefined ? formatIndicatorValue(value) : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

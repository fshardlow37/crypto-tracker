import { useState, useCallback, useRef } from 'react';
import type { ISeriesApi, SeriesType } from 'lightweight-charts';
import type { TimeRange, ScaleMode } from '../../types/chart';
import type { CoinId } from '../../types/coins';
import type { IndicatorType } from '../../types/indicators';
import { IndicatorType as IndicatorTypeValues } from '../../types/indicators';
import { COINS, COIN_LIST } from '../../constants/coins';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useMultiPriceData } from '../../hooks/useMultiPriceData';
import { useAllCoinPrices } from '../../hooks/useAllCoinPrices';
import { formatPrice, formatPercentChange } from '../../utils/formatters';
import ChartContainer from '../chart/ChartContainer';
import PriceChart from '../chart/PriceChart';
import OverlaySeries from '../chart/OverlaySeries';
import IndicatorLayer from '../chart/IndicatorLayer';
import ChartLegend from '../chart/ChartLegend';
import TimeRangeSelector from '../controls/TimeRangeSelector';
import ScaleToggle from '../controls/ScaleToggle';
import IndicatorPanel from '../controls/IndicatorPanel';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const ALL_INDICATOR_TYPES = Object.values(IndicatorTypeValues);

function useIndicatorSet() {
  const [stored, setStored] = useLocalStorage<string[]>('activeIndicators', []);
  const set = new Set(stored as IndicatorType[]);
  const toggle = useCallback((type: IndicatorType) => {
    setStored((prev: string[]) => {
      const s = new Set(prev);
      if (s.has(type)) s.delete(type);
      else s.add(type);
      return [...s];
    });
  }, [setStored]);
  return { activeIndicators: set, toggleIndicator: toggle };
}

interface DetailViewProps {
  onBack: () => void;
}

export default function DetailView({ onBack }: DetailViewProps) {
  const [timeRange, setTimeRange] = useLocalStorage<TimeRange>('timeRange', '1Y');
  const [scaleMode, setScaleMode] = useLocalStorage<ScaleMode>('scaleMode', 'linear');
  const { activeIndicators, toggleIndicator } = useIndicatorSet();
  const [storedCoins, setStoredCoins] = useLocalStorage<string[]>('activeOverlayCoins', ['bitcoin']);

  const activeCoins = storedCoins.filter((id) => id in COINS) as CoinId[];
  if (activeCoins.length === 0) activeCoins.push('bitcoin');

  const isMulti = activeCoins.length > 1;
  const isBTCActive = activeCoins.includes('bitcoin');
  const showTime = timeRange === '1D' || timeRange === '1W';

  const toggleCoin = useCallback((coinId: CoinId) => {
    setStoredCoins((prev: string[]) => {
      const s = new Set(prev);
      if (s.has(coinId)) {
        if (s.size <= 1) return prev; // keep at least one
        s.delete(coinId);
      } else {
        s.add(coinId);
      }
      return [...s];
    });
  }, [setStoredCoins]);

  // Multi-coin data (normalized when >1 active)
  const { data: multiData, loading: priceLoading, error: priceError } = useMultiPriceData(activeCoins, timeRange);
  const { prices } = useAllCoinPrices();

  // Series refs for crosshair legend
  const coinSeriesMap = useRef<Map<CoinId, ISeriesApi<SeriesType>>>(new Map());
  const indicatorSeriesMap = useRef<Map<IndicatorType, ISeriesApi<SeriesType>>>(new Map());

  const [legendData, setLegendData] = useState<{
    time?: number;
    coins: { coinId: CoinId; symbol: string; flag: string; color: string; value?: number }[];
    indicators: { type: IndicatorType; value?: number }[];
    isNormalized: boolean;
  }>({ coins: [], indicators: [], isNormalized: false });

  const handleCrosshairMove = useCallback((param: { time?: number; seriesValues: Map<ISeriesApi<SeriesType>, number | undefined> }) => {
    const coins: { coinId: CoinId; symbol: string; flag: string; color: string; value?: number }[] = [];
    coinSeriesMap.current.forEach((series, coinId) => {
      const coin = COINS[coinId];
      coins.push({ coinId, symbol: coin.symbol, flag: coin.flag, color: coin.color, value: param.seriesValues.get(series) });
    });

    const indicators: { type: IndicatorType; value?: number }[] = [];
    indicatorSeriesMap.current.forEach((series, type) => {
      indicators.push({ type, value: param.seriesValues.get(series) });
    });

    setLegendData({ time: param.time, coins, indicators, isNormalized: isMulti });
  }, [isMulti]);

  const handleCoinSeriesReady = useCallback((coinId: CoinId, series: ISeriesApi<SeriesType>) => {
    coinSeriesMap.current.set(coinId, series);
  }, []);

  const handleCoinSeriesRemoved = useCallback((coinId: CoinId) => {
    coinSeriesMap.current.delete(coinId);
  }, []);

  const handleIndicatorSeriesReady = useCallback((type: IndicatorType, series: ISeriesApi<SeriesType>) => {
    indicatorSeriesMap.current.set(type, series);
  }, []);

  const handleIndicatorSeriesRemoved = useCallback((type: IndicatorType) => {
    indicatorSeriesMap.current.delete(type);
  }, []);

  const handleContextMenu = () => {
    window.electronAPI?.showContextMenu();
  };

  // Single-coin mode: show price for the sole active coin
  const singleCoin = !isMulti ? COINS[activeCoins[0]] : null;
  const singlePrice = singleCoin && prices ? prices[activeCoins[0]] : null;

  return (
    <div className="detail-view" onContextMenu={handleContextMenu}>
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>&larr;</button>
        <div className="coin-switcher">
          {COIN_LIST.map((id) => (
            <button
              key={id}
              className={`coin-switcher-btn ${activeCoins.includes(id) ? 'active' : ''}`}
              style={{ background: COINS[id].color, opacity: activeCoins.includes(id) ? 1 : 0.35 }}
              onClick={() => toggleCoin(id)}
              title={`${COINS[id].flag} ${COINS[id].symbol}`}
            />
          ))}
        </div>
        {singleCoin && (
          <>
            <span className="detail-symbol">{singleCoin.symbol}</span>
            {singlePrice && (
              <>
                <span className="detail-price">{formatPrice(singlePrice.usd)}</span>
                <span
                  className={`coin-change ${singlePrice.usd_24h_change >= 0 ? 'positive' : 'negative'}`}
                  style={{ opacity: Math.min(1, 0.35 + Math.abs(singlePrice.usd_24h_change) * 0.065) }}
                >
                  {formatPercentChange(singlePrice.usd_24h_change)}
                </span>
              </>
            )}
          </>
        )}
        {isMulti && (
          <span className="detail-symbol" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
            % CHANGE
          </span>
        )}
      </div>

      <div className="controls-bar">
        <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
        <ScaleToggle mode={scaleMode} onChange={setScaleMode} />
      </div>

      <div className="chart-area">
        {priceLoading && <LoadingSpinner />}
        {priceError && <ErrorMessage message={priceError} onRetry={() => setTimeRange(timeRange)} />}

        <ChartContainer scaleMode={scaleMode} percentMode={isMulti} onCrosshairMove={handleCrosshairMove}>
          {(chart) => (
            <>
              {isMulti ? (
                activeCoins.map((coinId) => (
                  <OverlaySeries
                    key={coinId}
                    chart={chart}
                    coinId={coinId}
                    data={multiData.get(coinId) ?? []}
                    color={COINS[coinId].color}
                    onSeriesReady={handleCoinSeriesReady}
                    onSeriesRemoved={handleCoinSeriesRemoved}
                  />
                ))
              ) : (
                <PriceChart
                  chart={chart}
                  data={multiData.get(activeCoins[0]) ?? []}
                  color={COINS[activeCoins[0]].color}
                  onSeriesReady={(series) => handleCoinSeriesReady(activeCoins[0], series)}
                />
              )}
              {isBTCActive &&
                ALL_INDICATOR_TYPES.map((type) => (
                  <IndicatorLayer
                    key={type}
                    chart={chart}
                    type={type}
                    timeRange={timeRange}
                    active={activeIndicators.has(type)}
                    onSeriesReady={handleIndicatorSeriesReady}
                    onSeriesRemoved={handleIndicatorSeriesRemoved}
                  />
                ))}
            </>
          )}
        </ChartContainer>

        <ChartLegend data={legendData} showTime={showTime} />
      </div>

      {isBTCActive && (
        <IndicatorPanel activeIndicators={activeIndicators} onToggle={toggleIndicator} />
      )}
    </div>
  );
}


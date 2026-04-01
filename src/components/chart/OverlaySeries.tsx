import { useEffect, useRef } from 'react';
import { LineSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, SeriesType, UTCTimestamp } from 'lightweight-charts';
import type { ChartDataPoint } from '../../types/chart';
import type { CoinId } from '../../types/coins';

interface OverlaySeriesProps {
  chart: IChartApi;
  coinId: CoinId;
  data: ChartDataPoint[];
  color: string;
  onSeriesReady?: (coinId: CoinId, series: ISeriesApi<SeriesType>) => void;
  onSeriesRemoved?: (coinId: CoinId) => void;
}

export default function OverlaySeries({
  chart,
  coinId,
  data,
  color,
  onSeriesReady,
  onSeriesRemoved,
}: OverlaySeriesProps) {
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);

  useEffect(() => {
    const series = chart.addSeries(LineSeries, {
      color,
      lineWidth: 2,
      priceScaleId: 'right',
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });
    seriesRef.current = series;
    onSeriesReady?.(coinId, series);

    return () => {
      try {
        chart.removeSeries(series);
      } catch {
        /* chart may be disposed */
      }
      seriesRef.current = null;
      onSeriesRemoved?.(coinId);
    };
  }, [chart, coinId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(
        data.map((d) => ({ time: d.time as UTCTimestamp, value: d.value })),
      );
      chart.timeScale().fitContent();
    }
  }, [data, chart]);

  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.applyOptions({ color });
    }
  }, [color]);

  return null;
}

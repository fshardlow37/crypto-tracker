import { useEffect, useRef } from 'react';
import { AreaSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, SeriesType, UTCTimestamp } from 'lightweight-charts';
import type { ChartDataPoint } from '../../types/chart';

interface PriceChartProps {
  chart: IChartApi;
  data: ChartDataPoint[];
  color: string;
  onSeriesReady?: (series: ISeriesApi<SeriesType>) => void;
}

export default function PriceChart({ chart, data, color, onSeriesReady }: PriceChartProps) {
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);

  useEffect(() => {
    const series = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: color + '40',
      bottomColor: color + '05',
      lineWidth: 2,
      priceScaleId: 'right',
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
    });
    seriesRef.current = series;
    onSeriesReady?.(series);

    return () => {
      try { chart.removeSeries(series); } catch { /* chart may be disposed */ }
      seriesRef.current = null;
    };
  }, [chart]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data.map(d => ({ time: d.time as UTCTimestamp, value: d.value })));
      chart.timeScale().fitContent();
    }
  }, [data, chart]);

  useEffect(() => {
    if (seriesRef.current) {
      seriesRef.current.applyOptions({
        lineColor: color,
        topColor: color + '40',
        bottomColor: color + '05',
      });
    }
  }, [color]);

  return null;
}

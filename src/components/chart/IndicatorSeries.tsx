import { useEffect, useRef } from 'react';
import { LineSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, SeriesType, UTCTimestamp } from 'lightweight-charts';
import type { IndicatorDataPoint } from '../../types/indicators';
import { IndicatorType } from '../../types/indicators';
import { INDICATOR_CONFIGS } from '../../constants/indicators';

interface IndicatorSeriesProps {
  chart: IChartApi;
  type: IndicatorType;
  data: IndicatorDataPoint[];
  onSeriesReady?: (type: IndicatorType, series: ISeriesApi<SeriesType>) => void;
  onSeriesRemoved?: (type: IndicatorType) => void;
}

export default function IndicatorSeries({ chart, type, data, onSeriesReady, onSeriesRemoved }: IndicatorSeriesProps) {
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const config = INDICATOR_CONFIGS[type];

  useEffect(() => {
    const series = chart.addSeries(LineSeries, {
      color: config.color,
      lineWidth: 2,
      priceScaleId: `indicator-${type}`,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 3,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chart.priceScale(`indicator-${type}`).applyOptions({
      visible: false,
      scaleMargins: { top: 0.1, bottom: 0.1 },
    });

    seriesRef.current = series;
    onSeriesReady?.(type, series);

    return () => {
      onSeriesRemoved?.(type);
      try { chart.removeSeries(series); } catch { /* chart may be disposed */ }
      seriesRef.current = null;
    };
  }, [chart, type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data.map(d => ({ time: d.time as UTCTimestamp, value: d.value })));
    }
  }, [data]);

  return null;
}

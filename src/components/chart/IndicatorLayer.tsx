import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';
import type { IndicatorType } from '../../types/indicators';
import type { TimeRange } from '../../types/chart';
import { useIndicatorData } from '../../hooks/useIndicatorData';
import IndicatorSeries from './IndicatorSeries';

interface IndicatorLayerProps {
  chart: IChartApi;
  type: IndicatorType;
  timeRange: TimeRange;
  active: boolean;
  onSeriesReady: (type: IndicatorType, series: ISeriesApi<SeriesType>) => void;
  onSeriesRemoved: (type: IndicatorType) => void;
}

export default function IndicatorLayer({ chart, type, timeRange, active, onSeriesReady, onSeriesRemoved }: IndicatorLayerProps) {
  const { data } = useIndicatorData(type, timeRange, active);

  if (!active) return null;

  return (
    <IndicatorSeries
      chart={chart}
      type={type}
      data={data}
      onSeriesReady={onSeriesReady}
      onSeriesRemoved={onSeriesRemoved}
    />
  );
}

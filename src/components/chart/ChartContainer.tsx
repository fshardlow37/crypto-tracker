import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  PriceScaleMode,
  CrosshairMode,
} from 'lightweight-charts';
import type {
  IChartApi,
  DeepPartial,
  ChartOptions,
  ISeriesApi,
  SeriesType,
} from 'lightweight-charts';
import type { ScaleMode } from '../../types/chart';

interface ChartContainerProps {
  scaleMode: ScaleMode;
  percentMode?: boolean;
  children: (chart: IChartApi) => React.ReactNode;
  onCrosshairMove?: (param: { time?: number; seriesValues: Map<ISeriesApi<SeriesType>, number | undefined> }) => void;
}

const CHART_OPTIONS: DeepPartial<ChartOptions> = {
  layout: {
    background: { color: '#0d1117' },
    textColor: '#8b949e',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontSize: 11,
  },
  grid: {
    vertLines: { color: 'rgba(48,54,61,0.5)' },
    horzLines: { color: 'rgba(48,54,61,0.5)' },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
  rightPriceScale: {
    borderColor: '#30363d',
    scaleMargins: { top: 0.1, bottom: 0.1 },
  },
  timeScale: {
    borderColor: '#30363d',
    timeVisible: true,
    secondsVisible: false,
  },
  handleScroll: { vertTouchDrag: false },
};

export default function ChartContainer({ scaleMode, percentMode, children, onCrosshairMove }: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);

  const crosshairCbRef = useRef(onCrosshairMove);
  crosshairCbRef.current = onCrosshairMove;

  const getChart = useCallback(() => chart, [chart]);

  useEffect(() => {
    if (!containerRef.current) return;

    const c = createChart(containerRef.current, {
      ...CHART_OPTIONS,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    c.subscribeCrosshairMove((param) => {
      if (!crosshairCbRef.current) return;
      const seriesValues = new Map<ISeriesApi<SeriesType>, number | undefined>();
      if (param.seriesData) {
        param.seriesData.forEach((data, series) => {
          const val = 'value' in data ? (data as { value: number }).value : 'close' in data ? (data as { close: number }).close : undefined;
          seriesValues.set(series, val);
        });
      }
      crosshairCbRef.current({
        time: param.time as number | undefined,
        seriesValues,
      });
    });

    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        c.applyOptions({ width, height });
      }
    });
    ro.observe(el);

    setChart(c);

    return () => {
      ro.disconnect();
      c.remove();
      setChart(null);
    };
  }, []);

  useEffect(() => {
    const c = getChart();
    if (!c) return;
    c.applyOptions({
      rightPriceScale: {
        mode: scaleMode === 'logarithmic' ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
      },
      localization: percentMode
        ? { priceFormatter: (price: number) => `${price >= 0 ? '+' : ''}${price.toFixed(1)}%` }
        : { priceFormatter: undefined as unknown as (price: number) => string },
    });
  }, [scaleMode, percentMode, getChart]);

  return (
    <div className="chart-wrapper">
      <div ref={containerRef} className="chart-container" />
      {chart && children(chart)}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { COINS, COIN_LIST } from '../../constants/coins';
import { useAllCoinPrices } from '../../hooks/useAllCoinPrices';
import { useSparklineData } from '../../hooks/useSparklineData';
import { formatPrice, formatPercentChange } from '../../utils/formatters';
import FlagIcon from '../common/FlagIcon';
import Sparkline from './Sparkline';

interface ListViewProps {
  onSelectCoin: () => void;
}

function changeIntensity(value: number): number {
  return Math.min(1, 0.35 + Math.abs(value) * 0.065);
}

function useFlash(value: unknown): boolean {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prev.current !== value && value != null) {
      prev.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [value]);
  return flash;
}

function PriceCell({ value, loading }: { value: number | undefined; loading: boolean }) {
  const flash = useFlash(value);
  if (loading) return <span className="skeleton" />;
  if (value == null) return <span>—</span>;
  return (
    <span className={`coin-price-value${flash ? ' flash' : ''}`}>
      {formatPrice(value)}
    </span>
  );
}

function ChangeCell({ value, loading }: { value: number | undefined; loading: boolean }) {
  const flash = useFlash(value);
  if (loading) return <span className="skeleton skeleton-sm" />;
  if (value == null) return <span>—</span>;
  const isPositive = value >= 0;
  return (
    <span
      className={`coin-change ${isPositive ? 'positive' : 'negative'}${flash ? ' flash' : ''}`}
      style={{ opacity: changeIntensity(value) }}
    >
      {formatPercentChange(value)}
    </span>
  );
}

export default function ListView({ onSelectCoin }: ListViewProps) {
  const { prices, loading: pricesLoading } = useAllCoinPrices();
  const { sparklines, loading: sparklinesLoading } = useSparklineData();

  const loading = pricesLoading && !prices;

  const handleContextMenu = () => {
    window.electronAPI?.showContextMenu();
  };

  return (
    <div className="list-view" onContextMenu={handleContextMenu}>
      <div className="list-header">
        <span className="lh-name" />
        <span className="lh-price">PRICE</span>
        <span className="lh-chg">30D</span>
        <span className="lh-chg">7D</span>
        <span className="lh-chg">24H</span>
        <span className="lh-spark" />
      </div>
      <div className="list-rows">
      {COIN_LIST.map((coinId) => {
        const coin = COINS[coinId];
        const priceData = prices?.[coinId];
        const sparkData = sparklines?.[coinId];

        return (
          <button
            key={coinId}
            className="coin-row"
            onClick={() => onSelectCoin()}
          >
            <span className="coin-flag"><FlagIcon code={coin.flag} size={10} /></span>
            <span className="coin-symbol">{coin.symbol}</span>
            <span className="coin-price">
              <PriceCell value={priceData?.usd} loading={loading} />
            </span>
            <ChangeCell value={priceData?.usd_30d_change} loading={loading} />
            <ChangeCell value={priceData?.usd_7d_change} loading={loading} />
            <ChangeCell value={priceData?.usd_24h_change} loading={loading} />
            <span className="coin-sparkline">
              {!sparklinesLoading && sparkData && (
                <Sparkline data={sparkData} color={coin.color} />
              )}
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}

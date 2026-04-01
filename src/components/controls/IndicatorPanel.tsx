import { IndicatorType } from '../../types/indicators';
import IndicatorToggle from './IndicatorToggle';

const INDICATORS = Object.values(IndicatorType);

interface IndicatorPanelProps {
  activeIndicators: Set<IndicatorType>;
  onToggle: (type: IndicatorType) => void;
}

export default function IndicatorPanel({ activeIndicators, onToggle }: IndicatorPanelProps) {
  return (
    <div className="indicator-panel">
      <span className="indicator-panel-label">Indicators</span>
      <div className="indicator-toggles">
        {INDICATORS.map((type) => (
          <IndicatorToggle
            key={type}
            type={type}
            active={activeIndicators.has(type)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

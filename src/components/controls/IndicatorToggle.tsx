import type { IndicatorType } from '../../types/indicators';
import { INDICATOR_CONFIGS } from '../../constants/indicators';

interface IndicatorToggleProps {
  type: IndicatorType;
  active: boolean;
  onToggle: (type: IndicatorType) => void;
}

export default function IndicatorToggle({ type, active, onToggle }: IndicatorToggleProps) {
  const config = INDICATOR_CONFIGS[type];

  return (
    <button
      className={`indicator-toggle ${active ? 'active' : ''}`}
      onClick={() => onToggle(type)}
      title={config.description}
    >
      <span
        className="indicator-color"
        style={{ backgroundColor: active ? config.color : 'var(--text-muted)' }}
      />
      <span className="indicator-name">{config.name}</span>
    </button>
  );
}

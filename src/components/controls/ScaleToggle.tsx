import type { ScaleMode } from '../../types/chart';

interface ScaleToggleProps {
  mode: ScaleMode;
  onChange: (mode: ScaleMode) => void;
}

export default function ScaleToggle({ mode, onChange }: ScaleToggleProps) {
  return (
    <div className="btn-group">
      <button
        className={`btn-toggle ${mode === 'linear' ? 'active' : ''}`}
        onClick={() => onChange('linear')}
      >
        Linear
      </button>
      <button
        className={`btn-toggle ${mode === 'logarithmic' ? 'active' : ''}`}
        onClick={() => onChange('logarithmic')}
      >
        Log
      </button>
    </div>
  );
}

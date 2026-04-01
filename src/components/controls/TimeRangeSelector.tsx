import type { TimeRange } from '../../types/chart';
import { TIME_RANGE_LIST } from '../../constants/timeRanges';

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="btn-group">
      {TIME_RANGE_LIST.map((range) => (
        <button
          key={range}
          className={`btn-toggle ${selected === range ? 'active' : ''}`}
          onClick={() => onChange(range)}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

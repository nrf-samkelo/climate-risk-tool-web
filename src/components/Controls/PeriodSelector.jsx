import { useClimate } from '../../context/ClimateContext';
import { PERIODS } from '../../utils/constants';

/**
 * PeriodSelector - Dropdown to select time period
 * Uses ClimateContext for state management
 * Uses PERIODS constant (can be enhanced to fetch from API)
 */
const PeriodSelector = () => {
  const { period, setPeriod } = useClimate();

  const handleChange = (e) => {
    setPeriod(e.target.value);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="period-select"
        className="text-xs font-medium"
        style={{ color: '#475569' }}
      >
        Time Period
      </label>
      <select
        id="period-select"
        value={period}
        onChange={handleChange}
        className="nice-select"
      >
        {PERIODS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Show start-end years for selected period */}
      <p className="text-[10px] italic" style={{ color: '#64748b' }}>
        {PERIODS.find(p => p.value === period)?.start} - {PERIODS.find(p => p.value === period)?.end}
      </p>
    </div>
  );
};

export default PeriodSelector;

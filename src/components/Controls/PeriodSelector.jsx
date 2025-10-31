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
    <div className="flex flex-col gap-2">
      <label
        htmlFor="period-select"
        className="text-sm font-semibold text-gray-700"
      >
        Time Period
      </label>
      <select
        id="period-select"
        value={period}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
      >
        {PERIODS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Show start-end years for selected period */}
      <p className="text-xs text-gray-500 italic">
        {PERIODS.find(p => p.value === period)?.start} - {PERIODS.find(p => p.value === period)?.end}
      </p>
    </div>
  );
};

export default PeriodSelector;

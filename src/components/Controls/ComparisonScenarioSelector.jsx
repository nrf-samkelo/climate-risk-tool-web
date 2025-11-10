import { useClimate } from '../../context/ClimateContext';
import { SCENARIOS } from '../../utils/constants';

/**
 * ComparisonScenarioSelector - Scenario B selector for comparison mode
 * Only visible when comparison mode is active
 */
const ComparisonScenarioSelector = () => {
  const { comparisonScenario, setComparisonScenario } = useClimate();

  const handleChange = (e) => {
    setComparisonScenario(e.target.value);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="comparison-scenario-select"
        className="text-xs font-medium"
        style={{ color: '#475569' }}
      >
        Scenario B (Comparison)
      </label>
      <select
        id="comparison-scenario-select"
        value={comparisonScenario}
        onChange={handleChange}
        className="nice-select"
      >
        {SCENARIOS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Show description for selected scenario */}
      <p className="text-[10px] italic" style={{ color: '#64748b' }}>
        {SCENARIOS.find(s => s.value === comparisonScenario)?.description}
      </p>
    </div>
  );
};

export default ComparisonScenarioSelector;

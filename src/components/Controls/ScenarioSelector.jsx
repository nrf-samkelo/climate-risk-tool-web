import { useClimate } from '../../context/ClimateContext';
import { SCENARIOS } from '../../utils/constants';

/**
 * ScenarioSelector - Dropdown to select SSP scenario
 * Uses ClimateContext for state management
 * Uses SCENARIOS constant (can be enhanced to fetch from API)
 */
const ScenarioSelector = () => {
  const { scenario, setScenario } = useClimate();

  const handleChange = (e) => {
    setScenario(e.target.value);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="scenario-select"
        className="text-xs font-medium"
        style={{ color: '#475569' }}
      >
        Emission Scenario
      </label>
      <select
        id="scenario-select"
        value={scenario}
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
        {SCENARIOS.find(s => s.value === scenario)?.description}
      </p>
    </div>
  );
};

export default ScenarioSelector;

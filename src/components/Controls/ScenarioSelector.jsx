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
    <div className="flex flex-col gap-2">
      <label
        htmlFor="scenario-select"
        className="text-sm font-semibold text-gray-700"
      >
        Emission Scenario
      </label>
      <select
        id="scenario-select"
        value={scenario}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
      >
        {SCENARIOS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Show description for selected scenario */}
      <p className="text-xs text-gray-500 italic">
        {SCENARIOS.find(s => s.value === scenario)?.description}
      </p>
    </div>
  );
};

export default ScenarioSelector;

import { useClimate } from '../../context/ClimateContext';
import { SCENARIOS } from '../../utils/constants';

/**
 * ComparisonToggle - Toggle side-by-side scenario comparison mode
 * Uses ClimateContext comparisonMode and comparisonScenario
 */
const ComparisonToggle = () => {
  const {
    scenario,
    comparisonMode,
    setComparisonMode,
    comparisonScenario,
    setComparisonScenario,
  } = useClimate();

  const handleToggle = () => {
    if (!comparisonMode) {
      // Entering comparison mode - set default comparison scenario
      // Choose a different scenario than current
      const otherScenario = SCENARIOS.find(s => s.value !== scenario);
      if (otherScenario) {
        setComparisonScenario(otherScenario.value);
      }
    }
    setComparisonMode(!comparisonMode);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">
        Scenario Comparison
      </label>

      <button
        onClick={handleToggle}
        className={`px-4 py-3 rounded-lg font-medium transition-all shadow-sm ${
          comparisonMode
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {comparisonMode ? (
              // Split view icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 4v16m6-16v16M3 8h18M3 16h18"
              />
            ) : (
              // Single view icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
              />
            )}
          </svg>
          <span>
            {comparisonMode ? 'Exit Comparison' : 'Compare Scenarios'}
          </span>
        </div>
      </button>

      {comparisonMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800">
          <p className="font-semibold mb-1">Comparison Mode Active</p>
          <p>
            Comparing <span className="font-mono font-bold">{scenario}</span> with{' '}
            <span className="font-mono font-bold">{comparisonScenario}</span>
          </p>
          <p className="mt-1 text-blue-600 italic">
            Period and index are synchronized between both maps
          </p>
        </div>
      )}
    </div>
  );
};

export default ComparisonToggle;

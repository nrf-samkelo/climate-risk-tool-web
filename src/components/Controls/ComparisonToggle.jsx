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
        Comparison Mode
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
              // Single view icon (to exit)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
              />
            ) : (
              // Split view icon (to enter)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 4v16m6-16v16M3 8h18M3 16h18"
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
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">
              Period &amp; Index synchronized
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonToggle;

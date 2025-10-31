import { useEffect } from 'react';
import { ClimateProvider, useClimate } from './context/ClimateContext';
import { IndicesProvider } from './context/IndicesContext';

// Components
import Map from './components/Map/Map';
import ClimateLayer from './components/Map/ClimateLayer';
import Legend from './components/Legend/Legend';
import InfoPanel from './components/InfoPanel/InfoPanel';
import ScenarioSelector from './components/Controls/ScenarioSelector';
import PeriodSelector from './components/Controls/PeriodSelector';
import IndexSelector from './components/Controls/IndexSelector';
import DistrictView from './components/Controls/DistrictView';
import ComparisonToggle from './components/Controls/ComparisonToggle';
import TimeSeriesPlayer from './components/Controls/TimeSeriesPlayer';
import ComparisonView from './components/Compare/ComparisonView';

/**
 * Main application layout
 */
function AppContent() {
  const { comparisonMode, fetchClimateData, scenario, period, index } = useClimate();

  // Fetch initial climate data on mount and when config changes
  useEffect(() => {
    fetchClimateData();
  }, [scenario, period, index, fetchClimateData]);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between z-50">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Climate Risk Tool
          </h1>
          <p className="text-sm text-gray-600">
            South African Municipalities - Climate Projections
          </p>
        </div>
        {comparisonMode && (
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
            Comparison Mode Active
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Controls */}
        {!comparisonMode && (
          <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-4">
            <ScenarioSelector />
            <div className="border-t border-gray-200 pt-4">
              <PeriodSelector />
            </div>
            <div className="border-t border-gray-200 pt-4">
              <IndexSelector />
            </div>
            <div className="border-t border-gray-200 pt-4">
              <DistrictView />
            </div>
            <div className="border-t border-gray-200 pt-4">
              <ComparisonToggle />
            </div>
          </aside>
        )}

        {/* Map Container */}
        <main className="flex-1 relative">
          {comparisonMode ? (
            <ComparisonView />
          ) : (
            <>
              <Map>
                <ClimateLayer />
              </Map>
              <Legend />
              <InfoPanel />
              <TimeSeriesPlayer />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * App root with context providers
 */
function App() {
  return (
    <ClimateProvider>
      <IndicesProvider>
        <AppContent />
      </IndicesProvider>
    </ClimateProvider>
  );
}

export default App;

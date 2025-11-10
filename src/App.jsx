import { useEffect, useRef, useState } from 'react';
import { ClimateProvider, useClimate } from './context/ClimateContext';
import { IndicesProvider } from './context/IndicesContext';
import { SA_BOUNDS } from './utils/constants';

// Components
import Map from './components/Map/Map';
import ClimateLayer from './components/Map/ClimateLayer';
import Legend from './components/Legend/Legend';
import InfoPanel from './components/InfoPanel/InfoPanel';
import ScenarioSelector from './components/Controls/ScenarioSelector';
import PeriodSelector from './components/Controls/PeriodSelector';
import IndexSelector from './components/Controls/IndexSelector';
import ComparisonToggle from './components/Controls/ComparisonToggle';
import ComparisonScenarioSelector from './components/Controls/ComparisonScenarioSelector';
import ComparisonView from './components/Compare/ComparisonView';
import MunicipalitySearch from './components/Controls/MunicipalitySearch';

/**
 * Main application layout
 */
function AppContent() {
  const { comparisonMode, fetchClimateData, scenario, period, index } = useClimate();
  const [mapInstance, setMapInstance] = useState(null);

  // Fetch initial climate data on mount and when config changes
  useEffect(() => {
    fetchClimateData();
  }, [scenario, period, index, fetchClimateData]);

  // Handle municipality selection - zoom to municipality
  const handleMunicipalitySelect = (municipality) => {
    if (!mapInstance) return;

    // If no municipality (cleared search), zoom back to SA bounds
    if (!municipality) {
      mapInstance.fitBounds(SA_BOUNDS, {
        duration: 0.6,
      });
      return;
    }

    // Zoom to municipality bounds
    if (municipality.bbox) {
      const [[minx, miny], [maxx, maxy]] = [
        [municipality.bbox[0], municipality.bbox[1]],
        [municipality.bbox[2], municipality.bbox[3]],
      ];

      mapInstance.fitBounds(
        [
          [miny, minx],
          [maxy, maxx],
        ],
        {
          padding: [32, 32],
          duration: 0.6,
        }
      );
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between z-50" style={{ background: '#0f172a', color: '#fff' }}>
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '0.2px' }}>
            Climate Risk Tool
          </h1>
          <p className="text-xs opacity-80">
            South African Municipalities - Climate Projections
          </p>
        </div>
        {comparisonMode && (
          <div className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
            Comparison Mode Active
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Controls (Always visible, adapts to comparison mode) */}
        <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto p-3 space-y-3">
          <MunicipalitySearch onSelect={handleMunicipalitySelect} />
          <div className="border-t border-gray-200 pt-3">
            <ScenarioSelector />
          </div>
          {comparisonMode && (
            <div className="border-t border-gray-200 pt-3">
              <ComparisonScenarioSelector />
            </div>
          )}
          <div className="border-t border-gray-200 pt-3">
            <PeriodSelector />
          </div>
          <div className="border-t border-gray-200 pt-3">
            <IndexSelector />
          </div>
          <div className="border-t border-gray-200 pt-3">
            <ComparisonToggle />
          </div>
        </aside>

        {/* Map Container */}
        <main className="flex-1 relative">
          {comparisonMode ? (
            <ComparisonView />
          ) : (
            <>
              <Map onMapReady={setMapInstance}>
                <ClimateLayer />
              </Map>
              <Legend />
              <InfoPanel />
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

import { useEffect, useRef, useState, useCallback } from 'react';
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
import DataAttribution from './components/Common/DataAttribution';

/**
 * Main application layout
 */
function AppContent() {
  const { comparisonMode, fetchClimateData, scenario, period, index } = useClimate();
  const [mapInstance, setMapInstance] = useState(null);
  const [comparisonMaps, setComparisonMaps] = useState(null);
  const [searchHighlightedMunicipalityId, setSearchHighlightedMunicipalityId] = useState(null);

  // Fetch initial climate data on mount and when config changes
  useEffect(() => {
    fetchClimateData();
  }, [scenario, period, index, fetchClimateData]);

  // Callback to receive comparison map instances
  const handleComparisonMapsReady = useCallback((maps) => {
    setComparisonMaps(maps);
  }, []);

  // Handle municipality selection - zoom to municipality
  const handleMunicipalitySelect = (municipality) => {
    // Update search highlight
    setSearchHighlightedMunicipalityId(municipality?.id || null);

    // In comparison mode, zoom both maps
    if (comparisonMode && comparisonMaps) {
      const { mapA, mapB } = comparisonMaps;

      // If no municipality (cleared search), zoom back to SA bounds
      if (!municipality) {
        mapA.fitBounds(SA_BOUNDS, { duration: 0.6 });
        mapB.fitBounds(SA_BOUNDS, { duration: 0.6 });
        return;
      }

      // Zoom to municipality bounds
      if (municipality.bbox) {
        const [[minx, miny], [maxx, maxy]] = [
          [municipality.bbox[0], municipality.bbox[1]],
          [municipality.bbox[2], municipality.bbox[3]],
        ];

        const bounds = [
          [miny, minx],
          [maxy, maxx],
        ];

        mapA.fitBounds(bounds, { padding: [32, 32], duration: 0.6 });
        mapB.fitBounds(bounds, { padding: [32, 32], duration: 0.6 });
      }
      return;
    }

    // In single view mode, zoom single map
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
            Downscaled Climate Projections • South African Municipalities
          </p>
        </div>
        {/* SAEON & NRF Logo */}
        <div className="flex items-center">
          <img
            src="/climate-tool/saeon.svg"
            alt="SAEON - South African Environmental Observation Network & NRF"
            className="h-10 object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Controls (Always visible, adapts to comparison mode) */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
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
          </div>
          {/* Data Attribution Footer */}
          <DataAttribution variant="full" />
        </aside>

        {/* Map Container */}
        <main className="flex-1 relative">
          {comparisonMode ? (
            <ComparisonView
              onMapsReady={handleComparisonMapsReady}
              searchHighlightedMunicipalityId={searchHighlightedMunicipalityId}
            />
          ) : (
            <>
              <Map onMapReady={setMapInstance}>
                <ClimateLayer searchHighlightedMunicipalityId={searchHighlightedMunicipalityId} />
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

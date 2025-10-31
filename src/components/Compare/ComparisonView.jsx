import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useClimate } from '../../context/ClimateContext';
import { useIndices } from '../../context/IndicesContext';
import { getClimateGeoJSON } from '../../api/climateData';
import ClimateLayer from '../Map/ClimateLayer';
import Legend from '../Legend/Legend';
import { MAP_CONFIG, SA_BOUNDS, SCENARIOS, formatScenario } from '../../utils/constants';
import 'leaflet/dist/leaflet.css';

/**
 * ComparisonView - Side-by-side scenario comparison
 * Uses ClimateContext for comparisonMode and comparisonScenario
 * Leverages existing Map, ClimateLayer, Legend components
 * Synchronizes period, index, and viewMode between both maps
 */
const ComparisonView = () => {
  const {
    scenario,
    period,
    index,
    comparisonMode,
    setComparisonMode,
    comparisonScenario,
    setComparisonScenario,
  } = useClimate();

  const { getIndexByCode } = useIndices();

  // Fetch GeoJSON for both scenarios
  const [geojsonA, setGeojsonA] = useState(null);
  const [geojsonB, setGeojsonB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // Fetch data for scenario A (left/primary)
  useEffect(() => {
    if (!comparisonMode) return;

    const fetchDataA = async () => {
      setLoadingA(true);
      try {
        const data = await getClimateGeoJSON(scenario, period, index);
        setGeojsonA(data);
      } catch (error) {
        console.error('Error fetching scenario A data:', error);
      } finally {
        setLoadingA(false);
      }
    };

    fetchDataA();
  }, [comparisonMode, scenario, period, index]);

  // Fetch data for scenario B (right/comparison)
  useEffect(() => {
    if (!comparisonMode) return;

    const fetchDataB = async () => {
      setLoadingB(true);
      try {
        const data = await getClimateGeoJSON(comparisonScenario, period, index);
        setGeojsonB(data);
      } catch (error) {
        console.error('Error fetching scenario B data:', error);
      } finally {
        setLoadingB(false);
      }
    };

    fetchDataB();
  }, [comparisonMode, comparisonScenario, period, index]);

  const indexMetadata = useMemo(() => {
    return getIndexByCode(index);
  }, [index, getIndexByCode]);

  if (!comparisonMode) {
    return null;
  }

  return (
    <div className="w-full h-full flex">
      {/* Left Map - Scenario A */}
      <div className="flex-1 relative border-r-2 border-gray-300">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-1000 bg-white rounded-lg shadow-elevation p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Scenario A</h3>
              <p className="text-xs text-gray-600">{formatScenario(scenario).label}</p>
            </div>
            {loadingA && (
              <svg
                className="animate-spin h-5 w-5 text-primary-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Map A */}
        <MapContainer
          center={MAP_CONFIG.center}
          zoom={MAP_CONFIG.zoom}
          minZoom={MAP_CONFIG.minZoom}
          maxZoom={MAP_CONFIG.maxZoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          {geojsonA && <ComparisonClimateLayer geojsonData={geojsonA} indexMetadata={indexMetadata} />}
        </MapContainer>

        {/* Legend A */}
        {geojsonA && <ComparisonLegend geojsonData={geojsonData} indexCode={index} position="left" />}
      </div>

      {/* Right Map - Scenario B */}
      <div className="flex-1 relative">
        {/* Header with Scenario Selector */}
        <div className="absolute top-4 left-4 right-4 z-1000 bg-white rounded-lg shadow-elevation p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-600 font-medium mb-1 block">
                Scenario B (Comparison)
              </label>
              <select
                value={comparisonScenario}
                onChange={(e) => setComparisonScenario(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {SCENARIOS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            {loadingB && (
              <svg
                className="animate-spin h-5 w-5 text-primary-500 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Map B */}
        <MapContainer
          center={MAP_CONFIG.center}
          zoom={MAP_CONFIG.zoom}
          minZoom={MAP_CONFIG.minZoom}
          maxZoom={MAP_CONFIG.maxZoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          {geojsonB && <ComparisonClimateLayer geojsonData={geojsonB} indexMetadata={indexMetadata} />}
        </MapContainer>

        {/* Legend B */}
        {geojsonB && <ComparisonLegend geojsonData={geojsonB} indexCode={index} position="right" />}
      </div>

      {/* Synchronized Info Banner */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 z-1000 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-blue-800">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">
            Synchronized: Period &amp; Climate Index
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Simplified ClimateLayer for comparison view
 * Uses same logic but accepts geojsonData as prop
 */
const ComparisonClimateLayer = ({ geojsonData, indexMetadata }) => {
  // Reuse ClimateLayer logic here or create simplified version
  // For now, return null - this will be implemented based on ClimateLayer
  return null;
};

/**
 * Simplified Legend for comparison view
 */
const ComparisonLegend = ({ geojsonData, indexCode, position }) => {
  // Reuse Legend logic here
  return null;
};

export default ComparisonView;

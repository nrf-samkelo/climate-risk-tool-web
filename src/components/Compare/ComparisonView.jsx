import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useClimate } from '../../context/ClimateContext';
import { useIndices } from '../../context/IndicesContext';
import { getClimateGeoJSON } from '../../api/climateData';
import {
  getColorScale,
  getColorForValue,
  extractValuesFromGeoJSON,
  generateLegendItems,
  getInterpretationLabels,
  calculateStatistics,
} from '../../utils/colorMapping';
import SectorTags from '../Common/SectorTags';
import { MAP_CONFIG, SCENARIOS, formatScenario, formatPeriod, DEFAULT_STYLE, HOVER_STYLE } from '../../utils/constants';
import 'leaflet/dist/leaflet.css';

/**
 * ComparisonView - Side-by-side scenario comparison
 * Uses ClimateContext for comparisonMode and comparisonScenario
 * Leverages existing Map, ClimateLayer, Legend components
 * Synchronizes period and index between both maps
 */
const ComparisonView = ({ onMapsReady, searchHighlightedMunicipalityId = null }) => {
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

  // Map instances for synchronization
  const [mapA, setMapA] = useState(null);
  const [mapB, setMapB] = useState(null);

  // Selected municipality for comparison
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);

  // Refs to track ongoing fetches and prevent duplicates
  const fetchingA = useRef(false);
  const fetchingB = useRef(false);

  // Notify parent when both maps are ready
  useEffect(() => {
    if (mapA && mapB && onMapsReady) {
      onMapsReady({ mapA, mapB });
    }
  }, [mapA, mapB, onMapsReady]);

  // Fetch GeoJSON for both scenarios
  const [geojsonA, setGeojsonA] = useState(null);
  const [geojsonB, setGeojsonB] = useState(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // Fetch data for scenario A (left/primary)
  useEffect(() => {
    if (!comparisonMode) return;

    const fetchDataA = async () => {
      // Prevent duplicate fetches
      if (fetchingA.current) {
        console.log('Scenario A fetch already in progress, skipping...');
        return;
      }

      fetchingA.current = true;
      setLoadingA(true);

      try {
        const data = await getClimateGeoJSON(scenario, period, index);
        setGeojsonA(data);
      } catch (error) {
        console.error('Error fetching scenario A data:', error);
      } finally {
        setLoadingA(false);
        fetchingA.current = false;
      }
    };

    fetchDataA();
  }, [comparisonMode, scenario, period, index]);

  // Fetch data for scenario B (right/comparison)
  useEffect(() => {
    if (!comparisonMode) return;

    const fetchDataB = async () => {
      // Prevent duplicate fetches
      if (fetchingB.current) {
        console.log('Scenario B fetch already in progress, skipping...');
        return;
      }

      fetchingB.current = true;
      setLoadingB(true);

      try {
        const data = await getClimateGeoJSON(comparisonScenario, period, index);
        setGeojsonB(data);
      } catch (error) {
        console.error('Error fetching scenario B data:', error);
      } finally {
        setLoadingB(false);
        fetchingB.current = false;
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
        {/* Scenario A Label */}
        <div className="absolute top-4 left-4 z-1000 bg-white rounded-lg shadow-md px-3 py-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-800">Scenario A</h3>
            {loadingA && (
              <svg
                className="animate-spin h-4 w-4 text-primary-500"
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
          {geojsonA && (
            <ComparisonClimateLayer
              geojsonData={geojsonA}
              indexMetadata={indexMetadata}
              onMunicipalityClick={setSelectedMunicipality}
              selectedMunicipalityId={selectedMunicipality?.id}
              searchHighlightedMunicipalityId={searchHighlightedMunicipalityId}
            />
          )}
          <MapInitializer setMapInstance={setMapA} />
          <MapSync otherMap={mapB} />
        </MapContainer>
      </div>

      {/* Right Map - Scenario B */}
      <div className="flex-1 relative">
        {/* Scenario B Label */}
        <div className="absolute top-4 left-4 z-1000 bg-white rounded-lg shadow-md px-3 py-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-800">Scenario B</h3>
            {loadingB && (
              <svg
                className="animate-spin h-4 w-4 text-primary-500"
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
          {geojsonB && (
            <ComparisonClimateLayer
              geojsonData={geojsonB}
              indexMetadata={indexMetadata}
              onMunicipalityClick={setSelectedMunicipality}
              selectedMunicipalityId={selectedMunicipality?.id}
              searchHighlightedMunicipalityId={searchHighlightedMunicipalityId}
            />
          )}
          <MapInitializer setMapInstance={setMapB} />
          <MapSync otherMap={mapA} />
        </MapContainer>
      </div>

      {/* Unified Legend at Bottom Center */}
      {indexMetadata && (geojsonA || geojsonB) && (
        <UnifiedComparisonLegend
          indexMetadata={indexMetadata}
          geojsonData={geojsonA || geojsonB}
          scenarioA={scenario}
          scenarioB={comparisonScenario}
        />
      )}

      {/* Comparison Info Panel */}
      {selectedMunicipality && geojsonA && geojsonB && (
        <ComparisonInfoPanel
          municipality={selectedMunicipality}
          geojsonA={geojsonA}
          geojsonB={geojsonB}
          indexMetadata={indexMetadata}
          scenarioA={scenario}
          scenarioB={comparisonScenario}
          onClose={() => setSelectedMunicipality(null)}
        />
      )}
    </div>
  );
};

/**
 * ComparisonClimateLayer - Renders GeoJSON for comparison view
 * Similar to ClimateLayer but accepts data/metadata as props
 */
const ComparisonClimateLayer = ({ geojsonData, indexMetadata, onMunicipalityClick, selectedMunicipalityId, searchHighlightedMunicipalityId = null }) => {
  const [hoveredMunicipalityId, setHoveredMunicipalityId] = useState(null);

  // Create color scale from data
  const colorScale = useMemo(() => {
    if (!geojsonData || !indexMetadata) return null;
    const values = extractValuesFromGeoJSON(geojsonData);
    return getColorScale(indexMetadata, values);
  }, [geojsonData, indexMetadata]);

  // Style function for each municipality feature
  const styleFeature = (feature) => {
    const value = feature.properties.value;
    const municipalityId = feature.properties.id;

    // Determine if this municipality should be grayed out (search highlight active but not this one)
    const isGrayedOut = searchHighlightedMunicipalityId && searchHighlightedMunicipalityId !== municipalityId;

    // Determine fill color based on climate value
    const fillColor = colorScale
      ? getColorForValue(value, colorScale)
      : DEFAULT_STYLE.fillColor;

    // If grayed out, use gray color
    if (isGrayedOut) {
      return {
        ...DEFAULT_STYLE,
        fillColor: '#e5e7eb',
        fillOpacity: 0.4,
        color: '#d1d5db',
        weight: 1,
      };
    }

    // Apply selected style if selected
    if (selectedMunicipalityId === municipalityId) {
      return {
        weight: 3,
        color: '#2563eb',
        fillOpacity: 0.7,
        fillColor,
      };
    }

    // Apply hover style if hovered
    if (hoveredMunicipalityId === municipalityId) {
      return {
        ...HOVER_STYLE,
        fillColor,
      };
    }

    return {
      ...DEFAULT_STYLE,
      fillColor,
    };
  };

  // Event handlers
  const onEachFeature = (feature, layer) => {
    const props = feature.properties;

    // Create popup content
    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
          ${props.municipality_name}
        </h3>
        <div style="font-size: 13px; color: #666;">
          <p style="margin: 4px 0;"><strong>Code:</strong> ${props.municipality_code}</p>
          <p style="margin: 4px 0;"><strong>Province:</strong> ${props.province}</p>
          <p style="margin: 4px 0;"><strong>District:</strong> ${props.district_name} (${props.district_code})</p>
          <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="margin: 4px 0;"><strong>Index:</strong> ${props.index_code?.toUpperCase()}</p>
          <p style="margin: 4px 0;"><strong>Scenario:</strong> ${formatScenario(props.scenario).fullLabel}</p>
          <p style="margin: 4px 0;"><strong>Period:</strong> ${props.period_start}-${props.period_end}</p>
          <p style="margin: 8px 0 4px 0; font-size: 14px;">
            <strong>Value:</strong>
            <span style="color: ${colorScale ? getColorForValue(props.value, colorScale) : '#000'}; font-weight: bold;">
              ${props.value !== null && props.value !== undefined ? props.value.toFixed(3) : 'N/A'}
            </span>
            ${indexMetadata?.unit ? ` ${indexMetadata.unit}` : ''}
          </p>
          ${indexMetadata?.interpretation ? `
            <p style="margin: 4px 0; font-size: 12px; font-style: italic; color: #555;">
              ${indexMetadata.interpretation}
            </p>
          ` : ''}
          <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>Area:</strong> ${props.area_km2?.toFixed(2)} km²
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>Centroid:</strong> ${props.centroid_lat?.toFixed(4)}, ${props.centroid_lon?.toFixed(4)}
          </p>
        </div>
      </div>
    `;

    // Bind popup
    layer.bindPopup(popupContent);

    // Mouse events
    layer.on({
      mouseover: () => {
        setHoveredMunicipalityId(props.id);
        layer.setStyle(HOVER_STYLE);
      },
      mouseout: () => {
        setHoveredMunicipalityId(null);
        layer.setStyle(styleFeature(feature));
      },
      click: () => {
        // Set selected municipality with all relevant properties
        if (onMunicipalityClick) {
          onMunicipalityClick({
            id: props.id,
            name: props.municipality_name,
            code: props.municipality_code,
            province: props.province,
            districtCode: props.district_code,
            districtName: props.district_name,
            centroidLat: props.centroid_lat,
            centroidLon: props.centroid_lon,
            areaKm2: props.area_km2,
          });
        }
      },
    });
  };

  // Force re-render when data or selection changes
  const key = useMemo(() => {
    if (!geojsonData) return 'empty';
    const firstFeature = geojsonData.features?.[0]?.properties;
    return `${firstFeature?.scenario}-${firstFeature?.period}-${firstFeature?.index_code}-${selectedMunicipalityId || 'none'}-${searchHighlightedMunicipalityId || 'none'}`;
  }, [geojsonData, selectedMunicipalityId, searchHighlightedMunicipalityId]);

  if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
    return null;
  }

  return (
    <GeoJSON
      key={key}
      data={geojsonData}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
};

/**
 * ComparisonInfoPanel - Shows side-by-side comparison for selected municipality
 */
const ComparisonInfoPanel = ({ municipality, geojsonA, geojsonB, indexMetadata, scenarioA, scenarioB, onClose }) => {
  // Find municipality data in both scenarios
  const dataA = useMemo(() => {
    if (!geojsonA || !municipality) return null;
    const feature = geojsonA.features?.find(f => f.properties.id === municipality.id);
    return feature?.properties;
  }, [geojsonA, municipality]);

  const dataB = useMemo(() => {
    if (!geojsonB || !municipality) return null;
    const feature = geojsonB.features?.find(f => f.properties.id === municipality.id);
    return feature?.properties;
  }, [geojsonB, municipality]);

  if (!dataA || !dataB) return null;

  const valueA = dataA.value;
  const valueB = dataB.value;
  const difference = valueB - valueA;
  const percentChange = valueA !== 0 ? ((difference / Math.abs(valueA)) * 100) : 0;

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-300 p-4 z-1000 max-w-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800">{municipality.name}</h3>
          <p className="text-xs text-gray-600">
            {municipality.code} • {municipality.province}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Index Name */}
      <div className="mb-3 pb-3 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-700">
          {indexMetadata?.code?.toUpperCase()} - {indexMetadata?.name}
        </p>
      </div>

      {/* Side-by-side Comparison */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Scenario A */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-xs font-semibold text-blue-800 mb-1">Scenario A</div>
          <div className="text-[10px] text-blue-600 mb-2">{formatScenario(scenarioA).fullLabel}</div>
          <div className="text-lg font-bold text-blue-900">
            {valueA?.toFixed(3)}
          </div>
          {indexMetadata?.unit && (
            <div className="text-[10px] text-blue-600 mt-1">{indexMetadata.unit}</div>
          )}
        </div>

        {/* Scenario B */}
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="text-xs font-semibold text-purple-800 mb-1">Scenario B</div>
          <div className="text-[10px] text-purple-600 mb-2">{formatScenario(scenarioB).fullLabel}</div>
          <div className="text-lg font-bold text-purple-900">
            {valueB?.toFixed(3)}
          </div>
          {indexMetadata?.unit && (
            <div className="text-[10px] text-purple-600 mt-1">{indexMetadata.unit}</div>
          )}
        </div>
      </div>

      {/* Difference */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-700">Difference (B - A)</div>
            <div className={`text-base font-bold ${
              difference > 0 ? 'text-red-600' : difference < 0 ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {difference > 0 ? '+' : ''}{difference.toFixed(3)}
              {indexMetadata?.unit && ` ${indexMetadata.unit}`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600">Change</div>
            <div className={`text-sm font-semibold ${
              percentChange > 0 ? 'text-red-600' : percentChange < 0 ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Municipality Details */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600">
          <div>
            <span className="font-semibold">District:</span> {municipality.districtName}
          </div>
          <div>
            <span className="font-semibold">Area:</span> {municipality.areaKm2?.toFixed(2)} km²
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * UnifiedComparisonLegend - Single legend for both comparison maps
 * Positioned at bottom-center, shows both scenario names
 */
const UnifiedComparisonLegend = ({ indexMetadata, geojsonData, scenarioA, scenarioB }) => {
  // Extract values and create color scale
  const { colorScale, values, stats } = useMemo(() => {
    if (!geojsonData || !indexMetadata) {
      return { colorScale: null, values: [], stats: null };
    }

    const vals = extractValuesFromGeoJSON(geojsonData);
    const scale = getColorScale(indexMetadata, vals);
    const statistics = calculateStatistics(vals);

    return {
      colorScale: scale,
      values: vals,
      stats: statistics,
    };
  }, [geojsonData, indexMetadata]);

  // Generate legend items
  const legendItems = useMemo(() => {
    if (!colorScale) return [];
    return generateLegendItems(colorScale, 7);
  }, [colorScale]);

  // Get interpretation labels
  const interpretationLabels = useMemo(() => {
    if (!indexMetadata?.anomaly_direction) return null;
    return getInterpretationLabels(indexMetadata.anomaly_direction);
  }, [indexMetadata]);

  if (!indexMetadata || !colorScale || legendItems.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-md border border-gray-300 p-3 z-1000 max-w-[280px]">
      {/* Legend Header - Comparison Title */}
      <div className="mb-2">
        <h3 className="text-xs font-bold text-gray-800 text-center mb-1">
          Comparing Scenarios
        </h3>
        <div className="flex items-center justify-center gap-2 mb-2 text-[10px]">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">
            A: {formatScenario(scenarioA).fullLabel}
          </span>
          <span className="text-gray-400">vs</span>
          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-medium">
            B: {formatScenario(scenarioB).fullLabel}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-2">
          <h4 className="text-xs font-semibold text-gray-700">
            {indexMetadata.code?.toUpperCase()} - {indexMetadata.name}
          </h4>

          {/* Plain Language Description */}
          {indexMetadata.plain_language_description && (
            <div className="mt-1.5 bg-blue-50 rounded p-1.5">
              <div className="flex items-start gap-1">
                <span className="text-[10px]">💡</span>
                <p className="text-[10px] font-medium" style={{ color: '#1e40af' }}>
                  {indexMetadata.plain_language_description}
                </p>
              </div>
            </div>
          )}

          {/* Unit */}
          {indexMetadata.unit && (
            <p className="text-[11px] text-gray-500 mt-1">
              Unit: {indexMetadata.unit}
            </p>
          )}

          {/* Sector Tags */}
          {indexMetadata.sector && (
            <div className="mt-1.5 pt-1.5 border-t border-gray-100">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-semibold text-gray-600">Sectors:</span>
                <SectorTags sectorString={indexMetadata.sector} size="sm" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Color Scale */}
      <div className="mb-2">
        <div className="flex flex-col gap-0.5">
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <div
                className="w-6 h-3 rounded border border-gray-300"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-gray-600 font-mono">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation Labels */}
      {interpretationLabels && (
        <div className="mb-2 pt-2 border-t border-gray-200">
          <div className="text-[11px] space-y-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-gray-600">
                +: {interpretationLabels.positive}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-gray-600">
                -: {interpretationLabels.negative}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="pt-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
            <div className="text-gray-500">
              Min: <span className="font-mono text-gray-700">{stats.min.toFixed(2)}</span>
            </div>
            <div className="text-gray-500">
              Max: <span className="font-mono text-gray-700">{stats.max.toFixed(2)}</span>
            </div>
            <div className="text-gray-500">
              Mean: <span className="font-mono text-gray-700">{stats.mean.toFixed(2)}</span>
            </div>
            <div className="text-gray-500">
              Median: <span className="font-mono text-gray-700">{stats.median.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * MapInitializer - Captures the map instance and passes it to parent
 */
const MapInitializer = ({ setMapInstance }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      setMapInstance(map);
    }
  }, [map, setMapInstance]);

  return null;
};

/**
 * MapSync - Synchronizes map movements between two maps
 * Uses useMap hook to get current map instance and syncs with the other map
 */
const MapSync = ({ otherMap }) => {
  const map = useMap();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!map || !otherMap) return;

    const syncMaps = () => {
      // Prevent infinite loop - if we're currently syncing, don't sync again
      if (isSyncingRef.current) return;

      isSyncingRef.current = true;

      try {
        const center = map.getCenter();
        const zoom = map.getZoom();

        // Sync the other map to this map's position and zoom
        otherMap.setView(center, zoom, { animate: false });
      } finally {
        // Reset the flag after a short delay to allow the other map to update
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 50);
      }
    };

    // Listen to map movement events
    map.on('moveend', syncMaps);
    map.on('zoomend', syncMaps);

    // Cleanup listeners on unmount
    return () => {
      map.off('moveend', syncMaps);
      map.off('zoomend', syncMaps);
    };
  }, [map, otherMap]);

  return null;
};

export default ComparisonView;

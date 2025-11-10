import { useMemo } from 'react';
import { useClimate } from '../../context/ClimateContext';
import { useIndices } from '../../context/IndicesContext';
import {
  getColorScale,
  generateLegendItems,
  extractValuesFromGeoJSON,
  getInterpretationLabels,
  calculateStatistics,
} from '../../utils/colorMapping';
import SectorTags from '../Common/SectorTags';

/**
 * Legend - Dynamic color scale legend with enhanced metadata display
 * Uses API response metadata (color_scheme, anomaly_direction, plain_language_description)
 * Shows plain language descriptions for accessibility
 * Displays sector relevance tags
 */
const Legend = () => {
  const { geojsonData, index } = useClimate();
  const { getIndexByCode } = useIndices();

  // Get index metadata from API
  const indexMetadata = useMemo(() => {
    return getIndexByCode(index);
  }, [index, getIndexByCode]);

  // Extract values and create color scale from API response
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

  // Get interpretation labels based on anomaly_direction from API
  const interpretationLabels = useMemo(() => {
    if (!indexMetadata?.anomaly_direction) return null;
    return getInterpretationLabels(indexMetadata.anomaly_direction);
  }, [indexMetadata]);

  if (!indexMetadata || !colorScale || legendItems.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-sm border border-gray-300 p-3 z-1000 max-w-[240px]">
      {/* Legend Header */}
      <div className="mb-2">
        <h3 className="text-xs font-semibold text-gray-700">
          {indexMetadata.code?.toUpperCase()} - {indexMetadata.name}
        </h3>

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

      {/* Interpretation Labels (from risk_direction) */}
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

export default Legend;

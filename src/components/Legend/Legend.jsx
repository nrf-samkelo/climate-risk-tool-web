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

/**
 * Legend - Dynamic color scale legend
 * Uses API response metadata (color_scheme, anomaly_direction, interpretation)
 * Uses colorMapping utilities for scale generation
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
    <div className="absolute bottom-6 right-6 bg-white rounded-lg shadow-elevation-lg p-4 z-1000 max-w-xs">
      {/* Legend Header */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-800 uppercase">
          {indexMetadata.code}
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          {indexMetadata.interpretation}
        </p>
        {indexMetadata.unit && (
          <p className="text-xs text-gray-500 italic mt-1">
            Unit: {indexMetadata.unit}
          </p>
        )}
      </div>

      {/* Color Scale */}
      <div className="mb-3">
        <div className="flex flex-col gap-1">
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-8 h-4 rounded border border-gray-300"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-700 font-mono">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation Labels (from anomaly_direction) */}
      {interpretationLabels && (
        <div className="mb-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-1 font-semibold">
            Interpretation:
          </p>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-700">
                Positive: {interpretationLabels.positive}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-700">
                Negative: {interpretationLabels.negative}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-1 font-semibold">
            Statistics:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Min:</span>
              <span className="ml-1 font-mono text-gray-700">
                {stats.min.toFixed(3)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Max:</span>
              <span className="ml-1 font-mono text-gray-700">
                {stats.max.toFixed(3)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Mean:</span>
              <span className="ml-1 font-mono text-gray-700">
                {stats.mean.toFixed(3)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Median:</span>
              <span className="ml-1 font-mono text-gray-700">
                {stats.median.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Color Scheme Info (from API metadata) */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Color Scheme: <span className="font-mono">{indexMetadata.color_scheme}</span>
        </p>
        <p className="text-xs text-gray-500">
          Direction: <span className="font-mono">{indexMetadata.anomaly_direction}</span>
        </p>
      </div>
    </div>
  );
};

export default Legend;

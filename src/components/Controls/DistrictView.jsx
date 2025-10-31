import { useMemo } from 'react';
import { useClimate } from '../../context/ClimateContext';
import { useIndices } from '../../context/IndicesContext';
import { aggregateByDistrict } from '../../utils/colorMapping';

/**
 * DistrictView - Toggle and display district-level aggregated climate data
 * Uses proper statistical aggregation (MEAN for climate anomalies)
 * Leverages ClimateContext and aggregateByDistrict utility
 */
const DistrictView = () => {
  const { geojsonData, viewMode, setViewMode } = useClimate();
  const { getIndexByCode, indices } = useIndices();

  // Aggregate district data from GeoJSON
  const districtData = useMemo(() => {
    if (!geojsonData) return {};
    return aggregateByDistrict(geojsonData);
  }, [geojsonData]);

  const districtCount = Object.keys(districtData).length;

  const handleToggle = () => {
    setViewMode(viewMode === 'municipality' ? 'district' : 'municipality');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle Button */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          Aggregation Level
        </label>
        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'district'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {viewMode === 'district' ? '📊 District View' : '🗺️ Municipality View'}
        </button>
      </div>

      {/* District Summary */}
      {viewMode === 'district' && districtCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-xs text-blue-800">
              <p className="font-semibold mb-1">District Aggregation Active</p>
              <p>
                Showing {districtCount} districts with climate data aggregated using
                <span className="font-mono font-bold"> MEAN </span>
                across municipalities.
              </p>
              <p className="mt-2 italic text-blue-700">
                Aggregated value = Average anomaly of all municipalities in district
              </p>
            </div>
          </div>
        </div>
      )}

      {/* District Statistics Table (collapsed view) */}
      {viewMode === 'district' && districtCount > 0 && (
        <details className="bg-white border border-gray-200 rounded-lg">
          <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
            View District Statistics ({districtCount} districts)
          </summary>
          <div className="px-3 py-2 max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-2 py-1 text-left font-semibold">District</th>
                  <th className="px-2 py-1 text-right font-semibold">Mean</th>
                  <th className="px-2 py-1 text-right font-semibold">Std Dev</th>
                  <th className="px-2 py-1 text-right font-semibold">Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(districtData)
                  .sort((a, b) => b.aggregatedValue - a.aggregatedValue)
                  .map((district) => (
                    <tr key={district.code} className="border-t border-gray-100">
                      <td className="px-2 py-1">
                        <div className="font-medium">{district.name}</div>
                        <div className="text-gray-500">{district.code}</div>
                      </td>
                      <td className="px-2 py-1 text-right font-mono">
                        {district.aggregatedValue.toFixed(3)}
                      </td>
                      <td className="px-2 py-1 text-right font-mono text-gray-600">
                        ±{district.stdDev.toFixed(3)}
                      </td>
                      <td className="px-2 py-1 text-right text-gray-600">
                        {district.count}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {/* Aggregation Method Info */}
      {viewMode === 'district' && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
          <p className="font-semibold mb-1">Aggregation Method:</p>
          <ul className="space-y-1 ml-3 list-disc">
            <li>
              <strong>Mean:</strong> Average anomaly value across all municipalities
            </li>
            <li>
              <strong>Std Dev:</strong> Variability within the district
            </li>
            <li>
              <strong>Count:</strong> Number of municipalities in district
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DistrictView;

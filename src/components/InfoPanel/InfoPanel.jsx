import { useClimate } from '../../context/ClimateContext';
import { useIndices } from '../../context/IndicesContext';
import { formatScenario, formatPeriod } from '../../utils/constants';

/**
 * InfoPanel - Displays selected municipality details
 * Uses ClimateContext for selected municipality data
 * Leverages all API response properties from GeoJSON
 */
const InfoPanel = () => {
  const { selectedMunicipality, setSelectedMunicipality } = useClimate();
  const { getIndexByCode } = useIndices();

  if (!selectedMunicipality) {
    return null;
  }

  const indexMetadata = getIndexByCode(selectedMunicipality.indexCode);
  const scenarioInfo = formatScenario(selectedMunicipality.scenario);
  const periodInfo = formatPeriod(
    selectedMunicipality.period,
    selectedMunicipality.periodStart,
    selectedMunicipality.periodEnd
  );

  const handleClose = () => {
    setSelectedMunicipality(null);
  };

  return (
    <div className="absolute top-6 right-6 bg-white rounded-lg shadow-elevation-lg p-4 z-1000 max-w-sm">
      {/* Header with close button */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">
          {selectedMunicipality.name}
        </h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Municipality Information */}
      <div className="space-y-3">
        {/* Basic Info */}
        <div className="pb-3 border-b border-gray-200">
          <InfoRow label="Code" value={selectedMunicipality.code} />
          <InfoRow label="Province" value={selectedMunicipality.province} />
          <InfoRow
            label="District"
            value={`${selectedMunicipality.districtName} (${selectedMunicipality.districtCode})`}
          />
        </div>

        {/* Geographic Info */}
        <div className="pb-3 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Geographic Details
          </h4>
          <InfoRow
            label="Area"
            value={`${selectedMunicipality.areaKm2?.toFixed(2)} km²`}
          />
          <InfoRow
            label="Centroid"
            value={`${selectedMunicipality.centroidLat?.toFixed(4)}, ${selectedMunicipality.centroidLon?.toFixed(4)}`}
          />
        </div>

        {/* Climate Data */}
        <div className="pb-3 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Climate Data
          </h4>
          <InfoRow
            label="Scenario"
            value={`${scenarioInfo.label} - ${scenarioInfo.description}`}
          />
          <InfoRow label="Period" value={periodInfo.label} />
          <InfoRow
            label="Index"
            value={selectedMunicipality.indexCode?.toUpperCase()}
          />
          {indexMetadata && (
            <>
              <InfoRow
                label="Description"
                value={indexMetadata.interpretation}
              />
              <InfoRow label="Unit" value={indexMetadata.unit} />
            </>
          )}
        </div>

        {/* Climate Value - Highlighted */}
        <div className="bg-primary-50 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-1">Climate Anomaly Value</div>
          <div className="text-2xl font-bold text-primary-600">
            {selectedMunicipality.value !== null && selectedMunicipality.value !== undefined
              ? selectedMunicipality.value.toFixed(3)
              : 'N/A'}
            {indexMetadata?.unit && (
              <span className="text-base ml-2 text-gray-600">
                {indexMetadata.unit}
              </span>
            )}
          </div>
          {indexMetadata && (
            <div className="text-xs text-gray-500 mt-1 italic">
              Anomaly from 1995-2014 baseline
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Helper component for consistent info rows
 */
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start py-1">
    <span className="text-xs text-gray-600 font-medium">{label}:</span>
    <span className="text-xs text-gray-800 text-right ml-2 max-w-[60%]">
      {value}
    </span>
  </div>
);

export default InfoPanel;

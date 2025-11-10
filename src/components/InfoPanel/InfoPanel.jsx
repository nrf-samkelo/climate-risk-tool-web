import { useState } from 'react';
import { useClimate } from '../../context/ClimateContext';
import { useIndices } from '../../context/IndicesContext';
import { formatScenario, formatPeriod } from '../../utils/constants';
import SectorTags from '../Common/SectorTags';

/**
 * InfoPanel - Displays selected municipality details with enhanced index information
 * Uses ClimateContext for selected municipality data
 * Shows plain language descriptions and optional technical definitions
 * Displays sector relevance tags
 */
const InfoPanel = () => {
  const { selectedMunicipality, setSelectedMunicipality } = useClimate();
  const { getIndexByCode } = useIndices();
  const [showTechnical, setShowTechnical] = useState(false);

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
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border border-gray-300 p-3 z-1000 max-w-[280px]">
      {/* Header with close button */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-800">
          {selectedMunicipality.name}
        </h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
          aria-label="Close"
        >
          <svg
            className="w-4 h-4"
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
      <div className="space-y-2">
        {/* Basic Info */}
        <div className="pb-2 border-b border-gray-200">
          <InfoRow label="Code" value={selectedMunicipality.code} />
          <InfoRow label="Province" value={selectedMunicipality.province} />
          <InfoRow
            label="District"
            value={`${selectedMunicipality.districtName} (${selectedMunicipality.districtCode})`}
          />
        </div>

        {/* Geographic Info */}
        <div className="pb-2 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-1">
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
        <div className="pb-2 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-1">
            Climate Data
          </h4>
          <InfoRow
            label="Scenario"
            value={scenarioInfo.label}
          />
          <InfoRow label="Period" value={periodInfo.label} />
          <InfoRow
            label="Index"
            value={selectedMunicipality.indexCode?.toUpperCase()}
          />
          {indexMetadata && (
            <InfoRow label="Unit" value={indexMetadata.unit} />
          )}
        </div>

        {/* Index Information - Plain Language & Technical */}
        {indexMetadata && (
          <div className="pb-2 border-b border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-1">
              {indexMetadata.name || indexMetadata.index_name}
            </h4>

            {/* Plain Language Description */}
            {indexMetadata.plain_language_description && (
              <div className="bg-blue-50 rounded p-2 mb-1.5">
                <div className="flex items-start gap-1.5">
                  <span className="text-sm">💡</span>
                  <p className="text-[10px] font-medium" style={{ color: '#1e40af' }}>
                    {indexMetadata.plain_language_description}
                  </p>
                </div>
              </div>
            )}

            {/* Technical Definition Toggle */}
            {indexMetadata.technical_definition && (
              <div className="mt-1.5">
                <button
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  {showTechnical ? '▼ Hide' : '▶ Show'} Technical Definition
                </button>

                {showTechnical && (
                  <div className="mt-1 bg-gray-50 rounded p-2 border border-gray-200">
                    <p className="text-[10px] text-gray-700 leading-relaxed">
                      {indexMetadata.technical_definition}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sector Tags */}
            {indexMetadata.sector && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-semibold text-gray-600">
                    Relevant Sectors:
                  </span>
                  <SectorTags sectorString={indexMetadata.sector} size="sm" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Climate Value - Highlighted */}
        <div className="bg-primary-50 rounded-lg p-2">
          <div className="text-[10px] text-gray-600 mb-0.5">Climate Anomaly</div>
          <div className="text-lg font-bold text-primary-600">
            {selectedMunicipality.value !== null && selectedMunicipality.value !== undefined
              ? selectedMunicipality.value.toFixed(2)
              : 'N/A'}
            {indexMetadata?.unit && (
              <span className="text-xs ml-1.5 text-gray-600">
                {indexMetadata.unit}
              </span>
            )}
          </div>
          {indexMetadata && (
            <div className="text-[10px] text-gray-500 mt-0.5 italic">
              vs 1995-2014 baseline
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
  <div className="flex justify-between items-start py-0.5">
    <span className="text-[10px] text-gray-600 font-medium">{label}:</span>
    <span className="text-[10px] text-gray-800 text-right ml-2 max-w-[60%]">
      {value}
    </span>
  </div>
);

export default InfoPanel;

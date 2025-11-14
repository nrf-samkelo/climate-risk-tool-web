/**
 * DataAttribution - Displays data source information and downscaling details
 * Prominently shows that climate projections are downscaled from NEX-GDDP-CMIP6
 */
const DataAttribution = ({ variant = 'full' }) => {
  if (variant === 'compact') {
    return (
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1.5 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            Data: <strong>NASA NEX-GDDP-CMIP6</strong> (Downscaled ~25 km)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-gray-200 p-3">
      {/* Main Attribution */}
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-gray-800 mb-1">
            Climate Projections Data Source
          </h4>
          <p className="text-[11px] text-gray-700 leading-relaxed">
            <strong className="text-blue-700">Downscaled climate projections</strong> from{' '}
            <strong>NASA NEX-GDDP-CMIP6</strong> dataset, bias-corrected and statistically
            downscaled to <strong>~25 km resolution</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataAttribution;

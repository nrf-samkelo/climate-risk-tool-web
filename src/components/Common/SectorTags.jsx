import { parseSectors } from '../../utils/sectors';

/**
 * SectorTags Component
 *
 * Displays visual badges for climate index sector relevance
 * Shows sector codes (AFS, H, WRH, All) with color-coded tags
 *
 * @param {Object} props
 * @param {string} props.sectorString - Comma-separated sector codes from API (e.g., "H, AFS, WRH")
 * @param {string} props.size - Size variant: 'sm' (default) or 'md'
 * @param {boolean} props.showTooltip - Whether to show full name on hover (default: true)
 */
const SectorTags = ({ sectorString, size = 'sm', showTooltip = true }) => {
  if (!sectorString) return null;

  const sectors = parseSectors(sectorString);

  if (sectors.length === 0) return null;

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <div className="flex gap-1 flex-wrap items-center">
      {sectors.map((sector) => (
        <span
          key={sector.code}
          className={`
            inline-flex items-center rounded
            font-medium border
            ${sector.color}
            ${sector.borderColor}
            ${sizeClasses[size]}
          `}
          title={showTooltip ? sector.fullName : undefined}
          style={{ letterSpacing: '0.01em' }}
        >
          {sector.displayCode || sector.code}
        </span>
      ))}
    </div>
  );
};

export default SectorTags;

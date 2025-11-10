/**
 * Sector Utilities
 * Helper functions and constants for handling climate index sector tags
 */

/**
 * Sector reference mapping
 * Maps sector codes to full names and Tailwind CSS classes for visual tags
 *
 * Note: Keys are API codes (AFS, WRH), displayCode is what shows in UI (AGR, W&H)
 */
export const SECTOR_MAP = {
  'AFS': {
    displayCode: 'AGR',
    name: 'Agriculture & Food Security',
    fullName: 'Agriculture and Food Security',
    description: 'Impacts on crops, livestock, and food production systems',
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-200',
  },
  'H': {
    displayCode: 'H',
    name: 'Hydrology',
    fullName: 'Hydrology',
    description: 'Water cycles, watersheds, and streamflow',
    color: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200',
  },
  'WRH': {
    displayCode: 'W&H',
    name: 'Water Resources & Health',
    fullName: 'Water Resources and Health',
    description: 'Water availability, quality, and public health impacts',
    color: 'bg-purple-100 text-purple-800',
    borderColor: 'border-purple-200',
  },
  'All': {
    displayCode: 'All',
    name: 'All Sectors',
    fullName: 'All Sectors',
    description: 'Broadly relevant across multiple domains',
    color: 'bg-gray-100 text-gray-800',
    borderColor: 'border-gray-200',
  },
};

/**
 * Parse sector string into array of sector objects
 *
 * The API returns sectors as comma-separated strings (e.g., "H, AFS, WRH")
 * This function splits and enriches them with metadata from SECTOR_MAP
 *
 * @param {string} sectorString - Comma-separated sector codes from API
 * @returns {Array} Array of sector objects with code, name, description, color
 *
 * @example
 * parseSectors("H, AFS, WRH")
 * // Returns:
 * // [
 * //   { code: 'H', name: 'Hydrology', description: '...', color: 'bg-blue-100...' },
 * //   { code: 'AFS', name: 'Agriculture & Food Security', ... },
 * //   { code: 'WRH', name: 'Water Resources & Health', ... }
 * // ]
 */
export function parseSectors(sectorString) {
  if (!sectorString) return [];

  return sectorString
    .split(',')
    .map(code => code.trim())
    .filter(code => code.length > 0)
    .map(code => ({
      code,
      ...(SECTOR_MAP[code] || {
        name: code,
        fullName: code,
        description: 'Unknown sector',
        color: 'bg-gray-100 text-gray-600',
        borderColor: 'border-gray-300',
      }),
    }));
}

/**
 * Check if an index is relevant to a specific sector
 *
 * @param {string} indexSectorString - Sector string from index metadata
 * @param {string} targetSector - Sector code to check for (e.g., 'AFS', 'H')
 * @returns {boolean} True if index is relevant to the sector
 *
 * @example
 * isSectorRelevant("H, AFS, WRH", "AFS") // true
 * isSectorRelevant("All", "H") // true
 * isSectorRelevant("AFS", "H") // false
 */
export function isSectorRelevant(indexSectorString, targetSector) {
  if (!indexSectorString) return false;
  if (targetSector === 'All') return true;
  if (indexSectorString === 'All') return true;

  const sectors = indexSectorString.split(',').map(s => s.trim());
  return sectors.includes(targetSector);
}

/**
 * Filter indices by sector
 *
 * @param {Array} indices - Array of climate indices
 * @param {string} targetSector - Sector code to filter by
 * @returns {Array} Filtered indices relevant to the sector
 *
 * @example
 * const agricultureIndices = filterBySector(allIndices, 'AFS');
 */
export function filterBySector(indices, targetSector) {
  if (!indices || indices.length === 0) return [];
  if (targetSector === 'All') return indices;

  return indices.filter(index =>
    isSectorRelevant(index.sector, targetSector)
  );
}

/**
 * Get all unique sectors from an array of indices
 *
 * @param {Array} indices - Array of climate indices
 * @returns {Array} Array of unique sector codes
 *
 * @example
 * getUniqueSectors(allIndices) // ['AFS', 'H', 'WRH', 'All']
 */
export function getUniqueSectors(indices) {
  if (!indices || indices.length === 0) return [];

  const sectorSet = new Set();

  indices.forEach(index => {
    if (index.sector) {
      const sectors = index.sector.split(',').map(s => s.trim());
      sectors.forEach(sector => sectorSet.add(sector));
    }
  });

  return Array.from(sectorSet).sort();
}

/**
 * Count indices by sector
 *
 * @param {Array} indices - Array of climate indices
 * @returns {Object} Object with sector codes as keys and counts as values
 *
 * @example
 * countBySector(allIndices)
 * // { 'AFS': 12, 'H': 15, 'WRH': 8, 'All': 10 }
 */
export function countBySector(indices) {
  if (!indices || indices.length === 0) return {};

  const counts = {};

  // Initialize counts for all known sectors
  Object.keys(SECTOR_MAP).forEach(sector => {
    counts[sector] = 0;
  });

  // Count indices for each sector
  indices.forEach(index => {
    if (index.sector) {
      const sectors = index.sector.split(',').map(s => s.trim());
      sectors.forEach(sector => {
        if (counts[sector] !== undefined) {
          counts[sector]++;
        }
      });
    }
  });

  return counts;
}

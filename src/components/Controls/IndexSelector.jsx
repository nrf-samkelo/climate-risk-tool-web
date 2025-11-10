import { useState, useMemo } from 'react';
import { useClimate } from '../../context/ClimateContext';
import { useIndices } from '../../context/IndicesContext';
import { CATEGORIES } from '../../utils/constants';
import { filterBySector, SECTOR_MAP } from '../../utils/sectors';
import SectorTags from '../Common/SectorTags';

/**
 * IndexSelector - Grouped dropdown to select climate index with sector filtering
 * Uses ClimateContext for state management
 * Uses IndicesContext to fetch climate indices from API
 * Supports filtering by sector (Agriculture, Hydrology, Water/Health, All)
 * Uses CATEGORIES constant for category grouping
 */
const IndexSelector = () => {
  const { index, setIndex } = useClimate();
  const { getByCategory, getIndexByCode, loading } = useIndices();
  const [selectedCategory, setSelectedCategory] = useState('precipitation');
  const [selectedSector, setSelectedSector] = useState('All');

  // Filter indices by both category AND sector
  const filteredIndices = useMemo(() => {
    const indicesInCategory = getByCategory(selectedCategory);
    const bySector = filterBySector(indicesInCategory, selectedSector);
    // Filter out indices without valid codes
    return bySector?.filter(idx => idx.code && idx.name) || [];
  }, [selectedCategory, selectedSector, getByCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Automatically select first index in the new category (with current sector filter)
    const indicesInCategory = getByCategory(category);
    const bySector = filterBySector(indicesInCategory, selectedSector);
    const validIndices = bySector?.filter(idx => idx.code) || [];
    if (validIndices.length > 0) {
      setIndex(validIndices[0].code);
    }
  };

  const handleSectorChange = (sector) => {
    setSelectedSector(sector);
    // Automatically select first index with new sector filter
    const indicesInCategory = getByCategory(selectedCategory);
    const bySector = filterBySector(indicesInCategory, sector);
    const validIndices = bySector?.filter(idx => idx.code) || [];
    if (validIndices.length > 0) {
      setIndex(validIndices[0].code);
    }
  };

  const handleIndexChange = (e) => {
    setIndex(e.target.value);
  };

  const currentIndexMetadata = getIndexByCode(index);

  // Sector filter options
  const sectorOptions = [
    { code: 'All', name: 'All Sectors', icon: '🌍' },
    { code: 'AFS', name: 'Agriculture', icon: '🌾' },
    { code: 'H', name: 'Hydrology', icon: '💧' },
    { code: 'WRH', name: 'Water & Health', icon: '🏥' },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium" style={{ color: '#475569' }}>
        Climate Index
      </label>

      {/* Sector Filter */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium" style={{ color: '#64748b' }}>
          Filter by Sector:
        </span>
        <div className="flex gap-1">
          {sectorOptions.map((sector) => (
            <button
              key={sector.code}
              onClick={() => handleSectorChange(sector.code)}
              className={`flex-1 px-1.5 py-1 rounded text-[10px] font-medium transition-all ${
                selectedSector === sector.code
                  ? 'text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={
                selectedSector === sector.code
                  ? { background: SECTOR_MAP[sector.code]?.color ? '#8b5cf6' : '#64748b' }
                  : { background: '#f1f5f9' }
              }
              title={sector.name}
            >
              <span className="mr-0.5">{sector.icon}</span>
              <span className="hidden sm:inline">{SECTOR_MAP[sector.code]?.displayCode || sector.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            onClick={() => handleCategoryChange(category.value)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              selectedCategory === category.value
                ? 'text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={selectedCategory === category.value ? { background: '#60a5fa' } : { background: '#f1f5f9' }}
          >
            <span className="mr-1">{category.icon}</span>
            <span className="hidden sm:inline">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Index Dropdown */}
      {loading ? (
        <div className="text-[10px] italic" style={{ color: '#64748b' }}>Loading indices...</div>
      ) : filteredIndices.length > 0 ? (
        <>
          <select
            id="index-select"
            value={index}
            onChange={handleIndexChange}
            className="nice-select"
          >
            {filteredIndices.map((idx) => (
              <option key={idx.code} value={idx.code}>
                {idx.code.toUpperCase()} - {idx.name}
              </option>
            ))}
          </select>

          {/* Show description, sectors, and unit for selected index */}
          {currentIndexMetadata && (
            <div className="text-[10px] space-y-1" style={{ color: '#64748b' }}>
              {/* Plain language description (if available) */}
              {currentIndexMetadata.plain_language_description && (
                <p className="font-medium" style={{ color: '#475569' }}>
                  💡 {currentIndexMetadata.plain_language_description}
                </p>
              )}

              {/* Interpretation */}
              <p className="italic">{currentIndexMetadata.interpretation}</p>

              {/* Unit */}
              <p>
                <span className="font-semibold">Unit:</span> {currentIndexMetadata.unit}
              </p>

              {/* Sector tags */}
              {currentIndexMetadata.sector && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="font-semibold text-[9px]">Relevant to:</span>
                  <SectorTags sectorString={currentIndexMetadata.sector} size="sm" />
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-[10px] italic" style={{ color: '#dc2626' }}>
          No indices available for this {selectedSector !== 'All' ? 'sector and ' : ''}category.
          {selectedSector !== 'All' && ' Try selecting a different sector.'}
        </div>
      )}
    </div>
  );
};

export default IndexSelector;

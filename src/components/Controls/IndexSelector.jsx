import { useState } from 'react';
import { useClimate } from '../../context/ClimateContext';
import { useIndices } from '../../context/IndicesContext';
import { CATEGORIES } from '../../utils/constants';

/**
 * IndexSelector - Grouped dropdown to select climate index
 * Uses ClimateContext for state management
 * Uses IndicesContext to fetch climate indices from API
 * Uses CATEGORIES constant for grouping
 */
const IndexSelector = () => {
  const { index, setIndex } = useClimate();
  const { getByCategory, getIndexByCode, loading } = useIndices();
  const [selectedCategory, setSelectedCategory] = useState('precipitation');

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Automatically select first index in the new category
    const indicesInCategory = getByCategory(category);
    // Filter out indices without valid codes
    const validIndices = indicesInCategory?.filter(idx => idx.code) || [];
    if (validIndices.length > 0) {
      setIndex(validIndices[0].code);
    }
  };

  const handleIndexChange = (e) => {
    setIndex(e.target.value);
  };

  const currentIndexMetadata = getIndexByCode(index);
  const indicesInSelectedCategory = getByCategory(selectedCategory);
  // Filter out any indices without valid codes
  const validIndices = indicesInSelectedCategory?.filter(idx => idx.code && idx.name) || [];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium" style={{ color: '#475569' }}>
        Climate Index
      </label>

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
      ) : validIndices.length > 0 ? (
        <>
          <select
            id="index-select"
            value={index}
            onChange={handleIndexChange}
            className="nice-select"
          >
            {validIndices.map((idx) => (
              <option key={idx.code} value={idx.code}>
                {idx.code.toUpperCase()} - {idx.name}
              </option>
            ))}
          </select>

          {/* Show description and unit for selected index */}
          {currentIndexMetadata && (
            <div className="text-[10px] space-y-0.5" style={{ color: '#64748b' }}>
              <p className="italic">{currentIndexMetadata.interpretation}</p>
              <p>
                <span className="font-semibold">Unit:</span> {currentIndexMetadata.unit}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-[10px] italic" style={{ color: '#dc2626' }}>
          No indices available for this category. Please check API connection.
        </div>
      )}
    </div>
  );
};

export default IndexSelector;

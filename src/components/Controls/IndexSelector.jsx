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
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-gray-700">
        Climate Index
      </label>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            onClick={() => handleCategoryChange(category.value)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Index Dropdown */}
      {loading ? (
        <div className="text-sm text-gray-500 italic">Loading indices...</div>
      ) : validIndices.length > 0 ? (
        <>
          <select
            id="index-select"
            value={index}
            onChange={handleIndexChange}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
          >
            {validIndices.map((idx) => (
              <option key={idx.code} value={idx.code}>
                {idx.code.toUpperCase()} - {idx.name}
              </option>
            ))}
          </select>

          {/* Show description and unit for selected index */}
          {currentIndexMetadata && (
            <div className="text-xs text-gray-600 space-y-1">
              <p className="italic">{currentIndexMetadata.interpretation}</p>
              <p>
                <span className="font-semibold">Unit:</span> {currentIndexMetadata.unit}
              </p>
              <p>
                <span className="font-semibold">Color Scheme:</span> {currentIndexMetadata.color_scheme}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-red-500 italic">
          No indices available for this category. Please check API connection.
        </div>
      )}
    </div>
  );
};

export default IndexSelector;

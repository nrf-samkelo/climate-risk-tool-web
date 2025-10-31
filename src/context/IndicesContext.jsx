import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllIndices, getIndicesByCategory } from '../api/indices';

const IndicesContext = createContext(null);

export const IndicesProvider = ({ children }) => {
  // All climate indices with metadata
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Grouped by category
  const [precipitationIndices, setPrecipitationIndices] = useState([]);
  const [temperatureIndices, setTemperatureIndices] = useState([]);
  const [durationIndices, setDurationIndices] = useState([]);

  /**
   * Fetch all climate indices on mount
   */
  useEffect(() => {
    fetchAllIndices();
  }, []);

  /**
   * Fetch all indices from API
   */
  const fetchAllIndices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAllIndices();
      const indicesData = response.data || response;
      setIndices(indicesData);

      // Group by category
      const precip = indicesData.filter(idx => idx.category === 'precipitation');
      const temp = indicesData.filter(idx => idx.category === 'temperature');
      const duration = indicesData.filter(idx => idx.category === 'duration');

      setPrecipitationIndices(precip);
      setTemperatureIndices(temp);
      setDurationIndices(duration);
    } catch (err) {
      setError(err.message || 'Failed to fetch climate indices');
      console.error('Error fetching indices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get index metadata by code
   */
  const getIndexByCode = useCallback((code) => {
    return indices.find(idx => idx.code === code);
  }, [indices]);

  /**
   * Get indices by category
   */
  const getByCategory = useCallback((category) => {
    switch (category) {
      case 'precipitation':
        return precipitationIndices;
      case 'temperature':
        return temperatureIndices;
      case 'duration':
        return durationIndices;
      default:
        return [];
    }
  }, [precipitationIndices, temperatureIndices, durationIndices]);

  const value = {
    // All indices
    indices,
    loading,
    error,
    fetchAllIndices,

    // Grouped indices
    precipitationIndices,
    temperatureIndices,
    durationIndices,

    // Helper functions
    getIndexByCode,
    getByCategory,
  };

  return (
    <IndicesContext.Provider value={value}>
      {children}
    </IndicesContext.Provider>
  );
};

/**
 * Custom hook to use Indices Context
 */
export const useIndices = () => {
  const context = useContext(IndicesContext);
  if (!context) {
    throw new Error('useIndices must be used within IndicesProvider');
  }
  return context;
};

export default IndicesContext;

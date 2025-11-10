import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getAllIndices, getSectors } from '../api/indices';
import { parseSectors } from '../utils/sectors';

const IndicesContext = createContext(null);

export const IndicesProvider = ({ children }) => {
  // All climate indices with metadata
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sector reference data (AFS, H, WRH, All)
  const [sectors, setSectors] = useState([]);
  const [sectorsLoading, setSectorsLoading] = useState(false);

  // Grouped by category
  const [precipitationIndices, setPrecipitationIndices] = useState([]);
  const [temperatureIndices, setTemperatureIndices] = useState([]);
  const [durationIndices, setDurationIndices] = useState([]);

  /**
   * Fetch sectors reference on mount
   */
  useEffect(() => {
    const fetchSectorsData = async () => {
      setSectorsLoading(true);
      try {
        const response = await getSectors();
        setSectors(response.sectors || []);
      } catch (err) {
        console.error('Error fetching sectors:', err);
      } finally {
        setSectorsLoading(false);
      }
    };

    fetchSectorsData();
  }, []);

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
      // API returns {success, count, data: [...]}
      const indicesData = response.data || response;

      // Normalize and enrich indices with:
      // 1. Legacy 'code' and 'name' fields for compatibility
      // 2. Parsed sectors array for easier rendering
      const normalizedIndices = indicesData.map(idx => ({
        ...idx,
        code: idx.index_code,
        name: idx.index_name,
        parsedSectors: parseSectors(idx.sector), // Enrich with sector objects
      }));

      setIndices(normalizedIndices);

      // Group by category
      const precip = normalizedIndices.filter(idx => idx.category === 'precipitation');
      const temp = normalizedIndices.filter(idx => idx.category === 'temperature');
      const duration = normalizedIndices.filter(idx => idx.category === 'duration');

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
    // All indices (with new fields: technical_definition, plain_language_description, sector, etc.)
    indices,
    loading,
    error,
    fetchAllIndices,

    // Sector reference data
    sectors,
    sectorsLoading,

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

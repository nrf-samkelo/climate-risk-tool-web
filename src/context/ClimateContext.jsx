import { createContext, useContext, useState, useCallback } from 'react';
import { getClimateGeoJSON } from '../api/climateData';

const ClimateContext = createContext(null);

export const ClimateProvider = ({ children }) => {
  // Map configuration state
  const [scenario, setScenario] = useState('ssp245');
  const [period, setPeriod] = useState('near-term_2021-2040');
  const [index, setIndex] = useState('cdd');

  // Data state
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selected municipality for info panel
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);

  // View mode: 'municipality' or 'district'
  const [viewMode, setViewMode] = useState('municipality');

  // Comparison mode (for side-by-side comparison)
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonScenario, setComparisonScenario] = useState('ssp585');

  /**
   * Fetch GeoJSON data for current configuration
   */
  const fetchClimateData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getClimateGeoJSON(scenario, period, index);
      setGeojsonData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch climate data');
      console.error('Error fetching climate data:', err);
    } finally {
      setLoading(false);
    }
  }, [scenario, period, index]);

  /**
   * Update map configuration (scenario, period, or index)
   */
  const updateConfig = useCallback((updates) => {
    if (updates.scenario !== undefined) setScenario(updates.scenario);
    if (updates.period !== undefined) setPeriod(updates.period);
    if (updates.index !== undefined) setIndex(updates.index);
  }, []);

  /**
   * Reset to default configuration
   */
  const resetConfig = useCallback(() => {
    setScenario('ssp245');
    setPeriod('near-term_2021-2040');
    setIndex('cdd');
    setSelectedMunicipality(null);
    setComparisonMode(false);
  }, []);

  const value = {
    // Configuration
    scenario,
    period,
    index,
    setScenario,
    setPeriod,
    setIndex,
    updateConfig,
    resetConfig,

    // Data
    geojsonData,
    loading,
    error,
    fetchClimateData,

    // Selected municipality
    selectedMunicipality,
    setSelectedMunicipality,

    // View mode
    viewMode,
    setViewMode,

    // Comparison mode
    comparisonMode,
    setComparisonMode,
    comparisonScenario,
    setComparisonScenario,
  };

  return (
    <ClimateContext.Provider value={value}>
      {children}
    </ClimateContext.Provider>
  );
};

/**
 * Custom hook to use Climate Context
 */
export const useClimate = () => {
  const context = useContext(ClimateContext);
  if (!context) {
    throw new Error('useClimate must be used within ClimateProvider');
  }
  return context;
};

export default ClimateContext;

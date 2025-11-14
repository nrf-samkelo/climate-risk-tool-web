import apiClient from './client';

/**
 * Get all climate data for a municipality
 * @param {number} municipalityId - Municipality ID
 * @returns {Promise} Climate data for all scenarios and periods
 */
export const getClimateDataByMunicipality = async (municipalityId) => {
  const response = await apiClient.get(`/climate-data/${municipalityId}`);
  return response.data;
};

/**
 * Get climate data for specific scenario and period
 * @param {number} municipalityId - Municipality ID
 * @param {string} scenario - SSP scenario (ssp126, ssp245, ssp370, ssp585)
 * @param {string} period - Time period (near-term_2021-2040, mid-term_2041-2060, far-term_2081-2100)
 * @returns {Promise} Climate data
 */
export const getClimateDataByScenarioPeriod = async (municipalityId, scenario, period) => {
  const response = await apiClient.get(`/climate-data/${municipalityId}/${scenario}/${period}`);
  return response.data;
};

/**
 * ⭐ CRITICAL FOR MAPPING: Get GeoJSON data for map visualization
 * @param {string} scenario - SSP scenario
 * @param {string} period - Time period
 * @param {string} index - Climate index code (e.g., 'cdd', 'prcptot')
 * @returns {Promise} GeoJSON FeatureCollection with 213 municipality polygons
 */
export const getClimateGeoJSON = async (scenario, period, index) => {
  const response = await apiClient.get(`/climate-data/geojson/${scenario}/${period}/${index}`);
  return response.data;
};

/**
 * Get available scenarios
 * @returns {Promise} List of SSP scenarios
 */
export const getScenarios = async () => {
  const response = await apiClient.get('/climate-data/scenarios');
  return response.data;
};

/**
 * Get available time periods
 * @returns {Promise} List of time periods with start/end years
 */
export const getPeriods = async () => {
  const response = await apiClient.get('/climate-data/periods');
  return response.data;
};

/**
 * Get climate data aggregated at district level
 * @param {string} districtCode - District code (e.g., "DC1")
 * @param {string} scenario - SSP scenario
 * @param {string} period - Time period
 * @returns {Promise} Aggregated district climate data
 */
export const getDistrictClimateData = async (districtCode, scenario, period) => {
  const response = await apiClient.get(`/climate-data/district/${districtCode}/${scenario}/${period}`);
  return response.data;
};

/**
 * Get cache statistics
 * @returns {Promise} Cache stats (hits, misses, size)
 */
export const getCacheStats = async () => {
  const response = await apiClient.get('/cache/stats');
  return response.data;
};

/**
 * Clear API cache
 * @returns {Promise} Success message
 */
export const clearCache = async () => {
  const response = await apiClient.post('/cache/clear');
  return response.data;
};

/**
 * Check API health
 * @returns {Promise} Health status
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

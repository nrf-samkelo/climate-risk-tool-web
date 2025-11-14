import apiClient from './client';

/**
 * Get all climate indices (27 total) with metadata
 * Includes: index_code, index_name, category, description, unit,
 * interpretation, risk_direction, color_scheme, baseline_period
 * @returns {Promise} Array of all climate indices
 */
export const getAllIndices = async () => {
  const response = await apiClient.get('/indices');
  console.log('Fetched all indices samkelo:', response.data);
  return response.data;
};

/**
 * Get single climate index by code
 * @param {string} code - Index code (e.g., 'cdd', 'prcptot', 'txge30')
 * @returns {Promise} Single index with metadata
 */
export const getIndexByCode = async (code) => {
  const response = await apiClient.get(`/indices/${code}`);
  return response.data;
};

/**
 * Get climate indices filtered by category
 * @param {string} category - Category: 'precipitation', 'temperature', or 'duration'
 * @returns {Promise} Array of indices in category
 */
export const getIndicesByCategory = async (category) => {
  const response = await apiClient.get(`/indices/category/${category}`);
  return response.data;
};

/**
 * Get summary statistics by category
 * @returns {Promise} Category summary statistics
 */
export const getCategoryStats = async () => {
  const response = await apiClient.get('/indices/stats/categories');
  return response.data;
};

/**
 * Get overall indices summary statistics
 * @returns {Promise} Overall summary statistics
 */
export const getIndicesSummary = async () => {
  const response = await apiClient.get('/indices/stats/summary');
  return response.data;
};

/**
 * 🆕 Get sector abbreviation reference
 * Returns full names and descriptions for AFS, H, WRH, All
 * @returns {Promise} Sector reference with explanations
 */
export const getSectors = async () => {
  const response = await apiClient.get('/indices/sectors');
  return response.data;
};

/**
 * 🆕 Get color scheme reference and explanation
 * Explains color_palette_type vs color_scheme relationship
 * @returns {Promise} Color scheme documentation
 */
export const getColorSchemes = async () => {
  const response = await apiClient.get('/indices/color-schemes');
  return response.data;
};

/**
 * 🆕 Get indices grouped by sector
 * @returns {Promise} Indices organized by sector relevance
 */
export const getIndicesBySector = async () => {
  const response = await apiClient.get('/indices/stats/by-sector');
  return response.data;
};

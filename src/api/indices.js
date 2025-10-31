import apiClient from './client';

/**
 * Get all climate indices (27 total) with metadata
 * Includes: index_code, index_name, category, description, unit,
 * interpretation, risk_direction, color_scheme, baseline_period
 * @returns {Promise} Array of all climate indices
 */
export const getAllIndices = async () => {
  const response = await apiClient.get('/api/indices');
  return response.data;
};

/**
 * Get single climate index by code
 * @param {string} code - Index code (e.g., 'cdd', 'prcptot', 'txge30')
 * @returns {Promise} Single index with metadata
 */
export const getIndexByCode = async (code) => {
  const response = await apiClient.get(`/api/indices/${code}`);
  return response.data;
};

/**
 * Get climate indices filtered by category
 * @param {string} category - Category: 'precipitation', 'temperature', or 'duration'
 * @returns {Promise} Array of indices in category
 */
export const getIndicesByCategory = async (category) => {
  const response = await apiClient.get(`/api/indices/category/${category}`);
  return response.data;
};

/**
 * Get summary statistics by category
 * @returns {Promise} Category summary statistics
 */
export const getCategoryStats = async () => {
  const response = await apiClient.get('/api/indices/stats/categories');
  return response.data;
};

/**
 * Get overall indices summary statistics
 * @returns {Promise} Overall summary statistics
 */
export const getIndicesSummary = async () => {
  const response = await apiClient.get('/api/indices/stats/summary');
  return response.data;
};

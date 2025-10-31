import apiClient from './client';

/**
 * Get all municipalities (213 total)
 * @returns {Promise} Array of municipalities
 */
export const getAllMunicipalities = async () => {
  const response = await apiClient.get('/api/municipalities');
  return response.data;
};

/**
 * Get single municipality by ID
 * @param {number} id - Municipality ID
 * @returns {Promise} Municipality data
 */
export const getMunicipalityById = async (id) => {
  const response = await apiClient.get(`/api/municipalities/${id}`);
  return response.data;
};

/**
 * Get municipalities by province
 * @param {string} province - Province name (e.g., "Western Cape")
 * @returns {Promise} Array of municipalities
 */
export const getMunicipalitiesByProvince = async (province) => {
  const response = await apiClient.get(`/api/municipalities/province/${province}`);
  return response.data;
};

/**
 * Get municipalities by district
 * @param {string} districtCode - District code (e.g., "DC1")
 * @returns {Promise} Array of municipalities
 */
export const getMunicipalitiesByDistrict = async (districtCode) => {
  const response = await apiClient.get(`/api/municipalities/district/${districtCode}`);
  return response.data;
};

/**
 * Get municipality summary statistics
 * @returns {Promise} Summary statistics
 */
export const getMunicipalitySummary = async () => {
  const response = await apiClient.get('/api/municipalities/stats/summary');
  return response.data;
};

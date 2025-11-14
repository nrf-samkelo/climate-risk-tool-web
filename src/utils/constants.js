// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/climate-tool/api';

// Map Configuration (matching climate-tool-web defaults)
export const MAP_CONFIG = {
  center: [
    parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || -28.75,
    parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || 22.9
  ],
  zoom: parseFloat(import.meta.env.VITE_MAP_ZOOM) || 4.7,
  minZoom: parseInt(import.meta.env.VITE_MAP_MIN_ZOOM) || 5,
  maxZoom: parseInt(import.meta.env.VITE_MAP_MAX_ZOOM) || 12,
};

// South Africa bounds [southwest, northeast]
export const SA_BOUNDS = [
  [-35.0, 16.0], // Southwest
  [-22.0, 33.0]  // Northeast
];

// SSP Scenarios (fallback - these can be fetched from /climate-data/scenarios)
export const SCENARIOS = [
  { value: 'ssp126', label: 'SSP1-2.6 (Low Emissions)', description: 'Sustainability pathway' },
  { value: 'ssp245', label: 'SSP2-4.5 (Medium Emissions)', description: 'Middle-of-the-road pathway' },
  { value: 'ssp370', label: 'SSP3-7.0 (High Emissions)', description: 'Regional rivalry pathway' },
  { value: 'ssp585', label: 'SSP5-8.5 (Very High Emissions)', description: 'Fossil-fueled development' }
];

// Time Periods (fallback - these can be fetched from /climate-data/periods)
export const PERIODS = [
  {
    value: 'near-term_2021-2040',
    label: 'Near-term (2021-2040)',
    start: 2021,
    end: 2040
  },
  {
    value: 'mid-term_2041-2060',
    label: 'Mid-term (2041-2060)',
    start: 2041,
    end: 2060
  },
  {
    value: 'far-term_2081-2100',
    label: 'Far-term (2081-2100)',
    start: 2081,
    end: 2100
  }
];

/**
 * Format scenario from API response to display format
 * @param {string} scenario - Scenario code from API (e.g., 'ssp245')
 * @returns {Object} Formatted scenario with label and description
 */
export const formatScenario = (scenario) => {
  const scenarioMap = {
    'ssp126': {
      label: 'SSP1-2.6',
      shortLabel: 'Low Emissions',
      fullLabel: 'SSP1-2.6 Low emissions',
      description: 'Sustainability pathway'
    },
    'ssp245': {
      label: 'SSP2-4.5',
      shortLabel: 'Medium Emissions',
      fullLabel: 'SSP2-4.5 Medium emissions',
      description: 'Middle-of-the-road pathway'
    },
    'ssp370': {
      label: 'SSP3-7.0',
      shortLabel: 'High Emissions',
      fullLabel: 'SSP3-7.0 High emissions',
      description: 'Regional rivalry pathway'
    },
    'ssp585': {
      label: 'SSP5-8.5',
      shortLabel: 'Very High Emissions',
      fullLabel: 'SSP5-8.5 Very high emissions',
      description: 'Fossil-fueled development'
    }
  };
  return scenarioMap[scenario] || {
    label: scenario,
    shortLabel: scenario,
    fullLabel: scenario,
    description: ''
  };
};

/**
 * Format period from API response to display format
 * @param {string} period - Period code from API (e.g., 'near-term_2021-2040')
 * @param {number} periodStart - Start year from API
 * @param {number} periodEnd - End year from API
 * @returns {Object} Formatted period with label
 */
export const formatPeriod = (period, periodStart, periodEnd) => {
  if (periodStart && periodEnd) {
    return {
      value: period,
      label: `${periodStart}-${periodEnd}`,
      start: periodStart,
      end: periodEnd
    };
  }

  const periodMap = {
    'near-term_2021-2040': { label: 'Near-term (2021-2040)', shortLabel: '2021-2040' },
    'mid-term_2041-2060': { label: 'Mid-term (2041-2060)', shortLabel: '2041-2060' },
    'far-term_2081-2100': { label: 'Far-term (2081-2100)', shortLabel: '2081-2100' }
  };
  return periodMap[period] || { label: period, shortLabel: period };
};

// Climate Index Categories
export const CATEGORIES = [
  { value: 'precipitation', label: 'Precipitation', icon: '💧' },
  { value: 'temperature', label: 'Temperature', icon: '🌡️' },
  { value: 'duration', label: 'Duration & Variability', icon: '📊' }
];

// Default map style
export const DEFAULT_STYLE = {
  fillColor: '#3388ff',
  weight: 1,
  opacity: 1,
  color: 'white',
  fillOpacity: 0.7
};

// Hover style
export const HOVER_STYLE = {
  weight: 3,
  color: '#666',
  fillOpacity: 0.9
};

// Selected style
export const SELECTED_STYLE = {
  weight: 3,
  color: '#000',
  fillOpacity: 0.9
};

// Animation settings
export const ANIMATION_CONFIG = {
  intervalMs: 2000, // Time between frames in milliseconds
  transitionDuration: 500 // Transition duration in milliseconds
};

// Export settings
export const EXPORT_CONFIG = {
  imageFormat: 'png',
  imageQuality: 1.0,
  pdfOrientation: 'landscape',
  pdfUnit: 'mm',
  pdfFormat: 'a4'
};

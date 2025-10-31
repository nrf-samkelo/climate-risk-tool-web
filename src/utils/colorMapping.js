import chroma from 'chroma-js';

/**
 * Generate color scale based on climate index metadata
 * @param {Object} indexMetadata - Climate index metadata from API
 * @param {Array} values - Array of climate values for the index
 * @returns {Function} Chroma color scale function
 */
export const getColorScale = (indexMetadata, values = []) => {
  if (!indexMetadata) {
    return chroma.scale(['#3388ff']).domain([0, 1]);
  }

  const { color_scheme, anomaly_direction } = indexMetadata;

  // Calculate min and max from values
  const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  const min = validValues.length > 0 ? Math.min(...validValues) : -1;
  const max = validValues.length > 0 ? Math.max(...validValues) : 1;

  // Get absolute max for symmetric diverging scales
  const absMax = Math.max(Math.abs(min), Math.abs(max));

  // Map color schemes to Chroma.js color arrays
  let colors;
  let domain;

  switch (color_scheme) {
    case 'RdBu_r':
      // Red-Blue reversed (Red for high, Blue for low)
      colors = ['#2166ac', '#4393c3', '#92c5de', '#d1e5f0', '#f7f7f7',
                '#fddbc7', '#f4a582', '#d6604d', '#b2182b'];
      break;

    case 'BuRd':
      // Blue-Red (Blue for high, Red for low)
      colors = ['#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7',
                '#d1e5f0', '#92c5de', '#4393c3', '#2166ac'];
      break;

    case 'RdBu':
      // Red-Blue (Red for low, Blue for high)
      colors = ['#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7',
                '#d1e5f0', '#92c5de', '#4393c3', '#2166ac'];
      break;

    default:
      colors = ['#2166ac', '#4393c3', '#92c5de', '#d1e5f0', '#f7f7f7',
                '#fddbc7', '#f4a582', '#d6604d', '#b2182b'];
  }

  // Determine domain based on anomaly direction
  switch (anomaly_direction) {
    case 'positive_bad':
      // Positive anomalies are bad (e.g., more drought days, more heat)
      // Red = high positive (bad), Blue = negative (good)
      domain = [-absMax, 0, absMax];
      colors = ['#2166ac', '#f7f7f7', '#b2182b']; // Blue -> White -> Red
      break;

    case 'positive_good':
      // Positive anomalies are good (e.g., more precipitation)
      // Blue = high positive (good), Red = negative (bad)
      domain = [-absMax, 0, absMax];
      colors = ['#b2182b', '#f7f7f7', '#2166ac']; // Red -> White -> Blue
      break;

    case 'negative_warming':
      // Negative values indicate warming (e.g., fewer frost days)
      // Red = negative (warming), Blue = positive (cooling)
      domain = [-absMax, 0, absMax];
      colors = ['#b2182b', '#f7f7f7', '#2166ac']; // Red -> White -> Blue
      break;

    case 'positive_warming':
      // Positive values indicate warming (e.g., more hot days)
      // Red = positive (warming), Blue = negative (cooling)
      domain = [-absMax, 0, absMax];
      colors = ['#2166ac', '#f7f7f7', '#b2182b']; // Blue -> White -> Red
      break;

    default:
      // Default diverging scale
      domain = [-absMax, 0, absMax];
      colors = ['#2166ac', '#f7f7f7', '#b2182b'];
  }

  // Create and return Chroma scale
  return chroma.scale(colors).domain(domain).mode('lab');
};

/**
 * Get color for a specific value using the color scale
 * @param {number} value - Climate anomaly value
 * @param {Function} colorScale - Chroma color scale function
 * @returns {string} Hex color string
 */
export const getColorForValue = (value, colorScale) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '#cccccc'; // Gray for missing data
  }
  return colorScale(value).hex();
};

/**
 * Generate legend items for a color scale
 * @param {Function} colorScale - Chroma color scale function
 * @param {number} steps - Number of legend steps (default: 7)
 * @returns {Array} Array of {value, color} objects
 */
export const generateLegendItems = (colorScale, steps = 7) => {
  const domain = colorScale.domain();
  const min = domain[0];
  const max = domain[domain.length - 1];
  const step = (max - min) / (steps - 1);

  const items = [];
  for (let i = 0; i < steps; i++) {
    const value = min + (step * i);
    items.push({
      value: value,
      color: colorScale(value).hex(),
      label: value.toFixed(2)
    });
  }

  return items;
};

/**
 * Get interpretation label based on anomaly direction
 * @param {string} anomalyDirection - Anomaly direction from metadata
 * @returns {Object} Label configuration {positive, negative}
 */
export const getInterpretationLabels = (anomalyDirection) => {
  switch (anomalyDirection) {
    case 'positive_bad':
      return { positive: 'Worse', negative: 'Better', neutral: 'No Change' };

    case 'positive_good':
      return { positive: 'Better', negative: 'Worse', neutral: 'No Change' };

    case 'negative_warming':
      return { positive: 'Cooling', negative: 'Warming', neutral: 'No Change' };

    case 'positive_warming':
      return { positive: 'Warming', negative: 'Cooling', neutral: 'No Change' };

    default:
      return { positive: 'Increase', negative: 'Decrease', neutral: 'No Change' };
  }
};

/**
 * Extract values from GeoJSON features
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @returns {Array} Array of values
 */
export const extractValuesFromGeoJSON = (geojson) => {
  if (!geojson || !geojson.features) {
    return [];
  }

  return geojson.features
    .map(feature => feature.properties.value)
    .filter(value => value !== null && value !== undefined && !isNaN(value));
};

/**
 * Calculate statistics for values
 * @param {Array} values - Array of numeric values
 * @returns {Object} Statistics {min, max, mean, median}
 */
export const calculateStatistics = (values) => {
  const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));

  if (validValues.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0 };
  }

  const sorted = [...validValues].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const mean = sum / validValues.length;
  const median = sorted[Math.floor(sorted.length / 2)];

  return { min, max, mean, median };
};

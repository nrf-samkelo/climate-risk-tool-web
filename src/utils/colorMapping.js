import chroma from 'chroma-js';

/**
 * ColorBrewer palette definitions
 * Based on SAEON authoritative guidance for climate anomaly visualization
 *
 * These are the SPECIFIC color palettes defined by ColorBrewer.
 * The API's color_scheme field tells us which one to use.
 */
const COLOR_SCHEMES = {
  'RdBu_r': ['#2166ac', '#f7f7f7', '#b2182b'], // Blue → White → Red (for heat/drought)
  'BuRd':   ['#b2182b', '#f7f7f7', '#2166ac'], // Red → White → Blue (for precipitation)
  'RdBu':   ['#2166ac', '#f7f7f7', '#b2182b'], // Blue → White → Red (for cold indices)
};

/**
 * Generate color scale based on climate index metadata
 *
 * Uses THREE API fields correctly:
 * 1. color_palette_type: HOW to apply (e.g., "diverging" = center at zero)
 * 2. color_scheme: WHICH colors to use (e.g., "RdBu_r" = specific palette)
 * 3. anomaly_direction: What colors MEAN (for labels only, NOT for modifying colors)
 *
 * @param {Object} indexMetadata - Climate index metadata from API
 * @param {Array} values - Array of climate values for the index
 * @returns {Function} Chroma color scale function
 */
export const getColorScale = (indexMetadata, values = []) => {
  if (!indexMetadata) {
    return chroma.scale(['#3388ff']).domain([0, 1]);
  }

  // Extract the three color-related fields from API
  const { color_palette_type, color_scheme, anomaly_direction } = indexMetadata;

  // Calculate min and max from values
  const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  const min = validValues.length > 0 ? Math.min(...validValues) : -1;
  const max = validValues.length > 0 ? Math.max(...validValues) : 1;

  // Get absolute max for symmetric diverging scales
  const absMax = Math.max(Math.abs(min), Math.abs(max));

  // Step 1: Check color_palette_type to know HOW to apply colors
  if (color_palette_type === 'diverging') {
    // Step 2: Use color_scheme to know WHICH specific colors to use
    // The backend has already chosen the appropriate scheme for this index
    const colors = COLOR_SCHEMES[color_scheme] || COLOR_SCHEMES['RdBu_r'];

    // Step 3: Create diverging scale with symmetric domain centered at zero
    const domain = [-absMax, 0, absMax];

    // Step 4: anomaly_direction is NOT used here!
    // It's only for interpretation (labels/tooltips) - see getInterpretationLabels()

    return chroma.scale(colors).domain(domain).mode('lab');
  }

  // Fallback for non-diverging scales (currently all indices use diverging)
  return chroma.scale(['#2166ac', '#f7f7f7', '#b2182b']).domain([-absMax, 0, absMax]).mode('lab');
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
 * Get interpretation labels based on anomaly_direction from API
 *
 * This is where anomaly_direction is USED - for creating meaningful labels!
 * NOT for modifying the color scale itself.
 *
 * @param {string} direction - Anomaly direction from metadata (API field: 'anomaly_direction')
 * @returns {Object} Label configuration {positive, negative, neutral}
 */
export const getInterpretationLabels = (direction) => {
  switch (direction) {
    case 'positive_bad':
      // Positive anomalies = worse (e.g., CDD, TXge30 - more heat/drought)
      return { positive: 'Worse', negative: 'Better', neutral: 'No Change' };

    case 'positive_good':
      // Positive anomalies = better (e.g., PRCPTOT - more rainfall)
      return { positive: 'Better', negative: 'Worse', neutral: 'No Change' };

    case 'negative_warming':
      // Negative anomalies = warming (e.g., FD - fewer frost days)
      return { positive: 'Cooling', negative: 'Warming', neutral: 'No Change' };

    case 'positive_warming':
      // Positive anomalies = warming (e.g., TNN - warmer coldest nights)
      return { positive: 'Warming', negative: 'Cooling', neutral: 'No Change' };

    case 'neutral':
      // Neither clearly good nor bad
      return { positive: 'Increase', negative: 'Decrease', neutral: 'No Change' };

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
 * Extract metadata from GeoJSON response
 * Uses the first feature's properties to get scenario, period, and index info
 * @param {Object} geojson - GeoJSON FeatureCollection from API
 * @returns {Object} Metadata {scenario, period, periodStart, periodEnd, indexCode}
 */
export const extractMetadataFromGeoJSON = (geojson) => {
  if (!geojson || !geojson.features || geojson.features.length === 0) {
    return null;
  }

  const firstFeature = geojson.features[0];
  const props = firstFeature.properties;

  return {
    scenario: props.scenario,
    period: props.period,
    periodStart: props.period_start,
    periodEnd: props.period_end,
    indexCode: props.index_code,
  };
};

/**
 * Extract all unique municipalities from GeoJSON
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @returns {Array} Array of municipality objects
 */
export const extractMunicipalitiesFromGeoJSON = (geojson) => {
  if (!geojson || !geojson.features) {
    return [];
  }

  return geojson.features.map(feature => ({
    id: feature.properties.id,
    name: feature.properties.municipality_name,
    code: feature.properties.municipality_code,
    province: feature.properties.province,
    districtCode: feature.properties.district_code,
    districtName: feature.properties.district_name,
    centroidLat: feature.properties.centroid_lat,
    centroidLon: feature.properties.centroid_lon,
    areaKm2: feature.properties.area_km2,
    value: feature.properties.value,
  }));
};

/**
 * Group municipalities by district from GeoJSON
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @returns {Object} Object with district codes as keys
 */
export const groupByDistrict = (geojson) => {
  if (!geojson || !geojson.features) {
    return {};
  }

  const districts = {};

  geojson.features.forEach(feature => {
    const districtCode = feature.properties.district_code;
    if (!districts[districtCode]) {
      districts[districtCode] = {
        code: districtCode,
        name: feature.properties.district_name,
        municipalities: [],
      };
    }

    districts[districtCode].municipalities.push({
      id: feature.properties.id,
      name: feature.properties.municipality_name,
      code: feature.properties.municipality_code,
      value: feature.properties.value,
    });
  });

  return districts;
};

/**
 * Group municipalities by province from GeoJSON
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @returns {Object} Object with province names as keys
 */
export const groupByProvince = (geojson) => {
  if (!geojson || !geojson.features) {
    return {};
  }

  const provinces = {};

  geojson.features.forEach(feature => {
    const province = feature.properties.province;
    if (!provinces[province]) {
      provinces[province] = [];
    }

    provinces[province].push({
      id: feature.properties.id,
      name: feature.properties.municipality_name,
      code: feature.properties.municipality_code,
      value: feature.properties.value,
    });
  });

  return provinces;
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

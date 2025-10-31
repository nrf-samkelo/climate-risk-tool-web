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

  // API uses 'risk_direction' field
  const { color_scheme, risk_direction } = indexMetadata;
  const direction = risk_direction;

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

  // Determine domain based on risk_direction from API
  // API values: 'higher_worse', 'lower_worse', 'neutral'
  switch (direction) {
    case 'higher_worse':
      // Higher values are worse (e.g., more drought days, more heat)
      // Red = high positive (bad), Blue = negative (good)
      domain = [-absMax, 0, absMax];
      colors = ['#2166ac', '#f7f7f7', '#b2182b']; // Blue -> White -> Red
      break;

    case 'lower_worse':
      // Lower values are worse (e.g., fewer frost days = warming)
      // Red = negative (bad/warming), Blue = positive (good/cooling)
      domain = [-absMax, 0, absMax];
      colors = ['#b2182b', '#f7f7f7', '#2166ac']; // Red -> White -> Blue
      break;

    case 'neutral':
      // Neutral interpretation
      // Blue = high positive, Red = negative
      domain = [-absMax, 0, absMax];
      colors = ['#b2182b', '#f7f7f7', '#2166ac']; // Red -> White -> Blue
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
 * Get interpretation label based on risk_direction from API
 * @param {string} direction - Risk direction from metadata (API field: 'risk_direction')
 * @returns {Object} Label configuration {positive, negative, neutral}
 */
export const getInterpretationLabels = (direction) => {
  switch (direction) {
    case 'higher_worse':
      return { positive: 'Worse', negative: 'Better', neutral: 'No Change' };

    case 'lower_worse':
      return { positive: 'Better/Cooling', negative: 'Worse/Warming', neutral: 'No Change' };

    case 'neutral':
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

/**
 * Aggregate climate data at district level with proper statistical calculation
 * Uses MEAN aggregation for climate anomaly values (appropriate for anomalies)
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @returns {Object} District-level aggregated data with statistics
 */
export const aggregateByDistrict = (geojson) => {
  if (!geojson || !geojson.features) {
    return {};
  }

  const districts = {};

  geojson.features.forEach(feature => {
    const props = feature.properties;
    const districtCode = props.district_code;

    if (!districts[districtCode]) {
      districts[districtCode] = {
        code: districtCode,
        name: props.district_name,
        municipalities: [],
        values: [],
        count: 0,
        totalArea: 0,
      };
    }

    // Collect municipality data
    districts[districtCode].municipalities.push({
      id: props.id,
      name: props.municipality_name,
      code: props.municipality_code,
      value: props.value,
      area: props.area_km2,
    });

    // Collect values for statistical aggregation
    if (props.value !== null && props.value !== undefined && !isNaN(props.value)) {
      districts[districtCode].values.push(props.value);
    }

    districts[districtCode].count += 1;
    districts[districtCode].totalArea += props.area_km2 || 0;
  });

  // Calculate aggregated statistics for each district
  Object.keys(districts).forEach(code => {
    const district = districts[code];
    const stats = calculateStatistics(district.values);

    // For climate anomalies, MEAN is most appropriate
    // This represents the average anomaly across municipalities in the district
    district.aggregatedValue = stats.mean;
    district.min = stats.min;
    district.max = stats.max;
    district.median = stats.median;
    district.stdDev = calculateStdDev(district.values);
  });

  return districts;
};

/**
 * Calculate standard deviation for climate data quality assessment
 * @param {Array} values - Array of numeric values
 * @returns {number} Standard deviation
 */
const calculateStdDev = (values) => {
  const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));

  if (validValues.length === 0) return 0;

  const mean = validValues.reduce((acc, val) => acc + val, 0) / validValues.length;
  const variance = validValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / validValues.length;

  return Math.sqrt(variance);
};

import { useEffect, useMemo, useState } from 'react';
import { GeoJSON, Popup } from 'react-leaflet';
import { useClimate } from '../../context/ClimateContext';
import { useIndices } from '../../context/IndicesContext';
import {
  getColorScale,
  getColorForValue,
  extractValuesFromGeoJSON,
  extractMetadataFromGeoJSON,
} from '../../utils/colorMapping';
import { formatScenario, formatPeriod } from '../../utils/constants';
import { DEFAULT_STYLE, HOVER_STYLE, SELECTED_STYLE } from '../../utils/constants';

/**
 * ClimateLayer - Renders GeoJSON municipality polygons with climate data styling
 * Leverages API response properties for dynamic coloring and popups
 */
const ClimateLayer = ({ searchHighlightedMunicipalityId = null }) => {
  const { geojsonData, selectedMunicipality, setSelectedMunicipality } = useClimate();
  const { getIndexByCode } = useIndices();
  const [hoveredMunicipalityId, setHoveredMunicipalityId] = useState(null);

  // Extract metadata from GeoJSON response
  const metadata = useMemo(() => {
    return extractMetadataFromGeoJSON(geojsonData);
  }, [geojsonData]);

  // Get climate index metadata
  const indexMetadata = useMemo(() => {
    if (!metadata?.indexCode) return null;
    return getIndexByCode(metadata.indexCode);
  }, [metadata, getIndexByCode]);

  // Extract values and create color scale
  const colorScale = useMemo(() => {
    if (!geojsonData || !indexMetadata) return null;
    const values = extractValuesFromGeoJSON(geojsonData);
    return getColorScale(indexMetadata, values);
  }, [geojsonData, indexMetadata]);

  // Style function for each municipality feature
  const styleFeature = (feature) => {
    const value = feature.properties.value;
    const municipalityId = feature.properties.id;

    // Determine if this municipality should be grayed out (search highlight active but not this one)
    const isGrayedOut = searchHighlightedMunicipalityId && searchHighlightedMunicipalityId !== municipalityId;

    // Determine fill color based on climate value
    const fillColor = colorScale
      ? getColorForValue(value, colorScale)
      : DEFAULT_STYLE.fillColor;

    // If grayed out, use gray color
    if (isGrayedOut) {
      return {
        ...DEFAULT_STYLE,
        fillColor: '#e5e7eb',
        fillOpacity: 0.4,
        color: '#d1d5db',
        weight: 1,
      };
    }

    // Apply different styles based on state
    if (selectedMunicipality?.id === municipalityId) {
      return {
        ...SELECTED_STYLE,
        fillColor,
      };
    }

    if (hoveredMunicipalityId === municipalityId) {
      return {
        ...HOVER_STYLE,
        fillColor,
      };
    }

    return {
      ...DEFAULT_STYLE,
      fillColor,
    };
  };

  // Event handlers
  const onEachFeature = (feature, layer) => {
    const props = feature.properties;

    // Create popup content using API response properties
    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
          ${props.municipality_name}
        </h3>
        <div style="font-size: 13px; color: #666;">
          <p style="margin: 4px 0;"><strong>Code:</strong> ${props.municipality_code}</p>
          <p style="margin: 4px 0;"><strong>Province:</strong> ${props.province}</p>
          <p style="margin: 4px 0;"><strong>District:</strong> ${props.district_name} (${props.district_code})</p>
          <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="margin: 4px 0;"><strong>Index:</strong> ${props.index_code?.toUpperCase()}</p>
          <p style="margin: 4px 0;"><strong>Scenario:</strong> ${formatScenario(props.scenario).fullLabel}</p>
          <p style="margin: 4px 0;"><strong>Period:</strong> ${props.period_start}-${props.period_end}</p>
          <p style="margin: 8px 0 4px 0; font-size: 14px;">
            <strong>Value:</strong>
            <span style="color: ${colorScale ? getColorForValue(props.value, colorScale) : '#000'}; font-weight: bold;">
              ${props.value !== null && props.value !== undefined ? props.value.toFixed(3) : 'N/A'}
            </span>
            ${indexMetadata?.unit ? ` ${indexMetadata.unit}` : ''}
          </p>
          ${indexMetadata?.interpretation ? `
            <p style="margin: 4px 0; font-size: 12px; font-style: italic; color: #555;">
              ${indexMetadata.interpretation}
            </p>
          ` : ''}
          <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>Area:</strong> ${props.area_km2?.toFixed(2)} km²
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>Centroid:</strong> ${props.centroid_lat?.toFixed(4)}, ${props.centroid_lon?.toFixed(4)}
          </p>
        </div>
      </div>
    `;

    // Bind popup
    layer.bindPopup(popupContent);

    // Mouse events
    layer.on({
      mouseover: (e) => {
        setHoveredMunicipalityId(props.id);
        layer.setStyle(HOVER_STYLE);
      },
      mouseout: (e) => {
        setHoveredMunicipalityId(null);
        // Reset style based on selection state
        if (selectedMunicipality?.id !== props.id) {
          layer.setStyle(styleFeature(feature));
        }
      },
      click: (e) => {
        // Set selected municipality using all available properties from API
        setSelectedMunicipality({
          id: props.id,
          name: props.municipality_name,
          code: props.municipality_code,
          province: props.province,
          districtCode: props.district_code,
          districtName: props.district_name,
          centroidLat: props.centroid_lat,
          centroidLon: props.centroid_lon,
          areaKm2: props.area_km2,
          value: props.value,
          scenario: props.scenario,
          period: props.period,
          periodStart: props.period_start,
          periodEnd: props.period_end,
          indexCode: props.index_code,
        });
      },
    });
  };

  // Force re-render when data or styles change
  const key = useMemo(() => {
    if (!geojsonData) return 'empty';
    return `${metadata?.scenario}-${metadata?.period}-${metadata?.indexCode}-${selectedMunicipality?.id || 'none'}-${searchHighlightedMunicipalityId || 'none'}`;
  }, [geojsonData, metadata, selectedMunicipality, searchHighlightedMunicipalityId]);

  if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
    return null;
  }

  return (
    <GeoJSON
      key={key}
      data={geojsonData}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
};

export default ClimateLayer;

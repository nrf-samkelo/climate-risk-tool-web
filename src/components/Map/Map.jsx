import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { MAP_CONFIG, SA_BOUNDS } from '../../utils/constants';
import 'leaflet/dist/leaflet.css';
import styles from './Map.module.css';

/**
 * Component to fit map to South Africa bounds
 */
function MapBoundsController() {
  const map = useMap();

  useEffect(() => {
    // Fit map to South Africa bounds
    map.fitBounds(SA_BOUNDS);
  }, [map]);

  return null;
}

/**
 * Main Map Component
 */
const Map = ({ children }) => {
  const mapRef = useRef(null);

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        className={styles.map}
        ref={mapRef}
        zoomControl={true}
        attributionControl={true}
      >
        {/* OpenStreetMap Base Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Fit map to South Africa bounds */}
        <MapBoundsController />

        {/* Children components (ClimateLayer, Legend, etc.) */}
        {children}
      </MapContainer>
    </div>
  );
};

export default Map;

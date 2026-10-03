export const MAP_CONFIG = {
  styleUrl: import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty',
  defaultZoom: 12,
  minZoom: 10,
  maxZoom: 18,
  // Chennai center
  defaultCenter: {
    longitude: 80.2707,
    latitude: 13.0827
  },
  markerUpdateIntervalMs: 1000 // How often to interpolate marker UI (separate from simulation tick)
};

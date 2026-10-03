import { lineString, along, distance, length, bearing } from '@turf/turf';

export const calculateDistance = (p1: [number, number], p2: [number, number]): number => {
  return distance(p1, p2, { units: 'kilometers' });
};

export const getPointAtDistance = (path: [number, number][], distanceKm: number) => {
  if (path.length < 2) return path[0] || [0, 0];
  const line = lineString(path);
  const point = along(line, distanceKm, { units: 'kilometers' });
  return point.geometry.coordinates as [number, number];
};

export const calculateBearing = (p1: [number, number], p2: [number, number]): number => {
  return bearing(p1, p2);
};

export const getRouteLength = (path: [number, number][]): number => {
  if (path.length < 2) return 0;
  const line = lineString(path);
  return length(line, { units: 'kilometers' });
};

import { CabSimState, SimulationState } from './enums';

export interface CabSimulationState {
  cabId: string;
  driverId: string;
  tripId?: string;
  bookingId?: string;
  passengerId?: string;
  routeId: string;
  isReverse: boolean;
  startLocationName: string;
  destinationLocationName: string;
  state: CabSimState;
  routePhase: 'DISPATCH' | 'PICKUP_DWELL' | 'TRIP' | 'DROPOFF_DWELL' | 'COMPLETED';
  dwellTimer: number;
  
  // Positional Data
  latitude: number;
  longitude: number;
  heading: number;
  
  // Route Progress
  totalRouteDistance: number;
  distanceTraveledKm: number;
  routeProgress: number; // 0 to 1
  currentWaypointIndex: number;
  
  // Physics Data
  baseSpeed: number; // km/h
  currentSpeed: number; // km/h
  targetSpeed: number;  // km/h
  acceleration: number; // m/s^2
  brakeApplied: boolean;
  pauseRemainingMs: number;
  
  // Timing
  lastTickTime: number; // ms
  timeInCurrentState: number; // ms
  
  // Event tracking
  isOffRoute: boolean;
  activeEventId?: string;

  // Anomaly injection state (managed by SimulationEngine)
  activeAnomalyType?: 'OVER_SPEEDING' | 'HARSH_BRAKE' | 'SUDDEN_ACCEL' | 'SOS' | null;
  anomalyStartMs?: number;
  anomalyDurationMs?: number;
  anomalyTargetSpeed?: number;
}

export interface SimulationConfig {
  state: SimulationState;
  speedMultiplier: number;
  activeCabs: number;
  tickIntervalMs: number;
}

import { CabSimState, SimulationState } from './enums';

export interface CabSimulationState {
  cabId: string;
  driverId: string;
  tripId?: string;
  routeId: string;
  state: CabSimState;
  
  // Positional Data
  latitude: number;
  longitude: number;
  heading: number;
  
  // Route Progress
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
}

export interface SimulationConfig {
  state: SimulationState;
  speedMultiplier: number;
  activeCabs: number;
  tickIntervalMs: number;
}

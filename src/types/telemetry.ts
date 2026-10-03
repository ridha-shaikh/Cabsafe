import { EngineStatus } from './enums';

export interface Telemetry {
  telemetryId: string;
  cabId: string;
  driverId: string;
  tripId?: string;
  timestamp: string; // ISO format with milliseconds
  latitude: number;
  longitude: number;
  speed: number;       // km/h
  acceleration: number;// m/s^2
  heading: number;     // degrees (0-360)
  brakeStatus: boolean;
  engineStatus: EngineStatus;
  fuelLevel: number;   // 0-100%
}

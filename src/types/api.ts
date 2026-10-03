export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Complex DTOs for joined data (Views)

export interface DriverDetail {
  driver: import('./entities').Driver;
  safetyScore: import('./entities').SafetyScore;
  recentTrips: import('./entities').Trip[];
  recentEvents: import('./entities').DriverBehaviourEvent[];
}

export interface CabDetail {
  cab: import('./entities').Cab;
  driver?: import('./entities').Driver;
  maintenanceHistory: import('./entities').MaintenanceRecord[];
  recentTrips: import('./entities').Trip[];
  activeAlerts: import('./entities').Alert[];
}

export interface PassengerDetail {
  passenger: import('./entities').Passenger;
  recentBookings: import('./entities').Booking[];
  recentTrips: import('./entities').Trip[];
  sosHistory: import('./entities').SOSRequest[];
}

export interface TripDetail {
  trip: import('./entities').Trip;
  cab: import('./entities').Cab;
  driver: import('./entities').Driver;
  passenger: import('./entities').Passenger;
  events: import('./entities').DriverBehaviourEvent[];
  route?: import('./entities').Route;
  telemetryHistory: import('./telemetry').Telemetry[];
  rating?: import('./entities').DriverRating;
}

export interface DashboardStats {
  totalCabs: number;
  activeCabs: number;
  idleCabs: number;
  offlineCabs: number;
  maintenanceCabs: number;
  activeTrips: number;
  totalDrivers: number;
  safetyEventsToday: number;
  activeSos: number;
}

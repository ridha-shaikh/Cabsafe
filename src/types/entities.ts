import {
  UserRole,
  DriverStatus,
  CabStatus,
  FuelType,
  BookingStatus,
  TripStatus,
  LocationType,
  PaymentMethod,
  EventSeverity,
  EventType,
  EventStatus,
  AlertSeverity,
  AlertType,
  AlertStatus,
  SOSSeverity,
  SOSStatus,
  NotificationType,
  NotificationPriority,
  MaintenanceServiceType,
  MaintenanceStatus,
} from './enums';

export interface User {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Driver extends User {
  driverId: string;
  licenseNumber: string;
  licenseExpiry: string; // YYYY-MM-DD
  assignedCabId?: string;
  status: DriverStatus;
  totalTrips: number;
  totalDistanceKm: number;
  joinedDate: string; // YYYY-MM-DD
}

export interface Passenger extends User {
  passengerId: string;
  emergencyContact?: string;
  totalTrips: number;
  totalSosRequests: number;
  preferredPayment: PaymentMethod;
}

export interface FleetManager extends User {
  managerId: string;
  department: string;
  region: string;
}

export interface Cab {
  cabId: string;
  registrationNumber: string;
  model: string;
  makeYear: number;
  color: string;
  fuelType: FuelType;
  seatingCapacity: number;
  status: CabStatus;
  currentLatitude?: number;
  currentLongitude?: number;
  currentSpeed: number;
  lastTelemetryAt?: string;
  mileageKm: number;
  insuranceExpiry?: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Location {
  locationId: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  locationType: LocationType;
  city: string;
}

export interface Route {
  routeId: string;
  name: string;
  description?: string;
  distanceKm: number;
  estimatedDurationMin: number;
  waypointsJson: { lat: number; lng: number; name?: string }[];
  startLocationId?: string;
  endLocationId?: string;
}

export interface Booking {
  bookingId: string;
  passengerId: string;
  pickupLocationId: string;
  dropoffLocationId: string;
  cabId?: string;
  driverId?: string;
  bookingTime: string;
  scheduledTime?: string;
  fareEstimate: number;
  status: BookingStatus;
  cancellationReason?: string;
  createdAt: string;
}

export interface Trip {
  tripId: string;
  bookingId: string;
  cabId: string;
  driverId: string;
  passengerId: string;
  routeId?: string;
  startTime?: string;
  endTime?: string;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  distanceKm: number;
  durationMin: number;
  avgSpeed: number;
  maxSpeed: number;
  fare: number;
  status: TripStatus;
  createdAt: string;
}

export interface SafetyEvent {
  eventId: string;
  cabId: string;
  driverId: string;
  tripId?: string;
  eventType: EventType;
  severity: EventSeverity;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  maxValue?: number;
  thresholdValue?: number;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  telemetrySnapshot?: any;
  status: EventStatus;
  createdAt: string;
}

export interface Alert {
  alertId: string;
  eventId?: string;
  sosId?: string;
  alertType: AlertType;
  cabId: string;
  driverId?: string;
  tripId?: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface SOSRequest {
  sosId: string;
  tripId: string;
  passengerId: string;
  driverId: string;
  cabId: string;
  latitude: number;
  longitude: number;
  reason?: string;
  severity: SOSSeverity;
  status: SOSStatus;
  handledBy?: string;
  responseTimeSec?: number;
  resolutionNotes?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface DriverRating {
  ratingId: string;
  tripId: string;
  driverId: string;
  passengerId: string;
  rating: number; // 1.0 to 5.0
  feedback?: string;
  createdAt: string;
}

export interface SafetyScore {
  scoreId: string;
  driverId: string;
  currentScore: number; // 0.0 to 100.0
  totalEvents: number;
  lowEvents: number;
  mediumEvents: number;
  highEvents: number;
  criticalEvents: number;
  totalTrips: number;
  totalDistanceKm: number;
  lastEventAt?: string;
  lastCalculatedAt: string;
}

export interface MaintenanceRecord {
  maintenanceId: string;
  cabId: string;
  serviceType: MaintenanceServiceType;
  description?: string;
  serviceDate: string; // YYYY-MM-DD
  nextServiceDate?: string; // YYYY-MM-DD
  mileageAtService?: number;
  cost: number;
  mechanicName?: string;
  serviceCenter?: string;
  status: MaintenanceStatus;
  createdAt: string;
}

export interface Notification {
  notificationId: string;
  userId: string;
  alertId?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

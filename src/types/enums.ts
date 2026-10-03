// ============================================================
// CabSafe Enum Definitions
// Mirrors database ENUM types for frontend type safety
// ============================================================

export enum UserRole {
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER',
  FLEET_MANAGER = 'FLEET_MANAGER',
  ADMIN = 'ADMIN',
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  OFF_DUTY = 'OFF_DUTY',
  SUSPENDED = 'SUSPENDED',
}

export enum CabStatus {
  ACTIVE = 'ACTIVE',
  IDLE = 'IDLE',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE',
  RETIRED = 'RETIRED',
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  CNG = 'CNG',
  ELECTRIC = 'ELECTRIC',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EMERGENCY = 'EMERGENCY',
}

export enum EngineStatus {
  RUNNING = 'RUNNING',
  IDLE = 'IDLE',
  OFF = 'OFF',
}

export enum EventType {
  OVER_SPEEDING = 'OVER_SPEEDING',
  HARSH_BRAKING = 'HARSH_BRAKING',
  SUDDEN_ACCELERATION = 'SUDDEN_ACCELERATION',
}

export enum EventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum EventStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

export enum AlertType {
  OVER_SPEEDING = 'OVER_SPEEDING',
  HARSH_BRAKING = 'HARSH_BRAKING',
  SUDDEN_ACCELERATION = 'SUDDEN_ACCELERATION',
  SOS = 'SOS',
  VEHICLE_ISSUE = 'VEHICLE_ISSUE',
  MAINTENANCE_DUE = 'MAINTENANCE_DUE',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export enum SOSStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESPONDING = 'RESPONDING',
  RESOLVED = 'RESOLVED',
  FALSE_ALARM = 'FALSE_ALARM',
}

export enum SOSSeverity {
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum NotificationType {
  ALERT = 'ALERT',
  SOS = 'SOS',
  BOOKING = 'BOOKING',
  TRIP = 'TRIP',
  MAINTENANCE = 'MAINTENANCE',
  SYSTEM = 'SYSTEM',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum MaintenanceServiceType {
  OIL_CHANGE = 'OIL_CHANGE',
  TIRE_ROTATION = 'TIRE_ROTATION',
  BRAKE_SERVICE = 'BRAKE_SERVICE',
  ENGINE_CHECK = 'ENGINE_CHECK',
  FULL_SERVICE = 'FULL_SERVICE',
  BATTERY = 'BATTERY',
  AC_SERVICE = 'AC_SERVICE',
  OTHER = 'OTHER',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

export enum LocationType {
  AIRPORT = 'AIRPORT',
  STATION = 'STATION',
  MALL = 'MALL',
  OFFICE = 'OFFICE',
  RESIDENTIAL = 'RESIDENTIAL',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
}

// Simulation-specific enums
export enum SimulationState {
  STOPPED = 'STOPPED',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
}

export enum CabSimState {
  IDLE = 'IDLE',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  SPEEDING = 'SPEEDING',
  HARSH_BRAKE = 'HARSH_BRAKE',
  SUDDEN_ACCEL = 'SUDDEN_ACCEL',
  SOS = 'SOS',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE',
}

// Visual state for map markers
export enum CabVisualState {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  SOS = 'SOS',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
}

// Safety score labels
export enum SafetyLabel {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
  CRITICAL = 'Critical',
}

export function getSafetyLabel(score: number): SafetyLabel {
  if (score >= 90) return SafetyLabel.EXCELLENT;
  if (score >= 75) return SafetyLabel.GOOD;
  if (score >= 60) return SafetyLabel.FAIR;
  if (score >= 40) return SafetyLabel.POOR;
  return SafetyLabel.CRITICAL;
}

export function getSafetyColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getSafetyBgColor(score: number): string {
  if (score >= 90) return 'bg-green-100 text-green-800';
  if (score >= 75) return 'bg-blue-100 text-blue-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  if (score >= 40) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

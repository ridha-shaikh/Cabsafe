import { User, Driver, Passenger, FleetManager, Cab, Trip, Booking, SafetyEvent, Alert, SOSRequest, MaintenanceRecord, Location } from '../types/entities';
import { UserRole, DriverStatus, CabStatus, FuelType, PaymentMethod, TripStatus, BookingStatus, EventSeverity, EventType, EventStatus, AlertSeverity, AlertType, AlertStatus, SOSSeverity, SOSStatus, MaintenanceServiceType, MaintenanceStatus, LocationType, VehicleType } from '../types/enums';

export const MOCK_ADMIN: FleetManager = {
  userId: 'USR-ADM-01',
  managerId: 'MGR-001',
  email: 'admin@cabsafe.com',
  fullName: 'System Administrator',
  phone: '+91 9876543210',
  role: UserRole.FLEET_MANAGER,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  department: 'Operations',
  region: 'Chennai HQ',
};

export const MOCK_DRIVERS: Driver[] = [];
export const MOCK_CABS: Cab[] = [];
export const MOCK_PASSENGERS: Passenger[] = [];
export const MOCK_TRIPS: Trip[] = [];
export const MOCK_BOOKINGS: Booking[] = [];
export const MOCK_SAFETY_EVENTS: SafetyEvent[] = [];
export const MOCK_ALERTS: Alert[] = [];
export const MOCK_SOS: SOSRequest[] = [];
export const MOCK_MAINTENANCE: MaintenanceRecord[] = [];

// Deterministic seed definitions matching aws-backend/seed.sql
const DRIVER_NAMES = [
  'Arjun Kumar', 'Priya Sharma', 'Rahul Menon', 'Aisha Khan', 'Vikram Rao',
  'Neha Iyer', 'Karthik Patil', 'Sneha Reddy', 'Aditya Nair', 'Pooja Das',
  'Siddharth Singh', 'Anjali Gupta', 'Ravi Desai', 'Kavya Joshi', 'Suresh Bhat',
  'Deepa Chopra', 'Manoj Kumar', 'Divya Sharma', 'Vinay Menon', 'Meera Khan',
  'Arjun Rao', 'Priya Iyer', 'Rahul Patil', 'Aisha Reddy', 'Vikram Rao Nair',
  'Neha Das', 'Karthik Singh', 'Sneha Gupta', 'Aditya Desai', 'Pooja Joshi',
  'Siddharth Bhat', 'Anjali Chopra', 'Ravi Kumar', 'Kavya Sharma', 'Suresh Menon',
  'Deepa Khan', 'Manoj Rao', 'Divya Iyer', 'Vinay Patil', 'Meera Reddy',
  'Arjun Nair', 'Priya Das', 'Rahul Singh', 'Aisha Gupta', 'Vikram Desai',
  'Neha Joshi', 'Karthik Bhat', 'Sneha Chopra', 'Aditya Kumar', 'Pooja Sharma'
];

const CAB_DEFINITIONS: Array<{
  reg: string;
  model: string;
  type: VehicleType;
  year: number;
  color: string;
  fuel: FuelType;
  capacity: number;
  mileage: number;
}> = [
  { reg: 'TN-01-AB-1001', model: 'Hyundai Aura', type: VehicleType.SEDAN, year: 2021, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 45230 },
  { reg: 'TN-02-CD-1002', model: 'Maruti WagonR', type: VehicleType.HATCHBACK, year: 2020, color: 'Silver', fuel: FuelType.CNG, capacity: 4, mileage: 38120 },
  { reg: 'TN-03-EF-1003', model: 'Hyundai Creta', type: VehicleType.SUV, year: 2022, color: 'Grey', fuel: FuelType.PETROL, capacity: 5, mileage: 22100 },
  { reg: 'TN-04-GH-1004', model: 'Maruti Dzire', type: VehicleType.SEDAN, year: 2021, color: 'White', fuel: FuelType.CNG, capacity: 4, mileage: 51000 },
  { reg: 'TN-05-IJ-1005', model: 'Tata Tiago EV', type: VehicleType.HATCHBACK, year: 2023, color: 'Silver', fuel: FuelType.ELECTRIC, capacity: 4, mileage: 11200 },
  { reg: 'TN-06-KL-1006', model: 'Honda Amaze', type: VehicleType.SEDAN, year: 2020, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 62300 },
  { reg: 'TN-07-MN-1007', model: 'Kia Seltos', type: VehicleType.SUV, year: 2022, color: 'Grey', fuel: FuelType.PETROL, capacity: 5, mileage: 29800 },
  { reg: 'TN-08-OP-1008', model: 'Toyota Etios', type: VehicleType.SEDAN, year: 2019, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 78500 },
  { reg: 'TN-09-QR-1009', model: 'Maruti Ertiga', type: VehicleType.MPV, year: 2021, color: 'Silver', fuel: FuelType.CNG, capacity: 7, mileage: 44000 },
  { reg: 'TN-10-ST-1010', model: 'Tata Nexon EV', type: VehicleType.SUV, year: 2023, color: 'Grey', fuel: FuelType.ELECTRIC, capacity: 5, mileage: 14500 },
  { reg: 'TN-11-UV-1011', model: 'Hyundai Grand i10', type: VehicleType.HATCHBACK, year: 2020, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 55600 },
  { reg: 'TN-12-WX-1012', model: 'Maruti Dzire', type: VehicleType.SEDAN, year: 2021, color: 'Silver', fuel: FuelType.CNG, capacity: 4, mileage: 49200 },
  { reg: 'TN-13-YZ-1013', model: 'Kia Carens', type: VehicleType.MPV, year: 2022, color: 'White', fuel: FuelType.PETROL, capacity: 7, mileage: 31000 },
  { reg: 'TN-14-AB-1014', model: 'Honda Amaze', type: VehicleType.SEDAN, year: 2020, color: 'Grey', fuel: FuelType.CNG, capacity: 4, mileage: 67800 },
  { reg: 'TN-15-CD-1015', model: 'Hyundai Aura', type: VehicleType.SEDAN, year: 2021, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 43100 },
  { reg: 'TN-16-EF-1016', model: 'Tata Tigor EV', type: VehicleType.SEDAN, year: 2023, color: 'Silver', fuel: FuelType.ELECTRIC, capacity: 4, mileage: 9800 },
  { reg: 'TN-17-GH-1017', model: 'Toyota Etios', type: VehicleType.SEDAN, year: 2019, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 82000 },
  { reg: 'TN-18-IJ-1018', model: 'Maruti WagonR', type: VehicleType.HATCHBACK, year: 2020, color: 'Grey', fuel: FuelType.CNG, capacity: 4, mileage: 39500 },
  { reg: 'TN-19-KL-1019', model: 'Hyundai Creta', type: VehicleType.SUV, year: 2022, color: 'White', fuel: FuelType.PETROL, capacity: 5, mileage: 25600 },
  { reg: 'TN-20-MN-1020', model: 'Kia Seltos EV', type: VehicleType.SUV, year: 2023, color: 'Silver', fuel: FuelType.ELECTRIC, capacity: 5, mileage: 16300 },
  { reg: 'TN-21-OP-1021', model: 'Maruti Dzire', type: VehicleType.SEDAN, year: 2021, color: 'White', fuel: FuelType.CNG, capacity: 4, mileage: 47000 },
  { reg: 'TN-22-QR-1022', model: 'Honda Amaze', type: VehicleType.SEDAN, year: 2020, color: 'Grey', fuel: FuelType.PETROL, capacity: 4, mileage: 61200 },
  { reg: 'TN-23-ST-1023', model: 'Maruti Ertiga', type: VehicleType.MPV, year: 2021, color: 'White', fuel: FuelType.CNG, capacity: 7, mileage: 41500 },
  { reg: 'TN-24-UV-1024', model: 'Tata Tiago EV', type: VehicleType.HATCHBACK, year: 2023, color: 'Silver', fuel: FuelType.ELECTRIC, capacity: 4, mileage: 12400 },
  { reg: 'TN-25-WX-1025', model: 'Toyota Etios', type: VehicleType.SEDAN, year: 2019, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 75600 },
  { reg: 'TN-26-YZ-1026', model: 'Hyundai Grand i10', type: VehicleType.HATCHBACK, year: 2020, color: 'Grey', fuel: FuelType.CNG, capacity: 4, mileage: 52300 },
  { reg: 'TN-27-AB-1027', model: 'Maruti Dzire', type: VehicleType.SEDAN, year: 2021, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 46800 },
  { reg: 'TN-28-CD-1028', model: 'Kia Carens', type: VehicleType.MPV, year: 2022, color: 'Silver', fuel: FuelType.PETROL, capacity: 7, mileage: 28900 },
  { reg: 'TN-29-EF-1029', model: 'Hyundai Aura', type: VehicleType.SEDAN, year: 2021, color: 'White', fuel: FuelType.CNG, capacity: 4, mileage: 44500 },
  { reg: 'TN-30-GH-1030', model: 'Tata Nexon EV', type: VehicleType.SUV, year: 2023, color: 'Grey', fuel: FuelType.ELECTRIC, capacity: 5, mileage: 13200 },
  { reg: 'TN-31-IJ-1031', model: 'Honda Amaze', type: VehicleType.SEDAN, year: 2020, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 64700 },
  { reg: 'TN-32-KL-1032', model: 'Maruti WagonR', type: VehicleType.HATCHBACK, year: 2020, color: 'Silver', fuel: FuelType.CNG, capacity: 4, mileage: 37800 },
  { reg: 'TN-33-MN-1033', model: 'Toyota Etios', type: VehicleType.SEDAN, year: 2019, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 80200 },
  { reg: 'TN-34-OP-1034', model: 'Hyundai Creta', type: VehicleType.SUV, year: 2022, color: 'Grey', fuel: FuelType.PETROL, capacity: 5, mileage: 23800 },
  { reg: 'TN-35-QR-1035', model: 'Tata Tigor EV', type: VehicleType.SEDAN, year: 2023, color: 'Silver', fuel: FuelType.ELECTRIC, capacity: 4, mileage: 10600 },
  { reg: 'TN-36-ST-1036', model: 'Maruti Dzire', type: VehicleType.SEDAN, year: 2021, color: 'White', fuel: FuelType.CNG, capacity: 4, mileage: 50100 },
  { reg: 'TN-37-UV-1037', model: 'Kia Seltos', type: VehicleType.SUV, year: 2022, color: 'White', fuel: FuelType.PETROL, capacity: 5, mileage: 27400 },
  { reg: 'TN-38-WX-1038', model: 'Maruti Ertiga', type: VehicleType.MPV, year: 2021, color: 'Grey', fuel: FuelType.CNG, capacity: 7, mileage: 43800 },
  { reg: 'TN-39-YZ-1039', model: 'Honda Amaze', type: VehicleType.SEDAN, year: 2020, color: 'Silver', fuel: FuelType.PETROL, capacity: 4, mileage: 59700 },
  { reg: 'TN-40-AB-1040', model: 'Tata Tiago EV', type: VehicleType.HATCHBACK, year: 2023, color: 'White', fuel: FuelType.ELECTRIC, capacity: 4, mileage: 11900 },
  { reg: 'TN-41-CD-1041', model: 'Hyundai Grand i10', type: VehicleType.HATCHBACK, year: 2020, color: 'Grey', fuel: FuelType.CNG, capacity: 4, mileage: 54200 },
  { reg: 'TN-42-EF-1042', model: 'Maruti Dzire', type: VehicleType.SEDAN, year: 2021, color: 'Silver', fuel: FuelType.PETROL, capacity: 4, mileage: 47600 },
  { reg: 'TN-43-GH-1043', model: 'Toyota Etios', type: VehicleType.SEDAN, year: 2019, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 77400 },
  { reg: 'TN-44-IJ-1044', model: 'Kia Carens', type: VehicleType.MPV, year: 2022, color: 'White', fuel: FuelType.PETROL, capacity: 7, mileage: 30500 },
  { reg: 'TN-45-KL-1045', model: 'Hyundai Aura EV', type: VehicleType.SEDAN, year: 2023, color: 'Silver', fuel: FuelType.ELECTRIC, capacity: 4, mileage: 8900 },
  { reg: 'TN-46-MN-1046', model: 'Honda Amaze', type: VehicleType.SEDAN, year: 2020, color: 'Grey', fuel: FuelType.CNG, capacity: 4, mileage: 63400 },
  { reg: 'TN-47-OP-1047', model: 'Maruti WagonR', type: VehicleType.HATCHBACK, year: 2020, color: 'White', fuel: FuelType.PETROL, capacity: 4, mileage: 40100 },
  { reg: 'TN-48-QR-1048', model: 'Hyundai Creta', type: VehicleType.SUV, year: 2022, color: 'Silver', fuel: FuelType.PETROL, capacity: 5, mileage: 24600 },
  { reg: 'TN-49-ST-1049', model: 'Maruti Dzire', type: VehicleType.SEDAN, year: 2021, color: 'White', fuel: FuelType.CNG, capacity: 4, mileage: 48300 },
  { reg: 'TN-50-UV-1050', model: 'Tata Nexon EV', type: VehicleType.SUV, year: 2023, color: 'Grey', fuel: FuelType.ELECTRIC, capacity: 5, mileage: 15100 }
];

// Generate 50 stable Cabs and Drivers
for (let i = 1; i <= 50; i++) {
  const idStr = i.toString().padStart(3, '0');
  const cabDef = CAB_DEFINITIONS[i - 1];
  const driverName = DRIVER_NAMES[i - 1];
  const emailSlug = driverName.toLowerCase().replace(/[^a-z]/g, '');

  MOCK_DRIVERS.push({
    userId: `DRV-${idStr}`,
    driverId: `DRV-${idStr}`,
    email: `${emailSlug}${i}@cabsafe.in`,
    fullName: driverName,
    phone: `+91 91000${(10000 + i * 111).toString().slice(0, 5)}`,
    role: UserRole.DRIVER,
    isActive: true,
    licenseNumber: `TN-${(10 + i).toString().padStart(2, '0')}-2020-${(1000000 + i * 5432).toString().slice(0, 7)}`,
    licenseExpiry: '2028-05-15',
    assignedCabId: `CAB-${idStr}`,
    status: DriverStatus.AVAILABLE,
    totalTrips: 120 + i * 15,
    totalDistanceKm: 2400 + i * 350,
    joinedDate: '2022-03-10',
    createdAt: '2022-03-10T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  });

  MOCK_CABS.push({
    cabId: `CAB-${idStr}`,
    registrationNumber: cabDef.reg,
    model: cabDef.model,
    vehicleType: cabDef.type,
    makeYear: cabDef.year,
    color: cabDef.color,
    fuelType: cabDef.fuel,
    seatingCapacity: cabDef.capacity,
    status: CabStatus.IDLE,
    currentSpeed: 0,
    mileageKm: cabDef.mileage,
    createdAt: '2022-03-10T00:00:00.000Z',
  });
}

// Generate 50 stable Passengers
for (let i = 1; i <= 50; i++) {
  const idStr = i.toString().padStart(3, '0');
  const passengerName = DRIVER_NAMES[(i - 1) % DRIVER_NAMES.length];
  const emailSlug = passengerName.toLowerCase().replace(/[^a-z]/g, '');

  MOCK_PASSENGERS.push({
    userId: `PSG-${idStr}`,
    passengerId: `PSG-${idStr}`,
    email: `${emailSlug}@example.com`,
    fullName: passengerName,
    phone: `+91 98000${(10000 + i * 222).toString().slice(0, 5)}`,
    role: UserRole.PASSENGER,
    isActive: true,
    createdAt: '2022-03-10T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    totalTrips: 5 + (i % 20),
    totalSosRequests: 0,
    preferredPayment: i % 2 === 0 ? PaymentMethod.UPI : PaymentMethod.CARD,
  });
}

// 10 Historical Trips (matching seed.sql TRP-1001 .. TRP-1010)
const TRIP_SEEDS = [
  { tripId: 'TRP-1001', cabId: 'CAB-001', driverId: 'DRV-001', passengerId: 'PSG-001', dist: 18.2, dur: 50, avg: 21.8, max: 62, fare: 420, daysAgo: 10 },
  { tripId: 'TRP-1002', cabId: 'CAB-002', driverId: 'DRV-002', passengerId: 'PSG-004', dist: 15.6, dur: 45, avg: 20.8, max: 58, fare: 380, daysAgo: 9 },
  { tripId: 'TRP-1003', cabId: 'CAB-003', driverId: 'DRV-003', passengerId: 'PSG-007', dist: 22.1, dur: 60, avg: 22.1, max: 68, fare: 510, daysAgo: 8 },
  { tripId: 'TRP-1004', cabId: 'CAB-004', driverId: 'DRV-004', passengerId: 'PSG-010', dist: 13.4, dur: 40, avg: 20.1, max: 55, fare: 320, daysAgo: 7 },
  { tripId: 'TRP-1005', cabId: 'CAB-005', driverId: 'DRV-005', passengerId: 'PSG-013', dist: 19.8, dur: 55, avg: 21.6, max: 65, fare: 450, daysAgo: 6 },
  { tripId: 'TRP-1006', cabId: 'CAB-006', driverId: 'DRV-006', passengerId: 'PSG-011', dist: 26.3, dur: 70, avg: 22.5, max: 70, fare: 600, daysAgo: 5 },
  { tripId: 'TRP-1007', cabId: 'CAB-007', driverId: 'DRV-007', passengerId: 'PSG-016', dist: 12.1, dur: 35, avg: 20.7, max: 60, fare: 290, daysAgo: 4 },
  { tripId: 'TRP-1008', cabId: 'CAB-008', driverId: 'DRV-008', passengerId: 'PSG-019', dist: 24.5, dur: 65, avg: 22.6, max: 72, fare: 560, daysAgo: 3 },
  { tripId: 'TRP-1009', cabId: 'CAB-009', driverId: 'DRV-009', passengerId: 'PSG-022', dist: 17.0, dur: 48, avg: 21.3, max: 63, fare: 400, daysAgo: 2 },
  { tripId: 'TRP-1010', cabId: 'CAB-010', driverId: 'DRV-010', passengerId: 'PSG-025', dist: 20.4, dur: 52, avg: 23.5, max: 68, fare: 470, daysAgo: 1 },
];

for (const t of TRIP_SEEDS) {
  const bId = `BKG-${t.tripId.replace('TRP-', '')}`;
  const startTime = new Date(Date.now() - 86400000 * t.daysAgo).toISOString();
  const endTime = new Date(Date.now() - 86400000 * t.daysAgo + t.dur * 60000).toISOString();

  MOCK_BOOKINGS.push({
    bookingId: bId,
    passengerId: t.passengerId,
    pickupLocationId: 'LOC-1',
    dropoffLocationId: 'LOC-2',
    cabId: t.cabId,
    driverId: t.driverId,
    bookingTime: startTime,
    fareEstimate: t.fare,
    status: BookingStatus.COMPLETED,
    createdAt: startTime,
  });

  MOCK_TRIPS.push({
    tripId: t.tripId,
    bookingId: bId,
    cabId: t.cabId,
    driverId: t.driverId,
    passengerId: t.passengerId,
    startTime,
    endTime,
    distanceKm: t.dist,
    durationMin: t.dur,
    avgSpeed: t.avg,
    maxSpeed: t.max,
    fare: t.fare,
    status: TripStatus.COMPLETED,
    createdAt: startTime,
  });
}

// 4 Historical Safety Events (matching seed.sql EVT-901 .. EVT-904)
MOCK_SAFETY_EVENTS.push(
  {
    eventId: 'EVT-901',
    cabId: 'CAB-003',
    driverId: 'DRV-003',
    tripId: 'TRP-1001',
    eventType: EventType.OVER_SPEEDING,
    severity: EventSeverity.HIGH,
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date(Date.now() - 7180000).toISOString(),
    durationSeconds: 20,
    maxValue: 78.4,
    thresholdValue: 70,
    status: EventStatus.RESOLVED,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    eventId: 'EVT-902',
    cabId: 'CAB-012',
    driverId: 'DRV-012',
    tripId: 'TRP-1003',
    eventType: EventType.HARSH_BRAKING,
    severity: EventSeverity.CRITICAL,
    startTime: new Date(Date.now() - 14400000).toISOString(),
    endTime: new Date(Date.now() - 14395000).toISOString(),
    durationSeconds: 5,
    maxValue: -6.4,
    thresholdValue: -6.0,
    status: EventStatus.RESOLVED,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    eventId: 'EVT-903',
    cabId: 'CAB-025',
    driverId: 'DRV-025',
    tripId: 'TRP-1005',
    eventType: EventType.SUDDEN_ACCELERATION,
    severity: EventSeverity.MEDIUM,
    startTime: new Date(Date.now() - 28800000).toISOString(),
    endTime: new Date(Date.now() - 28796000).toISOString(),
    durationSeconds: 4,
    maxValue: 4.8,
    thresholdValue: 3.5,
    status: EventStatus.RESOLVED,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    eventId: 'EVT-904',
    cabId: 'CAB-008',
    driverId: 'DRV-008',
    tripId: 'TRP-1007',
    eventType: EventType.OVER_SPEEDING,
    severity: EventSeverity.CRITICAL,
    startTime: new Date(Date.now() - 43200000).toISOString(),
    endTime: new Date(Date.now() - 43160000).toISOString(),
    durationSeconds: 40,
    maxValue: 89.2,
    thresholdValue: 85,
    status: EventStatus.RESOLVED,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  }
);

// Pre-seed Historical Alerts
MOCK_ALERTS.push(
  {
    alertId: 'ALT-901',
    eventId: 'EVT-901',
    alertType: AlertType.OVER_SPEEDING,
    cabId: 'CAB-003',
    driverId: 'DRV-003',
    tripId: 'TRP-1001',
    severity: AlertSeverity.WARNING,
    title: 'Over-speeding — CAB-003',
    message: 'Speed exceeded 78.4 km/h on GST Road',
    status: AlertStatus.RESOLVED,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    alertId: 'ALT-902',
    eventId: 'EVT-902',
    alertType: AlertType.HARSH_BRAKING,
    cabId: 'CAB-012',
    driverId: 'DRV-012',
    tripId: 'TRP-1003',
    severity: AlertSeverity.CRITICAL,
    title: 'Harsh Braking — CAB-012',
    message: 'Severe deceleration -6.4 m/s² detected near Guindy',
    status: AlertStatus.RESOLVED,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    alertId: 'ALT-903',
    eventId: 'EVT-904',
    alertType: AlertType.OVER_SPEEDING,
    cabId: 'CAB-008',
    driverId: 'DRV-008',
    tripId: 'TRP-1007',
    severity: AlertSeverity.CRITICAL,
    title: 'Critical Speeding — CAB-008',
    message: 'Dangerously high speed 89.2 km/h sustained for 40s',
    status: AlertStatus.RESOLVED,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  }
);

// Pre-seed Historical SOS
MOCK_SOS.push(
  {
    sosId: 'SOS-091',
    tripId: 'TRP-1002',
    passengerId: 'PSG-004',
    driverId: 'DRV-004',
    cabId: 'CAB-004',
    latitude: 13.0405,
    longitude: 80.2337,
    reason: 'Medical distress reported by passenger',
    severity: SOSSeverity.HIGH,
    status: SOSStatus.RESOLVED,
    responseTimeSec: 64,
    resolutionNotes: 'Paramedic dispatched to T. Nagar junction. Passenger assisted safely.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    resolvedAt: new Date(Date.now() - 172736000).toISOString(),
  },
  {
    sosId: 'SOS-092',
    tripId: 'TRP-1006',
    passengerId: 'PSG-011',
    driverId: 'DRV-011',
    cabId: 'CAB-011',
    latitude: 13.0067,
    longitude: 80.2025,
    reason: 'Suspected mechanical malfunction and smoke from engine',
    severity: SOSSeverity.CRITICAL,
    status: SOSStatus.RESOLVED,
    responseTimeSec: 48,
    resolutionNotes: 'Vehicle safely pulled over on OMR. Replacement cab dispatched.',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    resolvedAt: new Date(Date.now() - 259152000).toISOString(),
  }
);

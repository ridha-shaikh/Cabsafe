const fs = require('fs');
const path = require('path');

const code = `import { User, Driver, Passenger, FleetManager, Cab, Trip, Booking, SafetyEvent, Alert, SOSRequest, MaintenanceRecord, Location } from '../types/entities';
import { UserRole, DriverStatus, CabStatus, FuelType, PaymentMethod, TripStatus, BookingStatus, EventSeverity, EventType, EventStatus, AlertSeverity, AlertType, AlertStatus, SOSSeverity, SOSStatus, MaintenanceServiceType, MaintenanceStatus, LocationType } from '../types/enums';

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

// Generate realistic TN registered cabs and drivers
export const MOCK_DRIVERS: Driver[] = [];
export const MOCK_CABS: Cab[] = [];
export const MOCK_PASSENGERS: Passenger[] = [];
export const MOCK_TRIPS: Trip[] = [];
export const MOCK_BOOKINGS: Booking[] = [];
export const MOCK_SAFETY_EVENTS: SafetyEvent[] = [];
export const MOCK_ALERTS: Alert[] = [];
export const MOCK_SOS: SOSRequest[] = [];
export const MOCK_MAINTENANCE: MaintenanceRecord[] = [];

const names = ["Arjun", "Priya", "Rahul", "Aisha", "Vikram", "Neha", "Karthik", "Sneha", "Aditya", "Pooja", "Siddharth", "Anjali", "Ravi", "Kavya", "Suresh", "Deepa", "Manoj", "Divya", "Vinay", "Meera"];
const surnames = ["Kumar", "Sharma", "Menon", "Khan", "Rao", "Iyer", "Patil", "Reddy", "Nair", "Das", "Singh", "Gupta", "Desai", "Joshi", "Bhat", "Chopra"];
const models = ["Maruti Suzuki Dzire", "Hyundai Xcent", "Toyota Etios", "Tata Tigor EV", "Honda Amaze", "Mahindra Verito"];
const colors = ["White", "Silver", "Grey"];

// 50 Cabs and Drivers
for (let i = 1; i <= 50; i++) {
  const idStr = i.toString().padStart(3, '0');
  
  const firstName = names[Math.floor(Math.random() * names.length)];
  const lastName = surnames[Math.floor(Math.random() * surnames.length)];
  
  MOCK_DRIVERS.push({
    userId: \`USR-DRV-\${idStr}\`,
    driverId: \`DRV-\${idStr}\`,
    email: \`\${firstName.toLowerCase()}.\${lastName.toLowerCase()}\${i}@cabsafe.in\`,
    fullName: \`\${firstName} \${lastName}\`,
    phone: \`+91 91000\${Math.floor(10000 + Math.random() * 90000)}\`,
    role: UserRole.DRIVER,
    isActive: true,
    licenseNumber: \`TN-\${Math.floor(10 + Math.random() * 90)}-20\${Math.floor(15 + Math.random() * 8)}-\${Math.floor(1000000 + Math.random() * 8999999)}\`,
    licenseExpiry: \`202\${7 + Math.floor(Math.random() * 4)}-05-15\`,
    assignedCabId: \`CAB-\${idStr}\`,
    status: DriverStatus.AVAILABLE,
    totalTrips: Math.floor(Math.random() * 3000),
    totalDistanceKm: Math.floor(Math.random() * 50000),
    joinedDate: \`202\${1 + Math.floor(Math.random() * 3)}-03-10\`,
    createdAt: new Date(\`202\${1 + Math.floor(Math.random() * 3)}-03-10\`).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  MOCK_CABS.push({
    cabId: \`CAB-\${idStr}\`,
    registrationNumber: \`TN-\${Math.floor(10 + Math.random() * 90)}-\${String.fromCharCode(65 + Math.floor(Math.random() * 26))}\${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-\${Math.floor(1000 + Math.random() * 8999)}\`,
    model: models[Math.floor(Math.random() * models.length)],
    makeYear: 2019 + Math.floor(Math.random() * 5),
    color: colors[Math.floor(Math.random() * colors.length)],
    fuelType: i % 5 === 0 ? FuelType.ELECTRIC : (i % 2 === 0 ? FuelType.CNG : FuelType.PETROL),
    seatingCapacity: 4,
    status: CabStatus.IDLE,
    currentSpeed: 0,
    mileageKm: Math.floor(10000 + Math.random() * 90000),
    createdAt: new Date().toISOString(),
  });
}

// 20 Passengers
for (let i = 1; i <= 20; i++) {
  const idStr = i.toString().padStart(3, '0');
  const firstName = names[Math.floor(Math.random() * names.length)];
  const lastName = surnames[Math.floor(Math.random() * surnames.length)];
  
  MOCK_PASSENGERS.push({
    userId: \`USR-PSG-\${idStr}\`,
    passengerId: \`PSG-\${idStr}\`,
    email: \`\${firstName.toLowerCase()}.\${lastName.toLowerCase()}@example.com\`,
    fullName: \`\${firstName} \${lastName}\`,
    phone: \`+91 98000\${Math.floor(10000 + Math.random() * 90000)}\`,
    role: UserRole.PASSENGER,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalTrips: Math.floor(Math.random() * 50),
    totalSosRequests: 0,
    preferredPayment: i % 2 === 0 ? PaymentMethod.UPI : PaymentMethod.CARD,
  });
}

// 10 Historical Trips, Bookings, Events
for (let i = 1; i <= 10; i++) {
  const cab = MOCK_CABS[i - 1];
  const driver = MOCK_DRIVERS[i - 1];
  const passenger = MOCK_PASSENGERS[Math.floor(Math.random() * MOCK_PASSENGERS.length)];
  
  const bId = \`BKG-100\${i}\`;
  const tId = \`TRP-100\${i}\`;
  
  MOCK_BOOKINGS.push({
    bookingId: bId,
    passengerId: passenger.passengerId,
    pickupLocationId: 'LOC-1',
    dropoffLocationId: 'LOC-2',
    cabId: cab.cabId,
    driverId: driver.driverId,
    bookingTime: new Date(Date.now() - 86400000 * i).toISOString(),
    fareEstimate: 350 + Math.floor(Math.random() * 200),
    status: BookingStatus.COMPLETED,
    createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
  });
  
  MOCK_TRIPS.push({
    tripId: tId,
    bookingId: bId,
    cabId: cab.cabId,
    driverId: driver.driverId,
    passengerId: passenger.passengerId,
    startTime: new Date(Date.now() - 86400000 * i + 600000).toISOString(),
    endTime: new Date(Date.now() - 86400000 * i + 3600000).toISOString(),
    distanceKm: 15 + Math.floor(Math.random() * 20),
    durationMin: 45 + Math.floor(Math.random() * 30),
    avgSpeed: 25,
    maxSpeed: 65,
    fare: 350 + Math.floor(Math.random() * 200),
    status: TripStatus.COMPLETED,
    createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
  });
}
`;
fs.writeFileSync(path.join(__dirname, 'src/data/mockData.ts'), code);
console.log('Written mockData.ts');

const fs = require('fs');
const path = require('path');

const intfDir = 'src/repositories/interfaces';
const mockDir = 'src/repositories/mock';
const svcDir = 'src/services';

if (!fs.existsSync(intfDir)) fs.mkdirSync(intfDir, { recursive: true });
if (!fs.existsSync(mockDir)) fs.mkdirSync(mockDir, { recursive: true });
if (!fs.existsSync(svcDir)) fs.mkdirSync(svcDir, { recursive: true });

const entities = ['Cab', 'Driver', 'Passenger', 'Trip', 'Booking', 'SafetyEvent', 'Alert', 'SOSRequest', 'MaintenanceRecord'];

// 1. Interfaces
let intfIndex = '';
entities.forEach(e => {
  const code = `import { ${e} } from '../../types/entities';

export interface I${e}Repository {
  getAll(): Promise<${e}[]>;
  getById(id: string): Promise<${e} | null>;
  create(data: Omit<${e}, 'createdAt'>): Promise<${e}>;
  update(id: string, data: Partial<${e}>): Promise<${e} | null>;
  delete(id: string): Promise<boolean>;
}
`;
  fs.writeFileSync(path.join(intfDir, `I${e}Repository.ts`), code);
  intfIndex += `export * from './I${e}Repository';\n`;
});
fs.writeFileSync(path.join(intfDir, 'index.ts'), intfIndex);

// 2. Mock Stores
const storeCode = `import { Cab, Driver, Passenger, Trip, Booking, SafetyEvent, Alert, SOSRequest, MaintenanceRecord } from '../../types/entities';
import { MOCK_CABS, MOCK_DRIVERS, MOCK_PASSENGERS } from '../../data/mockData';

export const mockDatabase: any = {
  cabs: [...MOCK_CABS] as Cab[],
  drivers: [...MOCK_DRIVERS] as Driver[],
  passengers: [...MOCK_PASSENGERS] as Passenger[],
  trips: [] as Trip[],
  bookings: [] as Booking[],
  safetyEvents: [] as SafetyEvent[],
  alerts: [] as Alert[],
  sosRequests: [] as SOSRequest[],
  maintenanceRecords: [] as MaintenanceRecord[]
};
`;
fs.writeFileSync(path.join(mockDir, 'mockDatabase.ts'), storeCode);

// 3. Mock Repositories
let mockIndex = '';
entities.forEach(e => {
  const camel = e.charAt(0).toLowerCase() + e.slice(1) + 's';
  const idField = e === 'SafetyEvent' ? 'eventId' : e === 'MaintenanceRecord' ? 'maintenanceId' : e.toLowerCase() + 'Id';
  
  const code = `import { ${e} } from '../../types/entities';
import { I${e}Repository } from '../interfaces/I${e}Repository';
import { mockDatabase } from './mockDatabase';

export class Mock${e}Repository implements I${e}Repository {
  private getTable(): ${e}[] {
    return mockDatabase['${camel}'] as ${e}[];
  }

  async getAll(): Promise<${e}[]> {
    return [...this.getTable()];
  }

  async getById(id: string): Promise<${e} | null> {
    const item = this.getTable().find((x: any) => x['${idField}'] === id || x.id === id);
    return item ? { ...item } : null;
  }

  async create(data: Omit<${e}, 'createdAt'>): Promise<${e}> {
    const newItem = {
      ...data,
      createdAt: new Date().toISOString()
    } as ${e};
    this.getTable().push(newItem);
    return { ...newItem };
  }

  async update(id: string, data: Partial<${e}>): Promise<${e} | null> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['${idField}'] === id || x.id === id);
    if (index === -1) return null;
    
    table[index] = { ...table[index], ...data };
    return { ...table[index] };
  }

  async delete(id: string): Promise<boolean> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['${idField}'] === id || x.id === id);
    if (index === -1) return false;
    
    table.splice(index, 1);
    return true;
  }
}
`;
  fs.writeFileSync(path.join(mockDir, `Mock${e}Repository.ts`), code);
  mockIndex += `export * from './Mock${e}Repository';\n`;
});
fs.writeFileSync(path.join(mockDir, 'index.ts'), mockIndex);

// 4. Services
let svcIndex = '';
entities.forEach(e => {
  const code = `import { ${e} } from '../types/entities';
import { I${e}Repository } from '../repositories/interfaces/I${e}Repository';

export class ${e}Service {
  constructor(private repository: I${e}Repository) {}

  async getAll(): Promise<${e}[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<${e} | null> {
    return this.repository.getById(id);
  }

  async create(data: Omit<${e}, 'createdAt'>): Promise<${e}> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<${e}>): Promise<${e} | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
`;
  fs.writeFileSync(path.join(svcDir, `${e}Service.ts`), code);
  svcIndex += `export * from './${e}Service';\n`;
});

const diCode = `import { MockCabRepository } from '../repositories/mock/MockCabRepository';
import { MockDriverRepository } from '../repositories/mock/MockDriverRepository';
import { MockPassengerRepository } from '../repositories/mock/MockPassengerRepository';
import { MockTripRepository } from '../repositories/mock/MockTripRepository';
import { MockBookingRepository } from '../repositories/mock/MockBookingRepository';
import { MockSafetyEventRepository } from '../repositories/mock/MockSafetyEventRepository';
import { MockAlertRepository } from '../repositories/mock/MockAlertRepository';
import { MockSOSRequestRepository } from '../repositories/mock/MockSOSRequestRepository';
import { MockMaintenanceRecordRepository } from '../repositories/mock/MockMaintenanceRecordRepository';

import { CabService } from './CabService';
import { DriverService } from './DriverService';
import { PassengerService } from './PassengerService';
import { TripService } from './TripService';
import { BookingService } from './BookingService';
import { SafetyEventService } from './SafetyEventService';
import { AlertService } from './AlertService';
import { SOSRequestService } from './SOSRequestService';
import { MaintenanceRecordService } from './MaintenanceRecordService';

export const cabService = new CabService(new MockCabRepository());
export const driverService = new DriverService(new MockDriverRepository());
export const passengerService = new PassengerService(new MockPassengerRepository());
export const tripService = new TripService(new MockTripRepository());
export const bookingService = new BookingService(new MockBookingRepository());
export const safetyEventService = new SafetyEventService(new MockSafetyEventRepository());
export const alertService = new AlertService(new MockAlertRepository());
export const sosRequestService = new SOSRequestService(new MockSOSRequestRepository());
export const maintenanceService = new MaintenanceRecordService(new MockMaintenanceRecordRepository());
`;
fs.writeFileSync(path.join(svcDir, 'index.ts'), svcIndex + '\n' + diCode);
console.log('Done');

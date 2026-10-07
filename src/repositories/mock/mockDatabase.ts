import { Cab, Driver, Passenger, Trip, Booking, SafetyEvent, Alert, SOSRequest, MaintenanceRecord } from '../../types/entities';
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

import { Cab, Driver, Passenger, Trip, Booking, SafetyEvent, Alert, SOSRequest, MaintenanceRecord } from '../../types/entities';
import { MOCK_CABS, MOCK_DRIVERS, MOCK_PASSENGERS, MOCK_TRIPS, MOCK_BOOKINGS, MOCK_SAFETY_EVENTS, MOCK_ALERTS, MOCK_SOS } from '../../data/mockData';

export const mockDatabase: any = {
  cabs: [...MOCK_CABS] as Cab[],
  drivers: [...MOCK_DRIVERS] as Driver[],
  passengers: [...MOCK_PASSENGERS] as Passenger[],
  trips: [...MOCK_TRIPS] as Trip[],
  bookings: [...MOCK_BOOKINGS] as Booking[],
  safetyEvents: [...MOCK_SAFETY_EVENTS] as SafetyEvent[],
  alerts: [...MOCK_ALERTS] as Alert[],
  sosRequests: [...MOCK_SOS] as SOSRequest[],
  maintenanceRecords: [] as MaintenanceRecord[]
};

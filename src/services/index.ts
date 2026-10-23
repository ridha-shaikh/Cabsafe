export * from './CabService';
export * from './DriverService';
export * from './PassengerService';
export * from './TripService';
export * from './BookingService';
export * from './SafetyEventService';
export * from './AlertService';
export * from './SOSRequestService';
export * from './MaintenanceRecordService';

// Mock repositories (always available for offline dev / fallback)
import { MockCabRepository } from '../repositories/mock/MockCabRepository';
import { MockDriverRepository } from '../repositories/mock/MockDriverRepository';
import { MockPassengerRepository } from '../repositories/mock/MockPassengerRepository';
import { MockTripRepository } from '../repositories/mock/MockTripRepository';
import { MockBookingRepository } from '../repositories/mock/MockBookingRepository';
import { MockSafetyEventRepository } from '../repositories/mock/MockSafetyEventRepository';
import { MockAlertRepository } from '../repositories/mock/MockAlertRepository';
import { MockSOSRequestRepository } from '../repositories/mock/MockSOSRequestRepository';
import { MockMaintenanceRecordRepository } from '../repositories/mock/MockMaintenanceRecordRepository';

// API repositories (used when VITE_API_BASE_URL is configured)
import { ApiCabRepository } from '../repositories/api/ApiCabRepository';
import { ApiSafetyEventRepository } from '../repositories/api/ApiSafetyEventRepository';
import { ApiTripRepository } from '../repositories/api/ApiTripRepository';

import { CabService } from './CabService';
import { DriverService } from './DriverService';
import { PassengerService } from './PassengerService';
import { TripService } from './TripService';
import { BookingService } from './BookingService';
import { SafetyEventService } from './SafetyEventService';
import { AlertService } from './AlertService';
import { SOSRequestService } from './SOSRequestService';
import { MaintenanceRecordService } from './MaintenanceRecordService';

import { getApiBaseUrl } from '../config/apiConfig';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || getApiBaseUrl();
const useApi = !!API_BASE;

// Wire up repositories: API when configured, mock otherwise
export const cabService = new CabService(
  useApi ? new ApiCabRepository() : new MockCabRepository()
);
export const tripService = new TripService(
  useApi ? new ApiTripRepository() : new MockTripRepository()
);
export const safetyEventService = new SafetyEventService(
  useApi ? new ApiSafetyEventRepository() : new MockSafetyEventRepository()
);

// These services remain on mock repositories (no individual API tables needed)
export const driverService          = new DriverService(new MockDriverRepository());
export const passengerService       = new PassengerService(new MockPassengerRepository());
export const bookingService         = new BookingService(new MockBookingRepository());
export const alertService           = new AlertService(new MockAlertRepository());
export const sosRequestService      = new SOSRequestService(new MockSOSRequestRepository());
export const maintenanceService     = new MaintenanceRecordService(new MockMaintenanceRecordRepository());

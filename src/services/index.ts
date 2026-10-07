export * from './CabService';
export * from './DriverService';
export * from './PassengerService';
export * from './TripService';
export * from './BookingService';
export * from './SafetyEventService';
export * from './AlertService';
export * from './SOSRequestService';
export * from './MaintenanceRecordService';

import { MockCabRepository } from '../repositories/mock/MockCabRepository';
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

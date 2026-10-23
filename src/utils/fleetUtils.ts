import { CabSimState } from '../types/enums';
import { CabSimulationState } from '../types/simulation';

/**
 * Set of cab states that represent active, running trips.
 * Per project specification:
 * - Idle, Available, Completed, Offline, and Maintenance cabs are NOT active trips.
 * - Only cabs currently dispatched, picking up, in-transit, or arriving are active running trips.
 */
export const ACTIVE_TRIP_STATES: Set<CabSimState> = new Set([
  CabSimState.GOING_TO_PICKUP,
  CabSimState.ARRIVED_PICKUP,
  CabSimState.ON_TRIP,
  CabSimState.SPEEDING,
  CabSimState.HARSH_BRAKE,
  CabSimState.SUDDEN_ACCEL,
  CabSimState.SOS,
  CabSimState.ARRIVED,
]);

/**
 * Returns true if a cab is currently in an active, running trip.
 */
export function isActiveTripCab(cab: CabSimulationState | { state: CabSimState }): boolean {
  if (!cab) return false;
  return ACTIVE_TRIP_STATES.has(cab.state);
}

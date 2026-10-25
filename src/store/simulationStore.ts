import { create } from 'zustand';
import { CabSimulationState, SimulationConfig } from '../types/simulation';
import { SimulationState, CabSimState, CabStatus, SOSStatus, SOSSeverity, EventStatus } from '../types/enums';
import { SafetyEvent, Alert, SOSRequest } from '../types/entities';
import { mockDatabase } from '../repositories/mock/mockDatabase';
import { MOCK_SAFETY_EVENTS, MOCK_ALERTS, MOCK_SOS } from '../data/mockData';

const isStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const test = '__storage_test__';
    window.localStorage.setItem(test, '1');
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Identify demo/simulated drills that should expire after 30 minutes.
 * Real database incidents (not marked DEMO/SIM) are NEVER expired by age.
 */
export const isStaleDemoEvent = (
  event: { eventId?: string; startTime?: string; isSimulated?: boolean },
  nowMs: number = Date.now()
): boolean => {
  const id = event.eventId || '';
  const isDemo =
    id.includes('DEMO') ||
    id.startsWith('SIM-') ||
    Boolean(event.isSimulated);

  if (!isDemo) return false;

  const eventTime = event.startTime ? new Date(event.startTime).getTime() : 0;
  const ageMs = nowMs - eventTime;
  return ageMs > 1800000; // 30 minutes for demo drills only
};

interface SimulationStore {
  config: SimulationConfig;
  cabs: Record<string, CabSimulationState>; // Keyed by cabId

  // Anomaly / Safety state
  safetyEvents: SafetyEvent[];
  alerts: Alert[];
  sosRequests: SOSRequest[];
  resolvedEventIds: Set<string>;

  setConfig: (config: Partial<SimulationConfig>) => void;
  updateCab: (cabId: string, state: Partial<CabSimulationState>) => void;
  batchUpdateCabs: (updates: Record<string, Partial<CabSimulationState>>) => void;
  removeCab: (cabId: string) => void;
  resetSimulation: () => void;

  // Event actions
  hydrateSafetyEvents: (events: SafetyEvent[]) => void;
  addSafetyEvent: (event: SafetyEvent) => void;
  resolveSafetyEvent: (eventId: string) => void;
  addAlert: (alert: Alert) => void;
  resolveAlert: (alertId: string) => void;
  addSOSRequest: (sos: SOSRequest) => void;
  updateSOSStatus: (sosId: string, updates: Partial<SOSRequest>) => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  config: {
    state: SimulationState.STOPPED, // Stopped auto-start
    speedMultiplier: 1,
    activeCabs: 35, // Starts at 35
    tickIntervalMs: 1000,
  },
  cabs: {},

  // Initialize with seed event arrays
  safetyEvents: [...MOCK_SAFETY_EVENTS],
  alerts: [...MOCK_ALERTS],
  sosRequests: [...MOCK_SOS],
  resolvedEventIds: new Set<string>(),

  setConfig: (newConfig) =>
    set((state) => ({ config: { ...state.config, ...newConfig } })),

  updateCab: (cabId, cabState) =>
    set((state) => {
      const updatedCab = {
        ...(state.cabs[cabId] || {
          cabId,
          driverId: '',
          routeId: '',
          isReverse: false,
          startLocationName: '',
          destinationLocationName: '',
          state: CabSimState.AVAILABLE,
          routePhase: 'DISPATCH',
          dwellTimer: 0,
          latitude: 0,
          longitude: 0,
          heading: 0,
          totalRouteDistance: 0,
          distanceTraveledKm: 0,
          routeProgress: 0,
          baseSpeed: 0,
          currentSpeed: 0,
          targetSpeed: 0,
          acceleration: 0,
          brakeApplied: false,
          lastTickTime: Date.now(),
          timeInCurrentState: 0,
          isOffRoute: false,
        }),
        ...cabState,
      };

      // Also sync to Mock Database to maintain AWS-ready architecture
      const dbCabIndex = mockDatabase.cabs.findIndex((c: any) => c.cabId === cabId);
      if (dbCabIndex !== -1) {
        mockDatabase.cabs[dbCabIndex] = {
          ...mockDatabase.cabs[dbCabIndex],
          currentLatitude: updatedCab.latitude,
          currentLongitude: updatedCab.longitude,
          currentSpeed: updatedCab.currentSpeed,
          status: updatedCab.state === CabSimState.AVAILABLE ? CabStatus.IDLE : CabStatus.ACTIVE,
        };
      }

      return {
        cabs: {
          ...state.cabs,
          [cabId]: updatedCab,
        },
      };
    }),

  batchUpdateCabs: (updates) =>
    set((state) => {
      const newCabs = { ...state.cabs };

      for (const [cabId, cabState] of Object.entries(updates)) {
        const updatedCab = {
          ...(state.cabs[cabId] || {
            cabId,
            driverId: '',
            routeId: '',
            isReverse: false,
            startLocationName: '',
            destinationLocationName: '',
            state: CabSimState.AVAILABLE,
            routePhase: 'DISPATCH',
            dwellTimer: 0,
            latitude: 0,
            longitude: 0,
            heading: 0,
            totalRouteDistance: 0,
            distanceTraveledKm: 0,
            routeProgress: 0,
            baseSpeed: 0,
            currentSpeed: 0,
            targetSpeed: 0,
            acceleration: 0,
            brakeApplied: false,
            lastTickTime: Date.now(),
            timeInCurrentState: 0,
            isOffRoute: false,
          }),
          ...cabState,
        };

        newCabs[cabId] = updatedCab;

        const dbCabIndex = mockDatabase.cabs.findIndex((c: any) => c.cabId === cabId);
        if (dbCabIndex !== -1) {
          mockDatabase.cabs[dbCabIndex] = {
            ...mockDatabase.cabs[dbCabIndex],
            currentLatitude: updatedCab.latitude,
            currentLongitude: updatedCab.longitude,
            currentSpeed: updatedCab.currentSpeed,
            status: updatedCab.state === CabSimState.AVAILABLE ? CabStatus.IDLE : CabStatus.ACTIVE,
          };
        }
      }

      return { cabs: newCabs };
    }),

  removeCab: (cabId) =>
    set((state) => {
      const newCabs = { ...state.cabs };
      delete newCabs[cabId];
      return { cabs: newCabs };
    }),

  resetSimulation: () =>
    set({
      config: {
        state: SimulationState.STOPPED,
        speedMultiplier: 1,
        activeCabs: 35,
        tickIntervalMs: 1000,
      },
      cabs: {},
      safetyEvents: [],
      alerts: [],
      sosRequests: [],
      resolvedEventIds: new Set(),
    }),

  // --- Event Actions ---
  hydrateSafetyEvents: (events) =>
    set((state) => {
      const resolvedIds = state.resolvedEventIds;
      const now = Date.now();
      const existingMap = new Map<string, SafetyEvent>();
      state.safetyEvents.forEach(e => existingMap.set(e.eventId, e));

      let newSosList = [...state.sosRequests];

      for (const rawEvt of events) {
        // Backend status authority:
        // Persistent resolution is established ONLY by explicit backend status or backend endTime
        const isBackendResolved =
          rawEvt.status === EventStatus.RESOLVED ||
          (rawEvt.status as any) === 'RESOLVED' ||
          Boolean(rawEvt.endTime);

        // Stale demo drills (> 30 min old) are expired to keep testing drills clean
        const isExpiredDemo = isStaleDemoEvent(rawEvt, now);

        // Session-only resolution for the active operator session
        const isSessionResolved = resolvedIds.has(rawEvt.eventId);

        const isResolved = isBackendResolved || isExpiredDemo || isSessionResolved;

        // Preserve all backend fields faithfully; do NOT fabricate artificial endTime or overwrite backend status
        const normalizedEvt: SafetyEvent = {
          ...rawEvt,
          status: (isBackendResolved || isExpiredDemo) ? EventStatus.RESOLVED : rawEvt.status,
          endTime: rawEvt.endTime, // Preserve actual backend endTime
          isSessionResolved: isSessionResolved && !isBackendResolved ? true : undefined,
        } as SafetyEvent;

        existingMap.set(normalizedEvt.eventId, normalizedEvt);

        // For SOS events: mirror to sosRequests using exact canonical incident ID
        if ((normalizedEvt.eventType as string) === 'SOS') {
          const existingSosIndex = newSosList.findIndex(s => s.sosId === normalizedEvt.eventId);
          if (existingSosIndex >= 0) {
            // Update immutably without in-place mutation
            if (isResolved && newSosList[existingSosIndex].status !== SOSStatus.RESOLVED) {
              newSosList = newSosList.map((s, idx) =>
                idx === existingSosIndex
                  ? { ...s, status: SOSStatus.RESOLVED, resolvedAt: normalizedEvt.endTime || s.resolvedAt }
                  : s
              );
            }
          } else {
            // Add new SOSRequest with exact same canonical incident ID
            newSosList = [
              ...newSosList,
              {
                sosId: normalizedEvt.eventId,
                cabId: normalizedEvt.cabId,
                driverId: normalizedEvt.driverId || 'DRV-001',
                tripId: normalizedEvt.tripId || 'N/A',
                passengerId: 'N/A',
                latitude: normalizedEvt.startLatitude != null ? normalizedEvt.startLatitude : 13.0827,
                longitude: normalizedEvt.startLongitude != null ? normalizedEvt.startLongitude : 80.2707,
                reason: 'Passenger emergency SOS reported',
                severity: normalizedEvt.severity === 'CRITICAL' ? SOSSeverity.CRITICAL : SOSSeverity.HIGH,
                status: isResolved ? SOSStatus.RESOLVED : SOSStatus.ACTIVE,
                createdAt: normalizedEvt.startTime || normalizedEvt.createdAt,
                resolvedAt: normalizedEvt.endTime,
              }
            ];
          }
        }
      }

      return {
        safetyEvents: Array.from(existingMap.values()),
        sosRequests: newSosList,
      };
    }),

  addSafetyEvent: (event) =>
    set((state) => {
      mockDatabase.safetyEvents.push(event as any);
      const existing = state.safetyEvents.find(e => e.eventId === event.eventId);
      const newEvents = existing
        ? state.safetyEvents.map(e => e.eventId === event.eventId ? event : e)
        : [...state.safetyEvents, event];
      if (newEvents.length > 200) newEvents.shift();
      return { safetyEvents: newEvents };
    }),

  resolveSafetyEvent: (eventId) =>
    set((state) => {
      const updatedResolved = new Set(state.resolvedEventIds);
      updatedResolved.add(eventId);

      const resolvedTime = new Date().toISOString();

      return {
        resolvedEventIds: updatedResolved,
        safetyEvents: state.safetyEvents.map(e =>
          e.eventId === eventId
            ? { ...e, status: EventStatus.RESOLVED, endTime: e.endTime || resolvedTime }
            : e
        ),
        // Resolve ONLY this single corresponding SOS request with exact canonical ID
        sosRequests: state.sosRequests.map(s =>
          s.sosId === eventId
            ? { ...s, status: SOSStatus.RESOLVED, resolvedAt: s.resolvedAt || resolvedTime, resolutionNotes: 'Resolved by fleet dispatcher (Session)' }
            : s
        ),
      };
    }),

  addAlert: (alert) =>
    set((state) => {
      mockDatabase.alerts.push(alert as any);
      const newAlerts = [...state.alerts, alert];
      if (newAlerts.length > 200) newAlerts.shift();
      return { alerts: newAlerts };
    }),

  resolveAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map(a =>
        a.alertId === alertId ? { ...a, status: 'RESOLVED' as any, resolvedAt: new Date().toISOString() } : a
      ),
    })),

  addSOSRequest: (sos) =>
    set((state) => {
      mockDatabase.sosRequests.push(sos as any);
      const existing = state.sosRequests.find(s => s.sosId === sos.sosId);
      const newSos = existing
        ? state.sosRequests.map(s => s.sosId === sos.sosId ? sos : s)
        : [...state.sosRequests, sos];
      return { sosRequests: newSos };
    }),

  updateSOSStatus: (sosId, updates) =>
    set((state) => {
      let updatedResolved = state.resolvedEventIds;
      if (updates.status === SOSStatus.RESOLVED) {
        updatedResolved = new Set(state.resolvedEventIds);
        updatedResolved.add(sosId);
      }

      return {
        resolvedEventIds: updatedResolved,
        sosRequests: state.sosRequests.map(s =>
          s.sosId === sosId ? { ...s, ...updates } : s
        ),
        // Resolve ONLY this single corresponding safety event with exact canonical ID
        safetyEvents: updates.status === SOSStatus.RESOLVED
          ? state.safetyEvents.map(e =>
              e.eventId === sosId
                ? { ...e, status: EventStatus.RESOLVED, endTime: e.endTime || updates.resolvedAt || new Date().toISOString() }
                : e
            )
          : state.safetyEvents,
      };
    }),
}));

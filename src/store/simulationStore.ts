import { create } from 'zustand';
import { CabSimulationState, SimulationConfig } from '../types/simulation';
import { SimulationState, CabSimState, CabStatus } from '../types/enums';
import { SafetyEvent, Alert, SOSRequest } from '../types/entities';
import { mockDatabase } from '../repositories/mock/mockDatabase';
import { MOCK_SAFETY_EVENTS, MOCK_ALERTS, MOCK_SOS } from '../data/mockData';

interface SimulationStore {
  config: SimulationConfig;
  cabs: Record<string, CabSimulationState>; // Keyed by cabId

  // Anomaly / Safety state
  safetyEvents: SafetyEvent[];
  alerts: Alert[];
  sosRequests: SOSRequest[];

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
    }),

  // --- Event Actions ---
  hydrateSafetyEvents: (events) =>
    set((state) => {
      const existingIds = new Set(state.safetyEvents.map(e => e.eventId));
      const merged = [...state.safetyEvents];
      for (const evt of events) {
        if (!existingIds.has(evt.eventId)) {
          merged.push(evt);
          existingIds.add(evt.eventId);
        }
      }
      return { safetyEvents: merged };
    }),

  addSafetyEvent: (event) =>
    set((state) => {
      mockDatabase.safetyEvents.push(event as any);
      const newEvents = [...state.safetyEvents, event];
      if (newEvents.length > 200) newEvents.shift();
      return { safetyEvents: newEvents };
    }),

  resolveSafetyEvent: (eventId) =>
    set((state) => ({
      safetyEvents: state.safetyEvents.map(e =>
        e.eventId === eventId ? { ...e, status: 'RESOLVED' as any, endTime: new Date().toISOString() } : e
      ),
    })),

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
      return { sosRequests: [...state.sosRequests, sos] };
    }),

  updateSOSStatus: (sosId, updates) =>
    set((state) => ({
      sosRequests: state.sosRequests.map(s =>
        s.sosId === sosId ? { ...s, ...updates } : s
      ),
    })),
}));

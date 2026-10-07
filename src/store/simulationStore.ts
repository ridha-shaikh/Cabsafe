import { create } from 'zustand';
import { CabSimulationState, SimulationConfig } from '../types/simulation';
import { SimulationState, CabSimState, CabStatus } from '../types/enums';
import { mockDatabase } from '../repositories/mock/mockDatabase';

interface SimulationStore {
  config: SimulationConfig;
  cabs: Record<string, CabSimulationState>; // Keyed by cabId
  
  setConfig: (config: Partial<SimulationConfig>) => void;
  updateCab: (cabId: string, state: Partial<CabSimulationState>) => void;
  removeCab: (cabId: string) => void;
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  config: {
    state: SimulationState.STOPPED, // Stopped auto-start
    speedMultiplier: 1,
    activeCabs: 5, // Starts at 5 per user request
    tickIntervalMs: 1000,
  },
  cabs: {},
  
  setConfig: (newConfig) => 
    set((state) => ({ config: { ...state.config, ...newConfig } })),
    
  updateCab: (cabId, cabState) =>
    set((state) => {
      const updatedCab = {
        ...(state.cabs[cabId] || {
          cabId,
          driverId: '',
          routeId: '',
          state: CabSimState.IDLE,
          latitude: 0,
          longitude: 0,
          heading: 0,
          distanceTraveledKm: 0,
          routeProgress: 0,
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
          // map states roughly
          status: updatedCab.state === CabSimState.IDLE ? CabStatus.IDLE : CabStatus.ACTIVE,
        };
      }

      return {
        cabs: {
          ...state.cabs,
          [cabId]: updatedCab,
        },
      };
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
        activeCabs: 15,
        tickIntervalMs: 1000,
      },
      cabs: {},
    }),
}));

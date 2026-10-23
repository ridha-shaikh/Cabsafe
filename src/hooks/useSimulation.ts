import { useCallback } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { simulationEngine } from '../simulation/SimulationEngine';
import { SimulationState } from '../types/enums';

/**
 * useSimulation — exposes simulation controls to UI components.
 * Deliberately does NOT contain useEffect to start the engine;
 * the engine is started once by App.tsx ProtectedRoute.
 * Callbacks always read latest store state via getState() to avoid
 * stale closure issues with Zustand.
 */
export function useSimulation() {
  const config = useSimulationStore((s) => s.config);
  const cabs = useSimulationStore((s) => s.cabs);

  const startSimulation = useCallback(() => {
    useSimulationStore.getState().setConfig({ state: SimulationState.RUNNING });
    simulationEngine.start();
  }, []);

  const pauseSimulation = useCallback(() => {
    useSimulationStore.getState().setConfig({ state: SimulationState.PAUSED });
    simulationEngine.stop();
  }, []);

  const stopSimulation = useCallback(() => {
    useSimulationStore.getState().setConfig({ state: SimulationState.STOPPED });
    simulationEngine.stop();
    useSimulationStore.getState().resetSimulation();
  }, []);

  const setSpeedMultiplier = useCallback((multiplier: number) => {
    useSimulationStore.getState().setConfig({ speedMultiplier: multiplier });
  }, []);

  const setActiveCabs = useCallback((count: number) => {
    useSimulationStore.getState().setConfig({ activeCabs: count });
  }, []);

  return {
    config,
    cabs,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    setSpeedMultiplier,
    setActiveCabs,
  };
}

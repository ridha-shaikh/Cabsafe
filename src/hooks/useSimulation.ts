import { useEffect, useCallback } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { simulationEngine } from '../simulation/SimulationEngine';
import { SimulationState } from '../types/enums';

export function useSimulation() {
  const store = useSimulationStore();
  
  const startSimulation = useCallback(() => {
    store.setConfig({ state: SimulationState.RUNNING });
    simulationEngine.start();
  }, [store]);

  const pauseSimulation = useCallback(() => {
    store.setConfig({ state: SimulationState.PAUSED });
    simulationEngine.stop();
  }, [store]);

  const stopSimulation = useCallback(() => {
    store.setConfig({ state: SimulationState.STOPPED });
    simulationEngine.stop();
    store.resetSimulation();
  }, [store]);

  const setSpeedMultiplier = useCallback((multiplier: number) => {
    store.setConfig({ speedMultiplier: multiplier });
  }, [store]);

  const setActiveCabs = useCallback((count: number) => {
    store.setConfig({ activeCabs: count });
  }, [store]);

  // Synchronize store state with engine on mount if it's supposed to be running
  useEffect(() => {
    if (store.config.state === SimulationState.RUNNING) {
      simulationEngine.start();
    }
  }, [store.config.state]);

  return {
    config: store.config,
    cabs: store.cabs,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    setSpeedMultiplier,
    setActiveCabs,
  };
}

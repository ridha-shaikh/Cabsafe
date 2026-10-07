import { useSimulationStore } from '../store/simulationStore';
import { CHENNAI_ROUTES } from '../data/chennaiRoutes';
import { MOCK_CABS, MOCK_DRIVERS } from '../data/mockData';
import { CabSimState, SimulationState } from '../types/enums';
import { getPointAtDistance, getRouteLength, calculateBearing } from '../utils/geoUtils';
import { anomalyDetector } from '../anomalyDetection/AnomalyDetector';

class SimulationEngine {
  private timerId: number | null = null;
  private lastTickMs: number = 0;

  public start() {
    if (this.timerId !== null) return;
    
    // Spawn initial cabs if empty
    const store = useSimulationStore.getState();
    if (Object.keys(store.cabs).length === 0) {
      this.spawnInitialCabs(store.config.activeCabs);
    }
    
    this.lastTickMs = Date.now();
    this.tick = this.tick.bind(this);
    
    this.scheduleNextTick();
  }

  public stop() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNextTick() {
    const store = useSimulationStore.getState();
    const config = store.config;
    
    if (config.state !== SimulationState.RUNNING) {
      this.timerId = null;
      return;
    }
    
    const delay = config.tickIntervalMs / config.speedMultiplier;
    this.timerId = window.setTimeout(this.tick, delay);
  }

  private tick() {
    const now = Date.now();
    const store = useSimulationStore.getState();
    const config = store.config;
    const dtSeconds = (now - this.lastTickMs) / 1000 * config.speedMultiplier;
    this.lastTickMs = now;
    
    const cabs = store.cabs;
    const updates: Record<string, any> = {};
    const cabsToRemove: string[] = [];

    // Update existing cabs
    for (const cabId of Object.keys(cabs)) {
      this.updateCabPhysicsAndRoute(cabId, dtSeconds, now, updates, cabsToRemove);
    }
    
    // Apply batched updates
    if (Object.keys(updates).length > 0) {
      store.batchUpdateCabs(updates);
    }
    
    // Apply removals
    for (const cabId of cabsToRemove) {
      store.removeCab(cabId);
    }
    
    // Spawn / Retire logic
    this.handleDynamicSpawning();
    
    this.scheduleNextTick();
  }

  private spawnInitialCabs(count: number) {
    for (let i = 0; i < count; i++) {
      this.spawnCab();
    }
  }

  private handleDynamicSpawning() {
    const store = useSimulationStore.getState();
    const activeCount = Object.keys(store.cabs).length;
    const { activeCabs } = store.config;
    
    // Aggressively maintain the exact number of active cabs
    if (activeCount < activeCabs) {
      this.spawnCab();
    } else if (activeCount > activeCabs) {
      this.retireRandomCab();
    }
  }

  private spawnCab() {
    const store = useSimulationStore.getState();
    
    // Find unused cab
    const activeCabIds = new Set(Object.keys(store.cabs));
    const availableCabs = MOCK_CABS.filter(c => !activeCabIds.has(c.cabId));
    if (availableCabs.length === 0) return;
    
    const cab = availableCabs[Math.floor(Math.random() * availableCabs.length)];
    const driver = MOCK_DRIVERS.find(d => d.assignedCabId === cab.cabId) || MOCK_DRIVERS[0];
    
    const route = CHENNAI_ROUTES[Math.floor(Math.random() * CHENNAI_ROUTES.length)];
    
    const waypoints = route.waypointsJson.map(wp => [wp.lng, wp.lat] as [number, number]);
    
    const startPoint = waypoints[0];
    
    const baseSpeed = 40 + Math.random() * 20; // 40-60 km/h

    store.updateCab(cab.cabId, {
      cabId: cab.cabId,
      driverId: driver.driverId,
      routeId: route.routeId,
      state: CabSimState.EN_ROUTE,
      latitude: startPoint[1],
      longitude: startPoint[0],
      heading: 0,
      distanceTraveledKm: 0,
      routeProgress: 0,
      currentWaypointIndex: 1, // Moving towards point 1
      baseSpeed: baseSpeed,
      currentSpeed: baseSpeed,
      targetSpeed: baseSpeed,
      acceleration: 0,
      brakeApplied: false,
      pauseRemainingMs: 0,
      lastTickTime: Date.now(),
      timeInCurrentState: 0,
      isOffRoute: false,
    });
  }

  private retireRandomCab() {
    const store = useSimulationStore.getState();
    const cabIds = Object.keys(store.cabs);
    if (cabIds.length === 0) return;
    
    const cabId = cabIds[Math.floor(Math.random() * cabIds.length)];
    store.removeCab(cabId);
  }

  private updateCabPhysicsAndRoute(cabId: string, dtSeconds: number, now: number, updates: Record<string, any>, cabsToRemove: string[]) {
    const store = useSimulationStore.getState();
    const cab = store.cabs[cabId];
    if (!cab || cab.state === CabSimState.IDLE || cab.state === CabSimState.OFFLINE) return;
    
    // Handle pause
    if (cab.pauseRemainingMs > 0) {
      const remaining = cab.pauseRemainingMs - (dtSeconds * 1000);
      updates[cabId] = {
        pauseRemainingMs: Math.max(0, remaining),
        currentSpeed: 0,
        acceleration: 0,
        brakeApplied: true,
        lastTickTime: now
      };
      return;
    }
    
    if (cab.state === CabSimState.ARRIVED) {
      if (now - cab.lastTickTime > 3000) { // Rest for 3s then retire to spawn anew
         cabsToRemove.push(cabId);
      }
      return;
    }

    const route = CHENNAI_ROUTES.find(r => r.routeId === cab.routeId);
    if (!route) return;
    
    const waypoints = route.waypointsJson.map(wp => [wp.lng, wp.lat] as [number, number]);
    const totalLength = getRouteLength(waypoints);

    if (cab.currentWaypointIndex >= waypoints.length) {
       updates[cabId] = { state: CabSimState.ARRIVED, currentSpeed: 0, lastTickTime: now };
       return;
    }

    // Occasional pause logic (2% chance to stop for 2-5 seconds)
    if (Math.random() < 0.02) {
       updates[cabId] = { pauseRemainingMs: 2000 + Math.random() * 3000, lastTickTime: now };
       return;
    }
    
    // Physics - Random speed variation around base speed
    const speedVariation = (Math.random() - 0.5) * 10; // +/- 5 km/h
    let newSpeed = cab.baseSpeed + speedVariation;
    if (newSpeed < 5) newSpeed = 5;

    // Movement calculation
    const distanceMovedKm = (newSpeed / 3600) * dtSeconds; // km
    let newDistanceTraveled = cab.distanceTraveledKm + distanceMovedKm;
    
    // Tiny random position variation (noise in gps) is mostly visual, 
    // but we achieve it by calculating the strict position on the path and moving towards it
    const progress = Math.min(1, newDistanceTraveled / totalLength);
    
    let point = getPointAtDistance(waypoints, newDistanceTraveled);
    
    // Tiny positional noise (reduced to prevent visual jumping)
    const latNoise = (Math.random() - 0.5) * 0.00002;
    const lngNoise = (Math.random() - 0.5) * 0.00002;
    
    const finalLat = point[1] + latNoise;
    const finalLng = point[0] + lngNoise;

    // Only update heading if the cab actually moved a decent distance.
    let newHeading = cab.heading;
    if (distanceMovedKm > 0.0005) {
      // Look ahead 10 meters to get a stable road direction, avoiding micro-segment jitter
      const lookAheadPoint = getPointAtDistance(waypoints, Math.min(totalLength, newDistanceTraveled + 0.01));
      let targetBearing = calculateBearing(point, lookAheadPoint) ?? cab.heading;
      
      // Make heading continuous to prevent CSS 360-degree spin animation wrapping
      let diff = (targetBearing - cab.heading) % 360;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      
      // Smooth the turn slightly so it looks natural
      newHeading = cab.heading + diff;
    }

    // Calculate acceleration for anomaly tracking
    const accel = (newSpeed - cab.currentSpeed) / 3.6;

    let newState = CabSimState.EN_ROUTE;
    if (newSpeed > 70) newState = CabSimState.SPEEDING;
    else if (accel < -3.5) newState = CabSimState.HARSH_BRAKE;
    else if (accel > 3.5) newState = CabSimState.SUDDEN_ACCEL;
    
    updates[cabId] = {
      latitude: finalLat,
      longitude: finalLng,
      heading: newHeading,
      currentSpeed: newSpeed,
      acceleration: accel,
      distanceTraveledKm: newDistanceTraveled,
      routeProgress: progress,
      brakeApplied: accel < -2,
      state: progress >= 1 ? CabSimState.ARRIVED : newState,
      lastTickTime: now,
      timeInCurrentState: cab.state === newState ? cab.timeInCurrentState + dtSeconds * 1000 : 0,
      currentWaypointIndex: cab.currentWaypointIndex // Just simple point tracking
    };
    
    anomalyDetector.detectAnomalies(cabId, newSpeed, accel, now);
  }
}

export const simulationEngine = new SimulationEngine();

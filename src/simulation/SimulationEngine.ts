import { useSimulationStore } from '../store/simulationStore';
import { CHENNAI_ROUTES } from '../data/chennaiRoutes';
import { MOCK_CABS } from '../data/mockData';
import { CabSimState, SimulationState, SOSSeverity, TripStatus } from '../types/enums';
import { getPointAtDistance, getRouteLength, calculateBearing } from '../utils/geoUtils';
import { isActiveTripCab } from '../utils/fleetUtils';
import { anomalyDetector } from '../anomalyDetection/AnomalyDetector';
import { cabService, tripService, safetyEventService } from '../services';

class SimulationEngine {
  private timerId: number | null = null;
  private lastTickMs: number = 0;
  private lastCabSyncMs: number = 0;
  private lastAnomalyMs: number = Date.now() - 15000;
  private lastSimulatedSosMs: number = Date.now() - 90000; // First demo SOS occurs ~1.5 - 2m in
  private readonly ANOMALY_INTERVAL_MS: number = 32000;  // Modest anomaly every ~32 seconds
  private readonly SOS_INTERVAL_MS: number = 200000;     // Clearly labeled simulated SOS every ~3.3 minutes
  private tripCounter: number = 10000;
  private isHydrated: boolean = false;

  public async start() {
    if (this.timerId !== null) return;

    // Initialize fleet if empty
    const store = useSimulationStore.getState();
    if (Object.keys(store.cabs).length === 0) {
      await this.initializeFleet();
    }

    // Hydrate historical safety events from backend on start
    if (!this.isHydrated) {
      this.isHydrated = true;
      try {
        const historicalEvents = await safetyEventService.getAll();
        if (historicalEvents && historicalEvents.length > 0) {
          store.hydrateSafetyEvents(historicalEvents);
        }
      } catch (err) {
        console.warn('Could not hydrate historical events:', err);
      }
    }

    this.lastTickMs = Date.now();
    this.lastCabSyncMs = Date.now() - 10000; // First throttled sync triggers ~5s after start
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

    const delay = Math.max(200, (config.tickIntervalMs || 1000) / (config.speedMultiplier || 1));
    this.timerId = window.setTimeout(this.tick, delay);
  }

  private tick() {
    try {
      const now = Date.now();
      const store = useSimulationStore.getState();
      const config = store.config;

      // Calculate delta time, capped at 3 seconds to prevent jumps if tab was backgrounded
      let dtSeconds = ((now - (this.lastTickMs || now)) / 1000) * (config.speedMultiplier || 1);
      if (dtSeconds <= 0 || dtSeconds > 3.0) {
        dtSeconds = 1.0;
      }
      this.lastTickMs = now;

      const cabs = store.cabs;
      const updates: Record<string, any> = {};

      // 1. Periodic Stream of Modest Realistic Anomalies (1 every ~32s across fleet)
      this.handleScheduledAnomaly(now, updates);

      // 2. Deterministic Demo SOS Generator (1 every ~3.3m across fleet)
      this.handleScheduledSimulatedSos(now);

      // 3. Handle Dispatching new bookings for active running fleet
      this.handleDispatch(now, updates);

      // 4. Update all active/moving cabs
      for (const cabId of Object.keys(cabs)) {
        this.updateCabLifecycleAndPhysics(cabId, dtSeconds, now, updates);
      }

      // Apply batched updates to store
      if (Object.keys(updates).length > 0) {
        store.batchUpdateCabs(updates);
      }

      // 5. Throttled Fleet sync to backend (every 15 seconds, only active running cabs)
      if (now - this.lastCabSyncMs >= 15000) {
        this.lastCabSyncMs = now;
        const activeCabStates = Object.values(store.cabs)
          .filter(c => isActiveTripCab(c))
          .map(c => ({
            cabId: c.cabId,
            status: isActiveTripCab(c) ? 'ACTIVE' : 'IDLE',
            currentLatitude: parseFloat(c.latitude.toFixed(6)),
            currentLongitude: parseFloat(c.longitude.toFixed(6)),
            currentSpeed: Math.round(c.currentSpeed),
            mileageKm: parseFloat((c.distanceTraveledKm || 0).toFixed(2)),
          }));

        if (activeCabStates.length > 0) {
          cabService.batchUpdate(activeCabStates).catch((err) => {
            console.warn('Throttled fleet sync skipped:', err);
          });
        }
      }
    } catch (err) {
      console.error('Error in SimulationEngine tick:', err);
    } finally {
      // Self-healing loop: guarantee next tick is scheduled even if an error occurred
      this.scheduleNextTick();
    }
  }

  /**
   * Generates a modest, realistic stream of anomalies (over-speeding, harsh braking, sudden accel)
   * Capped to maximum 2 active anomalies fleet-wide at any time.
   */
  private handleScheduledAnomaly(now: number, updates: Record<string, any>) {
    if (now - this.lastAnomalyMs < this.ANOMALY_INTERVAL_MS) return;

    const store = useSimulationStore.getState();
    const allCabs = Object.values(store.cabs);

    // Concurrency cap: maximum 2 active anomalies across the entire fleet
    const activeAnomalyCount = allCabs.filter(
      c => c.activeAnomalyType != null || c.state === CabSimState.SPEEDING || c.state === CabSimState.HARSH_BRAKE
    ).length;

    if (activeAnomalyCount >= 2) return;

    // Pick an active moving cab on trip
    const candidates = allCabs.filter(
      c => c.routePhase === 'TRIP' && c.state === CabSimState.ON_TRIP && !c.activeAnomalyType && c.currentSpeed >= 28
    );
    if (candidates.length === 0) return;

    const targetCab = candidates[Math.floor(Math.random() * candidates.length)];
    this.lastAnomalyMs = now;

    const roll = Math.random();
    if (roll < 0.45) {
      // Over-speeding burst (11-14 seconds)
      updates[targetCab.cabId] = {
        activeAnomalyType: 'OVER_SPEEDING',
        anomalyStartMs: now,
        anomalyDurationMs: 12000 + Math.random() * 2000,
        anomalyTargetSpeed: 76 + Math.random() * 8, // 76 - 84 km/h
      };
    } else if (roll < 0.75) {
      // Harsh braking (2.5 - 3 seconds)
      updates[targetCab.cabId] = {
        activeAnomalyType: 'HARSH_BRAKE',
        anomalyStartMs: now,
        anomalyDurationMs: 2800,
      };
    } else {
      // Sudden acceleration (2.5 - 3 seconds)
      updates[targetCab.cabId] = {
        activeAnomalyType: 'SUDDEN_ACCEL',
        anomalyStartMs: now,
        anomalyDurationMs: 2800,
      };
    }
  }

  /**
   * Deterministic simulated demo SOS generator.
   * Generates 1 clearly labeled demo SOS every ~3.3 minutes across the fleet.
   */
  private handleScheduledSimulatedSos(now: number) {
    if (now - this.lastSimulatedSosMs < this.SOS_INTERVAL_MS) return;

    const store = useSimulationStore.getState();
    // Do not trigger a new SOS if there is already an active or responding SOS
    const hasOpenSos = store.sosRequests.some(s => s.status === 'ACTIVE' || s.status === 'RESPONDING');
    if (hasOpenSos) return;

    const candidates = Object.values(store.cabs).filter(
      c => c.routePhase === 'TRIP' && c.state === CabSimState.ON_TRIP && !c.activeAnomalyType && c.currentSpeed > 20
    );
    if (candidates.length === 0) return;

    const targetCab = candidates[Math.floor(Math.random() * candidates.length)];
    this.lastSimulatedSosMs = now;

    anomalyDetector.triggerSOS(
      targetCab.cabId,
      '[SIMULATED DEMO] Passenger panic button triggered — Demonstration drill',
      SOSSeverity.HIGH,
      false // Routine simulated visual drill in client memory; does not pollute production RDS
    );
  }

  public async initializeFleet() {
    const store = useSimulationStore.getState();
    const updates: Record<string, any> = {};

    // Fetch fleet inventory: prefer API backend, fallback to mockData
    let inventoryCabs = MOCK_CABS;
    try {
      const apiCabs = await cabService.getAll();
      if (apiCabs && apiCabs.length > 0) {
        inventoryCabs = apiCabs;
      }
    } catch (err) {
      console.warn('Using local mock fleet inventory:', err);
    }

    inventoryCabs.forEach((cab, index) => {
       const idNum = parseInt(cab.cabId.replace('CAB-', ''), 10) || (index + 1);
       const driverId = `DRV-${idNum.toString().padStart(3, '0')}`;

       const route = CHENNAI_ROUTES[index % CHENNAI_ROUTES.length];
       const isReverse = index % 2 === 1;
       let waypoints = route.waypointsJson.map(wp => [wp.lng, wp.lat] as [number, number]);
       if (isReverse) waypoints = [...waypoints].reverse();

       const totalRouteDistance = getRouteLength(waypoints);
       const routeParts = route.name.split(' to ');

       // Deterministic initial distribution:
       // 22 active on trip, 6 going to pickup, rest available in depot/reserve
       let state = CabSimState.AVAILABLE;
       let routePhase: any = 'DISPATCH';
       let progress = 0;

       if (index < 22) {
         state = CabSimState.ON_TRIP;
         routePhase = 'TRIP';
         // Stagger progress across routes from 15% to 85%
         progress = 0.15 + ((index * 3.5) % 70) / 100;
       } else if (index < 28) {
         state = CabSimState.GOING_TO_PICKUP;
         routePhase = 'DISPATCH';
         progress = 0.03 + ((index * 2) % 10) / 100;
       } else if (index < 30) {
         state = CabSimState.ARRIVED_PICKUP;
         routePhase = 'PICKUP_DWELL';
         progress = 0.15;
       } else {
         state = CabSimState.AVAILABLE;
         routePhase = 'DISPATCH';
         progress = 0;
       }

       const distanceTraveledKm = progress * totalRouteDistance;
       const point = getPointAtDistance(waypoints, distanceTraveledKm);
       const hasTrip = isActiveTripCab({ state } as any);

       if (hasTrip) {
         this.tripCounter++;
       }

       const tripId = hasTrip ? `TRP-${this.tripCounter}` : undefined;
       const passengerId = hasTrip ? `PSG-${((idNum % 50) + 1).toString().padStart(3, '0')}` : undefined;
       const baseSpeed = 38 + (index % 16);

       updates[cab.cabId] = {
         cabId: cab.cabId,
         driverId,
         state,
         routePhase,
         routeId: route.routeId,
         isReverse,
         startLocationName: isReverse ? (routeParts[1] || 'Destination') : (routeParts[0] || 'Origin'),
         destinationLocationName: isReverse ? (routeParts[0] || 'Origin') : (routeParts[1] || 'Destination'),
         totalRouteDistance,
         distanceTraveledKm,
         routeProgress: progress,
         latitude: point[1],
         longitude: point[0],
         currentSpeed: state === CabSimState.ON_TRIP ? baseSpeed : (state === CabSimState.GOING_TO_PICKUP ? baseSpeed * 0.9 : 0),
         baseSpeed,
         heading: 0,
         tripId,
         bookingId: hasTrip ? `BK-${this.tripCounter}` : undefined,
         passengerId,
         dwellTimer: (state === CabSimState.ARRIVED_PICKUP) ? 10 : 0,
         lastTickTime: Date.now(),
       };
    });

    store.batchUpdateCabs(updates);
  }

  private handleDispatch(now: number, updates: Record<string, any>) {
    const store = useSimulationStore.getState();
    const activeCabsTarget = store.config.activeCabs || 25;

    // Count active running trips strictly
    const activeTripsCount = Object.values(store.cabs).filter(isActiveTripCab).length;

    if (activeTripsCount < activeCabsTarget) {
      // Find idle/available/completed cabs ready for a new trip
      const availableCabs = Object.values(store.cabs).filter(
        c => !isActiveTripCab(c) && c.state !== CabSimState.OFFLINE && c.state !== CabSimState.MAINTENANCE
      );
      if (availableCabs.length === 0) return;

      const cabToDispatch = availableCabs[Math.floor(Math.random() * availableCabs.length)];

      const route = CHENNAI_ROUTES[Math.floor(Math.random() * CHENNAI_ROUTES.length)];
      const isReverse = Math.random() > 0.5;

      let waypoints = route.waypointsJson.map(wp => [wp.lng, wp.lat] as [number, number]);
      if (isReverse) {
        waypoints = waypoints.reverse();
      }
      const routeParts = route.name.split(' to ');

      this.tripCounter++;
      const tripId = `TRP-${this.tripCounter}`;
      const passengerId = `PSG-${Math.floor(1 + Math.random() * 50).toString().padStart(3, '0')}`;
      const baseSpeed = 36 + Math.floor(Math.random() * 18);

      updates[cabToDispatch.cabId] = {
        state: CabSimState.GOING_TO_PICKUP,
        routePhase: 'DISPATCH',
        routeId: route.routeId,
        isReverse,
        startLocationName: isReverse ? (routeParts[1] || 'Destination') : (routeParts[0] || 'Origin'),
        destinationLocationName: isReverse ? (routeParts[0] || 'Origin') : (routeParts[1] || 'Destination'),
        totalRouteDistance: getRouteLength(waypoints),
        distanceTraveledKm: 0,
        routeProgress: 0,
        currentSpeed: 0,
        baseSpeed,
        latitude: waypoints[0][1],
        longitude: waypoints[0][0],
        heading: 0,
        tripId,
        bookingId: `BK-${this.tripCounter}`,
        passengerId,
        activeEventId: undefined,
        activeAnomalyType: null,
        lastTickTime: now,
      };

      // Persist newly created trip to backend asynchronously
      tripService.create({
        tripId,
        bookingId: `BK-${this.tripCounter}`,
        cabId: cabToDispatch.cabId,
        driverId: cabToDispatch.driverId,
        passengerId,
        startTime: new Date().toISOString(),
        startLatitude: waypoints[0][1],
        startLongitude: waypoints[0][0],
        distanceKm: 0,
        durationMin: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        fare: 250 + Math.floor(Math.random() * 200),
        status: TripStatus.IN_PROGRESS,
      }).catch((err) => {
        console.warn('Could not persist trip creation:', err);
      });
    }
  }

  private updateCabLifecycleAndPhysics(cabId: string, dtSeconds: number, now: number, updates: Record<string, any>) {
    const store = useSimulationStore.getState();
    const cab = store.cabs[cabId];

    // Ignore updates if cab is in the update queue already or is not in an active trip
    if (updates[cabId] || !cab || !isActiveTripCab(cab)) {
       return;
    }

    const route = CHENNAI_ROUTES.find(r => r.routeId === cab.routeId);
    if (!route) return;

    let waypoints = route.waypointsJson.map(wp => [wp.lng, wp.lat] as [number, number]);
    if (cab.isReverse) {
      waypoints = [...waypoints].reverse();
    }

    const totalLength = cab.totalRouteDistance || getRouteLength(waypoints);
    const pickupDistance = totalLength * 0.15;

    // --- SOS STATE HANDLING ---
    if (cab.state === CabSimState.SOS) {
       const slowSpeed = Math.max(0, cab.currentSpeed - 6.0 * dtSeconds * 3.6);
       updates[cabId] = {
         currentSpeed: slowSpeed,
         acceleration: slowSpeed > 0 ? -6.0 : 0,
         brakeApplied: true,
         state: CabSimState.SOS,
         lastTickTime: now,
       };
       return;
    }

    // --- PHASE MANAGEMENT & DWELL TIMES ---
    if (cab.routePhase === 'PICKUP_DWELL') {
       if (cab.activeEventId) {
         store.resolveSafetyEvent(cab.activeEventId);
       }
       const newDwell = cab.dwellTimer - dtSeconds;
       if (newDwell <= 0) {
         // Transition to active passenger trip
         updates[cabId] = {
           routePhase: 'TRIP',
           state: CabSimState.ON_TRIP,
           dwellTimer: 0,
           currentSpeed: 10,
           lastTickTime: now,
           activeEventId: undefined,
         };
       } else {
         updates[cabId] = {
           dwellTimer: newDwell,
           currentSpeed: 0,
           acceleration: 0,
           lastTickTime: now,
           activeEventId: undefined,
         };
       }
       return;
    }

    if (cab.routePhase === 'DROPOFF_DWELL') {
       if (cab.activeEventId) {
         store.resolveSafetyEvent(cab.activeEventId);
       }
       const newDwell = cab.dwellTimer - dtSeconds;
       if (newDwell <= 0) {
         // Trip is finished: mark COMPLETED, which immediately removes it from active fleet
         updates[cabId] = {
           routePhase: 'COMPLETED',
           state: CabSimState.COMPLETED,
           routeProgress: 1.0,
           dwellTimer: 0,
           currentSpeed: 0,
           lastTickTime: now,
           activeEventId: undefined,
         };

         // Persist trip completion to backend
         if (cab.tripId) {
           tripService.update(cab.tripId, {
             status: TripStatus.COMPLETED,
             endTime: new Date().toISOString(),
             endLatitude: cab.latitude,
             endLongitude: cab.longitude,
             distanceKm: parseFloat(cab.distanceTraveledKm.toFixed(2)),
             durationMin: Math.max(15, Math.round(cab.totalRouteDistance / (cab.baseSpeed / 60))),
             avgSpeed: Math.round(cab.baseSpeed * 0.85),
             maxSpeed: Math.round(cab.baseSpeed * 1.15),
             fare: 250 + Math.floor(cab.distanceTraveledKm * 15),
           }).catch((err) => console.warn('Could not persist trip completion:', err));
         }
       } else {
         updates[cabId] = {
           dwellTimer: newDwell,
           currentSpeed: 0,
           acceleration: 0,
           lastTickTime: now,
           activeEventId: undefined,
         };
       }
       return;
    }

    // --- ANOMALY INJECTION & LIFECYCLE ---
    let activeAnomalyType = cab.activeAnomalyType;
    let anomalyStartMs = cab.anomalyStartMs;
    let anomalyDurationMs = cab.anomalyDurationMs;
    let anomalyTargetSpeed = cab.anomalyTargetSpeed;

    // Check if current anomaly expired -> automatically resolve event and restore cab to normal
    if (activeAnomalyType && activeAnomalyType !== 'SOS' && anomalyStartMs) {
      if (now - anomalyStartMs >= (anomalyDurationMs || 0)) {
        if (cab.activeEventId) {
          store.resolveSafetyEvent(cab.activeEventId);
        }
        activeAnomalyType = null;
        anomalyStartMs = undefined;
        anomalyDurationMs = undefined;
        anomalyTargetSpeed = undefined;
        updates[cabId] = {
          ...updates[cabId],
          activeEventId: undefined,
          activeAnomalyType: null,
          anomalyStartMs: undefined,
          anomalyDurationMs: undefined,
          anomalyTargetSpeed: undefined,
        };
      }
    }

    // Check phase transitions based on distance
    if (cab.routePhase === 'DISPATCH' && cab.distanceTraveledKm >= pickupDistance) {
       if (cab.activeEventId) store.resolveSafetyEvent(cab.activeEventId);
       updates[cabId] = {
         routePhase: 'PICKUP_DWELL',
         state: CabSimState.ARRIVED_PICKUP,
         dwellTimer: 10,
         currentSpeed: 0,
         distanceTraveledKm: pickupDistance,
         routeProgress: pickupDistance / totalLength,
         lastTickTime: now,
         activeEventId: undefined,
       };
       return;
    }

    if (cab.routePhase === 'TRIP' && cab.distanceTraveledKm >= totalLength) {
       if (cab.activeEventId) store.resolveSafetyEvent(cab.activeEventId);
       updates[cabId] = {
         routePhase: 'DROPOFF_DWELL',
         state: CabSimState.ARRIVED,
         dwellTimer: 8,
         currentSpeed: 0,
         distanceTraveledKm: totalLength,
         routeProgress: 1.0,
         lastTickTime: now,
         activeEventId: undefined,
       };
       return;
    }

    // Traffic signals (simulate every 1.8 km)
    const signalInterval = 1.8;
    const nextSignalDist = Math.ceil((cab.distanceTraveledKm + 0.001) / signalInterval) * signalInterval;
    const distToSignal = nextSignalDist - cab.distanceTraveledKm;

    let isRedLight = false;
    if (distToSignal < 0.25 && nextSignalDist < totalLength && Math.abs(nextSignalDist - pickupDistance) > 0.15) {
      const cycleMs = 50000;
      const redMs = 20000;
      const offset = (nextSignalDist * 100000) % cycleMs;
      const phaseTime = (now + offset) % cycleMs;
      isRedLight = phaseTime < redMs;
    }

    // Target Speed Calculation
    let targetSpeed = cab.baseSpeed;

    if (activeAnomalyType === 'OVER_SPEEDING') {
      targetSpeed = anomalyTargetSpeed || 82;
    } else {
      let distToStop = totalLength;
      if (cab.routePhase === 'DISPATCH') {
         distToStop = pickupDistance - cab.distanceTraveledKm;
      } else {
         distToStop = totalLength - cab.distanceTraveledKm;
      }

      if (distToStop < 0.15) {
         targetSpeed = Math.min(cab.baseSpeed, (distToStop / 0.15) * 18);
      } else if (isRedLight) {
        if (distToSignal < 0.02) {
          targetSpeed = 0;
        } else {
          targetSpeed = Math.min(cab.baseSpeed, (distToSignal / 0.2) * 25);
        }
      } else {
        // Road-aware natural micro-variation (gentle traffic wave)
        const trafficWave = Math.sin((cab.distanceTraveledKm * 4) + (now / 15000)) * 5;
        targetSpeed = Math.max(26, cab.baseSpeed + trafficWave);
      }
    }

    let currentSpeed = cab.currentSpeed;
    let accel = 0;
    const speedDiffKmh = targetSpeed - currentSpeed;

    // Anomaly-specific acceleration overrides
    if (activeAnomalyType === 'HARSH_BRAKE') {
      accel = -(4.2 + Math.random() * 1.5); // -4.2 to -5.7 m/sÂ²
    } else if (activeAnomalyType === 'SUDDEN_ACCEL') {
      accel = 3.8 + Math.random() * 1.2;  // +3.8 to +5.0 m/sÂ²
    } else if (activeAnomalyType === 'OVER_SPEEDING') {
      accel = Math.min(3.2, Math.max(-3.5, speedDiffKmh / 2.0));
    } else {
      if (speedDiffKmh > 0) {
        accel = Math.min(2.2, speedDiffKmh / 3.6);
      } else if (speedDiffKmh < 0) {
        accel = Math.max(-3.8, speedDiffKmh / 3.6);
      }
    }

    currentSpeed += accel * dtSeconds * 3.6;
    if (currentSpeed < 0.5) currentSpeed = 0;

    const distanceMovedKm = (currentSpeed / 3600) * dtSeconds;
    let newDistanceTraveled = cab.distanceTraveledKm + distanceMovedKm;

    // Clamp to boundaries
    const targetBoundary = cab.routePhase === 'DISPATCH' ? pickupDistance : totalLength;
    if (newDistanceTraveled > targetBoundary) {
       newDistanceTraveled = targetBoundary;
    }

    // Derived trip progress strictly from distance traveled divided by total route distance
    const progress = Math.min(1.0, Math.max(0, newDistanceTraveled / totalLength));
    const point = getPointAtDistance(waypoints, newDistanceTraveled);

    let newHeading = cab.heading;
    if (currentSpeed > 1 && newDistanceTraveled < totalLength - 0.01) {
      const lookAheadPoint = getPointAtDistance(waypoints, Math.min(totalLength, newDistanceTraveled + 0.02));
      let targetBearing = calculateBearing(point, lookAheadPoint) ?? cab.heading;

      let diff = (targetBearing - cab.heading) % 360;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      newHeading = cab.heading + (diff * Math.min(1, dtSeconds * 4));
    }

    // Determine State from dynamic physics
    let newState = cab.routePhase === 'DISPATCH' ? CabSimState.GOING_TO_PICKUP : CabSimState.ON_TRIP;

    if (activeAnomalyType === 'SOS') {
      newState = CabSimState.SOS;
    } else if (currentSpeed > 70) {
      newState = CabSimState.SPEEDING;
    } else if (accel < -3.5) {
      newState = CabSimState.HARSH_BRAKE;
    } else if (accel > 3.5) {
      newState = CabSimState.SUDDEN_ACCEL;
    }

    let activeEventId = cab.activeEventId;
    if (activeEventId && currentSpeed <= 60 && activeAnomalyType !== 'SOS') {
      store.resolveSafetyEvent(activeEventId);
      activeEventId = undefined;
    }

    updates[cabId] = {
      latitude: point[1],
      longitude: point[0],
      heading: newHeading,
      currentSpeed: currentSpeed,
      acceleration: accel,
      distanceTraveledKm: newDistanceTraveled,
      routeProgress: progress,
      brakeApplied: accel < -2.0 || (isRedLight && distToSignal < 0.03) || activeAnomalyType === 'HARSH_BRAKE',
      state: newState,
      activeEventId,
      activeAnomalyType,
      anomalyStartMs,
      anomalyDurationMs,
      anomalyTargetSpeed,
      lastTickTime: now,
      timeInCurrentState: cab.state === newState ? (cab.timeInCurrentState || 0) + dtSeconds * 1000 : 0
    };

    // Detect anomalies during TRIP phase and persist them
    if (cab.routePhase === 'TRIP') {
      anomalyDetector.detectAnomalies(cabId, currentSpeed, accel, now);
    }
  }
}

export const simulationEngine = new SimulationEngine();

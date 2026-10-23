import { DETECTION_THRESHOLDS } from '../config/constants';
import { EventType, EventSeverity, EventStatus, AlertType, AlertSeverity, AlertStatus, SOSSeverity, SOSStatus, CabSimState } from '../types/enums';
import { SafetyEvent, Alert, SOSRequest } from '../types/entities';
import { useSimulationStore } from '../store/simulationStore';
import { safetyEventService } from '../services';

interface CabAnomalyState {
  overSpeedingStartMs?: number;
  lastOverSpeedingEndMs: number;
  lastHarshBrakeMs: number;
  lastSuddenAccelMs: number;
  // Escalation tracking
  recentCriticalTimestamps: number[];
}

/** Maps EventSeverity to AlertSeverity */
function mapToAlertSeverity(severity: EventSeverity): AlertSeverity {
  switch (severity) {
    case EventSeverity.CRITICAL: return AlertSeverity.CRITICAL;
    case EventSeverity.HIGH: return AlertSeverity.WARNING;
    case EventSeverity.MEDIUM: return AlertSeverity.WARNING;
    case EventSeverity.LOW: return AlertSeverity.INFO;
    default: return AlertSeverity.INFO;
  }
}

/** Maps EventType to AlertType */
function mapToAlertType(eventType: EventType): AlertType {
  switch (eventType) {
    case EventType.OVER_SPEEDING: return AlertType.OVER_SPEEDING;
    case EventType.HARSH_BRAKING: return AlertType.HARSH_BRAKING;
    case EventType.SUDDEN_ACCELERATION: return AlertType.SUDDEN_ACCELERATION;
    default: return AlertType.OVER_SPEEDING;
  }
}

let eventCounter = 1000;
let alertCounter = 1000;
let sosCounter = 100;

class AnomalyDetector {
  private states: Map<string, CabAnomalyState> = new Map();

  private getCabState(cabId: string): CabAnomalyState {
    if (!this.states.has(cabId)) {
      this.states.set(cabId, {
        lastOverSpeedingEndMs: 0,
        lastHarshBrakeMs: 0,
        lastSuddenAccelMs: 0,
        recentCriticalTimestamps: [],
      });
    }
    return this.states.get(cabId)!;
  }

  public detectAnomalies(
    cabId: string,
    currentSpeed: number,
    acceleration: number,
    timestamp: number
  ) {
    const anomState = this.getCabState(cabId);

    // 1. Over-speeding
    const { overSpeeding } = DETECTION_THRESHOLDS;
    const warningSpeed = overSpeeding.speedLimit + overSpeeding.warningThreshold;
    const criticalSpeed = overSpeeding.speedLimit + overSpeeding.criticalThreshold;

    if (currentSpeed >= warningSpeed) {
      if (!anomState.overSpeedingStartMs) {
        anomState.overSpeedingStartMs = timestamp;
      } else {
        const duration = timestamp - anomState.overSpeedingStartMs;
        if (duration >= overSpeeding.minimumDurationMs) {
          const timeSinceLast = timestamp - anomState.lastOverSpeedingEndMs;
          if (timeSinceLast >= overSpeeding.cooldownMs || anomState.lastOverSpeedingEndMs === 0) {
             const severity = currentSpeed >= criticalSpeed ? EventSeverity.CRITICAL : EventSeverity.HIGH;
             this.triggerEvent(cabId, EventType.OVER_SPEEDING, severity, currentSpeed, timestamp);
             anomState.lastOverSpeedingEndMs = timestamp;
             anomState.overSpeedingStartMs = undefined; // reset to wait for cooldown
          }
        }
      }
    } else {
      if (anomState.overSpeedingStartMs) {
        anomState.lastOverSpeedingEndMs = timestamp;
      }
      anomState.overSpeedingStartMs = undefined;
      // Auto-resolve over-speeding event when vehicle slows down below threshold
      const store = useSimulationStore.getState();
      const cab = store.cabs[cabId];
      if (cab?.activeEventId) {
        store.resolveSafetyEvent(cab.activeEventId);
        store.updateCab(cabId, { activeEventId: undefined });
      }
    }

    // 2. Harsh Braking
    const { harshBraking } = DETECTION_THRESHOLDS;
    if (currentSpeed >= harshBraking.minimumSpeedKmh && acceleration <= harshBraking.warningThreshold) {
      const timeSinceLast = timestamp - anomState.lastHarshBrakeMs;
      if (timeSinceLast >= harshBraking.cooldownMs || anomState.lastHarshBrakeMs === 0) {
        const severity = acceleration <= harshBraking.criticalThreshold ? EventSeverity.CRITICAL : EventSeverity.HIGH;
        this.triggerEvent(cabId, EventType.HARSH_BRAKING, severity, acceleration, timestamp);
        anomState.lastHarshBrakeMs = timestamp;
      }
    }

    // 3. Sudden Acceleration
    const { suddenAcceleration } = DETECTION_THRESHOLDS;
    if (acceleration >= suddenAcceleration.warningThreshold) {
      const timeSinceLast = timestamp - anomState.lastSuddenAccelMs;
      if (timeSinceLast >= suddenAcceleration.cooldownMs || anomState.lastSuddenAccelMs === 0) {
        const severity = acceleration >= suddenAcceleration.criticalThreshold ? EventSeverity.CRITICAL : EventSeverity.HIGH;
        this.triggerEvent(cabId, EventType.SUDDEN_ACCELERATION, severity, acceleration, timestamp);
        anomState.lastSuddenAccelMs = timestamp;
      }
    }
  }

  private triggerEvent(cabId: string, eventType: EventType, severity: EventSeverity, value: number, timestamp: number) {
    const store = useSimulationStore.getState();
    const cab = store.cabs[cabId];
    if (!cab) return;

    // Guard: A cab can only have ONE active event at any given time
    if (cab.activeEventId) return;

    eventCounter++;
    alertCounter++;

    // 1. Create SafetyEvent
    const event: SafetyEvent = {
      eventId: `EVT-${eventCounter}`,
      cabId,
      driverId: cab.driverId,
      tripId: cab.tripId,
      eventType,
      severity,
      startTime: new Date().toISOString(),
      maxValue: Math.abs(value),
      status: EventStatus.ACTIVE,
      startLatitude: cab.latitude,
      startLongitude: cab.longitude,
      createdAt: new Date().toISOString(),
    };

    // 2. Create Alert
    const typeLabel = eventType.replace('_', ' ');
    const alert: Alert = {
      alertId: `ALT-${alertCounter}`,
      eventId: event.eventId,
      alertType: mapToAlertType(eventType),
      cabId,
      driverId: cab.driverId,
      tripId: cab.tripId,
      severity: mapToAlertSeverity(severity),
      title: `${typeLabel} â€” ${cabId}`,
      message: `${typeLabel} detected | Value: ${Math.abs(value).toFixed(1)} | Driver: ${cab.driverId} | Location: (${cab.latitude.toFixed(4)}, ${cab.longitude.toFixed(4)})`,
      status: AlertStatus.ACTIVE,
      createdAt: new Date().toISOString(),
    };

    // 3. Push to store
    store.addSafetyEvent(event);
    store.addAlert(alert);

    // 4. Persist to backend / repository
    safetyEventService.create(event).catch((err) => {
      console.warn('Could not persist safety event:', err);
    });

    // 5. Set activeEventId on cab
    store.updateCab(cabId, { activeEventId: event.eventId });

    // 6. Harsh braking and sudden acceleration are momentary events (last ~3 seconds)
    // Automatically transition them to RESOLVED after 3 seconds so active count stays strictly accurate
    if (eventType === EventType.HARSH_BRAKING || eventType === EventType.SUDDEN_ACCELERATION) {
      setTimeout(() => {
        const curStore = useSimulationStore.getState();
        curStore.resolveSafetyEvent(event.eventId);
        const curCab = curStore.cabs[cabId];
        if (curCab?.activeEventId === event.eventId) {
          curStore.updateCab(cabId, { activeEventId: undefined });
        }
      }, 3000);
    }

    // 7. Escalation check â€” SOS
    this.evaluateEscalation(cabId, event, timestamp);
  }

  private activeSosCabIds = new Set<string>();

  public clearActiveSos(cabId: string) {
    this.activeSosCabIds.delete(cabId);
  }

  /** Trigger an SOS directly (e.g. from passenger panic button injection) */
  public triggerSOS(cabId: string, reason: string, severity: SOSSeverity) {
    const store = useSimulationStore.getState();
    const cab = store.cabs[cabId];
    if (!cab) return;

    // Guard: Prevent duplicate SOS triggers on the same cab concurrently
    if (this.activeSosCabIds.has(cabId) || cab.state === CabSimState.SOS) {
      console.log(`[SOS Guard] Cab ${cabId} already has an active SOS â€” skipping duplicate trigger`);
      return;
    }
    this.activeSosCabIds.add(cabId);

    sosCounter++;
    const uniqueTs = Date.now();
    const cabNum = parseInt(cabId.replace('CAB-', ''), 10) || 1;
    const safeDriverId = cab.driverId && cab.driverId.startsWith('DRV-')
      ? cab.driverId
      : `DRV-${String(cabNum).padStart(3, '0')}`;

    const sos: SOSRequest = {
      sosId: `SOS-${sosCounter}-${uniqueTs}`,
      tripId: cab.tripId || 'N/A',
      passengerId: cab.passengerId || 'N/A',
      driverId: safeDriverId,
      cabId,
      latitude: cab.latitude,
      longitude: cab.longitude,
      reason,
      severity,
      status: SOSStatus.ACTIVE,
      createdAt: new Date().toISOString(),
    };

    store.addSOSRequest(sos);
    store.updateCab(cabId, { state: CabSimState.SOS });

    // Create and persist corresponding SafetyEvent for RDS persistence & AWS IoT publishing
    const sosEvent: SafetyEvent = {
      eventId: `EVT-SOS-${uniqueTs}`,
      cabId,
      driverId: safeDriverId,
      tripId: cab.tripId && cab.tripId !== 'N/A' ? cab.tripId : undefined,
      eventType: 'SOS' as any,
      severity: EventSeverity.CRITICAL,
      startTime: new Date().toISOString(),
      maxValue: 1,
      status: EventStatus.ACTIVE,
      startLatitude: cab.latitude,
      startLongitude: cab.longitude,
      createdAt: new Date().toISOString(),
    };
    store.addSafetyEvent(sosEvent);
    safetyEventService.create(sosEvent).catch((err) => {
      console.warn('Could not persist SOS safety event:', err);
    });

    // Also create an EMERGENCY alert for the SOS
    alertCounter++;
    const alert: Alert = {
      alertId: `ALT-${alertCounter}`,
      sosId: sos.sosId,
      alertType: AlertType.SOS,
      cabId,
      driverId: cab.driverId,
      tripId: cab.tripId,
      severity: AlertSeverity.EMERGENCY,
      title: `ðŸš¨ SOS â€” ${cabId}`,
      message: `${reason} | Passenger: ${cab.passengerId || 'N/A'} | Location: (${cab.latitude.toFixed(4)}, ${cab.longitude.toFixed(4)})`,
      status: AlertStatus.ACTIVE,
      createdAt: new Date().toISOString(),
    };
    store.addAlert(alert);

    console.log(`[SOS TRIGGERED] ${cabId} | ${reason} | ${severity}`);

    // Auto-resolve SOS after 45â€“90 seconds (simulated response)
    const resolveDelay = 45000 + Math.random() * 45000;
    setTimeout(() => {
      const currentStore = useSimulationStore.getState();
      const currentSOS = currentStore.sosRequests.find(s => s.sosId === sos.sosId);
      if (currentSOS && currentSOS.status === SOSStatus.ACTIVE) {
        currentStore.updateSOSStatus(sos.sosId, {
          status: SOSStatus.RESOLVED,
          resolvedAt: new Date().toISOString(),
          resolutionNotes: 'Resolved by dispatch team',
          responseTimeSec: Math.round(resolveDelay / 1000),
        });
        currentStore.resolveSafetyEvent(sosEvent.eventId);
        // Return cab to normal state
        const cabNow = currentStore.cabs[cabId];
        if (cabNow && cabNow.state === CabSimState.SOS) {
          currentStore.updateCab(cabId, {
            state: CabSimState.ON_TRIP,
            activeAnomalyType: null,
            activeEventId: undefined,
          });
        }
        this.activeSosCabIds.delete(cabId);
        console.log(`[SOS RESOLVED] ${sos.sosId} â€” ${cabId}`);
      }
    }, resolveDelay);
  }

  private evaluateEscalation(cabId: string, latestEvent: SafetyEvent, timestamp: number) {
    const anomState = this.getCabState(cabId);

    // Track critical events for this cab
    if (latestEvent.severity === EventSeverity.CRITICAL) {
      anomState.recentCriticalTimestamps.push(timestamp);
    }

    // Prune events older than 10 minutes
    const tenMinAgo = timestamp - 10 * 60 * 1000;
    anomState.recentCriticalTimestamps = anomState.recentCriticalTimestamps.filter(t => t > tenMinAgo);

    // Rule: 2+ critical events in 10 minutes â†’ SOS
    if (anomState.recentCriticalTimestamps.length >= 2) {
      // Check that we don't already have an active SOS for this cab
      const store = useSimulationStore.getState();
      const existingActiveSOS = store.sosRequests.find(s => s.cabId === cabId && s.status === SOSStatus.ACTIVE);
      if (!existingActiveSOS) {
        this.triggerSOS(cabId, 'Multiple critical safety events detected', SOSSeverity.HIGH);
        // Reset counter to prevent immediate re-trigger
        anomState.recentCriticalTimestamps = [];
      }
    }

    // Rule: Critical harsh braking + near-zero speed â†’ crash indicator
    if (latestEvent.eventType === EventType.HARSH_BRAKING && latestEvent.severity === EventSeverity.CRITICAL) {
      const store = useSimulationStore.getState();
      const cab = store.cabs[cabId];
      if (cab && cab.currentSpeed < 3) {
        const existingActiveSOS = store.sosRequests.find(s => s.cabId === cabId && s.status === SOSStatus.ACTIVE);
        if (!existingActiveSOS) {
          this.triggerSOS(cabId, 'Possible collision detected â€” harsh braking with sudden stop', SOSSeverity.CRITICAL);
          anomState.recentCriticalTimestamps = [];
        }
      }
    }
  }
}

export const anomalyDetector = new AnomalyDetector();

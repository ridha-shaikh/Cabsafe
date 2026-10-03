import { DETECTION_THRESHOLDS } from '../config/constants';
import { EventType, EventSeverity } from '../types/enums';

interface CabAnomalyState {
  overSpeedingStartMs?: number;
  lastOverSpeedingEndMs: number;
  lastHarshBrakeMs: number;
  lastSuddenAccelMs: number;
}

class AnomalyDetector {
  private states: Map<string, CabAnomalyState> = new Map();

  private getCabState(cabId: string): CabAnomalyState {
    if (!this.states.has(cabId)) {
      this.states.set(cabId, {
        lastOverSpeedingEndMs: 0,
        lastHarshBrakeMs: 0,
        lastSuddenAccelMs: 0,
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
    const state = this.getCabState(cabId);
    
    // 1. Over-speeding
    const { overSpeeding } = DETECTION_THRESHOLDS;
    const warningSpeed = overSpeeding.speedLimit + overSpeeding.warningThreshold;
    const criticalSpeed = overSpeeding.speedLimit + overSpeeding.criticalThreshold;
    
    if (currentSpeed >= warningSpeed) {
      if (!state.overSpeedingStartMs) {
        state.overSpeedingStartMs = timestamp;
      } else {
        const duration = timestamp - state.overSpeedingStartMs;
        if (duration >= overSpeeding.minimumDurationMs) {
          const timeSinceLast = timestamp - state.lastOverSpeedingEndMs;
          if (timeSinceLast >= overSpeeding.cooldownMs || state.lastOverSpeedingEndMs === 0) {
             const severity = currentSpeed >= criticalSpeed ? EventSeverity.CRITICAL : EventSeverity.HIGH;
             this.triggerEvent(cabId, EventType.OVER_SPEEDING, severity, currentSpeed);
             state.lastOverSpeedingEndMs = timestamp;
             state.overSpeedingStartMs = undefined; // reset to wait for cooldown
          }
        }
      }
    } else {
      state.overSpeedingStartMs = undefined;
    }

    // 2. Harsh Braking
    const { harshBraking } = DETECTION_THRESHOLDS;
    if (currentSpeed >= harshBraking.minimumSpeedKmh && acceleration <= harshBraking.warningThreshold) {
      const timeSinceLast = timestamp - state.lastHarshBrakeMs;
      if (timeSinceLast >= harshBraking.cooldownMs || state.lastHarshBrakeMs === 0) {
        const severity = acceleration <= harshBraking.criticalThreshold ? EventSeverity.CRITICAL : EventSeverity.HIGH;
        this.triggerEvent(cabId, EventType.HARSH_BRAKING, severity, acceleration);
        state.lastHarshBrakeMs = timestamp;
      }
    }

    // 3. Sudden Acceleration
    const { suddenAcceleration } = DETECTION_THRESHOLDS;
    if (acceleration >= suddenAcceleration.warningThreshold) {
      const timeSinceLast = timestamp - state.lastSuddenAccelMs;
      if (timeSinceLast >= suddenAcceleration.cooldownMs || state.lastSuddenAccelMs === 0) {
        const severity = acceleration >= suddenAcceleration.criticalThreshold ? EventSeverity.CRITICAL : EventSeverity.HIGH;
        this.triggerEvent(cabId, EventType.SUDDEN_ACCELERATION, severity, acceleration);
        state.lastSuddenAccelMs = timestamp;
      }
    }
  }
  
  private triggerEvent(cabId: string, eventType: EventType, severity: EventSeverity, value: number) {
    console.log(`[Anomaly Detected] Cab ${cabId} | ${eventType} | Severity: ${severity} | Value: ${value.toFixed(2)}`);
  }
}

export const anomalyDetector = new AnomalyDetector();

export const APP_CONFIG = {
  APP_NAME: 'CabSafe',
  VERSION: '1.0.0',
  DEFAULT_MAP_CENTER: [80.2707, 13.0827] as [number, number], // Chennai
  DEFAULT_MAP_ZOOM: 12,
  MAX_CABS: 100,
};

export const DETECTION_THRESHOLDS = {
  overSpeeding: {
    speedLimit: 60,              // km/h (City limit for Chennai)
    warningThreshold: 10,        // Warning at 70 km/h
    criticalThreshold: 25,       // Critical at 85 km/h
    minimumDurationMs: 3000,     // Must sustain for 3 seconds
    cooldownMs: 30000,           // 30 second cooldown after event ends
  },
  harshBraking: {
    warningThreshold: -3.5,      // m/s² (deceleration)
    criticalThreshold: -6.0,     // m/s²
    minimumSpeedKmh: 20,         // Ignore braking below 20 km/h
    cooldownMs: 15000,           // 15 second cooldown
  },
  suddenAcceleration: {
    warningThreshold: 3.5,       // m/s²
    criticalThreshold: 6.0,      // m/s²
    cooldownMs: 15000,
  },
  scoring: {
    baseScore: 100,
    penalties: {
      LOW: 2,
      MEDIUM: 5,
      HIGH: 10,
      CRITICAL: 20,
    },
    recencyDecayDays: 30,        
    recencyWeight: 0.5,          
    tripsNormalizationFactor: 50, 
  },
};

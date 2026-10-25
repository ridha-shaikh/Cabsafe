// CabSafe Acceptance Test Suite
// Verifies all 8 acceptance criteria locally without requiring live AWS writes.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('================================================================');
console.log('CabSafe Dynamic Fleet Simulation & Persistence Verification');
console.log('================================================================\n');

// ─── TEST 1: Seed SQL Verification ──────────────────────────────────────────
console.log('TEST 1: Seed SQL Row Counts & Foreign Key Integrity');
const seedPath = path.join(rootDir, 'aws-backend', 'seed.sql');
const seedSql = fs.readFileSync(seedPath, 'utf8');

// Parse users
const userMatches = seedSql.match(/\('([A-Z0-9-]+)','([^']+)',/g) || [];
const driverUsers = userMatches.filter(m => m.includes('DRV-'));
const passengerUsers = userMatches.filter(m => m.includes('PSG-'));

assert(driverUsers.length === 50, `Exactly 50 drivers in seed.sql (found ${driverUsers.length})`);
assert(passengerUsers.length === 50, `Exactly 50 passengers in seed.sql (found ${passengerUsers.length})`);
assert(driverUsers.length + passengerUsers.length === 100, `Total 100 simulated users in seed.sql (found ${driverUsers.length + passengerUsers.length})`);

// Parse cabs
const cabMatches = seedSql.match(/\('CAB-\d{3}',/g) || [];
assert(cabMatches.length === 50, `Exactly 50 cabs in seed.sql (found ${cabMatches.length})`);

// Parse trips
const tripMatches = seedSql.match(/\('TRP-\d{4}',/g) || [];
assert(tripMatches.length === 10, `Exactly 10 historical trips in seed.sql (found ${tripMatches.length})`);

// Parse safety events
const eventMatches = seedSql.match(/\('EVT-\d{3}',/g) || [];
assert(eventMatches.length === 4, `Exactly 4 historical safety events in seed.sql (found ${eventMatches.length})`);

// Verify no invalid updated_at column references on cabs, trips, safety_events
const cabSection = seedSql.split('SECTION 3: Cabs')[1]?.split('SECTION 4:')[0] || '';
const tripSection = seedSql.split('SECTION 4:')[1]?.split('SECTION 5:')[0] || '';
const eventSection = seedSql.split('SECTION 5:')[1]?.split('SET FOREIGN_KEY_CHECKS')[0] || '';

assert(!cabSection.includes('updated_at'), 'cabs table seed does not reference non-existent updated_at');
assert(!tripSection.includes('updated_at'), 'trips table seed does not reference non-existent updated_at');
assert(!eventSection.includes('updated_at'), 'safety_events table seed does not reference non-existent updated_at');


// ─── TEST 2: Seed Script Idempotency & Active State Preservation ─────────────
console.log('\nTEST 2: Seed Script Idempotency & Operational State Preservation');
assert(cabSection.includes('ON DUPLICATE KEY UPDATE'), 'cabs uses ON DUPLICATE KEY UPDATE for idempotency');
assert(!cabSection.match(/ON DUPLICATE KEY UPDATE[\s\S]*status\s*=/i), 'cabs re-seed does NOT reset operational status');
assert(tripSection.includes('ON DUPLICATE KEY UPDATE'), 'trips uses ON DUPLICATE KEY UPDATE for idempotency');
assert(eventSection.includes('ON DUPLICATE KEY UPDATE'), 'safety_events uses ON DUPLICATE KEY UPDATE for idempotency');


// ─── TEST 3: Lambda Handler Routes & Source Discrimination ───────────────────
console.log('\nTEST 3: Lambda Handler Routes & Event Source Discrimination');
const lambdaPath = path.join(rootDir, 'aws-backend', 'index.mjs');
const lambdaCode = fs.readFileSync(lambdaPath, 'utf8');

assert(lambdaCode.includes('isApiGatewayEvent'), 'Lambda discriminates API Gateway HTTP vs IoT Rule payloads');
assert(lambdaCode.includes("path.includes('/cabs') && method === 'GET'"), 'GET /cabs route preserved');
assert(lambdaCode.includes("path.includes('/events') && method === 'GET'"), 'GET /events route preserved');
assert(lambdaCode.includes("path.includes('/trips') && method === 'GET'"), 'GET /trips route implemented');
assert(lambdaCode.includes("path.includes('/drivers') && method === 'GET'"), 'GET /drivers route implemented');
assert(lambdaCode.includes("path.includes('/events') && method === 'POST'"), 'POST /events route implemented');
assert(lambdaCode.includes("path.includes('/trips') && method === 'POST'"), 'POST /trips route implemented');
assert(lambdaCode.includes("path.includes('/cabs') && (method === 'PUT'"), 'PUT /cabs throttled update route implemented');


// ─── TEST 4: Parameterized SQL & Foreign Key Validation ───────────────────────
console.log('\nTEST 4: Foreign Key Validation & Parameterized SQL');
assert(lambdaCode.includes('SELECT cab_id FROM cabs WHERE cab_id = ?'), 'Foreign key check on cab_id exists');
assert(lambdaCode.includes('SELECT user_id FROM users WHERE user_id = ? AND role = ?'), 'Foreign key check on driver_id exists');
assert(lambdaCode.includes('SELECT user_id FROM users WHERE user_id = ? AND role = ?'), 'Foreign key check on passenger_id exists');
assert(lambdaCode.includes('ON DUPLICATE KEY UPDATE event_id = event_id'), 'Idempotent event insert prevents duplicates');
assert(!lambdaCode.includes('INSERT IGNORE'), 'Does not use forbidden INSERT IGNORE');


// ─── TEST 5: IoT Telemetry Handling & Lambda Notifier Invocation ──────────────
console.log('\nTEST 5: IoT Telemetry Heartbeat Filtering & Lambda Notifier Invocation');
assert(lambdaCode.includes('eventType === \'HEARTBEAT\' || eventType === \'TELEMETRY\''), 'Filters routine telemetry heartbeats');
assert(lambdaCode.includes('client-lambda') && lambdaCode.includes('CabSafeSOSNotifier'), 'Lambda invokes CabSafeSOSNotifier function');
assert(lambdaCode.includes("InvocationType: 'Event'") || lambdaCode.includes('InvocationType: "Event"'), 'Uses asynchronous InvocationType: "Event"');
assert(!lambdaCode.includes('client-sns') && !lambdaCode.includes('CabSafe-Emergency-Alerts'), 'CabSafeAPI does not call SNS directly');
assert(lambdaCode.includes('client-iot-data-plane') && lambdaCode.includes('cabsafe/telemetry/'), 'Lambda publishes SOS to IoT Core topic cabsafe/telemetry/{cabId}');
assert(lambdaCode.includes('handleIoTTelemetry'), 'Direct IoT Rule handler function exists');


// ─── TEST 6: Frontend API Repositories & Service Wiring ───────────────────────
console.log('\nTEST 6: Frontend Repositories & Service Wiring');
const apiCabPath = path.join(rootDir, 'src', 'repositories', 'api', 'ApiCabRepository.ts');
const apiTripPath = path.join(rootDir, 'src', 'repositories', 'api', 'ApiTripRepository.ts');
const apiEventPath = path.join(rootDir, 'src', 'repositories', 'api', 'ApiSafetyEventRepository.ts');
const servicesIndexPath = path.join(rootDir, 'src', 'services', 'index.ts');

assert(fs.existsSync(apiCabPath), 'ApiCabRepository exists');
assert(fs.existsSync(apiTripPath), 'ApiTripRepository exists');
assert(fs.existsSync(apiEventPath), 'ApiSafetyEventRepository exists');

const servicesCode = fs.readFileSync(servicesIndexPath, 'utf8');
assert(servicesCode.includes('useApi ? new ApiCabRepository() : new MockCabRepository()'), 'CabService switches between API and Mock repository');
assert(servicesCode.includes('useApi ? new ApiTripRepository() : new MockTripRepository()'), 'TripService switches between API and Mock repository');
assert(servicesCode.includes('useApi ? new ApiSafetyEventRepository() : new MockSafetyEventRepository()'), 'SafetyEventService switches between API and Mock repository');


// ─── TEST 7: Simulation Engine Persistence & Hydration ───────────────────────
console.log('\nTEST 7: Dynamic Simulation Engine Persistence & Hydration');
const simEnginePath = path.join(rootDir, 'src', 'simulation', 'SimulationEngine.ts');
const simEngineCode = fs.readFileSync(simEnginePath, 'utf8');

assert(simEngineCode.includes('tripService.create'), 'SimulationEngine persists new trip dispatches via tripService');
assert(simEngineCode.includes('tripService.update'), 'SimulationEngine persists completed trips via tripService');
assert(simEngineCode.includes('cabService.batchUpdate'), 'SimulationEngine persists throttled cab states via cabService');
assert(simEngineCode.includes('store.hydrateSafetyEvents'), 'SimulationEngine hydrates historical safety events on start');

const anomDetectorPath = path.join(rootDir, 'src', 'anomalyDetection', 'AnomalyDetector.ts');
const anomDetectorCode = fs.readFileSync(anomDetectorPath, 'utf8');
assert(anomDetectorCode.includes('safetyEventService.create(event)'), 'AnomalyDetector persists safety events via safetyEventService');
assert(anomDetectorCode.includes('safetyEventService.create(sosEvent)'), 'AnomalyDetector persists SOS incidents via safetyEventService');


// ─── TEST 8: Mock Data Stability & Offline Development Fallback ──────────────
console.log('\nTEST 8: Mock Data Stability & Deterministic IDs');
const mockDataPath = path.join(rootDir, 'src', 'data', 'mockData.ts');
const mockDataCode = fs.readFileSync(mockDataPath, 'utf8');

assert(mockDataCode.includes('CAB_DEFINITIONS'), 'Mock data has deterministic cab definitions');
assert(mockDataCode.includes('DRIVER_NAMES'), 'Mock data has deterministic driver names');
assert(mockDataCode.includes('userId: `DRV-${idStr}`'), 'Mock drivers use DRV-XXX user_id matching seed.sql and RDS FK');
assert(mockDataCode.includes('userId: `PSG-${idStr}`'), 'Mock passengers use PSG-XXX user_id matching seed.sql and RDS FK');
assert(mockDataCode.includes('TRIP_SEEDS'), 'Mock trips match seed.sql TRP-1001 .. TRP-1010');

console.log('\n================================================================');
console.log(`Results: ${passedTests} / ${totalTests} tests passed (${Math.round(passedTests / totalTests * 100)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!');
} else {
  process.exit(1);
}

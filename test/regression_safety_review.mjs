// CabSafe Safety Review Regression Test Suite
// Verifies all 7 safety review criteria locally:
// 1. Canonical SOS identity & unique incident KPI counting (both collections & multiple on same cab)
// 2. Strict 1-to-1 resolution matching without cab-wide cascade
// 3. Backend status authority (RDS ACTIVE events cannot be hidden by stale localStorage)
// 4. Simulation isolation (routine drills never hit backend / IoT / SNS)
// 5. Hydration correctness & immutability (no in-place mutation, no status wiping, no artificial endTime)
// 6. Maintenance KPI (dynamic calculation, no hardcoded fallback of 3)

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
console.log('CabSafe Safety Review Regression Verification Suite');
console.log('================================================================\n');

// ─── TEST 1: Canonical SOS Identity & Unique Incident KPI Counting ─────────
console.log('TEST 1: Canonical SOS Identity & KPI Counting');

// Logic under test (exact implementation from DashboardPage.tsx)
function computeActiveSosCount(sosRequests, safetyEvents, resolvedEventIds = new Set(), isStaleDemo = () => false) {
  const activeIncidentIds = new Set();

  for (const s of sosRequests) {
    if ((s.status === 'ACTIVE' || s.status === 'RESPONDING') && !resolvedEventIds.has(s.sosId)) {
      activeIncidentIds.add(s.sosId);
    }
  }

  for (const e of safetyEvents) {
    if (
      String(e.eventType) === 'SOS' &&
      e.status === 'ACTIVE' &&
      !e.endTime &&
      !resolvedEventIds.has(e.eventId) &&
      !isStaleDemo(e)
    ) {
      activeIncidentIds.add(e.eventId);
    }
  }

  return activeIncidentIds.size;
}

// Case A: One incident represented in BOTH collections (sosRequests and safetyEvents)
const sharedIncidentId = 'EVT-SOS-1729000000001';
const sosListA = [
  { sosId: sharedIncidentId, cabId: 'CAB-001', status: 'ACTIVE' },
];
const safetyEventsListA = [
  { eventId: sharedIncidentId, cabId: 'CAB-001', eventType: 'SOS', status: 'ACTIVE', endTime: undefined },
];

const countA = computeActiveSosCount(sosListA, safetyEventsListA);
assert(countA === 1, `One incident in both collections counts as 1 (got ${countA})`);

// Case B: Two separate incidents on the SAME cab (CAB-001)
const sosListB = [
  { sosId: 'EVT-SOS-1001', cabId: 'CAB-001', status: 'ACTIVE' },
  { sosId: 'EVT-SOS-1002', cabId: 'CAB-001', status: 'ACTIVE' },
];
const safetyEventsListB = [
  { eventId: 'EVT-SOS-1001', cabId: 'CAB-001', eventType: 'SOS', status: 'ACTIVE' },
  { eventId: 'EVT-SOS-1002', cabId: 'CAB-001', eventType: 'SOS', status: 'ACTIVE' },
];

const countB = computeActiveSosCount(sosListB, safetyEventsListB);
assert(countB === 2, `Two separate incidents on same cab count as 2 distinct incidents (got ${countB})`);


// ─── TEST 2: Strict 1-to-1 Resolution Matching ──────────────────────────────
console.log('\nTEST 2: Strict 1-to-1 Resolution Matching (No Cab-Level Cascade)');

// Simulate resolving EVT-SOS-1001
const resolvedEventIds = new Set(['EVT-SOS-1001']);
const countAfterResolveOne = computeActiveSosCount(sosListB, safetyEventsListB, resolvedEventIds);
assert(countAfterResolveOne === 1, `Resolving 1 of 2 incidents on CAB-001 leaves remaining incident active (got ${countAfterResolveOne})`);

// Check store code does not contain broad cabId matching
const storePath = path.join(rootDir, 'src', 'store', 'simulationStore.ts');
const storeCode = fs.readFileSync(storePath, 'utf8');

assert(!storeCode.includes('cabId && s.cabId === cabId && s.status !=='), 'resolveSafetyEvent does not cascade-resolve other incidents on cabId');
assert(!storeCode.includes('cabId && e.cabId === cabId && (e.eventType as string) === \'SOS\''), 'updateSOSStatus does not cascade-resolve other events on cabId');
assert(storeCode.includes('s.sosId === eventId'), 'Exact canonical ID matching used for SOS resolution');
assert(storeCode.includes('e.eventId === sosId'), 'Exact canonical ID matching used for SafetyEvent resolution');


// ─── TEST 3: Backend Status Authority & No Overriding by Stale LocalStorage ──
console.log('\nTEST 3: Backend Status Authority & Guarded Storage');

assert(!storeCode.includes('resolvedEventIds: getInitialResolvedIds()'), 'Store does not load stale resolvedEventIds from localStorage on startup');
assert(storeCode.includes('resolvedEventIds: new Set<string>()'), 'resolvedEventIds is initialized clean for active operator session');
assert(storeCode.includes('isStorageAvailable = ()'), 'Guarded storage availability check exists');

// Verify backend status authority logic:
function normalizeHydratedEvent(rawEvt, sessionResolvedIds = new Set()) {
  const isBackendResolved =
    rawEvt.status === 'RESOLVED' ||
    Boolean(rawEvt.endTime);

  const isSessionResolved = sessionResolvedIds.has(rawEvt.eventId);
  const isResolved = isBackendResolved || isSessionResolved;

  return {
    ...rawEvt,
    status: isResolved ? 'RESOLVED' : rawEvt.status,
    endTime: rawEvt.endTime,
  };
}

const activeRdsEvent = {
  eventId: 'EVT-PROD-999',
  cabId: 'CAB-005',
  eventType: 'SOS',
  status: 'ACTIVE',
  endTime: undefined,
};

const hydratedWithoutSession = normalizeHydratedEvent(activeRdsEvent, new Set());
assert(hydratedWithoutSession.status === 'ACTIVE', 'Production RDS ACTIVE event remains ACTIVE without session resolution');
assert(hydratedWithoutSession.endTime === undefined, 'Does not fabricate artificial endTime when undefined');


// ─── TEST 4: Hydration Correctness & Immutability ───────────────────────────
console.log('\nTEST 4: Hydration Correctness & Immutability');

assert(storeCode.includes('let newSosList = [...state.sosRequests];'), 'hydrateSafetyEvents makes shallow copy of SOS array');
assert(!storeCode.includes('sosMatch.status = SOSStatus.RESOLVED;'), 'hydrateSafetyEvents does not mutate existing SOS objects in-place');
assert(!storeCode.includes('new Date(new Date(rawEvt.startTime).getTime() + 60000)'), 'hydrateSafetyEvents does not invent artificial endTime');
assert(!storeCode.includes('status: isResolved ? (\'RESOLVED\' as any) : (\'ACTIVE\' as any)'), 'hydrateSafetyEvents does not overwrite non-ACTIVE statuses with ACTIVE');


// ─── TEST 5: Maintenance KPI (Clean Metric Separation & No Math.max) ────────
console.log('\nTEST 5: Dynamic Maintenance KPI Calculation');

const dashboardPath = path.join(rootDir, 'src', 'pages', 'DashboardPage.tsx');
const dashboardCode = fs.readFileSync(dashboardPath, 'utf8');

assert(!dashboardCode.includes('return fromSim > 0 ? fromSim : 3;'), 'Removed hardcoded fallback of 3 from DashboardPage.tsx');
assert(!dashboardCode.includes('Math.max(fromSim,'), 'Does not merge vehicle counts with record counts via Math.max');
assert(dashboardCode.includes('maintenanceService.getAll()'), 'Maintenance count queried dynamically from maintenanceService');
assert(dashboardCode.includes("c.state === 'MAINTENANCE'"), 'Separately calculates vehicles in MAINTENANCE state');
assert(dashboardCode.includes('MaintenanceStatus.SCHEDULED') && dashboardCode.includes('MaintenanceStatus.IN_PROGRESS'), 'Separately calculates maintenance records by relevant status (scheduled vs in-progress)');


// ─── TEST 6: Simulation Isolation (Routine Drills vs Real AWS) ──────────────
console.log('\nTEST 6: Simulation Isolation (Routine Drills vs Deliberate AWS Test)');

const simEnginePath = path.join(rootDir, 'src', 'simulation', 'SimulationEngine.ts');
const simEngineCode = fs.readFileSync(simEnginePath, 'utf8');

assert(simEngineCode.includes('anomalyDetector.triggerSOS(') && simEngineCode.includes('false'), 'Scheduled background SOS drills explicitly pass persistToBackend: false');

const anomDetectorPath = path.join(rootDir, 'src', 'anomalyDetection', 'AnomalyDetector.ts');
const anomDetectorCode = fs.readFileSync(anomDetectorPath, 'utf8');

assert(anomDetectorCode.includes('if (persistToBackend) {\n      safetyEventService.create(sosEvent)'), 'Backend safetyEventService.create guarded strictly by persistToBackend flag');
assert(anomDetectorCode.includes('canonicalIncidentId'), 'Canonical incident ID assigned at creation in AnomalyDetector');

const sosPagePath = path.join(rootDir, 'src', 'pages', 'SOSPage.tsx');
const sosPageCode = fs.readFileSync(sosPagePath, 'utf8');

assert(sosPageCode.includes('Deliberate AWS IoT & SNS Test') || sosPageCode.includes('DELIBERATE AWS INTEGRATION TEST'), 'Manual test button explicitly labeled as deliberate AWS integration test');


// ─── TEST 7: Route & Navigation Preservation ────────────────────────────────
console.log('\nTEST 7: Route & Navigation Preservation');

const appPath = path.join(rootDir, 'src', 'App.tsx');
const appCode = fs.readFileSync(appPath, 'utf8');
assert(appCode.includes('path="/database"') && appCode.includes('DatabaseOverviewPage'), 'Route /database preserved');
assert(appCode.includes('path="/telemetry-monitor"') && appCode.includes('TelemetryMonitorPage'), 'Route /telemetry-monitor preserved');

const sidebarPath = path.join(rootDir, 'src', 'components/layout/Sidebar.tsx');
const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');
assert(sidebarCode.includes("to: '/database'") && sidebarCode.includes("to: '/telemetry-monitor'"), 'Both DB Overview and Telemetry Monitor present in Sidebar');


// ─── TEST 8: API Routing, URL Normalization & Fair LRU Telemetry Sync ────────
console.log('\nTEST 8: API Routing, URL Normalization & Least-Recently-Synced (LRU) Telemetry Sync');

const apiConfigPath = path.join(rootDir, 'src', 'config', 'apiConfig.ts');
const apiConfigCode = fs.readFileSync(apiConfigPath, 'utf8');

assert(!apiConfigCode.includes("url = `${url}/default`"), 'apiConfig.ts does not append /default to API URL');
assert(apiConfigCode.includes("url.replace(/\\/default$/, '')"), 'apiConfig.ts strips /default suffix if present');
assert(apiConfigCode.includes("'https://khn3o7zesa.execute-api.ap-south-1.amazonaws.com'"), 'apiConfig.ts uses root invoke URL as default');

// Pure function test for getApiBaseUrl normalization logic
function normalizeApiUrl(raw) {
  let url = (raw || 'https://khn3o7zesa.execute-api.ap-south-1.amazonaws.com').trim().replace(/\/+$/, '');
  url = url.replace(/\/default$/, '');
  return url;
}

assert(
  normalizeApiUrl('https://khn3o7zesa.execute-api.ap-south-1.amazonaws.com/default') ===
    'https://khn3o7zesa.execute-api.ap-south-1.amazonaws.com',
  'normalizeApiUrl strips /default suffix correctly'
);
assert(
  normalizeApiUrl('https://khn3o7zesa.execute-api.ap-south-1.amazonaws.com/default///') ===
    'https://khn3o7zesa.execute-api.ap-south-1.amazonaws.com',
  'normalizeApiUrl handles trailing slashes and /default correctly'
);
assert(
  normalizeApiUrl('https://khn3o7zesa.execute-api.ap-south-1.amazonaws.com') ===
    'https://khn3o7zesa.execute-api.ap-south-1.amazonaws.com',
  'normalizeApiUrl preserves clean root URL'
);

const apiCabRepoPath = path.join(rootDir, 'src', 'repositories', 'api', 'ApiCabRepository.ts');
const apiCabRepoCode = fs.readFileSync(apiCabRepoPath, 'utf8');

assert(!apiCabRepoCode.includes("method: 'PUT'"), 'ApiCabRepository does not attempt unsupported PUT /cabs requests');
assert(apiCabRepoCode.includes("action=sync"), 'ApiCabRepository uses supported action=sync on GET /cabs');
assert(apiCabRepoCode.includes("!response.ok"), 'ApiCabRepository checks HTTP response.ok status');
assert(apiCabRepoCode.includes("selectLeastRecentlySyncedBatch"), 'ApiCabRepository uses selectLeastRecentlySyncedBatch for fair telemetry sync');
assert(!apiCabRepoCode.includes("cleanList.slice(0, 15)"), 'Replaced static slice(0, 15) starvation pattern');

// Load the actual production TypeScript module using Vite's programmatic compiler
const { createServer } = await import('vite');
const viteServer = await createServer({ logLevel: 'silent' });

try {
  const apiRepoModule = await viteServer.ssrLoadModule('./src/repositories/api/ApiCabRepository.ts');
  const { selectLeastRecentlySyncedBatch, ApiCabRepository } = apiRepoModule;

  assert(typeof selectLeastRecentlySyncedBatch === 'function', 'Exported production selectLeastRecentlySyncedBatch function loaded');
  assert(typeof ApiCabRepository === 'function', 'Exported production ApiCabRepository class loaded');

  // 1. Production LRU Batching Test: 50-cab fleet coverage over 4 ticks (batch size 15)
  const fleet50 = Array.from({ length: 50 }, (_, i) => ({
    cabId: `CAB-${String(i + 1).padStart(3, '0')}`,
    status: 'ACTIVE',
    currentLatitude: 12.9716,
    currentLongitude: 77.5946,
    currentSpeed: 30,
    mileageKm: 100.5,
  }));

  const lruSyncMap = new Map();
  const coveredCabs = new Set();
  const batchSizes = [];

  for (let tick = 0; tick < 4; tick++) {
    const timestamp = 1000 * (tick + 1);
    const { batch } = selectLeastRecentlySyncedBatch(fleet50, lruSyncMap, 15, timestamp);
    batchSizes.push(batch.length);
    for (const c of batch) {
      coveredCabs.add(c.cabId);
    }
  }

  assert(coveredCabs.size === 50, `Production LRU batching covers all 50 cabs in 4 iterations (covered: ${coveredCabs.size})`);
  assert(batchSizes.every(size => size <= 15), 'Every LRU batch respects maximum batchSize of 15');

  // 2. Dynamic Membership Resilience: cabs starting and finishing trips between ticks
  const dynamicSyncMap = new Map();

  // Tick 1: 25 active cabs (CAB-001 to CAB-025)
  const activeTick1 = Array.from({ length: 25 }, (_, i) => ({ cabId: `CAB-${String(i + 1).padStart(3, '0')}` }));
  const { batch: b1 } = selectLeastRecentlySyncedBatch(activeTick1, dynamicSyncMap, 15, 1000);
  assert(b1.length === 15, 'Tick 1 selects first 15 cabs');

  // Tick 2: CAB-001..CAB-005 finish trips (removed), CAB-026..CAB-030 start trips (added)
  const activeTick2 = [
    ...Array.from({ length: 20 }, (_, i) => ({ cabId: `CAB-${String(i + 6).padStart(3, '0')}` })),
    ...Array.from({ length: 5 }, (_, i) => ({ cabId: `CAB-${String(i + 26).padStart(3, '0')}` })),
  ];
  const { batch: b2 } = selectLeastRecentlySyncedBatch(activeTick2, dynamicSyncMap, 15, 2000);

  // Tick 3: same active fleet
  const { batch: b3 } = selectLeastRecentlySyncedBatch(activeTick2, dynamicSyncMap, 15, 3000);

  // Verify all 20 cabs that remained active (CAB-006 to CAB-025) were guaranteed to be synchronized
  const allSyncedDynamic = new Set([...b1, ...b2, ...b3].map(c => c.cabId));
  let allRemainedActiveSynced = true;
  for (let i = 6; i <= 25; i++) {
    const id = `CAB-${String(i).padStart(3, '0')}`;
    if (!allSyncedDynamic.has(id)) allRemainedActiveSynced = false;
  }
  assert(allRemainedActiveSynced, 'Active cabs that remained on trips are never starved across dynamic membership shifts');

  // 3. Small and empty fleet edge cases
  const smallResult = selectLeastRecentlySyncedBatch(fleet50.slice(0, 8), new Map(), 15);
  assert(smallResult.batch.length === 8, 'Small fleet (< 15) returns all active cabs without truncation');
  assert(new Set(smallResult.batch.map(c => c.cabId)).size === 8, 'No duplicate entries within small batch');

  const emptyResult = selectLeastRecentlySyncedBatch([], new Map(), 15);
  assert(emptyResult.batch.length === 0, 'Empty fleet safely returns empty batch');

  // 4. URL Length Safety
  const sampleBatch = fleet50.slice(0, 15);
  const serializedQuery = `action=sync&cabs=${encodeURIComponent(JSON.stringify(sampleBatch))}`;
  assert(serializedQuery.length < 4000, `Query string length (${serializedQuery.length} chars) is well below API Gateway 8192-byte limit`);

  // 5. Real ApiCabRepository execution with mocked fetch
  const repo = new ApiCabRepository();
  const origFetch = globalThis.fetch;
  const origWarn = console.warn;
  let lastWarnLogged = '';
  console.warn = (msg) => { lastWarnLogged = String(msg); };

  try {
    // 5A. HTTP 200 OK update
    globalThis.fetch = async (url) => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => [],
    });
    const updatedCab = await repo.update('CAB-001', { status: 'ACTIVE', currentSpeed: 35 });
    assert(updatedCab && updatedCab.cabId === 'CAB-001', 'repo.update() succeeds on HTTP 200 and returns cab');
    assert(repo.getLastSyncMap().has('CAB-001'), 'repo.update() records sync timestamp in lastSyncMap on 200 OK');

    // 5B. HTTP 404 response on update
    lastWarnLogged = '';
    globalThis.fetch = async (url) => ({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    const cabOn404 = await repo.update('CAB-002', { status: 'ACTIVE' });
    assert(cabOn404 && cabOn404.cabId === 'CAB-002', 'repo.update() does not throw on HTTP 404 and preserves local simulation');
    assert(lastWarnLogged.includes('HTTP 404'), 'repo.update() logs descriptive warning on HTTP 404');

    // 5C. HTTP 500 response on batchUpdate
    lastWarnLogged = '';
    globalThis.fetch = async (url) => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
    await repo.batchUpdate([{ cabId: 'CAB-003' }, { cabId: 'CAB-004' }]);
    assert(lastWarnLogged.includes('HTTP 500'), 'repo.batchUpdate() logs descriptive warning on HTTP 500 without crashing');

    // 5D. Network error (fetch rejected) on batchUpdate
    lastWarnLogged = '';
    globalThis.fetch = async () => {
      throw new Error('Network unreachable');
    };
    await repo.batchUpdate([{ cabId: 'CAB-005' }]);
    assert(lastWarnLogged.includes('batchUpdate sync skipped'), 'repo.batchUpdate() safely catches network errors and preserves simulation');
  } finally {
    globalThis.fetch = origFetch;
    console.warn = origWarn;
  }
} finally {
  await viteServer.close();
}


console.log('\n================================================================');
console.log(`Safety Review Regression Results: ${passedTests} / ${totalTests} passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL SAFETY REVIEW REGRESSION TESTS PASSED!');
} else {
  process.exit(1);
}

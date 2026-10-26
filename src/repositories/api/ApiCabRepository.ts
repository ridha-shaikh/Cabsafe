import { Cab } from '../../types/entities';
import { ICabRepository } from '../interfaces/ICabRepository';
import { getApiBaseUrl } from '../../config/apiConfig';

const BASE_URL = getApiBaseUrl();

/**
 * Fair telemetry batch selection using Least Recently Synchronized (LRU) priority.
 * Selects up to `batchSize` items prioritizing vehicles with the oldest last-sync timestamp.
 * Stable tie-breaking via cabId guarantees deterministic ordering.
 * Guarantees that active cabs are never starved even when active membership changes dynamically.
 *
 * @param items Array of active candidates with cabId
 * @param lastSyncMap Map of cabId -> timestamp of last sync
 * @param batchSize Maximum items per batch (default 15)
 * @param currentTimestamp Current epoch ms or monotonic tick counter
 * @returns { batch: T[]; updatedSyncMap: Map<string, number> }
 */
export function selectLeastRecentlySyncedBatch<T extends { cabId: string }>(
  items: T[],
  lastSyncMap: Map<string, number>,
  batchSize: number = 15,
  currentTimestamp: number = Date.now()
): { batch: T[]; updatedSyncMap: Map<string, number> } {
  if (!items || items.length === 0) {
    return { batch: [], updatedSyncMap: lastSyncMap };
  }

  // If the fleet fits within one batch, return all items without truncation
  if (items.length <= batchSize) {
    for (const item of items) {
      lastSyncMap.set(item.cabId, currentTimestamp);
    }
    return { batch: items.slice(), updatedSyncMap: lastSyncMap };
  }

  // Sort candidates by last sync timestamp ascending (oldest/unsynced first).
  // Tie-break alphabetically by cabId for determinism.
  const sorted = [...items].sort((a, b) => {
    const timeA = lastSyncMap.get(a.cabId) ?? 0;
    const timeB = lastSyncMap.get(b.cabId) ?? 0;
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return a.cabId.localeCompare(b.cabId);
  });

  const batch = sorted.slice(0, batchSize);
  for (const item of batch) {
    lastSyncMap.set(item.cabId, currentTimestamp);
  }

  return { batch, updatedSyncMap: lastSyncMap };
}

/**
 * Index-based round-robin batch selection helper (preserved for backward compatibility).
 */
export function selectRoundRobinBatch<T>(
  items: T[],
  cursor: number,
  batchSize: number = 15
): { batch: T[]; nextCursor: number } {
  if (!items || items.length === 0) {
    return { batch: [], nextCursor: 0 };
  }

  if (items.length <= batchSize) {
    return { batch: items.slice(), nextCursor: 0 };
  }

  const effectiveCursor = ((cursor % items.length) + items.length) % items.length;
  const end = effectiveCursor + batchSize;

  let batch: T[];
  if (end <= items.length) {
    batch = items.slice(effectiveCursor, end);
  } else {
    batch = items.slice(effectiveCursor).concat(items.slice(0, end - items.length));
  }

  const nextCursor = (effectiveCursor + batch.length) % items.length;
  return { batch, nextCursor };
}

export class ApiCabRepository implements ICabRepository {
  private lastSyncMap: Map<string, number> = new Map();

  public getLastSyncMap(): Map<string, number> {
    return this.lastSyncMap;
  }

  public getSyncCursor(): number {
    return this.lastSyncMap.size;
  }

  async getAll(): Promise<Cab[]> {
    const res = await fetch(`${BASE_URL}/cabs`);
    if (!res.ok) throw new Error(`GET /cabs failed: ${res.status}`);
    const rows: any[] = await res.json();
    return rows.map((r) => ({
      cabId: r.cab_id,
      registrationNumber: r.registration_number,
      model: r.model || 'Unknown Model',
      vehicleType: r.vehicle_type || 'SEDAN',
      makeYear: r.make_year ? parseInt(r.make_year, 10) : 2021,
      color: r.color || 'White',
      fuelType: r.fuel_type || 'PETROL',
      seatingCapacity: r.seating_capacity ? parseInt(r.seating_capacity, 10) : 4,
      status: r.status || 'IDLE',
      currentLatitude: r.current_latitude ? parseFloat(r.current_latitude) : undefined,
      currentLongitude: r.current_longitude ? parseFloat(r.current_longitude) : undefined,
      currentSpeed: r.current_speed ? parseInt(r.current_speed, 10) : 0,
      mileageKm: r.mileage_km ? parseFloat(r.mileage_km) : 0,
      createdAt: r.created_at,
    }));
  }

  async getById(id: string): Promise<Cab | null> {
    const all = await this.getAll();
    return all.find((c) => c.cabId === id) ?? null;
  }

  async create(data: Omit<Cab, 'createdAt'>): Promise<Cab> {
    // Inventory is seeded and stable; returns data
    return { ...data, createdAt: new Date().toISOString() };
  }

  async update(id: string, data: Partial<Cab>): Promise<Cab | null> {
    const payload = {
      cabId: id,
      status: data.status,
      currentLatitude: data.currentLatitude,
      currentLongitude: data.currentLongitude,
      currentSpeed: data.currentSpeed != null ? Math.round(data.currentSpeed) : undefined,
      mileageKm: data.mileageKm != null ? parseFloat(Number(data.mileageKm).toFixed(2)) : undefined,
    };

    // Synchronize through existing supported GET /cabs endpoint (API Gateway routes to Lambda updateCabsInDb)
    try {
      const response = await fetch(`${BASE_URL}/cabs?action=sync&cabs=${encodeURIComponent(JSON.stringify([payload]))}`);
      if (!response.ok) {
        console.warn(`[ApiCabRepository] update sync returned HTTP ${response.status}: ${response.statusText}`);
      } else {
        this.lastSyncMap.set(id, Date.now());
      }
    } catch (err: any) {
      console.warn('[ApiCabRepository] update sync skipped:', err?.message);
    }

    return { cabId: id, ...data } as Cab;
  }

  async batchUpdate(cabs: Array<{
    cabId: string;
    status?: string;
    currentLatitude?: number;
    currentLongitude?: number;
    currentSpeed?: number;
    mileageKm?: number;
  }>): Promise<void> {
    if (!cabs || cabs.length === 0) return;

    const cleanList = cabs.map(c => ({
      cabId: c.cabId,
      status: c.status || 'ACTIVE',
      currentLatitude: c.currentLatitude != null ? parseFloat(Number(c.currentLatitude).toFixed(6)) : undefined,
      currentLongitude: c.currentLongitude != null ? parseFloat(Number(c.currentLongitude).toFixed(6)) : undefined,
      currentSpeed: c.currentSpeed != null ? Math.round(Number(c.currentSpeed)) : undefined,
      mileageKm: c.mileageKm != null ? parseFloat(Number(c.mileageKm).toFixed(2)) : undefined,
    }));

    // Prioritize least-recently-synchronized cabs, keeping request within safe URL length limit (<= 15 cabs)
    const { batch } = selectLeastRecentlySyncedBatch(cleanList, this.lastSyncMap, 15);

    // Synchronize throttled fleet telemetry through existing supported GET /cabs endpoint
    // Fair LRU batch of up to 15 vehicles to prevent URL query string overflow
    try {
      const response = await fetch(`${BASE_URL}/cabs?action=sync&cabs=${encodeURIComponent(JSON.stringify(batch))}`);
      if (!response.ok) {
        console.warn(`[ApiCabRepository] batchUpdate sync returned HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.warn('[ApiCabRepository] batchUpdate sync skipped:', err?.message);
    }
  }

  async delete(id: string): Promise<boolean> {
    return false;
  }
}

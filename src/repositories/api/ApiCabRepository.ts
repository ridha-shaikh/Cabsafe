import { Cab } from '../../types/entities';
import { ICabRepository } from '../interfaces/ICabRepository';
import { getApiBaseUrl } from '../../config/apiConfig';

const BASE_URL = getApiBaseUrl();

export class ApiCabRepository implements ICabRepository {
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

    // 1. Try standard PUT /cabs
    try {
      const res = await fetch(`${BASE_URL}/cabs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return { cabId: id, ...data } as Cab;
    } catch {
      // Proceed to active route fallback
    }

    // 2. Fallback to active POST /events route (configured in API Gateway)
    try {
      const postRes = await fetch(`${BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_cabs', eventType: 'TELEMETRY', cabs: [payload] }),
      });
      if (postRes.ok) return { cabId: id, ...data } as Cab;
    } catch {
      // Proceed to GET fallback
    }

    // 3. Fallback to active GET /cabs with query param
    try {
      await fetch(`${BASE_URL}/cabs?action=sync&cabs=${encodeURIComponent(JSON.stringify([payload]))}`);
    } catch {
      // Ignore fallback error
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
    const cleanList = cabs.map(c => ({
      cabId: c.cabId,
      status: c.status || 'ACTIVE',
      currentLatitude: c.currentLatitude != null ? parseFloat(Number(c.currentLatitude).toFixed(6)) : undefined,
      currentLongitude: c.currentLongitude != null ? parseFloat(Number(c.currentLongitude).toFixed(6)) : undefined,
      currentSpeed: c.currentSpeed != null ? Math.round(Number(c.currentSpeed)) : undefined,
      mileageKm: c.mileageKm != null ? parseFloat(Number(c.mileageKm).toFixed(2)) : undefined,
    }));

    // 1. Try standard PUT /cabs
    try {
      const res = await fetch(`${BASE_URL}/cabs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cabs: cleanList }),
      });
      if (res.ok) return;
    } catch {
      // Proceed to active route fallback
    }

    // 2. Fallback to active POST /events route (configured in API Gateway)
    try {
      const postRes = await fetch(`${BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_cabs',
          eventType: 'TELEMETRY',
          cabs: cleanList,
        }),
      });
      if (postRes.ok) return;
    } catch {
      // Proceed to GET fallback
    }

    // 3. Fallback to active GET /cabs with query param
    try {
      await fetch(`${BASE_URL}/cabs?action=sync&cabs=${encodeURIComponent(JSON.stringify(cleanList.slice(0, 15)))}`);
    } catch (err: any) {
      console.warn('[ApiCabRepository] batchUpdate fallback failed:', err?.message);
    }
  }

  async delete(id: string): Promise<boolean> {
    return false;
  }
}

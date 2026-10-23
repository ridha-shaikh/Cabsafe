import { Trip } from '../../types/entities';
import { ITripRepository } from '../interfaces/ITripRepository';
import { getApiBaseUrl } from '../../config/apiConfig';

const BASE_URL = getApiBaseUrl();

export class ApiTripRepository implements ITripRepository {
  async getAll(): Promise<Trip[]> {
    const res = await fetch(`${BASE_URL}/trips`);
    if (!res.ok) throw new Error(`GET /trips failed: ${res.status}`);
    const rows: any[] = await res.json();
    return rows.map((r) => ({
      tripId: r.trip_id,
      bookingId: r.booking_id || `BK-${r.trip_id}`,
      cabId: r.cab_id,
      driverId: r.driver_id,
      passengerId: r.passenger_id,
      startTime: r.start_time,
      endTime: r.end_time ?? undefined,
      startLatitude: r.start_latitude ? parseFloat(r.start_latitude) : undefined,
      startLongitude: r.start_longitude ? parseFloat(r.start_longitude) : undefined,
      endLatitude: r.end_latitude ? parseFloat(r.end_latitude) : undefined,
      endLongitude: r.end_longitude ? parseFloat(r.end_longitude) : undefined,
      distanceKm: r.distance_km ? parseFloat(r.distance_km) : 0,
      durationMin: r.duration_min ? parseInt(r.duration_min, 10) : 0,
      avgSpeed: r.avg_speed ? parseInt(r.avg_speed, 10) : 0,
      maxSpeed: r.max_speed ? parseInt(r.max_speed, 10) : 0,
      fare: r.fare ? parseFloat(r.fare) : 0,
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  async getById(id: string): Promise<Trip | null> {
    const all = await this.getAll();
    return all.find((t) => t.tripId === id) ?? null;
  }

  async create(data: Omit<Trip, 'createdAt'>): Promise<Trip> {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId: data.tripId,
        cabId: data.cabId,
        driverId: data.driverId,
        passengerId: data.passengerId,
        startTime: data.startTime,
        startLatitude: data.startLatitude,
        startLongitude: data.startLongitude,
        distanceKm: data.distanceKm,
        fare: data.fare,
        status: data.status,
      }),
    });
    if (!res.ok) throw new Error(`POST /trips failed: ${res.status}`);
    return { ...data, createdAt: new Date().toISOString() };
  }

  async update(id: string, data: Partial<Trip>): Promise<Trip | null> {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId: id,
        status: data.status,
        endTime: data.endTime,
        endLatitude: data.endLatitude,
        endLongitude: data.endLongitude,
        distanceKm: data.distanceKm,
        durationMin: data.durationMin,
        avgSpeed: data.avgSpeed,
        maxSpeed: data.maxSpeed,
        fare: data.fare,
      }),
    });
    if (!res.ok) throw new Error(`PUT /trips failed: ${res.status}`);
    return { tripId: id, ...data } as Trip;
  }

  async delete(id: string): Promise<boolean> {
    return false;
  }
}

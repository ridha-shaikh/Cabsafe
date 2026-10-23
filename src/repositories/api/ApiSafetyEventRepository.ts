import { SafetyEvent } from '../../types/entities';
import { ISafetyEventRepository } from '../interfaces/ISafetyEventRepository';
import { getApiBaseUrl } from '../../config/apiConfig';

const BASE_URL = getApiBaseUrl();

export class ApiSafetyEventRepository implements ISafetyEventRepository {
  async getAll(): Promise<SafetyEvent[]> {
    const res = await fetch(`${BASE_URL}/events`);
    if (!res.ok) throw new Error(`GET /events failed with status ${res.status}`);
    const rows = await res.json();
    if (!Array.isArray(rows)) {
      console.warn('[ApiSafetyEventRepository] Unexpected response format from GET /events:', rows);
      return [];
    }
    // Map RDS snake_case columns → frontend camelCase fields with explicit type coercion
    return rows.map((r: any) => ({
      eventId:         r.event_id,
      cabId:           r.cab_id,
      driverId:        r.driver_id,
      tripId:          r.trip_id ?? undefined,
      eventType:       r.event_type,
      severity:        r.severity,
      startTime:       r.start_time,
      endTime:         r.end_time ?? undefined,
      durationSeconds: r.duration_seconds != null ? Number(r.duration_seconds) : undefined,
      maxValue:        r.max_value != null ? Number(r.max_value) : undefined,
      thresholdValue:  r.threshold_value != null ? Number(r.threshold_value) : undefined,
      status:          r.status,
      startLatitude:   r.start_latitude != null ? Number(r.start_latitude) : undefined,
      startLongitude:  r.start_longitude != null ? Number(r.start_longitude) : undefined,
      createdAt:       r.created_at,
    }));
  }

  async getById(id: string): Promise<SafetyEvent | null> {
    const all = await this.getAll();
    return all.find((e) => e.eventId === id) ?? null;
  }

  async create(data: Omit<SafetyEvent, 'createdAt'>): Promise<SafetyEvent> {
    const isSos = (data.eventType as string) === 'SOS';
    try {
      const res = await fetch(`${BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId:   data.eventId,
          cabId:     data.cabId,
          driverId:  data.driverId,
          tripId:    data.tripId,
          eventType: data.eventType,
          severity:  data.severity,
          status:    isSos ? 'SOS' : 'ACTIVE',
          value:     data.maxValue,
          threshold: data.thresholdValue,
          startLatitude: data.startLatitude,
          startLongitude: data.startLongitude,
          timestamp: data.startTime,
          message: isSos ? '[SIMULATED DEMO] Passenger panic button triggered — Demonstration drill' : undefined,
        }),
      });

      if (res.ok) {
        return { ...data, createdAt: new Date().toISOString() };
      }
    } catch (err: any) {
      console.warn(`[ApiSafetyEventRepository] POST /events failed (${err?.message})`);
    }

    // Fallback: If POST failed or returned 404 on API Gateway, and this is an SOS event,
    // trigger via GET /events query parameter so API Gateway's active GET route routes to Lambda.
    if (isSos) {
      try {
        const params = new URLSearchParams({
          trigger_sos: 'true',
          eventId: data.eventId,
          cabId: data.cabId,
          driverId: data.driverId,
          status: 'SOS',
          latitude: String(data.startLatitude || 13.0827),
          longitude: String(data.startLongitude || 80.2707),
          ...(data.tripId && data.tripId !== 'N/A' ? { tripId: data.tripId } : {}),
        });
        const getRes = await fetch(`${BASE_URL}/events?${params.toString()}`);
        if (getRes.ok) {
          console.log(`[ApiSafetyEventRepository] SOS triggered via GET fallback for ${data.cabId}`);
        }
      } catch (getErr: any) {
        console.warn(`[ApiSafetyEventRepository] GET fallback for SOS failed:`, getErr?.message);
      }
    }

    return { ...data, createdAt: new Date().toISOString() };
  }

  async update(id: string, data: Partial<SafetyEvent>): Promise<SafetyEvent | null> {
    // Update not exposed to API; update locally only
    return null;
  }

  async delete(id: string): Promise<boolean> {
    return false;
  }
}

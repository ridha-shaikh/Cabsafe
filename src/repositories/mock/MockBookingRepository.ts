import { Booking } from '../../types/entities';
import { IBookingRepository } from '../interfaces/IBookingRepository';
import { mockDatabase } from './mockDatabase';

export class MockBookingRepository implements IBookingRepository {
  private getTable(): Booking[] {
    return mockDatabase['bookings'] as Booking[];
  }

  async getAll(): Promise<Booking[]> {
    return [...this.getTable()];
  }

  async getById(id: string): Promise<Booking | null> {
    const item = this.getTable().find((x: any) => x['bookingId'] === id || x.id === id);
    return item ? { ...item } : null;
  }

  async create(data: Omit<Booking, 'createdAt'>): Promise<Booking> {
    const newItem = {
      ...data,
      createdAt: new Date().toISOString()
    } as Booking;
    this.getTable().push(newItem);
    return { ...newItem };
  }

  async update(id: string, data: Partial<Booking>): Promise<Booking | null> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['bookingId'] === id || x.id === id);
    if (index === -1) return null;
    
    table[index] = { ...table[index], ...data };
    return { ...table[index] };
  }

  async delete(id: string): Promise<boolean> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['bookingId'] === id || x.id === id);
    if (index === -1) return false;
    
    table.splice(index, 1);
    return true;
  }
}

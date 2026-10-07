import { Booking } from '../../types/entities';

export interface IBookingRepository {
  getAll(): Promise<Booking[]>;
  getById(id: string): Promise<Booking | null>;
  create(data: Omit<Booking, 'createdAt'>): Promise<Booking>;
  update(id: string, data: Partial<Booking>): Promise<Booking | null>;
  delete(id: string): Promise<boolean>;
}

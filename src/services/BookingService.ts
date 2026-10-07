import { Booking } from '../types/entities';
import { IBookingRepository } from '../repositories/interfaces/IBookingRepository';

export class BookingService {
  constructor(private repository: IBookingRepository) {}

  async getAll(): Promise<Booking[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<Booking | null> {
    return this.repository.getById(id);
  }

  async create(data: Omit<Booking, 'createdAt'>): Promise<Booking> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Booking>): Promise<Booking | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

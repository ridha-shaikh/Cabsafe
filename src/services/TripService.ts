import { Trip } from '../types/entities';
import { ITripRepository } from '../repositories/interfaces/ITripRepository';

export class TripService {
  constructor(private repository: ITripRepository) {}

  async getAll(): Promise<Trip[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<Trip | null> {
    return this.repository.getById(id);
  }

  async create(data: Omit<Trip, 'createdAt'>): Promise<Trip> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Trip>): Promise<Trip | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

import { Cab } from '../types/entities';
import { ICabRepository } from '../repositories/interfaces/ICabRepository';

export class CabService {
  constructor(private repository: ICabRepository) {}

  async getAll(): Promise<Cab[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<Cab | null> {
    return this.repository.getById(id);
  }

  async create(data: Omit<Cab, 'createdAt'>): Promise<Cab> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Cab>): Promise<Cab | null> {
    return this.repository.update(id, data);
  }

  async batchUpdate(cabs: Array<{
    cabId: string;
    status?: any;
    currentLatitude?: number;
    currentLongitude?: number;
    currentSpeed?: number;
    mileageKm?: number;
  }>): Promise<void> {
    if (this.repository.batchUpdate) {
      return this.repository.batchUpdate(cabs);
    }
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

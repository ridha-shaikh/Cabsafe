import { Driver } from '../types/entities';
import { IDriverRepository } from '../repositories/interfaces/IDriverRepository';

export class DriverService {
  constructor(private repository: IDriverRepository) {}

  async getAll(): Promise<Driver[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<Driver | null> {
    return this.repository.getById(id);
  }

  async create(data: Omit<Driver, 'createdAt'>): Promise<Driver> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Driver>): Promise<Driver | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

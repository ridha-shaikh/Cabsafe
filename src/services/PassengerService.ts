import { Passenger } from '../types/entities';
import { IPassengerRepository } from '../repositories/interfaces/IPassengerRepository';

export class PassengerService {
  constructor(private repository: IPassengerRepository) {}

  async getAll(): Promise<Passenger[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<Passenger | null> {
    return this.repository.getById(id);
  }

  async create(data: Omit<Passenger, 'createdAt'>): Promise<Passenger> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Passenger>): Promise<Passenger | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

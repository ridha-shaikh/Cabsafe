import { SafetyEvent } from '../types/entities';
import { ISafetyEventRepository } from '../repositories/interfaces/ISafetyEventRepository';

export class SafetyEventService {
  constructor(private repository: ISafetyEventRepository) {}

  async getAll(): Promise<SafetyEvent[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<SafetyEvent | null> {
    return this.repository.getById(id);
  }

  async create(data: Omit<SafetyEvent, 'createdAt'>): Promise<SafetyEvent> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<SafetyEvent>): Promise<SafetyEvent | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

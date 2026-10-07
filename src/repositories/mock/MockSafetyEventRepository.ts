import { SafetyEvent } from '../../types/entities';
import { ISafetyEventRepository } from '../interfaces/ISafetyEventRepository';
import { mockDatabase } from './mockDatabase';

export class MockSafetyEventRepository implements ISafetyEventRepository {
  private getTable(): SafetyEvent[] {
    return mockDatabase['safetyEvents'] as SafetyEvent[];
  }

  async getAll(): Promise<SafetyEvent[]> {
    return [...this.getTable()];
  }

  async getById(id: string): Promise<SafetyEvent | null> {
    const item = this.getTable().find((x: any) => x['eventId'] === id || x.id === id);
    return item ? { ...item } : null;
  }

  async create(data: Omit<SafetyEvent, 'createdAt'>): Promise<SafetyEvent> {
    const newItem = {
      ...data,
      createdAt: new Date().toISOString()
    } as SafetyEvent;
    this.getTable().push(newItem);
    return { ...newItem };
  }

  async update(id: string, data: Partial<SafetyEvent>): Promise<SafetyEvent | null> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['eventId'] === id || x.id === id);
    if (index === -1) return null;
    
    table[index] = { ...table[index], ...data };
    return { ...table[index] };
  }

  async delete(id: string): Promise<boolean> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['eventId'] === id || x.id === id);
    if (index === -1) return false;
    
    table.splice(index, 1);
    return true;
  }
}

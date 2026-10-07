import { Alert } from '../../types/entities';
import { IAlertRepository } from '../interfaces/IAlertRepository';
import { mockDatabase } from './mockDatabase';

export class MockAlertRepository implements IAlertRepository {
  private getTable(): Alert[] {
    return mockDatabase['alerts'] as Alert[];
  }

  async getAll(): Promise<Alert[]> {
    return [...this.getTable()];
  }

  async getById(id: string): Promise<Alert | null> {
    const item = this.getTable().find((x: any) => x['alertId'] === id || x.id === id);
    return item ? { ...item } : null;
  }

  async create(data: Omit<Alert, 'createdAt'>): Promise<Alert> {
    const newItem = {
      ...data,
      createdAt: new Date().toISOString()
    } as Alert;
    this.getTable().push(newItem);
    return { ...newItem };
  }

  async update(id: string, data: Partial<Alert>): Promise<Alert | null> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['alertId'] === id || x.id === id);
    if (index === -1) return null;
    
    table[index] = { ...table[index], ...data };
    return { ...table[index] };
  }

  async delete(id: string): Promise<boolean> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['alertId'] === id || x.id === id);
    if (index === -1) return false;
    
    table.splice(index, 1);
    return true;
  }
}

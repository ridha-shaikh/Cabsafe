import { Driver } from '../../types/entities';
import { IDriverRepository } from '../interfaces/IDriverRepository';
import { mockDatabase } from './mockDatabase';

export class MockDriverRepository implements IDriverRepository {
  private getTable(): Driver[] {
    return mockDatabase['drivers'] as Driver[];
  }

  async getAll(): Promise<Driver[]> {
    return [...this.getTable()];
  }

  async getById(id: string): Promise<Driver | null> {
    const item = this.getTable().find((x: any) => x['driverId'] === id || x.id === id);
    return item ? { ...item } : null;
  }

  async create(data: Omit<Driver, 'createdAt'>): Promise<Driver> {
    const newItem = {
      ...data,
      createdAt: new Date().toISOString()
    } as Driver;
    this.getTable().push(newItem);
    return { ...newItem };
  }

  async update(id: string, data: Partial<Driver>): Promise<Driver | null> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['driverId'] === id || x.id === id);
    if (index === -1) return null;
    
    table[index] = { ...table[index], ...data };
    return { ...table[index] };
  }

  async delete(id: string): Promise<boolean> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['driverId'] === id || x.id === id);
    if (index === -1) return false;
    
    table.splice(index, 1);
    return true;
  }
}

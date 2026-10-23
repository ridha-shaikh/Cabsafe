import { Cab } from '../../types/entities';
import { ICabRepository } from '../interfaces/ICabRepository';
import { mockDatabase } from './mockDatabase';

export class MockCabRepository implements ICabRepository {
  private getTable(): Cab[] {
    return mockDatabase['cabs'] as Cab[];
  }

  async getAll(): Promise<Cab[]> {
    return [...this.getTable()];
  }

  async getById(id: string): Promise<Cab | null> {
    const item = this.getTable().find((x: any) => x['cabId'] === id || x.id === id);
    return item ? { ...item } : null;
  }

  async create(data: Omit<Cab, 'createdAt'>): Promise<Cab> {
    const newItem = {
      ...data,
      createdAt: new Date().toISOString()
    } as Cab;
    this.getTable().push(newItem);
    return { ...newItem };
  }

  async update(id: string, data: Partial<Cab>): Promise<Cab | null> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['cabId'] === id || x.id === id);
    if (index === -1) return null;
    
    table[index] = { ...table[index], ...data };
    return { ...table[index] };
  }

  async batchUpdate(cabs: Array<{
    cabId: string;
    status?: any;
    currentLatitude?: number;
    currentLongitude?: number;
    currentSpeed?: number;
    mileageKm?: number;
  }>): Promise<void> {
    const table = this.getTable();
    for (const update of cabs) {
      const index = table.findIndex((x: any) => x['cabId'] === update.cabId);
      if (index !== -1) {
        table[index] = { ...table[index], ...update };
      }
    }
  }

  async delete(id: string): Promise<boolean> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['cabId'] === id || x.id === id);
    if (index === -1) return false;
    
    table.splice(index, 1);
    return true;
  }
}

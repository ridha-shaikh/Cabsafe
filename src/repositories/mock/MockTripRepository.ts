import { Trip } from '../../types/entities';
import { ITripRepository } from '../interfaces/ITripRepository';
import { mockDatabase } from './mockDatabase';

export class MockTripRepository implements ITripRepository {
  private getTable(): Trip[] {
    return mockDatabase['trips'] as Trip[];
  }

  async getAll(): Promise<Trip[]> {
    return [...this.getTable()];
  }

  async getById(id: string): Promise<Trip | null> {
    const item = this.getTable().find((x: any) => x['tripId'] === id || x.id === id);
    return item ? { ...item } : null;
  }

  async create(data: Omit<Trip, 'createdAt'>): Promise<Trip> {
    const newItem = {
      ...data,
      createdAt: new Date().toISOString()
    } as Trip;
    this.getTable().push(newItem);
    return { ...newItem };
  }

  async update(id: string, data: Partial<Trip>): Promise<Trip | null> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['tripId'] === id || x.id === id);
    if (index === -1) return null;
    
    table[index] = { ...table[index], ...data };
    return { ...table[index] };
  }

  async delete(id: string): Promise<boolean> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['tripId'] === id || x.id === id);
    if (index === -1) return false;
    
    table.splice(index, 1);
    return true;
  }
}

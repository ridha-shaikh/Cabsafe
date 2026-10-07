import { Passenger } from '../../types/entities';
import { IPassengerRepository } from '../interfaces/IPassengerRepository';
import { mockDatabase } from './mockDatabase';

export class MockPassengerRepository implements IPassengerRepository {
  private getTable(): Passenger[] {
    return mockDatabase['passengers'] as Passenger[];
  }

  async getAll(): Promise<Passenger[]> {
    return [...this.getTable()];
  }

  async getById(id: string): Promise<Passenger | null> {
    const item = this.getTable().find((x: any) => x['passengerId'] === id || x.id === id);
    return item ? { ...item } : null;
  }

  async create(data: Omit<Passenger, 'createdAt'>): Promise<Passenger> {
    const newItem = {
      ...data,
      createdAt: new Date().toISOString()
    } as Passenger;
    this.getTable().push(newItem);
    return { ...newItem };
  }

  async update(id: string, data: Partial<Passenger>): Promise<Passenger | null> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['passengerId'] === id || x.id === id);
    if (index === -1) return null;
    
    table[index] = { ...table[index], ...data };
    return { ...table[index] };
  }

  async delete(id: string): Promise<boolean> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['passengerId'] === id || x.id === id);
    if (index === -1) return false;
    
    table.splice(index, 1);
    return true;
  }
}

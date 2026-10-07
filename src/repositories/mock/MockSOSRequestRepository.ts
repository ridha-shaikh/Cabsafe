import { SOSRequest } from '../../types/entities';
import { ISOSRequestRepository } from '../interfaces/ISOSRequestRepository';
import { mockDatabase } from './mockDatabase';

export class MockSOSRequestRepository implements ISOSRequestRepository {
  private getTable(): SOSRequest[] {
    return mockDatabase['sOSRequests'] as SOSRequest[];
  }

  async getAll(): Promise<SOSRequest[]> {
    return [...this.getTable()];
  }

  async getById(id: string): Promise<SOSRequest | null> {
    const item = this.getTable().find((x: any) => x['sosrequestId'] === id || x.id === id);
    return item ? { ...item } : null;
  }

  async create(data: Omit<SOSRequest, 'createdAt'>): Promise<SOSRequest> {
    const newItem = {
      ...data,
      createdAt: new Date().toISOString()
    } as SOSRequest;
    this.getTable().push(newItem);
    return { ...newItem };
  }

  async update(id: string, data: Partial<SOSRequest>): Promise<SOSRequest | null> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['sosrequestId'] === id || x.id === id);
    if (index === -1) return null;
    
    table[index] = { ...table[index], ...data };
    return { ...table[index] };
  }

  async delete(id: string): Promise<boolean> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['sosrequestId'] === id || x.id === id);
    if (index === -1) return false;
    
    table.splice(index, 1);
    return true;
  }
}

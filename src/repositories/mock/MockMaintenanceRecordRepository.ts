import { MaintenanceRecord } from '../../types/entities';
import { IMaintenanceRecordRepository } from '../interfaces/IMaintenanceRecordRepository';
import { mockDatabase } from './mockDatabase';

export class MockMaintenanceRecordRepository implements IMaintenanceRecordRepository {
  private getTable(): MaintenanceRecord[] {
    return mockDatabase['maintenanceRecords'] as MaintenanceRecord[];
  }

  async getAll(): Promise<MaintenanceRecord[]> {
    return [...this.getTable()];
  }

  async getById(id: string): Promise<MaintenanceRecord | null> {
    const item = this.getTable().find((x: any) => x['maintenanceId'] === id || x.id === id);
    return item ? { ...item } : null;
  }

  async create(data: Omit<MaintenanceRecord, 'createdAt'>): Promise<MaintenanceRecord> {
    const newItem = {
      ...data,
      createdAt: new Date().toISOString()
    } as MaintenanceRecord;
    this.getTable().push(newItem);
    return { ...newItem };
  }

  async update(id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | null> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['maintenanceId'] === id || x.id === id);
    if (index === -1) return null;
    
    table[index] = { ...table[index], ...data };
    return { ...table[index] };
  }

  async delete(id: string): Promise<boolean> {
    const table = this.getTable();
    const index = table.findIndex((x: any) => x['maintenanceId'] === id || x.id === id);
    if (index === -1) return false;
    
    table.splice(index, 1);
    return true;
  }
}

import { MaintenanceRecord } from '../types/entities';
import { IMaintenanceRecordRepository } from '../repositories/interfaces/IMaintenanceRecordRepository';

export class MaintenanceRecordService {
  constructor(private repository: IMaintenanceRecordRepository) {}

  async getAll(): Promise<MaintenanceRecord[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<MaintenanceRecord | null> {
    return this.repository.getById(id);
  }

  async create(data: Omit<MaintenanceRecord, 'createdAt'>): Promise<MaintenanceRecord> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

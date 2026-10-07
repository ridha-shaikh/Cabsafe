import { MaintenanceRecord } from '../../types/entities';

export interface IMaintenanceRecordRepository {
  getAll(): Promise<MaintenanceRecord[]>;
  getById(id: string): Promise<MaintenanceRecord | null>;
  create(data: Omit<MaintenanceRecord, 'createdAt'>): Promise<MaintenanceRecord>;
  update(id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord | null>;
  delete(id: string): Promise<boolean>;
}

import { Alert } from '../../types/entities';

export interface IAlertRepository {
  getAll(): Promise<Alert[]>;
  getById(id: string): Promise<Alert | null>;
  create(data: Omit<Alert, 'createdAt'>): Promise<Alert>;
  update(id: string, data: Partial<Alert>): Promise<Alert | null>;
  delete(id: string): Promise<boolean>;
}

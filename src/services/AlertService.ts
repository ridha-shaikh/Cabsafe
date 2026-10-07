import { Alert } from '../types/entities';
import { IAlertRepository } from '../repositories/interfaces/IAlertRepository';

export class AlertService {
  constructor(private repository: IAlertRepository) {}

  async getAll(): Promise<Alert[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<Alert | null> {
    return this.repository.getById(id);
  }

  async create(data: Omit<Alert, 'createdAt'>): Promise<Alert> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Alert>): Promise<Alert | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

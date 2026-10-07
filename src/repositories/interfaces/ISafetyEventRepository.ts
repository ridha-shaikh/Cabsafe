import { SafetyEvent } from '../../types/entities';

export interface ISafetyEventRepository {
  getAll(): Promise<SafetyEvent[]>;
  getById(id: string): Promise<SafetyEvent | null>;
  create(data: Omit<SafetyEvent, 'createdAt'>): Promise<SafetyEvent>;
  update(id: string, data: Partial<SafetyEvent>): Promise<SafetyEvent | null>;
  delete(id: string): Promise<boolean>;
}

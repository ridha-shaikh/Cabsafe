import { Driver } from '../../types/entities';

export interface IDriverRepository {
  getAll(): Promise<Driver[]>;
  getById(id: string): Promise<Driver | null>;
  create(data: Omit<Driver, 'createdAt'>): Promise<Driver>;
  update(id: string, data: Partial<Driver>): Promise<Driver | null>;
  delete(id: string): Promise<boolean>;
}

import { Trip } from '../../types/entities';

export interface ITripRepository {
  getAll(): Promise<Trip[]>;
  getById(id: string): Promise<Trip | null>;
  create(data: Omit<Trip, 'createdAt'>): Promise<Trip>;
  update(id: string, data: Partial<Trip>): Promise<Trip | null>;
  delete(id: string): Promise<boolean>;
}

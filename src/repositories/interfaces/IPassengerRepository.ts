import { Passenger } from '../../types/entities';

export interface IPassengerRepository {
  getAll(): Promise<Passenger[]>;
  getById(id: string): Promise<Passenger | null>;
  create(data: Omit<Passenger, 'createdAt'>): Promise<Passenger>;
  update(id: string, data: Partial<Passenger>): Promise<Passenger | null>;
  delete(id: string): Promise<boolean>;
}

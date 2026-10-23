import { Cab } from '../../types/entities';

export interface ICabRepository {
  getAll(): Promise<Cab[]>;
  getById(id: string): Promise<Cab | null>;
  create(data: Omit<Cab, 'createdAt'>): Promise<Cab>;
  update(id: string, data: Partial<Cab>): Promise<Cab | null>;
  batchUpdate?(cabs: Array<{
    cabId: string;
    status?: string;
    currentLatitude?: number;
    currentLongitude?: number;
    currentSpeed?: number;
    mileageKm?: number;
  }>): Promise<void>;
  delete(id: string): Promise<boolean>;
}

import { SOSRequest } from '../../types/entities';

export interface ISOSRequestRepository {
  getAll(): Promise<SOSRequest[]>;
  getById(id: string): Promise<SOSRequest | null>;
  create(data: Omit<SOSRequest, 'createdAt'>): Promise<SOSRequest>;
  update(id: string, data: Partial<SOSRequest>): Promise<SOSRequest | null>;
  delete(id: string): Promise<boolean>;
}

import { SOSRequest } from '../types/entities';
import { ISOSRequestRepository } from '../repositories/interfaces/ISOSRequestRepository';

export class SOSRequestService {
  constructor(private repository: ISOSRequestRepository) {}

  async getAll(): Promise<SOSRequest[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<SOSRequest | null> {
    return this.repository.getById(id);
  }

  async create(data: Omit<SOSRequest, 'createdAt'>): Promise<SOSRequest> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<SOSRequest>): Promise<SOSRequest | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

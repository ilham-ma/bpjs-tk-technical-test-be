import { EmploymentHistory } from '../entities/EmploymentHistory';
import { EmploymentHistoryInputDTO } from '../../../application/employment-history/dtos/EmploymentHistoryInputDTO';

export interface IEmploymentHistoryRepository {
  syncForUser(userId: string, items: EmploymentHistoryInputDTO[]): Promise<EmploymentHistory[]>;
  findIdsByUserId(userId: string): Promise<string[]>;
  findByUserId(userId: string): Promise<EmploymentHistory[]>;
}

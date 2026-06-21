import { EmploymentHistory } from '../entities/EmploymentHistory';

export interface IEmploymentHistoryRepository {
  replaceForUser(userId: string, items: Omit<EmploymentHistory, 'id' | 'userId'>[]): Promise<EmploymentHistory[]>;
  findByUserId(userId: string): Promise<EmploymentHistory[]>;
}

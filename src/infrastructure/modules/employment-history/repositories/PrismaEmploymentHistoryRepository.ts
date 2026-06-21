import { IEmploymentHistoryRepository } from '../../../../domain/employment-history/repositories/IEmploymentHistoryRepository';
import { EmploymentHistory } from '../../../../domain/employment-history/entities/EmploymentHistory';
import prisma from '../../../database/prisma/client';

export class PrismaEmploymentHistoryRepository implements IEmploymentHistoryRepository {
  async replaceForUser(userId: string, items: Omit<EmploymentHistory, 'id' | 'userId'>[]): Promise<EmploymentHistory[]> {
    await prisma.$transaction([
      prisma.employmentHistory.deleteMany({
        where: { userId },
      }),
      prisma.employmentHistory.createMany({
        data: items.map((item) => ({
          jobTitle: item.jobTitle,
          employer: item.employer,
          startDate: item.startDate,
          endDate: item.endDate || null,
          city: item.city,
          description: item.description,
          userId,
        })),
      }),
    ]);

    return await this.findByUserId(userId);
  }

  async findByUserId(userId: string): Promise<EmploymentHistory[]> {
    return await prisma.employmentHistory.findMany({
      where: { userId },
    });
  }
}

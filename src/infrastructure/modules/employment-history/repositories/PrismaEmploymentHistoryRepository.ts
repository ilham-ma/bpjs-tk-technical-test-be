import { IEmploymentHistoryRepository } from '../../../../domain/employment-history/repositories/IEmploymentHistoryRepository';
import { EmploymentHistory } from '../../../../domain/employment-history/entities/EmploymentHistory';
import { EmploymentHistoryInputDTO } from '../../../../application/employment-history/dtos/EmploymentHistoryInputDTO';
import { AppError } from '../../../../shared/errors/AppError';
import prisma from '../../../database/prisma/client';

export class PrismaEmploymentHistoryRepository implements IEmploymentHistoryRepository {
  async syncForUser(userId: string, items: EmploymentHistoryInputDTO[]): Promise<EmploymentHistory[]> {
    const itemsWithId = items.filter((i) => i.id);
    const itemsWithoutId = items.filter((i) => !i.id);

    await prisma.$transaction(async (tx) => {
      // Validate items with ID belong to current user
      const existingIds = await tx.employmentHistory.findMany({
        where: { userId },
        select: { id: true },
      });
      const userEmploymentIds = new Set(existingIds.map((e) => e.id));

      for (const item of itemsWithId) {
        if (!userEmploymentIds.has(item.id!)) {
          throw new AppError(`Employment history ${item.id} does not belong to this user`, 403);
        }
        // Update existing employment history
        await tx.employmentHistory.update({
          where: { id: item.id },
          data: {
            jobTitle: item.jobTitle,
            employer: item.employer,
            startDate: item.startDate,
            endDate: item.endDate || null,
            city: item.city,
            description: item.description,
          },
        });
      }

      // Delete existing rows for this user that are not kept by id
      // (run BEFORE creating new ones, so we don't wipe the freshly-created rows
      // — Prisma treats `notIn: []` as matching every row)
      const employmentIdsToKeep = itemsWithId
        .map((i) => i.id)
        .filter((id): id is string => !!id);
      await tx.employmentHistory.deleteMany({
        where: { userId, id: { notIn: employmentIdsToKeep } },
      });

      // Create new employment histories
      for (const item of itemsWithoutId) {
        await tx.employmentHistory.create({
          data: {
            jobTitle: item.jobTitle,
            employer: item.employer,
            startDate: item.startDate,
            endDate: item.endDate || null,
            city: item.city,
            description: item.description,
            userId,
          },
        });
      }
    });

    return await this.findByUserId(userId);
  }

  async findIdsByUserId(userId: string): Promise<string[]> {
    const records = await prisma.employmentHistory.findMany({
      where: { userId },
      select: { id: true },
    });
    return records.map((r) => r.id);
  }

  async findByUserId(userId: string): Promise<EmploymentHistory[]> {
    return await prisma.employmentHistory.findMany({
      where: { userId },
    });
  }
}

import { IEducationRepository } from '../../../../domain/education/repositories/IEducationRepository';
import { Education } from '../../../../domain/education/entities/Education';
import { EducationInputDTO } from '../../../../application/education/dtos/EducationInputDTO';
import { AppError } from '../../../../shared/errors/AppError';
import prisma from '../../../database/prisma/client';

export class PrismaEducationRepository implements IEducationRepository {
  async syncForUser(userId: string, educations: EducationInputDTO[]): Promise<Education[]> {
    const itemsWithId = educations.filter((e) => e.id);
    const itemsWithoutId = educations.filter((e) => !e.id);

    await prisma.$transaction(async (tx) => {
      // Validate items with ID belong to current user
      const existingIds = await tx.education.findMany({
        where: { userId },
        select: { id: true },
      });
      const userEducationIds = new Set(existingIds.map((e) => e.id));

      for (const item of itemsWithId) {
        if (!userEducationIds.has(item.id!)) {
          throw new AppError(`Education ${item.id} does not belong to this user`, 403);
        }
        // Update existing education
        await tx.education.update({
          where: { id: item.id },
          data: {
            school: item.school,
            degree: item.degree,
            startDate: item.startDate,
            endDate: item.endDate || null,
            city: item.city,
            description: item.description,
          },
        });
      }

      // Create new educations
      for (const item of itemsWithoutId) {
        await tx.education.create({
          data: {
            school: item.school,
            degree: item.degree,
            startDate: item.startDate,
            endDate: item.endDate || null,
            city: item.city,
            description: item.description,
            userId,
          },
        });
      }

      // Delete all educations not in the payload
      const educationIdsToKeep = educations.map((e) => e.id).filter((id): id is string => !!id);
      await tx.education.deleteMany({
        where: { userId, id: { notIn: educationIdsToKeep } },
      });
    });

    return await this.findByUserId(userId);
  }

  async findIdsByUserId(userId: string): Promise<string[]> {
    const records = await prisma.education.findMany({
      where: { userId },
      select: { id: true },
    });
    return records.map((r) => r.id);
  }

  async findByUserId(userId: string): Promise<Education[]> {
    return await prisma.education.findMany({
      where: { userId },
    });
  }
}

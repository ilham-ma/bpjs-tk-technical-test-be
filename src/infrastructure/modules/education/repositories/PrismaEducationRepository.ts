import { IEducationRepository } from '../../../../domain/education/repositories/IEducationRepository';
import { Education } from '../../../../domain/education/entities/Education';
import { EducationInputDTO } from '../../../../application/education/dtos/EducationInputDTO';
import prisma from '../../../database/prisma/client';

export class PrismaEducationRepository implements IEducationRepository {
  async replaceForUser(userId: string, educations: EducationInputDTO[]): Promise<Education[]> {
    await prisma.$transaction([
      prisma.education.deleteMany({
        where: { userId },
      }),
      prisma.education.createMany({
        data: educations.map((education) => ({
          school: education.school,
          degree: education.degree,
          startDate: education.startDate,
          endDate: education.endDate || null,
          userId,
        })),
      }),
    ]);

    return await this.findByUserId(userId);
  }

  async findByUserId(userId: string): Promise<Education[]> {
    return await prisma.education.findMany({
      where: { userId },
    });
  }
}

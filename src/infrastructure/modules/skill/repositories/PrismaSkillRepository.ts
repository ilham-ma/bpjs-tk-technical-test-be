import { ISkillRepository } from '../../../../domain/skill/repositories/ISkillRepository';
import { Skill } from '../../../../domain/skill/entities/Skill';
import { SkillInputDTO } from '../../../../application/skill/dtos/SkillInputDTO';
import prisma from '../../../database/prisma/client';

export class PrismaSkillRepository implements ISkillRepository {
  async replaceForUser(userId: string, skills: SkillInputDTO[]): Promise<Skill[]> {
    await prisma.$transaction([
      prisma.skill.deleteMany({
        where: { userId },
      }),
      prisma.skill.createMany({
        data: skills.map((skill) => ({
          name: skill.name,
          level: skill.level,
          userId,
        })),
      }),
    ]);

    return await this.findByUserId(userId);
  }

  async findByUserId(userId: string): Promise<Skill[]> {
    return await prisma.skill.findMany({
      where: { userId },
    });
  }
}

import { ISkillRepository } from '../../../../domain/skill/repositories/ISkillRepository';
import { Skill } from '../../../../domain/skill/entities/Skill';
import { SkillInputDTO } from '../../../../application/skill/dtos/SkillInputDTO';
import { AppError } from '../../../../shared/errors/AppError';
import prisma from '../../../database/prisma/client';

export class PrismaSkillRepository implements ISkillRepository {
  async create(input: SkillInputDTO): Promise<Skill> {
    return await prisma.skill.create({
      data: { name: input.name, level: input.level },
    });
  }

  async findAll(): Promise<Skill[]> {
    return await prisma.skill.findMany();
  }

  async findById(id: string): Promise<Skill | null> {
    return await prisma.skill.findUnique({ where: { id } });
  }

  async findManyByIds(ids: string[]): Promise<Skill[]> {
    return await prisma.skill.findMany({ where: { id: { in: ids } } });
  }

  async linkUserSkills(userId: string, skillIds: string[]): Promise<Skill[]> {
    if (skillIds.length > 0) {
      const found = await prisma.skill.findMany({ where: { id: { in: skillIds } } });
      if (found.length !== new Set(skillIds).size) {
        throw new AppError("One or more skills not found", 404);
      }
    }

    await prisma.$transaction([
      prisma.userSkill.deleteMany({ where: { userId } }),
      prisma.userSkill.createMany({
        data: skillIds.map((skillId) => ({ userId, skillId })),
      }),
    ]);

    return await this.findByUserId(userId);
  }

  async findByUserId(userId: string): Promise<Skill[]> {
    const rows = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });
    return rows.map((r) => r.skill);
  }
}

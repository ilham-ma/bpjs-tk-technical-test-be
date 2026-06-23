import { ISkillRepository } from '../../../../domain/skill/repositories/ISkillRepository';
import { Skill } from '../../../../domain/skill/entities/Skill';
import { SkillInputDTO } from '../../../../application/skill/dtos/SkillInputDTO';
import { AppError } from '../../../../shared/errors/AppError';
import prisma from '../../../database/prisma/client';

export class PrismaSkillRepository implements ISkillRepository {
  async create(input: { name: string; level: SkillInputDTO['level'] }): Promise<Skill> {
    return await prisma.skill.create({
      data: { name: input.name, level: input.level as any },
    });
  }

  async createMany(inputs: SkillInputDTO[]): Promise<Skill[]> {
    return await prisma.$transaction(
      inputs.map((input) =>
        prisma.skill.create({
          data: { name: input.name as string, level: input.level as any },
        })
      )
    );
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
    const uniqueIds = Array.from(new Set(skillIds));

    await prisma.$transaction(async (tx) => {
      const existing = await tx.skill.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((s) => s.id));
      const missing = uniqueIds.filter((id) => !existingIds.has(id));
      if (missing.length > 0) {
        throw new AppError(`Skill id(s) not found: ${missing.join(", ")}`, 400);
      }

      await tx.userSkill.createMany({
        data: uniqueIds.map((skillId) => ({ userId, skillId })),
        skipDuplicates: true,
      });
    });

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

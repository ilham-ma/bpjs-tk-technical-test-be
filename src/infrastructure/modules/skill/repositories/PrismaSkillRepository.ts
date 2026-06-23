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

  async findAll(): Promise<Skill[]> {
    return await prisma.skill.findMany();
  }

  async findById(id: string): Promise<Skill | null> {
    return await prisma.skill.findUnique({ where: { id } });
  }

  async findManyByIds(ids: string[]): Promise<Skill[]> {
    return await prisma.skill.findMany({ where: { id: { in: ids } } });
  }

  async syncUserSkills(userId: string, skills: SkillInputDTO[]): Promise<Skill[]> {
    const itemsWithId = skills.filter((s) => s.id);
    const itemsWithoutId = skills.filter((s) => !s.id);

    await prisma.$transaction(async (tx) => {
      // Validate items with ID belong to current user and exist
      const existingUserSkills = await tx.userSkill.findMany({
        where: { userId },
        select: { skillId: true },
      });
      const userSkillIds = new Set(existingUserSkills.map((us) => us.skillId));

      for (const item of itemsWithId) {
        if (!userSkillIds.has(item.id!)) {
          throw new AppError(`Skill ${item.id} does not belong to this user`, 403);
        }
        // Update existing skill in catalog
        if (item.name && item.level) {
          await tx.skill.update({
            where: { id: item.id },
            data: { name: item.name, level: item.level as any },
          });
        }
      }

      // Create new skills and link them
      for (const item of itemsWithoutId) {
        if (!item.name || !item.level) {
          throw new AppError("Skill name and level are required when creating a new skill", 400);
        }
        const newSkill = await tx.skill.create({
          data: { name: item.name, level: item.level },
        });
        await tx.userSkill.create({
          data: { userId, skillId: newSkill.id },
        });
      }

      // Delete all user-skill links not in the payload
      const skillIdsToKeep = skills.map((s) => s.id).filter((id): id is string => !!id);
      await tx.userSkill.deleteMany({
        where: { userId, skillId: { notIn: skillIdsToKeep } },
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

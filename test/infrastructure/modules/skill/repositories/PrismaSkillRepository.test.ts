import { describe, it, expect, beforeEach, vi } from "vitest";
import { Skill } from "../../../../../src/domain/skill/entities/Skill";
import { SkillInputDTO } from "../../../../../src/application/skill/dtos/SkillInputDTO";

vi.mock("../../../../../src/infrastructure/database/prisma/client", () => ({
  default: {
    skill: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    userSkill: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { PrismaSkillRepository } from "../../../../../src/infrastructure/modules/skill/repositories/PrismaSkillRepository";
import prisma from "../../../../../src/infrastructure/database/prisma/client";

describe("PrismaSkillRepository", () => {
  let repository: PrismaSkillRepository;

  const userId = "550e8400-e29b-41d4-a716-446655440000";
  const skillId1 = "550e8400-e29b-41d4-a716-446655440001";
  const skillId2 = "550e8400-e29b-41d4-a716-446655440002";

  const mockSkills: Skill[] = [
    { id: skillId1, name: "TypeScript", level: "Expert" },
    { id: skillId2, name: "React", level: "Intermediate" },
  ];

  beforeEach(() => {
    repository = new PrismaSkillRepository();
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a skill with name and level", async () => {
      const input: SkillInputDTO = { name: "TypeScript", level: "Expert" };
      const created: Skill = { id: skillId1, ...input };

      vi.mocked(prisma.skill.create).mockResolvedValue(created as any);

      const result = await repository.create(input);

      expect(prisma.skill.create).toHaveBeenCalledWith({
        data: { name: "TypeScript", level: "Expert" },
      });
      expect(result).toEqual(created);
    });

    it("should handle all SkillLevel values", async () => {
      const inputs: SkillInputDTO[] = [
        { name: "Python", level: "Basic" },
        { name: "Go", level: "Intermediate" },
        { name: "TypeScript", level: "Expert" },
      ];

      for (const input of inputs) {
        vi.mocked(prisma.skill.create).mockResolvedValueOnce({ id: skillId1, ...input } as any);
        await repository.create(input);
      }

      expect(prisma.skill.create).toHaveBeenCalledTimes(3);
    });
  });

  describe("findAll", () => {
    it("should return all skills", async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills as any);

      const result = await repository.findAll();

      expect(prisma.skill.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockSkills);
    });

    it("should return empty array when no skills exist", async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("should return skill when found", async () => {
      vi.mocked(prisma.skill.findUnique).mockResolvedValue(mockSkills[0] as any);

      const result = await repository.findById(skillId1);

      expect(prisma.skill.findUnique).toHaveBeenCalledWith({ where: { id: skillId1 } });
      expect(result).toEqual(mockSkills[0]);
    });

    it("should return null when skill not found", async () => {
      vi.mocked(prisma.skill.findUnique).mockResolvedValue(null);

      const result = await repository.findById("invalid-id");

      expect(result).toBeNull();
    });
  });

  describe("findManyByIds", () => {
    it("should return skills matching provided ids", async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills as any);

      const result = await repository.findManyByIds([skillId1, skillId2]);

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        where: { id: { in: [skillId1, skillId2] } },
      });
      expect(result).toEqual(mockSkills);
    });

    it("should return empty array when no ids match", async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue([]);

      const result = await repository.findManyByIds(["invalid-id"]);

      expect(result).toEqual([]);
    });
  });

  describe("syncUserSkills", () => {
    it("should create new skills when id is not provided", async () => {
      const input: SkillInputDTO[] = [
        { name: "TypeScript", level: "Expert" },
        { name: "React", level: "Intermediate" },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          userSkill: {
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn(),
            deleteMany: vi.fn(),
          },
          skill: {
            create: vi.fn().mockResolvedValueOnce({ id: skillId1, name: "TypeScript", level: "Expert" })
              .mockResolvedValueOnce({ id: skillId2, name: "React", level: "Intermediate" }),
            update: vi.fn(),
          },
        };
        await callback(tx);
      });

      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
        { userId, skillId: skillId1, skill: mockSkills[0], user: null },
        { userId, skillId: skillId2, skill: mockSkills[1], user: null },
      ] as any);

      const result = await repository.syncUserSkills(userId, input);

      expect(result).toEqual(mockSkills);
    });

    it("should update existing skills when id is provided", async () => {
      const input: SkillInputDTO[] = [
        { id: skillId1, name: "TypeScript Updated", level: "Expert" },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          userSkill: {
            findMany: vi.fn().mockResolvedValue([{ skillId: skillId1 }]),
            deleteMany: vi.fn(),
          },
          skill: {
            update: vi.fn(),
          },
        };
        await callback(tx);
      });

      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
        { userId, skillId: skillId1, skill: mockSkills[0], user: null },
      ] as any);

      const result = await repository.syncUserSkills(userId, input);

      expect(result).toHaveLength(1);
    });

    it("should throw error if skill id does not belong to user", async () => {
      const input: SkillInputDTO[] = [
        { id: skillId1, name: "TypeScript", level: "Expert" },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          userSkill: {
            findMany: vi.fn().mockResolvedValue([]),
          },
        };
        try {
          await callback(tx);
        } catch (err) {
          throw err;
        }
      });

      await expect(repository.syncUserSkills(userId, input))
        .rejects.toThrow("does not belong to this user");
    });

    it("should delete skills not in the payload", async () => {
      const input: SkillInputDTO[] = [
        { id: skillId1, name: "TypeScript", level: "Expert" },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          userSkill: {
            findMany: vi.fn().mockResolvedValue([{ skillId: skillId1 }, { skillId: skillId2 }]),
            deleteMany: vi.fn(),
          },
          skill: {
            update: vi.fn(),
          },
        };
        await callback(tx);
        expect(tx.userSkill.deleteMany).toHaveBeenCalledWith({
          where: { userId, skillId: { notIn: [skillId1] } },
        });
      });

      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
        { userId, skillId: skillId1, skill: mockSkills[0], user: null },
      ] as any);

      await repository.syncUserSkills(userId, input);
    });

    it("should handle mixed create and update", async () => {
      const input: SkillInputDTO[] = [
        { id: skillId1, name: "TypeScript", level: "Expert" },
        { name: "React", level: "Intermediate" },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          userSkill: {
            findMany: vi.fn().mockResolvedValue([{ skillId: skillId1 }]),
            create: vi.fn(),
            deleteMany: vi.fn(),
          },
          skill: {
            create: vi.fn().mockResolvedValue({ id: skillId2, name: "React", level: "Intermediate" }),
            update: vi.fn(),
          },
        };
        await callback(tx);
      });

      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
        { userId, skillId: skillId1, skill: mockSkills[0], user: null },
        { userId, skillId: skillId2, skill: mockSkills[1], user: null },
      ] as any);

      const result = await repository.syncUserSkills(userId, input);

      expect(result).toHaveLength(2);
    });
  });

  describe("findByUserId", () => {
    it("should query userSkill with correct where clause", async () => {
      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
        { userId, skillId: skillId1, skill: mockSkills[0], user: null },
        { userId, skillId: skillId2, skill: mockSkills[1], user: null },
      ] as any);

      await repository.findByUserId(userId);

      expect(prisma.userSkill.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { skill: true },
      });
    });

    it("should return skills for user", async () => {
      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
        { userId, skillId: skillId1, skill: mockSkills[0], user: null },
        { userId, skillId: skillId2, skill: mockSkills[1], user: null },
      ] as any);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual(mockSkills);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when user has no skills", async () => {
      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([]);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual([]);
    });
  });
});

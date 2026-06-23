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
        { name: "Ruby", level: "Skillfull" },
        { name: "Java", level: "Experienced" },
        { name: "TypeScript", level: "Expert" },
      ];

      for (const input of inputs) {
        vi.mocked(prisma.skill.create).mockResolvedValueOnce({ id: skillId1, ...input } as any);
        await repository.create(input);
      }

      expect(prisma.skill.create).toHaveBeenCalledTimes(5);
    });
  });

  describe("createMany", () => {
    it("should create skills via a transaction and return them", async () => {
      const inputs: SkillInputDTO[] = [
        { name: "TypeScript", level: "Expert" },
        { name: "React", level: "Skillfull" },
      ];
      const created: Skill[] = [
        { id: skillId1, name: "TypeScript", level: "Expert" },
        { id: skillId2, name: "React", level: "Skillfull" },
      ];

      vi.mocked(prisma.skill.create).mockImplementation(((args: any) => {
        return args;
      }) as any);
      vi.mocked(prisma.$transaction).mockResolvedValue(created as any);

      const result = await repository.createMany(inputs);

      expect(prisma.skill.create).toHaveBeenCalledTimes(inputs.length);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual(created);
    });

    it("should handle a single-element array", async () => {
      const inputs: SkillInputDTO[] = [{ name: "Go", level: "Experienced" }];
      const created: Skill[] = [{ id: skillId1, name: "Go", level: "Experienced" }];

      vi.mocked(prisma.skill.create).mockImplementation(((args: any) => args) as any);
      vi.mocked(prisma.$transaction).mockResolvedValue(created as any);

      const result = await repository.createMany(inputs);

      expect(result).toEqual(created);
      expect(result).toHaveLength(1);
    });

    it("should rollback on error (propagates transaction error)", async () => {
      const inputs: SkillInputDTO[] = [
        { name: "TypeScript", level: "Expert" },
        { name: "Broken", level: "Expert" },
      ];

      vi.mocked(prisma.skill.create).mockImplementation(((args: any) => args) as any);
      vi.mocked(prisma.$transaction).mockRejectedValue(new Error("Transaction failed"));

      await expect(repository.createMany(inputs)).rejects.toThrow("Transaction failed");
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

  describe("linkUserSkills", () => {
    function mockTxWithSkills(existingIds: string[]) {
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          skill: {
            findMany: vi.fn().mockResolvedValue(existingIds.map((id) => ({ id }))),
          },
          userSkill: {
            createMany: vi.fn(),
          },
        };
        await callback(tx);
        return tx;
      });
    }

    it("should link existing skills to a user (additive)", async () => {
      mockTxWithSkills([skillId1, skillId2]);
      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
        { userId, skillId: skillId1, skill: mockSkills[0], user: null },
        { userId, skillId: skillId2, skill: mockSkills[1], user: null },
      ] as any);

      const result = await repository.linkUserSkills(userId, [skillId1, skillId2]);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSkills);
    });

    it("should deduplicate skill ids before linking", async () => {
      let capturedCreateManyArgs: any = null;
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          skill: {
            findMany: vi.fn().mockResolvedValue([{ id: skillId1 }]),
          },
          userSkill: {
            createMany: vi.fn().mockImplementation((args: any) => {
              capturedCreateManyArgs = args;
            }),
          },
        };
        await callback(tx);
      });
      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
        { userId, skillId: skillId1, skill: mockSkills[0], user: null },
      ] as any);

      await repository.linkUserSkills(userId, [skillId1, skillId1]);

      expect(capturedCreateManyArgs?.data).toEqual([{ userId, skillId: skillId1 }]);
      expect(capturedCreateManyArgs?.skipDuplicates).toBe(true);
    });

    it("should throw 400 AppError when any skill id is not found", async () => {
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          skill: {
            findMany: vi.fn().mockResolvedValue([{ id: skillId1 }]),
          },
          userSkill: {
            createMany: vi.fn(),
          },
        };
        await callback(tx);
      });

      await expect(
        repository.linkUserSkills(userId, [skillId1, skillId2]),
      ).rejects.toThrow(/Skill id\(s\) not found/);
    });

    it("should skip duplicates when linking an already-linked skill", async () => {
      let capturedCreateManyArgs: any = null;
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          skill: {
            findMany: vi.fn().mockResolvedValue([{ id: skillId1 }]),
          },
          userSkill: {
            createMany: vi.fn().mockImplementation((args: any) => {
              capturedCreateManyArgs = args;
            }),
          },
        };
        await callback(tx);
      });
      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
        { userId, skillId: skillId1, skill: mockSkills[0], user: null },
      ] as any);

      await repository.linkUserSkills(userId, [skillId1]);

      expect(capturedCreateManyArgs?.skipDuplicates).toBe(true);
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

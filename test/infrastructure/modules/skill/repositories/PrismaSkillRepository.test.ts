import { describe, it, expect, beforeEach, vi } from "vitest";
import { Skill } from "../../../../../src/domain/skill/entities/Skill";
import { SkillInputDTO } from "../../../../../src/application/skill/dtos/SkillInputDTO";

vi.mock("../../../../../src/infrastructure/database/prisma/client", () => ({
  default: {
    skill: {
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

  const mockSkills: Skill[] = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "TypeScript",
      level: "Expert",
      userId,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "React",
      level: "Intermediate",
      userId,
    },
  ];

  beforeEach(() => {
    repository = new PrismaSkillRepository();
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockResolvedValue([null, null]);
  });

  describe("replaceForUser", () => {
    it("should call deleteMany with correct userId inside transaction", async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills);

      await repository.replaceForUser(userId, [
        { name: "TypeScript", level: "Expert" },
      ]);

      expect(prisma.skill.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should call createMany with skills mapped to include userId", async () => {
      const inputs: SkillInputDTO[] = [
        { name: "TypeScript", level: "Expert" },
        { name: "React", level: "Intermediate" },
      ];

      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills);

      await repository.replaceForUser(userId, inputs);

      expect(prisma.skill.createMany).toHaveBeenCalledWith({
        data: [
          { name: "TypeScript", level: "Expert", userId },
          { name: "React", level: "Intermediate", userId },
        ],
      });
    });

    it("should wrap deleteMany and createMany inside a single transaction", async () => {
      const inputs: SkillInputDTO[] = [{ name: "Node.js", level: "Basic" }];

      vi.mocked(prisma.skill.findMany).mockResolvedValue([]);

      await repository.replaceForUser(userId, inputs);

      const transactionArg = vi.mocked(prisma.$transaction).mock.calls[0][0];
      expect(Array.isArray(transactionArg)).toBe(true);
      expect((transactionArg as any[]).length).toBe(2);
    });

    it("should return skills fetched after transaction completes", async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills);

      const result = await repository.replaceForUser(userId, [
        { name: "TypeScript", level: "Expert" },
      ]);

      expect(prisma.skill.findMany).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual(mockSkills);
    });

    it("should call createMany with empty data when skills array is empty", async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue([]);

      const result = await repository.replaceForUser(userId, []);

      expect(prisma.skill.createMany).toHaveBeenCalledWith({ data: [] });
      expect(result).toEqual([]);
    });

    it("should still call deleteMany even when skills array is empty", async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue([]);

      await repository.replaceForUser(userId, []);

      expect(prisma.skill.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should handle all three SkillLevel values correctly", async () => {
      const inputs: SkillInputDTO[] = [
        { name: "Python", level: "Basic" },
        { name: "Go", level: "Intermediate" },
        { name: "TypeScript", level: "Expert" },
      ];

      const expectedSkills: Skill[] = inputs.map((s, i) => ({
        id: `id-${i}`,
        ...s,
        userId,
      }));

      vi.mocked(prisma.skill.findMany).mockResolvedValue(expectedSkills);

      const result = await repository.replaceForUser(userId, inputs);

      expect(prisma.skill.createMany).toHaveBeenCalledWith({
        data: [
          { name: "Python", level: "Basic", userId },
          { name: "Go", level: "Intermediate", userId },
          { name: "TypeScript", level: "Expert", userId },
        ],
      });
      expect(result).toEqual(expectedSkills);
    });

    it("should propagate error when transaction fails", async () => {
      vi.mocked(prisma.$transaction).mockRejectedValue(
        new Error("Transaction failed"),
      );

      await expect(
        repository.replaceForUser(userId, [{ name: "TypeScript", level: "Expert" }]),
      ).rejects.toThrow("Transaction failed");
    });

    it("should propagate error when findMany after transaction fails", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([null, null]);
      vi.mocked(prisma.skill.findMany).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        repository.replaceForUser(userId, [{ name: "TypeScript", level: "Expert" }]),
      ).rejects.toThrow("Database error");
    });
  });

  describe("findByUserId", () => {
    it("should query with correct where clause", async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills);

      await repository.findByUserId(userId);

      expect(prisma.skill.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should return skills when user has skills", async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue(mockSkills);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual(mockSkills);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when user has no skills", async () => {
      vi.mocked(prisma.skill.findMany).mockResolvedValue([]);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should propagate error when database query fails", async () => {
      vi.mocked(prisma.skill.findMany).mockRejectedValue(
        new Error("Connection error"),
      );

      await expect(repository.findByUserId(userId)).rejects.toThrow(
        "Connection error",
      );
    });
  });
});

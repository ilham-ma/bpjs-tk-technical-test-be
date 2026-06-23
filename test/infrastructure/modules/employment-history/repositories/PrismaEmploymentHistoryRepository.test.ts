import { describe, it, expect, beforeEach, vi } from "vitest";
import { EmploymentHistory } from "../../../../../src/domain/employment-history/entities/EmploymentHistory";
import { EmploymentHistoryInputDTO } from "../../../../../src/application/employment-history/dtos/EmploymentHistoryInputDTO";

vi.mock("../../../../../src/infrastructure/database/prisma/client", () => ({
  default: {
    employmentHistory: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { PrismaEmploymentHistoryRepository } from "../../../../../src/infrastructure/modules/employment-history/repositories/PrismaEmploymentHistoryRepository";
import prisma from "../../../../../src/infrastructure/database/prisma/client";

describe("PrismaEmploymentHistoryRepository", () => {
  let repository: PrismaEmploymentHistoryRepository;

  const userId = "550e8400-e29b-41d4-a716-446655440000";

  const mockEmploymentHistories: EmploymentHistory[] = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      jobTitle: "Senior Software Engineer",
      employer: "Tech Company A",
      startDate: new Date("2020-01-15"),
      endDate: new Date("2023-06-30"),
      city: "Jakarta",
      description: "Developed backend systems and APIs",
      userId,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      jobTitle: "Software Engineer",
      employer: "Tech Company B",
      startDate: new Date("2018-03-01"),
      endDate: null,
      city: "Bandung",
      description: "Full stack development",
      userId,
    },
  ];

  beforeEach(() => {
    repository = new PrismaEmploymentHistoryRepository();
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockResolvedValue([null, null]);
  });

  describe("syncForUser", () => {
    it("should create new employment histories when id is not provided", async () => {
      const input: EmploymentHistoryInputDTO[] = [
        {
          jobTitle: "Senior Software Engineer",
          employer: "Tech Company A",
          startDate: "2020-jan",
          endDate: "2023-jun",
          city: "Jakarta",
          description: "Developed backend systems and APIs",
        },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          employmentHistory: {
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue(mockEmploymentHistories[0]),
            update: vi.fn(),
            deleteMany: vi.fn(),
          },
        };
        await callback(tx);
      });

      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue([mockEmploymentHistories[0]]);

      const result = await repository.syncForUser(userId, input);

      expect(result).toHaveLength(1);
    });

    it("should update existing employment histories when id is provided", async () => {
      const input: EmploymentHistoryInputDTO[] = [
        {
          id: mockEmploymentHistories[0].id,
          jobTitle: "Updated Position",
          employer: "Tech Company A",
          startDate: "2020-jan",
          endDate: "2023-jun",
          city: "Jakarta",
          description: "Updated description",
        },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          employmentHistory: {
            findMany: vi.fn().mockResolvedValue([{ id: mockEmploymentHistories[0].id }]),
            update: vi.fn(),
            deleteMany: vi.fn(),
          },
        };
        await callback(tx);
      });

      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue([mockEmploymentHistories[0]]);

      const result = await repository.syncForUser(userId, input);

      expect(result).toHaveLength(1);
    });

    it("should throw error if employment history id does not belong to user", async () => {
      const input: EmploymentHistoryInputDTO[] = [
        {
          id: "non-existent-id",
          jobTitle: "Senior Software Engineer",
          employer: "Tech Company A",
          startDate: "2020-jan",
          endDate: "2023-jun",
          city: "Jakarta",
          description: "Developed backend systems and APIs",
        },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          employmentHistory: {
            findMany: vi.fn().mockResolvedValue([]),
          },
        };
        try {
          await callback(tx);
        } catch (err) {
          throw err;
        }
      });

      await expect(repository.syncForUser(userId, input))
        .rejects.toThrow("does not belong to this user");
    });

    it("should delete employment histories not in the payload", async () => {
      const empId1 = mockEmploymentHistories[0].id;
      const empId2 = mockEmploymentHistories[1].id;

      const input: EmploymentHistoryInputDTO[] = [
        {
          id: empId1,
          jobTitle: "Senior Software Engineer",
          employer: "Tech Company A",
          startDate: "2020-jan",
          endDate: "2023-jun",
          city: "Jakarta",
          description: "Developed backend systems and APIs",
        },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          employmentHistory: {
            findMany: vi.fn().mockResolvedValue([{ id: empId1 }, { id: empId2 }]),
            update: vi.fn(),
            deleteMany: vi.fn(),
          },
        };
        await callback(tx);
        expect(tx.employmentHistory.deleteMany).toHaveBeenCalledWith({
          where: { userId, id: { notIn: [empId1] } },
        });
      });

      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue([mockEmploymentHistories[0]]);

      await repository.syncForUser(userId, input);
    });

    it("should handle mixed create and update", async () => {
      const input: EmploymentHistoryInputDTO[] = [
        {
          id: mockEmploymentHistories[0].id,
          jobTitle: "Senior Software Engineer",
          employer: "Tech Company A",
          startDate: "2020-jan",
          endDate: "2023-jun",
          city: "Jakarta",
          description: "Developed backend systems and APIs",
        },
        {
          jobTitle: "Software Engineer",
          employer: "Tech Company B",
          startDate: "2018-mar",
          endDate: null,
          city: "Bandung",
          description: "Full stack development",
        },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          employmentHistory: {
            findMany: vi.fn().mockResolvedValue([{ id: mockEmploymentHistories[0].id }]),
            update: vi.fn(),
            create: vi.fn().mockResolvedValue(mockEmploymentHistories[1]),
            deleteMany: vi.fn(),
          },
        };
        await callback(tx);
      });

      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue(mockEmploymentHistories);

      const result = await repository.syncForUser(userId, input);

      expect(result).toHaveLength(2);
    });
  });

  describe("findIdsByUserId", () => {
    it("should return employment history ids for user", async () => {
      const empId1 = mockEmploymentHistories[0].id;
      const empId2 = mockEmploymentHistories[1].id;
      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue([
        { id: empId1 },
        { id: empId2 },
      ] as any);

      const result = await repository.findIdsByUserId(userId);

      expect(result).toEqual([empId1, empId2]);
      expect(prisma.employmentHistory.findMany).toHaveBeenCalledWith({
        where: { userId },
        select: { id: true },
      });
    });

    it("should return empty array when user has no employment histories", async () => {
      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue([]);

      const result = await repository.findIdsByUserId(userId);

      expect(result).toEqual([]);
    });
  });

  describe("findByUserId", () => {
    it("should query with correct where clause", async () => {
      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue(mockEmploymentHistories);

      await repository.findByUserId(userId);

      expect(prisma.employmentHistory.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should return employment histories when user has them", async () => {
      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue(mockEmploymentHistories);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual(mockEmploymentHistories);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when user has no employment histories", async () => {
      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue([]);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should handle employment histories with null endDate", async () => {
      const historiesWithNull: EmploymentHistory[] = [
        {
          id: "550e8400-e29b-41d4-a716-446655440004",
          jobTitle: "Current Job",
          employer: "Current Employer",
          startDate: new Date("2023-01-01"),
          endDate: null,
          city: "Jakarta",
          description: "Currently working",
          userId,
        },
      ];

      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue(historiesWithNull);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual(historiesWithNull);
      expect(result[0].endDate).toBeNull();
    });

    it("should propagate error when database query fails", async () => {
      vi.mocked(prisma.employmentHistory.findMany).mockRejectedValue(
        new Error("Connection error"),
      );

      await expect(repository.findByUserId(userId)).rejects.toThrow(
        "Connection error",
      );
    });
  });
});

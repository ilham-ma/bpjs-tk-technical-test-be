import { describe, it, expect, beforeEach, vi } from "vitest";
import { EmploymentHistory } from "../../../../../src/domain/employment-history/entities/EmploymentHistory";
import { EmploymentHistoryInputDTO } from "../../../../../src/application/employment-history/dtos/EmploymentHistoryInputDTO";

vi.mock("../../../../../src/infrastructure/database/prisma/client", () => ({
  default: {
    employmentHistory: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
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

  describe("replaceForUser", () => {
    it("should call deleteMany with correct userId inside transaction", async () => {
      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue(mockEmploymentHistories);

      await repository.replaceForUser(userId, [
        {
          jobTitle: "Senior Software Engineer",
          employer: "Tech Company A",
          startDate: new Date("2020-01-15"),
          endDate: new Date("2023-06-30"),
          city: "Jakarta",
          description: "Developed backend systems and APIs",
        },
      ]);

      expect(prisma.employmentHistory.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should call createMany with employment histories mapped to include userId", async () => {
      const inputs: Omit<EmploymentHistory, 'id' | 'userId'>[] = [
        {
          jobTitle: "Senior Software Engineer",
          employer: "Tech Company A",
          startDate: new Date("2020-01-15"),
          endDate: new Date("2023-06-30"),
          city: "Jakarta",
          description: "Developed backend systems and APIs",
        },
        {
          jobTitle: "Software Engineer",
          employer: "Tech Company B",
          startDate: new Date("2018-03-01"),
          endDate: null,
          city: "Bandung",
          description: "Full stack development",
        },
      ];

      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue(mockEmploymentHistories);

      await repository.replaceForUser(userId, inputs);

      expect(prisma.employmentHistory.createMany).toHaveBeenCalledWith({
        data: [
          {
            jobTitle: "Senior Software Engineer",
            employer: "Tech Company A",
            startDate: new Date("2020-01-15"),
            endDate: new Date("2023-06-30"),
            city: "Jakarta",
            description: "Developed backend systems and APIs",
            userId,
          },
          {
            jobTitle: "Software Engineer",
            employer: "Tech Company B",
            startDate: new Date("2018-03-01"),
            endDate: null,
            city: "Bandung",
            description: "Full stack development",
            userId,
          },
        ],
      });
    });

    it("should wrap deleteMany and createMany inside a single transaction", async () => {
      const inputs: Omit<EmploymentHistory, 'id' | 'userId'>[] = [
        {
          jobTitle: "Project Manager",
          employer: "Project Company",
          startDate: new Date("2019-05-01"),
          endDate: new Date("2021-12-31"),
          city: "Surabaya",
          description: "Managed team projects",
        },
      ];

      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue([]);

      await repository.replaceForUser(userId, inputs);

      const transactionArg = vi.mocked(prisma.$transaction).mock.calls[0][0];
      expect(Array.isArray(transactionArg)).toBe(true);
      expect((transactionArg as any[]).length).toBe(2);
    });

    it("should return employment histories fetched after transaction completes", async () => {
      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue(mockEmploymentHistories);

      const result = await repository.replaceForUser(userId, [
        {
          jobTitle: "Senior Software Engineer",
          employer: "Tech Company A",
          startDate: new Date("2020-01-15"),
          endDate: new Date("2023-06-30"),
          city: "Jakarta",
          description: "Developed backend systems and APIs",
        },
      ]);

      expect(prisma.employmentHistory.findMany).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual(mockEmploymentHistories);
    });

    it("should call createMany with empty data when items array is empty", async () => {
      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue([]);

      const result = await repository.replaceForUser(userId, []);

      expect(prisma.employmentHistory.createMany).toHaveBeenCalledWith({ data: [] });
      expect(result).toEqual([]);
    });

    it("should still call deleteMany even when items array is empty", async () => {
      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue([]);

      await repository.replaceForUser(userId, []);

      expect(prisma.employmentHistory.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should handle null endDate correctly", async () => {
      const inputs: Omit<EmploymentHistory, 'id' | 'userId'>[] = [
        {
          jobTitle: "Current Position",
          employer: "Current Company",
          startDate: new Date("2023-07-01"),
          endDate: null,
          city: "Jakarta",
          description: "Currently employed",
        },
      ];

      const expectedEmploymentHistories: EmploymentHistory[] = [
        {
          id: "550e8400-e29b-41d4-a716-446655440003",
          jobTitle: "Current Position",
          employer: "Current Company",
          startDate: new Date("2023-07-01"),
          endDate: null,
          city: "Jakarta",
          description: "Currently employed",
          userId,
        },
      ];

      vi.mocked(prisma.employmentHistory.findMany).mockResolvedValue(expectedEmploymentHistories);

      const result = await repository.replaceForUser(userId, inputs);

      expect(prisma.employmentHistory.createMany).toHaveBeenCalledWith({
        data: [
          {
            jobTitle: "Current Position",
            employer: "Current Company",
            startDate: new Date("2023-07-01"),
            endDate: null,
            city: "Jakarta",
            description: "Currently employed",
            userId,
          },
        ],
      });
      expect(result).toEqual(expectedEmploymentHistories);
    });

    it("should propagate error when transaction fails", async () => {
      vi.mocked(prisma.$transaction).mockRejectedValue(
        new Error("Transaction failed"),
      );

      await expect(
        repository.replaceForUser(userId, [
          {
            jobTitle: "Software Engineer",
            employer: "Company",
            startDate: new Date("2020-01-01"),
            endDate: new Date("2023-01-01"),
            city: "Jakarta",
            description: "Worked here",
          },
        ]),
      ).rejects.toThrow("Transaction failed");
    });

    it("should propagate error when findMany after transaction fails", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([null, null]);
      vi.mocked(prisma.employmentHistory.findMany).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        repository.replaceForUser(userId, [
          {
            jobTitle: "Software Engineer",
            employer: "Company",
            startDate: new Date("2020-01-01"),
            endDate: new Date("2023-01-01"),
            city: "Jakarta",
            description: "Worked here",
          },
        ]),
      ).rejects.toThrow("Database error");
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

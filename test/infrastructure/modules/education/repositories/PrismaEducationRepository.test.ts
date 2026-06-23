import { describe, it, expect, beforeEach, vi } from "vitest";
import { Education } from "../../../../../src/domain/education/entities/Education";
import { EducationInputDTO } from "../../../../../src/application/education/dtos/EducationInputDTO";

vi.mock("../../../../../src/infrastructure/database/prisma/client", () => ({
  default: {
    education: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { PrismaEducationRepository } from "../../../../../src/infrastructure/modules/education/repositories/PrismaEducationRepository";
import prisma from "../../../../../src/infrastructure/database/prisma/client";

describe("PrismaEducationRepository", () => {
  let repository: PrismaEducationRepository;

  const userId = "550e8400-e29b-41d4-a716-446655440000";

  const mockEducations: Education[] = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      school: "University of Technology",
      degree: "Bachelor of Computer Science",
      startDate: new Date("2018-09-01"),
      endDate: new Date("2022-06-15"),
      city: "Bandung",
      description: "Studied computer science fundamentals",
      userId,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      school: "Advanced Institute",
      degree: "Master of Science",
      startDate: new Date("2022-09-01"),
      endDate: null,
      city: "Jakarta",
      description: "Currently pursuing master degree",
      userId,
    },
  ];

  beforeEach(() => {
    repository = new PrismaEducationRepository();
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockResolvedValue([null, null]);
  });

  describe("syncForUser", () => {
    it("should create new educations when id is not provided", async () => {
      const input: EducationInputDTO[] = [
        {
          school: "University of Technology",
          degree: "Bachelor of Computer Science",
          startDate: "2018-09",
          endDate: "2022-06",
          city: "Bandung",
          description: "Studied computer science fundamentals",
        },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          education: {
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue(mockEducations[0]),
            update: vi.fn(),
            deleteMany: vi.fn(),
          },
        };
        await callback(tx);
      });

      vi.mocked(prisma.education.findMany).mockResolvedValue([mockEducations[0]]);

      const result = await repository.syncForUser(userId, input);

      expect(result).toHaveLength(1);
    });

    it("should update existing educations when id is provided", async () => {
      const input: EducationInputDTO[] = [
        {
          id: mockEducations[0].id,
          school: "Updated University",
          degree: "Bachelor of Computer Science",
          startDate: "2018-09",
          endDate: "2022-06",
          city: "Bandung",
          description: "Studied computer science fundamentals",
        },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          education: {
            findMany: vi.fn().mockResolvedValue([{ id: mockEducations[0].id }]),
            update: vi.fn(),
            deleteMany: vi.fn(),
          },
        };
        await callback(tx);
      });

      vi.mocked(prisma.education.findMany).mockResolvedValue([mockEducations[0]]);

      const result = await repository.syncForUser(userId, input);

      expect(result).toHaveLength(1);
    });

    it("should throw error if education id does not belong to user", async () => {
      const input: EducationInputDTO[] = [
        {
          id: "non-existent-id",
          school: "University",
          degree: "Bachelor",
          startDate: "2020-09",
          endDate: "2024-06",
          city: "Jakarta",
          description: "Bachelor program",
        },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          education: {
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

    it("should delete educations not in the payload", async () => {
      const eduId1 = mockEducations[0].id;
      const eduId2 = mockEducations[1].id;

      const input: EducationInputDTO[] = [
        {
          id: eduId1,
          school: "University of Technology",
          degree: "Bachelor of Computer Science",
          startDate: "2018-09",
          endDate: "2022-06",
          city: "Bandung",
          description: "Studied computer science fundamentals",
        },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          education: {
            findMany: vi.fn().mockResolvedValue([{ id: eduId1 }, { id: eduId2 }]),
            update: vi.fn(),
            deleteMany: vi.fn(),
          },
        };
        await callback(tx);
        expect(tx.education.deleteMany).toHaveBeenCalledWith({
          where: { userId, id: { notIn: [eduId1] } },
        });
      });

      vi.mocked(prisma.education.findMany).mockResolvedValue([mockEducations[0]]);

      await repository.syncForUser(userId, input);
    });

    it("should handle mixed create and update", async () => {
      const input: EducationInputDTO[] = [
        {
          id: mockEducations[0].id,
          school: "University of Technology",
          degree: "Bachelor of Computer Science",
          startDate: "2018-09",
          endDate: "2022-06",
          city: "Bandung",
          description: "Studied computer science fundamentals",
        },
        {
          school: "Advanced Institute",
          degree: "Master of Science",
          startDate: "2022-09",
          endDate: null,
          city: "Jakarta",
          description: "Currently pursuing master degree",
        },
      ];

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          education: {
            findMany: vi.fn().mockResolvedValue([{ id: mockEducations[0].id }]),
            update: vi.fn(),
            create: vi.fn().mockResolvedValue(mockEducations[1]),
            deleteMany: vi.fn(),
          },
        };
        await callback(tx);
      });

      vi.mocked(prisma.education.findMany).mockResolvedValue(mockEducations);

      const result = await repository.syncForUser(userId, input);

      expect(result).toHaveLength(2);
    });
  });

  describe("findIdsByUserId", () => {
    it("should return education ids for user", async () => {
      const eduId1 = mockEducations[0].id;
      const eduId2 = mockEducations[1].id;
      vi.mocked(prisma.education.findMany).mockResolvedValue([
        { id: eduId1 },
        { id: eduId2 },
      ] as any);

      const result = await repository.findIdsByUserId(userId);

      expect(result).toEqual([eduId1, eduId2]);
      expect(prisma.education.findMany).toHaveBeenCalledWith({
        where: { userId },
        select: { id: true },
      });
    });

    it("should return empty array when user has no educations", async () => {
      vi.mocked(prisma.education.findMany).mockResolvedValue([]);

      const result = await repository.findIdsByUserId(userId);

      expect(result).toEqual([]);
    });
  });

  describe("findByUserId", () => {
    it("should query with correct where clause", async () => {
      vi.mocked(prisma.education.findMany).mockResolvedValue(mockEducations);

      await repository.findByUserId(userId);

      expect(prisma.education.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should return educations when user has educations", async () => {
      vi.mocked(prisma.education.findMany).mockResolvedValue(mockEducations);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual(mockEducations);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when user has no educations", async () => {
      vi.mocked(prisma.education.findMany).mockResolvedValue([]);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should handle educations with null endDate", async () => {
      const educationsWithNull: Education[] = [
        {
          id: "550e8400-e29b-41d4-a716-446655440004",
          school: "Ongoing University",
          degree: "Master's Degree",
          startDate: new Date("2023-09-01"),
          endDate: null,
          city: "Jakarta",
          description: "Ongoing master degree",
          userId,
        },
      ];

      vi.mocked(prisma.education.findMany).mockResolvedValue(educationsWithNull);

      const result = await repository.findByUserId(userId);

      expect(result).toEqual(educationsWithNull);
      expect(result[0].endDate).toBeNull();
    });

    it("should propagate error when database query fails", async () => {
      vi.mocked(prisma.education.findMany).mockRejectedValue(
        new Error("Connection error"),
      );

      await expect(repository.findByUserId(userId)).rejects.toThrow(
        "Connection error",
      );
    });
  });
});

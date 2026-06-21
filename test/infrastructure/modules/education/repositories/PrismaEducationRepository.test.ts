import { describe, it, expect, beforeEach, vi } from "vitest";
import { Education } from "../../../../../src/domain/education/entities/Education";
import { EducationInputDTO } from "../../../../../src/application/education/dtos/EducationInputDTO";

vi.mock("../../../../../src/infrastructure/database/prisma/client", () => ({
  default: {
    education: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
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

  describe("replaceForUser", () => {
    it("should call deleteMany with correct userId inside transaction", async () => {
      vi.mocked(prisma.education.findMany).mockResolvedValue(mockEducations);

      await repository.replaceForUser(userId, [
        {
          school: "University of Technology",
          degree: "Bachelor of Computer Science",
          startDate: new Date("2018-09-01"),
          endDate: new Date("2022-06-15"),
          city: "Bandung",
          description: "Studied computer science fundamentals",
        },
      ]);

      expect(prisma.education.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should call createMany with educations mapped to include userId", async () => {
      const inputs: EducationInputDTO[] = [
        {
          school: "University of Technology",
          degree: "Bachelor of Computer Science",
          startDate: new Date("2018-09-01"),
          endDate: new Date("2022-06-15"),
          city: "Bandung",
          description: "Studied computer science fundamentals",
        },
        {
          school: "Advanced Institute",
          degree: "Master of Science",
          startDate: new Date("2022-09-01"),
          endDate: null,
          city: "Jakarta",
          description: "Currently pursuing master degree",
        },
      ];

      vi.mocked(prisma.education.findMany).mockResolvedValue(mockEducations);

      await repository.replaceForUser(userId, inputs);

      expect(prisma.education.createMany).toHaveBeenCalledWith({
        data: [
          {
            school: "University of Technology",
            degree: "Bachelor of Computer Science",
            startDate: new Date("2018-09-01"),
            endDate: new Date("2022-06-15"),
            city: "Bandung",
            description: "Studied computer science fundamentals",
            userId,
          },
          {
            school: "Advanced Institute",
            degree: "Master of Science",
            startDate: new Date("2022-09-01"),
            endDate: null,
            city: "Jakarta",
            description: "Currently pursuing master degree",
            userId,
          },
        ],
      });
    });

    it("should wrap deleteMany and createMany inside a single transaction", async () => {
      const inputs: EducationInputDTO[] = [
        {
          school: "State University",
          degree: "Bachelor of Arts",
          startDate: new Date("2020-09-01"),
          endDate: new Date("2024-06-15"),
          city: "Surabaya",
          description: "Bachelor of Arts program",
        },
      ];

      vi.mocked(prisma.education.findMany).mockResolvedValue([]);

      await repository.replaceForUser(userId, inputs);

      const transactionArg = vi.mocked(prisma.$transaction).mock.calls[0][0];
      expect(Array.isArray(transactionArg)).toBe(true);
      expect((transactionArg as any[]).length).toBe(2);
    });

    it("should return educations fetched after transaction completes", async () => {
      vi.mocked(prisma.education.findMany).mockResolvedValue(mockEducations);

      const result = await repository.replaceForUser(userId, [
        {
          school: "University of Technology",
          degree: "Bachelor of Computer Science",
          startDate: new Date("2018-09-01"),
          endDate: new Date("2022-06-15"),
          city: "Bandung",
          description: "Studied computer science fundamentals",
        },
      ]);

      expect(prisma.education.findMany).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual(mockEducations);
    });

    it("should call createMany with empty data when educations array is empty", async () => {
      vi.mocked(prisma.education.findMany).mockResolvedValue([]);

      const result = await repository.replaceForUser(userId, []);

      expect(prisma.education.createMany).toHaveBeenCalledWith({ data: [] });
      expect(result).toEqual([]);
    });

    it("should still call deleteMany even when educations array is empty", async () => {
      vi.mocked(prisma.education.findMany).mockResolvedValue([]);

      await repository.replaceForUser(userId, []);

      expect(prisma.education.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should handle null endDate correctly", async () => {
      const inputs: EducationInputDTO[] = [
        {
          school: "Current University",
          degree: "PhD in Mathematics",
          startDate: new Date("2022-09-01"),
          endDate: null,
          city: "Jakarta",
          description: "PhD program in mathematics",
        },
      ];

      const expectedEducations: Education[] = [
        {
          id: "550e8400-e29b-41d4-a716-446655440003",
          school: "Current University",
          degree: "PhD in Mathematics",
          startDate: new Date("2022-09-01"),
          endDate: null,
          city: "Jakarta",
          description: "PhD program in mathematics",
          userId,
        },
      ];

      vi.mocked(prisma.education.findMany).mockResolvedValue(expectedEducations);

      const result = await repository.replaceForUser(userId, inputs);

      expect(prisma.education.createMany).toHaveBeenCalledWith({
        data: [
          {
            school: "Current University",
            degree: "PhD in Mathematics",
            startDate: new Date("2022-09-01"),
            endDate: null,
            city: "Jakarta",
            description: "PhD program in mathematics",
            userId,
          },
        ],
      });
      expect(result).toEqual(expectedEducations);
    });

    it("should propagate error when transaction fails", async () => {
      vi.mocked(prisma.$transaction).mockRejectedValue(
        new Error("Transaction failed"),
      );

      await expect(
        repository.replaceForUser(userId, [
          {
            school: "University",
            degree: "Bachelor",
            startDate: new Date("2020-09-01"),
            endDate: new Date("2024-06-15"),
            city: "Jakarta",
            description: "Bachelor program",
          },
        ]),
      ).rejects.toThrow("Transaction failed");
    });

    it("should propagate error when findMany after transaction fails", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([null, null]);
      vi.mocked(prisma.education.findMany).mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        repository.replaceForUser(userId, [
          {
            school: "University",
            degree: "Bachelor",
            startDate: new Date("2020-09-01"),
            endDate: new Date("2024-06-15"),
            city: "Jakarta",
            description: "Bachelor program",
          },
        ]),
      ).rejects.toThrow("Database error");
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

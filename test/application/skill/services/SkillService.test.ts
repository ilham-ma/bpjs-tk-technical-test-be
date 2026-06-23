import { describe, it, expect, beforeEach, vi } from "vitest";
import { SkillService } from "../../../../src/application/skill/services/SkillService";
import { ISkillRepository } from "../../../../src/domain/skill/repositories/ISkillRepository";
import { SkillInputDTO } from "../../../../src/application/skill/dtos/SkillInputDTO";
import { Skill } from "../../../../src/domain/skill/entities/Skill";

describe("SkillService", () => {
  let skillService: SkillService;
  let mockRepository: ISkillRepository;

  const mockSkills: Skill[] = [
    { id: "550e8400-e29b-41d4-a716-446655440001", name: "TypeScript", level: "Expert" },
    { id: "550e8400-e29b-41d4-a716-446655440002", name: "React", level: "Skillfull" },
  ];

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      createMany: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      findManyByIds: vi.fn(),
      linkUserSkills: vi.fn(),
      findByUserId: vi.fn(),
    };
    skillService = new SkillService(mockRepository);
  });

  describe("createMany", () => {
    it("should create multiple skills successfully", async () => {
      const inputs: SkillInputDTO[] = [
        { name: "TypeScript", level: "Expert" },
        { name: "React", level: "Skillfull" },
      ];

      vi.mocked(mockRepository.createMany).mockResolvedValue(mockSkills);

      const result = await skillService.createMany(inputs);

      expect(mockRepository.createMany).toHaveBeenCalledWith(inputs);
      expect(result).toEqual(mockSkills);
      expect(result).toHaveLength(2);
    });

    it("should create a single skill when array has one element", async () => {
      const inputs: SkillInputDTO[] = [{ name: "TypeScript", level: "Experienced" }];
      const created: Skill[] = [{ id: "skill-1", name: "TypeScript", level: "Experienced" }];

      vi.mocked(mockRepository.createMany).mockResolvedValue(created);

      const result = await skillService.createMany(inputs);

      expect(result).toEqual(created);
      expect(result).toHaveLength(1);
    });

    it("should propagate repository error", async () => {
      const inputs: SkillInputDTO[] = [{ name: "TypeScript", level: "Expert" }];
      const error = new Error("Database error");

      vi.mocked(mockRepository.createMany).mockRejectedValue(error);

      await expect(skillService.createMany(inputs)).rejects.toThrow("Database error");
    });
  });

  describe("findAll", () => {
    it("should return all skills", async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockSkills);

      const result = await skillService.findAll();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockSkills);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no skills exist", async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue([]);

      const result = await skillService.findAll();

      expect(result).toEqual([]);
    });

    it("should propagate repository error", async () => {
      const error = new Error("Connection error");
      vi.mocked(mockRepository.findAll).mockRejectedValue(error);

      await expect(skillService.findAll()).rejects.toThrow("Connection error");
    });
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import { SkillController } from "../../../../../src/infrastructure/modules/skill/controllers/SkillController";
import { SkillService } from "../../../../../src/application/skill/services/SkillService";
import { Skill } from "../../../../../src/domain/skill/entities/Skill";

describe("SkillController", () => {
  let skillController: SkillController;
  let mockService: SkillService;

  const mockSkills: Skill[] = [
    { id: "skill-1", name: "TypeScript", level: "Expert" },
    { id: "skill-2", name: "React", level: "Skillfull" },
  ];

  beforeEach(() => {
    mockService = {
      createMany: vi.fn(),
      findAll: vi.fn(),
    } as any;
    skillController = new SkillController(mockService);
  });

  describe("create", () => {
    it("should create skills from array body and return 201 status", async () => {
      const req = {
        body: [
          { name: "TypeScript", level: "Expert" },
          { name: "React", level: "Skillfull" },
        ],
      } as any;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
      const next = vi.fn();

      vi.mocked(mockService.createMany).mockResolvedValue(mockSkills);

      await skillController.create(req, res, next);

      expect(mockService.createMany).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ status: "success", data: mockSkills });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with error when service throws", async () => {
      const req = { body: [{ name: "TypeScript", level: "Expert" }] } as any;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
      const next = vi.fn();
      const error = new Error("Database error");

      vi.mocked(mockService.createMany).mockRejectedValue(error);

      await skillController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return all skills with 200 status", async () => {
      const req = {} as any;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
      const next = vi.fn();

      vi.mocked(mockService.findAll).mockResolvedValue(mockSkills);

      await skillController.findAll(req, res, next);

      expect(mockService.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "success", data: mockSkills });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return empty array when no skills exist", async () => {
      const req = {} as any;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
      const next = vi.fn();

      vi.mocked(mockService.findAll).mockResolvedValue([]);

      await skillController.findAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "success", data: [] });
    });

    it("should call next with error when service throws", async () => {
      const req = {} as any;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
      const next = vi.fn();
      const error = new Error("Connection error");

      vi.mocked(mockService.findAll).mockRejectedValue(error);

      await skillController.findAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});

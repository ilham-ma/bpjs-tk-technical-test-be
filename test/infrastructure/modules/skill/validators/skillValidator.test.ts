import { describe, it, expect, vi } from "vitest";
import { validationResult } from "express-validator";
import { createSkillValidator, handleValidationError } from "../../../../../src/infrastructure/modules/skill/validators/skillValidator";

const LEVELS_MESSAGE_FRAGMENT = "Basic, Intermediate, Skillfull, Experienced, Expert";

async function runValidators(req: any) {
  for (const validator of createSkillValidator) {
    await validator.run(req);
  }
}

describe("skillValidator", () => {
  describe("createSkillValidator", () => {
    it("should pass with a valid array of skills", async () => {
      const req = {
        body: [
          { name: "TypeScript", level: "Expert" },
          { name: "React", level: "Skillfull" },
        ],
      } as any;

      await runValidators(req);

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail when body is not an array", async () => {
      const req = { body: { name: "TypeScript", level: "Expert" } } as any;

      await runValidators(req);

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      expect(errs.some((e) => /must be a non-empty array/.test(e.msg))).toBe(true);
    });

    it("should fail when body is an empty array", async () => {
      const req = { body: [] } as any;

      await runValidators(req);

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      expect(errs.some((e) => /must be a non-empty array/.test(e.msg))).toBe(true);
    });

    it("should fail when an item has missing name", async () => {
      const req = { body: [{ level: "Expert" }] } as any;

      await runValidators(req);

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const nameError = errs.find((e) => /name/.test(e.path) && /required/.test(e.msg));
      expect(nameError).toBeDefined();
    });

    it("should fail when an item has empty name", async () => {
      const req = { body: [{ name: "", level: "Expert" }] } as any;

      await runValidators(req);

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const nameError = errs.find((e) => /name/.test(e.path));
      expect(nameError?.msg).toContain("skill name is required");
    });

    it("should fail when an item name exceeds 255 characters", async () => {
      const req = { body: [{ name: "a".repeat(256), level: "Expert" }] } as any;

      await runValidators(req);

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const nameError = errs.find((e) => /name/.test(e.path));
      expect(nameError?.msg).toContain("skill name must not exceed 255 characters");
    });

    it("should trim whitespace from name", async () => {
      const req = { body: [{ name: "  TypeScript  ", level: "Expert" }] } as any;

      await runValidators(req);

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
      expect(req.body[0].name).toBe("TypeScript");
    });

    it("should fail when an item has missing level", async () => {
      const req = { body: [{ name: "TypeScript" }] } as any;

      await runValidators(req);

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const levelError = errs.find((e) => /level/.test(e.path));
      expect(levelError?.msg).toContain(LEVELS_MESSAGE_FRAGMENT);
    });

    it("should fail when an item has invalid level", async () => {
      const req = { body: [{ name: "TypeScript", level: "InvalidLevel" }] } as any;

      await runValidators(req);

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const levelError = errs.find((e) => /level/.test(e.path));
      expect(levelError?.msg).toContain(LEVELS_MESSAGE_FRAGMENT);
    });

    it("should pass with all valid SkillLevel values", async () => {
      const levels = ["Basic", "Intermediate", "Skillfull", "Experienced", "Expert"];
      const req = {
        body: levels.map((level) => ({ name: "TypeScript", level })),
      } as any;

      await runValidators(req);

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should report errors for the specific invalid item only", async () => {
      const req = {
        body: [
          { name: "TypeScript", level: "Expert" },
          { name: "", level: "Expert" },
          { name: "React", level: "InvalidLevel" },
        ],
      } as any;

      await runValidators(req);

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      expect(errs.some((e) => e.path === "[1].name")).toBe(true);
      expect(errs.some((e) => e.path === "[2].level")).toBe(true);
      expect(errs.some((e) => e.path === "[0].name" || e.path === "[0].level")).toBe(false);
    });
  });

  describe("handleValidationError", () => {
    it("should call next when no validation errors", async () => {
      const req = { body: [{ name: "TypeScript", level: "Expert" }] } as any;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
      const next = vi.fn();

      await runValidators(req);
      handleValidationError(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should respond 400 with errors when validation fails", async () => {
      const req = { body: [{ name: "", level: "Bad" }] } as any;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
      const next = vi.fn();

      await runValidators(req);
      handleValidationError(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Validation failed",
          errors: expect.any(Array),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});

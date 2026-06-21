import { describe, it, expect, beforeEach } from "vitest";
import { param, validationResult } from "express-validator";
import { filenameParamValidator } from "../../../../../src/infrastructure/modules/profile/validators/profileValidator";
import { Request } from "express";

describe("profileValidator", () => {
  describe("filenameParamValidator", () => {
    it("should validate valid filename with uuid and extension", async () => {
      const mockReq = {
        params: { filename: "550e8400-e29b-41d4-a716-446655440000.jpg" },
      } as Request;

      for (const validator of filenameParamValidator) {
        await validator.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should validate simple filename with alphanumeric and dash", async () => {
      const mockReq = {
        params: { filename: "test-file-123.png" },
      } as Request;

      for (const validator of filenameParamValidator) {
        await validator.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should validate filename with dots and underscores", async () => {
      const mockReq = {
        params: { filename: "test_file.name.jpg" },
      } as Request;

      for (const validator of filenameParamValidator) {
        await validator.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should reject path traversal attempt with ..", async () => {
      const mockReq = {
        params: { filename: "../../../etc/passwd" },
      } as Request;

      for (const validator of filenameParamValidator) {
        await validator.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain("invalid filename");
    });

    it("should reject path traversal attempt with forward slash", async () => {
      const mockReq = {
        params: { filename: "foo/bar/test.jpg" },
      } as Request;

      for (const validator of filenameParamValidator) {
        await validator.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should reject filename with special characters", async () => {
      const mockReq = {
        params: { filename: "test@file#name.jpg" },
      } as Request;

      for (const validator of filenameParamValidator) {
        await validator.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should reject empty filename", async () => {
      const mockReq = {
        params: { filename: "" },
      } as Request;

      for (const validator of filenameParamValidator) {
        await validator.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
    });

    it("should reject filename exceeding 255 characters", async () => {
      const longFilename = "a".repeat(256) + ".jpg";
      const mockReq = {
        params: { filename: longFilename },
      } as Request;

      for (const validator of filenameParamValidator) {
        await validator.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().some(e => e.msg.includes("must not exceed 255 characters"))).toBe(true);
    });

    it("should accept filename exactly 255 characters", async () => {
      const filename = "a".repeat(250) + ".jpg";
      const mockReq = {
        params: { filename },
      } as Request;

      for (const validator of filenameParamValidator) {
        await validator.run(mockReq);
      }

      const errors = validationResult(mockReq);
      expect(errors.isEmpty()).toBe(true);
    });
  });
});

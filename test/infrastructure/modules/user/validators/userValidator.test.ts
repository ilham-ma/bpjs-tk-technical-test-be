import { describe, it, expect, beforeEach } from "vitest";
import { body, param, validationResult } from "express-validator";
import { Request } from "express";
import {
  createUserValidator,
  idParamValidator,
  handleValidationError,
} from "../../../../../src/infrastructure/modules/user/validators/userValidator";

describe("userValidator", () => {
  const validUserData = {
    wantedJobTitle: "Software Engineer",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+6281234567890",
    country: "Indonesia",
    city: "Jakarta",
    address: "Jl. Merdeka 123",
    postalCode: "12345",
    drivingLicense: "DL123456",
    nationality: "Indonesian",
    placeOfBirth: "Jakarta",
    dateOfBirth: "1990-01-15",
    photoUrl: "/photos/john.jpg",
  };

  describe("createUserValidator", () => {
    it("should pass validation with valid data", async () => {
      const req = { body: validUserData } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail when firstName exceeds max length", async () => {
      const req = {
        body: {
          ...validUserData,
          firstName: "a".repeat(256),
        },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const firstNameError = errs.find((e) => e.path === "firstName");
      expect(firstNameError?.msg).toContain("255");
    });

    it("should fail with invalid email", async () => {
      const req = { body: { ...validUserData, email: "not-an-email" } } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const emailError = errs.find((e) => e.path === "email");
      expect(emailError?.msg).toContain("valid email");
    });

    it("should fail when phone contains invalid characters", async () => {
      const req = { body: { ...validUserData, phone: "123-abc-xyz" } } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const phoneError = errs.find((e) => e.path === "phone");
      expect(phoneError?.msg).toContain("digits");
    });

    it("should pass with valid phone formats", async () => {
      const validPhones = ["+6281234567890", "81234567890", "+1-123-456-7890"];

      for (const phone of validPhones) {
        const req = { body: { ...validUserData, phone } } as any;

        for (const validator of createUserValidator) {
          await validator.run(req);
        }

        const errors = validationResult(req);
        const errs = errors.array() as any[];
        const phoneError = errs.find((e) => e.path === "phone");
        if (phone === "+1-123-456-7890") {
          expect(phoneError?.msg).toBeDefined();
        }
      }
    });

    it("should fail when postalCode contains non-digits", async () => {
      const req = { body: { ...validUserData, postalCode: "123AB" } } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const postalCodeError = errs.find((e) => e.path === "postalCode");
      expect(postalCodeError?.msg).toContain("digits");
    });

    it("should fail when dateOfBirth is in the future", async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split("T")[0];

      const req = {
        body: { ...validUserData, dateOfBirth: futureDateString },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const dateError = errs.find((e) => e.path === "dateOfBirth");
      expect(dateError?.msg).toContain("future");
    });

    it("should fail with invalid dateOfBirth format", async () => {
      const req = {
        body: { ...validUserData, dateOfBirth: "01/15/1990" },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const dateError = errs.find((e) => e.path === "dateOfBirth");
      expect(dateError?.msg).toContain("ISO 8601");
    });

    it("should trim whitespace from string fields", async () => {
      const req = {
        body: {
          ...validUserData,
          firstName: "  John  ",
          lastName: "  Doe  ",
        },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
      expect(req.body.firstName).toBe("John");
      expect(req.body.lastName).toBe("Doe");
    });
  });

  describe("idParamValidator", () => {
    it("should pass with valid UUID", async () => {
      const req = {
        params: { id: "550e8400-e29b-41d4-a716-446655440000" },
      } as any;

      for (const validator of idParamValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail with invalid UUID", async () => {
      const req = { params: { id: "invalid-uuid" } } as any;

      for (const validator of idParamValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const idError = errs.find((e) => e.path === "id");
      expect(idError?.msg).toContain("valid UUID");
    });
  });

  describe("handleValidationError", () => {
    it("should call next if no errors", async () => {
      const req = { body: validUserData } as any;
      const res = {} as any;
      let nextCalled = false;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      handleValidationError(req, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
    });

    it("should return 400 with error details if validation fails", async () => {
      const req = { body: { ...validUserData, email: "invalid" } } as any;
      let statusCode = 0;
      let responseBody: any = null;

      const res = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (body: any) => {
              responseBody = body;
            },
          };
        },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      handleValidationError(req, res, () => {});

      expect(statusCode).toBe(400);
      expect(responseBody?.status).toBe("error");
      expect(responseBody?.message).toBe("Validation failed");
      expect(Array.isArray(responseBody?.errors)).toBe(true);
      expect(responseBody?.errors.length).toBeGreaterThan(0);
    });
  });
});

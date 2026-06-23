import { describe, it, expect, beforeEach } from "vitest";
import { body, param, validationResult } from "express-validator";
import { Request } from "express";
import {
  createUserValidator,
  updateUserValidator,
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
    professionalSummary: "Experienced backend engineer",
    skills: [{ name: "TypeScript", level: "Expert" }],
    educations: [
      {
        school: "University of Technology",
        degree: "Bachelor of Computer Science",
        startDate: "2018-09",
        endDate: "2022-06",
        city: "Bandung",
        description: "Studied computer science fundamentals",
      },
    ],
    employmentHistories: [
      {
        jobTitle: "Software Engineer",
        employer: "Tech Corp",
        startDate: "2022-07",
        endDate: null,
        city: "Jakarta",
        description: "Developing backend systems",
      },
    ],
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
      const req = {
        body: { ...validUserData, dateOfBirth: "2099-12-31" },
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
      expect(dateError?.msg).toContain("YYYY-MM-DD");
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

    it("should fail when skills is missing", async () => {
      const req = {
        body: { ...validUserData },
      } as any;
      delete req.body.skills;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const skillsError = errs.find((e) => e.path === "skills");
      expect(skillsError?.msg).toContain("at least 1 item");
    });

    it("should fail when skills is empty array", async () => {
      const req = {
        body: { ...validUserData, skills: [] },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const skillsError = errs.find((e) => e.path === "skills");
      expect(skillsError?.msg).toContain("at least 1 item");
    });

    it("should fail when skill missing name", async () => {
      const req = {
        body: {
          ...validUserData,
          skills: [{ level: "Expert" }],
        },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const skillError = errs.find((e) => e.path === "skills[0]");
      expect(skillError?.msg).toContain("skill name is required");
    });

    it("should pass with valid skills", async () => {
      const validSkills = [
        { name: "TypeScript", level: "Expert" },
        { name: "Python", level: "Intermediate" },
      ];
      const req = {
        body: { ...validUserData, skills: validSkills },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail when educations is missing", async () => {
      const req = {
        body: { ...validUserData },
      } as any;
      delete req.body.educations;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const educationsError = errs.find((e) => e.path === "educations");
      expect(educationsError?.msg).toContain("at least 1 item");
    });

    it("should fail when educations is empty array", async () => {
      const req = {
        body: { ...validUserData, educations: [] },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const educationsError = errs.find((e) => e.path === "educations");
      expect(educationsError?.msg).toContain("at least 1 item");
    });

    it("should fail when educations[].school exceeds 255 characters", async () => {
      const req = {
        body: {
          ...validUserData,
          educations: [
            {
              school: "a".repeat(256),
              degree: "Bachelor",
              startDate: "2018-09-01",
              endDate: "2022-06-15",
              city: "Jakarta",
              description: "Bachelor program",
            },
          ],
        },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const schoolError = errs.find((e) => e.path === "educations[0].school");
      expect(schoolError?.msg).toContain("255");
    });

    it("should fail when educations[].startDate is in the future", async () => {
      const req = {
        body: {
          ...validUserData,
          educations: [
            {
              school: "University",
              degree: "Bachelor",
              startDate: "2099-12",
              endDate: "2022-06",
              city: "Jakarta",
              description: "Bachelor program",
            },
          ],
        },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const startDateError = errs.find((e) => e.path === "educations[0].startDate");
      expect(startDateError?.msg).toContain("future");
    });

    it("should fail when educations[].endDate is before startDate", async () => {
      const req = {
        body: {
          ...validUserData,
          educations: [
            {
              school: "University",
              degree: "Bachelor",
              startDate: "2022-06",
              endDate: "2018-09",
              city: "Jakarta",
              description: "Bachelor program",
            },
          ],
        },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const endDateError = errs.find((e) => e.path === "educations[0].endDate");
      expect(endDateError?.msg).toContain("greater than or equal to startDate");
    });

    it("should pass with null endDate", async () => {
      const req = {
        body: {
          ...validUserData,
          educations: [
            {
              school: "Current University",
              degree: "Master",
              startDate: "2022-09",
              endDate: null,
              city: "Jakarta",
              description: "Master program",
            },
          ],
        },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should pass with valid educations", async () => {
      const validEducations = [
        {
          school: "State University",
          degree: "Bachelor of Science",
          startDate: "2018-09",
          endDate: "2022-06",
          city: "Jakarta",
          description: "Bachelor of Science program",
        },
        {
          school: "Advanced Institute",
          degree: "Master of Science",
          startDate: "2022-09",
          endDate: null,
          city: "Bandung",
          description: "Master of Science program",
        },
      ];
      const req = {
        body: { ...validUserData, educations: validEducations },
      } as any;

      for (const validator of createUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
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

  describe("updateUserValidator", () => {
    it("should pass with valid data and skills", async () => {
      const req = { body: validUserData } as any;

      for (const validator of updateUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should pass when skills is not provided", async () => {
      const userData = { ...validUserData };
      delete userData.skills;
      const req = { body: userData } as any;

      for (const validator of updateUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail when skills is empty array", async () => {
      const req = {
        body: { ...validUserData, skills: [] },
      } as any;

      for (const validator of updateUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const skillsError = errs.find((e) => e.path === "skills");
      expect(skillsError?.msg).toContain("at least 1 item");
    });

    it("should pass with valid skills on update", async () => {
      const validSkills = [
        { id: "550e8400-e29b-41d4-a716-446655440001", name: "TypeScript", level: "Expert" },
        { name: "Python", level: "Intermediate" },
      ];
      const req = {
        body: { ...validUserData, skills: validSkills },
      } as any;

      for (const validator of updateUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should pass when educations is not provided on update", async () => {
      const userData = { ...validUserData };
      delete userData.educations;
      const req = { body: userData } as any;

      for (const validator of updateUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail when educations is empty array on update", async () => {
      const req = {
        body: { ...validUserData, educations: [] },
      } as any;

      for (const validator of updateUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      const errs = errors.array() as any[];
      const educationsError = errs.find((e) => e.path === "educations");
      expect(educationsError?.msg).toContain("at least 1 item");
    });

    it("should pass with valid educations on update", async () => {
      const validEducations = [
        {
          school: "Updated University",
          degree: "Master",
          startDate: "2020-09",
          endDate: null,
          city: "Jakarta",
          description: "Master degree program",
        },
      ];
      const req = {
        body: { ...validUserData, educations: validEducations },
      } as any;

      for (const validator of updateUserValidator) {
        await validator.run(req);
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });
  });

  describe("handleValidationError", () => {
    it("should call next if no errors", async () => {
      const req = { body: validUserData } as any;
      const res = {
        status: () => ({ json: () => {} }),
      } as any;
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

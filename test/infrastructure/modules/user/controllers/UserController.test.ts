import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserController } from "../../../../../src/infrastructure/modules/user/controllers/UserController";
import { UserService } from "../../../../../src/application/user/services/UserService";
import { AppError } from "../../../../../src/shared/errors/AppError";
import { User } from "../../../../../src/domain/user/entities/User";
import { Request, Response, NextFunction } from "express";

describe("UserController", () => {
  let userController: UserController;
  let mockUserService: UserService;

  const mockUser: User = {
    id: "550e8400-e29b-41d4-a716-446655440000",
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
    dateOfBirth: new Date("1990-01-15"),
    photoUrl: "/photos/john.jpg",
    professionalSummary: "Experienced backend engineer",
    createdAt: new Date(),
    updatedAt: new Date(),
    skills: [],
    educations: [],
  };

  beforeEach(() => {
    mockUserService = {
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    } as any;
    userController = new UserController(mockUserService);
  });

  describe("create", () => {
    it("should return 201 with user data on successful creation", async () => {
      const req = {
        body: {
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
              startDate: "2018-09-01",
              endDate: "2022-06-15",
              city: "Bandung",
              description: "Studied computer science fundamentals",
            },
          ],
        },
      } as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      vi.mocked(mockUserService.create).mockResolvedValue(mockUser);

      await userController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUser,
      });
    });

    it("should pass error to next middleware on service error", async () => {
      const req = {
        body: {
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
        },
      } as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      const error = new AppError("Email already registered", 409);
      vi.mocked(mockUserService.create).mockRejectedValue(error);

      await userController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("update", () => {
    it("should return 200 with user data on successful update", async () => {
      const req = {
        params: { id: mockUser.id },
        body: {
          wantedJobTitle: "Senior Software Engineer",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "+6281234567890",
          country: "Indonesia",
          city: "Jakarta",
          address: "Jl. Merdeka 456",
          postalCode: "12345",
          drivingLicense: "DL123456",
          nationality: "Indonesian",
          placeOfBirth: "Jakarta",
          dateOfBirth: "1990-01-15",
          photoUrl: "/photos/john-updated.jpg",
          professionalSummary: "Senior backend engineer",
          skills: [{ id: "skill-1", name: "React", level: "Intermediate" }],
          educations: [
            {
              id: "edu-1",
              school: "Advanced Institute",
              degree: "Master of Science",
              startDate: "2022-09",
              endDate: null,
              city: "Jakarta",
              description: "Currently pursuing master degree",
            },
          ],
        },
      } as any as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      const updatedUser = {
        ...mockUser,
        wantedJobTitle: "Senior Software Engineer",
      };
      vi.mocked(mockUserService.update).mockResolvedValue(updatedUser);

      await userController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: updatedUser,
      });
    });

    it("should pass error to next middleware on service error", async () => {
      const req = {
        params: { id: "invalid-id" },
        body: {
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
        },
      } as any as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      const error = new AppError("User not found", 404);
      vi.mocked(mockUserService.update).mockRejectedValue(error);

      await userController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it("should pass dateOfBirth string as-is to service", async () => {
      const req = {
        params: { id: mockUser.id },
        body: {
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
        },
      } as any as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      vi.mocked(mockUserService.update).mockResolvedValue(mockUser);

      await userController.update(req, res, next);

      const callArgs = vi.mocked(mockUserService.update).mock.calls[0];
      expect(callArgs[1].dateOfBirth).toBe(req.body.dateOfBirth);
    });
  });

  describe("findById", () => {
    it("should return 200 with user data on successful find", async () => {
      const req = {
        params: { id: mockUser.id },
      } as any as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      vi.mocked(mockUserService.findById).mockResolvedValue(mockUser);

      await userController.findById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUser,
      });
    });

    it("should pass error to next middleware on service error", async () => {
      const req = {
        params: { id: "invalid-id" },
      } as any as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      const error = new AppError("User not found", 404);
      vi.mocked(mockUserService.findById).mockRejectedValue(error);

      await userController.findById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("findAll", () => {
    it("should return 200 with array of users", async () => {
      const req = {} as any as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      const users = [mockUser];
      vi.mocked(mockUserService.findAll).mockResolvedValue(users);

      await userController.findAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: users,
      });
    });

    it("should return 200 with empty array when no users exist", async () => {
      const req = {} as any as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      vi.mocked(mockUserService.findAll).mockResolvedValue([]);

      await userController.findAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        data: [],
      });
    });

    it("should call userService.findAll", async () => {
      const req = {} as any as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      const users = [mockUser];
      vi.mocked(mockUserService.findAll).mockResolvedValue(users);

      await userController.findAll(req, res, next);

      expect(mockUserService.findAll).toHaveBeenCalled();
    });

    it("should return multiple users with relations", async () => {
      const req = {} as any as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      const user1 = {
        ...mockUser,
        id: "id-1",
        skills: [{ id: "skill-1", name: "TypeScript", level: "Expert", userId: "id-1" }],
        educations: [{ id: "edu-1", school: "MIT", degree: "BS", startDate: new Date(), endDate: new Date(), city: "Cambridge", description: "BS program", userId: "id-1" }],
        employmentHistories: [{ id: "emp-1", jobTitle: "Engineer", employer: "Company", startDate: new Date(), endDate: null, city: "NYC", description: "Work", userId: "id-1" }],
      };
      const user2 = {
        ...mockUser,
        id: "id-2",
        skills: [],
        educations: [],
        employmentHistories: [],
      };
      const users = [user1, user2];
      vi.mocked(mockUserService.findAll).mockResolvedValue(users);

      await userController.findAll(req, res, next);

      const callArgs = vi.mocked(res.json).mock.calls[0][0];
      expect(callArgs.data).toHaveLength(2);
      expect(callArgs.data[0].skills).toHaveLength(1);
      expect(callArgs.data[0].educations).toHaveLength(1);
      expect(callArgs.data[0].employmentHistories).toHaveLength(1);
    });

    it("should pass error to next middleware on service error", async () => {
      const req = {} as any as Request;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any as Response;

      const next = vi.fn() as NextFunction;

      const error = new Error("Database error");
      vi.mocked(mockUserService.findAll).mockRejectedValue(error);

      await userController.findAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

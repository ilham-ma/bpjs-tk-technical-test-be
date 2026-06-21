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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUserService = {
      create: vi.fn(),
      update: vi.fn(),
      findById: vi.fn(),
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

    it("should convert dateOfBirth string to Date", async () => {
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
      expect(callArgs[1].dateOfBirth).toBeInstanceOf(Date);
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
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "../../../../src/application/user/services/UserService";
import { IUserRepository } from "../../../../src/domain/user/repositories/IUserRepository";
import { CreateUserDTO } from "../../../../src/application/user/dtos/CreateUserDTO";
import { UpdateUserDTO } from "../../../../src/application/user/dtos/UpdateUserDTO";
import { AppError } from "../../../../src/shared/errors/AppError";
import { User } from "../../../../src/domain/user/entities/User";

describe("UserService", () => {
  let userService: UserService;
  let mockRepository: IUserRepository;

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
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    userService = new UserService(mockRepository);
  });

  describe("create", () => {
    it("should create user successfully", async () => {
      const dto: CreateUserDTO = {
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
      };

      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.create).mockResolvedValue(mockUser);

      const result = await userService.create(dto);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });

    it("should throw error if email already exists", async () => {
      const dto: CreateUserDTO = {
        wantedJobTitle: "Software Engineer",
        firstName: "Jane",
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
        photoUrl: "/photos/jane.jpg",
      };

      vi.mocked(mockRepository.findByEmail).mockResolvedValue(mockUser);

      try {
        await userService.create(dto);
        expect.fail("Should have thrown error");
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).message).toBe("Email already registered");
        expect((err as AppError).statusCode).toBe(409);
      }
    });
  });

  describe("update", () => {
    it("should update user successfully", async () => {
      const userId = mockUser.id;
      const dto: UpdateUserDTO = {
        wantedJobTitle: "Senior Software Engineer",
        firstName: "John",
        lastName: "Doe",
        email: "john.new@example.com",
        phone: "+6281234567890",
        country: "Indonesia",
        city: "Jakarta",
        address: "Jl. Merdeka 456",
        postalCode: "12345",
        drivingLicense: "DL123456",
        nationality: "Indonesian",
        placeOfBirth: "Jakarta",
        dateOfBirth: new Date("1990-01-15"),
        photoUrl: "/photos/john-updated.jpg",
      };

      const updatedUser = { ...mockUser, ...dto };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedUser);

      const result = await userService.update(userId, dto);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockRepository.update).toHaveBeenCalledWith(userId, dto);
    });

    it("should throw error if user not found", async () => {
      const userId = "invalid-id";
      const dto: UpdateUserDTO = {
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
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      try {
        await userService.update(userId, dto);
        expect.fail("Should have thrown error");
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).message).toBe("User not found");
        expect((err as AppError).statusCode).toBe(404);
      }
    });

    it("should throw error if new email already exists", async () => {
      const userId = mockUser.id;
      const dto: UpdateUserDTO = {
        wantedJobTitle: "Senior Software Engineer",
        firstName: "John",
        lastName: "Doe",
        email: "existing@example.com",
        phone: "+6281234567890",
        country: "Indonesia",
        city: "Jakarta",
        address: "Jl. Merdeka 456",
        postalCode: "12345",
        drivingLicense: "DL123456",
        nationality: "Indonesian",
        placeOfBirth: "Jakarta",
        dateOfBirth: new Date("1990-01-15"),
        photoUrl: "/photos/john-updated.jpg",
      };

      const existingUser = { ...mockUser, email: "existing@example.com" };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser);

      try {
        await userService.update(userId, dto);
        expect.fail("Should have thrown error");
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).message).toBe("Email already registered");
        expect((err as AppError).statusCode).toBe(409);
      }
    });

    it("should not check email uniqueness if email unchanged", async () => {
      const userId = mockUser.id;
      const dto: UpdateUserDTO = {
        wantedJobTitle: "Senior Software Engineer",
        firstName: "John",
        lastName: "Doe",
        email: mockUser.email,
        phone: "+6287654321098",
        country: "Malaysia",
        city: "Kuala Lumpur",
        address: "Jl. Merdeka 456",
        postalCode: "54321",
        drivingLicense: "DL789012",
        nationality: "Indonesian",
        placeOfBirth: "Jakarta",
        dateOfBirth: new Date("1990-01-15"),
        photoUrl: "/photos/john-updated.jpg",
      };

      const updatedUser = { ...mockUser, ...dto };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedUser);

      const result = await userService.update(userId, dto);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      const userId = mockUser.id;
      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);

      const result = await userService.findById(userId);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
    });

    it("should throw error if user not found", async () => {
      const userId = "invalid-id";
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      try {
        await userService.findById(userId);
        expect.fail("Should have thrown error");
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect((err as AppError).message).toBe("User not found");
        expect((err as AppError).statusCode).toBe(404);
      }
    });
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "../../../../src/application/user/services/UserService";
import { IUserRepository } from "../../../../src/domain/user/repositories/IUserRepository";
import { ISkillRepository } from "../../../../src/domain/skill/repositories/ISkillRepository";
import { CreateUserDTO } from "../../../../src/application/user/dtos/CreateUserDTO";
import { UpdateUserDTO } from "../../../../src/application/user/dtos/UpdateUserDTO";
import { AppError } from "../../../../src/shared/errors/AppError";
import { User } from "../../../../src/domain/user/entities/User";

describe("UserService", () => {
  let userService: UserService;
  let mockRepository: IUserRepository;
  let mockSkillRepository: ISkillRepository;

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
    skills: [],
  };

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    mockSkillRepository = {
      replaceForUser: vi.fn(),
      findByUserId: vi.fn(),
    };
    userService = new UserService(mockRepository, mockSkillRepository);
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
        skills: [{ name: "TypeScript", level: "Expert" }],
      };

      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.create).mockResolvedValue({
        ...mockUser,
        skills: [],
      });
      vi.mocked(mockSkillRepository.replaceForUser).mockResolvedValue(
        dto.skills.map((skill, idx) => ({
          id: `skill-${idx}`,
          ...skill,
          userId: mockUser.id,
        }))
      );

      const result = await userService.create(dto);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockSkillRepository.replaceForUser).toHaveBeenCalledWith(
        mockUser.id,
        dto.skills
      );
      expect(result.skills).toHaveLength(1);
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
    it("should update user successfully with skills", async () => {
      const userId = mockUser.id;
      const skills = [{ name: "React", level: "Intermediate" }];
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
        skills,
      };

      const updatedUser = {
        ...mockUser,
        wantedJobTitle: dto.wantedJobTitle,
        email: dto.email,
        address: dto.address,
        skills: [],
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.update).mockResolvedValue({
        ...updatedUser,
        skills: [],
      });
      vi.mocked(mockSkillRepository.replaceForUser).mockResolvedValue(
        skills.map((skill, idx) => ({
          id: `skill-${idx}`,
          ...skill,
          userId,
        }))
      );

      const result = await userService.update(userId, dto);

      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockSkillRepository.replaceForUser).toHaveBeenCalledWith(userId, skills);
      expect(result.skills).toHaveLength(1);
    });

    it("should update user without modifying skills when skills undefined", async () => {
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

      const updatedUser = { ...mockUser, ...dto, skills: mockUser.skills };

      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.update).mockResolvedValue({
        ...updatedUser,
        skills: [],
      });
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(updatedUser);

      const result = await userService.update(userId, dto);

      expect(mockSkillRepository.replaceForUser).not.toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
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

      const updatedUserData = {
        ...mockUser,
        wantedJobTitle: dto.wantedJobTitle,
        phone: dto.phone,
        country: dto.country,
        city: dto.city,
        address: dto.address,
        postalCode: dto.postalCode,
        drivingLicense: dto.drivingLicense,
        photoUrl: dto.photoUrl,
      };

      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockUser);
      vi.mocked(mockRepository.update).mockResolvedValue({
        ...updatedUserData,
        skills: [],
      });
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(updatedUserData);

      const result = await userService.update(userId, dto);

      expect(result).toEqual(updatedUserData);
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

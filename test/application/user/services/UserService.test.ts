import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "../../../../src/application/user/services/UserService";
import { IUserRepository } from "../../../../src/domain/user/repositories/IUserRepository";
import { ISkillRepository } from "../../../../src/domain/skill/repositories/ISkillRepository";
import { IEducationRepository } from "../../../../src/domain/education/repositories/IEducationRepository";
import { CreateUserDTO } from "../../../../src/application/user/dtos/CreateUserDTO";
import { UpdateUserDTO } from "../../../../src/application/user/dtos/UpdateUserDTO";
import { AppError } from "../../../../src/shared/errors/AppError";
import { User } from "../../../../src/domain/user/entities/User";

describe("UserService", () => {
  let userService: UserService;
  let mockRepository: IUserRepository;
  let mockSkillRepository: ISkillRepository;
  let mockEducationRepository: IEducationRepository;

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
    educations: [],
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
    mockEducationRepository = {
      replaceForUser: vi.fn(),
      findByUserId: vi.fn(),
    };
    userService = new UserService(mockRepository, mockSkillRepository, mockEducationRepository);
  });

  describe("create", () => {
    it("should create user successfully with skills and educations", async () => {
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
        educations: [
          {
            school: "University of Technology",
            degree: "Bachelor of Computer Science",
            startDate: new Date("2018-09-01"),
            endDate: new Date("2022-06-15"),
          },
        ],
      };

      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.create).mockResolvedValue({
        ...mockUser,
        skills: [],
        educations: [],
      });
      vi.mocked(mockSkillRepository.replaceForUser).mockResolvedValue(
        dto.skills.map((skill, idx) => ({
          id: `skill-${idx}`,
          ...skill,
          userId: mockUser.id,
        }))
      );
      vi.mocked(mockEducationRepository.replaceForUser).mockResolvedValue(
        dto.educations.map((edu, idx) => ({
          id: `education-${idx}`,
          ...edu,
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
      expect(mockEducationRepository.replaceForUser).toHaveBeenCalledWith(
        mockUser.id,
        dto.educations
      );
      expect(result.skills).toHaveLength(1);
      expect(result.educations).toHaveLength(1);
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
        skills: [{ name: "Java", level: "Intermediate" }],
        educations: [
          {
            school: "State University",
            degree: "Master of Science",
            startDate: new Date("2020-09-01"),
            endDate: new Date("2022-06-15"),
          },
        ],
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
    it("should update user successfully with skills and educations", async () => {
      const userId = mockUser.id;
      const skills = [{ name: "React", level: "Intermediate" }];
      const educations = [
        {
          school: "Advanced Institute",
          degree: "Master of Science",
          startDate: new Date("2022-09-01"),
          endDate: null,
        },
      ];
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
        educations,
      };

      const updatedUser = {
        ...mockUser,
        wantedJobTitle: dto.wantedJobTitle,
        email: dto.email,
        address: dto.address,
        skills: [],
        educations: [],
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.update).mockResolvedValue({
        ...updatedUser,
        skills: [],
        educations: [],
      });
      vi.mocked(mockSkillRepository.replaceForUser).mockResolvedValue(
        skills.map((skill, idx) => ({
          id: `skill-${idx}`,
          ...skill,
          userId,
        }))
      );
      vi.mocked(mockEducationRepository.replaceForUser).mockResolvedValue(
        educations.map((edu, idx) => ({
          id: `education-${idx}`,
          ...edu,
          userId,
        }))
      );

      const result = await userService.update(userId, dto);

      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockSkillRepository.replaceForUser).toHaveBeenCalledWith(userId, skills);
      expect(mockEducationRepository.replaceForUser).toHaveBeenCalledWith(userId, educations);
      expect(result.skills).toHaveLength(1);
      expect(result.educations).toHaveLength(1);
    });

    it("should update user without modifying skills and educations when undefined", async () => {
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

      const updatedUser = {
        ...mockUser,
        ...dto,
        skills: mockUser.skills,
        educations: mockUser.educations,
      };

      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.update).mockResolvedValue({
        ...updatedUser,
        skills: [],
        educations: [],
      });

      const result = await userService.update(userId, dto);

      expect(mockSkillRepository.replaceForUser).not.toHaveBeenCalled();
      expect(mockEducationRepository.replaceForUser).not.toHaveBeenCalled();
      expect(result.skills).toEqual(mockUser.skills);
      expect(result.educations).toEqual(mockUser.educations);
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
        skills: [{ name: "TypeScript", level: "Expert" }],
        educations: [
          {
            school: "University",
            degree: "Bachelor",
            startDate: new Date("2018-09-01"),
            endDate: new Date("2022-06-15"),
          },
        ],
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
        skills: [{ name: "React", level: "Intermediate" }],
        educations: [
          {
            school: "State University",
            degree: "Bachelor",
            startDate: new Date("2018-09-01"),
            endDate: new Date("2022-06-15"),
          },
        ],
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
        skills: mockUser.skills,
        educations: mockUser.educations,
      };

      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockUser);
      vi.mocked(mockRepository.update).mockResolvedValue({
        ...updatedUserData,
        skills: [],
        educations: [],
      });

      const result = await userService.update(userId, dto);

      expect(result.skills).toEqual(mockUser.skills);
      expect(result.educations).toEqual(mockUser.educations);
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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserService } from "../../../../src/application/user/services/UserService";
import { IUserRepository } from "../../../../src/domain/user/repositories/IUserRepository";
import { ISkillRepository } from "../../../../src/domain/skill/repositories/ISkillRepository";
import { IEducationRepository } from "../../../../src/domain/education/repositories/IEducationRepository";
import { IEmploymentHistoryRepository } from "../../../../src/domain/employment-history/repositories/IEmploymentHistoryRepository";
import { IFileStorageService } from "../../../../src/domain/profile/services/IFileStorageService";
import { CreateUserDTO } from "../../../../src/application/user/dtos/CreateUserDTO";
import { UpdateUserDTO } from "../../../../src/application/user/dtos/UpdateUserDTO";
import { AppError } from "../../../../src/shared/errors/AppError";
import { User } from "../../../../src/domain/user/entities/User";

describe("UserService", () => {
  let userService: UserService;
  let mockRepository: IUserRepository;
  let mockSkillRepository: ISkillRepository;
  let mockEducationRepository: IEducationRepository;
  let mockEmploymentHistoryRepository: IEmploymentHistoryRepository;
  let mockFileStorage: IFileStorageService;

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
    employmentHistories: [],
  };

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
    };
    mockSkillRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      findManyByIds: vi.fn(),
      syncUserSkills: vi.fn(),
      findByUserId: vi.fn(),
    };
    mockEducationRepository = {
      syncForUser: vi.fn(),
      findIdsByUserId: vi.fn(),
      findByUserId: vi.fn(),
    };
    mockEmploymentHistoryRepository = {
      syncForUser: vi.fn(),
      findIdsByUserId: vi.fn(),
      findByUserId: vi.fn(),
    };
    mockFileStorage = {
      save: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      getAbsolutePath: vi.fn(),
      exists: vi.fn(),
    };
    userService = new UserService(mockRepository, mockSkillRepository, mockEducationRepository, mockEmploymentHistoryRepository, mockFileStorage);
  });

  describe("create", () => {
    it("should create user successfully with skills, educations, and employment histories", async () => {
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
        dateOfBirth: "1990-01-15",
        photoUrl: "/photos/john.jpg",
        professionalSummary: "Experienced backend engineer",
        skills: [{ name: "TypeScript", level: "Expert" }],
        educations: [
          {
            school: "University of Technology",
            degree: "Bachelor of Computer Science",
            startDate: "2018-sep",
            endDate: "2022-jun",
            city: "Bandung",
            description: "Studied computer science fundamentals",
          },
        ],
        employmentHistories: [
          {
            jobTitle: "Software Engineer",
            employer: "Tech Corp",
            startDate: "2022-jul",
            endDate: null,
            city: "Jakarta",
            description: "Developing backend systems",
          },
        ],
      };

      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.create).mockResolvedValue({
        ...mockUser,
        skills: [],
        educations: [],
        employmentHistories: [],
      });
      vi.mocked(mockSkillRepository.syncUserSkills).mockResolvedValue([
        { id: "skill-1", name: "TypeScript", level: "Expert" },
      ]);
      vi.mocked(mockEducationRepository.syncForUser).mockResolvedValue(
        dto.educations.map((edu, idx) => ({
          id: `education-${idx}`,
          ...edu,
          userId: mockUser.id,
        }))
      );
      vi.mocked(mockEmploymentHistoryRepository.syncForUser).mockResolvedValue(
        dto.employmentHistories.map((eh, idx) => ({
          id: `employment-${idx}`,
          ...eh,
          userId: mockUser.id,
        }))
      );

      const result = await userService.create(dto);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockSkillRepository.syncUserSkills).toHaveBeenCalledWith(
        mockUser.id,
        dto.skills
      );
      expect(mockEducationRepository.syncForUser).toHaveBeenCalledWith(
        mockUser.id,
        dto.educations
      );
      expect(mockEmploymentHistoryRepository.syncForUser).toHaveBeenCalledWith(
        mockUser.id,
        dto.employmentHistories
      );
      expect(result.skills).toHaveLength(1);
      expect(result.educations).toHaveLength(1);
      expect(result.employmentHistories).toHaveLength(1);
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
        dateOfBirth: "1990-01-15",
        photoUrl: "/photos/jane.jpg",
        professionalSummary: "Backend engineer with 5 years experience",
        skills: [{ name: "Java", level: "Intermediate" }],
        educations: [
          {
            school: "State University",
            degree: "Master of Science",
            startDate: "2020-sep",
            endDate: "2022-jun",
            city: "Surabaya",
            description: "Specialized in distributed systems",
          },
        ],
        employmentHistories: [
          {
            jobTitle: "Developer",
            employer: "Company X",
            startDate: "2021-jan",
            endDate: "2023-dec",
            city: "Jakarta",
            description: "Development work",
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
    it("should update user successfully with skills, educations, and employment histories", async () => {
      const userId = mockUser.id;
      const educations = [
        {
          school: "Advanced Institute",
          degree: "Master of Science",
          startDate: "2022-sep",
          endDate: null,
          city: "Jakarta",
          description: "Currently pursuing master degree",
        },
      ];
      const employmentHistories = [
        {
          jobTitle: "Senior Developer",
          employer: "Tech Corp",
          startDate: "2023-jan",
          endDate: null,
          city: "Jakarta",
          description: "Senior role",
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
        dateOfBirth: "1990-01-15",
        photoUrl: "/photos/john-updated.jpg",
        skills: [{ id: "skill-1", name: "React", level: "Intermediate" }],
        educations,
        employmentHistories,
      };

      const updatedUser = {
        ...mockUser,
        wantedJobTitle: dto.wantedJobTitle,
        email: dto.email,
        address: dto.address,
        skills: [],
        educations: [],
        employmentHistories: [],
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.update).mockResolvedValue({
        ...updatedUser,
        skills: [],
        educations: [],
        employmentHistories: [],
      });
      vi.mocked(mockSkillRepository.syncUserSkills).mockResolvedValue([
        { id: "skill-1", name: "React", level: "Intermediate" },
      ]);
      vi.mocked(mockEducationRepository.syncForUser).mockResolvedValue(
        educations.map((edu, idx) => ({
          id: `education-${idx}`,
          ...edu,
          userId,
        }))
      );
      vi.mocked(mockEmploymentHistoryRepository.syncForUser).mockResolvedValue(
        employmentHistories.map((eh, idx) => ({
          id: `employment-${idx}`,
          ...eh,
          userId,
        }))
      );

      const result = await userService.update(userId, dto);

      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockSkillRepository.syncUserSkills).toHaveBeenCalledWith(userId, dto.skills);
      expect(mockEducationRepository.syncForUser).toHaveBeenCalledWith(userId, educations);
      expect(mockEmploymentHistoryRepository.syncForUser).toHaveBeenCalledWith(userId, employmentHistories);
      expect(result.skills).toHaveLength(1);
      expect(result.educations).toHaveLength(1);
      expect(result.employmentHistories).toHaveLength(1);
    });

    it("should update user without modifying skills, educations, and employment histories when undefined", async () => {
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
        dateOfBirth: "1990-01-15",
        photoUrl: "/photos/john-updated.jpg",
      };

      const updatedUser = {
        ...mockUser,
        ...dto,
        skills: mockUser.skills,
        educations: mockUser.educations,
        employmentHistories: mockUser.employmentHistories,
      };

      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.update).mockResolvedValue({
        ...updatedUser,
        skills: [],
        educations: [],
        employmentHistories: [],
      });

      const result = await userService.update(userId, dto);

      expect(mockSkillRepository.syncUserSkills).not.toHaveBeenCalled();
      expect(mockEducationRepository.syncForUser).not.toHaveBeenCalled();
      expect(mockEmploymentHistoryRepository.syncForUser).not.toHaveBeenCalled();
      expect(result.skills).toEqual(mockUser.skills);
      expect(result.educations).toEqual(mockUser.educations);
      expect(result.employmentHistories).toEqual(mockUser.employmentHistories);
    });

    it("should throw error if user not found", async () => {
      const userId = "invalid-id";
      const skillId1 = "550e8400-e29b-41d4-a716-446655440001";
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
        professionalSummary: "Experienced backend engineer",
        skills: [skillId1],
        educations: [
          {
            school: "University",
            degree: "Bachelor",
            startDate: new Date("2018-09-01"),
            endDate: new Date("2022-06-15"),
            city: "Jakarta",
            description: "Bachelor program",
          },
        ],
        employmentHistories: [
          {
            jobTitle: "Engineer",
            employer: "Company",
            startDate: new Date("2020-01-01"),
            endDate: new Date("2022-12-31"),
            city: "Jakarta",
            description: "Worked as engineer",
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
      const skillId1 = "550e8400-e29b-41d4-a716-446655440001";
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
        professionalSummary: "Senior backend engineer leading distributed teams",
        skills: [skillId1],
        educations: [
          {
            school: "State University",
            degree: "Bachelor",
            startDate: new Date("2018-09-01"),
            endDate: new Date("2022-06-15"),
            city: "Bandung",
            description: "Bachelor program",
          },
        ],
        employmentHistories: [
          {
            jobTitle: "Manager",
            employer: "Company Y",
            startDate: new Date("2021-05-01"),
            endDate: null,
            city: "Bandung",
            description: "Management role",
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
        employmentHistories: mockUser.employmentHistories,
      };

      vi.mocked(mockRepository.findById).mockResolvedValueOnce(mockUser);
      vi.mocked(mockRepository.update).mockResolvedValue({
        ...updatedUserData,
        skills: [],
        educations: [],
        employmentHistories: [],
      });

      const result = await userService.update(userId, dto);

      expect(result.skills).toEqual(mockUser.skills);
      expect(result.educations).toEqual(mockUser.educations);
      expect(result.employmentHistories).toEqual(mockUser.employmentHistories);
      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("should delete old photo when photoUrl changes", async () => {
      const userId = mockUser.id;
      const newPhotoUrl = "test-uuid-new.jpg";
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
        photoUrl: newPhotoUrl,
        professionalSummary: "Senior backend engineer",
      };

      const updatedUser = {
        ...mockUser,
        photoUrl: newPhotoUrl,
        skills: [],
        educations: [],
        employmentHistories: [],
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedUser);
      vi.mocked(mockFileStorage.delete).mockResolvedValue(undefined);

      await userService.update(userId, dto);

      expect(mockFileStorage.delete).toHaveBeenCalledWith(mockUser.photoUrl);
    });

    it("should not delete photo when photoUrl is same", async () => {
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
        photoUrl: mockUser.photoUrl,
        professionalSummary: "Senior backend engineer",
      };

      const updatedUser = {
        ...mockUser,
        skills: [],
        educations: [],
        employmentHistories: [],
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedUser);

      await userService.update(userId, dto);

      expect(mockFileStorage.delete).not.toHaveBeenCalled();
    });

    it("should not delete photo when photoUrl is undefined in dto", async () => {
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
        professionalSummary: "Senior backend engineer",
      };

      const updatedUser = {
        ...mockUser,
        skills: [],
        educations: [],
        employmentHistories: [],
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedUser);

      await userService.update(userId, dto);

      expect(mockFileStorage.delete).not.toHaveBeenCalled();
    });

    it("should not throw when file deletion fails", async () => {
      const userId = mockUser.id;
      const newPhotoUrl = "test-uuid-new.jpg";
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
        photoUrl: newPhotoUrl,
        professionalSummary: "Senior backend engineer",
      };

      const updatedUser = {
        ...mockUser,
        photoUrl: newPhotoUrl,
        skills: [],
        educations: [],
        employmentHistories: [],
      };

      vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(mockRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedUser);
      vi.mocked(mockFileStorage.delete).mockRejectedValue(new Error("File system error"));

      const result = await userService.update(userId, dto);

      expect(result).toBeDefined();
      expect(mockFileStorage.delete).toHaveBeenCalled();
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

  describe("findAll", () => {
    it("should call userRepository.findAll and return result", async () => {
      const users = [mockUser];
      vi.mocked(mockRepository.findAll).mockResolvedValue(users);

      const result = await userService.findAll();

      expect(result).toEqual(users);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it("should return empty array when no users exist", async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue([]);

      const result = await userService.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it("should propagate error from repository", async () => {
      const error = new Error("Database error");
      vi.mocked(mockRepository.findAll).mockRejectedValue(error);

      try {
        await userService.findAll();
        expect.fail("Should have thrown error");
      } catch (err) {
        expect(err).toBe(error);
      }
    });
  });
});

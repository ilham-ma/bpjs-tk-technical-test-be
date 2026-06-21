import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { User } from "../../../../../src/domain/user/entities/User";

vi.mock("../../../../../src/infrastructure/database/prisma/client", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { PrismaUserRepository } from "../../../../../src/infrastructure/modules/user/repositories/PrismaUserRepository";
import prisma from "../../../../../src/infrastructure/database/prisma/client";

describe("PrismaUserRepository", () => {
  let repository: PrismaUserRepository;

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
    repository = new PrismaUserRepository();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await repository.findById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it("should return null when user not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await repository.findById("invalid-id");

      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should return user when found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await repository.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
    });

    it("should return null when user not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await repository.findByEmail("notfound@example.com");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create user with correct payload", async () => {
      const createData = {
        wantedJobTitle: mockUser.wantedJobTitle,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        phone: mockUser.phone,
        country: mockUser.country,
        city: mockUser.city,
        address: mockUser.address,
        postalCode: mockUser.postalCode,
        drivingLicense: mockUser.drivingLicense,
        nationality: mockUser.nationality,
        placeOfBirth: mockUser.placeOfBirth,
        dateOfBirth: mockUser.dateOfBirth,
        photoUrl: mockUser.photoUrl,
      };

      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const result = await repository.create(createData);

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe("update", () => {
    it("should update user with correct payload", async () => {
      const updateData = {
        wantedJobTitle: "Senior Software Engineer",
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        phone: mockUser.phone,
        country: mockUser.country,
        city: mockUser.city,
        address: mockUser.address,
        postalCode: mockUser.postalCode,
        drivingLicense: mockUser.drivingLicense,
        nationality: mockUser.nationality,
        placeOfBirth: mockUser.placeOfBirth,
        dateOfBirth: mockUser.dateOfBirth,
        photoUrl: mockUser.photoUrl,
      };

      const updatedUser = { ...mockUser, wantedJobTitle: "Senior Software Engineer" };
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser);

      const result = await repository.update(mockUser.id, updateData);

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updateData,
      });
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileService } from "../../../../src/application/profile/services/ProfileService";
import { IFileStorageService } from "../../../../src/domain/profile/services/IFileStorageService";
import { AppError } from "../../../../src/shared/errors/AppError";

describe("ProfileService", () => {
  let profileService: ProfileService;
  let mockFileStorage: any;

  beforeEach(() => {
    mockFileStorage = {
      save: vi.fn(),
      delete: vi.fn(),
      getAbsolutePath: vi.fn(),
      exists: vi.fn(),
    } as IFileStorageService;

    profileService = new ProfileService(mockFileStorage);
  });

  describe("uploadPhoto", () => {
    it("should upload valid jpeg image and return filePath", async () => {
      const buffer = Buffer.from("fake-jpeg");
      const filename = "test-uuid.jpg";

      mockFileStorage.save.mockResolvedValue(filename);

      const result = await profileService.uploadPhoto({
        buffer,
        mimetype: "image/jpeg",
        size: 1024,
      });

      expect(result.filePath).toBe(filename);
      expect(mockFileStorage.save).toHaveBeenCalledWith(buffer, "image/jpeg");
    });

    it("should upload valid png image and return filePath", async () => {
      const buffer = Buffer.from("fake-png");
      const filename = "test-uuid.png";

      mockFileStorage.save.mockResolvedValue(filename);

      const result = await profileService.uploadPhoto({
        buffer,
        mimetype: "image/png",
        size: 1024,
      });

      expect(result.filePath).toBe(filename);
      expect(mockFileStorage.save).toHaveBeenCalledWith(buffer, "image/png");
    });

    it("should upload valid gif image and return filePath", async () => {
      const buffer = Buffer.from("fake-gif");
      const filename = "test-uuid.gif";

      mockFileStorage.save.mockResolvedValue(filename);

      const result = await profileService.uploadPhoto({
        buffer,
        mimetype: "image/gif",
        size: 1024,
      });

      expect(result.filePath).toBe(filename);
      expect(mockFileStorage.save).toHaveBeenCalledWith(buffer, "image/gif");
    });

    it("should upload valid webp image and return filePath", async () => {
      const buffer = Buffer.from("fake-webp");
      const filename = "test-uuid.webp";

      mockFileStorage.save.mockResolvedValue(filename);

      const result = await profileService.uploadPhoto({
        buffer,
        mimetype: "image/webp",
        size: 1024,
      });

      expect(result.filePath).toBe(filename);
      expect(mockFileStorage.save).toHaveBeenCalledWith(buffer, "image/webp");
    });

    it("should reject pdf mimetype with 400 error", async () => {
      const buffer = Buffer.from("fake-pdf");

      await expect(
        profileService.uploadPhoto({
          buffer,
          mimetype: "application/pdf",
          size: 1024,
        })
      ).rejects.toThrow(new AppError("file must be an image (jpeg/png/gif/webp)", 400));
    });

    it("should reject text mimetype with 400 error", async () => {
      const buffer = Buffer.from("fake-text");

      await expect(
        profileService.uploadPhoto({
          buffer,
          mimetype: "text/plain",
          size: 1024,
        })
      ).rejects.toThrow(new AppError("file must be an image (jpeg/png/gif/webp)", 400));
    });

    it("should reject file size > 2MB with 400 error", async () => {
      const buffer = Buffer.from("x".repeat(2 * 1024 * 1024 + 1));

      await expect(
        profileService.uploadPhoto({
          buffer,
          mimetype: "image/jpeg",
          size: 2 * 1024 * 1024 + 1,
        })
      ).rejects.toThrow(new AppError("file size must not exceed 2MB", 400));
    });

    it("should accept file size exactly 2MB", async () => {
      const buffer = Buffer.from("x".repeat(2 * 1024 * 1024));
      const filename = "test-uuid.jpg";

      mockFileStorage.save.mockResolvedValue(filename);

      const result = await profileService.uploadPhoto({
        buffer,
        mimetype: "image/jpeg",
        size: 2 * 1024 * 1024,
      });

      expect(result.filePath).toBe(filename);
    });
  });

  describe("getPhotoPath", () => {
    it("should return absolute path when file exists", async () => {
      const filename = "test-uuid.jpg";
      const absPath = "/upload/test-uuid.jpg";

      mockFileStorage.exists.mockResolvedValue(true);
      mockFileStorage.getAbsolutePath.mockReturnValue(absPath);

      const result = await profileService.getPhotoPath(filename);

      expect(result).toBe(absPath);
      expect(mockFileStorage.exists).toHaveBeenCalledWith(filename);
      expect(mockFileStorage.getAbsolutePath).toHaveBeenCalledWith(filename);
    });

    it("should throw 404 error when file does not exist", async () => {
      const filename = "nonexistent.jpg";

      mockFileStorage.exists.mockResolvedValue(false);

      await expect(profileService.getPhotoPath(filename)).rejects.toThrow(
        new AppError("file not found", 404)
      );
    });
  });
});

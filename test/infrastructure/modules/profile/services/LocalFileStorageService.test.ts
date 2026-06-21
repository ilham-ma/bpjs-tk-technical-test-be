import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LocalFileStorageService } from "../../../../../src/infrastructure/modules/profile/services/LocalFileStorageService";
import * as fs from "fs/promises";
import * as path from "path";
import { randomUUID } from "crypto";

vi.mock("fs/promises");
vi.mock("crypto");

describe("LocalFileStorageService", () => {
  let service: LocalFileStorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LocalFileStorageService();
  });

  describe("save", () => {
    it("should save jpeg file with correct extension", async () => {
      const buffer = Buffer.from("fake-jpeg");
      const mockUUID = "test-uuid-123";

      (randomUUID as any).mockReturnValue(mockUUID);
      (fs.writeFile as any).mockResolvedValue(undefined);

      const filename = await service.save(buffer, "image/jpeg");

      expect(filename).toBe("test-uuid-123.jpg");
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should save png file with correct extension", async () => {
      const buffer = Buffer.from("fake-png");
      const mockUUID = "test-uuid-456";

      (randomUUID as any).mockReturnValue(mockUUID);
      (fs.writeFile as any).mockResolvedValue(undefined);

      const filename = await service.save(buffer, "image/png");

      expect(filename).toBe("test-uuid-456.png");
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("should save gif file with correct extension", async () => {
      const buffer = Buffer.from("fake-gif");
      const mockUUID = "test-uuid-789";

      (randomUUID as any).mockReturnValue(mockUUID);
      (fs.writeFile as any).mockResolvedValue(undefined);

      const filename = await service.save(buffer, "image/gif");

      expect(filename).toBe("test-uuid-789.gif");
    });

    it("should save webp file with correct extension", async () => {
      const buffer = Buffer.from("fake-webp");
      const mockUUID = "test-uuid-webp";

      (randomUUID as any).mockReturnValue(mockUUID);
      (fs.writeFile as any).mockResolvedValue(undefined);

      const filename = await service.save(buffer, "image/webp");

      expect(filename).toBe("test-uuid-webp.webp");
    });
  });

  describe("delete", () => {
    it("should delete file successfully", async () => {
      (fs.unlink as any).mockResolvedValue(undefined);

      await service.delete("test-uuid.jpg");

      expect(fs.unlink).toHaveBeenCalled();
    });

    it("should not throw when file does not exist (ENOENT)", async () => {
      const error = new Error("ENOENT: no such file or directory");
      (error as any).code = "ENOENT";

      (fs.unlink as any).mockRejectedValue(error);

      await expect(service.delete("nonexistent.jpg")).resolves.not.toThrow();
    });

    it("should throw for other errors (not ENOENT)", async () => {
      const error = new Error("Permission denied");
      (error as any).code = "EACCES";

      (fs.unlink as any).mockRejectedValue(error);

      await expect(service.delete("protected.jpg")).rejects.toThrow(
        "Permission denied"
      );
    });
  });

  describe("exists", () => {
    it("should return true when file exists", async () => {
      (fs.access as any).mockResolvedValue(undefined);

      const result = await service.exists("test-uuid.jpg");

      expect(result).toBe(true);
      expect(fs.access).toHaveBeenCalled();
    });

    it("should return false when file does not exist", async () => {
      (fs.access as any).mockRejectedValue(new Error("File not found"));

      const result = await service.exists("nonexistent.jpg");

      expect(result).toBe(false);
    });
  });

  describe("getAbsolutePath", () => {
    it("should return absolute path with basename sanitization", () => {
      const filename = "test-uuid.jpg";

      const absPath = service.getAbsolutePath(filename);

      expect(absPath).toContain("upload");
      expect(absPath).toContain("test-uuid.jpg");
    });

    it("should sanitize path traversal attempts", () => {
      const absPath = service.getAbsolutePath("../../../etc/passwd");

      expect(absPath).not.toContain("..");
      expect(absPath).toContain("upload");
      expect(absPath).toContain("passwd");
    });

    it("should handle filename with forward slash (sanitize to basename)", () => {
      const absPath = service.getAbsolutePath("foo/bar/test.jpg");

      expect(absPath).not.toContain("foo/bar");
      expect(absPath).toContain("test.jpg");
    });
  });
});

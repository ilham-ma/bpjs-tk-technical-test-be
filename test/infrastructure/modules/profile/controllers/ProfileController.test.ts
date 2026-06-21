import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileController } from "../../../../../src/infrastructure/modules/profile/controllers/ProfileController";
import { ProfileService } from "../../../../../src/application/profile/services/ProfileService";
import { AppError } from "../../../../../src/shared/errors/AppError";
import { Request, Response, NextFunction } from "express";

describe("ProfileController", () => {
  let controller: ProfileController;
  let mockService: any;
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockService = {
      uploadPhoto: vi.fn(),
      getPhotoPath: vi.fn(),
    } as ProfileService;

    controller = new ProfileController(mockService);

    mockReq = {
      file: undefined,
      params: {},
      body: {},
    } as Request;

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      sendFile: vi.fn().mockReturnThis(),
    } as Response;

    mockNext = vi.fn() as NextFunction;
  });

  describe("upload", () => {
    it("should upload photo and return 200 with filePath", async () => {
      const mockFilePath = "test-uuid.jpg";
      mockReq.file = {
        buffer: Buffer.from("fake-jpeg"),
        mimetype: "image/jpeg",
        size: 1024,
      };

      mockService.uploadPhoto.mockResolvedValue({ filePath: mockFilePath });

      await controller.upload(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        data: mockFilePath,
      });
    });

    it("should throw 400 error when photo field is missing", async () => {
      mockReq.file = undefined;

      await controller.upload(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as any).mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
    });

    it("should call service with correct parameters", async () => {
      const mockFilePath = "test-uuid.png";
      const buffer = Buffer.from("fake-png");

      mockReq.file = {
        buffer,
        mimetype: "image/png",
        size: 2048,
      };

      mockService.uploadPhoto.mockResolvedValue({ filePath: mockFilePath });

      await controller.upload(mockReq, mockRes, mockNext);

      expect(mockService.uploadPhoto).toHaveBeenCalledWith({
        buffer,
        mimetype: "image/png",
        size: 2048,
      });
    });

    it("should pass service errors to next middleware", async () => {
      mockReq.file = {
        buffer: Buffer.from("fake"),
        mimetype: "application/pdf",
        size: 1024,
      };

      const serviceError = new AppError("file must be an image", 400);
      mockService.uploadPhoto.mockRejectedValue(serviceError);

      await controller.upload(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe("download", () => {
    it("should download file and call res.sendFile", async () => {
      const filename = "test-uuid.jpg";
      const absPath = "/upload/test-uuid.jpg";

      mockReq.params.filename = filename;
      mockService.getPhotoPath.mockResolvedValue(absPath);

      await controller.download(mockReq, mockRes, mockNext);

      expect(mockService.getPhotoPath).toHaveBeenCalledWith(filename);
      expect(mockRes.sendFile).toHaveBeenCalledWith(absPath);
    });

    it("should pass 404 error to next middleware when file not found", async () => {
      mockReq.params.filename = "nonexistent.jpg";

      const notFoundError = new AppError("file not found", 404);
      mockService.getPhotoPath.mockRejectedValue(notFoundError);

      await controller.download(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(notFoundError);
    });

    it("should pass unexpected errors to next middleware", async () => {
      mockReq.params.filename = "test.jpg";

      const fsError = new Error("File system error");
      mockService.getPhotoPath.mockRejectedValue(fsError);

      await controller.download(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(fsError);
    });
  });
});

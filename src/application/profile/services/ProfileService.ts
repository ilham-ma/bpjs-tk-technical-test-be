import { IFileStorageService } from "../../../domain/profile/services/IFileStorageService";
import { UploadResultDTO } from "../dtos/UploadResultDTO";
import { AppError } from "../../../shared/errors/AppError";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export class ProfileService {
  constructor(private readonly fileStorage: IFileStorageService) {}

  async uploadPhoto(file: {
    buffer: Buffer;
    mimetype: string;
    size: number;
  }): Promise<UploadResultDTO> {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new AppError(
        "file must be an image (jpeg/png/gif/webp)",
        400
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new AppError("file size must not exceed 2MB", 400);
    }

    const filename = await this.fileStorage.save(
      file.buffer,
      file.mimetype
    );

    return { filePath: filename };
  }

  async getPhotoPath(filename: string): Promise<string> {
    const exists = await this.fileStorage.exists(filename);
    if (!exists) {
      throw new AppError("file not found", 404);
    }
    return this.fileStorage.getAbsolutePath(filename);
  }
}

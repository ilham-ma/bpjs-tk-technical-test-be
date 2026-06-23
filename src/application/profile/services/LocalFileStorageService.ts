import * as path from "path";
import * as fs from "fs/promises";
import { randomUUID } from "crypto";
import { IFileStorageService } from "../../../domain/profile/services/IFileStorageService";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export class LocalFileStorageService implements IFileStorageService {
  private readonly uploadDir = path.resolve(process.cwd(), "upload");

  async save(buffer: Buffer, mimeType: string): Promise<string> {
    const ext = MIME_TO_EXT[mimeType] || "bin";
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(this.uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    return filename;
  }

  async delete(filename: string): Promise<void> {
    try {
      const filepath = path.join(this.uploadDir, path.basename(filename));
      await fs.unlink(filepath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        throw err;
      }
    }
  }

  getAbsolutePath(filename: string): string {
    return path.join(this.uploadDir, path.basename(filename));
  }

  async exists(filename: string): Promise<boolean> {
    try {
      const filepath = path.join(this.uploadDir, path.basename(filename));
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }
}

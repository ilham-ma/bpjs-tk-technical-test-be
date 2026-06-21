import { Request, Response, NextFunction } from "express";
import { ProfileService } from "../../../../application/profile/services/ProfileService";
import { AppError } from "../../../../shared/errors/AppError";

export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError("photo field is required", 400);
      }

      const result = await this.profileService.uploadPhoto({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      res.status(200).json({
        status: "success",
        data: result.filePath,
      });
    } catch (err) {
      next(err);
    }
  };

  download = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filename = req.params.filename as string;
      const absPath = await this.profileService.getPhotoPath(filename);
      res.sendFile(absPath);
    } catch (err) {
      next(err);
    }
  };
}

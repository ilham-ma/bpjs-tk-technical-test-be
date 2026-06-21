import multer from "multer";
import { AppError } from "../../../../shared/errors/AppError";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(
        new AppError("file must be an image (jpeg/png/gif/webp)", 400) as any
      );
    }
    cb(null, true);
  },
});

export const uploadSingle = upload.single("photo");

export const handleUpload = (req: any, res: any, next: any) => {
  uploadSingle(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("file size must not exceed 2MB", 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) return next(err);
    next();
  });
};

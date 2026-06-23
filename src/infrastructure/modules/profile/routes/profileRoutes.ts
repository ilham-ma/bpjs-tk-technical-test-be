import { Router } from "express";
import { ProfileController } from "../controllers/ProfileController";
import { LocalFileStorageService } from "../../../../application/profile/services/LocalFileStorageService";
import { ProfileService } from "../../../../application/profile/services/ProfileService";
import {
  filenameParamValidator,
  handleValidationError,
} from "../validators/profileValidator";
import { handleUpload } from "../middlewares/uploadMiddleware";

const router = Router();

const fileStorage = new LocalFileStorageService();
const profileService = new ProfileService(fileStorage);
const profileController = new ProfileController(profileService);

router.post("/upload", handleUpload, profileController.upload);

router.get(
  "/:filename",
  filenameParamValidator,
  handleValidationError,
  profileController.download,
);

export default router;

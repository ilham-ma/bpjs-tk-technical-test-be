import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository";
import { PrismaSkillRepository } from "../../skill/repositories/PrismaSkillRepository";
import { PrismaEducationRepository } from "../../education/repositories/PrismaEducationRepository";
import { PrismaEmploymentHistoryRepository } from "../../employment-history/repositories/PrismaEmploymentHistoryRepository";
import { LocalFileStorageService } from "../../profile/services/LocalFileStorageService";
import { UserService } from "../../../../application/user/services/UserService";
import {
  createUserValidator,
  updateUserValidator,
  idParamValidator,
  handleValidationError,
} from "../validators/userValidator";

const router = Router();

const userRepository = new PrismaUserRepository();
const skillRepository = new PrismaSkillRepository();
const educationRepository = new PrismaEducationRepository();
const employmentHistoryRepository = new PrismaEmploymentHistoryRepository();
const fileStorage = new LocalFileStorageService();
const userService = new UserService(userRepository, skillRepository, educationRepository, employmentHistoryRepository, fileStorage);
const userController = new UserController(userService);

router.post(
  "/",
  createUserValidator,
  handleValidationError,
  userController.create,
);

router.get(
  "/:id",
  idParamValidator,
  handleValidationError,
  userController.findById,
);

router.put(
  "/:id",
  idParamValidator,
  updateUserValidator,
  handleValidationError,
  userController.update,
);

export default router;

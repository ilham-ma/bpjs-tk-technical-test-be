import { Router } from "express";
import { SkillController } from "../controllers/SkillController";
import { PrismaSkillRepository } from "../repositories/PrismaSkillRepository";
import { SkillService } from "../../../../application/skill/services/SkillService";
import { createSkillValidator, handleValidationError } from "../validators/skillValidator";

const router = Router();
const skillRepository = new PrismaSkillRepository();
const skillService = new SkillService(skillRepository);
const skillController = new SkillController(skillService);

router.get("/", skillController.findAll);
router.post("/", createSkillValidator, handleValidationError, skillController.create);

export default router;

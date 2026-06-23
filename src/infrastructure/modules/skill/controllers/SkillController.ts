import { Request, Response, NextFunction } from "express";
import { SkillService } from "../../../../application/skill/services/SkillService";

export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const skill = await this.skillService.create(req.body);
      res.status(201).json({ status: "success", data: skill });
    } catch (err) {
      next(err);
    }
  };

  findAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const skills = await this.skillService.findAll();
      res.status(200).json({ status: "success", data: skills });
    } catch (err) {
      next(err);
    }
  };
}

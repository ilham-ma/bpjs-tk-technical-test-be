import { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationChain } from "express-validator";

export const createSkillValidator: ValidationChain[] = [
  body("name")
    .notEmpty().withMessage("skill name is required")
    .trim()
    .isLength({ max: 255 }).withMessage("skill name must not exceed 255 characters"),
  body("level")
    .isIn(["Basic", "Intermediate", "Expert"])
    .withMessage("skill level must be one of: Basic, Intermediate, Expert"),
];

export function handleValidationError(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errors.array().map((err: any) => ({ field: err.path, message: err.msg })),
    });
    return;
  }
  next();
}

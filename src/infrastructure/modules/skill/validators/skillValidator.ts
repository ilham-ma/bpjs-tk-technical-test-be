import { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationChain } from "express-validator";

const ALLOWED_LEVELS = ["Basic", "Intermediate", "Skillfull", "Experienced", "Expert"];
const LEVELS_MESSAGE = `skill level must be one of: ${ALLOWED_LEVELS.join(", ")}`;

export const createSkillValidator: ValidationChain[] = [
  body()
    .isArray({ min: 1 }).withMessage("request body must be a non-empty array of skills"),
  body("*.name")
    .notEmpty().withMessage("skill name is required")
    .bail()
    .trim()
    .isLength({ max: 255 }).withMessage("skill name must not exceed 255 characters"),
  body("*.level")
    .isIn(ALLOWED_LEVELS)
    .withMessage(LEVELS_MESSAGE),
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

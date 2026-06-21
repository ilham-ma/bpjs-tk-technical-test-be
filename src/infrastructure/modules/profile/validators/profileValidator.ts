import { Request, Response, NextFunction } from "express";
import { param, validationResult, ValidationChain } from "express-validator";

const filenameParamValidator: ValidationChain[] = [
  param("filename")
    .notEmpty()
    .withMessage("filename is required")
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage("invalid filename")
    .isLength({ max: 255 })
    .withMessage("filename must not exceed 255 characters")
    .custom((value: string) => {
      if (value.includes("..")) {
        throw new Error("invalid filename");
      }
      return Promise.resolve();
    }),
];

const handleValidationError = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      status: "error",
      errors: errors.array(),
    });
    return;
  }
  next();
};

export { filenameParamValidator, handleValidationError };

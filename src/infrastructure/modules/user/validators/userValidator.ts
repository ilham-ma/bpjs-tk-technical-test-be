import { Request, Response, NextFunction } from "express";
import {
  body,
  param,
  validationResult,
  ValidationChain,
} from "express-validator";

export const createUserValidator: ValidationChain[] = [
  body("wantedJobTitle")
    .notEmpty()
    .withMessage("wantedJobTitle is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("wantedJobTitle must not exceed 255 characters"),
  body("firstName")
    .notEmpty()
    .withMessage("firstName is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("firstName must not exceed 255 characters"),
  body("lastName")
    .notEmpty()
    .withMessage("lastName is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("lastName must not exceed 255 characters"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email must be a valid email address")
    .isLength({ max: 255 })
    .withMessage("email must not exceed 255 characters")
    .normalizeEmail(),
  body("phone")
    .notEmpty()
    .withMessage("phone is required")
    .isLength({ max: 14 })
    .withMessage("phone must not exceed 14 characters")
    .matches(/^\+?[0-9]+$/)
    .withMessage("phone must contain only digits and may start with +"),
  body("country")
    .notEmpty()
    .withMessage("country is required")
    .trim()
    .isLength({ max: 30 })
    .withMessage("country must not exceed 30 characters"),
  body("city")
    .notEmpty()
    .withMessage("city is required")
    .trim()
    .isLength({ max: 30 })
    .withMessage("city must not exceed 30 characters"),
  body("address")
    .notEmpty()
    .withMessage("address is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("address cannot be empty"),
  body("postalCode")
    .notEmpty()
    .withMessage("postalCode is required")
    .isLength({ max: 6 })
    .withMessage("postalCode must not exceed 6 characters")
    .matches(/^[0-9]+$/)
    .withMessage("postalCode must contain only digits"),
  body("drivingLicense")
    .notEmpty()
    .withMessage("drivingLicense is required")
    .trim()
    .isLength({ max: 20 })
    .withMessage("drivingLicense must not exceed 20 characters"),
  body("nationality")
    .notEmpty()
    .withMessage("nationality is required")
    .trim()
    .isLength({ max: 30 })
    .withMessage("nationality must not exceed 30 characters"),
  body("placeOfBirth")
    .notEmpty()
    .withMessage("placeOfBirth is required")
    .trim()
    .isLength({ max: 25 })
    .withMessage("placeOfBirth must not exceed 25 characters"),
  body("dateOfBirth")
    .notEmpty()
    .withMessage("dateOfBirth is required")
    .isISO8601({ strict: true })
    .withMessage("dateOfBirth must be a valid ISO 8601 date")
    .custom((value) => {
      const date = new Date(value);
      if (date > new Date()) {
        throw new Error("dateOfBirth must not be in the future");
      }
      return true;
    }),
  body("photoUrl")
    .notEmpty()
    .withMessage("photoUrl is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("photoUrl cannot be empty"),
];

export const updateUserValidator: ValidationChain[] = createUserValidator;

export const idParamValidator: ValidationChain[] = [
  param("id")
    .isUUID(4)
    .withMessage("id must be a valid UUID"),
];

export function handleValidationError(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errors.array().map((err: any) => ({
        field: err.path,
        message: err.msg,
      })),
    });
    return;
  }
  next();
}

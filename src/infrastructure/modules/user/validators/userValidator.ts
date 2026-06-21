import { Request, Response, NextFunction } from "express";
import {
  body,
  param,
  validationResult,
  ValidationChain,
} from "express-validator";

const skillsValidatorRequired: ValidationChain[] = [
  body("skills")
    .isArray({ min: 1 })
    .withMessage("skills must contain at least 1 item"),
  body("skills.*.name")
    .notEmpty()
    .withMessage("skills[].name is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("skills[].name must not exceed 255 characters"),
  body("skills.*.level")
    .isIn(["Basic", "Intermediate", "Expert"])
    .withMessage("skills[].level must be one of: Basic, Intermediate, Expert"),
];

const skillsValidatorOptional: ValidationChain[] = [
  body("skills")
    .optional()
    .isArray({ min: 1 })
    .withMessage("skills must contain at least 1 item"),
  body("skills.*.name")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("skills[].name is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("skills[].name must not exceed 255 characters"),
  body("skills.*.level")
    .optional({ checkFalsy: true })
    .isIn(["Basic", "Intermediate", "Expert"])
    .withMessage("skills[].level must be one of: Basic, Intermediate, Expert"),
];

const educationsValidatorRequired: ValidationChain[] = [
  body("educations")
    .isArray({ min: 1 })
    .withMessage("educations must contain at least 1 item"),
  body("educations.*.school")
    .notEmpty()
    .withMessage("educations[].school is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("educations[].school must not exceed 255 characters"),
  body("educations.*.degree")
    .notEmpty()
    .withMessage("educations[].degree is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("educations[].degree must not exceed 255 characters"),
  body("educations.*.startDate")
    .notEmpty()
    .withMessage("educations[].startDate is required")
    .isISO8601({ strict: true })
    .withMessage("educations[].startDate must be a valid ISO 8601 date")
    .custom((value) => {
      const date = new Date(value);
      if (date > new Date()) {
        throw new Error("educations[].startDate must not be in the future");
      }
      return true;
    }),
  body("educations.*.endDate")
    .optional({ checkFalsy: true })
    .isISO8601({ strict: true })
    .withMessage("educations[].endDate must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (!value) return true;
      const endDate = new Date(value);
      const startDate = new Date((req.body.educations as any[])?.[
        (req.body.educations as any[]).findIndex(e => e.endDate === value)
      ]?.startDate);
      if (endDate < startDate) {
        throw new Error("educations[].endDate must be greater than or equal to startDate");
      }
      return true;
    }),
];

const educationsValidatorOptional: ValidationChain[] = [
  body("educations")
    .optional()
    .isArray({ min: 1 })
    .withMessage("educations must contain at least 1 item"),
  body("educations.*.school")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("educations[].school is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("educations[].school must not exceed 255 characters"),
  body("educations.*.degree")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("educations[].degree is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("educations[].degree must not exceed 255 characters"),
  body("educations.*.startDate")
    .optional({ checkFalsy: true })
    .isISO8601({ strict: true })
    .withMessage("educations[].startDate must be a valid ISO 8601 date")
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      if (date > new Date()) {
        throw new Error("educations[].startDate must not be in the future");
      }
      return true;
    }),
  body("educations.*.endDate")
    .optional({ checkFalsy: true })
    .isISO8601({ strict: true })
    .withMessage("educations[].endDate must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (!value) return true;
      const endDate = new Date(value);
      const startDate = new Date((req.body.educations as any[])?.[
        (req.body.educations as any[]).findIndex(e => e.endDate === value)
      ]?.startDate);
      if (endDate < startDate) {
        throw new Error("educations[].endDate must be greater than or equal to startDate");
      }
      return true;
    }),
];

const employmentHistoriesValidatorRequired: ValidationChain[] = [
  body("employmentHistories")
    .isArray({ min: 1 })
    .withMessage("employmentHistories must contain at least 1 item"),
  body("employmentHistories.*.jobTitle")
    .notEmpty()
    .withMessage("employmentHistories[].jobTitle is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories[].jobTitle must not exceed 255 characters"),
  body("employmentHistories.*.employer")
    .notEmpty()
    .withMessage("employmentHistories[].employer is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories[].employer must not exceed 255 characters"),
  body("employmentHistories.*.startDate")
    .notEmpty()
    .withMessage("employmentHistories[].startDate is required")
    .isISO8601({ strict: true })
    .withMessage("employmentHistories[].startDate must be a valid ISO 8601 date")
    .custom((value) => {
      const date = new Date(value);
      if (date > new Date()) {
        throw new Error("employmentHistories[].startDate must not be in the future");
      }
      return true;
    }),
  body("employmentHistories.*.endDate")
    .optional({ checkFalsy: true })
    .isISO8601({ strict: true })
    .withMessage("employmentHistories[].endDate must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (!value) return true;
      const endDate = new Date(value);
      const startDate = new Date((req.body.employmentHistories as any[])?.[
        (req.body.employmentHistories as any[]).findIndex(e => e.endDate === value)
      ]?.startDate);
      if (endDate < startDate) {
        throw new Error("employmentHistories[].endDate must be greater than or equal to startDate");
      }
      return true;
    }),
  body("employmentHistories.*.city")
    .notEmpty()
    .withMessage("employmentHistories[].city is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories[].city must not exceed 255 characters"),
  body("employmentHistories.*.description")
    .notEmpty()
    .withMessage("employmentHistories[].description is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("employmentHistories[].description cannot be empty"),
];

const employmentHistoriesValidatorOptional: ValidationChain[] = [
  body("employmentHistories")
    .optional()
    .isArray({ min: 1 })
    .withMessage("employmentHistories must contain at least 1 item"),
  body("employmentHistories.*.jobTitle")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("employmentHistories[].jobTitle is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories[].jobTitle must not exceed 255 characters"),
  body("employmentHistories.*.employer")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("employmentHistories[].employer is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories[].employer must not exceed 255 characters"),
  body("employmentHistories.*.startDate")
    .optional({ checkFalsy: true })
    .isISO8601({ strict: true })
    .withMessage("employmentHistories[].startDate must be a valid ISO 8601 date")
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      if (date > new Date()) {
        throw new Error("employmentHistories[].startDate must not be in the future");
      }
      return true;
    }),
  body("employmentHistories.*.endDate")
    .optional({ checkFalsy: true })
    .isISO8601({ strict: true })
    .withMessage("employmentHistories[].endDate must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (!value) return true;
      const endDate = new Date(value);
      const startDate = new Date((req.body.employmentHistories as any[])?.[
        (req.body.employmentHistories as any[]).findIndex(e => e.endDate === value)
      ]?.startDate);
      if (endDate < startDate) {
        throw new Error("employmentHistories[].endDate must be greater than or equal to startDate");
      }
      return true;
    }),
  body("employmentHistories.*.city")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("employmentHistories[].city is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories[].city must not exceed 255 characters"),
  body("employmentHistories.*.description")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("employmentHistories[].description is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("employmentHistories[].description cannot be empty"),
];

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
  ...skillsValidatorRequired,
  ...educationsValidatorRequired,
  ...employmentHistoriesValidatorRequired,
];

export const updateUserValidator: ValidationChain[] = [
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
  ...skillsValidatorOptional,
  ...educationsValidatorOptional,
  ...employmentHistoriesValidatorOptional,
];

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

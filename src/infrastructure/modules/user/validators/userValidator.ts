import { Request, Response, NextFunction } from "express";
import {
  body,
  param,
  validationResult,
  ValidationChain,
} from "express-validator";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const MONTH_ABBR = "(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)";
const FULL_DATE_REGEX = new RegExp(`^\\d{4}-${MONTH_ABBR}-\\d{2}$`);
const MONTH_YEAR_REGEX = new RegExp(`^\\d{4}-${MONTH_ABBR}$`);

function isValidFullDateString(value: string): boolean {
  if (!FULL_DATE_REGEX.test(value)) return false;
  const normalized = value.replace(/-([a-z]{3})-/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}-`);
  return dayjs(normalized, "YYYY-MMM-DD", true).isValid();
}

function isValidMonthYearString(value: string): boolean {
  if (!MONTH_YEAR_REGEX.test(value)) return false;
  const normalized = value.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
  return dayjs(normalized, "YYYY-MMM", true).isValid();
}

const skillsValidatorRequired: ValidationChain[] = [
  body("skills")
    .isArray({ min: 1 })
    .withMessage("skills must contain at least 1 item"),
  body("skills.*")
    .custom((item) => {
      if (item.id) {
        throw new Error("skill id must not be provided when creating a new skill");
      }
      if (!item.name) {
        throw new Error("skill name is required");
      }
      if (!item.level) {
        throw new Error("skill level is required");
      }
      if (!["Basic", "Intermediate", "Expert"].includes(item.level)) {
        throw new Error("skill level must be one of: Basic, Intermediate, Expert");
      }
      if (typeof item.name !== "string" || item.name.trim().length === 0) {
        throw new Error("skill name cannot be empty");
      }
      if (item.name.length > 255) {
        throw new Error("skill name must not exceed 255 characters");
      }
      return true;
    }),
];

const skillsValidatorOptional: ValidationChain[] = [
  body("skills")
    .optional()
    .isArray({ min: 1 })
    .withMessage("skills must contain at least 1 item"),
  body("skills.*.id")
    .optional()
    .isUUID(4)
    .withMessage("skill id must be a valid UUID"),
  body("skills.*.name")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("skill name is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("skill name must not exceed 255 characters"),
  body("skills.*.level")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("skill level is required")
    .isIn(["Basic", "Intermediate", "Expert"])
    .withMessage("skill level must be one of: Basic, Intermediate, Expert"),
  body("skills.*")
    .custom((item) => {
      if (!item.id && (!item.name || !item.level)) {
        throw new Error("skill must have either id or both name and level");
      }
      return true;
    }),
];

const educationsValidatorRequired: ValidationChain[] = [
  body("educations")
    .isArray({ min: 1 })
    .withMessage("educations must contain at least 1 item"),
  body("educations.*")
    .custom((item) => {
      if (item.id) {
        throw new Error("education id must not be provided when creating a new education");
      }
      return true;
    }),
  body("educations.*.school")
    .notEmpty()
    .withMessage("educations school is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("educations school must not exceed 255 characters"),
  body("educations.*.degree")
    .notEmpty()
    .withMessage("educations degree is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("educations degree must not exceed 255 characters"),
  body("educations.*.startDate")
    .notEmpty()
    .withMessage("educations startDate is required")
    .custom((value) => {
      if (!isValidMonthYearString(value)) {
        throw new Error("educations startDate must be in format YYYY-mmm (e.g., 2026-jul)");
      }
      const normalized = value.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
      if (dayjs(normalized, "YYYY-MMM", true).isAfter(dayjs())) {
        throw new Error("educations startDate must not be in the future");
      }
      return true;
    }),
  body("educations.*.endDate")
    .optional({ nullable: true, checkFalsy: false })
    .custom((value, { req }) => {
      if (value === null || value === undefined || value === "") return true;
      if (!isValidMonthYearString(value)) {
        throw new Error("educations endDate must be in format YYYY-mmm (e.g., 2026-jul)");
      }
      const idx = (req.body.educations as any[]).findIndex((e) => e.endDate === value);
      const startRaw = (req.body.educations as any[])[idx]?.startDate;
      if (startRaw && isValidMonthYearString(startRaw)) {
        const startCap = startRaw.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
        const endCap = value.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
        if (dayjs(endCap, "YYYY-MMM", true).isBefore(dayjs(startCap, "YYYY-MMM", true))) {
          throw new Error("educations endDate must be greater than or equal to startDate");
        }
      }
      return true;
    }),
  body("educations.*.city")
    .notEmpty()
    .withMessage("educations city is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("educations city must not exceed 255 characters"),
  body("educations.*.description")
    .notEmpty()
    .withMessage("educations description is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("educations description cannot be empty"),
];

const educationsValidatorOptional: ValidationChain[] = [
  body("educations")
    .optional()
    .isArray({ min: 1 })
    .withMessage("educations must contain at least 1 item"),
  body("educations.*.id")
    .optional()
    .isUUID(4)
    .withMessage("education id must be a valid UUID"),
  body("educations.*.school")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("educations school is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("educations school must not exceed 255 characters"),
  body("educations.*.degree")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("educations degree is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("educations degree must not exceed 255 characters"),
  body("educations.*.startDate")
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      if (!isValidMonthYearString(value)) {
        throw new Error("educations startDate must be in format YYYY-mmm (e.g., 2026-jul)");
      }
      const normalized = value.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
      if (dayjs(normalized, "YYYY-MMM", true).isAfter(dayjs())) {
        throw new Error("educations startDate must not be in the future");
      }
      return true;
    }),
  body("educations.*.endDate")
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      if (!value) return true;
      if (!isValidMonthYearString(value)) {
        throw new Error("educations endDate must be in format YYYY-mmm (e.g., 2026-jul)");
      }
      const idx = (req.body.educations as any[]).findIndex((e) => e.endDate === value);
      const startRaw = (req.body.educations as any[])[idx]?.startDate;
      if (startRaw && isValidMonthYearString(startRaw)) {
        const startCap = startRaw.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
        const endCap = value.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
        if (dayjs(endCap, "YYYY-MMM", true).isBefore(dayjs(startCap, "YYYY-MMM", true))) {
          throw new Error("educations endDate must be greater than or equal to startDate");
        }
      }
      return true;
    }),
  body("educations.*.city")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("educations city is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("educations city must not exceed 255 characters"),
  body("educations.*.description")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("educations description is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("educations description cannot be empty"),
];

const employmentHistoriesValidatorRequired: ValidationChain[] = [
  body("employmentHistories")
    .isArray({ min: 1 })
    .withMessage("employmentHistories must contain at least 1 item"),
  body("employmentHistories.*")
    .custom((item) => {
      if (item.id) {
        throw new Error("employment history id must not be provided when creating a new employment history");
      }
      return true;
    }),
  body("employmentHistories.*.jobTitle")
    .notEmpty()
    .withMessage("employmentHistories jobTitle is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories jobTitle must not exceed 255 characters"),
  body("employmentHistories.*.employer")
    .notEmpty()
    .withMessage("employmentHistories employer is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories employer must not exceed 255 characters"),
  body("employmentHistories.*.startDate")
    .notEmpty()
    .withMessage("employmentHistories startDate is required")
    .custom((value) => {
      if (!isValidMonthYearString(value)) {
        throw new Error("employmentHistories startDate must be in format YYYY-mmm (e.g., 2026-jul)");
      }
      const normalized = value.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
      if (dayjs(normalized, "YYYY-MMM", true).isAfter(dayjs())) {
        throw new Error("employmentHistories startDate must not be in the future");
      }
      return true;
    }),
  body("employmentHistories.*.endDate")
    .optional({ nullable: true, checkFalsy: false })
    .custom((value, { req }) => {
      if (value === null || value === undefined || value === "") return true;
      if (!isValidMonthYearString(value)) {
        throw new Error("employmentHistories endDate must be in format YYYY-mmm (e.g., 2026-jul)");
      }
      const idx = (req.body.employmentHistories as any[]).findIndex((e) => e.endDate === value);
      const startRaw = (req.body.employmentHistories as any[])[idx]?.startDate;
      if (startRaw && isValidMonthYearString(startRaw)) {
        const startCap = startRaw.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
        const endCap = value.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
        if (dayjs(endCap, "YYYY-MMM", true).isBefore(dayjs(startCap, "YYYY-MMM", true))) {
          throw new Error("employmentHistories endDate must be greater than or equal to startDate");
        }
      }
      return true;
    }),
  body("employmentHistories.*.city")
    .notEmpty()
    .withMessage("employmentHistories city is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories city must not exceed 255 characters"),
  body("employmentHistories.*.description")
    .notEmpty()
    .withMessage("employmentHistories description is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("employmentHistories description cannot be empty"),
];

const employmentHistoriesValidatorOptional: ValidationChain[] = [
  body("employmentHistories")
    .optional()
    .isArray({ min: 1 })
    .withMessage("employmentHistories must contain at least 1 item"),
  body("employmentHistories.*.id")
    .optional()
    .isUUID(4)
    .withMessage("employment history id must be a valid UUID"),
  body("employmentHistories.*.jobTitle")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("employmentHistories jobTitle is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories jobTitle must not exceed 255 characters"),
  body("employmentHistories.*.employer")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("employmentHistories employer is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories employer must not exceed 255 characters"),
  body("employmentHistories.*.startDate")
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      if (!isValidMonthYearString(value)) {
        throw new Error("employmentHistories startDate must be in format YYYY-mmm (e.g., 2026-jul)");
      }
      const normalized = value.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
      if (dayjs(normalized, "YYYY-MMM", true).isAfter(dayjs())) {
        throw new Error("employmentHistories startDate must not be in the future");
      }
      return true;
    }),
  body("employmentHistories.*.endDate")
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      if (!value) return true;
      if (!isValidMonthYearString(value)) {
        throw new Error("employmentHistories endDate must be in format YYYY-mmm (e.g., 2026-jul)");
      }
      const idx = (req.body.employmentHistories as any[]).findIndex((e) => e.endDate === value);
      const startRaw = (req.body.employmentHistories as any[])[idx]?.startDate;
      if (startRaw && isValidMonthYearString(startRaw)) {
        const startCap = startRaw.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
        const endCap = value.replace(/-([a-z]{3})$/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
        if (dayjs(endCap, "YYYY-MMM", true).isBefore(dayjs(startCap, "YYYY-MMM", true))) {
          throw new Error("employmentHistories endDate must be greater than or equal to startDate");
        }
      }
      return true;
    }),
  body("employmentHistories.*.city")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("employmentHistories city is required")
    .trim()
    .isLength({ max: 255 })
    .withMessage("employmentHistories city must not exceed 255 characters"),
  body("employmentHistories.*.description")
    .optional({ checkFalsy: true })
    .notEmpty()
    .withMessage("employmentHistories description is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("employmentHistories description cannot be empty"),
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
    .custom((value) => {
      if (!isValidFullDateString(value)) {
        throw new Error("dateOfBirth must be in format YYYY-mmm-DD (e.g., 2026-jul-02)");
      }
      const normalized = value.replace(/-([a-z]{3})-/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}-`);
      if (dayjs(normalized, "YYYY-MMM-DD", true).isAfter(dayjs())) {
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
  body("professionalSummary")
    .notEmpty()
    .withMessage("professionalSummary is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("professionalSummary cannot be empty"),
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
    .custom((value) => {
      if (!isValidFullDateString(value)) {
        throw new Error("dateOfBirth must be in format YYYY-mmm-DD (e.g., 2026-jul-02)");
      }
      const normalized = value.replace(/-([a-z]{3})-/, (_: string, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}-`);
      if (dayjs(normalized, "YYYY-MMM-DD", true).isAfter(dayjs())) {
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
  body("professionalSummary")
    .notEmpty()
    .withMessage("professionalSummary is required")
    .trim()
    .isLength({ min: 1 })
    .withMessage("professionalSummary cannot be empty"),
  ...skillsValidatorOptional,
  ...educationsValidatorOptional,
  ...employmentHistoriesValidatorOptional,
];

export const idParamValidator: ValidationChain[] = [
  param("id").isUUID(4).withMessage("id must be a valid UUID"),
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

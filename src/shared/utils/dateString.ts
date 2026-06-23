import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const FULL_DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
export const MONTH_YEAR_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidFullDateString(value: string): boolean {
  if (!FULL_DATE_REGEX.test(value)) return false;
  return dayjs(value, "YYYY-MM-DD", true).isValid();
}

export function isValidMonthYearString(value: string): boolean {
  if (!MONTH_YEAR_REGEX.test(value)) return false;
  return dayjs(value, "YYYY-MM", true).isValid();
}

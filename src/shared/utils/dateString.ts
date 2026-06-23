import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const MONTH_ABBR = "(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)";

export const FULL_DATE_REGEX = new RegExp(`^\\d{4}-${MONTH_ABBR}-\\d{2}$`);
export const MONTH_YEAR_REGEX = new RegExp(`^\\d{4}-${MONTH_ABBR}$`);

export function isValidFullDateString(value: string): boolean {
  if (!FULL_DATE_REGEX.test(value)) return false;
  const normalized = value.replace(/-([a-z]{3})-/, (_, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}-`);
  return dayjs(normalized, "YYYY-MMM-DD", true).isValid();
}

export function isValidMonthYearString(value: string): boolean {
  if (!MONTH_YEAR_REGEX.test(value)) return false;
  const normalized = value.replace(/-([a-z]{3})$/, (_, m: string) => `-${m[0].toUpperCase()}${m.slice(1)}`);
  return dayjs(normalized, "YYYY-MMM", true).isValid();
}

/**
 * Vietnam Timezone (ICT) Utilities
 * Ensures consistent date/time handling across server and client regardless of environment TZ.
 */

export const ICT_OFFSET = 7 * 60; // Minutes

// Cache Intl.DateTimeFormat instances for performance
const FORMATTERS = {
  dateOnlyGB: new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }),
  hourOnlyUS: new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }),
  hourMinuteUS: new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }),
  timeOnlyGB: new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }),
  dateTimeGB: new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }),
};

/**
 * Returns a Date object representing the current time in Vietnam (UTC+7)
 */
export function getICTNow(): Date {
  return new Date();
}

/**
 * Returns the "YYYY-MM-DD" date part for a given date in Vietnam timezone
 */
export function getICTDate(date: Date = new Date()): Date {
  const parts = FORMATTERS.dateOnlyGB.formatToParts(date);

  const day = parts.find((p) => p.type === "day")?.value || "01";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const year = parts.find((p) => p.type === "year")?.value || "1970";

  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

/**
 * Returns "YYYY-MM-DD" for a given date in Vietnam timezone
 */
export function formatToICTDateOnly(date: Date = new Date()): string {
  const parts = FORMATTERS.dateOnlyGB.formatToParts(date);

  const day = parts.find((p) => p.type === "day")?.value || "01";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const year = parts.find((p) => p.type === "year")?.value || "1970";

  return `${year}-${month}-${day}`;
}

/**
 * Returns the hour (0-23) of a date in Vietnam timezone
 */
export function getICTHour(date: Date = new Date()): number {
  return parseInt(FORMATTERS.hourOnlyUS.format(date));
}

/**
 * Returns the fractional hour (e.g. 14.5 for 14:30) in Vietnam timezone
 */
export function getICTFractionalHour(date: Date = new Date()): number {
  const parts = FORMATTERS.hourMinuteUS.formatToParts(date);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");

  return hour + minute / 60;
}

/**
 * Parses a date string and returns a Date object set to 00:00 ICT
 */
export function parseICTDate(dateString: string): Date {
  if (!dateString) return new Date();

  // If it comes with a timestamp, truncate it locally and parse
  const [yearStr, monthStr, dayStr] = dateString.split("T")[0].split("-");

  // Create an explicit UTC midnight date so Prisma @db.Date reads the correct UTC day
  return new Date(`${yearStr}-${monthStr}-${dayStr}T00:00:00.000Z`);
}

/**
 * Explicitly formats a date object to 'HH:mm' in ICT
 */
export function formatICTTime(date: Date): string {
  if (!date) return "";
  return FORMATTERS.timeOnlyGB.format(date);
}

/**
 * Explicitly formats a date object to 'dd/MM/yyyy' in ICT
 */
export function formatICTDateToLocalString(date: Date): string {
  if (!date) return "";
  return FORMATTERS.dateOnlyGB.format(date);
}

/**
 * Explicitly formats a date object to 'dd/MM/yyyy HH:mm' in ICT
 */
export function formatICTDateTime(date: Date): string {
  if (!date) return "";

  // Custom assembly to ensure 'dd/MM/yyyy HH:mm' format exactly
  const parts = FORMATTERS.dateTimeGB.formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

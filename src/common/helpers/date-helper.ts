import { addDays } from 'date-fns';
import { format, formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';

export const timeZone = 'Asia/Shanghai';

export const fmtISO = (date: Date, tz?: string) =>
  date
    ? format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { timeZone: tz || timeZone })
    : undefined;

export const fmtBy = (date: Date, fmt: string) =>
  date ? formatInTimeZone(date, timeZone, fmt) : undefined;

export const utc = (date: string, tz?: string) =>
  date ? zonedTimeToUtc(date, tz || timeZone) : null;

export const dateWhereAnd = (date: string[], field = 'date') => {
  if (!date?.length) {
    return undefined;
  }
  if (date[0] && date[1]) {
    const date0 = utc(date[0]);
    const date1 = addDays(utc(date[1]), 1);
    return [{ [field]: { gte: date0 } }, { [field]: { lt: date1 } }];
  }
};

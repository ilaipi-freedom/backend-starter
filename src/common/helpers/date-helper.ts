import { format, formatInTimeZone } from 'date-fns-tz';

export const formatISO = (date: Date) =>
  date
    ? format(date, "yyyy-MM-dd'T'HH:mm:ssxxx", { timeZone: 'Asia/Shanghai' })
    : undefined;

export const fmtBy = (date: Date, fmt: string) =>
  date ? formatInTimeZone(date, 'Asia/Shanghai', fmt) : undefined;

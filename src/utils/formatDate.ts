import { format } from "date-fns";
import { tr } from "date-fns/locale";

export const formatDate = (
  date: string | Date,
  formatStr: string = "dd MMM yyyy"
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: tr });
};

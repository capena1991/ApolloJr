import { DateTime } from "luxon"

export const parseDate = (value: string): DateTime => {
  const iso = DateTime.fromISO(value)
  if (iso.isValid) {
    return iso
  }
  const rfc = DateTime.fromRFC2822(value)
  if (rfc.isValid) {
    return rfc
  }
  return DateTime.fromJSDate(new Date(value))
}

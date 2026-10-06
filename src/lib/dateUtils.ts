/**
 * Utility functions for consistent local date/time handling between frontend and backend.
 * The backend stores and expects LocalDateTime (without timezone/UTC conversion).
 */

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Converts a datetime-local input string ("YYYY-MM-DDTHH:mm") or a Date object
 * into a local ISO-8601 string ("YYYY-MM-DDTHH:mm:ss") without converting to UTC.
 */
export function toBackendDateTime(
  value: string | Date | undefined | null,
): string | undefined {
  if (!value) return undefined

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return undefined
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
  }

  const str = String(value).trim()
  if (!str) return undefined

  // "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DDTHH:mm:00"
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
    return `${str}:00`
  }

  // Already "YYYY-MM-DDTHH:mm:ss..."
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) {
    return str.slice(0, 19)
  }

  const d = new Date(str)
  if (isNaN(d.getTime())) return undefined
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * Formats a Date object into a local date-time string ("YYYY-MM-DDTHH:mm:ss")
 * suitable for backend query params (from, to) without UTC shift.
 */
export function formatDateToLocalIso(d: Date): string {
  if (!d || isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * Converts a backend ISO/LocalDateTime string or Date into "YYYY-MM-DDTHH:mm" for <input type="datetime-local">.
 */
export function toLocalInputDateTime(isoStr: string | Date | undefined | null): string {
  if (!isoStr) return ''

  if (typeof isoStr === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(isoStr)) {
    return isoStr.slice(0, 16)
  }

  const d = isoStr instanceof Date ? isoStr : new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * Timezone-aware date and time utility functions for Habit Tracker.
 * Ensures consistent local calendar dates (YYYY-MM-DD) without UTC timezone shift bugs.
 */

/**
 * Formats a Date object into a local 'YYYY-MM-DD' key.
 * Always uses the device's local timezone (getFullYear, getMonth, getDate).
 */
export function getLocalDateKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a 'YYYY-MM-DD' key into a local Date object set to midnight local time.
 */
export function parseLocalDateKey(key: string): Date {
  const parts = key.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return new Date();
  }
  const [y, m, d] = parts;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Returns formatted header date, e.g. "Wednesday, 23 September, 2026"
 */
export function formatHeaderDate(dateKeyOrDate: string | Date = new Date()): string {
  const dateObj = typeof dateKeyOrDate === 'string' ? parseLocalDateKey(dateKeyOrDate) : dateKeyOrDate;
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const year = dateObj.getFullYear();
  return `${weekday}, ${day} ${month}, ${year}`;
}

/**
 * Formats local time in 12-hour format, e.g. "9:25 AM"
 */
export function formatLiveTime(d: Date = new Date()): string {
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Dynamically computes greeting according to the local hour of the day
 */
export function getTimeGreeting(d: Date = new Date()): string {
  const hour = d.getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning,';
  if (hour >= 12 && hour < 17) return 'Good Afternoon,';
  if (hour >= 17 && hour < 22) return 'Good Evening,';
  return 'Good Night,';
}

/**
 * Returns the Monday of the week for a given date, with optional weekOffset.
 */
export function getMondayOfWeek(d: Date = new Date(), weekOffset = 0): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setDate(date.getDate() + mondayDiff + weekOffset * 7);
  return date;
}

/**
 * Returns the Sunday of the week for a given Monday date.
 */
export function getSundayOfWeek(monday: Date): Date {
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

/**
 * Checks if a given YYYY-MM-DD key is today in local time.
 */
export function isTodayKey(key: string): boolean {
  return key === getLocalDateKey();
}

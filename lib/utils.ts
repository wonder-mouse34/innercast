import { type ClassValue, clsx } from 'clsx';
import { formatDistanceToNowStrict, isToday, isYesterday, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Short, collision-resistant id for locally created records. */
export function createId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function relativeTime(iso: string): string {
  try {
    return `${formatDistanceToNowStrict(parseISO(iso))} ago`;
  } catch {
    return '';
  }
}

export function dayLabel(iso: string): string {
  try {
    const date = parseISO(iso);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export function timeLabel(iso: string): string {
  try {
    return parseISO(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'YU';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/**
 * `Object.entries` widens keys to `string`, which loses the literal key
 * union for closed record/enum-like types (e.g. `TraitVector`). This is the
 * single, well-scoped place that re-narrows the result back to `keyof T` -
 * safe as long as `T` is a plain object whose keys are exactly `keyof T`
 * (no extra/inherited enumerable keys), which holds for every caller here.
 */
export function typedEntries<T extends object>(record: T): [keyof T, T[keyof T]][] {
  return Object.entries(record) as [keyof T, T[keyof T]][];
}

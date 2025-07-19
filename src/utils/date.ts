import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

export function calculateDaysDiff(date: string, type: 'since' | 'until'): number {
  const targetDate = dayjs(date);
  const now = dayjs();
  
  if (type === 'since') {
    return now.diff(targetDate, 'day');
  } else {
    return targetDate.diff(now, 'day');
  }
}

export function formatDate(date: string): string {
  return dayjs(date).format('MMMM D, YYYY');
}

export function formatRelativeTime(date: string): string {
  return dayjs(date).fromNow();
}

export function isDateInFuture(date: string): boolean {
  return dayjs(date).isAfter(dayjs());
}

export function isDateValid(date: string): boolean {
  return dayjs(date).isValid();
}

export function formatDuration(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  if (days === -1) return '1 day ago';
  if (days > 0) return `${days} days`;
  return `${Math.abs(days)} days ago`;
}

export function getTodayISOString(): string {
  return dayjs().format('YYYY-MM-DD');
} 
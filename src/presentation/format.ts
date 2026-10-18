const MILLION = 1_000_000;
const THOUSAND = 1_000;

export const formatCount = (value: number | undefined): string => {
  const count = value ?? 0;
  if (count >= MILLION) return `${(count / MILLION).toFixed(1)}M`;
  if (count >= THOUSAND) return `${(count / THOUSAND).toFixed(1)}K`;
  return String(count);
};

const parse = (value: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const pad = (value: number): string => String(value).padStart(2, '0');

export const formatClock = (value: string | null): string => {
  const parsed = parse(value);
  if (!parsed) return '';
  return `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

export const formatRelative = (value: string | null): string => {
  const parsed = parse(value);
  if (!parsed) return '';

  const elapsed = Math.max(0, Date.now() - parsed.getTime());
  if (elapsed < MINUTE_MS) return 'now';
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m ago`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}h ago`;
  if (elapsed < WEEK_MS) return `${Math.floor(elapsed / DAY_MS)}d ago`;
  return `${Math.floor(elapsed / WEEK_MS)}w ago`;
};

export const formatDateInput = (value: Date): string =>
  `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

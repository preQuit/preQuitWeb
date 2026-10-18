export type SpinnerSize = 'sm' | 'md';

const SIZES: Readonly<Record<SpinnerSize, string>> = {
  sm: 'size-4 border',
  md: 'size-7 border-2',
};

export interface SpinnerProps {
  readonly size?: SpinnerSize;
  readonly label?: string;
}

export const Spinner = ({ size = 'md', label = 'Loading' }: SpinnerProps) => (
  <span
    role="status"
    aria-label={label}
    className={`inline-block animate-spin rounded-full border-white/25 border-t-white ${SIZES[size]}`}
  />
);

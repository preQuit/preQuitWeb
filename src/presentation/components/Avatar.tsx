export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Readonly<Record<AvatarSize, string>> = {
  sm: 'size-8 text-[13px]',
  md: 'size-10 text-base',
  lg: 'size-13 text-xl',
  xl: 'size-30 text-5xl',
};

export interface AvatarProps {
  readonly name: string;
  readonly url?: string | null;
  readonly size?: AvatarSize;
}

const initialOf = (name: string): string => {
  const letter = name.replace(/[^\p{L}\p{N}]/gu, '').charAt(0);
  return (letter || '?').toUpperCase();
};

export const Avatar = ({ name, url, size = 'md' }: AvatarProps) => (
  <span
    className={`glass-subtle relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-paper ${SIZES[size]}`}
  >
    {url ? (
      <img src={url} alt={name} className="size-full object-cover" loading="lazy" />
    ) : (
      initialOf(name)
    )}
  </span>
);

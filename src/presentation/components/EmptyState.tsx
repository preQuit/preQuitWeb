import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly body?: string;
}

export const EmptyState = ({ icon: Icon, title, body }: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-3 px-10 py-16 text-center">
    <Icon size={38} className="text-muted" strokeWidth={1.5} />
    <p className="text-[17px] font-semibold text-paper">{title}</p>
    {body ? <p className="max-w-sm text-sm leading-6 text-muted">{body}</p> : null}
  </div>
);

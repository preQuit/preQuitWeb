export interface TypingIndicatorProps {
  readonly name: string;
}

/**
 * Rendered in the message list, not the header, so it occupies the same slot a
 * message would and the thread scrolls to it naturally.
 */
export const TypingIndicator = ({ name }: TypingIndicatorProps) => (
  <li
    className="surface flex max-w-[78%] items-center gap-2 self-start rounded-[18px] rounded-bl-sm px-3.5 py-3"
    aria-live="polite"
    aria-label={`${name} is typing`}
  >
    <span className="flex items-center gap-1" aria-hidden>
      <span className="typing-dot size-1.5 rounded-full bg-muted" />
      <span className="typing-dot size-1.5 rounded-full bg-muted [animation-delay:0.15s]" />
      <span className="typing-dot size-1.5 rounded-full bg-muted [animation-delay:0.3s]" />
    </span>
    <span className="text-[12px] text-muted">{name} is typing…</span>
  </li>
);

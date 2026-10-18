export interface FormNoticeProps {
  readonly message: string | null;
}

export const FormNotice = ({ message }: FormNoticeProps) =>
  message ? (
    <p role="status" className="glass-subtle rounded-xl px-3.5 py-2.5 text-[13px] leading-5 text-paper">
      {message}
    </p>
  ) : null;
